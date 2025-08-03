// app/api/auth/login/route.ts - อัพเดทใช้ crypto
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "@/lib/password-utils"; // ใช้ crypto แทน bcrypt

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { username, password, hospitalId } = await request.json();
    
    if (!username || !password || !hospitalId) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }
    
    // หา user ด้วย email
    const user = await prisma.user.findUnique({
      where: { email: username },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้ในระบบ" },
        { status: 400 }
      );
    }
    
    // ถ้ามี password field ใน schema ให้ verify
    // const isValidPassword = await verifyPassword(password, user.password);
    // if (!isValidPassword) {
    //   return NextResponse.json(
    //     { error: "รหัสผ่านไม่ถูกต้อง" },
    //     { status: 400 }
    //   );
    // }
    
    return NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      needsApproval: true,
      needsProfileCompletion: true,
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}