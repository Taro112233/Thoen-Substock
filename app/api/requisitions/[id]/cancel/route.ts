// app/api/requisitions/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      // Get current requisition
      const currentReq = await tx.requisition.findUnique({
        where: { id: params.id },
        include: { items: true }
      });

      if (!currentReq) {
        throw new Error('Requisition not found');
      }

      // Only allow cancellation if status is DRAFT, SUBMITTED, or APPROVED
      if (!['DRAFT', 'SUBMITTED', 'APPROVED'].includes(currentReq.status)) {
        throw new Error('Requisition cannot be cancelled in current status');
      }

      // Update requisition status
      const requisition = await tx.requisition.update({
        where: {
          id: params.id,
          hospitalId: session.user.hospitalId
        },
        data: {
          status: 'CANCELLED',
          rejectionReason: data.reason  // เก็บ reason ใน rejectionReason field
        }
      });

      // Create workflow entry
      await tx.requisitionWorkflow.create({
        data: {
          requisitionId: params.id,
          action: 'CANCEL',
          userId: session.user.id,  // เปลี่ยนจาก performedById
          processedAt: new Date(),  // เปลี่ยนจาก performedDate
          fromStatus: currentReq.status,
          toStatus: 'CANCELLED',
          comments: data.reason || 'ใบเบิกถูกยกเลิกโดยผู้ขอเบิก'  // เปลี่ยนจาก notes
        }
      });

      // If approved, unreserve stock
      if (currentReq.status === 'APPROVED') {
        for (const item of currentReq.items) {
          await tx.stockCard.updateMany({
            where: {
              drugId: item.drugId,
              warehouseId: currentReq.fulfillmentWarehouseId  // เปลี่ยนจาก sourceWarehouseId
            },
            data: {
              reservedStock: {
                decrement: item.approvedQty || 0  // จัดการ null
              }
            }
          });
        }
      }

      // Update all items to cancelled
      await tx.requisitionItem.updateMany({
        where: { requisitionId: params.id },
        data: { status: 'CANCELLED' }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          hospitalId: session.user.hospitalId,
          userId: session.user.id,
          action: 'DELETE',  // ใช้ enum ที่มีอยู่สำหรับการยกเลิก
          entityType: 'Requisition',
          entityId: params.id,
          description: `ยกเลิกใบเบิกเลขที่ ${currentReq.requisitionNumber}`,
          oldValues: {
            requisitionNumber: currentReq.requisitionNumber,
            cancelledBy: session.user.id,
            previousStatus: currentReq.status,
            reason: data.reason
          }
        }
      });

      return requisition;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error cancelling requisition:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}