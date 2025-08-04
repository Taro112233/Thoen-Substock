// app/api/hospitals/route.ts - แก้ไข query ให้ตรงกับ database
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [DEBUG] Hospitals API called");
    
    // ใช้ Prisma model แทน raw query
    const hospitals = await prisma.hospital.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        // code: true, // comment ออกถ้าไม่มี column นี้
        type: true,
        address: true,
        province: true,
        district: true,
        subDistrict: true,
        postalCode: true,
        phone: true,
        email: true,
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    
    console.log("🔍 [DEBUG] Found hospitals:", hospitals.length);
    
    return NextResponse.json(hospitals);
    
  } catch (error) {
    console.error("❌ [ERROR] Hospital API error:", error);
    
    return NextResponse.json(
      { 
        error: "เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล",
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}