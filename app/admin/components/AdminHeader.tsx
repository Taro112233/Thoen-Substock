// app/admin/components/AdminHeader.tsx
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
  Search,
  Menu,
  Home,
  Shield,
  HelpCircle,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import HierarchyBadge from './HierarchyBadge';
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
      timestamp: '2 ชั่วโมงที่แล้ว',
      read: false
    },
    { 
      id: 2, 
      message: 'มีการเพิ่มโรงพยาบาลใหม่ 2 แห่ง: โรงพยาบาลแม่ทะ และ โรงพยาบาลงาว', 
      type: 'success',
      timestamp: '4 ชั่วโมงที่แล้ว',
      read: false
    },
    { 
      id: 3, 
      message: 'รายงานการใช้งานระบบประจำเดือนมิถุนายนพร้อมแล้ว', 
      type: 'info',
      timestamp: '1 วันที่แล้ว',
      read: true
    },
    { 
      id: 4, 
      message: 'พบการเข้าถึงระบบผิดปกติจาก IP 192.168.1.100', 
      type: 'warning',
      timestamp: '2 วันที่แล้ว',
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

  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <header className="bg-white shadow-lg border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ศูนย์จัดการข้อมูลหลัก</h1>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Quick Access Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Home className="h-4 w-4 mr-2" />
                  หน้าหลัก
                </Button>
              </Link>
              
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Search className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>

            {/* System Status */}
            <div className="hidden lg:flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                ระบบปกติ
              </Badge>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>การแจ้งเตือน</span>
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} ใหม่
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className={`flex flex-col items-start p-3 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2 w-full">
                        <span className="text-lg mt-0.5">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${
                            !notification.read ? 'font-medium' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-blue-600 font-medium">
                  ดูการแจ้งเตือนทั้งหมด
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50">
                  <div className="text-right hidden md:block">
                    <p className="font-semibold text-gray-900">{mockCurrentUser.name}</p>
                  </div>
                  <HierarchyBadge hierarchy={mockCurrentUser.hierarchy} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{mockCurrentUser.name}</p>
                    <p className="text-xs text-gray-500">{mockCurrentUser.email}</p>
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
                <DropdownMenuItem>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>โหมดสี: สว่าง</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* System Info */}
                <div className="px-2 py-2">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>เซสชั่น: {new Date().toLocaleTimeString('th-TH')}</p>
                    <p>เวอร์ชั่น: 2.0.1</p>
                    <p>สถานะ: <span className="text-green-600">เชื่อมต่อแล้ว</span></p>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions Bar */}
      <div className="md:hidden border-t bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs">
                <Home className="h-3 w-3 mr-1" />
                หน้าหลัก
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-xs">
              <Search className="h-3 w-3 mr-1" />
              ค้นหา
            </Button>
          </div>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
            ระบบปกติ
          </Badge>
        </div>
      </div>
    </header>
  );
}