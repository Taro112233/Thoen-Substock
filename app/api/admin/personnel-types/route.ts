// app/api/admin/personnel-types/route.ts
// Personnel Types API Routes - List & Create
// API สำหรับจัดการประเภทบุคลากร (Personnel Types)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// ================================
// VALIDATION SCHEMAS
// ================================

const PersonnelTypeCreateSchema = z.object({
  hospitalId: z.string().uuid('รหัสโรงพยาบาลไม่ถูกต้อง'),
  typeCode: z.string()
    .min(2, 'รหัสประเภทต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(20, 'รหัสประเภทต้องไม่เกิน 20 ตัวอักษร')
    .regex(/^[A-Z0-9_]+$/, 'รหัสประเภทต้องใช้ตัวพิมพ์ใหญ่, ตัวเลข และ _ เท่านั้น'),
  typeName: z.string()
    .min(1, 'ชื่อประเภทบุคลากรจำเป็นต้องระบุ')
    .max(100, 'ชื่อประเภทบุคลากรต้องไม่เกิน 100 ตัวอักษร'),
  typeNameEn: z.string()
    .max(100, 'ชื่อภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
    .optional()
    .nullable(),
  hierarchy: z.enum(['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD', 'STAFF', 'STUDENT'], {
    message: 'ระดับลำดับชั้นไม่ถูกต้อง'
  }),
  levelOrder: z.number()
    .int('ลำดับระดับต้องเป็นจำนวนเต็ม')
    .min(1, 'ลำดับระดับต้องมากกว่าหรือเท่ากับ 1')
    .max(100, 'ลำดับระดับต้องไม่เกิน 100'),
  
  // สิทธิ์และความสามารถ
  canManageHospitals: z.boolean().default(false),
  canManageWarehouses: z.boolean().default(false),
  canManageDepartments: z.boolean().default(false),
  canManagePersonnel: z.boolean().default(false),
  canManageDrugs: z.boolean().default(false),
  canManageMasterData: z.boolean().default(false),
  canViewReports: z.boolean().default(true),
  canApproveUsers: z.boolean().default(false),
  
  // รายละเอียดเพิ่มเติม
  description: z.string()
    .max(500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร')
    .optional()
    .nullable(),
  responsibilities: z.array(z.string())
    .max(20, 'หน้าที่ความรับผิดชอบต้องไม่เกิน 20 รายการ')
    .optional()
    .nullable(),
  maxSubordinates: z.number()
    .int('จำนวนลูกน้องสูงสุดต้องเป็นจำนวนเต็ม')
    .min(0, 'จำนวนลูกน้องสูงสุดต้องมากกว่าหรือเท่ากับ 0')
    .max(1000, 'จำนวนลูกน้องสูงสุดต้องไม่เกิน 1000')
    .optional()
    .nullable(),
  defaultDepartmentType: z.string()
    .max(50, 'ประเภทแผนกเริ่มต้นต้องไม่เกิน 50 ตัวอักษร')
    .optional()
    .nullable(),
  isActive: z.boolean().default(true)
});

const QueryParamsSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).pipe(z.number().min(1)),
  limit: z.string().transform(val => parseInt(val) || 10).pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
  hospitalId: z.string().uuid().optional(),
  hierarchy: z.enum(['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD', 'STAFF', 'STUDENT']).optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  sortBy: z.enum(['typeName', 'hierarchy', 'levelOrder', 'createdAt']).default('typeName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// ================================
// GET HANDLER - List Personnel Types
// ================================
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะ DEVELOPER, DIRECTOR, GROUP_HEAD)
    if (!['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึงการจัดการประเภทบุคลากร' },
        { status: 403 }
      );
    }

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = QueryParamsSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: searchParams.get('search') || undefined,
      hospitalId: searchParams.get('hospitalId') || undefined,
      hierarchy: searchParams.get('hierarchy') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      sortBy: searchParams.get('sortBy') || 'typeName',
      sortOrder: searchParams.get('sortOrder') || 'asc'
    });

    const { page, limit, search, hospitalId, hierarchy, isActive, sortBy, sortOrder } = queryParams;
    const skip = (page - 1) * limit;

    // สร้าง where conditions
    const where: any = {
      // Multi-tenant: แสดงเฉพาะข้อมูลของโรงพยาบาลที่เข้าถึงได้
      ...(session.user.role === 'DEVELOPER' 
        ? (hospitalId ? { hospitalId } : {}) // DEVELOPER ดูได้ทั้งหมดหรือเลือกโรงพยาบาล
        : { hospitalId: session.user.hospitalId } // อื่นๆ ดูได้เฉพาะโรงพยาบาลตัวเอง
      ),
      ...(hierarchy && { hierarchy }),
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(search && {
        OR: [
          { typeName: { contains: search, mode: 'insensitive' } },
          { typeNameEn: { contains: search, mode: 'insensitive' } },
          { typeCode: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // สร้าง orderBy
    const orderBy: any = {
      [sortBy]: sortOrder
    };

    // Query ข้อมูล
    const [personnelTypes, totalCount] = await Promise.all([
      prisma.personnelType.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          hospital: {
            select: {
              id: true,
              name: true,
              hospitalCode: true,
              status: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          _count: {
            select: {
              users: true // จำนวนผู้ใช้ที่ใช้ประเภทนี้
            }
          }
        }
      }),
      prisma.personnelType.count({ where })
    ]);

    // คำนวณ pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Statistics (เฉพาะ DEVELOPER)
    let statistics = null;
    if (session.user.role === 'DEVELOPER') {
      const stats = await prisma.personnelType.groupBy({
        by: ['hierarchy'],
        _count: { _all: true },
        where: hospitalId ? { hospitalId } : {}
      });

      statistics = {
        byHierarchy: stats.reduce((acc, item) => {
          acc[item.hierarchy] = item._count._all;
          return acc;
        }, {} as Record<string, number>),
        totalActive: await prisma.personnelType.count({
          where: { ...where, isActive: true }
        }),
        totalInactive: await prisma.personnelType.count({
          where: { ...where, isActive: false }
        })
      };
    }

    return NextResponse.json({
      success: true,
      data: personnelTypes,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      },
      statistics
    });

  } catch (error) {
    console.error('Personnel Types GET Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ข้อมูล query parameters ไม่ถูกต้อง',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทบุคลากร' },
      { status: 500 }
    );
  }
}

// ================================
// POST HANDLER - Create Personnel Type
// ================================
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบสิทธิ์การสร้าง (เฉพาะ DEVELOPER, DIRECTOR)
    if (!['DEVELOPER', 'DIRECTOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์สร้างประเภทบุคลากร' },
        { status: 403 }
      );
    }

    // Parse และ validate request body
    const body = await request.json();
    
    // กำหนด hospitalId default สำหรับ non-DEVELOPER
    if (session.user.role !== 'DEVELOPER' && !body.hospitalId) {
      body.hospitalId = session.user.hospitalId;
    }

    const validatedData = PersonnelTypeCreateSchema.parse(body);

    // ตรวจสอบสิทธิ์เข้าถึงโรงพยาบาล
    if (session.user.role !== 'DEVELOPER' && validatedData.hospitalId !== session.user.hospitalId) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์สร้างประเภทบุคลากรในโรงพยาบาลนี้' },
        { status: 403 }
      );
    }

    // ตรวจสอบว่าโรงพยาบาลมีอยู่จริง
    const hospital = await prisma.hospital.findUnique({
      where: { id: validatedData.hospitalId }
    });

    if (!hospital) {
      return NextResponse.json(
        { error: 'ไม่พบโรงพยาบาลที่ระบุ' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า typeCode ไม่ซ้ำในโรงพยาบาลเดียวกัน
    const existingType = await prisma.personnelType.findFirst({
      where: {
        hospitalId: validatedData.hospitalId,
        typeCode: validatedData.typeCode
      }
    });

    if (existingType) {
      return NextResponse.json(
        { 
          error: 'รหัสประเภทบุคลากรนี้มีอยู่แล้วในโรงพยาบาล',
          conflictField: 'typeCode'
        },
        { status: 409 }
      );
    }

    // ตรวจสอบระดับลำดับชั้น (DEVELOPER สร้างได้ทั้งหมด, DIRECTOR สร้างได้เฉพาะระดับที่ต่ำกว่า)
    if (session.user.role === 'DIRECTOR') {
      const forbiddenHierarchies = ['DEVELOPER', 'DIRECTOR'];
      if (forbiddenHierarchies.includes(validatedData.hierarchy)) {
        return NextResponse.json(
          { error: 'ไม่สามารถสร้างประเภทบุคลากรในระดับนี้ได้' },
          { status: 403 }
        );
      }
    }

    // สร้าง Personnel Type ใหม่
    const newPersonnelType = await prisma.personnelType.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        responsibilities: validatedData.responsibilities || []
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            hospitalCode: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'สร้างประเภทบุคลากรเรียบร้อยแล้ว',
        data: newPersonnelType
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Personnel Type CREATE Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Database constraint errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'รหัสประเภทบุคลากรนี้มีอยู่แล้วในโรงพยาบาล',
          conflictField: 'typeCode'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างประเภทบุคลากร' },
      { status: 500 }
    );
  }
}