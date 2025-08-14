// app/api/requisitions/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateUserAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Approval action schema
const approvalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  comments: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    approvedQuantity: z.number().min(0),
    notes: z.string().optional()
  })).optional()
});

// POST - อนุมัติหรือปฏิเสธใบเบิก
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('✅ [APPROVAL API] Processing approval for:', params.id);
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    const body = await request.json();
    
    const validationResult = approvalSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { action, comments, items } = validationResult.data;

    // ตรวจสอบใบเบิก
    const requisition = await prisma.requisition.findFirst({
      where: {
        id: params.id,
        hospitalId: user.hospitalId
      },
      include: {
        items: {
          include: {
            drug: { select: { id: true, name: true, hospitalDrugCode: true } }
          }
        }
      }
    });

    if (!requisition) {
      return NextResponse.json({ error: 'ไม่พบใบเบิกที่ระบุ' }, { status: 404 });
    }

    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(requisition.status)) {
      return NextResponse.json(
        { error: 'ไม่สามารถอนุมัติใบเบิกในสถานะนี้ได้' },
        { status: 400 }
      );
    }

    // ดำเนินการอนุมัติหรือปฏิเสธ
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      
      if (action === 'approve') {
        // อัปเดตสถานะใบเบิก - ใช้ field ที่มีจริง
        const updatedRequisition = await tx.requisition.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
            approverId: user.userId,
            approvedDate: now,
            approverSignedAt: now,
            approvalNotes: comments
          }
        });

        // อัปเดตรายการยา - ใช้ field ที่ถูกต้อง
        if (items) {
          for (const item of items) {
            await tx.requisitionItem.update({
              where: { id: item.itemId },
              data: {
                approvedQuantity: item.approvedQuantity,
                status: 'APPROVED',
                approvedAt: now,
                fulfillmentNotes: item.notes  // ใช้ fulfillmentNotes แทน approvalNotes
              }
            });
          }
        }

        // บันทึก workflow
        await tx.requisitionWorkflow.create({
          data: {
            requisitionId: params.id,
            fromStatus: requisition.status,
            toStatus: 'APPROVED',
            userId: user.userId,
            comments: comments || 'อนุมัติใบเบิก',
            processedAt: now
          }
        });

        return { action: 'approved', requisition: updatedRequisition };

      } else {
        // ปฏิเสธใบเบิก
        const updatedRequisition = await tx.requisition.update({
          where: { id: params.id },
          data: {
            status: 'REJECTED',
            approverId: user.userId,
            approvedDate: now,
            rejectionReason: comments
          }
        });

        // บันทึก workflow
        await tx.requisitionWorkflow.create({
          data: {
            requisitionId: params.id,
            fromStatus: requisition.status,
            toStatus: 'REJECTED',
            userId: user.userId,
            comments: comments || 'ปฏิเสธใบเบิก',
            processedAt: now
          }
        });

        return { action: 'rejected', requisition: updatedRequisition };
      }
    });

    console.log(`✅ [APPROVAL API] ${action}: ${params.id}`);

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'อนุมัติใบเบิกสำเร็จ' : 'ปฏิเสธใบเบิกสำเร็จ',
      action: result.action
    });

  } catch (error) {
    console.error('❌ [APPROVAL API] Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดำเนินการ' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}