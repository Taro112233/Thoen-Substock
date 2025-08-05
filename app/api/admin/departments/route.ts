// app/api/admin/departments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createDepartmentSchema = z.object({
  name: z.string().min(1, 'ชื่อแผนกจำเป็น'),
  nameEn: z.string().optional(),
  departmentCode: z.string().min(1, 'รหัสแผนกจำเป็น').max(10, 'รหัสแผนกต้องไม่เกิน 10 ตัวอักษร'),
  type: z.enum([
    'PHARMACY', 'EMERGENCY', 'ICU', 'WARD', 'OPD', 'OR', 'LABORATORY', 
    'RADIOLOGY', 'ADMINISTRATION', 'FINANCE', 'HR', 'IT', 'OTHER'
  ]),
  parentDepartmentId: z.string().uuid().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  allowRequisition: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  maxRequisitionValue: z.number().positive().optional(),
  budgetLimit: z.number().positive().optional(),
});

// GET - รายการแผนกทั้งหมด
export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    const user = await validateAdminAuth(request);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      hospitalId: user.hospitalId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { departmentCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (active !== null) {
      where.isActive = active === 'true';
    }

    // Get departments with related data
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        include: {
          parentDepartment: {
            select: { id: true, name: true, departmentCode: true }
          },
          childDepartments: {
            select: { id: true, name: true, departmentCode: true }
          },
          headOfDepartment: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          _count: {
            select: {
              users: true,
              requisitions: true,
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
      prisma.department.count({ where })
    ]);

    // Calculate statistics
    const stats = await prisma.department.groupBy({
      by: ['type'],
      where: { hospitalId: user.hospitalId, isActive: true },
      _count: { id: true },
    });

    return NextResponse.json({
      departments: departments.map(dept => ({
        ...dept,
        budgetUtilization: dept.budgetLimit ? 
          (dept.currentSpending.toNumber() / dept.budgetLimit.toNumber()) * 100 : 0,
        userCount: dept._count.users,
        requisitionCount: dept._count.requisitions,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, stat) => ({
        ...acc,
        [stat.type]: stat._count.id
      }), {}),
    });

  } catch (error) {
    console.error('[DEPARTMENTS_GET]', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง', details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนก' }, { status: 500 });
  }
}

// POST - สร้างแผนกใหม่
export async function POST(request: NextRequest) {
  try {
    // Validate admin authentication
    const user = await validateAdminAuth(request);
    
    const body = await request.json();
    const validatedData = createDepartmentSchema.parse(body);

    // Check if department code already exists in this hospital
    const existingDept = await prisma.department.findFirst({
      where: {
        hospitalId: user.hospitalId,
        departmentCode: validatedData.departmentCode,
      }
    });

    if (existingDept) {
      return NextResponse.json({ 
        error: 'รหัสแผนกนี้มีอยู่แล้วในโรงพยาบาล' 
      }, { status: 409 });
    }

    // Validate parent department if provided
    if (validatedData.parentDepartmentId) {
      const parentDept = await prisma.department.findFirst({
        where: {
          id: validatedData.parentDepartmentId,
          hospitalId: user.hospitalId,
        }
      });

      if (!parentDept) {
        return NextResponse.json({ 
          error: 'ไม่พบแผนกแม่ที่ระบุ' 
        }, { status: 400 });
      }
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        ...validatedData,
        hospitalId: user.hospitalId,
        maxRequisitionValue: validatedData.maxRequisitionValue ? 
          new Decimal(validatedData.maxRequisitionValue) : null,
        budgetLimit: validatedData.budgetLimit ? 
          new Decimal(validatedData.budgetLimit) : null,
      },
      include: {
        parentDepartment: {
          select: { id: true, name: true, departmentCode: true }
        },
        childDepartments: {
          select: { id: true, name: true, departmentCode: true }
        },
      }
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        hospitalId: user.hospitalId,
        userId: user.id,
        action: 'CREATE_DEPARTMENT',
        resourceType: 'DEPARTMENT',
        resourceId: department.id,
        details: {
          departmentName: department.name,
          departmentCode: department.departmentCode,
          type: department.type,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    return NextResponse.json({ 
      message: 'สร้างแผนกใหม่สำเร็จ',
      department 
    }, { status: 201 });

  } catch (error) {
    console.error('[DEPARTMENTS_POST]', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'ข้อมูลไม่ถูกต้อง', 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างแผนก' }, { status: 500 });
  }
}