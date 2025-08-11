// app/dashboard/page.tsx - Clean Dashboard Page
'use client';

import { useCurrentUser } from '@/lib/client-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { 
  User, 
  Building2, 
  Shield, 
  Settings, 
  BarChart, 
  Users, 
  Package, 
  LogOut,
  UserCheck,
  Activity,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Building,
  Database,
  Server,
  FileText,
  Gauge,
  Lock
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, error, logout, forceRefresh, isAdmin } = useCurrentUser();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await forceRefresh();
    setIsRefreshing(false);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="relative">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">กำลังโหลดข้อมูล</h2>
          <p className="text-gray-600">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-red-600 mb-6 text-lg leading-relaxed">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  กำลังรีเฟรช...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  ลองใหม่อีกครั้ง
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/auth/login'}
              className="w-full"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No User (shouldn't happen with middleware, but just in case)
  if (!user) {
    window.location.href = '/auth/login?reason=no_user';
    return null;
  }

  // Role translations
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
    GROUP_HEAD: 'หัวหน้ากลุ่ม',
    USER: 'ผู้ใช้ทั่วไป'
  };

  const getRoleColor = (role: string) => {
    const colors = {
      HOSPITAL_ADMIN: 'from-red-500 to-pink-600',
      PHARMACY_MANAGER: 'from-purple-500 to-indigo-600',
      SENIOR_PHARMACIST: 'from-blue-500 to-cyan-600',
      STAFF_PHARMACIST: 'from-indigo-500 to-purple-600',
      DEPARTMENT_HEAD: 'from-green-500 to-emerald-600',
      STAFF_NURSE: 'from-teal-500 to-green-600',
      PHARMACY_TECHNICIAN: 'from-orange-500 to-red-600',
      DEVELOPER: 'from-gray-500 to-gray-600',
      DIRECTOR: 'from-pink-500 to-rose-600',
      GROUP_HEAD: 'from-yellow-500 to-orange-600',
      USER: 'from-gray-500 to-gray-600'
    };
    return colors[role as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Success notification ถ้าเพิ่งเข้าสู่ระบบ */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('from') === 'login' && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">เข้าสู่ระบบสำเร็จ!</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${getRoleColor(user.role)} rounded-lg p-6 text-white relative overflow-hidden`}>
            <div className="relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {roleTranslations[user.role as keyof typeof roleTranslations] || user.role}
                  </h2>
                  <p className="text-white/90 mb-1">
                    ยินดีต้อนรับสู่ระบบจัดการสต็อกยาโรงพยาบาล
                  </p>
                  <p className="text-white/80 text-sm">
                    สวัสดี, {user.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">สถานะระบบ</p>
                  <p className="text-2xl font-bold text-green-600">ออนไลน์</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">การเข้าสู่ระบบ</p>
                  <p className="text-2xl font-bold text-blue-600">สำเร็จ</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">โรงพยาบาล</p>
                  <p className="text-2xl font-bold text-purple-600">เชื่อมต่อ</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ฐานข้อมูล</p>
                  <p className="text-2xl font-bold text-orange-600">พร้อม</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>ข้อมูลผู้ใช้</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{user.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ชื่อ:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">อีเมล:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">บทบาท:</span>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                      {roleTranslations[user.role as keyof typeof roleTranslations] || user.role}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">โรงพยาบาล:</span>
                    <span className="font-medium">{user.hospital?.name || 'ไม่ระบุ'}</span>
                  </div>
                  {user.department && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">แผนก:</span>
                      <span className="font-medium">{user.department.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">สถานะ:</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ใช้งานได้
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>เมนูด่วน</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isAdmin && (
                  <>
                    <Button 
                      className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => window.location.href = '/admin/users/pending'}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      อนุมัติผู้ใช้งาน
                    </Button>
                    
                    <Button 
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => window.location.href = '/admin'}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      จัดการระบบ
                    </Button>
                  </>
                )}

                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => window.location.href = '/pharmacy'}
                >
                  <Package className="w-4 h-4 mr-2" />
                  จัดการสต็อกยา
                </Button>

                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => window.location.href = '/warehouse'}
                >
                  <Building className="w-4 h-4 mr-2" />
                  จัดการคลัง
                </Button>

                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => window.location.href = '/reports'}
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  รายงานและสถิติ
                </Button>

                {['DEPARTMENT_HEAD', 'STAFF_NURSE'].includes(user.role) && (
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => window.location.href = '/requisition'}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    เบิกยา
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>สถานะระบบ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">เชื่อมต่อฐานข้อมูลแล้ว</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">การยืนยันตัวตนสำเร็จ</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">ระบบทำงานปกติ</span>
                </div>
              </div>
              
              {/* Authentication Info */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">ข้อมูลการเข้าสู่ระบบ</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• ระบบได้ตรวจสอบสิทธิ์การเข้าถึงผ่าน Middleware แล้ว</p>
                  <p>• การเชื่อมต่อใช้ HTTPS และ Cookie Security</p>
                  <p>• Session จะหมดอายุตามการตั้งค่าระบบ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation Grid */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gauge className="w-5 h-5" />
                <span>เมนูหลัก</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => window.location.href = '/pharmacy'}
                >
                  <Package className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">สต็อกยา</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => window.location.href = '/warehouse'}
                >
                  <Building className="w-6 h-6 text-green-600" />
                  <span className="text-sm">คลัง</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => window.location.href = '/reports'}
                >
                  <BarChart className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">รายงาน</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => window.location.href = '/settings'}
                >
                  <Settings className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">ตั้งค่า</span>
                </Button>

                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                      onClick={() => window.location.href = '/admin'}
                    >
                      <Shield className="w-6 h-6 text-red-600" />
                      <span className="text-sm">ผู้ดูแล</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                      onClick={() => window.location.href = '/admin/users'}
                    >
                      <Users className="w-6 h-6 text-indigo-600" />
                      <span className="text-sm">ผู้ใช้</span>
                    </Button>
                  </>
                )}

                {['DEPARTMENT_HEAD', 'STAFF_NURSE'].includes(user.role) && (
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => window.location.href = '/requisition'}
                  >
                    <FileText className="w-6 h-6 text-teal-600" />
                    <span className="text-sm">เบิกยา</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => window.location.href = '/profile'}
                >
                  <User className="w-6 h-6 text-gray-600" />
                  <span className="text-sm">โปรไฟล์</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}