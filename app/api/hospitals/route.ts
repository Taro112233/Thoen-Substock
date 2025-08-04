// app/api/hospitals/route.ts - Fixed Hospital Fields
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 [DEBUG] Hospitals API called');
    
    const hospitals = await prisma.hospital.findMany({
      where: {
        status: 'ACTIVE', // Only show active hospitals
      },
      select: {
        id: true,
        name: true,
        hospitalCode: true, // Fixed: use hospitalCode instead of code
        status: true,
        type: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('🔍 [DEBUG] Found hospitals:', hospitals.length);
    console.log('🔍 [DEBUG] Hospital data:', hospitals);

    return NextResponse.json(hospitals);
  } catch (error) {
    console.error('❌ [DEBUG] Hospitals API error:', error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการโหลดข้อมูลโรงพยาบาล" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}