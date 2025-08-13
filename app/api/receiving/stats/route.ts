// app/api/receiving/stats/route.ts
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
    const warehouseId = searchParams.get('warehouseId');

    if (!warehouseId) {
      return NextResponse.json({ error: 'Missing warehouseId' }, { status: 400 });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Count pending items for today
    const pendingToday = await prisma.requisitionItem.count({
      where: {
        requisition: {
          hospitalId: session.user.hospitalId,
          fulfillmentWarehouseId: warehouseId,  // เปลี่ยนจาก targetWarehouseId
          status: {
            in: ['APPROVED', 'PARTIALLY_FILLED']
          },
          requiredDate: {  // เปลี่ยนจาก expectedDeliveryDate
            gte: startOfDay,
            lt: endOfDay
          }
        },
        fulfilledQty: {  // เปลี่ยนจาก receivedQty
          lt: prisma.requisitionItem.fields.approvedQty
        }
      }
    });

    // Count overdue items
    const overdue = await prisma.requisitionItem.count({
      where: {
        requisition: {
          hospitalId: session.user.hospitalId,
          fulfillmentWarehouseId: warehouseId,  // เปลี่ยนจาก targetWarehouseId
          status: {
            in: ['APPROVED', 'PARTIALLY_FILLED']
          },
          requiredDate: {  // เปลี่ยนจาก expectedDeliveryDate
            lt: startOfDay
          }
        },
        fulfilledQty: {  // เปลี่ยนจาก receivedQty
          lt: prisma.requisitionItem.fields.approvedQty
        }
      }
    });

    // Count items received today
    const receivedToday = await prisma.stockTransaction.count({
      where: {
        warehouseId: warehouseId,
        hospitalId: session.user.hospitalId,
        transactionType: 'RECEIVE',
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    return NextResponse.json({
      pendingToday,
      overdue,
      receivedToday
    });

  } catch (error) {
    console.error('Error loading receiving stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}