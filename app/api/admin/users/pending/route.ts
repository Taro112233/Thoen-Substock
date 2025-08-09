// app/api/admin/users/pending/route.ts
// API สำหรับดึงรายชื่อผู้ใช้ที่รอการอนุมัติ (Working Version)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
async function verifyToken(token: string): Promise<any> {
  try {
    const secret = process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Helper function to get current user from cookies/headers
async function getCurrentUser(request: NextRequest) {
  try {
    // Method 1: Check Better Auth session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('better-auth.session_token') || 
                         cookieStore.get('auth.session_token') ||
                         cookieStore.get('session');
    
    if (sessionCookie?.value) {
      console.log('🔍 [API] Found session cookie');
      
      // Try to find session in database
      const session = await prisma.session.findFirst({
        where: {
          sessionToken: sessionCookie.value,
          expires: {
            gt: new Date()
          }
        },
        include: {
          user: true
        }
      });
      
      if (session?.user) {
        console.log('🔍 [API] Found user from session:', session.user.id);
        return session.user;
      }
    }
    
    // Method 2: Check Authorization header (Bearer token)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🔍 [API] Found Bearer token');
      
      const decoded = await verifyToken(token);
      if (decoded?.id || decoded?.userId) {
        const userId = decoded.id || decoded.userId;
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (user) {
          console.log('🔍 [API] Found user from token:', user.id);
          return user;
        }
      }
    }
    
    // Method 3: Check custom auth cookie (จากระบบ login ที่มีอยู่)
    const authCookie = cookieStore.get('auth-token');
    if (authCookie?.value) {
      console.log('🔍 [API] Found custom auth cookie');
      
      const decoded = await verifyToken(authCookie.value);
      if (decoded?.id || decoded?.userId) {
        const userId = decoded.id || decoded.userId;
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (user) {
          console.log('🔍 [API] Found user from custom token:', user.id);
          return user;
        }
      }
    }
    
    // Method 4: Check if there's any active session for debugging
    const allCookies = cookieStore.getAll();
    console.log('🔍 [API] All cookies:', allCookies.map(c => c.name));
    
    return null;
  } catch (error) {
    console.error('❌ [API] Error getting current user:', error);
    return null;
  }
}

// ตรวจสอบสิทธิ์การเข้าถึง
async function checkAdminAccess(user: any) {
  // อนุญาตเฉพาะ Admin และผู้มีสิทธิ์อนุมัติผู้ใช้
  const allowedRoles = [
    'DEVELOPER',
    'HOSPITAL_ADMIN',
    'PHARMACY_MANAGER',
    'DIRECTOR'
  ];

  const hasRoleAccess = user?.status === 'ACTIVE' && 
                        allowedRoles.includes(user.role);
  
  // Check personnel type permissions if exists
  if (user?.personnelTypeId) {
    const personnelType = await prisma.personnelType.findUnique({
      where: { id: user.personnelTypeId },
      select: { canApproveUsers: true }
    });
    
    if (personnelType?.canApproveUsers) {
      return true;
    }
  }

  return hasRoleAccess;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] GET /api/admin/users/pending - Starting');
    
    // Get current user
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      console.log('❌ [API] No user found from session/token');
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    console.log('🔍 [API] Current user:', {
      id: currentUser.id,
      role: currentUser.role,
      status: currentUser.status
    });

    // ตรวจสอบสิทธิ์
    const hasAccess = await checkAdminAccess(currentUser);
    console.log('🔍 [API] Admin access:', hasAccess);

    if (!hasAccess) {
      console.log('❌ [API] Access denied for user:', currentUser.id);
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้' },
        { status: 403 }
      );
    }

    // ตรวจสอบ hospital ID
    if (!currentUser.hospitalId) {
      console.log('❌ [API] No hospital ID found for user');
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลโรงพยาบาล' },
        { status: 400 }
      );
    }

    console.log('🔍 [API] Fetching pending users for hospital:', currentUser.hospitalId);

    // ดึงข้อมูลผู้ใช้ที่รอการอนุมัติ
    const pendingUsers = await prisma.user.findMany({
      where: {
        hospitalId: currentUser.hospitalId,
        status: 'PENDING',
        approvedAt: null,
        rejectedAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        phoneNumber: true,
        position: true,
        createdAt: true,
        department: {
          select: {
            name: true,
            departmentCode: true
          }
        },
        hospital: {
          select: {
            name: true,
            hospitalCode: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // เรียงตามวันที่สมัคร (เก่าสุดขึ้นก่อน)
      }
    });

    console.log(`🔍 [API] Found ${pendingUsers.length} pending users`);

    // คำนวณสถิติ
    const stats = {
      pending: pendingUsers.length,
      oldestRequest: pendingUsers.length > 0 
        ? pendingUsers[0].createdAt.toISOString() 
        : null,
      departmentBreakdown: {} as Record<string, number>
    };

    // นับจำนวนตามแผนก
    pendingUsers.forEach(user => {
      const deptName = user.department?.name || 'ไม่ระบุแผนก';
      stats.departmentBreakdown[deptName] = 
        (stats.departmentBreakdown[deptName] || 0) + 1;
    });

    console.log('✅ [API] Successfully fetched pending users');

    return NextResponse.json({
      users: pendingUsers,
      count: pendingUsers.length,
      stats
    });

  } catch (error) {
    console.error('❌ [API] Error fetching pending users:', error);
    return NextResponse.json(
      { 
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}