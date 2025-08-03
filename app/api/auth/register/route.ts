// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/app/utils/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    
    // ตรวจสอบว่า username และ email ซ้ำหรือไม่
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validatedData.username },
          { email: validatedData.email },
        ],
      },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }
    
    // สร้างผู้ใช้ใหม่ผ่าน Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.username, // temporary name
      },
    });
    
    if (!result.user) {
      return NextResponse.json(
        { error: "เกิดข้อผิดพลาดในการสร้างบัญชี" },
        { status: 500 }
      );
    }
    
    // อัพเดทผู้ใช้ด้วย username
    await prisma.user.update({
      where: { id: result.user.id },
      data: {
        username: validatedData.username,
        isProfileComplete: false,
        status: "PENDING",
        role: "STAFF_NURSE", // default role
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ กรุณากรอกข้อมูลส่วนตัว",
      userId: result.user.id,
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}