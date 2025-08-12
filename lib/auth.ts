// lib/auth.ts - Fixed และเพิ่ม verifyAuth function
// ระบบ JWT Authentication แบบ Simple & Clean

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'auth-token';

// Types
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  hospitalId: string;
  departmentId?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  hospitalId: string;
  departmentId?: string | null;
}

// Verification Result Types
export interface VerifyAuthSuccess {
  hospitalId: string;
  user: AuthUser;
}

export interface VerifyAuthError {
  error: string;
  status: number;
}

export type VerifyAuthResult = VerifyAuthSuccess | VerifyAuthError;

/**
 * สร้าง JWT Token
 */
export function createToken(user: any): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    hospitalId: user.hospitalId,
    departmentId: user.departmentId
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * ตรวจสอบ JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('❌ Invalid token:', error);
    return null;
  }
}

/**
 * Set Auth Cookie
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

/**
 * Clear Auth Cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get Current User from Request
 */
export async function getCurrentUser(request?: NextRequest): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    
    // 1. Check cookie
    const authCookie = cookieStore.get(COOKIE_NAME);
    if (!authCookie?.value) {
      console.log('❌ No auth cookie found');
      return null;
    }

    // 2. Verify token
    const payload = verifyToken(authCookie.value);
    if (!payload) {
      console.log('❌ Invalid token');
      return null;
    }

    // 3. Get user from database
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.id,
        status: 'ACTIVE' // ตรวจสอบว่า user ยัง active อยู่
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        hospitalId: true,
        departmentId: true
      }
    });

    if (!user) {
      console.log('❌ User not found or inactive');
      return null;
    }

    console.log('✅ User authenticated:', user.id);
    return user;

  } catch (error) {
    console.error('❌ Auth error:', error);
    return null;
  }
}

/**
 * verifyAuth - สำหรับใช้ใน API routes
 * คืนค่า hospitalId และ user ถ้าสำเร็จ หรือ error object ถ้าล้มเหลว
 */
export async function verifyAuth(request: NextRequest): Promise<VerifyAuthResult> {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return {
        error: "ไม่ได้รับอนุญาต",
        status: 401
      };
    }

    if (user.status !== 'ACTIVE') {
      return {
        error: "บัญชีไม่ได้ใช้งาน",
        status: 403
      };
    }

    return {
      hospitalId: user.hospitalId,
      user: user
    };

  } catch (error) {
    console.error('❌ verifyAuth error:', error);
    return {
      error: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
      status: 500
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Check if user can approve other users
 */
export async function canApproveUsers(user: AuthUser | null): Promise<boolean> {
  if (!user) return false;

  // Admin roles that can approve
  const adminRoles = [
    'DEVELOPER',
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER',
    'DIRECTOR'
  ];

  // Check role-based permission
  if (adminRoles.includes(user.role)) {
    return true;
  }

  // Check personnel type permission (if exists)
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      personnelType: {
        select: { canApproveUsers: true }
      }
    }
  });

  return userData?.personnelType?.canApproveUsers || false;
}

/**
 * Type guard function to check if result is success
 */
export function isAuthSuccess(result: VerifyAuthResult): result is VerifyAuthSuccess {
  return 'hospitalId' in result;
}

/**
 * Type guard function to check if result is error
 */
export function isAuthError(result: VerifyAuthResult): result is VerifyAuthError {
  return 'error' in result;
}