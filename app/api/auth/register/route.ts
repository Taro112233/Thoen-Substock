// app/api/auth/register/route.ts - Quick Fix
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password-utils";
import { ZodError } from "zod";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    
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
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // สร้าง user โดยใส่ field ที่จำเป็น
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.username,
        emailVerified: false,
        role: "User", // ใช้ Role ที่มีใน enum จริง
        createdAt: new Date(), // เพิ่ม required fields
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ กรุณากรอกข้อมูลส่วนตัว",
      userId: user.id,
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: "ข้อมูลไม่ถูกต้อง", 
          details: JSON.stringify(error.issues) // ใช้ issues แทน errors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}