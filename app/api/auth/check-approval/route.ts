// app/api/auth/check-approval/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลผู้ใช้" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      status: user.status,
      isApproved: user.status === "ACTIVE",
      canAccess: user.status === "ACTIVE" && user.isProfileComplete,
    });
    
  } catch (error) {
    console.error("Check approval error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}