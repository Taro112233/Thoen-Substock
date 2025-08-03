// app/api/auth/complete-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { profileSchema } from "@/lib/validations/auth";
import { getCurrentUser } from "@/lib/auth-utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลผู้ใช้" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = profileSchema.parse(body);
    
    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        phoneNumber: validatedData.phoneNumber,
        position: validatedData.position,
        hospitalId: validatedData.hospitalId,
        departmentId: validatedData.departmentId || null,
        isProfileComplete: true,
        role: getRoleFromPosition(validatedData.position),
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ",
      user: updatedUser,
    });
    
  } catch (error) {
    console.error("Profile completion error:", error);
    
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

function getRoleFromPosition(position: string): string {
  const positionRoleMap: Record<string, string> = {
    PHARMACIST: "STAFF_PHARMACIST",
    NURSE: "STAFF_NURSE",
    TECHNICIAN: "PHARMACY_TECHNICIAN",
    MANAGER: "PHARMACY_MANAGER",
    HEAD: "DEPARTMENT_HEAD",
    ADMIN: "HOSPITAL_ADMIN",
  };
  
  return positionRoleMap[position] || "STAFF_NURSE";
}