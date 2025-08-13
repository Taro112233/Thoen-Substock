// app/api/requisitions/[id]/reject/route.ts
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

    if (!data.rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get current requisition
      const currentReq = await tx.requisition.findUnique({
        where: { id: params.id }
      });

      if (!currentReq) {
        throw new Error('Requisition not found');
      }

      if (currentReq.status !== 'SUBMITTED') {
        throw new Error('Requisition cannot be rejected in current status');
      }

      // Update requisition status
      const requisition = await tx.requisition.update({
        where: {
          id: params.id,
          hospitalId: session.user.hospitalId
        },
        data: {
          status: 'REJECTED',
          rejectionReason: data.rejectionReason,
          // Remove non-existent fields
        }
      });

      // Create workflow entry
      await tx.requisitionWorkflow.create({
        data: {
          requisitionId: params.id,
          action: 'REJECT',
          userId: session.user.id,  // เปลี่ยนจาก performedById
          processedAt: new Date(),  // เปลี่ยนจาก performedDate
          fromStatus: 'SUBMITTED',
          toStatus: 'REJECTED',
          comments: data.rejectionReason  // เปลี่ยนจาก notes
        }
      });

      // Update all items to rejected
      await tx.requisitionItem.updateMany({
        where: { requisitionId: params.id },
        data: { status: 'REJECTED' }
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          hospitalId: session.user.hospitalId,
          userId: session.user.id,
          action: 'REJECT',  // ใช้ enum ที่มีอยู่
          entityType: 'Requisition',
          entityId: params.id,
          description: `ปฏิเสธใบเบิกเลขที่ ${currentReq.requisitionNumber}`,
          newValues: {
            requisitionNumber: currentReq.requisitionNumber,
            rejectedBy: session.user.id,
            reason: data.rejectionReason
          }
        }
      });

      return requisition;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error rejecting requisition:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}