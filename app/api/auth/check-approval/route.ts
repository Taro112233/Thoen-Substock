// app/api/auth/check-approval/route.ts - ปิดชั่วคราว
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "PENDING",
    isApproved: false,
    canAccess: false,
  });
}