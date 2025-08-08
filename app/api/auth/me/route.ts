// app/api/auth/me/route.ts
// API สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

async function getAuthenticatedUser(request: NextRequest) {
  try {
    // ลองดูจาก headers ก่อน (ถ้า middleware ใส่ให้แล้ว)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const hospitalId = request.headers.get('x-hospital-id');

    if (userId && userRole && hospitalId) {
      // ดึงข้อมูลล่าสุดจากฐานข้อมูล
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          hospital: {
            select: { id: true, name: true, hospitalCode: true } // Fixed: use hospitalCode instead of code
          },
          department: {
            select: { id: true, name: true, departmentCode: true } // Fixed: use departmentCode instead of code
          }
        }
      });
      return user;
    }

    // ถ้าไม่มีใน headers ให้ตรวจสอบจาก token
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const tokenUser = payload as any;

    // ดึงข้อมูลล่าสุดจากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.id },
      include: {
        hospital: {
          select: { id: true, name: true, hospitalCode: true } // Fixed: use hospitalCode instead of code
        },
        department: {
          select: { id: true, name: true, departmentCode: true } // Fixed: use departmentCode instead of code
        }
      }
    });

    return user;
    
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต' },
        { status: 401 }
      );
    }

    // ซ่อน password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}