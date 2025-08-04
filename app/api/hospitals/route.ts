// app/api/hospitals/route.ts - Fixed Hospitals API
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [DEBUG] Hospitals API called");
    
    // Query hospitals with correct field names
    const hospitals = await prisma.hospital.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        hospitalCode: true, // ใช้ hospitalCode แทน code
        type: true,
        address: true,
        province: true,
        district: true,
        subDistrict: true,
        postalCode: true,
        phone: true,
        email: true,
        status: true,
        bedCount: true,
        nameEn: true,
        subscriptionPlan: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    
    console.log("🔍 [DEBUG] Found hospitals:", hospitals.length);
    console.log("🔍 [DEBUG] Hospital data:", hospitals.map(h => ({ 
      id: h.id, 
      name: h.name, 
      code: h.hospitalCode 
    })));
    
    // Transform data to match frontend expectations
    const hospitalsResponse = {
      success: true,
      hospitals: hospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name,
        code: hospital.hospitalCode, // Map hospitalCode to code for frontend
        nameEn: hospital.nameEn,
        type: hospital.type,
        address: hospital.address,
        province: hospital.province,
        district: hospital.district,
        subDistrict: hospital.subDistrict,
        postalCode: hospital.postalCode,
        phone: hospital.phone,
        email: hospital.email,
        status: hospital.status,
        bedCount: hospital.bedCount,
        subscriptionPlan: hospital.subscriptionPlan,
      })),
      count: hospitals.length,
    };
    
    return NextResponse.json(hospitalsResponse.hospitals); // ส่งแค่ array ตรงๆ
    
  } catch (error) {
    console.error("❌ [ERROR] Hospital API error:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล",
        hospitals: [],
        count: 0,
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}