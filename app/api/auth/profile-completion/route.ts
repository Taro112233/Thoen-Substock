// app/api/auth/profile-completion/route.ts - Profile Completion API
import { NextRequest, NextResponse } from "next/server";
import { profileCompletionSchema } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 [DEBUG] Profile completion request:', {
      ...body,
      userId: body.userId || 'missing'
    });
    
    const { userId, ...profileData } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: "ไม่พบรหัสผู้ใช้" },
        { status: 400 }
      );
    }
    
    // Validate profile data
    const validatedData = profileCompletionSchema.parse(profileData);
    console.log('🔍 [DEBUG] Validated profile data:', validatedData);
    
    // ตรวจสอบว่า user มีอยู่จริง
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้ในระบบ" },
        { status: 404 }
      );
    }
    
    // ตรวจสอบว่า employeeId ซ้ำหรือไม่ (ถ้ามี)
    if (validatedData.employeeId) {
      const existingEmployee = await prisma.user.findFirst({
        where: {
          employeeId: validatedData.employeeId,
          hospitalId: existingUser.hospitalId,
          id: { not: userId }, // ยกเว้นตัวเอง
        },
      });
      
      if (existingEmployee) {
        return NextResponse.json(
          { error: "รหัสพนักงานนี้มีอยู่ในระบบแล้ว" },
          { status: 400 }
        );
      }
    }
    
    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumber: validatedData.phoneNumber || null,
        employeeId: validatedData.employeeId,
        position: validatedData.position,
        departmentId: validatedData.departmentId || null,
        isProfileComplete: true,
        updatedAt: new Date(),
        // อัปเดต display name ด้วยชื่อจริง
        name: `${validatedData.firstName} ${validatedData.lastName}`,
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        position: true,
        isProfileComplete: true,
        status: true,
        role: true,
        hospital: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      },
    });
    
    console.log('🔍 [DEBUG] Profile updated successfully for user:', updatedUser.id);
    
    // TODO: ส่งอีเมลแจ้งผู้ดูแลระบบเพื่ออนุมัติ
    // await sendAdminNotificationEmail(updatedUser);
    
    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลส่วนตัวสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        employeeId: updatedUser.employeeId,
        position: updatedUser.position,
        status: updatedUser.status,
        role: updatedUser.role,
        isProfileComplete: updatedUser.isProfileComplete,
        hospital: updatedUser.hospital,
        department: updatedUser.department,
      },
      needsApproval: updatedUser.status === "PENDING",
    });
    
  } catch (error) {
    console.error("Profile completion error:", error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: "ข้อมูลไม่ถูกต้อง", 
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }
    
    // Prisma unique constraint error
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('employeeId')) {
        return NextResponse.json(
          { error: "รหัสพนักงานนี้มีอยู่ในระบบแล้ว" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}