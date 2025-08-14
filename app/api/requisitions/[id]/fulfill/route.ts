// app/api/requisitions/[id]/fulfill/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Fulfillment schema
const fulfillmentSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    dispensedQuantity: z.number().min(0, 'จำนวนจ่ายต้องไม่น้อยกว่า 0'),
    batchId: z.string().optional(),
    lotNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    dispenserNotes: z.string().optional()
  })).min(1, 'ต้องมีรายการที่จ่ายอย่างน้อย 1 รายการ'),
  fulfillerComments: z.string().optional(),
  isPartialFulfillment: z.boolean().default(false)
});

// POST - จ่ายยาตามใบเบิก
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('💊 [REQUISITION FULFILLMENT API] Processing fulfillment for:', params.id);
    
    // Validate authentication
    const authResult = await validateAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const body = await request.json();
    
    // Validate input
    const validationResult = fulfillmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { items, fulfillerComments, isPartialFulfillment } = validationResult.data;

    // ตรวจสอบสิทธิ์การจ่ายยา
    if (!['PHARMACY_MANAGER', 'SENIOR_PHARMACIST', 'STAFF_PHARMACIST'].includes(user.role)) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ในการจ่ายยา' },
        { status: 403 }
      );
    }

    // ตรวจสอบใบเบิกที่มีอยู่
    const existingRequisition = await prisma.requisition.findFirst({
      where: {
        id: params.id,
        hospitalId: user.hospitalId
      },
      include: {
        items: {
          include: {
            drug: {
              select: {
                id: true,
                name: true,
                hospitalDrugCode: true,
                unit: true,
                isControlled: true,
                isDangerous: true,
                unitCost: true
              }
            }
          }
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        requestingDepartment: {
          select: {
            id: true,
            name: true
          }
        },
        fulfillmentWarehouse: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    if (!existingRequisition) {
      return NextResponse.json(
        { error: 'ไม่พบใบเบิกที่ระบุ' },
        { status: 404 }
      );
    }

    // ตรวจสอบสถานะที่สามารถจ่ายได้
    if (!['APPROVED', 'PARTIALLY_FILLED'].includes(existingRequisition.status)) {
      return NextResponse.json(
        { error: 'ไม่สามารถจ่ายยาสำหรับใบเบิกในสถานะนี้ได้' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า items ที่ส่งมาตรงกับในใบเบิกหรือไม่
    const existingItemIds = existingRequisition.items.map(item => item.id);
    const requestedItemIds = items.map(item => item.itemId);
    
    const invalidItems = requestedItemIds.filter(id => !existingItemIds.includes(id));
    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: 'พบรายการยาที่ไม่ถูกต้องในใบเบิก' },
        { status: 400 }
      );
    }

    // ตรวจสอบจำนวนที่จ่ายไม่เกินจำนวนที่อนุมัติ
    let quantityValidationErrors: string[] = [];
    for (const fulfillmentItem of items) {
      const requisitionItem = existingRequisition.items.find(item => item.id === fulfillmentItem.itemId);
      if (!requisitionItem) continue;

      const remainingToDispense = requisitionItem.approvedQuantity - requisitionItem.dispensedQuantity;
      if (fulfillmentItem.dispensedQuantity > remainingToDispense) {
        quantityValidationErrors.push(
          `${requisitionItem.drug.name}: จำนวนจ่ายเกินที่อนุมัติ (คงเหลือที่จ่ายได้: ${remainingToDispense}, ระบุจ่าย: ${fulfillmentItem.dispensedQuantity})`
        );
      }
    }

    if (quantityValidationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'จำนวนที่จ่ายไม่ถูกต้อง',
          details: quantityValidationErrors
        },
        { status: 400 }
      );
    }

    // ตรวจสอบ stock ในคลัง
    let stockValidationErrors: string[] = [];
    for (const fulfillmentItem of items) {
      const requisitionItem = existingRequisition.items.find(item => item.id === fulfillmentItem.itemId);
      if (!requisitionItem || fulfillmentItem.dispensedQuantity === 0) continue;

      const stockCard = await prisma.stockCard.findFirst({
        where: {
          drugId: requisitionItem.drugId,
          warehouseId: existingRequisition.fulfillmentWarehouseId,
          hospitalId: user.hospitalId
        }
      });

      if (!stockCard || stockCard.currentStock < fulfillmentItem.dispensedQuantity) {
        stockValidationErrors.push(
          `${requisitionItem.drug.name}: สต็อกไม่เพียงพอ (คงเหลือ: ${stockCard?.currentStock || 0}, จ่าย: ${fulfillmentItem.dispensedQuantity})`
        );
      }
    }

    if (stockValidationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'สต็อกไม่เพียงพอสำหรับการจ่ายยา',
          details: stockValidationErrors
        },
        { status: 400 }
      );
    }

    // ดำเนินการจ่ายยา
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      let totalDispensedValue = 0;

      // จ่ายยาแต่ละรายการ
      for (const fulfillmentItem of items) {
        const requisitionItem = existingRequisition.items.find(item => item.id === fulfillmentItem.itemId);
        if (!requisitionItem || fulfillmentItem.dispensedQuantity === 0) continue;

        // อัปเดตจำนวนที่จ่ายใน requisition item
        await tx.requisitionItem.update({
          where: { id: fulfillmentItem.itemId },
          data: {
            dispensedQuantity: {
              increment: fulfillmentItem.dispensedQuantity
            },
            dispensedAt: now,
            dispenserNotes: fulfillmentItem.dispenserNotes,
            batchId: fulfillmentItem.batchId
          }
        });

        // อัปเดต stock card
        const stockCard = await tx.stockCard.findFirst({
          where: {
            drugId: requisitionItem.drugId,
            warehouseId: existingRequisition.fulfillmentWarehouseId
          }
        });

        if (stockCard) {
          await tx.stockCard.update({
            where: { id: stockCard.id },
            data: {
              currentStock: {
                decrement: fulfillmentItem.dispensedQuantity
              },
              reservedStock: {
                decrement: Math.min(fulfillmentItem.dispensedQuantity, stockCard.reservedStock)
              },
              lastUpdated: now
            }
          });

          // คำนวณมูลค่า
          const itemValue = stockCard.averageCost * fulfillmentItem.dispensedQuantity;
          totalDispensedValue += itemValue;

          // บันทึก stock transaction
          await tx.stockTransaction.create({
            data: {
              hospitalId: user.hospitalId,
              warehouseId: existingRequisition.fulfillmentWarehouseId,
              drugId: requisitionItem.drugId,
              stockCardId: stockCard.id,
              transactionType: 'DISPENSE',
              quantity: -fulfillmentItem.dispensedQuantity, // ลบออก
              unitCost: stockCard.averageCost,
              totalCost: itemValue,
              stockBefore: stockCard.currentStock + fulfillmentItem.dispensedQuantity,
              stockAfter: stockCard.currentStock,
              referenceDocument: existingRequisition.requisitionNumber,
              referenceId: existingRequisition.id,
              notes: `จ่ายยาตามใบเบิก: ${existingRequisition.requisitionNumber} ให้ ${existingRequisition.requestingDepartment.name}`,
              performedBy: user.userId,
              performedAt: now,
              toWarehouseId: existingRequisition.requestingDepartmentId // ถ้ามี department warehouse
            }
          });

          // ปลดล็อค reserved stock ส่วนที่จ่ายแล้ว
          await tx.stockTransaction.create({
            data: {
              hospitalId: user.hospitalId,
              warehouseId: existingRequisition.fulfillmentWarehouseId,
              drugId: requisitionItem.drugId,
              stockCardId: stockCard.id,
              transactionType: 'UNRESERVE',
              quantity: fulfillmentItem.dispensedQuantity,
              unitCost: stockCard.averageCost,
              totalCost: 0,
              stockBefore: stockCard.currentStock,
              stockAfter: stockCard.currentStock,
              referenceDocument: existingRequisition.requisitionNumber,
              referenceId: existingRequisition.id,
              notes: `ปลดล็อคยาที่จ่ายแล้วสำหรับใบเบิก: ${existingRequisition.requisitionNumber}`,
              performedBy: user.userId,
              performedAt: now
            }
          });

          // ถ้าเป็นยาควบคุม บันทึกเพิ่มเติม
          if (requisitionItem.drug.isControlled) {
            // TODO: บันทึกใน controlled substance log
          }
        }
      }

      // ตรวจสอบว่าจ่ายครบหรือไม่
      const updatedItems = await tx.requisitionItem.findMany({
        where: { requisitionId: params.id }
      });

      const isFullyFulfilled = updatedItems.every(item => 
        item.dispensedQuantity >= item.approvedQuantity
      );

      const hasAnyDispensed = updatedItems.some(item => 
        item.dispensedQuantity > 0
      );

      // กำหนดสถานะใหม่
      let newStatus = existingRequisition.status;
      if (isFullyFulfilled) {
        newStatus = 'COMPLETED';
      } else if (hasAnyDispensed || isPartialFulfillment) {
        newStatus = 'PARTIALLY_FILLED';
      }

      // อัปเดตสถานะใบเบิก
      const updatedRequisition = await tx.requisition.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          fulfillerId: user.userId,
          fulfilledDate: isFullyFulfilled ? now : null,
          fulfillerComments,
          fulfillerSignedAt: now,
          totalDispensedValue: {
            increment: totalDispensedValue
          }
        }
      });

      // บันทึก workflow log
      await tx.requisitionWorkflow.create({
        data: {
          requisitionId: params.id,
          fromStatus: existingRequisition.status,
          toStatus: newStatus,
          actionBy: user.userId,
          actionAt: now,
          comments: fulfillerComments,
          actionType: isFullyFulfilled ? 'COMPLETE' : 'PARTIAL_FULFILL'
        }
      });

      return { 
        action: isFullyFulfilled ? 'completed' : 'partially_fulfilled', 
        requisition: updatedRequisition,
        dispensedValue: totalDispensedValue 
      };
    });

    // สร้างการแจ้งเตือน
    try {
      // TODO: Implement notification system
      // await sendNotification({
      //   type: result.action === 'completed' ? 'REQUISITION_COMPLETED' : 'REQUISITION_PARTIALLY_FULFILLED',
      //   recipientId: existingRequisition.requesterId,
      //   title: result.action === 'completed' ? 'จ่ายยาครบถ้วนแล้ว' : 'จ่ายยาบางส่วนแล้ว',
      //   message: `ใบเบิก ${existingRequisition.requisitionNumber} ${result.action === 'completed' ? 'จ่ายครบถ้วน' : 'จ่ายบางส่วน'}แล้ว`,
      //   data: { requisitionId: params.id }
      // });
    } catch (notificationError) {
      console.log('Notification error:', notificationError);
    }

    console.log(`✅ [REQUISITION FULFILLMENT API] ${result.action}: ${params.id}`);

    // ดึงข้อมูลใบเบิกที่อัปเดตแล้ว
    const updatedRequisition = await prisma.requisition.findUnique({
      where: { id: params.id },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true
          }
        },
        fulfiller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true
          }
        },
        requestingDepartment: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        fulfillmentWarehouse: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        items: {
          include: {
            drug: {
              select: {
                id: true,
                hospitalDrugCode: true,
                name: true,
                genericName: true,
                dosageForm: true,
                strength: true,
                unit: true,
                isControlled: true,
                isDangerous: true,
                isHighAlert: true
              }
            },
            dispensedBatch: {
              select: {
                id: true,
                batchNumber: true,
                expiryDate: true,
                manufacturerName: true
              }
            }
          },
          orderBy: {
            lineNumber: 'asc'
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: result.action === 'completed' 
        ? 'จ่ายยาครบถ้วนแล้ว ใบเบิกเสร็จสิ้น'
        : 'จ่ายยาบางส่วนแล้ว สามารถจ่ายส่วนที่เหลือได้ภายหลัง',
      data: updatedRequisition,
      action: result.action,
      totalDispensedValue: result.dispensedValue
    });

  } catch (error) {
    console.error('❌ [REQUISITION FULFILLMENT API] Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการจ่ายยา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}