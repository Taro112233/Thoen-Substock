// app/dashboard/page.tsx - แก้ปัญหา token sync หลัง login
'use client';

import { useCurrentUser } from '@/lib/client-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
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
  Clock,
  Lock,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, error, logout, isAdmin, forceRefresh } = useCurrentUser();
  const [showLoginRedirect, setShowLoginRedirect] = useState(false);
  const [countdown, setCountdown] = useState(5); // ลดเวลาลง
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ฟังก์ชันสำหรับ refresh auth state (สำหรับกรณีที่ token มีแต่ state ไม่ sync)
  const refreshAuthState = async () => {
    setIsRefreshing(true);
    try {
      await forceRefresh();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // จัดการ countdown สำหรับ login redirect
  useEffect(() => {
    // รอให้ loading เสร็จก่อน ถ้าไม่มี user และไม่มี error ค่อยเริ่ม countdown
    if (!loading && !error && !user) {
      setShowLoginRedirect(true);
      
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            window.location.href = '/auth/login';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [loading, error, user]);

  // เช็คว่ามีการ redirect จากหน้า login มาหรือไม่ (จาก URL params)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogin = urlParams.get('from') === 'login';
    
    if (fromLogin && !user && !loading) {
      // มีการ redirect จาก login แต่ยัง fetch user ไม่ได้ -> ลอง force refresh
      console.log('🔍 [DEBUG] Detected redirect from login but no user, force refreshing...');
      setTimeout(refreshAuthState, 1000);
    }
  }, [user, loading]);

  if (loading || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="relative">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isRefreshing ? 'กำลังซิงข์ข้อมูล...' : 'กำลังโหลดข้อมูล'}
          </h2>
          <p className="text-gray-600">
            {isRefreshing ? 'กำลังตรวจสอบสถานะการเข้าสู่ระบบ...' : 'กรุณารอสักครู่...'}
          </p>
        </div>
      </div>
    );
  }

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
              onClick={refreshAuthState}
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

  // ถ้าไม่มี user ให้แสดง countdown redirect
  if (!user && showLoginRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="text-center p-8 max-w-lg">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">ต้องเข้าสู่ระบบ</h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            คุณยังไม่ได้เข้าสู่ระบบ กำลังนำไปหน้าเข้าสู่ระบบใน
          </p>
          
          <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
            <div className="text-6xl font-bold text-orange-500 mb-2">{countdown}</div>
            <p className="text-gray-600">วินาที</p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/auth/login'}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-medium"
            >
              ไปเข้าสู่ระบบเลย
            </Button>
            <Button 
              variant="outline"
              onClick={refreshAuthState}
              className="w-full"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  ตรวจสอบสถานะอีกครั้ง
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500">
              หากคุณเพิ่งเข้าสู่ระบบ กรุณากดตรวจสอบสถานะอีกครั้ง
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ถ้าไม่มี user และยังไม่เริ่ม countdown (กรณี loading เสร็จแล้วแต่ยังไม่มี user)
  if (!user) {
    window.location.href = '/auth/login';
    return null;
  }

  // ถ้ามี user แล้ว แสดง authenticated dashboard
  const roleTranslations = {
    HOSPITAL_ADMIN: 'ผู้ดูแลระบบโรงพยาบาล',
    PHARMACY_MANAGER: 'ผู้จัดการเภสัชกรรม',
    SENIOR_PHARMACIST: 'เภสัชกรอาวุโส',
    STAFF_PHARMACIST: 'เภสัชกรประจำ',
    DEPARTMENT_HEAD: 'หัวหน้าแผนก',
    STAFF_NURSE: 'พยาบาลประจำ',
    PHARMACY_TECHNICIAN: 'เทคนิคเภสัชกรรม'
  };

  const getRoleColor = (role: string) => {
    const colors = {
      HOSPITAL_ADMIN: 'from-red-500 to-pink-600',
      PHARMACY_MANAGER: 'from-purple-500 to-indigo-600',
      SENIOR_PHARMACIST: 'from-blue-500 to-cyan-600',
      STAFF_PHARMACIST: 'from-indigo-500 to-purple-600',
      DEPARTMENT_HEAD: 'from-green-500 to-emerald-600',
      STAFF_NURSE: 'from-teal-500 to-green-600',
      PHARMACY_TECHNICIAN: 'from-orange-500 to-red-600'
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
          <div className={`bg-gradient-to-r ${getRoleColor(user.role)} rounded-lg p-6 text-white`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {roleTranslations[user.role as keyof typeof roleTranslations] || user.role}
                </h2>
                <p className="text-white/90">
                  ยินดีต้อนรับสู่ระบบจัดการสต็อกยาโรงพยาบาล
                </p>
                <p className="text-white/80 text-sm mt-1">
                  สวัสดี, {user.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">บทบาท</p>
                  <p className="text-2xl font-bold text-blue-600">เข้าสู่ระบบ</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ฐานข้อมูล</p>
                  <p className="text-2xl font-bold text-orange-600">พร้อม</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>ข้อมูลผู้ใช้</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ชื่อ:</span>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">อีเมล:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">บทบาท:</span>
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                      {roleTranslations[user.role as keyof typeof roleTranslations] || user.role}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">โรงพยาบาล:</span>
                    <span className="font-medium">{user.hospital?.name || 'ไม่ระบุ'}</span>
                  </div>
                  {user.department && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">แผนก:</span>
                      <span className="font-medium">{user.department.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
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
          <Card>
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
                  onClick={() => window.location.href = '/reports'}
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  รายงานและสถิติ
                </Button>

                {user.role === 'DEPARTMENT_HEAD' || user.role === 'STAFF_NURSE' ? (
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => window.location.href = '/requisition'}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    เบิกยา
                  </Button>
                ) : null}
                
                {/* Debug Button for Development */}
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    className="w-full justify-start bg-gray-100 hover:bg-gray-200 text-gray-600"
                    variant="outline"
                    onClick={refreshAuthState}
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
                        Force Refresh Auth (Dev)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>สถานะระบบ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">เชื่อมต่อฐานข้อมูลแล้ว</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">การยืนยันตัวตนสำเร็จ</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">ระบบทำงานปกติ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}