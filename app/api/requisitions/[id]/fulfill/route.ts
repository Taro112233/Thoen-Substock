// app/api/requisitions/[id]/fulfill/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateUserAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Fulfillment schema
const fulfillmentSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    dispensedQuantity: z.number().min(0),
    notes: z.string().optional()
  })).min(1),
  comments: z.string().optional(),
  isPartialFulfillment: z.boolean().default(false)
});

// POST - จ่ายยาตามใบเบิก
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('💊 [FULFILL API] Processing fulfillment for:', params.id);
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    const body = await request.json();
    
    const validationResult = fulfillmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { items, comments, isPartialFulfillment } = validationResult.data;

    // ตรวจสอบใบเบิก
    const requisition = await prisma.requisition.findFirst({
      where: {
        id: params.id,
        hospitalId: user.hospitalId
      },
      include: {
        items: {
          include: {
            drug: { select: { id: true, name: true, hospitalDrugCode: true } },
            stockCard: true
          }
        }
      }
    });

    if (!requisition) {
      return NextResponse.json({ error: 'ไม่พบใบเบิกที่ระบุ' }, { status: 404 });
    }

    if (!['APPROVED', 'PARTIALLY_FILLED'].includes(requisition.status)) {
      return NextResponse.json(
        { error: 'ไม่สามารถจ่ายยาสำหรับใบเบิกในสถานะนี้ได้' },
        { status: 400 }
      );
    }

    // ดำเนินการจ่ายยา
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      let totalDispensedValue = 0;

      // จ่ายยาแต่ละรายการ
      for (const item of items) {
        const requisitionItem = requisition.items.find(ri => ri.id === item.itemId);
        if (!requisitionItem || item.dispensedQuantity === 0) continue;

        // อัปเดตจำนวนที่จ่าย - ใช้ field ที่ถูกต้อง
        await tx.requisitionItem.update({
          where: { id: item.itemId },
          data: {
            fulfilledQuantity: { // ใช้ field ที่มีจริง
              increment: item.dispensedQuantity
            },
            status: 'FULFILLED',
            fulfilledAt: now,
            fulfillmentNotes: item.notes
          }
        });

        // อัปเดต stock card
        if (requisitionItem.stockCard) {
          await tx.stockCard.update({
            where: { id: requisitionItem.stockCard.id },
            data: {
              currentStock: {
                decrement: item.dispensedQuantity
              }
            }
          });

          // คำนวณมูลค่า
          const itemValue = Number(requisitionItem.stockCard.averageCost || 0) * item.dispensedQuantity;
          totalDispensedValue += itemValue;

          // บันทึก stock transaction - ใช้ field ที่ถูกต้อง
          await tx.stockTransaction.create({
            data: {
              hospitalId: user.hospitalId,
              warehouseId: requisition.fulfillmentWarehouseId,
              drugId: requisitionItem.drugId,
              stockCardId: requisitionItem.stockCard.id,
              transactionType: 'DISPENSE',
              quantity: -item.dispensedQuantity,
              unitCost: requisitionItem.stockCard.averageCost || 0,
              totalCost: itemValue,
              stockBefore: requisitionItem.stockCard.currentStock,
              stockAfter: requisitionItem.stockCard.currentStock - item.dispensedQuantity,
              referenceDocument: requisition.requisitionNumber,
              referenceId: requisition.id,
              notes: `จ่ายยาตามใบเบิก ${requisition.requisitionNumber}`,
              performer: user.userId, // ใช้ performer แทน performerId
              transactionDate: now
            }
          });
        }
      }

      // ตรวจสอบสถานะการจ่าย - ใช้ field ที่ถูกต้อง
      const updatedItems = await tx.requisitionItem.findMany({
        where: { requisitionId: params.id }
      });

      const isFullyFulfilled = updatedItems.every(item => 
        (item.fulfilledQuantity || 0) >= (item.approvedQuantity || 0)
      );

      const newStatus = isFullyFulfilled ? 'COMPLETED' : 'PARTIALLY_FILLED';

      // อัปเดตสถานะใบเบิก - ใช้เฉพาะ field ที่มีจริง
      const updatedRequisition = await tx.requisition.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          fulfillerId: user.userId,
          fulfilledDate: isFullyFulfilled ? now : null,
          fulfillerSignedAt: now,
          fulfillmentNotes: comments,
          totalDispensedValue: {
            increment: totalDispensedValue
          }
        }
      });

      // บันทึก workflow - ลบ actionType ที่ไม่มี
      await tx.requisitionWorkflow.create({
        data: {
          requisitionId: params.id,
          fromStatus: requisition.status,
          toStatus: newStatus,
          userId: user.userId,
          comments: comments || (isFullyFulfilled ? 'จ่ายยาครบถ้วน' : 'จ่ายยาบางส่วน'),
          processedAt: now
        }
      });

      return { 
        action: isFullyFulfilled ? 'completed' : 'partially_fulfilled', 
        requisition: updatedRequisition,
        dispensedValue: totalDispensedValue 
      };
    });

    console.log(`✅ [FULFILL API] ${result.action}: ${params.id}`);

    return NextResponse.json({
      success: true,
      message: result.action === 'completed' 
        ? 'จ่ายยาครบถ้วนแล้ว ใบเบิกเสร็จสิ้น'
        : 'จ่ายยาบางส่วนแล้ว',
      action: result.action,
      totalDispensedValue: result.dispensedValue
    });

  } catch (error) {
    console.error('❌ [FULFILL API] Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการจ่ายยา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}