// app/api/departments/route.ts
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
    
    const departments = await prisma.department.findMany({
      where: {
        hospitalId: hospitalId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        description: true,
        location: true,
        phone: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    
    return NextResponse.json(departments);
    
  } catch (error) {
    console.error("Fetch departments error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลแผนก" },
      { status: 500 }
    );
  }
}