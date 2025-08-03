// app/dashboard/page.tsx
import { Suspense } from "react";
import ProtectedLayout from "@/app/components/ProtectedLayout";
import { getCurrentUser } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  BarChart
} from "lucide-react";
import { translateUserRole, translateUserStatus } from "@/lib/auth-utils";

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </ProtectedLayout>
  );
}

async function DashboardContent() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // จะถูก redirect ไปที่ login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                ระบบจัดการสต็อกยาโรงพยาบาล
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {translateUserRole(user.role)}
              </Badge>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                ตั้งค่า
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ยินดีต้อนรับ, {user.firstName || user.name}
          </h2>
          <p className="text-gray-600">
            ระบบจัดการสต็อกยา - {user.hospital.name}
            {user.department && ` / ${user.department.name}`}
          </p>
        </div>

        {/* Status Card */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    สถานะบัญชี
                  </h3>
                  <div className="flex items-center space-x-4">
                    <Badge variant="default" className="bg-green-500">
                      <Shield className="h-3 w-3 mr-1" />
                      {translateUserStatus(user.status)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      เข้าสู่ระบบครั้งที่ {user.loginCount}
                    </span>
                    {user.lastLoginAt && (
                      <span className="text-sm text-gray-600">
                        เข้าสู่ระบบล่าสุด: {new Date(user.lastLoginAt).toLocaleDateString('th-TH')}
                      </span>
                    )}
                  </div>
                </div>
                <Activity className="h-12 w-12 text-green-500" />
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
          />
          <QuickActionCard
            title="เบิกจ่ายยา"
            description="สร้างใบเบิกและติดตาม"
            icon={<FileText className="h-6 w-6" />}
            href="/requisitions"
            color="green"
          />
          <QuickActionCard
            title="รายงาน"
            description="ดูรายงานและสถิติ"
            icon={<BarChart className="h-6 w-6" />}
            href="/reports"
            color="purple"
          />
          <QuickActionCard
            title="จัดการผู้ใช้"
            description="อนุมัติและจัดการบัญชี"
            icon={<Users className="h-6 w-6" />}
            href="/users"
            color="orange"
            requiresAdmin={true}
            userRole={user.role}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                กิจกรรมล่าสุด
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">เข้าสู่ระบบ</p>
                    <p className="text-xs text-gray-500">
                      {user.lastLoginAt ? 
                        new Date(user.lastLoginAt).toLocaleString('th-TH') : 
                        'ไม่มีข้อมูล'
                      }
                    </p>
                  </div>
                  <Badge variant="outline">สำเร็จ</Badge>
                </div>
                <div className="text-center text-sm text-gray-500 py-4">
                  ไม่มีกิจกรรมอื่นๆ
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                ข้อมูลระบบ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">โรงพยาบาล:</span>
                  <span className="text-sm font-medium">{user.hospital.name}</span>
                </div>
                {user.department && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">แผนก:</span>
                    <span className="text-sm font-medium">{user.department.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">บทบาท:</span>
                  <span className="text-sm font-medium">{translateUserRole(user.role)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">สมัครสมาชิกเมื่อ:</span>
                  <span className="text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
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
  icon: ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  requiresAdmin?: boolean;
  userRole?: string;
}

function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  color,
  requiresAdmin = false,
  userRole 
}: QuickActionCardProps) {
  // ตรวจสอบสิทธิ์สำหรับการ์ดที่ต้องการ admin
  if (requiresAdmin && userRole) {
    const isAdmin = ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER'].includes(userRole);
    if (!isAdmin) {
      return null;
    }
  }

  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-300 bg-blue-50 text-blue-600',
    green: 'border-green-200 hover:border-green-300 bg-green-50 text-green-600',
    purple: 'border-purple-200 hover:border-purple-300 bg-purple-50 text-purple-600',
    orange: 'border-orange-200 hover:border-orange-300 bg-orange-50 text-orange-600',
  };

  return (
    <Card className={`cursor-pointer transition-all duration-200 ${colorClasses[color]} hover:shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-white">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}