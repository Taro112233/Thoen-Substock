// app/api/requisitions/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateUserAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Approval action schema
const approvalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  approverComments: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    approvedQuantity: z.number().min(0, 'จำนวนอนุมัติต้องไม่น้อยกว่า 0'),
    approverNotes: z.string().optional()
  })).optional()
});

// POST - อนุมัติหรือปฏิเสธใบเบิก
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('✅ [REQUISITION APPROVAL API] Processing approval for:', params.id);
    
    // Validate authentication
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    const body = await request.json();
    
    // Validate input
    const validationResult = approvalSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { action, approverComments, items } = validationResult.data;

    // ตรวจสอบสิทธิ์การอนุมัติ - ลบการจำกัดสิทธิ์
    // if (!['PHARMACY_MANAGER', 'SENIOR_PHARMACIST'].includes(user.role)) {
    //   return NextResponse.json(
    //     { error: 'ไม่มีสิทธิ์ในการอนุมัติใบเบิก' },
    //     { status: 403 }
    //   );
    // }

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
                unit: true
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
        }
      }
    });

    if (!existingRequisition) {
      return NextResponse.json(
        { error: 'ไม่พบใบเบิกที่ระบุ' },
        { status: 404 }
      );
    }

    // ตรวจสอบสถานะที่สามารถอนุมัติได้
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(existingRequisition.status)) {
      return NextResponse.json(
        { error: 'ไม่สามารถอนุมัติใบเบิกในสถานะนี้ได้' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าผู้อนุมัติไม่ใช่ผู้เบิกเอง - ลบการจำกัด
    // if (existingRequisition.requesterId === user.userId) {
    //   return NextResponse.json(
    //     { error: 'ไม่สามารถอนุมัติใบเบิกของตนเองได้' },
    //     { status: 400 }
    //   );
    // }

    // สำหรับการอนุมัติ ต้องมีข้อมูล items
    if (action === 'approve' && (!items || items.length === 0)) {
      return NextResponse.json(
        { error: 'กรุณาระบุจำนวนอนุมัติสำหรับแต่ละรายการ' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า items ที่ส่งมาตรงกับในใบเบิกหรือไม่
    if (action === 'approve' && items) {
      const existingItemIds = existingRequisition.items.map(item => item.id);
      const requestedItemIds = items.map(item => item.itemId);
      
      const invalidItems = requestedItemIds.filter(id => !existingItemIds.includes(id));
      if (invalidItems.length > 0) {
        return NextResponse.json(
          { error: 'พบรายการยาที่ไม่ถูกต้องในใบเบิก' },
          { status: 400 }
        );
      }
    }

    // ตรวจสอบ stock สำหรับการอนุมัติ
    let stockValidationErrors: string[] = [];
    if (action === 'approve' && items) {
      for (const approvalItem of items) {
        const requisitionItem = existingRequisition.items.find(item => item.id === approvalItem.itemId);
        if (!requisitionItem) continue;

        // ตรวจสอบ stock ในคลังที่จ่าย
        const stockCard = await prisma.stockCard.findFirst({
          where: {
            drugId: requisitionItem.drugId,
            warehouseId: existingRequisition.fulfillmentWarehouseId,
            hospitalId: user.hospitalId
          }
        });

        if (!stockCard || stockCard.currentStock < approvalItem.approvedQuantity) {
          stockValidationErrors.push(
            `${requisitionItem.drug.name}: สต็อกไม่เพียงพอ (คงเหลือ: ${stockCard?.currentStock || 0}, อนุมัติ: ${approvalItem.approvedQuantity})`
          );
        }
      }

      if (stockValidationErrors.length > 0) {
        return NextResponse.json(
          { 
            error: 'สต็อกไม่เพียงพอสำหรับการอนุมัติ',
            details: stockValidationErrors
          },
          { status: 400 }
        );
      }
    }

    // ดำเนินการอนุมัติหรือปฏิเสธ
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      
      if (action === 'approve') {
        // อัปเดตสถานะใบเบิก
        const updatedRequisition = await tx.requisition.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
            approverId: user.userId,
            approvedDate: now,
            notes: approverComments, // ใช้ notes แทน approverComments
            approverSignedAt: now
          }
        });

        // อัปเดตจำนวนอนุมัติในแต่ละรายการ
        if (items) {
          for (const approvalItem of items) {
            await tx.requisitionItem.update({
              where: { id: approvalItem.itemId },
              data: {
                approvedQty: approvalItem.approvedQuantity, // ใช้ approvedQty แทน approvedQuantity
                approverNotes: approvalItem.approverNotes,
                approvedAt: now
              }
            });

            // จองยาใน stock (Reserve)
            const requisitionItem = existingRequisition.items.find(item => item.id === approvalItem.itemId);
            if (requisitionItem && approvalItem.approvedQuantity > 0) {
              // อัปเดต stock card
              await tx.stockCard.update({
                where: {
                  hospitalId_drugId_warehouseId: {
                    hospitalId: user.hospitalId,
                    drugId: requisitionItem.drugId,
                    warehouseId: existingRequisition.fulfillmentWarehouseId
                  }
                },
                data: {
                  reservedStock: {
                    increment: approvalItem.approvedQuantity
                  },
                  updatedAt: now // ใช้ updatedAt แทน lastUpdated
                }
              });

              // บันทึก transaction
              const stockCard = await tx.stockCard.findFirst({
                where: {
                  drugId: requisitionItem.drugId,
                  warehouseId: existingRequisition.fulfillmentWarehouseId
                }
              });

              if (stockCard) {
                await tx.stockTransaction.create({
                  data: {
                    hospitalId: user.hospitalId,
                    warehouseId: existingRequisition.fulfillmentWarehouseId,
                    drugId: requisitionItem.drugId,
                    stockCardId: stockCard.id,
                    transactionType: 'RESERVE',
                    quantity: approvalItem.approvedQuantity,
                    unitCost: stockCard.averageCost,
                    totalCost: (stockCard.averageCost as any) * approvalItem.approvedQuantity,
                    stockBefore: stockCard.currentStock,
                    stockAfter: stockCard.currentStock, // Reserved ไม่เปลี่ยนแปลง currentStock
                    referenceDocument: updatedRequisition.requisitionNumber,
                    referenceId: updatedRequisition.id,
                    notes: `จองยาสำหรับใบเบิก: ${updatedRequisition.requisitionNumber}`,
                    performer: user.userId, // ใช้ performer แทน performedBy
                    transactionDate: now // ใช้ transactionDate แทน performedAt
                  }
                });
              }
            }
          }
        }

        // บันทึก workflow log
        await tx.requisitionWorkflow.create({
          data: {
            requisitionId: params.id,
            fromStatus: existingRequisition.status,
            toStatus: 'APPROVED',
            action: user.userId, // ใช้ action แทน actionBy
            actionAt: now,
            comments: approverComments,
            actionType: 'APPROVE'
          }
        });

        return { action: 'approved', requisition: updatedRequisition };

      } else { // reject
        // อัปเดตสถานะใบเบิก
        const updatedRequisition = await tx.requisition.update({
          where: { id: params.id },
          data: {
            status: 'REJECTED',
            approverId: user.userId,
            approvedDate: now,
            notes: approverComments, // ใช้ notes แทน approverComments
            rejectionReason: approverComments
          }
        });

        // บันทึก workflow log
        await tx.requisitionWorkflow.create({
          data: {
            requisitionId: params.id,
            fromStatus: existingRequisition.status,
            toStatus: 'REJECTED',
            action: user.userId, // ใช้ action แทน actionBy
            actionAt: now,
            comments: approverComments,
            actionType: 'REJECT'
          }
        });

        return { action: 'rejected', requisition: updatedRequisition };
      }
    });

    // สร้างการแจ้งเตือน (Notification) - สามารถทำแยกต่างหากได้
    try {
      // TODO: Implement notification system
      // await sendNotification({
      //   type: action === 'approve' ? 'REQUISITION_APPROVED' : 'REQUISITION_REJECTED',
      //   recipientId: existingRequisition.requesterId,
      //   title: action === 'approve' ? 'ใบเบิกได้รับการอนุมัติ' : 'ใบเบิกถูกปฏิเสธ',
      //   message: `ใบเบิก ${existingRequisition.requisitionNumber} ${action === 'approve' ? 'ได้รับการอนุมัติ' : 'ถูกปฏิเสธ'}`,
      //   data: { requisitionId: params.id }
      // });
    } catch (notificationError) {
      console.log('Notification error:', notificationError);
      // ไม่ให้ notification error ทำให้การอนุมัติล้มเหลว
    }

    console.log(`✅ [REQUISITION APPROVAL API] ${action}: ${params.id}`);

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
                unit: true
              }
            }
          },
          orderBy: {
            orderIndex: 'asc' // ใช้ orderIndex แทน lineNumber
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: action === 'approve' 
        ? 'อนุมัติใบเบิกสำเร็จ ยาได้ถูกจองไว้แล้ว รอการจ่าย'
        : 'ปฏิเสธใบเบิกสำเร็จ',
      data: updatedRequisition,
      action: result.action
    });

  } catch (error) {
    console.error('❌ [REQUISITION APPROVAL API] Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดำเนินการ' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}