// app/api/admin/drugs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Update schema (partial of create schema)
const updateDrugSchema = z.object({
  hospitalDrugCode: z.string().min(1).max(20).optional(),
  name: z.string().min(1).optional(),
  genericName: z.string().min(1).optional(),
  brandName: z.string().optional(),
  strength: z.string().min(1).optional(),
  dosageForm: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  therapeuticClass: z.string().min(1).optional(),
  pharmacologicalClass: z.string().optional(),
  isControlled: z.boolean().optional(),
  isDangerous: z.boolean().optional(),
  isHighAlert: z.boolean().optional(),
  isFormulary: z.boolean().optional(),
  requiresPrescription: z.boolean().optional(),
  storageCondition: z.string().optional(),
  requiresColdChain: z.boolean().optional(),
  indications: z.string().optional(),
  contraindications: z.string().optional(),
  sideEffects: z.string().optional(),
  dosageInstructions: z.string().optional(),
  precautions: z.string().optional(),
  warnings: z.string().optional(),
  unitCost: z.number().positive().optional(),
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
                currentQty: { gt: 0 }
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
                stockCard: {
                  select: {
                    averageCost: true,
                  }
                }
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
      totalStock: drug.stockCards.reduce((sum: number, card: any) => sum + card.currentStock, 0),
      reservedStock: drug.stockCards.reduce((sum: number, card: any) => sum + card.reservedStock, 0),
      availableStock: drug.stockCards.reduce((sum: number, card: any) => sum + card.availableStock, 0),
      stockLocations: drug.stockCards.length,
      totalBatches: drug.stockCards.reduce((sum: number, card: any) => sum + card.batches.length, 0),
      nearExpiry: drug.stockCards.reduce((sum: number, card: any) => {
        const nearExpiryBatches = card.batches.filter((batch: any) => {
          const daysUntilExpiry = Math.ceil(
            (new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysUntilExpiry <= 30; // within 30 days
        });
        return sum + nearExpiryBatches.reduce((batchSum: number, batch: any) => batchSum + batch.currentQty, 0);
      }, 0),
    };

    // Check stock status
    const hasLowStock = drug.stockCards.some((card: any) => card.currentStock <= (card.reorderPoint || 0));
    const isOutOfStock = drug.stockCards.every((card: any) => card.currentStock === 0);

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
          : drug.genericName || drug.name,
        strengthDisplay: `${drug.strength} ${drug.unit}`,
        stockSummary,
        stockStatus: {
          hasLowStock,
          isOutOfStock,
          needsReorder: hasLowStock || isOutOfStock,
        }
      },
      recentTransactions: recentTransactions.map((tx: any) => ({
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
    });

    console.log('✅ [DRUG API] Drug updated:', updatedDrug.id);

    // Skip audit log creation if table doesn't exist
    try {
      await prisma.auditLog.create({
        data: {
          hospitalId,
          userId: user.userId,
          action: 'UPDATE',
          entityType: 'DRUG',
          entityId: updatedDrug.id,
          description: `Updated drug: ${updatedDrug.name}`,
          newValues: validatedData,
          oldValues: {
            hospitalDrugCode: existingDrug.hospitalDrugCode,
            name: existingDrug.name,
            dosageForm: existingDrug.dosageForm,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
    } catch (auditError) {
      console.log('Audit log skipped:', (auditError as Error).message);
    }

    return NextResponse.json({
      drug: {
        ...updatedDrug,
        fullName: updatedDrug.brandName 
          ? `${updatedDrug.genericName} (${updatedDrug.brandName})` 
          : updatedDrug.genericName || updatedDrug.name,
        strengthDisplay: `${updatedDrug.strength} ${updatedDrug.unit}`,
      },
      message: `อัพเดทข้อมูลยา "${updatedDrug.name}" สำเร็จ`,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง',
          details: error.issues.map((err: any) => ({
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

      // Skip audit log creation if table doesn't exist
      try {
        await prisma.auditLog.create({
          data: {
            hospitalId,
            userId: user.userId,
            action: 'UPDATE',
            entityType: 'DRUG',
            entityId: updatedDrug.id,
            description: `Soft deleted drug: ${existingDrug.name}`,
            newValues: {
              reason: 'Drug has stock or transaction history',
              stockCards: existingDrug._count.stockCards,
              transactions: existingDrug._count.stockTransactions,
            },
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          }
        });
      } catch (auditError) {
        console.log('Audit log skipped:', (auditError as Error).message);
      }

      return NextResponse.json({
        message: `ปิดการใช้งานยา "${existingDrug.name}" สำเร็จ (ไม่สามารถลบได้เนื่องจากมีประวัติการใช้งาน)`,
        type: 'soft_delete',
      });

    } else {
      // Hard delete (no stock or transactions)
      await prisma.drug.delete({
        where: { id: params.id }
      });

      console.log('✅ [DRUG API] Drug hard deleted (no stock/transactions):', params.id);

      // Skip audit log creation if table doesn't exist
      try {
        await prisma.auditLog.create({
          data: {
            hospitalId,
            userId: user.userId,
            action: 'DELETE',
            entityType: 'DRUG',
            entityId: params.id,
            description: `Hard deleted drug: ${existingDrug.name}`,
            oldValues: {
              hospitalDrugCode: existingDrug.hospitalDrugCode,
              name: existingDrug.name,
              dosageForm: existingDrug.dosageForm,
            },
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          }
        });
      } catch (auditError) {
        console.log('Audit log skipped:', (auditError as Error).message);
      }

      return NextResponse.json({
        message: `ลบข้อมูลยา "${existingDrug.name}" สำเร็จ`,
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