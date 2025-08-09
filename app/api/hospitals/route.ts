// app/api/hospitals/route.ts - Enhanced with Better Error Handling
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('🔍 [HOSPITALS API] Fetching hospitals...');
    
    const hospitals = await prisma.hospital.findMany({
      where: {
        status: 'ACTIVE', // Only show active hospitals
      },
      select: {
        id: true,
        name: true,
        nameEn: true, // เพิ่ม nameEn สำหรับแสดงเพิ่มเติม
        hospitalCode: true,
        status: true,
        type: true,
        province: true, // เพิ่มจังหวัดเพื่อแสดงตำแหน่ง
        district: true, // เพิ่มอำเภอ
      },
      orderBy: [
        { type: 'asc' }, // เรียงตามประเภทก่อน
        { name: 'asc' }  // แล้วเรียงตามชื่อ
      ]
    });

    console.log('✅ [HOSPITALS API] Found hospitals:', hospitals.length);
    
    if (hospitals.length === 0) {
      console.warn('⚠️ [HOSPITALS API] No active hospitals found');
      return NextResponse.json(
        [], 
        { 
          status: 200,
          headers: {
            'X-Total-Count': '0',
            'X-Warning': 'No active hospitals found'
          }
        }
      );
    }

    // Transform data to include location info
    const transformedHospitals = hospitals.map(hospital => ({
      id: hospital.id,
      name: hospital.name,
      nameEn: hospital.nameEn,
      hospitalCode: hospital.hospitalCode,
      status: hospital.status,
      type: hospital.type,
      location: hospital.district && hospital.province 
        ? `${hospital.district}, ${hospital.province}`
        : hospital.province || null,
    }));

    console.log('✅ [HOSPITALS API] Returning hospitals:', transformedHospitals.length);

    return NextResponse.json(
      transformedHospitals,
      {
        status: 200,
        headers: {
          'X-Total-Count': transformedHospitals.length.toString(),
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      }
    );

  } catch (error) {
    console.error('❌ [HOSPITALS API] Database error:', error);
    
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('❌ [HOSPITALS API] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    // Return error response  
    return NextResponse.json(
      { 
        error: "เกิดข้อผิดพลาดในการโหลดข้อมูลโรงพยาบาล",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );

  } finally {
    await prisma.$disconnect();
  }
}

// Health check endpoint
export async function HEAD() {
  try {
    // Quick health check without full query
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('❌ [HOSPITALS API] Health check failed:', error);
    return new NextResponse(null, { status: 503 });
  } finally {
    await prisma.$disconnect();
  }
}