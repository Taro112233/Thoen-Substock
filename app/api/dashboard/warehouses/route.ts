// app/api/dashboard/warehouses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { hospitalId } = authResult;

    // Fetch all warehouses with aggregated data
    const [warehouses, summary] = await Promise.all([
      // Get warehouses with metrics
      prisma.warehouse.findMany({
        where: {
          hospitalId: hospitalId,
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          _count: {
            select: {
              stockCards: true,
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      }),

      // Get summary statistics
      prisma.warehouse.aggregate({
        where: {
          hospitalId: hospitalId,
        },
        _count: {
          _all: true,
        },
        _sum: {
          totalValue: true,
          totalItems: true,
        }
      })
    ]);

    // Calculate metrics for each warehouse
    const warehousesWithMetrics = await Promise.all(
      warehouses.map(async (warehouse) => {
        // Get stock metrics
        const [stockMetrics, lowStockCount, expiringCount, requisitions] = await Promise.all([
          // Stock value and count
          prisma.stockCard.aggregate({
            where: {
              warehouseId: warehouse.id,
              isActive: true,
            },
            _sum: {
              currentStock: true,
              totalValue: true,
            },
            _count: {
              _all: true,
            }
          }),

          // Low stock items
          prisma.stockCard.count({
            where: {
              warehouseId: warehouse.id,
              isActive: true,
              lowStockAlert: true,
            }
          }),

          // Expiring items (within 90 days)
          prisma.stockBatch.count({
            where: {
              stockCard: {
                warehouseId: warehouse.id,
                isActive: true,
              },
              currentQty: { gt: 0 },
              expiryDate: {
                lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                gte: new Date(),
              }
            }
          }),

          // Pending requisitions
          prisma.requisition.count({
            where: {
              fulfillmentWarehouseId: warehouse.id,
              status: {
                in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED']
              }
            }
          })
        ]);

        // Get recent activity
        const recentActivity = await prisma.stockTransaction.findMany({
          where: {
            warehouseId: warehouse.id,
          },
          select: {
            transactionType: true,
            quantity: true,
            createdAt: true,
            drug: {
              select: {
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        });

        // Calculate capacity usage
        const capacityUsage = warehouse.capacity 
          ? ((stockMetrics._sum.currentStock || 0) / Number(warehouse.capacity)) * 100
          : 0;

        // Calculate turnover rate (placeholder - would need more complex calculation)
        const turnoverRate = 4.2; // Example value

        return {
          ...warehouse,
          metrics: {
            stockValue: stockMetrics._sum.totalValue || 0,
            itemCount: stockMetrics._sum.currentStock || 0,
            lowStockItems: lowStockCount,
            expiringItems: expiringCount,
            pendingRequisitions: requisitions,
            capacityUsage: capacityUsage,
            turnoverRate: turnoverRate,
            accuracy: 98.5, // Example value
          },
          recentActivity: recentActivity.map(activity => ({
            type: activity.transactionType,
            description: `${activity.transactionType} - ${activity.drug.name} (${Math.abs(activity.quantity)} ชิ้น)`,
            timestamp: activity.createdAt.toISOString(),
          }))
        };
      })
    );

    // Calculate summary by warehouse type
    const warehouseTypes = warehouses.reduce((acc, warehouse) => {
      const existing = acc.find(t => t.type === warehouse.type);
      if (existing) {
        existing.count++;
        existing.value += Number(warehouse.totalValue);
      } else {
        acc.push({
          type: warehouse.type,
          count: 1,
          value: Number(warehouse.totalValue)
        });
      }
      return acc;
    }, [] as Array<{ type: string; count: number; value: number }>);

    // Count active warehouses
    const activeWarehouses = warehouses.filter(w => w.isActive).length;

    // Calculate alerts
    const criticalAlerts = warehousesWithMetrics.reduce(
      (sum, w) => sum + (w.metrics.lowStockItems > 10 ? 1 : 0), 
      0
    );
    const lowStockAlerts = warehousesWithMetrics.reduce(
      (sum, w) => sum + w.metrics.lowStockItems, 
      0
    );
    const expiringAlerts = warehousesWithMetrics.reduce(
      (sum, w) => sum + w.metrics.expiringItems, 
      0
    );
    const pendingRequisitions = warehousesWithMetrics.reduce(
      (sum, w) => sum + w.metrics.pendingRequisitions, 
      0
    );

    const responseData = {
      warehouses: warehousesWithMetrics,
      summary: {
        totalWarehouses: warehouses.length,
        activeWarehouses: activeWarehouses,
        totalStockValue: summary._sum.totalValue || 0,
        totalItems: summary._sum.totalItems || 0,
        criticalAlerts: criticalAlerts,
        lowStockAlerts: lowStockAlerts,
        expiringAlerts: expiringAlerts,
        pendingRequisitions: pendingRequisitions,
        warehouseTypes: warehouseTypes,
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Dashboard warehouse fetch error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}