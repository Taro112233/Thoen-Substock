// app/api/admin/users/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { validateAdminAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

const approveUserSchema = z.object({
  userId: z.string().uuid('รหัสผู้ใช้ไม่ถูกต้อง'),
  action: z.enum(['approve', 'reject'], {
    message: 'การดำเนินการต้องเป็น approve หรือ reject'
  }),
  reason: z.string().optional(),
  assignRole: z.enum([
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER', 
    'SENIOR_PHARMACIST', 
    'STAFF_PHARMACIST',
    'DEPARTMENT_HEAD', 
    'STAFF_NURSE', 
    'PHARMACY_TECHNICIAN'
  ]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [APPROVE API] Starting approval process...');
    
    // ตรวจสอบสิทธิ์ admin
    const authResult = await validateAdminAuth(request);
    
    if ('error' in authResult) {
      console.log('❌ [APPROVE API] Auth failed:', authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user: adminUser, hospitalId } = authResult;
    
    console.log('🔍 [APPROVE API] Admin user:', adminUser.userId, 'Hospital:', hospitalId);
    
    // Validate request body
    const body = await request.json();
    const validatedData = approveUserSchema.parse(body);
    const { userId, action, reason, assignRole } = validatedData;

    console.log('🔍 [APPROVE API] Request:', { userId, action, assignRole });

    // ตรวจสอบว่าผู้ใช้มีอยู่และอยู่ในโรงพยาบาลเดียวกัน
    const targetUser = await prisma.user.findFirst({
      where: { 
        id: userId,
        hospitalId
      },
      include: {
        hospital: { select: { name: true, hospitalCode: true } },
        department: { select: { name: true, departmentCode: true } }
      }
    });

    if (!targetUser) {
      console.log('❌ [APPROVE API] Target user not found');
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้หรือไม่มีสิทธิ์เข้าถึง' },
        { status: 404 }
      );
    }

    if (targetUser.status !== 'PENDING') {
      console.log('❌ [APPROVE API] Invalid status:', targetUser.status);
      return NextResponse.json(
        { error: `ผู้ใช้นี้อยู่ในสถานะ "${targetUser.status}" ไม่สามารถอนุมัติได้` },
        { status: 400 }
      );
    }

    // ดำเนินการตามการเลือก
    let newStatus: 'ACTIVE' | 'DELETED';
    let message: string;
    let updateData: any = {
      lastModifiedBy: adminUser.userId,
      updatedAt: new Date(),
      statusChangedAt: new Date()
    };

    if (action === 'approve') {
      newStatus = 'ACTIVE';
      message = `อนุมัติผู้ใช้ ${targetUser.name} สำเร็จ`;
      
      updateData.status = newStatus;
      updateData.approvedAt = new Date();
      updateData.approvedBy = adminUser.userId;
      
      if (assignRole) {
        updateData.role = assignRole;
      }
      
    } else {
      newStatus = 'DELETED';
      message = `ปฏิเสธผู้ใช้ ${targetUser.name} สำเร็จ`;
      
      updateData.status = newStatus;
      updateData.rejectedAt = new Date();
      updateData.rejectedBy = adminUser.userId;
      updateData.rejectionReason = reason || 'ไม่ระบุเหตุผล';
    }

    console.log('🔍 [APPROVE API] Update data:', updateData);

    // อัปเดตในฐานข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        hospital: { select: { name: true, hospitalCode: true } },
        department: { select: { name: true, departmentCode: true } }
      }
    });

    // ลบ password ออกจาก response
    const { password, ...userWithoutPassword } = updatedUser;

    console.log('✅ [APPROVE API] Success:', message);

    return NextResponse.json({
      success: true,
      message,
      user: userWithoutPassword,
      action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [APPROVE API] Error in user approval:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: error.issues.map((e: any) => e.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดำเนินการ' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}