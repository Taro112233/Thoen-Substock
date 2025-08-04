// app/api/admin/stats/route.ts
// API สำหรับสถิติของ Admin

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');

    if (!hospitalId) {
      return NextResponse.json(
        { error: 'Hospital ID is required' },
        { status: 400 }
      );
    }

    // นับสถิติต่างๆ
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      totalDepartments,
      todayRegistrations,
      // TODO: เพิ่มสถิติ inventory เมื่อมี schema พร้อม
    ] = await Promise.all([
      // ผู้ใช้ทั้งหมด (ไม่รวม DELETED)
      prisma.user.count({
        where: {
          hospitalId,
          status: { not: 'DELETED' }
        }
      }),
      
      // ผู้ใช้ที่ active
      prisma.user.count({
        where: {
          hospitalId,
          status: 'ACTIVE'
        }
      }),
      
      // ผู้ใช้ที่รอการอนุมัติ
      prisma.user.count({
        where: {
          hospitalId,
          status: 'PENDING'
        }
      }),
      
      // จำนวนแผนก
      prisma.department.count({
        where: { hospitalId }
      }),
      
      // การสมัครวันนี้
      prisma.user.count({
        where: {
          hospitalId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
    ]);

    // สถิติตามบทบาท
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      where: {
        hospitalId,
        status: { not: 'DELETED' }
      },
      _count: {
        role: true
      }
    });

    // สถิติการสมัครรายเดือน (6 เดือนล่าสุด)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        hospitalId,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        id: true
      }
    });

    // จัดกลุ่มข้อมูลรายเดือน
    const monthlyStats = monthlyRegistrations.reduce((acc: any, item) => {
      const month = new Date(item.createdAt).toLocaleString('th-TH', { 
        year: 'numeric', 
        month: 'short' 
      });
      acc[month] = (acc[month] || 0) + item._count.id;
      return acc;
    }, {});

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        pendingUsers,
        totalDepartments,
        todayRegistrations,
      },
      roleDistribution: roleStats.map(stat => ({
        role: stat.role,
        count: stat._count.role
      })),
      monthlyRegistrations: Object.entries(monthlyStats).map(([month, count]) => ({
        month,
        count
      }))
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}