// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { auth } from "@/app/utils/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    
    // ตรวจสอบว่าผู้ใช้อยู่ในโรงพยาบาลที่เลือกหรือไม่
    const user = await prisma.user.findFirst({
      where: {
        username: validatedData.username,
        hospitalId: validatedData.hospitalId,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้ในหน่วยงานที่เลือก" },
        { status: 400 }
      );
    }
    
    // เข้าสู่ระบบผ่าน Better Auth
    const result = await auth.api.signInEmail({
      body: {
        email: user.email,
        password: validatedData.password,
      },
    });
    
    if (!result.user) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 400 }
      );
    }
    
    // อัปเดตข้อมูลการเข้าสู่ระบบ
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: result.user,
      needsApproval: user.status === "PENDING",
      needsProfileCompletion: !user.isProfileComplete,
    });
    
  } catch (error) {
    console.error("Login error:", error);
    
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