// app/api/admin/users/pending/route.ts
// API สำหรับดึงรายการผู้ใช้ที่รอการอนุมัติ

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

    const pendingUsers = await prisma.user.findMany({
      where: {
        hospitalId,
        status: 'PENDING'
      },
      include: {
        hospital: {
          select: { name: true, code: true }
        },
        department: {
          select: { name: true, code: true }
        }
      },
      orderBy: { createdAt: 'asc' } // เก่าสุดก่อน
    });

    // ซ่อน password
    const sanitizedUsers = pendingUsers.map(user => ({
      ...user,
      password: undefined,
    }));

    return NextResponse.json({
      users: sanitizedUsers,
      count: pendingUsers.length
    });

  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}