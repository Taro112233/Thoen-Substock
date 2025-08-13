// app/api/receiving/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const warehouseId = searchParams.get('warehouseId');

    if (!query || !warehouseId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Search for pending requisition items that match the query
    const receivingItems = await prisma.requisitionItem.findMany({
      where: {
        requisition: {
          hospitalId: session.user.hospitalId,
          fulfillmentWarehouseId: warehouseId,  // เปลี่ยนจาก targetWarehouseId
          status: {
            in: ['APPROVED', 'PARTIALLY_FILLED']
          }
        },
        OR: [
          {
            drug: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            drug: {
              hospitalDrugCode: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            requisition: {
              requisitionNumber: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        ],
        // Only items that still have pending quantity
        fulfilledQty: {  // เปลี่ยนจาก receivedQty
          lt: prisma.requisitionItem.fields.approvedQty
        }
      },
      include: {
        drug: {
          select: {
            hospitalDrugCode: true,
            name: true,
            unit: true
          }
        },
        requisition: {
          select: {
            id: true,
            requisitionNumber: true,
            priority: true,
            requiredDate: true,  // เปลี่ยนจาก expectedDeliveryDate
            requestNotes: true,  // เปลี่ยนจาก notes
            requester: {  // เปลี่ยนจาก requestedBy
              select: {
                firstName: true,
                lastName: true
              }
            },
            fulfillmentWarehouse: {  // เปลี่ยนจาก sourceWarehouse
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { requisition: { priority: 'desc' } },
        { requisition: { requiredDate: 'asc' } }  // เปลี่ยน field name
      ],
      take: 20
    });

    // Transform data for frontend
    const searchResults = receivingItems.map(item => ({
      id: item.id,
      drugCode: item.drug.hospitalDrugCode,
      drugName: item.drug.name,
      unit: item.drug.unit,
      pendingQuantity: (item.approvedQty || 0) - item.fulfilledQty,  // แก้ไขการคำนวณ
      receivedQuantity: item.fulfilledQty,  // mapping field
      requisitionId: item.requisition.id,
      requisitionNumber: item.requisition.requisitionNumber,
      sourceWarehouse: item.requisition?.fulfillmentWarehouse?.name || 'Unknown',
      requestedBy: `${item.requisition?.requester?.firstName || ''} ${item.requisition?.requester?.lastName || ''}`.trim(),
      priority: item.requisition?.priority,
      dueDate: item.requisition?.requiredDate,  // เปลี่ยน field name
      notes: item.requisition?.requestNotes  // เปลี่ยนเป็น requestNotes
    }));

    return NextResponse.json(searchResults);

  } catch (error) {
    console.error('Error searching receiving items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}