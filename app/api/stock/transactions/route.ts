// app/api/stock/transactions/route.ts
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const transaction = await prisma.stockTransaction.create({
      data: {
        hospitalId: session.user.hospitalId,
        warehouseId: data.warehouseId,
        drugId: data.drugId,
        stockCardId: data.stockCardId,  // เพิ่ม required field
        transactionType: data.type,
        quantity: data.quantity,
        batchId: data.batchId,
        stockBefore: data.balanceBefore || 0,
        stockAfter: data.balanceAfter || 0,
        unitCost: data.unitCost || 0,
        totalCost: data.totalCost || 0,
        performedBy: session.user.id,  // เปลี่ยนจาก userId
        referenceDocument: data.referenceDocument,
        referenceId: data.referenceId,
        notes: data.notes
      }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating stock transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}