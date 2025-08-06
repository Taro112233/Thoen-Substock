// app/api/admin/drugs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Update schema (partial of create schema)
const updateDrugSchema = z.object({
  hospitalDrugCode: z.string().min(1).max(20).optional(),
  genericName: z.string().min(1).optional(),
  brandName: z.string().optional(),
  strength: z.string().min(1).optional(),
  dosageForm: z.enum([
    'TABLET', 'CAPSULE', 'INJECTION', 'SYRUP', 'CREAM', 'OINTMENT',
    'DROPS', 'SPRAY', 'SUPPOSITORY', 'PATCH', 'POWDER', 'SOLUTION', 'OTHER'
  ]).optional(),
  unitOfMeasure: z.string().min(1).optional(),
  therapeuticClass: z.string().min(1).optional(),
  pharmacologicalClass: z.string().optional(),
  drugCategoryId: z.string().uuid().optional(),
  isControlled: z.boolean().optional(),
  controlledLevel: z.enum(['NONE', 'CATEGORY_1', 'CATEGORY_2', 'CATEGORY_3', 'CATEGORY_4', 'CATEGORY_5']).optional(),
  isDangerous: z.boolean().optional(),
  isHighAlert: z.boolean().optional(),
  isFormulary: z.boolean().optional(),
  requiresPrescription: z.boolean().optional(),
  storageCondition: z.string().optional(),
  requiresColdStorage: z.boolean().optional(),
  indications: z.string().optional(),
  contraindications: z.string().optional(),
  sideEffects: z.string().optional(),
  dosageInstructions: z.string().optional(),
  precautions: z.string().optional(),
  warnings: z.string().optional(),
  standardCost: z.number().positive().optional(),
  currentCost: z.number().positive().optional(),
  reorderPoint: z.number().int().min(0).optional(),
  maxStockLevel: z.number().int().positive().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET - ข้อมูลยาแต่ละตัว
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [DRUG API] GET individual drug:', params.id);
    
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { hospitalId } = authResult;

    // Find drug with hospital isolation
    const drug = await prisma.drug.findFirst({
      where: {
        id: params.id,
        hospitalId,
      },
      include: {
        // category: {
        //   select: {
        //     id: true,
        //     categoryName: true,
        //     categoryCode: true,
        //     description: true,
        //   }
        // },
        stockCards: {
          include: {
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
                remainingQuantity: { gt: 0 }
              },
              orderBy: {
                expiryDate: 'asc' // FEFO ordering
              },
              select: {
                id: true,
                batchNumber: true,
                expiryDate: true,
                manufactureDate: true,
                remainingQuantity: true,
                unitCost: true,
                supplierName: true,
              }
            }
          }
        },
        _count: {
          select: {
            stockTransactions: true,
            requisitionItems: true,
            stockCards: true,
          }
        }
      }
    });

    if (!drug) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลยา' },
        { status: 404 }
      );
    }

    // Calculate stock summary
    const stockSummary = {
      totalStock: drug.stockCards.reduce((sum, card) => sum + card.currentStock, 0),
      totalReserved: drug.stockCards.reduce((sum, card) => sum + card.reservedStock, 0),
      availableStock: drug.stockCards.reduce((sum, card) => sum + card.availableStock, 0),
      stockLocations: drug.stockCards.length,
      totalBatches: drug.stockCards.reduce((sum, card) => sum + card.batches.length, 0),
      nearExpiry: drug.stockCards.reduce((sum, card) => {
        const nearExpiryBatches = card.batches.filter(batch => {
          const daysUntilExpiry = Math.ceil(
            (new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysUntilExpiry <= 30; // within 30 days
        });
        return sum + nearExpiryBatches.reduce((batchSum, batch) => batchSum + batch.remainingQuantity, 0);
      }, 0),
    };

    // Check stock status
    const hasLowStock = drug.stockCards.some(card => card.currentStock <= card.reorderPoint);
    const isOutOfStock = drug.stockCards.every(card => card.currentStock === 0);

    // Get recent transactions (last 10)
    const recentTransactions = await prisma.stockTransaction.findMany({
      where: {
        drugId: drug.id,
        hospitalId,
      },
      include: {
        warehouse: {
          select: { name: true, type: true }
        },
        performer: {
          select: { firstName: true, lastName: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('✅ [DRUG API] Drug found with stock summary:', stockSummary);

    return NextResponse.json({
      drug: {
        ...drug,
        fullName: drug.brandName 
          ? `${drug.genericName} (${drug.brandName})` 
          : drug.genericName,
        strengthDisplay: `${drug.strength} ${drug.unitOfMeasure}`,
        stockSummary,
        stockStatus: {
          hasLowStock,
          isOutOfStock,
          needsReorder: hasLowStock || isOutOfStock,
        }
      },
      recentTransactions: recentTransactions.map(tx => ({
        ...tx,
        performerName: `${tx.performer.firstName} ${tx.performer.lastName}`,
      })),
    });

  } catch (error) {
    console.error('❌ [DRUG API] GET Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลยา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - อัพเดทข้อมูลยา
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [DRUG API] PUT update drug:', params.id);
    
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, hospitalId } = authResult;

    // Validate request body
    const body = await request.json();
    const validatedData = updateDrugSchema.parse(body);

    // Check if drug exists and belongs to hospital
    const existingDrug = await prisma.drug.findFirst({
      where: {
        id: params.id,
        hospitalId,
      }
    });

    if (!existingDrug) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลยา' },
        { status: 404 }
      );
    }

    // Check for duplicate hospital drug code (if being updated)
    if (validatedData.hospitalDrugCode && validatedData.hospitalDrugCode !== existingDrug.hospitalDrugCode) {
      const duplicateCode = await prisma.drug.findFirst({
        where: {
          hospitalId,
          hospitalDrugCode: validatedData.hospitalDrugCode,
          id: { not: params.id },
        }
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: `รหัสยาโรงพยาบาล "${validatedData.hospitalDrugCode}" มีอยู่แล้ว` },
          { status: 400 }
        );
      }
    }

    // Update QR Code if drug code changed
    let qrCodeData = existingDrug.qrCode;
    if (validatedData.hospitalDrugCode && validatedData.hospitalDrugCode !== existingDrug.hospitalDrugCode) {
      qrCodeData = JSON.stringify({
        hospitalId,
        drugCode: validatedData.hospitalDrugCode,
        type: 'DRUG',
        timestamp: new Date().toISOString(),
      });
    }

    // Update drug
    const updatedDrug = await prisma.drug.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        qrCode: qrCodeData,
        updatedAt: new Date(),
      },
      include: {
        // category: 'removed - not available in schema'
      }
    });

    console.log('✅ [DRUG API] Drug updated:', updatedDrug.id);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        hospitalId,
        userId: user.userId,
        action: 'UPDATE',
        resource: 'DRUG',
        resourceId: updatedDrug.id,
        details: {
          changes: validatedData,
          before: {
            hospitalDrugCode: existingDrug.hospitalDrugCode,
            genericName: existingDrug.genericName,
            dosageForm: existingDrug.dosageForm,
          }
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    return NextResponse.json({
      drug: {
        ...updatedDrug,
        fullName: updatedDrug.brandName 
          ? `${updatedDrug.genericName} (${updatedDrug.brandName})` 
          : updatedDrug.genericName,
        strengthDisplay: `${updatedDrug.strength} ${updatedDrug.unitOfMeasure}`,
      },
      message: `อัพเดทข้อมูลยา "${updatedDrug.genericName}" สำเร็จ`,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }

    console.error('❌ [DRUG API] PUT Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลยา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - ลบข้อมูลยา (Soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [DRUG API] DELETE drug:', params.id);
    
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, hospitalId } = authResult;

    // Check if drug exists and belongs to hospital
    const existingDrug = await prisma.drug.findFirst({
      where: {
        id: params.id,
        hospitalId,
      },
      include: {
        _count: {
          select: {
            stockCards: true,
            stockTransactions: true,
            requisitionItems: true,
          }
        }
      }
    });

    if (!existingDrug) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลยา' },
        { status: 404 }
      );
    }

    // Check if drug has stock or transactions
    if (existingDrug._count.stockCards > 0 || existingDrug._count.stockTransactions > 0) {
      // Soft delete only (set isActive = false)
      const updatedDrug = await prisma.drug.update({
        where: { id: params.id },
        data: {
          isActive: false,
          updatedAt: new Date(),
          discontinuedDate: new Date(),
        }
      });

      console.log('✅ [DRUG API] Drug soft deleted (has stock/transactions):', updatedDrug.id);

      // Create audit log
      await prisma.auditLog.create({
        data: {
          hospitalId,
          userId: user.userId,
          action: 'SOFT_DELETE',
          resource: 'DRUG',
          resourceId: updatedDrug.id,
          details: {
            reason: 'Drug has stock or transaction history',
            stockCards: existingDrug._count.stockCards,
            transactions: existingDrug._count.stockTransactions,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });

      return NextResponse.json({
        message: `ปิดการใช้งานยา "${existingDrug.genericName}" สำเร็จ (ไม่สามารถลบได้เนื่องจากมีประวัติการใช้งาน)`,
        type: 'soft_delete',
      });

    } else {
      // Hard delete (no stock or transactions)
      await prisma.drug.delete({
        where: { id: params.id }
      });

      console.log('✅ [DRUG API] Drug hard deleted (no stock/transactions):', params.id);

      // Create audit log
      await prisma.auditLog.create({
        data: {
          hospitalId,
          userId: user.userId,
          action: 'DELETE',
          resource: 'DRUG',
          resourceId: params.id,
          details: {
            drugData: {
              hospitalDrugCode: existingDrug.hospitalDrugCode,
              genericName: existingDrug.genericName,
              dosageForm: existingDrug.dosageForm,
            },
            reason: 'Drug has no stock or transaction history',
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });

      return NextResponse.json({
        message: `ลบข้อมูลยา "${existingDrug.genericName}" สำเร็จ`,
        type: 'hard_delete',
      });
    }

  } catch (error) {
    console.error('❌ [DRUG API] DELETE Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูลยา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}