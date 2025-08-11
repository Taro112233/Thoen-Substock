// app/api/auth/login/route.ts - Improved with better cookie handling
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from 'jose';
import { verifyPassword } from "@/lib/password-utils";
import { loginSchema } from "@/lib/validations/auth";

const prisma = new PrismaClient();

// JWT Secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 [DEBUG] Login request:', {
      identifier: body.identifier || body.username,
      hospitalId: body.hospitalId,
      hasPassword: !!body.password
    });
    
    // แปลงข้อมูลให้ตรงกับ validation schema
    const validationData = {
      username: body.identifier || body.username,
      password: body.password,
      hospitalId: body.hospitalId,
      rememberMe: body.rememberMe || false
    };
    
    // Validate input
    const validatedData = loginSchema.parse(validationData);
    
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
      return NextResponse.json(
        { error: "รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }
    
    // ตรวจสอบสถานะผู้ใช้
    if (user.status === "PENDING") {
      return NextResponse.json({
        success: true,
        message: "บัญชีของคุณรอการอนุมัติจากผู้ดูแลระบบ",
        needsApproval: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          hospitalId: user.hospitalId,
          hospital: user.hospital
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
          status: user.status,
          hospitalId: user.hospitalId,
          hospital: user.hospital
        }
      });
    }
    
    // สร้าง JWT Token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      hospitalId: user.hospitalId,
      departmentId: user.departmentId,
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(validatedData.rememberMe ? '30d' : '7d')
    .setIssuedAt()
    .sign(JWT_SECRET);

    console.log('🔍 [DEBUG] JWT Token created:', token.substring(0, 50) + '...');
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: user.id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        hospitalId: user.hospitalId,
        departmentId: user.departmentId,
        phoneNumber: user.phoneNumber,
        employeeId: user.employeeId,
        position: user.position,
        isProfileComplete: user.isProfileComplete,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        hospital: {
          id: user.hospital.id,
          name: user.hospital.name,
          code: user.hospital.hospitalCode || ''
        },
        department: user.department ? {
          id: user.department.id,
          name: user.department.name,
          code: user.department.departmentCode || ''
        } : undefined
      },
      // ✨ เพิ่ม delay hint สำหรับ client
      redirectDelay: 1000 // milliseconds
    });

    // Set cookie with proper options
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: validatedData.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7, // 30 days or 7 days
      path: '/',
    });

    console.log('🔍 [DEBUG] Login successful for user:', user.id);
    console.log('🔍 [DEBUG] Cookie set successfully');

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 }
    );
  }
}