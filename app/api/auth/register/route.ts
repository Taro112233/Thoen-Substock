// app/api/auth/register/route.ts - Fixed Schema Fields
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password-utils";
import { ZodError } from "zod";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 [API] Registration request received:', {
      ...body,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });
    
    // Validate input data
    const validatedData = registerSchema.parse(body);
    console.log('✅ [API] Data validation passed');
    
    // Check for existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      console.log('❌ [API] Email already exists');
      return NextResponse.json(
        { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }
    
    // Check for existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });
    
    if (existingUsername) {
      console.log('❌ [API] Username already exists');
      return NextResponse.json(
        { error: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }
    
    // Verify hospital exists - Fixed field name
    const hospital = await prisma.hospital.findUnique({
      where: { id: validatedData.hospitalId },
      select: {
        id: true,
        name: true,
        hospitalCode: true, // Fixed: use hospitalCode instead of code
        status: true,
      }
    });
    
    if (!hospital) {
      console.log('❌ [API] Hospital not found');
      return NextResponse.json(
        { error: "โรงพยาบาลที่เลือกไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    
    // Check if hospital is active
    if (hospital.status !== 'ACTIVE') {
      console.log('❌ [API] Hospital not active:', hospital.status);
      return NextResponse.json(
        { error: "โรงพยาบาลนี้ไม่สามารถใช้งานได้ในขณะนี้" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    console.log('🔐 [API] Password hashed successfully');
    
    // Create user - Fixed select fields
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.username, // Temporary display name
        username: validatedData.username,
        password: hashedPassword,
        emailVerified: false,
        role: "STAFF_PHARMACIST", // Default role
        status: "PENDING", // Requires approval
        hospitalId: validatedData.hospitalId,
        isProfileComplete: false, // Need to complete profile
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        hospital: {
          select: {
            id: true,
            name: true,
            hospitalCode: true, // Fixed: use hospitalCode instead of code
            status: true,
          }
        }
      }
    });
    
    console.log('✅ [API] User created successfully:', {
      id: user.id,
      email: user.email,
      username: user.username,
      status: user.status,
      hospital: user.hospital.name
    });
    
    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ",
      userId: user.id,
      nextStep: "profile-completion",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        hospital: {
          id: user.hospital.id,
          name: user.hospital.name,
          hospitalCode: user.hospital.hospitalCode, // Fixed field name
          status: user.hospital.status,
        }
      }
    });
    
  } catch (error) {
    console.error("❌ [API] Registration error:", error);
    
    // Handle Zod validation errors
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
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('email')) {
        return NextResponse.json(
          { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
          { status: 400 }
        );
      }
      if (target?.includes('username')) {
        return NextResponse.json(
          { error: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" },
          { status: 400 }
        );
      }
    }
    
    // Handle other Prisma errors
    if (error.code) {
      console.log('❌ [API] Prisma error code:', error.code);
      console.log('❌ [API] Prisma error meta:', error.meta);
    }
    
    return NextResponse.json(
      { 
        error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}