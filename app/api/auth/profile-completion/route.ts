// ===== 1. app/api/auth/profile-completion/route.ts - Final Fix =====
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
      select: {
        id: true,
        hospitalId: true,
        status: true,
        email: true,
      }
    });
    
    if (!existingUser) {
      console.log('❌ [DEBUG] User not found:', userId);
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้ในระบบ" },
        { status: 404 }
      );
    }
    
    console.log('✅ [DEBUG] User found:', existingUser);
    
    // ตรวจสอบว่า department มีอยู่จริงในโรงพยาบาลเดียวกัน (ถ้าเลือก)
    let departmentId = null;
    if (validatedData.departmentId && validatedData.departmentId.trim() !== "") {
      const department = await prisma.department.findFirst({
        where: {
          id: validatedData.departmentId,
          hospitalId: existingUser.hospitalId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        }
      });
      
      if (department) {
        departmentId = department.id;
        console.log('✅ [DEBUG] Department found:', department);
      } else {
        console.log('⚠️ [DEBUG] Department not found, setting to null:', validatedData.departmentId);
        // ไม่ error แต่จะเซ็ต department เป็น null
        departmentId = null;
      }
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
        console.log('❌ [DEBUG] Employee ID already exists:', validatedData.employeeId);
        return NextResponse.json(
          { error: "รหัสพนักงานนี้มีอยู่ในระบบแล้ว" },
          { status: 400 }
        );
      }
    }
    
    // อัปเดตข้อมูลผู้ใช้ - Fixed all issues
    const updateData = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneNumber: validatedData.phoneNumber || null,
      employeeId: validatedData.employeeId,
      position: validatedData.position,
      departmentId: departmentId, // Use verified departmentId or null
      isProfileComplete: true,
      updatedAt: new Date(),
      // อัปเดต display name ด้วยชื่อจริง
      name: `${validatedData.firstName} ${validatedData.lastName}`,
    };
    
    console.log('🔄 [DEBUG] Updating user with data:', updateData);
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
            hospitalCode: true, // Fixed: use hospitalCode instead of code
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            departmentCode: true, // Fixed: use departmentCode instead of code
          }
        }
      },
    });
    
    console.log('✅ [DEBUG] Profile updated successfully for user:', updatedUser.id);
    
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
    console.error("❌ [API] Profile completion error:", error);
    
    if (error instanceof ZodError) {
      console.log('❌ [API] Validation error:', error.issues);
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
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('employeeId')) {
        return NextResponse.json(
          { error: "รหัสพนักงานนี้มีอยู่ในระบบแล้ว" },
          { status: 400 }
        );
      }
    }
    
    if (error.code === 'P2003') {
      const constraint = error.meta?.constraint;
      if (constraint?.includes('departmentId')) {
        return NextResponse.json(
          { error: "แผนกที่เลือกไม่ถูกต้อง กรุณาเลือกใหม่หรือไม่เลือกแผนก" },
          { status: 400 }
        );
      }
    }
    
    // Log Prisma errors for debugging
    if (error.code) {
      console.log('❌ [API] Prisma error code:', error.code);
      console.log('❌ [API] Prisma error meta:', error.meta);
    }
    
    return NextResponse.json(
      { 
        error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          meta: error.meta
        } : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}