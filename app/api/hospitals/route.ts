// app/api/hospitals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const hospitals = await prisma.hospital.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        code: true,
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
    
    return NextResponse.json(hospitals);
    
  } catch (error) {
    console.error("Fetch hospitals error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล" },
      { status: 500 }
    );
  }
}