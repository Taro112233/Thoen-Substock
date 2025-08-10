// app/api/admin/hospitals/route.ts - Fixed ZodError handling
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z, ZodError } from 'zod';

// ===================================
// VALIDATION SCHEMAS
// ===================================

const CreateHospitalSchema = z.object({
  name: z.string().min(1, 'ชื่อโรงพยาบาลจำเป็น'),
  nameEn: z.string().optional(),
  hospitalCode: z.string().min(1, 'รหัสโรงพยาบาลจำเป็น'),
  type: z.enum(['GOVERNMENT', 'PRIVATE', 'UNIVERSITY', 'MILITARY', 'POLICE', 'COMMUNITY', 'SPECIALIZED']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'MAINTENANCE']).default('PENDING'),
  
  // ข้อมูลการจดทะเบียน
  licenseNo: z.string().optional(),
  licenseExpiry: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  taxId: z.string().optional(),
  registrationNo: z.string().optional(),
  
  // ที่อยู่
  address: z.string().min(1, 'ที่อยู่จำเป็น'),
  district: z.string().optional(),
  subDistrict: z.string().optional(),
  province: z.string().min(1, 'จังหวัดจำเป็น'),
  postalCode: z.string().optional(),
  country: z.string().default('Thailand'),
  
  // ข้อมูลติดต่อ
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional(),
  website: z.string().url('รูปแบบ URL ไม่ถูกต้อง').optional(),
  
  // ข้อมูลเพิ่มเติม
  bedCount: z.number().int().min(0).optional(),
  employeeCount: z.number().int().min(0).optional(),
  establishedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  
  // การตั้งค่าระบบ
  timezone: z.string().default('Asia/Bangkok'),
  locale: z.string().default('th-TH'),
  currency: z.string().default('THB'),
  
  // การสมัครสมาชิก
  subscriptionPlan: z.string().optional(),
  subscriptionStart: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  subscriptionEnd: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  maxUsers: z.number().int().min(1).optional(),
  maxWarehouses: z.number().int().min(1).optional(),
});

const QuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'MAINTENANCE']).optional(),
  type: z.enum(['GOVERNMENT', 'PRIVATE', 'UNIVERSITY', 'MILITARY', 'POLICE', 'COMMUNITY', 'SPECIALIZED']).optional(),
  province: z.string().optional(),
  sortBy: z.enum(['name', 'hospitalCode', 'createdAt', 'bedCount']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ===================================
// HELPER FUNCTIONS
// ===================================

async function getUserSession() {
  // Development mode - ใช้ mock user
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'dev-user-1',
      role: 'DEVELOPER',
      hospitalId: 'dev-hospital-1',
      status: 'ACTIVE',
      permissions: {
        canManageHospitals: true,
        canCreateHospitals: true,
        canEditHospitals: true,
        canDeleteHospitals: true,
      }
    };
  }

  // Production mode - ใช้ NextAuth session
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลการเข้าสู่ระบบ');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      hospital: true,
      personnelType: true,
    },
  });

  if (!user) {
    throw new Error('ไม่พบข้อมูลผู้ใช้');
  }

  return user;
}

function checkHospitalPermission(user: any, action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE') {
  // DEVELOPER สามารถทำทุกอย่างได้
  if (user.role === 'DEVELOPER') {
    return true;
  }

  // HOSPITAL_ADMIN หรือ DIRECTOR สามารถจัดการโรงพยาบาลของตัวเองได้
  if (user.role === 'HOSPITAL_ADMIN' || user.role === 'DIRECTOR') {
    if (action === 'CREATE') {
      return false; // ไม่สามารถสร้างโรงพยาบาลใหม่ได้
    }
    return true; // สามารถ READ, UPDATE, DELETE โรงพยาบาลของตัวเองได้
  }

  // ตรวจสอบจาก personnelType
  if (user.personnelType?.canManageHospitals) {
    return true;
  }

  return false;
}

function buildWhereClause(query: any, userRole: string, userHospitalId?: string) {
  let where: any = {};

  // Multi-tenant filtering
  if (userRole !== 'DEVELOPER') {
    where.id = userHospitalId;
  }

  // Search filter
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { nameEn: { contains: query.search, mode: 'insensitive' } },
      { hospitalCode: { contains: query.search, mode: 'insensitive' } },
      { address: { contains: query.search, mode: 'insensitive' } },
      { province: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  // Status filter
  if (query.status) {
    where.status = query.status;
  }

  // Type filter
  if (query.type) {
    where.type = query.type;
  }

  // Province filter
  if (query.province) {
    where.province = query.province;
  }

  return where;
}

// ===================================
// API HANDLERS
// ===================================

// GET /api/admin/hospitals
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบการเข้าสู่ระบบ
    const user = await getUserSession();
    
    // ตรวจสอบสิทธิ์
    if (!checkHospitalPermission(user, 'READ')) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึงข้อมูลโรงพยาบาล' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const query = QuerySchema.parse(queryParams);

    // Build where clause
    const where = buildWhereClause(query, user.role, user.hospitalId);

    // Build order by
    const orderBy = {
      [query.sortBy]: query.sortOrder
    };

    // Calculate pagination
    const skip = (query.page - 1) * query.limit;

    // Execute queries
    const [hospitals, totalCount] = await Promise.all([
      prisma.hospital.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: {
          _count: {
            select: {
              users: true,
              departments: true,
              warehouses: true,
              drugs: true,
              stockCards: true,
              requisitions: true,
              purchaseOrders: true,
            },
          },
        },
      }),
      prisma.hospital.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / query.limit);

    return NextResponse.json({
      success: true,
      data: hospitals,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalPages,
        totalCount,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    });

  } catch (error: any) {
    console.error('Hospital GET error:', error);
    
    if (error.message.includes('ไม่พบ') || error.message.includes('ไม่มี')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล' },
      { status: 500 }
    );
  }
}

// POST /api/admin/hospitals
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบการเข้าสู่ระบบ
    const user = await getUserSession();
    
    // ตรวจสอบสิทธิ์ - เฉพาะ DEVELOPER เท่านั้นที่สร้างโรงพยาบาลใหม่ได้
    if (!checkHospitalPermission(user, 'CREATE')) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์สร้างโรงพยาบาลใหม่' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = CreateHospitalSchema.parse(body);

    // ตรวจสอบว่ารหัสโรงพยาบาลซ้ำหรือไม่
    const existingHospital = await prisma.hospital.findUnique({
      where: { hospitalCode: validatedData.hospitalCode },
    });

    if (existingHospital) {
      return NextResponse.json(
        { error: 'รหัสโรงพยาบาลนี้มีอยู่แล้ว' },
        { status: 400 }
      );
    }

    // สร้างโรงพยาบาลใหม่
    const newHospital = await prisma.hospital.create({
      data: {
        ...validatedData,
        isTrialAccount: false,
      },
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            warehouses: true,
          },
        },
      },
    });

    // Log การสร้างโรงพยาบาล
    await prisma.auditLog.create({
      data: {
        hospitalId: newHospital.id,
        userId: user.id,
        action: 'CREATE',
        entityType: 'Hospital',
        entityId: newHospital.id,
        description: `สร้างโรงพยาบาลใหม่: ${newHospital.name}`,
        newValues: validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'สร้างโรงพยาบาลใหม่สำเร็จ',
      data: newHospital,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Hospital POST error:', error);

    // Fixed: Use ZodError properly
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'รหัสโรงพยาบาลนี้มีอยู่แล้ว' },
        { status: 400 }
      );
    }

    if (error.message.includes('ไม่มี')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างโรงพยาบาล' },
      { status: 500 }
    );
  }
}