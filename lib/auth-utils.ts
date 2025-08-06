// lib/auth-utils.ts - Re-export password utilities for backward compatibility
export { hashPassword, verifyPassword, validatePasswordStrength, generateSecureToken } from './password-utils';

// Additional auth utilities
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get current user from session token
 */
export async function getCurrentUser(token: string) {
  try {
    // Implementation would depend on your JWT/session strategy
    // This is a placeholder for the actual implementation
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has permission for specific action
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