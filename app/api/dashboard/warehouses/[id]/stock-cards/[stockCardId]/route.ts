// app/api/dashboard/warehouses/[id]/stock-cards/[stockCardId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-helpers';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema สำหรับการตรวจสอบข้อมูลที่ส่งมา
const updateStockCardSchema = z.object({
  currentStock: z.number().int().min(0),
  reorderPoint: z.number().int().min(0),
  notes: z.string().optional(),
});

// PUT - อัปเดตข้อมูลสต็อกการ์ด
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; stockCardId: string } }
) {
  try {
    console.log('🔍 [STOCK CARD API] PUT update stock card:', params.stockCardId);
    
    // ตรวจสอบการพิสูจน์ตัวตน
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, hospitalId } = authResult;

    // ตรวจสอบข้อมูลที่ส่งมา
    const body = await request.json();
    const validatedData = updateStockCardSchema.parse(body);

    // ตรวจสอบว่า warehouse และ stock card มีอยู่จริงและเป็นของโรงพยาบาลเดียวกัน
    const stockCard = await prisma.stockCard.findFirst({
      where: {
        id: params.stockCardId,
        warehouseId: params.id,
        hospitalId,
      },
      include: {
        drug: {
          select: {
            hospitalDrugCode: true,
            name: true,
            unit: true,
            dosageForm: true,
            strength: true,
          }
        },
        warehouse: {
          select: {
            name: true,
            type: true,
          }
        }
      }
    });

    if (!stockCard) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลสต็อกการ์ด' },
        { status: 404 }
      );
    }

    // บันทึกค่าเดิมสำหรับ audit log
    const oldValues = {
      currentStock: stockCard.currentStock,
      reorderPoint: stockCard.reorderPoint,
      availableStock: stockCard.availableStock,
      totalValue: stockCard.totalValue,
    };

    // คำนวณค่าใหม่
    const newAvailableStock = validatedData.currentStock - stockCard.reservedStock;
    const newTotalValue = validatedData.currentStock * Number(stockCard.averageCost);
    const newLowStockAlert = validatedData.currentStock <= validatedData.reorderPoint;

    // อัปเดตข้อมูลสต็อกการ์ด
    const updatedStockCard = await prisma.stockCard.update({
      where: { id: params.stockCardId },
      data: {
        currentStock: validatedData.currentStock,
        reorderPoint: validatedData.reorderPoint,
        availableStock: newAvailableStock,
        totalValue: newTotalValue,
        lowStockAlert: newLowStockAlert,
        notes: validatedData.notes,
        updatedAt: new Date(),
      },
      include: {
        drug: {
          select: {
            hospitalDrugCode: true,
            name: true,
            unit: true,
            dosageForm: true,
            strength: true,
            genericName: true,
            brandName: true,
          }
        }
      }
    });

    // สร้าง Stock Transaction สำหรับการ Adjust (หากมีการเปลี่ยนแปลง currentStock)
    if (oldValues.currentStock !== validatedData.currentStock) {
      const difference = validatedData.currentStock - oldValues.currentStock;
      const transactionType = difference > 0 ? 'ADJUST_INCREASE' : 'ADJUST_DECREASE';
      
      await prisma.stockTransaction.create({
        data: {
          hospitalId,
          stockCardId: params.stockCardId,
          drugId: stockCard.drugId,
          warehouseId: params.id,
          transactionType,
          quantity: Math.abs(difference),
          unitCost: Number(stockCard.averageCost),
          totalCost: Math.abs(difference) * Number(stockCard.averageCost),
          balanceBefore: oldValues.currentStock,
          balanceAfter: validatedData.currentStock,
          performerId: user.userId,
          referenceType: 'MANUAL_ADJUSTMENT',
          referenceId: `ADJ-${Date.now()}`,
          notes: validatedData.notes || `Manual adjustment: ${difference > 0 ? '+' : ''}${difference} ${stockCard.drug.unit}`,
          createdAt: new Date(),
        }
      });

      console.log(`✅ [STOCK CARD API] Created transaction for adjustment: ${difference} ${stockCard.drug.unit}`);
    }

    // บันทึก Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          hospitalId,
          userId: user.userId,
          action: 'UPDATE',
          entityType: 'STOCK_CARD',
          entityId: params.stockCardId,
          description: `Updated stock card: ${stockCard.drug.name} in ${stockCard.warehouse.name}`,
          oldValues: {
            currentStock: oldValues.currentStock,
            reorderPoint: oldValues.reorderPoint,
            totalValue: Number(oldValues.totalValue),
          },
          newValues: {
            currentStock: validatedData.currentStock,
            reorderPoint: validatedData.reorderPoint,
            totalValue: Number(newTotalValue),
            stockDifference: validatedData.currentStock - oldValues.currentStock,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
    } catch (auditError) {
      console.log('Audit log skipped:', (auditError as Error).message);
    }

    console.log('✅ [STOCK CARD API] Stock card updated successfully:', updatedStockCard.id);

    return NextResponse.json({
      message: 'อัปเดตข้อมูลสต็อกการ์ดสำเร็จ',
      stockCard: {
        id: updatedStockCard.id,
        currentStock: updatedStockCard.currentStock,
        reorderPoint: updatedStockCard.reorderPoint,
        availableStock: updatedStockCard.availableStock,
        totalValue: Number(updatedStockCard.totalValue),
        lowStockAlert: updatedStockCard.lowStockAlert,
        lastUpdated: updatedStockCard.updatedAt.toISOString(),
        drug: updatedStockCard.drug,
      },
      changes: {
        stockDifference: validatedData.currentStock - oldValues.currentStock,
        reorderPointChange: validatedData.reorderPoint - oldValues.reorderPoint,
        valueChange: Number(newTotalValue) - Number(oldValues.totalValue),
      }
    });

  } catch (error) {
    console.error('❌ [STOCK CARD API] PUT Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลสต็อกการ์ด' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET - ดึงข้อมูลสต็อกการ์ดเฉพาะ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; stockCardId: string } }
) {
  try {
    console.log('🔍 [STOCK CARD API] GET stock card:', params.stockCardId);
    
    // ตรวจสอบการพิสูจน์ตัวตน
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { hospitalId } = authResult;

    // ดึงข้อมูลสต็อกการ์ดพร้อมข้อมูลที่เกี่ยวข้อง
    const stockCard = await prisma.stockCard.findFirst({
      where: {
        id: params.stockCardId,
        warehouseId: params.id,
        hospitalId,
      },
      include: {
        drug: {
          select: {
            id: true,
            hospitalDrugCode: true,
            name: true,
            genericName: true,
            brandName: true,
            strength: true,
            dosageForm: true,
            unit: true,
            category: true,
            subcategory: true,
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            type: true,
            location: true,
          }
        },
        batches: {
          where: {
            currentQty: { gt: 0 },
            status: 'ACTIVE'
          },
          orderBy: {
            expiryDate: 'asc' // FEFO ordering
          },
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
            manufacturingDate: true,
            currentQty: true,
            reservedQty: true,
            availableQty: true,
            status: true,
          }
        },
        stockTransactions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10, // รายการล่าสุด 10 รายการ
          include: {
            performer: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              }
            }
          }
        }
      }
    });

    if (!stockCard) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลสต็อกการ์ด' },
        { status: 404 }
      );
    }

    // คำนวณสถิติเพิ่มเติม
    const statistics = {
      totalBatches: stockCard.batches.length,
      nearExpiryBatches: stockCard.batches.filter(batch => {
        const daysUntilExpiry = Math.ceil(
          (new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 30; // ใกล้หมดอายุใน 30 วัน
      }).length,
      averageCostPerUnit: Number(stockCard.averageCost),
      stockTurnover: stockCard.monthlyUsage > 0 ? stockCard.currentStock / stockCard.monthlyUsage : 0,
      daysOfStock: stockCard.monthlyUsage > 0 ? Math.floor((stockCard.currentStock / stockCard.monthlyUsage) * 30) : 999,
    };

    console.log('✅ [STOCK CARD API] Stock card found:', stockCard.id);

    return NextResponse.json({
      stockCard: {
        id: stockCard.id,
        cardNumber: stockCard.cardNumber,
        currentStock: stockCard.currentStock,
        reservedStock: stockCard.reservedStock,
        availableStock: stockCard.availableStock,
        reorderPoint: stockCard.reorderPoint,
        reorderQty: stockCard.reorderQty,
        maxStock: stockCard.maxStock,
        minStock: stockCard.minStock,
        averageCost: Number(stockCard.averageCost),
        lastCost: Number(stockCard.lastCost),
        totalValue: Number(stockCard.totalValue),
        lastIssueDate: stockCard.lastIssueDate?.toISOString(),
        lastReceiveDate: stockCard.lastReceiveDate?.toISOString(),
        monthlyUsage: stockCard.monthlyUsage,
        isActive: stockCard.isActive,
        isControlled: stockCard.isControlled,
        isNarcotic: stockCard.isNarcotic,
        lowStockAlert: stockCard.lowStockAlert,
        expiryAlert: stockCard.expiryAlert,
        overStockAlert: stockCard.overStockAlert,
        notes: stockCard.notes,
        createdAt: stockCard.createdAt.toISOString(),
        updatedAt: stockCard.updatedAt.toISOString(),
        drug: stockCard.drug,
        warehouse: stockCard.warehouse,
        batches: stockCard.batches.map(batch => ({
          ...batch,
          expiryDate: batch.expiryDate.toISOString(),
          manufacturingDate: batch.manufacturingDate?.toISOString(),
          daysUntilExpiry: Math.ceil(
            (new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
        recentTransactions: stockCard.stockTransactions.map(tx => ({
          id: tx.id,
          transactionType: tx.transactionType,
          quantity: tx.quantity,
          unitCost: Number(tx.unitCost),
          totalCost: Number(tx.totalCost),
          balanceBefore: tx.balanceBefore,
          balanceAfter: tx.balanceAfter,
          referenceType: tx.referenceType,
          referenceId: tx.referenceId,
          notes: tx.notes,
          createdAt: tx.createdAt.toISOString(),
          performer: tx.performer ? {
            name: `${tx.performer.firstName} ${tx.performer.lastName}`,
            role: tx.performer.role
          } : null,
        })),
        statistics,
      }
    });

  } catch (error) {
    console.error('❌ [STOCK CARD API] GET Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสต็อกการ์ด' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}