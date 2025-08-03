// app/api/departments/route.ts - ใช้ query ตรงๆ
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get("hospitalId");
    
    if (!hospitalId) {
      return NextResponse.json(
        { error: "กรุณาระบุ hospitalId" },
        { status: 400 }
      );
    }
    
    const result = await prisma.$queryRaw`
      SELECT id, name, code, type, description, location, phone, email
      FROM departments 
      WHERE "hospitalId" = ${hospitalId} AND "isActive" = true
      ORDER BY name ASC
    `;
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Department API error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลแผนก" },
      { status: 500 }
    );
  }
}