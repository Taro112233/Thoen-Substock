// app/api/auth/register/route.ts - Fixed with correct imports and schema fields
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password-utils"; // Fixed import
import { ZodError } from "zod";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 [DEBUG] Registration request:', {
      ...body,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });

    // Validate input data
    const validatedData = registerSchema.parse(body);
    console.log('✅ [DEBUG] Input validation passed');

    // Check if username already exists
    const existingUsername = await prisma.user.findFirst({
      where: { username: validatedData.username },
      select: { id: true, username: true }
    });

    if (existingUsername) {
      console.log('❌ [DEBUG] Username already exists:', validatedData.username);
      return NextResponse.json(
        { error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findFirst({
      where: { email: validatedData.email },
      select: { id: true, email: true }
    });

    if (existingEmail) {
      console.log('❌ [DEBUG] Email already exists:', validatedData.email);
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // Verify hospital exists and is active - Fixed schema field names
    const hospital = await prisma.hospital.findUnique({
      where: { id: validatedData.hospitalId },
      select: {
        id: true,
        name: true,
        hospitalCode: true,
        status: true, // Fixed: use status instead of isActive
        type: true,
      }
    });

    if (!hospital || hospital.status !== 'ACTIVE') {
      console.log('❌ [DEBUG] Hospital not found or inactive:', validatedData.hospitalId);
      return NextResponse.json(
        { error: "โรงพยาบาลที่เลือกไม่พร้อมใช้งาน" },
        { status: 400 }
      );
    }

    console.log('✅ [DEBUG] Hospital validation passed:', hospital.name);

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    console.log('✅ [DEBUG] Password hashed successfully');

    // Create user with basic information only - Fixed field names
    const newUser = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword, // Fixed: use password instead of passwordHash
        hospitalId: validatedData.hospitalId,
        
        // Basic required fields
        name: validatedData.username, // Temporary name until profile completion
        role: 'STAFF_PHARMACIST', // Default role
        status: 'PENDING', // Will remain pending until profile completion and admin approval
        
        // Profile completion flags
        isProfileComplete: false,
        emailVerified: false,
        
        // Optional fields - will be filled in profile completion
        firstName: null,
        lastName: null,
        phoneNumber: null,
        employeeId: null,
        position: null,
        departmentId: null,
        
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        hospitalId: true,
        isProfileComplete: true,
        status: true,
        hospital: { // Fixed: include hospital relation
          select: {
            name: true,
            hospitalCode: true
          }
        }
      }
    });

    console.log('✅ [DEBUG] User created successfully:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      hospitalName: newUser.hospital.name,
      isProfileComplete: newUser.isProfileComplete,
      status: newUser.status
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลเบื้องต้นสำเร็จ",
      userId: newUser.id,
      nextStep: "profile-completion",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        hospitalId: newUser.hospitalId,
        hospitalName: newUser.hospital.name,
        hospitalCode: newUser.hospital.hospitalCode,
        isProfileComplete: newUser.isProfileComplete,
        status: newUser.status
      }
    });

  } catch (error) {
    console.error("❌ [DEBUG] Registration error:", error);

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

      if (targetField?.includes('username')) {
        message = "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว";
      } else if (targetField?.includes('email')) {
        message = "อีเมลนี้ถูกใช้งานแล้ว";
      } else if (targetField?.includes('employeeId')) {
        message = "รหัสพนักงานนี้ถูกใช้งานแล้ว";
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