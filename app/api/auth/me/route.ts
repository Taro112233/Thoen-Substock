// app/api/auth/me/route.ts - ใช้ข้อมูลพื้นฐาน
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // ตอนนี้ return unauthorized เสมอ (จะแก้ทีหลัง)
  return NextResponse.json(
    { error: "ไม่พบข้อมูลผู้ใช้" },
    { status: 401 }
  );
}