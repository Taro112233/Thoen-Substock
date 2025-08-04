// app/api/admin/users/approve/route.ts
// API สำหรับอนุมัติผู้ใช้

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const approveUserSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(), // เหตุผลในการปฏิเสธ
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, reason } = approveUserSchema.parse(body);

    // ตรวจสอบว่าผู้ใช้มีอยู่และอยู่ในสถานะ PENDING หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        hospital: { select: { name: true } },
        department: { select: { name: true } }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้นี้' },
        { status: 404 }
      );
    }

    if (user.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'ผู้ใช้นี้ไม่ได้อยู่ในสถานะรอการอนุมัติ' },
        { status: 400 }
      );
    }

    let newStatus: 'ACTIVE' | 'DELETED';
    let message: string;

    if (action === 'approve') {
      newStatus = 'ACTIVE';
      message = 'อนุมัติผู้ใช้สำเร็จ';
    } else {
      newStatus = 'DELETED'; // ปฏิเสธแล้วลบ
      message = 'ปฏิเสธผู้ใช้สำเร็จ';
    }

    // อัปเดตสถานะ
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: newStatus,
        lastModifiedBy: 'admin', // TODO: ใส่ user ID ของ admin ที่อนุมัติ
        // TODO: เพิ่มฟิลด์สำหรับเก็บเหตุผลการปฏิเสธ
      },
      include: {
        hospital: { select: { name: true } },
        department: { select: { name: true } }
      }
    });

    // ซ่อน password
    const { password, ...userWithoutPassword } = updatedUser;

    // TODO: ส่งอีเมลแจ้งผลการอนุมัติ/ปฏิเสธ

    return NextResponse.json({
      message,
      user: userWithoutPassword
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error approving user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}