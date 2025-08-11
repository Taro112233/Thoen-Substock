// middleware.ts - Edge Runtime Safe (ไม่ verify JWT ใน middleware)
import { NextRequest, NextResponse } from "next/server";

// Protected routes ที่ต้องการ authentication
const protectedRoutes = [
  '/admin',
  '/dashboard',
  '/pharmacy',
  '/warehouse',
  '/requisition',
  '/reports',
  '/settings',
  '/profile'
];

// API routes ที่ต้องการ authentication
const protectedApiRoutes = [
  '/api/admin',
  '/api/dashboard',
  '/api/pharmacy',
  '/api/warehouse',
  '/api/requisition',
  '/api/reports'
];

// Public routes ที่ไม่ต้องการ authentication
const publicRoutes = [
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/signin',
  '/auth/error',
  '/auth/pending-approval',
  '/',
  '/about',
  '/contact'
];

// Helper function: ตรวจสอบว่ามี auth cookie หรือไม่ (ไม่ verify JWT)
function hasValidAuthCookie(request: NextRequest): boolean {
  // ตรวจสอบ auth cookies หลายแบบ
  const cookieNames = [
    'auth-token',
    'jwt-token',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'authjs.session-token',
    'better-auth.session_token'
  ];
  
  for (const cookieName of cookieNames) {
    const cookie = request.cookies.get(cookieName);
    if (cookie?.value && cookie.value.trim() !== '' && cookie.value.length > 10) {
      console.log(`✅ Found auth cookie: ${cookieName}`);
      return true;
    }
  }
  
  // ตรวจสอบ Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ') && authHeader.length > 20) {
    console.log('✅ Found Authorization header');
    return true;
  }
  
  console.log('❌ No valid auth cookie or header found');
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`🔍 Middleware checking: ${pathname}`);
  
  // ข้าม static files, API auth routes, และไฟล์ทั่วไป
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/health'
  ) {
    return NextResponse.next();
  }

  // ตรวจสอบว่ามี auth cookie หรือไม่
  const hasAuth = hasValidAuthCookie(request);

  // ✨ เพิ่มเงื่อนไข: ถ้า authenticated แล้วเข้าหน้า login ให้ redirect ไป dashboard
  if (hasAuth && (pathname === '/auth/login' || pathname.startsWith('/auth/login'))) {
    console.log(`🔀 User already authenticated, redirecting from login to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ตรวจสอบว่าเป็น public route หรือไม่
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // ตรวจสอบว่าเป็น protected route หรือไม่
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  );

  // ถ้าเป็น public route ให้ผ่านได้เลย (ยกเว้นถ้าเป็น protected route ด้วย)
  if (isPublicRoute && !isProtectedRoute) {
    console.log(`✅ Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // ถ้าเป็น protected route หรือ protected API route
  if (isProtectedRoute || isProtectedApiRoute) {
    console.log(`🔐 Protected route detected: ${pathname}`);
    
    if (!hasAuth) {
      console.log(`❌ No authentication found for: ${pathname}`);
      
      if (isProtectedApiRoute) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Unauthorized', 
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }), 
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Redirect to login for protected routes
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      loginUrl.searchParams.set('reason', 'auth_required');
      
      console.log(`🔀 Redirecting to login: ${loginUrl.toString()}`);
      return NextResponse.redirect(loginUrl);
    }

    console.log(`✅ Authentication cookie found for: ${pathname}`);

    // สำหรับ protected API routes - ส่งต่อไปให้ API route verify JWT เอง
    if (isProtectedApiRoute) {
      const requestHeaders = new Headers(request.headers);
      
      // เพิ่ม flag ว่า middleware ตรวจสอบแล้ว
      requestHeaders.set('x-middleware-checked', 'true');
      requestHeaders.set('x-protected-route', 'true');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // Default: allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};