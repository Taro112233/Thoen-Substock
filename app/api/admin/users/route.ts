// app/api/admin/users/route.ts
// API สำหรับจัดการผู้ใช้งานสำหรับ Admin

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema สำหรับ validation
const updateUserSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  role: z.enum([
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER', 
    'SENIOR_PHARMACIST', 
    'STAFF_PHARMACIST',
    'DEPARTMENT_HEAD', 
    'STAFF_NURSE', 
    'PHARMACY_TECHNICIAN'
  ]).optional(),
  departmentId: z.string().uuid().optional().nullable(),
});

// GET: ดึงรายการผู้ใช้ทั้งหมดตาม hospital
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!hospitalId) {
      return NextResponse.json(
        { error: 'Hospital ID is required' }, 
        { status: 400 }
      );
    }

    // สร้าง where clause
    const whereClause: any = {
      hospitalId,
      ...(status && { status }),
      ...(role && { role }),
    };

    // นับจำนวนรวม
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    // ดึงข้อมูลผู้ใช้
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        hospital: {
          select: { name: true, hospitalCode: true }
        },
        department: {
          select: { name: true, departmentCode: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // ซ่อนข้อมูลที่ sensitive
    const sanitizedUsers = users.map(user => ({
      ...user,
      password: undefined, // ไม่ส่ง password กลับไป
    }));

    return NextResponse.json({
      users: sanitizedUsers,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST: สร้างผู้ใช้ใหม่ (สำหรับ Admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const createUserSchema = z.object({
      email: z.string().email(),
      name: z.string().min(1),
      username: z.string().min(3),
      password: z.string().min(6),
      role: z.enum([
        'HOSPITAL_ADMIN', 
        'PHARMACY_MANAGER', 
        'SENIOR_PHARMACIST', 
        'STAFF_PHARMACIST',
        'DEPARTMENT_HEAD', 
        'STAFF_NURSE', 
        'PHARMACY_TECHNICIAN'
      ]),
      hospitalId: z.string().uuid(),
      departmentId: z.string().uuid().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phoneNumber: z.string().optional(),
      employeeId: z.string().optional(),
      position: z.string().optional(),
      status: z.enum(['PENDING', 'ACTIVE']).default('ACTIVE'),
    });

    const validatedData = createUserSchema.parse(body);

    // ตรวจสอบว่า email และ username ซ้ำหรือไม่
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email หรือ Username นี้มีผู้ใช้แล้ว' }, 
        { status: 409 }
      );
    }

    // Hash password using Node.js crypto
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(validatedData.password, salt, 10000, 64, 'sha256').toString('hex');
    const passwordHash = `${salt}:${hashedPassword}`;

    // สร้างผู้ใช้ใหม่
    const newUser = await prisma.user.create({
      data: {
        ...validatedData,
        password: passwordHash,
        isProfileComplete: true, // Admin สร้างแล้วถือว่าครบ
        emailVerified: true, // Admin สร้างแล้วถือว่า verified
      },
      include: {
        hospital: {
          select: { name: true, hospitalCode: true }
        },
        department: {
          select: { name: true, departmentCode: true }
        }
      }
    });

    // ซ่อน password
    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'สร้างผู้ใช้สำเร็จ',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues }, 
        { status: 400 }
      );
    }

    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PUT: อัปเดตข้อมูลผู้ใช้
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const { userId, ...updateData } = validatedData;

    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้นี้' }, 
        { status: 404 }
      );
    }

    // อัปเดตข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        lastModifiedBy: 'admin', // TODO: ใส่ user ID ของ admin ที่แก้ไข
      },
      include: {
        hospital: {
          select: { name: true, hospitalCode: true }
        },
        department: {
          select: { name: true, departmentCode: true }
        }
      }
    });

    // ซ่อน password
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
      user: userWithoutPassword
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues }, 
        { status: 400 }
      );
    }

    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// DELETE: ลบผู้ใช้ (Soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้นี้' }, 
        { status: 404 }
      );
    }

    // Soft delete โดยเปลี่ยน status เป็น DELETED
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
        lastModifiedBy: 'admin', // TODO: ใส่ user ID ของ admin ที่ลบ
      }
    });

    return NextResponse.json({
      message: 'ลบผู้ใช้สำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}