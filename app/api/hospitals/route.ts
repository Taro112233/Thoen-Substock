// app/api/hospitals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// GET: ดึงรายชื่อโรงพยาบาลทั้งหมดที่สามารถใช้งานได้
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [HOSPITALS API] Fetching hospitals from database...');
    
    // ดึงข้อมูลโรงพยาบาลที่สถานะเป็น ACTIVE หรือ PENDING
    const hospitals = await prisma.hospital.findMany({
      where: {
        OR: [
          { status: "ACTIVE" },
          { status: "PENDING" }
        ]
      },
      select: {
        id: true,
        name: true,
        nameEn: true,
        hospitalCode: true,
        status: true,
        type: true,
        province: true,
        phone: true,
        email: true,
        address: true,
        // เพิ่มข้อมูลสำหรับการแสดงผล
        bedCount: true,
        subscriptionPlan: true,
        subscriptionEnd: true,
        // ข้อมูลการใช้งาน
        _count: {
          select: {
            users: true,
            departments: true,
            warehouses: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // ACTIVE ขึ้นก่อน
        { name: 'asc' }    // เรียงตามชื่อ
      ]
    });

    console.log(`✅ [HOSPITALS API] Found ${hospitals.length} hospitals`);

    // ปรับรูปแบบข้อมูลสำหรับ Frontend
    const formattedHospitals = hospitals.map(hospital => ({
      id: hospital.id,
      name: hospital.name,
      nameEn: hospital.nameEn,
      hospitalCode: hospital.hospitalCode,
      status: hospital.status,
      type: hospital.type,
      province: hospital.province,
      phone: hospital.phone,
      email: hospital.email,
      address: hospital.address,
      bedCount: hospital.bedCount,
      subscriptionPlan: hospital.subscriptionPlan,
      subscriptionEnd: hospital.subscriptionEnd?.toISOString(),
      // สถิติการใช้งาน
      userCount: hospital._count.users,
      departmentCount: hospital._count.departments,
      warehouseCount: hospital._count.warehouses,
      // สำหรับการแสดงผลใน Select
      displayName: `${hospital.name}${hospital.province ? ` (${hospital.province})` : ''}`,
      isAvailable: hospital.status === 'ACTIVE'
    }));

    return NextResponse.json(formattedHospitals, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache 5 นาที
      }
    });

  } catch (error) {
    console.error("❌ [HOSPITALS API] Database error:", error);
    
    return NextResponse.json(
      {
        error: "ไม่สามารถดึงข้อมูลโรงพยาบาลได้",
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
        details: process.env.NODE_ENV === 'development' ? 
          (error as Error).message : undefined
      },
      { status: 500 }
    );

  } finally {
    await prisma.$disconnect();
  }
}

// POST: สร้างโรงพยาบาลใหม่ (สำหรับ Admin เท่านั้น)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ตรวจสอบข้อมูลพื้นฐาน
    const {
      name,
      hospitalCode,
      type,
      status = 'PENDING',
      address,
      province,
      phone,
      email
    } = body;

    if (!name || !hospitalCode || !type || !address || !province) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    // ตรวจสอบรหัสโรงพยาบาลซ้ำ
    const existingHospital = await prisma.hospital.findUnique({
      where: { hospitalCode }
    });

    if (existingHospital) {
      return NextResponse.json(
        { error: "รหัสโรงพยาบาลนี้มีอยู่แล้ว" },
        { status: 409 }
      );
    }

    // สร้างโรงพยาบาลใหม่
    const newHospital = await prisma.hospital.create({
      data: {
        name,
        hospitalCode,
        type,
        status,
        address,
        province,
        phone,
        email,
        timezone: "Asia/Bangkok",
        locale: "th-TH",
        currency: "THB"
      }
    });

    console.log(`✅ [HOSPITALS API] Created new hospital: ${newHospital.name}`);

    return NextResponse.json({
      message: "สร้างโรงพยาบาลสำเร็จ",
      hospital: {
        id: newHospital.id,
        name: newHospital.name,
        hospitalCode: newHospital.hospitalCode,
        status: newHospital.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ [HOSPITALS API] Create error:", error);
    
    return NextResponse.json(
      { error: "ไม่สามารถสร้างโรงพยาบาลได้" },
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