// middleware.ts (แทนที่ไฟล์เดิม)
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Protected routes ที่ต้องการ authentication
const protectedRoutes = [
  '/admin',
  '/dashboard',
];

// API routes ที่ต้องการ authentication
const protectedApiRoutes = [
  '/api/admin',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ข้าม static files และ API auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // ดึง token (ใช้สำหรับ production)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ตรวจสอบ protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  // สำหรับ development - ข้าม authentication (แต่ยังใส่ headers)
  if (process.env.NODE_ENV === 'development') {
    if (isProtectedApiRoute) {
      // เพิ่ม mock headers สำหรับ development
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-hospital-id', 'demo-hospital-1');
      requestHeaders.set('x-user-id', 'demo-user-1');
      requestHeaders.set('x-user-role', 'DEVELOPER');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    return NextResponse.next();
  }

  // Production authentication logic
  if (isProtectedRoute || isProtectedApiRoute) {
    if (!token) {
      if (isProtectedApiRoute) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }

    // เพิ่ม hospital context headers
    if (isProtectedApiRoute) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-hospital-id', token.hospitalId as string);
      requestHeaders.set('x-user-id', token.id as string);
      requestHeaders.set('x-user-role', token.role as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/admin/:path*",
  ],
};