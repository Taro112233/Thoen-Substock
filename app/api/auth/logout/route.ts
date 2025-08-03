// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/utils/auth";

export async function POST(request: NextRequest) {
  try {
    // ใช้ Better Auth logout
    const result = await auth.api.signOut({
      headers: request.headers,
    });
    
    return NextResponse.json({
      success: true,
      message: "ออกจากระบบสำเร็จ",
    });
    
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการออกจากระบบ" },
      { status: 500 }
    );
  }
}