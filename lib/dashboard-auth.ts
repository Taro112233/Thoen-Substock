// lib/dashboard-auth.ts - Final Fixed Version for Next.js 15
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';

export interface DashboardUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  hospitalId: string;
  departmentId?: string;
  status: string;
  isProfileComplete: boolean;
}

/**
 * Validate dashboard authentication using existing auth-utils
 * Fixed for Next.js 15 compatibility
 */
export async function validateDashboardAuth(request: NextRequest): Promise<{
  user: DashboardUser;
  hospitalId: string;
} | {
  error: string;
  status: number;
}> {
  try {
    console.log('🔍 [DASHBOARD AUTH] Starting validation...');
    
    // Use existing getCurrentUser function (handles cookies properly)
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('❌ [DASHBOARD AUTH] No user found');
      return {
        error: 'กรุณาเข้าสู่ระบบ',
        status: 401
      };
    }

    if (user.status !== 'ACTIVE') {
      console.log('❌ [DASHBOARD AUTH] User not active:', user.status);
      return {
        error: 'บัญชีไม่ได้เปิดใช้งาน',
        status: 403
      };
    }

    if (!user.isProfileComplete) {
      console.log('❌ [DASHBOARD AUTH] Profile incomplete');
      return {
        error: 'กรุณาเสร็จสิ้นการตั้งค่าโปรไฟล์',
        status: 403
      };
    }

    const dashboardUser: DashboardUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      hospitalId: user.hospitalId,
      departmentId: user.departmentId,
      status: user.status,
      isProfileComplete: user.isProfileComplete
    };

    console.log('✅ [DASHBOARD AUTH] User validated:', {
      id: dashboardUser.id,
      role: dashboardUser.role,
      hospitalId: dashboardUser.hospitalId
    });

    return {
      user: dashboardUser,
      hospitalId: user.hospitalId
    };

  } catch (error) {
    console.error('❌ [DASHBOARD AUTH] Validation error:', error);
    return {
      error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
      status: 500
    };
  }
}

/**
 * Middleware wrapper for API routes that need authentication
 */
export async function withDashboardAuth<T>(
  request: NextRequest,
  handler: (user: DashboardUser, hospitalId: string) => Promise<T>
): Promise<T | Response> {
  const auth = await validateDashboardAuth(request);
  
  if ('error' in auth) {
    return new Response(
      JSON.stringify({
        error: auth.error,
        code: auth.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN'
      }),
      {
        status: auth.status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return handler(auth.user, auth.hospitalId);
}

/**
 * Check if user has specific roles (for role-based access)
 */
export function checkUserRole(user: DashboardUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Get hospital context from authenticated user
 */
export function getHospitalContext(user: DashboardUser) {
  return {
    hospitalId: user.hospitalId,
    userId: user.id,
    userRole: user.role,
    departmentId: user.departmentId
  };
}

/**
 * Role-based middleware wrapper
 */
export async function withRoleAuth<T>(
  request: NextRequest,
  allowedRoles: string[],
  handler: (user: DashboardUser, hospitalId: string) => Promise<T>
): Promise<T | Response> {
  const auth = await validateDashboardAuth(request);
  
  if ('error' in auth) {
    return new Response(
      JSON.stringify({
        error: auth.error,
        code: auth.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN'
      }),
      {
        status: auth.status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  if (!checkUserRole(auth.user, allowedRoles)) {
    return new Response(
      JSON.stringify({
        error: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
        code: 'INSUFFICIENT_PERMISSIONS'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  return handler(auth.user, auth.hospitalId);
}