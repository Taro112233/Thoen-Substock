// app/api/auth/complete-profile/route.ts - ปิดชั่วคราว
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "ยังไม่พร้อมใช้งาน" },
    { status: 501 }
  );
}