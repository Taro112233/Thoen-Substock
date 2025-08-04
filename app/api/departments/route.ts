// ===== 2. app/api/departments/route.ts - Real Departments API =====
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get('hospitalId');
    
    console.log('🔍 [DEBUG] Departments API called with hospitalId:', hospitalId);
    
    if (!hospitalId) {
      // Return empty array if no hospital specified
      return NextResponse.json([]);
    }
    
    // Fetch real departments from database
    const departments = await prisma.department.findMany({
      where: {
        hospitalId: hospitalId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        departmentCode: true, // Fixed: use departmentCode instead of code
        type: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('🔍 [DEBUG] Found departments:', departments.length);
    console.log('🔍 [DEBUG] Department data:', departments);

    // If no departments found, return empty array (not an error)
    return NextResponse.json(departments);
  } catch (error) {
    console.error('❌ [DEBUG] Departments API error:', error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการโหลดข้อมูลแผนก" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}