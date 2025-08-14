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
    console.log('🔍 [DETAIL API] GET requisition:', params.id);
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;

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
            priority: 'asc' // ใช้ priority แทน itemIndex
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

    console.log(`✅ [DETAIL API] Retrieved requisition: ${requisition.id}`);

    return NextResponse.json({
      success: true,
      data: requisition
    });

  } catch (error) {
    console.error('❌ [DETAIL API] GET Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิก' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - อัปเดตสถานะใบเบิก
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 [DETAIL API] PUT update requisition:', params.id);
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    const body = await request.json();
    
    const updatedRequisition = await prisma.requisition.update({
      where: { 
        id: params.id,
        hospitalId: user.hospitalId
      },
      data: {
        status: body.status || undefined,
        notes: body.notes || undefined, // ใช้ notes field ที่มีจริง
        updatedAt: new Date()
      }
    });

    console.log(`✅ [DETAIL API] Updated requisition: ${updatedRequisition.id}`);

    return NextResponse.json({
      success: true,
      message: 'อัปเดตใบเบิกสำเร็จ',
      data: updatedRequisition
    });

  } catch (error) {
    console.error('❌ [DETAIL API] PUT Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตใบเบิก' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - ลบใบเบิก
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ [DETAIL API] DELETE requisition:', params.id);
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;

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

    await prisma.$transaction(async (tx) => {
      await tx.requisitionItem.deleteMany({
        where: { requisitionId: params.id }
      });

      await tx.requisition.delete({
        where: { id: params.id }
      });
    });

    console.log(`✅ [DETAIL API] Deleted requisition: ${params.id}`);

    return NextResponse.json({
      success: true,
      message: 'ลบใบเบิกสำเร็จ'
    });

  } catch (error) {
    console.error('❌ [DETAIL API] DELETE Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบใบเบิก' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}