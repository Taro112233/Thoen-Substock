// app/api/auth/register/route.ts - แก้ไข username field
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password-utils";
import { ZodError } from "zod";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 [DEBUG] Registration request body:', body);
    
    const validatedData = registerSchema.parse(body);
    console.log('🔍 [DEBUG] Validated data:', validatedData);
    
    // ตรวจสอบ email ซ้ำ
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }
    
    // ตรวจสอบ username ซ้ำ (เพิ่มการตรวจสอบนี้)
    const existingUsername = await prisma.user.findUnique({
      where: { username: validatedData.username },
    });
    
    if (existingUsername) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    console.log('🔍 [DEBUG] Password hashed successfully');
    
    // สร้าง user โดยใส่ field ที่จำเป็นครบถ้วน
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.username, // ใช้ username เป็น display name ชั่วคราว
        username: validatedData.username, // เพิ่ม field username ที่ required
        password: hashedPassword, // เพิ่ม password field
        emailVerified: false,
        role: "STAFF_PHARMACIST", // ใช้ Role ที่มีใน enum จริงแทน "User"
        status: "PENDING", // เพิ่ม status ตาม schema
        hospitalId: validatedData.hospitalId, // เพิ่ม hospitalId ที่ required
        isProfileComplete: false, // เพิ่ม field นี้
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log('🔍 [DEBUG] User created successfully:', user.id);
    
    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ",
      userId: user.id,
      nextStep: "profile-completion", // บอกว่าขั้นตอนต่อไปคือกรอกข้อมูลส่วนตัว
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    
    // ตรวจสอบ error ประเภทจาก Prisma
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
    
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}