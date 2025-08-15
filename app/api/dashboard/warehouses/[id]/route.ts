// app/api/dashboard/warehouses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withDashboardAuth, DashboardUser } from '@/lib/dashboard-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - รายละเอียดคลังสำหรับ Dashboard
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withDashboardAuth(request, async (user: DashboardUser, hospitalId: string) => {
    try {
      console.log('🔍 [DASHBOARD WAREHOUSE API] GET warehouse detail:', params.id);
      console.log('✅ [DASHBOARD WAREHOUSE API] User authenticated:', {
        id: user.id,
        role: user.role,
        hospitalId: user.hospitalId
      });

      const warehouseId = params.id;

      // Get warehouse with proper schema fields
      const warehouse = await prisma.warehouse.findFirst({
        where: {
          id: warehouseId,
          hospitalId: hospitalId, // Multi-tenant isolation
        },
        include: {
          manager: {
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              email: true,
              position: true,
              role: true,
              phoneNumber: true
            }
          },
          stockCards: {
            select: {
              id: true,
              drug: {
                select: {
                  id: true,
                  name: true,
                  hospitalDrugCode: true,
                  genericName: true,
                  strength: true,
                  dosageForm: true,
                  unit: true
                }
              },
              currentStock: true,
              reorderPoint: true,
              maxStock: true,
              averageCost: true,
              totalValue: true,
              lowStockAlert: true,
              updatedAt: true
            },
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' },
            take: 1000
          },
          stockTransactions: {
            select: {
              id: true,
              transactionType: true,
              quantity: true,
              unitCost: true,
              totalCost: true,
              createdAt: true,
              drug: {
                select: {
                  name: true,
                  hospitalDrugCode: true
                }
              },
              performer: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true
                }
              },
              referenceId: true, // Use referenceId instead of reference
              notes: true        // Use notes instead of description
            },
            orderBy: { createdAt: 'desc' },
            take: 50
          },
          _count: {
            select: {
              stockCards: true,
              stockTransactions: true,
            }
          }
        }
      });

      if (!warehouse) {
        console.log('❌ [DASHBOARD WAREHOUSE API] Warehouse not found:', warehouseId);
        return NextResponse.json(
          { error: 'ไม่พบข้อมูลคลัง' },
          { status: 404 }
        );
      }

      // Calculate warehouse statistics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));

      // Stock statistics - ใช้ null checking
      const stockCards = warehouse.stockCards || [];
      const stockStats = {
        totalDrugs: stockCards.length,
        totalStock: stockCards.reduce((sum: number, card: any) => sum + (card.currentStock || 0), 0),
        stockValue: stockCards.reduce((sum: number, card: any) => sum + (Number(card.totalValue) || 0), 0),
        lowStockItems: stockCards.filter((card: any) => card.lowStockAlert).length,
        outOfStockItems: stockCards.filter((card: any) => (card.currentStock || 0) <= 0).length,
        overstockItems: stockCards.filter((card: any) => 
          card.maxStock && (card.currentStock || 0) > card.maxStock
        ).length,
      };

      // Get expiring batches
      const expiringBatches = await prisma.stockBatch.count({
        where: {
          stockCard: {
            warehouseId: warehouseId,
            isActive: true
          },
          currentQty: { gt: 0 },
          expiryDate: {
            gte: now,
            lte: ninetyDaysFromNow
          }
        }
      });

      // Recent activity (last 30 days)
      const recentTransactionCount = await prisma.stockTransaction.count({
        where: {
          warehouseId: warehouseId,
          createdAt: { gte: thirtyDaysAgo }
        }
      });

      // Pending requisitions
      const pendingRequisitions = await prisma.requisition.count({
        where: {
          fulfillmentWarehouseId: warehouseId,
          status: {
            in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED']
          }
        }
      });

      // Recent requisitions for summary
      const requisitionSummary = {
        incoming: await prisma.requisition.count({
          where: {
            fulfillmentWarehouseId: warehouseId,
            status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] }
          }
        }),
        outgoing: 0,
        pending: pendingRequisitions,
        completed: await prisma.requisition.count({
          where: {
            fulfillmentWarehouseId: warehouseId,
            status: 'COMPLETED',
            createdAt: { gte: thirtyDaysAgo }
          }
        })
      };

      // Stock by category analysis
      const categoryStats = await prisma.drug.findMany({
        where: {
          hospitalId: hospitalId,
          stockCards: {
            some: {
              warehouseId: warehouseId,
              isActive: true
            }
          }
        },
        select: {
          therapeuticClass: true,
          stockCards: {
            where: {
              warehouseId: warehouseId,
              isActive: true
            },
            select: {
              currentStock: true,
              totalValue: true
            }
          }
        }
      });

      // Process category statistics
      const categoryMap = new Map<string, { count: number; value: number }>();
      categoryStats.forEach(drug => {
        const category = drug.therapeuticClass || 'อื่นๆ';
        const existing = categoryMap.get(category) || { count: 0, value: 0 };
        
        drug.stockCards.forEach(card => {
          existing.count += 1;
          existing.value += Number(card.totalValue) || 0;
        });
        
        categoryMap.set(category, existing);
      });

      const stockByCategoryArray = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        count: stats.count,
        value: stats.value,
        percentage: stockStats.stockValue > 0 ? (stats.value / stockStats.stockValue) * 100 : 0
      })).sort((a, b) => b.value - a.value);

      // Expiry analysis
      const expiryAnalysis = [
        {
          range: 'หมดอายุใน 30 วัน',
          count: await prisma.stockBatch.count({
            where: {
              stockCard: { warehouseId: warehouseId, isActive: true },
              currentQty: { gt: 0 },
              expiryDate: { gte: now, lte: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)) }
            }
          }),
          value: 0
        },
        {
          range: 'หมดอายุใน 60 วัน',
          count: await prisma.stockBatch.count({
            where: {
              stockCard: { warehouseId: warehouseId, isActive: true },
              currentQty: { gt: 0 },
              expiryDate: { 
                gte: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)),
                lte: new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000))
              }
            }
          }),
          value: 0
        },
        {
          range: 'หมดอายุใน 90 วัน',
          count: await prisma.stockBatch.count({
            where: {
              stockCard: { warehouseId: warehouseId, isActive: true },
              currentQty: { gt: 0 },
              expiryDate: { 
                gte: new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)),
                lte: ninetyDaysFromNow
              }
            }
          }),
          value: 0
        }
      ];

      // Build comprehensive response (using null checking)
      const responseData = {
        id: warehouse.id,
        name: warehouse.name,
        warehouseCode: warehouse.warehouseCode,
        type: warehouse.type,
        location: warehouse.location,
        address: warehouse.address,
        isActive: warehouse.isActive,
        isMaintenance: warehouse.isMaintenance,
        area: warehouse.area ? Number(warehouse.area) : null,
        capacity: warehouse.capacity ? Number(warehouse.capacity) : null,
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
        lastStockCount: warehouse.lastStockCount?.toISOString(),
        totalValue: Number(warehouse.totalValue) || 0,
        totalItems: Number(warehouse.totalItems) || 0,
        description: warehouse.description,
        notes: warehouse.notes,
        manager: warehouse.manager ? {
          id: warehouse.manager.id,
          firstName: warehouse.manager.firstName,
          lastName: warehouse.manager.lastName,
          email: warehouse.manager.email,
          phoneNumber: warehouse.manager.phoneNumber,
          position: warehouse.manager.position,
          role: warehouse.manager.role
        } : null,
        createdAt: warehouse.createdAt.toISOString(),
        updatedAt: warehouse.updatedAt.toISOString(),
        stockCards: stockCards.map((card: any) => ({
          id: card.id,
          drug: card.drug,
          currentStock: card.currentStock || 0,
          reorderPoint: card.reorderPoint || 0,
          maxStock: card.maxStock || 0,
          averageCost: Number(card.averageCost) || 0,
          totalValue: Number(card.totalValue) || 0,
          lowStockAlert: card.lowStockAlert,
          lastUpdated: card.updatedAt?.toISOString()
        })),
        recentTransactions: (warehouse.stockTransactions || []).map((tx: any) => ({
          id: tx.id,
          transactionType: tx.transactionType,
          quantity: tx.quantity || 0,
          unitCost: Number(tx.unitCost) || 0,
          totalCost: Number(tx.totalCost) || 0,
          createdAt: tx.createdAt.toISOString(),
          drug: tx.drug,
          performer: tx.performer ? {
            firstName: tx.performer.firstName,
            lastName: tx.performer.lastName,
            role: tx.performer.role
          } : null,
          reference: tx.referenceId,
          description: tx.notes
        })),
        requisitionSummary,
        statistics: {
          ...stockStats,
          expiringItems: expiringBatches,
          recentActivity: recentTransactionCount,
          pendingRequisitions,
          turnoverRate: 0,
          accuracyRate: 98.5,
          utilizationRate: warehouse.capacity ? (stockStats.totalStock / Number(warehouse.capacity)) * 100 : 0,
          avgDailyUsage: 0,
          daysOfStock: 0
        },
        stockByCategory: stockByCategoryArray,
        expiryAnalysis,
        _counts: warehouse._count || { stockCards: 0, stockTransactions: 0 }
      };

      console.log('✅ [DASHBOARD WAREHOUSE API] Response prepared for warehouse:', warehouse.name);

      return NextResponse.json(responseData);

    } catch (error) {
      console.error('[DASHBOARD WAREHOUSE API] Error:', error);
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