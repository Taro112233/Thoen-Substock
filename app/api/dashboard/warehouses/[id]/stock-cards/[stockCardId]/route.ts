// app/api/dashboard/warehouses/[id]/stock-cards/[stockCardId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; stockCardId: string } }
) {
  try {
    const { currentStock, reorderPoint, pricePerBox } = await request.json();
    const { id: warehouseId, stockCardId } = params;

    // Validate input
    if (currentStock < 0 || reorderPoint < 0) {
      return NextResponse.json(
        { error: 'จำนวนสต็อกและจุดสั่งซื้อต้องไม่เป็นค่าติดลบ' },
        { status: 400 }
      );
    }

    // Update stock card
    const updatedStockCard = await prisma.stockCard.update({
      where: {
        id: stockCardId,
        warehouseId: warehouseId
      },
      data: {
        currentStock,
        reorderPoint,
        pricePerBox: pricePerBox || undefined,
        availableStock: currentStock, // Assume no reservations for simplicity
        lowStockAlert: currentStock <= reorderPoint,
        // Calculate new total value if pricePerBox is provided
        ...(pricePerBox && {
          totalValue: currentStock * pricePerBox,
          packageCost: pricePerBox
        })
      },
      include: {
        drug: {
          select: {
            name: true,
            hospitalDrugCode: true
          }
        }
      }
    });

    // Create stock transaction record
    await prisma.stockTransaction.create({
      data: {
        hospitalId: updatedStockCard.hospitalId,
        warehouseId: warehouseId,
        drugId: updatedStockCard.drugId,
        stockCardId: stockCardId,
        transactionType: 'ADJUST_INCREASE', // or ADJUST_DECREASE based on change
        quantity: currentStock,
        unitCost: updatedStockCard.averageCost,
        totalCost: currentStock * Number(updatedStockCard.averageCost),
        stockBefore: 0, // Would need to get previous value
        stockAfter: currentStock,
        notes: `Manual stock adjustment via dashboard`,
        performedBy: 'system', // Would get from auth context
        referenceDocument: 'MANUAL_ADJUSTMENT'
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedStockCard
    });

  } catch (error) {
    console.error('Error updating stock card:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
      { status: 500 }
    );
  }
}