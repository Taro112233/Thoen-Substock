// app/api/requisitions/[id]/approve/route.ts
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

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current requisition
      const currentReq = await tx.requisition.findUnique({
        where: { id: params.id },
        include: { items: true }
      });

      if (!currentReq) {
        throw new Error('Requisition not found');
      }

      if (currentReq.status !== 'SUBMITTED') {
        throw new Error('Requisition cannot be approved in current status');
      }

      // Update requisition status
      const requisition = await tx.requisition.update({
        where: {
          id: params.id,
          hospitalId: session.user.hospitalId
        },
        data: {
          status: 'APPROVED',
          approverId: session.user.id,
          approvedDate: new Date(),
        }
      });

      // Create workflow entry
      await tx.requisitionWorkflow.create({
        data: {
          requisitionId: params.id,
          action: 'APPROVE',
          userId: session.user.id,  // เปลี่ยนจาก performedById
          processedAt: new Date(),  // เปลี่ยนจาก performedDate
          fromStatus: 'SUBMITTED',
          toStatus: 'APPROVED',
          comments: data.notes || 'ใบเบิกได้รับการอนุมัติ'  // เปลี่ยนจาก notes
        }
      });

      // Reserve stock for approved items
      for (const item of currentReq.items) {
        // Update stock card - reserve quantity
        await tx.stockCard.updateMany({
          where: {
            drugId: item.drugId,
            warehouseId: currentReq.fulfillmentWarehouseId  // เปลี่ยนจาก sourceWarehouseId
          },
          data: {
            reservedStock: {
              increment: item.approvedQty || 0  // จัดการ null
            }
          }
        });

        // Update item status
        await tx.requisitionItem.update({
          where: { id: item.id },
          data: { status: 'APPROVED' }
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          hospitalId: session.user.hospitalId,
          userId: session.user.id,
          action: 'APPROVE',  // ใช้ enum ที่มีอยู่
          entityType: 'Requisition',
          entityId: params.id,
          description: `อนุมัติใบเบิกเลขที่ ${currentReq.requisitionNumber}`,
          newValues: {
            requisitionNumber: currentReq.requisitionNumber,
            approvedBy: session.user.id,
            totalItems: currentReq.items.length
          }
        }
      });

      return requisition;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error approving requisition:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}