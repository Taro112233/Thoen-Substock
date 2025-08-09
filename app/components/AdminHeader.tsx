// app/components/AdminHeader.tsx
'use client';

import { useState } from 'react';
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
import { mockCurrentUser } from '@/lib/mock-data';
import { 
  Settings, 
  User, 
  LogOut, 
  Bell, 
  Home,
  Shield,
  Monitor,
  Globe,
  ChevronDown
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

export default function AdminHeader() {
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
      // เรียก API logout
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // ส่ง cookies ไปด้วย
      });

      if (response.ok) {
        // Redirect ไปหน้า login
        window.location.href = '/auth/login';
      } else {
        console.error('Logout failed:', await response.text());
        // ถึงแม้ API ล้มเหลว ก็ให้ออกจากระบบอยู่ดี
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // ถ้าเกิด error ก็ให้ redirect อยู่ดี
      window.location.href = '/auth/login';
    }
  };

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
                  <div className="h-7 w-7 md:h-8 md:w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                  </div>
                  
                  <ChevronDown className="h-3 w-3 text-gray-500 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 md:w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{mockCurrentUser.name.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 truncate">{mockCurrentUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <HierarchyBadge hierarchy={mockCurrentUser.hierarchy} size="sm" />
                      <Badge variant="outline" className="text-xs">
                        ID: {mockCurrentUser.id}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Quick Actions */}
                <DropdownMenuItem>
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
                
                {/* System Info - Compact */}
                <div className="px-2 py-2">
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>เซสชั่น: {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p>เวอร์ชั่น: 2.0.1 • <span className="text-green-600">เชื่อมต่อแล้ว</span></p>
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