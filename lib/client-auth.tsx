// lib/client-auth.tsx - Improved version with better timing
'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode, useCallback } from 'react';

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
  forceRefresh: () => Promise<void>;
  isAdmin: boolean;
  isPharmacist: boolean;
  canManageUsers: boolean;
  canManageInventory: boolean;
  canDispense: boolean;
  canRequisition: boolean;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  hospitalId: string;
  rememberMe?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Permission checking functions
function hasRole(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

function isAdmin(userRole: string | undefined): boolean {
  return hasRole(userRole, ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'DEVELOPER', 'DIRECTOR', 'GROUP_HEAD']);
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
  return hasRole(userRole, ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER', 'DEVELOPER', 'DIRECTOR']);
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

  // Enhanced fetch function with retry and force refresh capability
  const fetchCurrentUser = useCallback(async (forceRefresh = false): Promise<User | null> => {
    try {
      const url = forceRefresh ? '/api/auth/me?refresh=true' : '/api/auth/me';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (forceRefresh) {
        headers['Cache-Control'] = 'no-cache';
        headers['Pragma'] = 'no-cache';
      }

      console.log('🔍 [AUTH] Fetching user data:', { forceRefresh });

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers,
        cache: forceRefresh ? 'no-store' : 'default',
      });
      
      console.log('🔍 [AUTH] Response:', { 
        status: response.status, 
        ok: response.ok,
        forceRefresh 
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [AUTH] User found:', {
          hasUser: !!data.user,
          userId: data.user?.id,
          userName: data.user?.name
        });
        return data.user;
      } else if (response.status === 401) {
        console.log('🔍 [AUTH] User not authenticated');
        return null;
      } else {
        throw new Error(`HTTP ${response.status}: ไม่สามารถดึงข้อมูลผู้ใช้ได้`);
      }
    } catch (err) {
      console.error('Fetch current user error:', err);
      throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [AUTH] Login attempt:', { identifier: credentials.identifier });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response.json();

      console.log('🔍 [AUTH] Login response:', {
        ok: response.ok,
        status: response.status,
        hasUser: !!data.user,
        redirectDelay: data.redirectDelay
      });

      if (response.ok) {
        setUser(data.user);
        
        // ✨ ใช้ delay จาก server หรือ default 1500ms
        const delay = data.redirectDelay || 1500;
        console.log(`🔍 [AUTH] Waiting ${delay}ms for cookie to be set...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Redirect based on user status พร้อม from parameter
        if (data.needsApproval || data.user.status === 'PENDING') {
          window.location.href = '/auth/pending-approval?from=login';
        } else if (data.needsProfileCompletion || !data.user.isProfileComplete) {
          window.location.href = '/auth/register/profile?from=login';
        } else if (data.user.status === 'ACTIVE') {
          window.location.href = '/dashboard?from=login';
        } else {
          throw new Error('บัญชีผู้ใช้ไม่สามารถเข้าใช้งานได้');
        }
      } else {
        throw new Error(data.error || 'การเข้าสู่ระบบไม่สำเร็จ');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      setError(errorMessage);
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
      setError(null);
      // เพิ่ม delay เล็กน้อยให้ logout API ทำงานเสร็จ
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 500);
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

  // Force refresh function - สำหรับกรณี token มีแต่ state ไม่ sync
  const forceRefresh = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [AUTH] Force refreshing auth state...');
      
      // เพิ่ม delay เล็กน้อยเพื่อให้ cookie ตั้งค่าเสร็จ
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData = await fetchCurrentUser(true);
      setUser(userData);
      
      if (userData) {
        console.log('🔍 [AUTH] Force refresh successful:', userData.name);
      } else {
        console.log('🔍 [AUTH] Force refresh: no user found');
      }
    } catch (err) {
      console.error('Force refresh error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการรีเฟรช');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced initial auth check
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // ตรวจสอบว่ามาจากหน้า login หรือไม่
        const urlParams = new URLSearchParams(window.location.search);
        const fromLogin = urlParams.get('from') === 'login';
        
        console.log('🔍 [AUTH] Initial auth check:', { fromLogin });

        // ถ้ามาจาก login ให้รอสักครู่และ force refresh
        if (fromLogin) {
          console.log('🔍 [AUTH] Coming from login, waiting for cookie...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const userData = await fetchCurrentUser(fromLogin);
        
        if (mounted) {
          setUser(userData);
          
          // ล้าง URL parameter หลังจาก load เสร็จ
          if (fromLogin && userData) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        }
      } catch (err) {
        if (mounted) {
          console.warn('Initial auth check failed:', err);
          const fromLogin = new URLSearchParams(window.location.search).get('from') === 'login';
          if (fromLogin) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [fetchCurrentUser]);

  // Listen for page visibility change to refresh auth state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    refresh,
    forceRefresh,
    isAdmin: isAdmin(user?.role),
    isPharmacist: isPharmacist(user?.role),
    canManageUsers: canManageUsers(user?.role),
    canManageInventory: canManageInventory(user?.role),
    canDispense: canDispense(user?.role),
    canRequisition: canRequisition(user?.role),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
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
  const { user, loading, error, logout, refresh, forceRefresh, isAdmin, isPharmacist } = useAuth();
  
  return {
    user,
    loading,
    error,
    logout,
    refresh,
    forceRefresh,
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

// Enhanced Login Hook with better error handling
export function useLogin() {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    identifier: '',
    password: '',
    hospitalId: '',
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof LoginCredentials, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await login(formData);
    } catch (err) {
      console.error('Login submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = formData.identifier.trim() !== '' && 
                  formData.password.trim() !== '' && 
                  formData.hospitalId.trim() !== '';
  const canSubmit = isValid && !loading && !isSubmitting;

  return {
    formData,
    handleChange,
    handleSubmit,
    isValid,
    canSubmit,
    loading: loading || isSubmitting,
    error,
  };
}

// Utility functions
export function translateRole(role: string): string {
  const roleTranslations = {
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
  
  return roleTranslations[role as keyof typeof roleTranslations] || role;
}

export function translateStatus(status: string): string {
  const statusTranslations = {
    PENDING: 'รอการอนุมัติ',
    ACTIVE: 'ใช้งานได้',
    INACTIVE: 'ปิดการใช้งานชั่วคราว',
    SUSPENDED: 'ระงับการใช้งาน',
    DELETED: 'ลบแล้ว'
  } as const;
  
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
    PHARMACY_TECHNICIAN: 'bg-orange-100 text-orange-800 border-orange-200',
    DEVELOPER: 'bg-gray-100 text-gray-800 border-gray-200',
    DIRECTOR: 'bg-pink-100 text-pink-800 border-pink-200',
    GROUP_HEAD: 'bg-yellow-100 text-yellow-800 border-yellow-200'
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

// Gradient color utilities for backgrounds
export function getRoleGradient(role: string): string {
  const gradients = {
    HOSPITAL_ADMIN: 'from-red-500 to-pink-600',
    PHARMACY_MANAGER: 'from-purple-500 to-indigo-600',
    SENIOR_PHARMACIST: 'from-blue-500 to-cyan-600',
    STAFF_PHARMACIST: 'from-indigo-500 to-purple-600',
    DEPARTMENT_HEAD: 'from-green-500 to-emerald-600',
    STAFF_NURSE: 'from-teal-500 to-green-600',
    PHARMACY_TECHNICIAN: 'from-orange-500 to-red-600',
    DEVELOPER: 'from-gray-500 to-gray-600',
    DIRECTOR: 'from-pink-500 to-rose-600',
    GROUP_HEAD: 'from-yellow-500 to-orange-600'
  };
  return gradients[role as keyof typeof gradients] || 'from-gray-500 to-gray-600';
}