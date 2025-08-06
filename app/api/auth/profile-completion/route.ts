// app/api/auth/profile-completion/route.ts - Fixed with correct error handling
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
    console.log('✅ [DEBUG] Profile data validation passed');
    
    // Check if user exists and get their current state
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        hospitalId: true,
        status: true,
        email: true,
        username: true,
        isProfileComplete: true,
        hospital: {
          select: {
            name: true,
            hospitalCode: true
          }
        }
      }
    });
    
    if (!existingUser) {
      console.log('❌ [DEBUG] User not found:', userId);
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้ในระบบ" },
        { status: 404 }
      );
    }
    
    console.log('✅ [DEBUG] User found:', {
      id: existingUser.id,
      username: existingUser.username,
      hospitalName: existingUser.hospital.name,
      isProfileComplete: existingUser.isProfileComplete
    });
    
    // Validate department if provided
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
          departmentCode: true
        }
      });
      
      if (!department) {
        console.log('❌ [DEBUG] Department not found or not active:', validatedData.departmentId);
        return NextResponse.json(
          { error: "แผนกที่เลือกไม่พร้อมใช้งานหรือไม่อยู่ในโรงพยาบาลเดียวกัน" },
          { status: 400 }
        );
      }
      
      departmentId = department.id;
      console.log('✅ [DEBUG] Department validated:', department.name);
    } else {
      console.log('ℹ️ [DEBUG] No department selected (optional field)');
    }
    
    // Check if employee ID already exists in the same hospital
    if (validatedData.employeeId) {
      const existingEmployeeId = await prisma.user.findFirst({
        where: {
          employeeId: validatedData.employeeId,
          hospitalId: existingUser.hospitalId,
          id: { not: userId }, // Exclude current user
        },
        select: { id: true, employeeId: true }
      });
      
      if (existingEmployeeId) {
        console.log('❌ [DEBUG] Employee ID already exists:', validatedData.employeeId);
        return NextResponse.json(
          { error: "รหัสพนักงานนี้ถูกใช้งานแล้วในโรงพยาบาลนี้" },
          { status: 400 }
        );
      }
    }
    
    // Update user with complete profile information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumber: validatedData.phoneNumber,
        employeeId: validatedData.employeeId,
        position: validatedData.position,
        departmentId: departmentId,
        
        // Update name with full name
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        
        // Mark profile as complete
        isProfileComplete: true,
        
        // Keep status as PENDING for admin approval
        // Admin will need to activate the account
        status: 'PENDING',
        
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        employeeId: true,
        position: true,
        isProfileComplete: true,
        status: true,
        hospital: {
          select: {
            name: true,
            hospitalCode: true
          }
        },
        department: {
          select: {
            name: true,
            departmentCode: true
          }
        }
      }
    });
    
    console.log('✅ [DEBUG] Profile completion successful:', {
      id: updatedUser.id,
      username: updatedUser.username,
      fullName: updatedUser.name,
      position: updatedUser.position,
      departmentName: updatedUser.department?.name || 'ไม่ระบุ',
      hospitalName: updatedUser.hospital.name,
      status: updatedUser.status,
      isProfileComplete: updatedUser.isProfileComplete
    });

    // Log successful registration for audit
    console.log('📊 [AUDIT] New user registration completed:', {
      userId: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      hospitalId: existingUser.hospitalId,
      hospitalName: updatedUser.hospital.name,
      fullName: updatedUser.name,
      position: updatedUser.position,
      employeeId: updatedUser.employeeId,
      departmentId: departmentId,
      departmentName: updatedUser.department?.name || 'ไม่ระบุ',
      timestamp: new Date().toISOString(),
      status: 'PENDING_APPROVAL'
    });
    
    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ! รอการอนุมัติจากผู้บริหาร",
      needsApproval: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.name,
        position: updatedUser.position,
        employeeId: updatedUser.employeeId,
        hospitalName: updatedUser.hospital.name,
        hospitalCode: updatedUser.hospital.hospitalCode,
        departmentName: updatedUser.department?.name || 'ไม่ระบุ',
        isProfileComplete: updatedUser.isProfileComplete,
        status: updatedUser.status
      }
    });

  } catch (error) {
    console.error("❌ [DEBUG] Profile completion error:", error);

    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map(err => ({ // Fixed: use issues instead of errors
        field: err.path.join('.'),
        message: err.message
      }));

      console.log('❌ [DEBUG] Validation errors:', fieldErrors);

      return NextResponse.json(
        { 
          error: "ข้อมูลที่กรอกไม่ถูกต้อง",
          details: fieldErrors
        },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint errors
    if ((error as any).code === 'P2002') { // Fixed: handle unknown error type
      const targetField = (error as any).meta?.target;
      let message = "ข้อมูลซ้ำในระบบ";

      if (targetField?.includes('employeeId')) {
        message = "รหัสพนักงานนี้ถูกใช้งานแล้วในโรงพยาบาลนี้";
      } else if (targetField?.includes('phoneNumber')) {
        message = "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว";
      }

      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}