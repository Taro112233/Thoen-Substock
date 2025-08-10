// lib/api-helpers.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { prisma } from './prisma';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getSessionUser() {
  // Development mode: ใช้ headers จาก middleware
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'demo-user-1',
      role: 'DEVELOPER',
      hospitalId: 'demo-hospital-1',
      name: 'Demo User',
      email: 'demo@hospital.com',
      status: 'ACTIVE',
    };
  }

  // Production mode: ใช้ NextAuth session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new ApiError('ไม่พบข้อมูลการเข้าสู่ระบบ', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      hospital: true,
      personnelType: true,
    },
  });

  if (!user) {
    throw new ApiError('ไม่พบข้อมูลผู้ใช้', 404);
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError('บัญชีผู้ใช้ไม่สามารถใช้งานได้', 403);
  }

  return user;
}

export function getClientInfo(request: NextRequest) {
  return {
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

export function handleApiError(error: any) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Prisma errors
  if (error.code === 'P2002') {
    return {
      error: 'ข้อมูลซ้ำ: รหัสหรือข้อมูลนี้มีอยู่แล้วในระบบ',
      code: 'DUPLICATE_DATA',
      statusCode: 400,
    };
  }

  if (error.code === 'P2025') {
    return {
      error: 'ไม่พบข้อมูลที่ระบุ',
      code: 'NOT_FOUND',
      statusCode: 404,
    };
  }

  return {
    error: 'เกิดข้อผิดพลาดในระบบ',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}

export function createSuccessResponse(data?: any, message?: string, pagination?: any) {
  return {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(pagination && { pagination }),
  };
}

export function createErrorResponse(error: string, details?: any) {
  return {
    success: false,
    error,
    ...(details && { details }),
  };
}