// app/api/requisitions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateUserAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

// GET - ดึงข้อมูลใบเบิกตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 [REQUISITION DETAIL API] GET requisition:', params.id);
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;

    // ดึงข้อมูลใบเบิก
    const requisition = await prisma.requisition.findFirst({
      where: {
        id: params.id,
        hospitalId: user.hospitalId
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
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
                dosageForm: true,
                strength: true,
                unit: true
              }
            }
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });

    if (!requisition) {
      return NextResponse.json(
        { error: 'ไม่พบใบเบิกที่ระบุ' },
        { status: 404 }
      );
    }

    console.log(`✅ [REQUISITION DETAIL API] Retrieved requisition: ${requisition.id}`);

    return NextResponse.json({
      success: true,
      data: requisition
    });

  } catch (error) {
    console.error('❌ [REQUISITION DETAIL API] GET Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิก' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - อัปเดตสถานะใบเบิก (แบบง่าย)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 [REQUISITION DETAIL API] PUT update requisition:', params.id);
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    const body = await request.json();
    
    // อัปเดตสถานะหรือข้อมูลพื้นฐาน
    const updatedRequisition = await prisma.requisition.update({
      where: { 
        id: params.id,
        hospitalId: user.hospitalId
      },
      data: {
        status: body.status || undefined,
        notes: body.notes || undefined,
        updatedAt: new Date()
      }
    });

    console.log(`✅ [REQUISITION DETAIL API] Updated requisition: ${updatedRequisition.id}`);

    return NextResponse.json({
      success: true,
      message: 'อัปเดตใบเบิกสำเร็จ',
      data: updatedRequisition
    });

  } catch (error) {
    console.error('❌ [REQUISITION DETAIL API] PUT Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตใบเบิก' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - ลบใบเบิก (แบบง่าย)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ [REQUISITION DETAIL API] DELETE requisition:', params.id);
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;

    // ตรวจสอบใบเบิกที่มีอยู่
    const existingRequisition = await prisma.requisition.findFirst({
      where: {
        id: params.id,
        hospitalId: user.hospitalId
      }
    });

    if (!existingRequisition) {
      return NextResponse.json(
        { error: 'ไม่พบใบเบิกที่ระบุ' },
        { status: 404 }
      );
    }

    // ลบใบเบิกและรายการทั้งหมด
    await prisma.$transaction(async (tx) => {
      // ลบรายการยาก่อน
      await tx.requisitionItem.deleteMany({
        where: { requisitionId: params.id }
      });

      // ลบใบเบิก
      await tx.requisition.delete({
        where: { id: params.id }
      });
    });

    console.log(`✅ [REQUISITION DETAIL API] Deleted requisition: ${params.id}`);

    return NextResponse.json({
      success: true,
      message: 'ลบใบเบิกสำเร็จ'
    });

  } catch (error) {
    console.error('❌ [REQUISITION DETAIL API] DELETE Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบใบเบิก' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}