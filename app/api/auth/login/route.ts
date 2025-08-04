// app/api/auth/login/route.ts - Updated Login API
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "@/lib/password-utils";
import { loginSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 [DEBUG] Login request:', {
      username: body.username,
      hospitalId: body.hospitalId,
      hasPassword: !!body.password
    });
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // หา user ด้วย username หรือ email
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { username: validatedData.username },
              { email: validatedData.username }
            ]
          },
          { hospitalId: validatedData.hospitalId }
        ]
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            hospitalCode: true,
            status: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            departmentCode: true
          }
        }
      }
    });
    
    console.log('🔍 [DEBUG] Found user:', user ? {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      hasPassword: !!user.password
    } : 'not found');
    
    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้ในระบบ หรือโรงพยาบาลไม่ถูกต้อง" },
        { status: 401 }
      );
    }
    
    // ตรวจสอบสถานะโรงพยาบาล
    if (user.hospital.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "โรงพยาบาลนี้ไม่สามารถใช้งานได้ในขณะนี้" },
        { status: 403 }
      );
    }
    
    // ตรวจสอบรหัสผ่าน
    if (!user.password) {
      return NextResponse.json(
        { error: "บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ" },
        { status: 401 }
      );
    }
    
    const isValidPassword = await verifyPassword(validatedData.password, user.password);
    if (!isValidPassword) {
      // Log failed login attempt
      await prisma.loginAttempt.create({
        data: {
          userId: user.id,
          email: user.email,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          success: false,
          failureReason: 'INVALID_PASSWORD'
        }
      });
      
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }
    
    // ตรวจสอบสถานะผู้ใช้
    if (user.status === "PENDING") {
      return NextResponse.json({
        success: false,
        error: "บัญชีของคุณรอการอนุมัติจากผู้ดูแลระบบ",
        needsApproval: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status
        }
      });
    }
    
    if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ" },
        { status: 403 }
      );
    }
    
    // ตรวจสอบ profile completion
    if (!user.isProfileComplete) {
      return NextResponse.json({
        success: true,
        message: "กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน",
        needsProfileCompletion: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status
        }
      });
    }
    
    // อัปเดตข้อมูลการเข้าสู่ระบบ
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIP: request.headers.get('x-forwarded-for') || 'unknown',
        loginCount: { increment: 1 }
      }
    });
    
    // Log successful login
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        email: user.email,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: true
      }
    });
    
    console.log('🔍 [DEBUG] Login successful for user:', user.id);
    
    return NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        isProfileComplete: user.isProfileComplete,
        hospital: user.hospital,
        department: user.department
      },
      needsApproval: false,
      needsProfileCompletion: false
    });
    
  } catch (error) {
    console.error("Login error:", error);
    
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
    
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}