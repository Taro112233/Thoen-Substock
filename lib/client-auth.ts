// lib/client-auth.ts
'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
export interface User {
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  isPharmacist: boolean;
  canManageUsers: boolean;
  canManageInventory: boolean;
  canDispense: boolean;
  canRequisition: boolean;
}

interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role translations
export const roleTranslations = {
  HOSPITAL_ADMIN: 'ผู้ดูแลระบบโรงพยาบาล',
  PHARMACY_MANAGER: 'ผู้จัดการเภสัชกรรม',
  SENIOR_PHARMACIST: 'เภสัชกรอาวุโส',
  STAFF_PHARMACIST: 'เภสัชกรประจำ',
  DEPARTMENT_HEAD: 'หัวหน้าแผนก',
  STAFF_NURSE: 'พยาบาลประจำ',
  PHARMACY_TECHNICIAN: 'เทคนิคเภสัชกรรม'
} as const;

export const statusTranslations = {
  PENDING: 'รอการอนุมัติ',
  ACTIVE: 'ใช้งานได้',
  INACTIVE: 'ปิดการใช้งานชั่วคราว',
  SUSPENDED: 'ระงับการใช้งาน',
  DELETED: 'ลบแล้ว'
} as const;

// Permission checking functions
function hasRole(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

function isAdmin(userRole: string | undefined): boolean {
  return hasRole(userRole, ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER']);
}

function isPharmacist(userRole: string | undefined): boolean {
  return hasRole(userRole, [
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER', 
    'SENIOR_PHARMACIST', 
    'STAFF_PHARMACIST'
  ]);
}

function canManageUsers(userRole: string | undefined): boolean {
  return hasRole(userRole, ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER']);
}

function canManageInventory(userRole: string | undefined): boolean {
  return hasRole(userRole, [
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER', 
    'SENIOR_PHARMACIST'
  ]);
}

function canDispense(userRole: string | undefined): boolean {
  return hasRole(userRole, [
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER', 
    'SENIOR_PHARMACIST', 
    'STAFF_PHARMACIST'
  ]);
}

function canRequisition(userRole: string | undefined): boolean {
  return hasRole(userRole, [
    'DEPARTMENT_HEAD', 
    'STAFF_NURSE', 
    'HOSPITAL_ADMIN', 
    'PHARMACY_MANAGER'
  ]);
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.user;
      } else if (response.status === 401) {
        // Not authenticated
        return null;
      } else {
        throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
      }
    } catch (err) {
      throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        
        // Redirect based on user status
        if (data.user.status === 'PENDING') {
          window.location.href = '/auth/pending-approval';
        } else if (data.user.status === 'ACTIVE') {
          window.location.href = '/dashboard';
        } else {
          throw new Error('บัญชีผู้ใช้ไม่สามารถเข้าใช้งานได้');
        }
      } else {
        throw new Error(data.error || 'การเข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      window.location.href = '/auth/login';
    }
  };

  const refresh = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await fetchCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการรีเฟรช');
    } finally {
      setLoading(false);
    }
  };

  // Initial auth check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    refresh,
    isAdmin: isAdmin(user?.role),
    isPharmacist: isPharmacist(user?.role),
    canManageUsers: canManageUsers(user?.role),
    canManageInventory: canManageInventory(user?.role),
    canDispense: canDispense(user?.role),
    canRequisition: canRequisition(user?.role),
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

// Hook สำหรับใช้ Auth Context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน (backward compatibility)
export function useCurrentUser() {
  const { user, loading, error, logout, refresh, isAdmin, isPharmacist } = useAuth();
  
  return {
    user,
    loading,
    error,
    logout,
    refresh,
    isAdmin,
    isPharmacist,
  };
}

// Hook สำหรับตรวจสอบสิทธิ์
export function usePermissions() {
  const { 
    user, 
    isAdmin, 
    isPharmacist,
    canManageUsers,
    canManageInventory,
    canDispense,
    canRequisition 
  } = useAuth();
  
  const hasRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };
  
  return {
    user,
    hasRole,
    isAdmin,
    isPharmacist,
    canManageUsers,
    canManageInventory,
    canDispense,
    canRequisition,
  };
}

// Hook สำหรับ Login Form
export function useLogin() {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    identifier: '',
    password: '',
  });

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  const isValid = formData.identifier.trim() !== '' && formData.password.trim() !== '';

  return {
    formData,
    handleChange,
    handleSubmit,
    isValid,
    loading,
    error,
  };
}

// Utility functions for role and status translations
export function translateRole(role: string): string {
  return roleTranslations[role as keyof typeof roleTranslations] || role;
}

export function translateStatus(status: string): string {
  return statusTranslations[status as keyof typeof statusTranslations] || status;
}

// Role color utilities for UI
export function getRoleColor(role: string): string {
  const colors = {
    HOSPITAL_ADMIN: 'bg-red-100 text-red-800 border-red-200',
    PHARMACY_MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
    SENIOR_PHARMACIST: 'bg-blue-100 text-blue-800 border-blue-200',
    STAFF_PHARMACIST: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    DEPARTMENT_HEAD: 'bg-green-100 text-green-800 border-green-200',
    STAFF_NURSE: 'bg-teal-100 text-teal-800 border-teal-200',
    PHARMACY_TECHNICIAN: 'bg-orange-100 text-orange-800 border-orange-200'
  };
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getStatusColor(status: string): string {
  const colors = {
    PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
    SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
    DELETED: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
}

// Format date utilities
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Hospital context utilities
export function isSameHospital(user: User | null, targetHospitalId: string): boolean {
  if (!user) return false;
  return user.hospitalId === targetHospitalId;
}

export function isSameDepartment(user: User | null, targetDepartmentId: string): boolean {
  if (!user || !user.departmentId) return false;
  return user.departmentId === targetDepartmentId;
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidThaiPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+66|0)[6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
}

// Local storage utilities (for non-sensitive data only)
export function getLocalStorageItem(key: string, defaultValue: any = null): any {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorageItem(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function removeLocalStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}