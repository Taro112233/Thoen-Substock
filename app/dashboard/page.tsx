// app/dashboard/page.tsx - แก้ไข client component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Building2, 
  Shield, 
  Calendar,
  Activity,
  Settings,
  Package,
  FileText,
  Users,
  BarChart,
  LogOut,
  Bell,
  Home
} from "lucide-react";
import { translateUserRole, translateUserStatus } from "@/lib/auth-utils";
import { Metadata } from "next";
import LogoutButtonClient from "./components/LogoutButton";

export const metadata: Metadata = {
  title: "แดชบอร์ด | ระบบจัดการสต็อกยา",
  description: "แดชบอร์ดหลักของระบบจัดการสต็อกยาโรงพยาบาล",
};

export default async function DashboardPage() {
  // Mock user data for testing
  const user = {
    id: "1",
    name: "ทดสอบ ระบบ",
    firstName: "ทดสอบ",
    email: "test@example.com",
    role: "STAFF_NURSE",
    status: "ACTIVE",
    loginCount: 5,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    hospital: { name: "โรงพยาบาลทดสอบ" },
    department: { name: "แผนกเภสัชกรรม" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                ระบบจัดการสต็อกยาโรงพยาบาล
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {translateUserRole(user.role)}
              </Badge>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                ตั้งค่า
              </Button>
              
              <LogoutButtonClient />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ยินดีต้อนรับ, {user.firstName || user.name} 👋
            </h2>
            <p className="text-gray-600 text-lg">
              ระบบจัดการสต็อกยา - {user.hospital.name}
              {user.department && (
                <span className="text-blue-600 font-medium">
                  {` / ${user.department.name}`}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    สถานะบัญชี
                  </h3>
                  <div className="flex items-center space-x-6">
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      <Shield className="h-3 w-3 mr-2" />
                      {translateUserStatus(user.status)}
                    </Badge>
                    <span className="text-sm text-gray-600 flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      เข้าสู่ระบบครั้งที่ {user.loginCount}
                    </span>
                    {user.lastLoginAt && (
                      <span className="text-sm text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(user.lastLoginAt).toLocaleDateString('th-TH')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            title="จัดการสต็อก"
            description="ดูและจัดการยาในคลัง"
            icon={<Package className="h-6 w-6" />}
            href="/inventory"
            color="blue"
            count="1,234"
            subtitle="รายการยา"
          />
          <QuickActionCard
            title="เบิกจ่ายยา"
            description="สร้างใบเบิกและติดตาม"
            icon={<FileText className="h-6 w-6" />}
            href="/requisitions"
            color="green"
            count="56"
            subtitle="รอดำเนินการ"
          />
          <QuickActionCard
            title="รายงาน"
            description="ดูรายงานและสถิติ"
            icon={<BarChart className="h-6 w-6" />}
            href="/reports"
            color="purple"
            count="12"
            subtitle="รายงานใหม่"
          />
          <QuickActionCard
            title="จัดการผู้ใช้"
            description="อนุมัติและจัดการบัญชี"
            icon={<Users className="h-6 w-6" />}
            href="/admin/users"
            color="orange"
            count="8"
            subtitle="รออนุมัติ"
          />
        </div>

        {/* Recent Activity & System Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-3 text-blue-600" />
                กิจกรรมล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">เข้าสู่ระบบ</p>
                      <p className="text-xs text-gray-500">
                        {user.lastLoginAt ? 
                          new Date(user.lastLoginAt).toLocaleString('th-TH') : 
                          'ไม่มีข้อมูล'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    สำเร็จ
                  </Badge>
                </div>
                
                <div className="text-center text-sm text-gray-500 py-8">
                  <Activity className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p>ไม่มีกิจกรรมอื่นๆ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-3 text-purple-600" />
                ข้อมูลระบบ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <InfoRow 
                  icon={<Building2 className="w-4 h-4 text-gray-500" />}
                  label="โรงพยาบาล"
                  value={user.hospital.name}
                />
                {user.department && (
                  <InfoRow 
                    icon={<Users className="w-4 h-4 text-gray-500" />}
                    label="แผนก"
                    value={user.department.name}
                  />
                )}
                <InfoRow 
                  icon={<Shield className="w-4 h-4 text-gray-500" />}
                  label="บทบาท"
                  value={translateUserRole(user.role)}
                />
                <InfoRow 
                  icon={<Calendar className="w-4 h-4 text-gray-500" />}
                  label="สมัครสมาชิกเมื่อ"
                  value={new Date(user.createdAt).toLocaleDateString('th-TH')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  count?: string;
  subtitle?: string;
}

function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  color,
  count,
  subtitle
}: QuickActionCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600',
    green: 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100 text-green-600',
    purple: 'border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-600',
    orange: 'border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-600',
  };

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${colorClasses[color]}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-white shadow-sm">
            {icon}
          </div>
          {count && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-sm text-gray-600">{label}:</span>
      </div>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}