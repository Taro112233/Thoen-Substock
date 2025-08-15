// app/components/AdminHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/client-auth';
import { 
  Settings, 
  User, 
  LogOut, 
  Bell, 
  Home,
  Shield,
  Monitor,
  Globe,
  ChevronDown,
  Clock,
  MapPin,
  AlertCircle,
  Loader2
} from 'lucide-react';
import HierarchyBadge from '../admin/components/HierarchyBadge';
import Link from 'next/link';

interface NotificationItem {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

// Helper function แปลงสถานะผู้ใช้เป็นภาษาไทย
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'ใช้งานอยู่',
    'PENDING': 'รออนุมัติ',
    'SUSPENDED': 'ระงับการใช้งาน',
    'INACTIVE': 'ไม่ใช้งาน'
  };
  return statusMap[status] || status;
};

// Helper function แปลงบทบาทเป็นภาษาไทย
const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    'HOSPITAL_ADMIN': 'ผู้ดูแลระบบโรงพยาบาล',
    'PHARMACY_MANAGER': 'หัวหน้าเภสัชกรรม',
    'SENIOR_PHARMACIST': 'เภสัชกรอาวุโส',
    'STAFF_PHARMACIST': 'เภสัชกรประจำ',
    'DEPARTMENT_HEAD': 'หัวหน้าแผนก',
    'STAFF_NURSE': 'พยาบาลประจำ',
    'PHARMACY_TECHNICIAN': 'ผู้ช่วยเภสัชกร'
  };
  return roleMap[role] || role;
};

// Helper function แปลงเวลาเป็นรูปแบบที่อ่านง่าย
const formatLastLogin = (lastLoginAt?: string) => {
  if (!lastLoginAt) return 'ไม่พบข้อมูล';
  
  try {
    const loginDate = new Date(lastLoginAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'เพิ่งเข้าสู่ระบบ';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่ผ่านมา`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่ผ่านมา`;
    
    return loginDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'ไม่พบข้อมูล';
  }
};

export default function AdminHeader() {
  const { user, loading, logout, refresh } = useAuth();
  const [notifications] = useState<NotificationItem[]>([
    { 
      id: 1, 
      message: 'ระบบจะปิดปรับปรุงในวันอาทิตย์ที่ 15 ก.ค. เวลา 02:00-04:00', 
      type: 'info',
      timestamp: '2 ชม.',
      read: false
    },
    { 
      id: 2, 
      message: 'มีการเพิ่มโรงพยาบาลใหม่ 2 แห่ง', 
      type: 'success',
      timestamp: '4 ชม.',
      read: false
    },
    { 
      id: 3, 
      message: 'รายงานการใช้งานระบบประจำเดือนพร้อมแล้ว', 
      type: 'info',
      timestamp: '1 วัน',
      read: true
    },
    { 
      id: 4, 
      message: 'พบการเข้าถึงระบบผิดปกติจาก IP 192.168.1.100', 
      type: 'warning',
      timestamp: '2 วัน',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  // ฟังก์ชันออกจากระบบ
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      // ถ้าเกิด error ก็ให้ redirect อยู่ดี
      window.location.href = '/auth/login';
    }
  };

  // ฟังก์ชันรีเฟรชข้อมูลผู้ใช้
  const handleRefreshUser = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // ถ้ากำลังโหลดข้อมูลผู้ใช้
  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                <Settings className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Warehouse</h1>
                <p className="hidden md:block text-xs text-gray-500">ระบบบริหารคลังเวชภัณฑ์</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">กำลังโหลด...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ถ้าไม่มีข้อมูลผู้ใช้ (ไม่ได้ login)
  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                <Settings className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Warehouse</h1>
                <p className="hidden md:block text-xs text-gray-500">ระบบบริหารคลังเวชภัณฑ์</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600">กรุณาเข้าสู่ระบบ</span>
              <Link href="/auth/login">
                <Button size="sm">เข้าสู่ระบบ</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Main header row */}
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            {/* Compact Logo */}
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
              <Settings className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            
            {/* Title - Responsive */}
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                <span className="hidden sm:inline">Warehouse</span>
                <span className="sm:hidden">Warehouse</span>
              </h1>
              <p className="hidden md:block text-xs text-gray-500">ระบบบริหารคลังเวชภัณฑ์</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Quick Actions - Desktop only */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Home className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">หน้าหลัก</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Home Button */}
            <div className="lg:hidden">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-2">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative p-2">
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 md:w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>การแจ้งเตือน</span>
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} ใหม่
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className={`flex flex-col items-start p-3 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2 w-full">
                        <span className="text-base mt-0.5">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${
                            !notification.read ? 'font-medium' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            {!notification.read && (
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-blue-600 font-medium justify-center">
                  ดูทั้งหมด
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2 py-1.5 h-auto hover:bg-gray-50">
                  {/* User Icon แทน Avatar */}
                  <div className="h-7 w-7 md:h-8 md:w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  
                  <ChevronDown className="h-3 w-3 text-gray-500 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 md:w-72">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-2">
                    {/* ชื่อผู้ใช้ */}
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.name || 'ไม่ระบุชื่อ'
                        }
                      </p>
                      {user.status === 'ACTIVE' ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                    </div>
                    
                    {/* อีเมลและรหัสพนักงาน */}
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {user.employeeId && (
                        <p className="text-xs text-gray-400">รหัสพนักงาน: {user.employeeId}</p>
                      )}
                    </div>
                    
                    {/* Role และ Status */}
                    <div className="flex items-center justify-between">
                      <HierarchyBadge hierarchy={user.role} size="sm" />
                      <Badge 
                        variant={user.status === 'ACTIVE' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {getStatusLabel(user.status)}
                      </Badge>
                    </div>
                    
                    {/* รหัสผู้ใช้และพนักงาน */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>ID: {user.id.slice(0, 8)}...</span>
                      {user.employeeId && (
                        <span>• EMP: {user.employeeId}</span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* ข้อมูลโรงพยาบาลและแผนก */}
                <div className="px-2 py-2 space-y-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700 truncate">
                        {user.hospital?.name || 'ไม่ระบุโรงพยาบาล'}
                      </p>
                      {user.hospital?.code && (
                        <p className="text-gray-500">รหัส: {user.hospital.code}</p>
                      )}
                    </div>
                  </div>
                  
                  {user.department && (
                    <div className="flex items-center space-x-2 text-xs">
                      <Monitor className="h-3 w-3 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">
                          {user.department.name}
                        </p>
                        {user.department.code && (
                          <p className="text-gray-500">รหัส: {user.department.code}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {user.position && (
                    <div className="flex items-center space-x-2 text-xs">
                      <Shield className="h-3 w-3 text-gray-400" />
                      <p className="text-gray-700">{user.position}</p>
                    </div>
                  )}
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Quick Actions */}
                <DropdownMenuItem onClick={handleRefreshUser}>
                  <User className="mr-2 h-4 w-4" />
                  <span>โปรไฟล์และการตั้งค่า</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>จัดการสิทธิ์</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>ประวัติการใช้งาน</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Preferences */}
                <DropdownMenuItem>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>ภาษา: ไทย</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* System Info - แสดงข้อมูลจริง */}
                <div className="px-2 py-2">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>เข้าสู่ระบบ: {formatLastLogin(user.lastLoginAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>บัญชี: {user.isProfileComplete ? 'ครบถ้วน' : 'ไม่ครบถ้วน'}</span>
                      <span className="text-green-600">• ออนไลน์</span>
                    </div>
                    <p>เวอร์ชั่น: 2.0.1</p>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}