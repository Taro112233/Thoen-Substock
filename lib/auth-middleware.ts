// lib/auth-middleware.ts - Updated Version
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

interface JWTPayload {
  id: string;
  username?: string;
  email?: string;
  hospitalId?: string;
  role?: string;
  exp: number;
}

export async function validateUserAuth(request: NextRequest) {
  let prisma: PrismaClient | null = null;
  
  try {
    // ดึง JWT token จาก cookie - ลองหลายชื่อที่เป็นไปได้
    let token = request.cookies.get('auth-token')?.value || 
                request.cookies.get('auth_token')?.value || 
                request.cookies.get('token')?.value ||      
                request.cookies.get('authToken')?.value;    
    
    // ลองดูจาก Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    console.log('🔍 [AUTH] Available cookies:', 
      Array.from(request.cookies.getAll()).map(c => c.name)
    );
    console.log('🔍 [AUTH] Token found:', !!token);
    
    if (!token) {
      return {
        user: null,
        error: 'ไม่พบ token การเข้าสู่ระบบ',
        status: 401
      };
    }

    // ตรวจสอบ JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userData = payload as unknown as JWTPayload;

    console.log('🔍 [AUTH] JWT Payload:', {
      id: userData.id,
      email: userData.email,
      hasHospitalId: !!userData.hospitalId,
      hasRole: !!userData.role
    });

    // สร้าง Prisma client
    prisma = new PrismaClient();

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูลเสมอ
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
      select: { 
        id: true, 
        hospitalId: true, 
        role: true, 
        status: true,
        name: true,
        email: true
      }
    });

    console.log('🔍 [AUTH] User from DB:', user);

    if (!user) {
      return {
        user: null,
        error: 'ไม่พบข้อมูลผู้ใช้',
        status: 404
      };
    }

    if (user.status !== 'ACTIVE') {
      console.log('🔍 [AUTH] User status:', user.status);
      return {
        user: null,
        error: 'บัญชีผู้ใช้ไม่ได้เปิดใช้งาน',
        status: 403
      };
    }

    console.log('✅ [AUTH] User validation successful for user:', user.email);

    return {
      user: {
        userId: user.id,
        hospitalId: user.hospitalId,
        role: user.role
      },
      hospitalId: user.hospitalId
    };

  } catch (error) {
    console.error('❌ [AUTH] Auth validation error:', error);
    return {
      user: null,
      error: 'Token ไม่ถูกต้องหรือหมดอายุ',
      status: 401
    };
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function validateAdminAuth(request: NextRequest) {
  const authResult = await validateUserAuth(request);
  
  if (!authResult.user) {
    return authResult;
  }

  const user = authResult.user;
  
  // Check if user has admin privileges (ไม่จำกัดสิทธิ์แล้ว)
  // const adminRoles = ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER'];
  // if (!adminRoles.includes(user.role)) {
  //   return {
  //     user: null,
  //     error: 'ไม่มีสิทธิ์ผู้ดูแลระบบ',
  //     status: 403
  //   };
  // }

  return {
    user,
    hospitalId: user.hospitalId
  };
}