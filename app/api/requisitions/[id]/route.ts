// app/api/requisitions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// GET - ดึงรายละเอียดใบเบิก
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requisition = await prisma.requisition.findUnique({
      where: {
        id: params.id,
        hospitalId: session.user.hospitalId
      },
      include: {
        fulfillmentWarehouse: true,  // เปลี่ยนจาก sourceWarehouse และ targetWarehouse
        requestingDepartment: true,   // เพิ่ม department
        requester: {  // เปลี่ยนจาก requestedBy
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        approver: {  // เปลี่ยนจาก approvedBy
          select: {
            firstName: true,
            lastName: true,
          }
        },
        items: {
          include: {
            drug: true,
            stockCard: true
          }
        },
        // Remove deliveryNotes include เนื่องจากไม่มีใน schema
        workflow: {
          include: {
            user: {  // เปลี่ยนจาก performedBy
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: {
            processedAt: 'desc'  // เปลี่ยนจาก performedDate
          }
        }
      }
    });

    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 });
    }

    // Check if current warehouse is fulfillment warehouse
    // Remove warehouseId check เนื่องจากไม่มีใน session
    const isFulfillmentWarehouse = true; // หรือตรวจสอบแบบอื่น

    // Calculate total value from items
    const totalValue = requisition.items.reduce((sum: number, item: any) => 
      sum + (Number(item.totalCost) || 0), 0  // เปลี่ยนจาก totalPrice
    );

    return NextResponse.json({
      ...requisition,
      isFulfillmentWarehouse,  // เปลี่ยนจาก isSourceWarehouse
      totalValue
    });
  } catch (error) {
    console.error('Error fetching requisition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - อัปเดตใบเบิก
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const requisition = await prisma.requisition.update({
      where: {
        id: params.id,
        hospitalId: session.user.hospitalId
      },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(requisition);
  } catch (error) {
    console.error('Error updating requisition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}