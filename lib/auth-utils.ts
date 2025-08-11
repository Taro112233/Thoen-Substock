// lib/auth-utils.ts - Fixed TypeScript errors
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Re-export password utilities for backward compatibility
export { hashPassword, verifyPassword, validatePasswordStrength, generateSecureToken } from './password-utils';

// Types (matching client-auth.tsx exactly)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  hospitalId: string;
  departmentId?: string;
  phoneNumber?: string;
  employeeId?: string;
  position?: string;
  isProfileComplete: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  hospital: {
    id: string;
    name: string;
    code: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  hospitalId: string;
  departmentId?: string;
  iat?: number;
  exp?: number;
}

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';

/**
 * ตรวจสอบ JWT Token
 */
export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('❌ JWT verification failed:', error);
    return null;
  }
}

/**
 * ดึงข้อมูลผู้ใช้จาก Token (Server-side)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    
    // ลองหา token จาก cookies หลายแบบ
    const tokenCookieNames = [
      'auth-token',
      'jwt-token',
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'authjs.session-token',
      'better-auth.session_token'
    ];
    
    let authToken: string | null = null;
    
    for (const cookieName of tokenCookieNames) {
      const cookie = cookieStore.get(cookieName);
      if (cookie?.value) {
        authToken = cookie.value;
        console.log(`✅ Found auth token in: ${cookieName}`);
        break;
      }
    }
    
    if (!authToken) {
      console.log('❌ No auth token found in cookies');
      return null;
    }
    
    // ตรวจสอบ JWT token
    const payload = verifyJWTToken(authToken);
    if (!payload || !payload.id) {
      console.log('❌ Invalid JWT payload');
      return null;
    }
    
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        hospital: true,
        department: true
      }
    });
    
    if (!user || !user.hospital) {
      console.log('❌ User or hospital not found in database');
      return null;
    }
    
    if (user.status !== 'ACTIVE') {
      console.log('❌ User not active:', user.status);
      return null;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Transform to AuthUser format
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      role: user.role,
      status: user.status,
      hospitalId: user.hospitalId,
      departmentId: user.departmentId ?? undefined,
      phoneNumber: user.phoneNumber ?? undefined,
      employeeId: user.employeeId ?? undefined,
      position: user.position ?? undefined,
      isProfileComplete: user.isProfileComplete,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      hospital: {
        id: user.hospital.id,
        name: user.hospital.name,
        code: user.hospital.hospitalCode || user.hospital.name.substring(0, 3).toUpperCase()
      },
      department: user.department ? {
        id: user.department.id,
        name: user.department.name,
        code: user.department.departmentCode || user.department.name.substring(0, 3).toUpperCase()
      } : undefined
    };
    
    return authUser;
    
  } catch (error) {
    console.error('❌ getCurrentUser error:', error);
    return null;
  }
}

/**
 * Type guard to check if user is valid
 */
function isValidAuthUser(user: AuthUser | null): user is AuthUser {
  return user !== null;
}

/**
 * ตรวจสอบสถานะผู้ใช้และ redirect หากจำเป็น (Server-side)
 */
export async function checkUserStatusAndRedirect(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  // Import redirect function once
  const { redirect } = await import('next/navigation');
  
  if (!isValidAuthUser(user)) {
    redirect('/auth/login?reason=not_authenticated');
    // TypeScript doesn't know that redirect() never returns
    throw new Error('User not found - redirecting to login');
  }
  
  // Now TypeScript knows user is AuthUser (not null)
  if (user.status === 'PENDING') {
    redirect('/auth/pending-approval');
    throw new Error('User pending approval - redirecting');
  }
  
  if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
    redirect('/auth/error?reason=account_suspended');
    throw new Error('User account suspended - redirecting to error');
  }
  
  if (!user.isProfileComplete) {
    redirect('/auth/register/profile');
    throw new Error('Profile incomplete - redirecting to profile completion');
  }
  
  // At this point, user is guaranteed to be valid AuthUser
  return user;
}

/**
 * ตรวจสอบ user โดยไม่ redirect (สำหรับการใช้งานใน API)
 */
export async function validateCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return { user: null, error: 'User not authenticated' };
    }
    
    if (user.status === 'PENDING') {
      return { user: null, error: 'User approval pending' };
    }
    
    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return { user: null, error: 'User account suspended' };
    }
    
    if (!user.isProfileComplete) {
      return { user: null, error: 'User profile incomplete' };
    }
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Authentication error' };
  }
}

// Permission Functions (matching client-auth.tsx)
export function hasRole(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function isAdmin(userRole: string | undefined): boolean {
  return hasRole(userRole, ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'DEVELOPER', 'DIRECTOR', 'GROUP_HEAD']);
}

export function isPharmacist(userRole: string | undefined): boolean {
  return hasRole(userRole, [
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER', 
    'SENIOR_PHARMACIST', 
    'STAFF_PHARMACIST'
  ]);
}

export function canManageUsers(userRole: string | undefined): boolean {
  return hasRole(userRole, ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'DEVELOPER', 'DIRECTOR']);
}

export function canManageInventory(userRole: string | undefined): boolean {
  return hasRole(userRole, [
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER', 
    'SENIOR_PHARMACIST'
  ]);
}

export function canDispense(userRole: string | undefined): boolean {
  return hasRole(userRole, [
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER', 
    'SENIOR_PHARMACIST', 
    'STAFF_PHARMACIST'
  ]);
}

export function canRequisition(userRole: string | undefined): boolean {
  return hasRole(userRole, [
    'DEPARTMENT_HEAD', 
    'STAFF_NURSE', 
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER'
  ]);
}

/**
 * Check if user has permission for specific action (with hierarchy)
 */
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'HOSPITAL_ADMIN': 7,
    'PHARMACY_MANAGER': 6,
    'SENIOR_PHARMACIST': 5,
    'STAFF_PHARMACIST': 4,
    'DEPARTMENT_HEAD': 3,
    'STAFF_NURSE': 2,
    'PHARMACY_TECHNICIAN': 1
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

// Translation Functions (matching client-auth.tsx)
export const roleTranslations = {
  HOSPITAL_ADMIN: 'ผู้ดูแลระบบโรงพยาบาล',
  PHARMACY_MANAGER: 'ผู้จัดการเภสัชกรรม',
  SENIOR_PHARMACIST: 'เภสัชกรอาวุโส',
  STAFF_PHARMACIST: 'เภสัชกรประจำ',
  DEPARTMENT_HEAD: 'หัวหน้าแผนก',
  STAFF_NURSE: 'พยาบาลประจำ',
  PHARMACY_TECHNICIAN: 'เทคนิคเภสัชกรรม',
  DEVELOPER: 'นักพัฒนาระบบ',
  DIRECTOR: 'ผู้อำนวยการ',
  GROUP_HEAD: 'หัวหน้ากลุ่ม'
} as const;

export const statusTranslations = {
  PENDING: 'รอการอนุมัติ',
  ACTIVE: 'ใช้งานได้',
  INACTIVE: 'ปิดการใช้งานชั่วคราว',
  SUSPENDED: 'ระงับการใช้งาน',
  DELETED: 'ลบแล้ว'
} as const;

export function translateUserRole(role: string): string {
  return roleTranslations[role as keyof typeof roleTranslations] || role;
}

export function translateUserStatus(status: string): string {
  return statusTranslations[status as keyof typeof statusTranslations] || status;
}

/**
 * Generate username from name and employee ID
 */
export function generateUsername(firstName: string, lastName: string, employeeId?: string): string {
  const nameBase = `${firstName.toLowerCase()}${lastName.toLowerCase()}`
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '');
  
  if (employeeId) {
    return `${nameBase}_${employeeId}`;
  }
  
  const timestamp = Date.now().toString().slice(-4);
  return `${nameBase}_${timestamp}`;
}

/**
 * Validate user session and hospital context
 */
export async function validateSession(userId: string, hospitalId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        hospitalId: hospitalId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        hospitalId: true,
        departmentId: true,
        isProfileComplete: true,
        status: true
      }
    });

    return user;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * ดึง Hospital Context จาก Headers (สำหรับ API routes)
 */
export function getHospitalContext(request: NextRequest) {
  const headers = request.headers;
  
  return {
    isAuthenticated: headers.get('x-authenticated') === 'true',
    userId: headers.get('x-user-id') || null,
    userEmail: headers.get('x-user-email') || null,
    userRole: headers.get('x-user-role') || null,
    hospitalId: headers.get('x-hospital-id') || null,
    departmentId: headers.get('x-department-id') || null,
    authSource: headers.get('x-auth-source') || null
  };
}

/**
 * ตรวจสอบสิทธิ์ API (สำหรับ API routes)
 */
export function requireAuth(request: NextRequest, allowedRoles?: string[]) {
  const context = getHospitalContext(request);
  
  if (!context.isAuthenticated || !context.userId) {
    throw new Error('Authentication required');
  }
  
  if (allowedRoles && context.userRole && !allowedRoles.includes(context.userRole)) {
    throw new Error('Insufficient permissions');
  }
  
  return context;
}

/**
 * สร้าง Response สำหรับ API Error
 */
export function createAuthErrorResponse(message: string, status: number = 401) {
  return new Response(
    JSON.stringify({
      error: 'Authentication Error',
      message,
      code: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}