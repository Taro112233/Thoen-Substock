// app/api/hospitals/route.ts - ใช้ชื่อ table ตรงๆ
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // ใช้ชื่อ table ตรงๆ แทนการใช้ model
    const result = await prisma.$queryRaw`
      SELECT id, name, code, type, address, province, district, 
             "subDistrict", "postalCode", phone, email, status
      FROM hospitals 
      WHERE status = 'ACTIVE' 
      ORDER BY name ASC
    `;
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Hospital API error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล" },
      { status: 500 }
    );
  }
}