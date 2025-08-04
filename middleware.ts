// middleware.ts - ปิดชั่วคราวเพื่อทดสอบ UI
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // ปิด middleware ชั่วคราวเพื่อทดสอบ UI
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};