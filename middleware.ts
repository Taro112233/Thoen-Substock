// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes ที่ไม่ต้องตรวจสอบ auth
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/register/profile",
    "/api/auth",
    "/api/public",
    "/_next",
    "/favicon.ico",
  ];
  
  // ตรวจสอบว่าเป็น public route หรือไม่
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  try {
    // ตรวจสอบ session
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    // ถ้าไม่มี session ให้ redirect ไป login
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // ดึงข้อมูลผู้ใช้เพิ่มเติม (อาจต้องใช้ database query)
    // เนื่องจาก middleware ควรเร็ว เราจะทำการตรวจสอบเพิ่มเติมใน page component
    
    // Routes ที่ต้องการสถานะ ACTIVE
    const protectedRoutes = ["/dashboard", "/inventory", "/requisitions", "/reports"];
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    // Routes พิเศษสำหรับสถานะต่างๆ
    if (pathname === "/auth/pending-approval") {
      // อนุญาตให้เข้าหน้านี้ได้เสมอหากมี session
      return NextResponse.next();
    }
    
    // ถ้าเป็น protected route แต่ไม่มีข้อมูลเพิ่มเติม
    // ให้ไปยัง page component เพื่อตรวจสอบเพิ่มเติม
    if (isProtectedRoute) {
      // อาจเพิ่ม header บอกว่าต้องตรวจสอบสถานะ
      const response = NextResponse.next();
      response.headers.set("x-check-user-status", "true");
      return response;
    }
    
    return NextResponse.next();
    
  } catch (error) {
    console.error("Middleware error:", error);
    
    // ถ้าเกิดข้อผิดพลาด redirect ไป login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};