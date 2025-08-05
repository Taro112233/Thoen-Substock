// app/api/admin/warehouses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Validation schema for updates
const updateWarehouseSchema = z.object({
  name: z.string().min(1, 'ชื่อคลังจำเป็น').optional(),
  warehouseCode: z.string().min(1, 'รหัสคลังจำเป็น').max(10, 'รหัสคลังต้องไม่เกิน 10 ตัวอักษร').optional(),
  type: z.enum([
    'CENTRAL', 'DEPARTMENT', 'EMERGENCY', 'CONTROLLED', 
    'COLD_STORAGE', 'QUARANTINE', 'DISPOSAL', 'RECEIVING', 'DISPENSING'
  ]).optional(),
  location: z.string().min(1, 'ตำแหน่งที่ตั้งจำเป็น').optional(),
  address: z.string().optional(),
  managerId: z.string().uuid().optional(),
  area: z.number().positive().optional(),
  capacity: z.number().positive().optional(),
  hasTemperatureControl: z.boolean().optional(),
  minTemperature: z.number().optional(),
  maxTemperature: z.number().optional(),
  hasHumidityControl: z.boolean().optional(),
  minHumidity: z.number().min(0).max(100).optional(),
  maxHumidity: z.number().min(0).max(100).optional(),
  securityLevel: z.enum(['BASIC', 'STANDARD', 'HIGH', 'MAXIMUM']).optional(),
  accessControl: z.boolean().optional(),
  cctv: z.boolean().optional(),
  alarm: z.boolean().optional(),
  allowReceiving: z.boolean().optional(),
  allowDispensing: z.boolean().optional(),
  allowTransfer: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET - รายละเอียดคลังเฉพาะ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin authentication
    const user = await validateAdminAuth(request);
    
    const warehouseId = params.id;

    // Get warehouse with all related data
    const warehouse = await prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        hospitalId: user.hospitalId,
      },
      include: {
        manager: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true,
            phone: true,
            position: true,
            role: true
          }
        },
        stockCards: {
          select: {
            id: true,
            drug: {
              select: {
                id: true,
                name: true,
                hospitalDrugCode: true
              }
            },
            currentStock: true,
            reorderPoint: true,
            maxStock: true,
            averageCost: true
          },
          where: { isActive: true },
          orderBy: { updatedAt: 'desc' },
          take: 10
        },
        stockTransactions: {
          select: {
            id: true,
            type: true,
            quantity: true,
            unitCost: true,
            totalCost: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
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
      return NextResponse.json({ 
        error: 'ไม่พบคลังที่ระบุ' 
      }, { status: 404 });
    }

    // Calculate additional statistics
    const [recentActivity, stockStats] = await Promise.all([
      // Recent activity
      prisma.auditLog.findMany({
        where: {
          hospitalId: user.hospitalId,
          resourceType: 'WAREHOUSE',
          resourceId: warehouseId,
        },
        select: {
          id: true,
          action: true,
          details: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      // Stock statistics
      prisma.stockCard.aggregate({
        where: {
          warehouseId: warehouseId,
          isActive: true
        },
        _sum: {
          currentStock: true,
        },
        _count: {
          id: true
        }
      })
    ]);

    // Calculate low stock items
    const lowStockItems = await prisma.stockCard.count({
      where: {
        warehouseId: warehouseId,
        isActive: true,
        lowStockAlert: true,
        currentStock: {
          lte: prisma.stockCard.fields.reorderPoint
        }
      }
    });

    // Calculate capacity utilization
    const totalItems = stockStats._sum.currentStock?.toNumber() || 0;
    const capacityUtilization = warehouse.capacity ? 
      (totalItems / warehouse.capacity.toNumber()) * 100 : 0;

    return NextResponse.json({
      warehouse: {
        ...warehouse,
        totalItems,
        lowStockItems,
        capacityUtilization: Math.round(capacityUtilization * 100) / 100,
        stockItemCount: warehouse._count.stockCards,
        transactionCount: warehouse._count.stockTransactions,
      },
      recentActivity,
      stats: {
        totalStockCards: warehouse._count.stockCards,
        totalTransactions: warehouse._count.stockTransactions,
        totalItems,
        lowStockItems,
        capacityUtilization,
      }
    });

  } catch (error) {
    console.error('[WAREHOUSE_GET]', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคลัง' 
    }, { status: 500 });
  }
}

// PUT - อัพเดตข้อมูลคลัง
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin authentication
    const user = await validateAdminAuth(request);
    
    const warehouseId = params.id;
    const body = await request.json();
    const validatedData = updateWarehouseSchema.parse(body);

    // Check if warehouse exists and belongs to the hospital
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        hospitalId: user.hospitalId,
      }
    });

    if (!existingWarehouse) {
      return NextResponse.json({ 
        error: 'ไม่พบคลังที่ระบุ' 
      }, { status: 404 });
    }

    // Check if warehouse code is unique (if being updated)
    if (validatedData.warehouseCode && validatedData.warehouseCode !== existingWarehouse.warehouseCode) {
      const duplicateCode = await prisma.warehouse.findFirst({
        where: {
          hospitalId: user.hospitalId,
          warehouseCode: validatedData.warehouseCode,
          id: { not: warehouseId }
        }
      });

      if (duplicateCode) {
        return NextResponse.json({ 
          error: 'รหัสคลังนี้มีอยู่แล้วในโรงพยาบาล' 
        }, { status: 409 });
      }
    }

    // Validate manager if provided
    if (validatedData.managerId) {
      const manager = await prisma.user.findFirst({
        where: {
          id: validatedData.managerId,
          hospitalId: user.hospitalId,
          isActive: true,
        }
      });

      if (!manager) {
        return NextResponse.json({ 
          error: 'ไม่พบผู้จัดการคลังที่ระบุ' 
        }, { status: 400 });
      }
    }

    // Validate temperature and humidity ranges
    if (validatedData.hasTemperatureControl) {
      if (validatedData.minTemperature === undefined || validatedData.maxTemperature === undefined) {
        return NextResponse.json({ 
          error: 'กรุณาระบุช่วงอุณหภูมิเมื่อเปิดการควบคุมอุณหภูมิ' 
        }, { status: 400 });
      }
      if (validatedData.minTemperature >= validatedData.maxTemperature) {
        return NextResponse.json({ 
          error: 'อุณหภูมิต่ำสุดต้องน้อยกว่าอุณหภูมิสูงสุด' 
        }, { status: 400 });
      }
    }

    if (validatedData.hasHumidityControl) {
      if (validatedData.minHumidity === undefined || validatedData.maxHumidity === undefined) {
        return NextResponse.json({ 
          error: 'กรุณาระบุช่วงความชื้นเมื่อเปิดการควบคุมความชื้น' 
        }, { status: 400 });
      }
      if (validatedData.minHumidity >= validatedData.maxHumidity) {
        return NextResponse.json({ 
          error: 'ความชื้นต่ำสุดต้องน้อยกว่าความชื้นสูงสุด' 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      area: validatedData.area ? new Decimal(validatedData.area) : undefined,
      capacity: validatedData.capacity ? new Decimal(validatedData.capacity) : undefined,
      minTemperature: validatedData.minTemperature ? new Decimal(validatedData.minTemperature) : undefined,
      maxTemperature: validatedData.maxTemperature ? new Decimal(validatedData.maxTemperature) : undefined,
      minHumidity: validatedData.minHumidity ? new Decimal(validatedData.minHumidity) : undefined,
      maxHumidity: validatedData.maxHumidity ? new Decimal(validatedData.maxHumidity) : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update warehouse
    const updatedWarehouse = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: updateData,
      include: {
        manager: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        hospitalId: user.hospitalId,
        userId: user.id,
        action: 'UPDATE_WAREHOUSE',
        resourceType: 'WAREHOUSE',
        resourceId: warehouseId,
        details: {
          warehouseName: updatedWarehouse.name,
          warehouseCode: updatedWarehouse.warehouseCode,
          changes: validatedData,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    return NextResponse.json({ 
      message: 'อัพเดตข้อมูลคลังสำเร็จ',
      warehouse: updatedWarehouse 
    });

  } catch (error) {
    console.error('[WAREHOUSE_PUT]', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'ข้อมูลไม่ถูกต้อง', 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการอัพเดตคลัง' 
    }, { status: 500 });
  }
}

// DELETE - ลบคลัง
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin authentication
    const user = await validateAdminAuth(request);
    
    const warehouseId = params.id;

    // Check if warehouse exists and belongs to the hospital
    const warehouse = await prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        hospitalId: user.hospitalId,
      },
      include: {
        _count: {
          select: {
            stockCards: true,
            stockTransactions: true,
          }
        }
      }
    });

    if (!warehouse) {
      return NextResponse.json({ 
        error: 'ไม่พบคลังที่ระบุ' 
      }, { status: 404 });
    }

    // Check if warehouse has dependencies
    const hasDependencies = 
      warehouse._count.stockCards > 0 || 
      warehouse._count.stockTransactions > 0;

    if (hasDependencies) {
      return NextResponse.json({ 
        error: 'ไม่สามารถลบคลังที่มีข้อมูลสต็อกหรือรายการธุรกรรมได้',
        details: {
          stockCards: warehouse._count.stockCards,
          stockTransactions: warehouse._count.stockTransactions,
        }
      }, { status: 409 });
    }

    // Soft delete by setting isActive to false instead of actual deletion
    const deletedWarehouse = await prisma.warehouse.update({
      where: { id: warehouseId },
      data: { 
        isActive: false,
        // Add deletion timestamp to code to prevent unique constraint issues
        warehouseCode: `${warehouse.warehouseCode}_DELETED_${Date.now()}`
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        hospitalId: user.hospitalId,
        userId: user.id,
        action: 'DELETE_WAREHOUSE',
        resourceType: 'WAREHOUSE',
        resourceId: warehouseId,
        details: {
          warehouseName: warehouse.name,
          warehouseCode: warehouse.warehouseCode,
          deletionMethod: 'soft_delete',
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    return NextResponse.json({ 
      message: 'ลบคลังสำเร็จแล้ว',
      warehouse: deletedWarehouse 
    });

  } catch (error) {
    console.error('[WAREHOUSE_DELETE]', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการลบคลัง' 
    }, { status: 500 });
  }
}