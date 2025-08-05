// app/api/admin/users/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [PENDING API] Starting validation...');
    
    // ตรวจสอบสิทธิ์ admin
    const authResult = await validateAdminAuth(request);
    
    console.log('🔍 [PENDING API] Auth result:', authResult);
    
    if ('error' in authResult) {
      console.log('❌ [PENDING API] Auth failed:', authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { hospitalId } = authResult;
    
    console.log('🔍 [PENDING API] Hospital ID:', hospitalId);

    // ดึงรายการผู้ใช้ที่รอการอนุมัติ
    const pendingUsers = await prisma.user.findMany({
      where: {
        hospitalId,
        status: 'PENDING'
      },
      include: {
        hospital: {
          select: { name: true, hospitalCode: true }
        },
        department: {
          select: { name: true, departmentCode: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log('🔍 [PENDING API] Found pending users:', pendingUsers.length);

    // ซ่อน password และข้อมูลที่ไม่จำเป็น
    const sanitizedUsers = pendingUsers.map(user => {
      const { password, updatedAt, lastModifiedBy, ...safeUser } = user;
      return safeUser;
    });

    // คำนวณสถิติเพิ่มเติม
    const stats = {
      pending: pendingUsers.length,
      oldestRequest: pendingUsers.length > 0 ? pendingUsers[0].createdAt : null,
      departmentBreakdown: pendingUsers.reduce((acc, user) => {
        const deptName = user.department?.name || 'ไม่ระบุแผนก';
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    console.log('✅ [PENDING API] Returning data:', {
      count: sanitizedUsers.length,
      stats
    });

    return NextResponse.json({
      users: sanitizedUsers,
      count: pendingUsers.length,
      stats
    });

  } catch (error) {
    console.error('❌ [PENDING API] Error fetching pending users:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}