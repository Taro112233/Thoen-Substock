// app/api/dashboard/warehouses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const warehouseId = params.id;

    // Get warehouse details
    const warehouse = await prisma.warehouse.findUnique({
      where: {
        id: warehouseId,
        hospitalId: session.user.hospitalId
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        stockCards: {
          include: {
            drug: {
              select: {
                hospitalDrugCode: true,
                name: true,
                genericName: true,
                strength: true,
                unit: true,
                dosageForm: true
              }
            },
            batches: {
              select: {
                id: true,
                batchNumber: true,
                expiryDate: true,
                currentQty: true
              }
            }
          }
        }
      }
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Get recent transactions - แก้ไข include
    const recentTransactions = await prisma.stockTransaction.findMany({
      where: {
        warehouseId: warehouseId,
        hospitalId: session.user.hospitalId
      },
      include: {
        drug: {
          select: {
            name: true
          }
        },
        performer: {  // เปลี่ยนจาก createdBy
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Transform transactions to match expected format
    const transformedTransactions = recentTransactions.map(tx => ({
      ...tx,
      user: tx.performer // Map performer to user for compatibility
    }));

    // Get requisition summary - แก้ไขฟิลด์
    const requisitionSummary = await getRequisitionSummary(warehouseId, session.user.hospitalId);

    // Calculate statistics
    const statistics = calculateWarehouseStatistics(warehouse);

    // Get stock by category and expiry analysis
    const stockByCategory = await getStockByCategory(warehouseId, session.user.hospitalId);
    const expiryAnalysis = await getExpiryAnalysis(warehouseId, session.user.hospitalId);

    const result = {
      ...warehouse,
      recentTransactions: transformedTransactions,
      requisitionSummary,
      statistics,
      stockByCategory,
      expiryAnalysis
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching warehouse detail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get requisition summary - แก้ไขฟิลด์
async function getRequisitionSummary(warehouseId: string, hospitalId: string) {
  const [incoming, outgoing] = await Promise.all([
    // Incoming requisitions (this warehouse is fulfillment warehouse)
    prisma.requisition.count({
      where: {
        hospitalId,
        fulfillmentWarehouseId: warehouseId,  // เปลี่ยนจาก targetWarehouseId
        status: {
          in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_FILLED']
        }
      }
    }),
    // Outgoing requisitions (from departments to this warehouse)
    prisma.requisition.count({
      where: {
        hospitalId,
        fulfillmentWarehouseId: warehouseId,  // warehouse นี้เป็นตัวจ่าย
        status: {
          in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_FILLED']
        }
      }
    })
  ]);

  const pending = await prisma.requisition.count({
    where: {
      hospitalId,
      fulfillmentWarehouseId: warehouseId,  // เปลี่ยนการ query
      status: {
        in: ['SUBMITTED', 'UNDER_REVIEW']
      }
    }
  });

  const completed = await prisma.requisition.count({
    where: {
      hospitalId,
      fulfillmentWarehouseId: warehouseId,  // เปลี่ยนการ query
      status: 'COMPLETED'
    }
  });

  return {
    incoming,
    outgoing,
    pending,
    completed
  };
}

// Helper function to calculate warehouse statistics
function calculateWarehouseStatistics(warehouse: any) {
  const stockCards = warehouse.stockCards || [];
  
  const totalDrugs = stockCards.length;
  const totalStock = stockCards.reduce((sum: number, card: any) => sum + card.currentStock, 0);
  const stockValue = stockCards.reduce((sum: number, card: any) => sum + Number(card.totalValue || 0), 0);
  
  const lowStockItems = stockCards.filter((card: any) => card.lowStockAlert).length;
  const outOfStockItems = stockCards.filter((card: any) => card.currentStock === 0).length;
  const overstockItems = stockCards.filter((card: any) => 
    card.maxStock && card.currentStock > card.maxStock
  ).length;

  // Calculate expiring items (within 90 days)
  const today = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);
  
  const expiringItems = stockCards.reduce((count: number, card: any) => {
    const expiringBatches = card.batches?.filter((batch: any) => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate <= ninetyDaysFromNow && expiryDate > today;
    }) || [];
    return count + expiringBatches.length;
  }, 0);

  // Mock calculations for advanced metrics
  const turnoverRate = 12.5;
  const accuracyRate = 98.5;
  const utilizationRate = warehouse.capacity ? (totalStock / warehouse.capacity) * 100 : 75;
  const avgDailyUsage = 150;
  const daysOfStock = avgDailyUsage > 0 ? Math.round(totalStock / avgDailyUsage) : 0;

  return {
    totalDrugs,
    totalStock,
    stockValue,
    lowStockItems,
    expiringItems,
    outOfStockItems,
    overstockItems,
    turnoverRate,
    accuracyRate,
    utilizationRate,
    avgDailyUsage,
    daysOfStock
  };
}

// Helper function to get stock by category
async function getStockByCategory(warehouseId: string, hospitalId: string) {
  const stockByCategory = await prisma.$queryRaw`
    SELECT 
      COALESCE(d.therapeutic_class, 'ไม่ระบุหมวดหมู่') as category,
      COUNT(sc.id)::int as count,
      SUM(sc.total_value)::float as value,
      (SUM(sc.total_value) * 100.0 / NULLIF((
        SELECT SUM(sc2.total_value) 
        FROM stock_cards sc2 
        WHERE sc2.warehouse_id = ${warehouseId} 
        AND sc2.hospital_id = ${hospitalId}
      ), 0))::float as percentage
    FROM stock_cards sc
    INNER JOIN drugs d ON d.id = sc.drug_id
    WHERE sc.warehouse_id = ${warehouseId}
    AND sc.hospital_id = ${hospitalId}
    AND sc.current_stock > 0
    GROUP BY d.therapeutic_class
    ORDER BY value DESC
  ` as Array<{
    category: string;
    count: number;
    value: number;
    percentage: number;
  }>;

  return stockByCategory;
}

// Helper function to get expiry analysis
async function getExpiryAnalysis(warehouseId: string, hospitalId: string) {
  const today = new Date();
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const ninetyDays = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const oneYear = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);

  const expiryAnalysis = await prisma.$queryRaw`
    SELECT 
      CASE 
        WHEN sb.expiry_date <= ${today} THEN 'หมดอายุแล้ว'
        WHEN sb.expiry_date <= ${thirtyDays} THEN 'หมดอายุใน 30 วัน'
        WHEN sb.expiry_date <= ${ninetyDays} THEN 'หมดอายุใน 90 วัน'
        WHEN sb.expiry_date <= ${oneYear} THEN 'หมดอายุใน 1 ปี'
        ELSE 'มากกว่า 1 ปี'
      END as range,
      COUNT(sb.id)::int as count,
      SUM(sb.current_qty * sc.average_cost)::float as value
    FROM stock_batches sb
    INNER JOIN stock_cards sc ON sc.id = sb.stock_card_id
    WHERE sc.warehouse_id = ${warehouseId}
    AND sc.hospital_id = ${hospitalId}
    AND sb.current_qty > 0
    GROUP BY range
    ORDER BY 
      CASE range
        WHEN 'หมดอายุแล้ว' THEN 1
        WHEN 'หมดอายุใน 30 วัน' THEN 2
        WHEN 'หมดอายุใน 90 วัน' THEN 3
        WHEN 'หมดอายุใน 1 ปี' THEN 4
        ELSE 5
      END
  ` as Array<{
    range: string;
    count: number;
    value: number;
  }>;

  return expiryAnalysis;
}