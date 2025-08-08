// app/api/admin/warehouses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Validation schemas
const createWarehouseSchema = z.object({
  name: z.string().min(1, 'ชื่อคลังจำเป็น'),
  warehouseCode: z.string().min(1, 'รหัสคลังจำเป็น').max(10, 'รหัสคลังต้องไม่เกิน 10 ตัวอักษร'),
  type: z.enum([
    'CENTRAL', 'DEPARTMENT', 'EMERGENCY', 'CONTROLLED', 
    'COLD_STORAGE', 'QUARANTINE', 'DISPOSAL', 'RECEIVING', 'DISPENSING'
  ]),
  location: z.string().min(1, 'ตำแหน่งที่ตั้งจำเป็น'),
  address: z.string().optional(),
  managerId: z.string().uuid().optional(),
  area: z.number().positive().optional(),
  capacity: z.number().positive().optional(),
  hasTemperatureControl: z.boolean().default(false),
  minTemperature: z.number().optional(),
  maxTemperature: z.number().optional(),
  hasHumidityControl: z.boolean().default(false),
  minHumidity: z.number().min(0).max(100).optional(),
  maxHumidity: z.number().min(0).max(100).optional(),
  securityLevel: z.enum(['BASIC', 'STANDARD', 'HIGH', 'MAXIMUM']).default('STANDARD'),
  accessControl: z.boolean().default(false),
  cctv: z.boolean().default(false),
  alarm: z.boolean().default(false),
  allowReceiving: z.boolean().default(true),
  allowDispensing: z.boolean().default(true),
  allowTransfer: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  description: z.string().optional(),
});

// GET - รายการคลังทั้งหมด
export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    const auth = await validateAdminAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const { user, hospitalId } = auth;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    const hasManager = searchParams.get('hasManager');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      hospitalId: hospitalId,
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

    if (hasManager !== null) {
      if (hasManager === 'true') {
        where.managerId = { not: null };
      } else {
        where.managerId = null;
      }
    }

    // Get warehouses with related data
    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        include: {
          manager: {
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              email: true,
              phoneNumber: true  // Fixed: use phoneNumber instead of phone
            }
          },
          _count: {
            select: {
              stockCards: true,
              stockTransactions: true,
            }
          }
        },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: limit,
      }),
      prisma.warehouse.count({ where })
    ]);

    // Calculate statistics
    const [stats, totalValue] = await Promise.all([
      prisma.warehouse.groupBy({
        by: ['type'],
        where: { hospitalId: hospitalId, isActive: true },
        _count: { id: true },
      }),
      prisma.warehouse.aggregate({
        where: { hospitalId: hospitalId, isActive: true },
        _sum: { totalValue: true }
      })
    ]);

    return NextResponse.json({
      warehouses: warehouses.map(warehouse => ({
        ...warehouse,
        stockItemCount: warehouse._count.stockCards,
        transactionCount: warehouse._count.stockTransactions,
        temperatureRange: warehouse.hasTemperatureControl ? 
          `${warehouse.minTemperature}°C - ${warehouse.maxTemperature}°C` : null,
        humidityRange: warehouse.hasHumidityControl ? 
          `${warehouse.minHumidity}% - ${warehouse.maxHumidity}%` : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        byType: stats.reduce((acc, stat) => ({
          ...acc,
          [stat.type]: stat._count.id
        }), {}),
        totalValue: Number(totalValue._sum.totalValue) || 0, // Fixed: Convert Decimal to number
        totalWarehouses: total,
      },
    });

  } catch (error) {
    console.error('[WAREHOUSES_GET]', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'ข้อมูลไม่ถูกต้อง', 
        details: error.issues // Fixed: use 'issues' instead of 'errors'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคลัง' 
    }, { status: 500 });
  }
}

// POST - สร้างคลังใหม่
export async function POST(request: NextRequest) {
  try {
    console.log('[WAREHOUSES_POST] Starting warehouse creation...');
    
    // Validate admin authentication
    const auth = await validateAdminAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const { user, hospitalId } = auth;
    console.log('[WAREHOUSES_POST] User authenticated:', user.userId);
    
    const body = await request.json();
    console.log('[WAREHOUSES_POST] Request body:', body);
    
    const validatedData = createWarehouseSchema.parse(body);
    console.log('[WAREHOUSES_POST] Data validated successfully');

    // Check if warehouse code already exists in this hospital
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        hospitalId: hospitalId,
        warehouseCode: validatedData.warehouseCode,
      }
    });

    if (existingWarehouse) {
      console.log('[WAREHOUSES_POST] Warehouse code already exists');
      return NextResponse.json({ 
        error: 'รหัสคลังนี้มีอยู่แล้วในโรงพยาบาล' 
      }, { status: 409 });
    }

    // Validate manager if provided - FIXED: Use status instead of isActive
    if (validatedData.managerId) {
      console.log('[WAREHOUSES_POST] Validating manager:', validatedData.managerId);
      
      const manager = await prisma.user.findFirst({
        where: {
          id: validatedData.managerId,
          hospitalId: hospitalId,
          status: 'ACTIVE',  // Fixed: Use status instead of isActive
        }
      });

      if (!manager) {
        console.log('[WAREHOUSES_POST] Manager not found or not active');
        return NextResponse.json({ 
          error: 'ไม่พบผู้จัดการคลังที่ระบุหรือไม่สามารถใช้งานได้' 
        }, { status: 400 });
      }
      
      console.log('[WAREHOUSES_POST] Manager validated:', manager.firstName, manager.lastName);
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

    console.log('[WAREHOUSES_POST] Creating warehouse...');

    // Create warehouse
    const warehouse = await prisma.warehouse.create({
      data: {
        ...validatedData,
        hospitalId: hospitalId,
        area: validatedData.area ? new Decimal(validatedData.area) : null,
        capacity: validatedData.capacity ? new Decimal(validatedData.capacity) : null,
        minTemperature: validatedData.minTemperature ? new Decimal(validatedData.minTemperature) : null,
        maxTemperature: validatedData.maxTemperature ? new Decimal(validatedData.maxTemperature) : null,
        minHumidity: validatedData.minHumidity ? new Decimal(validatedData.minHumidity) : null,
        maxHumidity: validatedData.maxHumidity ? new Decimal(validatedData.maxHumidity) : null,
        totalValue: new Decimal(0), // เริ่มต้นที่ 0
        isActive: true,
        // Fixed: Remove createdBy and updatedBy as they don't exist in the schema
      },
      include: {
        manager: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true 
          }
        }
      }
    });

    console.log('[WAREHOUSES_POST] Warehouse created successfully:', warehouse.id);

    // Log audit trail
    try {
      await prisma.auditLog.create({
        data: {
          hospitalId: hospitalId,
          userId: user.userId,
          action: 'CREATE', // Fixed: use valid AuditAction
          entityType: 'WAREHOUSE',
          entityId: warehouse.id,
          description: `Created warehouse: ${warehouse.name}`, // Fixed: add required description field
          details: {
            warehouseName: warehouse.name,
            warehouseCode: warehouse.warehouseCode,
            type: warehouse.type,
            location: warehouse.location,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
      console.log('[WAREHOUSES_POST] Audit log created');
    } catch (auditError) {
      console.log('[WAREHOUSES_POST] Audit log skipped (table might not exist):', String(auditError)); // Fixed: Convert error to string safely
    }

    return NextResponse.json({ 
      message: 'สร้างคลังสำเร็จแล้ว',
      warehouse 
    }, { status: 201 });

  } catch (error) {
    console.error('[WAREHOUSES_POST] Error', error);
    
    if (error instanceof z.ZodError) {
      console.log('[WAREHOUSES_POST] Validation error:', error.issues); // Fixed: use 'issues' instead of 'errors'
      return NextResponse.json({ 
        error: 'ข้อมูลไม่ถูกต้อง', 
        details: error.issues // Fixed: use 'issues' instead of 'errors'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการสร้างคลัง',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined // Fixed: Convert error to string safely
    }, { status: 500 });
  }
}