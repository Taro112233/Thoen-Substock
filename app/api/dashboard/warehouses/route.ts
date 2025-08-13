// app/api/dashboard/warehouses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateDashboardAuth, withDashboardAuth, DashboardUser } from '@/lib/dashboard-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - รายการคลังทั้งหมดสำหรับ Dashboard
export async function GET(request: NextRequest) {
  return withDashboardAuth(request, async (user: DashboardUser, hospitalId: string) => {
    try {
      console.log('🔍 [DASHBOARD WAREHOUSES API] GET warehouses list');
      console.log('✅ [DASHBOARD WAREHOUSES API] User:', {
        id: user.id,
        role: user.role,
        hospitalId: user.hospitalId
      });

      const { searchParams } = new URL(request.url);
      const search = searchParams.get('search');
      const type = searchParams.get('type');
      const active = searchParams.get('active');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const skip = (page - 1) * limit;

      // Build where clause for multi-tenant isolation
      const where: any = {
        hospitalId: hospitalId, // Multi-tenant security
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { warehouseCode: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (type) {
        where.type = type;
      }

      if (active !== null) {
        where.isActive = active === 'true';
      }

      // Get warehouses with aggregated data
      const warehouses = await prisma.warehouse.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: {
              stockCards: true,
              stockTransactions: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      });

      // Calculate metrics for each warehouse
      const warehousesWithMetrics = await Promise.all(
        warehouses.map(async (warehouse) => {
          const now = new Date();
          const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
          const ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));

          // Get stock metrics
          const [
            totalStockData,
            lowStockCount,
            expiringIn30Days,
            expiringIn60Days,
            expiringIn90Days,
            pendingRequisitions,
            recentTransactions
          ] = await Promise.all([
            // Total stock and value
            prisma.stockCard.aggregate({
              where: {
                warehouseId: warehouse.id,
                isActive: true
              },
              _sum: {
                currentStock: true,
                totalValue: true
              },
              _count: true
            }),

            // Low stock alerts
            prisma.stockCard.count({
              where: {
                warehouseId: warehouse.id,
                isActive: true,
                lowStockAlert: true
              }
            }),

            // Expiring in 30 days
            prisma.stockBatch.count({
              where: {
                stockCard: {
                  warehouseId: warehouse.id,
                  isActive: true
                },
                currentQty: { gt: 0 },
                expiryDate: {
                  gte: now,
                  lte: thirtyDaysFromNow
                }
              }
            }),

            // Expiring in 60 days
            prisma.stockBatch.count({
              where: {
                stockCard: {
                  warehouseId: warehouse.id,
                  isActive: true
                },
                currentQty: { gt: 0 },
                expiryDate: {
                  gte: thirtyDaysFromNow,
                  lte: new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000))
                }
              }
            }),

            // Expiring in 90 days
            prisma.stockBatch.count({
              where: {
                stockCard: {
                  warehouseId: warehouse.id,
                  isActive: true
                },
                currentQty: { gt: 0 },
                expiryDate: {
                  gte: new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)),
                  lte: ninetyDaysFromNow
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
            }),

            // Recent transactions (last 5)
            prisma.stockTransaction.findMany({
              where: {
                warehouseId: warehouse.id
              },
              select: {
                id: true,
                transactionType: true,
                quantity: true,
                createdAt: true,
                drug: {
                  select: {
                    name: true,
                    hospitalDrugCode: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 5
            })
          ]);

          const metrics = {
            totalStock: totalStockData._sum.currentStock || 0,
            totalValue: Number(totalStockData._sum.totalValue) || 0,
            totalItems: totalStockData._count || 0,
            lowStockItems: lowStockCount,
            expiringItems: expiringIn30Days + expiringIn60Days + expiringIn90Days,
            expiringIn30Days,
            expiringIn60Days,
            expiringIn90Days,
            pendingRequisitions,
            criticalAlerts: lowStockCount + expiringIn30Days
          };

          return {
            id: warehouse.id,
            name: warehouse.name,
            warehouseCode: warehouse.warehouseCode,
            type: warehouse.type,
            location: warehouse.location,
            address: warehouse.address,
            isActive: warehouse.isActive,
            isMaintenance: warehouse.isMaintenance,
            hasTemperatureControl: warehouse.hasTemperatureControl,
            minTemperature: warehouse.minTemperature ? Number(warehouse.minTemperature) : null,
            maxTemperature: warehouse.maxTemperature ? Number(warehouse.maxTemperature) : null,
            hasHumidityControl: warehouse.hasHumidityControl,
            minHumidity: warehouse.minHumidity ? Number(warehouse.minHumidity) : null,
            maxHumidity: warehouse.maxHumidity ? Number(warehouse.maxHumidity) : null,
            securityLevel: warehouse.securityLevel,
            accessControl: warehouse.accessControl,
            cctv: warehouse.cctv,
            alarm: warehouse.alarm,
            area: warehouse.area ? Number(warehouse.area) : null,
            capacity: warehouse.capacity ? Number(warehouse.capacity) : null,
            totalValue: Number(warehouse.totalValue) || 0,
            totalItems: Number(warehouse.totalItems) || 0,
            lastStockCount: warehouse.lastStockCount?.toISOString(),
            description: warehouse.description,
            notes: warehouse.notes,
            createdAt: warehouse.createdAt.toISOString(),
            updatedAt: warehouse.updatedAt.toISOString(),
            manager: warehouse.manager ? {
              id: warehouse.manager.id,
              firstName: warehouse.manager.firstName,
              lastName: warehouse.manager.lastName,
              email: warehouse.manager.email,
              role: warehouse.manager.role
            } : null,
            metrics,
            recentTransactions: recentTransactions.map(tx => ({
              id: tx.id,
              transactionType: tx.transactionType,
              quantity: tx.quantity || 0,
              createdAt: tx.createdAt.toISOString(),
              drug: tx.drug
            })),
            _count: warehouse._count
          };
        })
      );

      // Get summary statistics
      const [summary, totalCount, warehouseTypes] = await Promise.all([
        // Overall summary
        prisma.warehouse.aggregate({
          where: { hospitalId },
          _sum: {
            totalValue: true,
            totalItems: true
          },
          _count: {
            _all: true
          }
        }),

        // Total count for pagination
        prisma.warehouse.count({ where }),

        // Warehouse types distribution
        prisma.warehouse.groupBy({
          by: ['type'],
          where: { hospitalId },
          _count: {
            type: true
          }
        })
      ]);

      const activeWarehouses = warehouses.filter(w => w.isActive).length;
      const criticalAlerts = warehousesWithMetrics.reduce(
        (sum, w) => sum + w.metrics.criticalAlerts, 
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
          totalWarehouses: summary._count._all || 0,
          activeWarehouses: activeWarehouses,
          totalStockValue: Number(summary._sum.totalValue) || 0,
          totalItems: Number(summary._sum.totalItems) || 0,
          criticalAlerts: criticalAlerts,
          lowStockAlerts: lowStockAlerts,
          expiringAlerts: expiringAlerts,
          pendingRequisitions: pendingRequisitions,
          warehouseTypes: warehouseTypes.map(wt => ({
            type: wt.type,
            count: wt._count.type
          }))
        },
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      };

      console.log('✅ [DASHBOARD WAREHOUSES API] Response prepared with', warehouses.length, 'warehouses');

      return NextResponse.json(responseData);

    } catch (error) {
      console.error('[DASHBOARD WAREHOUSES API] Error:', error);
      return NextResponse.json(
        { 
          error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคลัง',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        },
        { status: 500 }
      );
    }
  });
}