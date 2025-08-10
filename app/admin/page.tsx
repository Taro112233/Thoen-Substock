// app/admin/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database, 
  Users, 
  Building2, 
  Package, 
  Shield, 
  Pill,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { mockCurrentUser, mockHospitals, mockWarehouses, mockDepartments, mockPersonnelTypes } from '@/lib/mock-data';
import Link from 'next/link';

export default function AdminMainPage() {
  const stats = {
    hospitals: mockHospitals.length,
    warehouses: mockWarehouses.length,
    departments: mockDepartments.length,
    personnelTypes: mockPersonnelTypes.length,
    totalStaff: mockDepartments.reduce((sum, dept) => sum + dept.staffCount, 0),
    activeSystems: 5
  };

  const quickActions = [
    {
      title: 'จัดการโรงพยาบาล',
      description: 'เพิ่ม แก้ไข ข้อมูลโรงพยาบาล',
      icon: Building2,
      href: '/admin/hospitals',
      color: 'from-purple-500 to-pink-500',
      count: stats.hospitals
    },
    {
      title: 'จัดการหน่วยงาน',
      description: 'คลังยาและหน่วยงานต่างๆ',
      icon: Package,
      href: '/admin/warehouses',
      color: 'from-blue-500 to-cyan-500',
      count: stats.warehouses
    },
    {
      title: 'จัดการกลุ่มงาน',
      description: 'แผนกและกลุ่มงานต่างๆ',
      icon: Users,
      href: '/admin/departments',
      color: 'from-green-500 to-emerald-500',
      count: stats.departments
    },
    {
      title: 'จัดการบุคลากร',
      description: 'ประเภทและสิทธิ์บุคลากร',
      icon: Shield,
      href: '/admin/personnel-types',
      color: 'from-purple-500 to-violet-500',
      count: stats.personnelTypes
    },
    {
      title: 'จัดการข้อมูลยา',
      description: 'รูปแบบ กลุ่ม ประเภทยา',
      icon: Pill,
      href: '/admin/drugs',
      color: 'from-green-500 to-emerald-500',
      count: 'Setup'
    }
  ];

  const systemHealth = [
    { name: 'Database Connection', status: 'healthy', uptime: '99.9%' },
    { name: 'Authentication Service', status: 'healthy', uptime: '99.8%' },
    { name: 'File Storage', status: 'healthy', uptime: '100%' },
    { name: 'Notification Service', status: 'warning', uptime: '98.5%' },
    { name: 'Backup Service', status: 'healthy', uptime: '99.7%' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                ยินดีต้อนรับ, {mockCurrentUser.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                ศูนย์จัดการข้อมูลหลักระบบเภสัชกรรม
              </p>
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {mockCurrentUser.hierarchy}
                </Badge>
                <span className="text-sm text-gray-500">
                  เข้าสู่ระบบเมื่อ: {new Date().toLocaleString('th-TH')}
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="p-4 bg-white/50 rounded-2xl">
                <Settings className="h-16 w-16 text-purple-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">โรงพยาบาลในระบบ</p>
                <p className="text-3xl font-bold text-purple-600">{stats.hospitals}</p>
              </div>
              <Building2 className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">หน่วยงานทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600">{stats.warehouses}</p>
              </div>
              <Package className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">บุคลากรทั้งหมด</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalStaff}</p>
              </div>
              <Users className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ระบบที่ใช้งาน</p>
                <p className="text-3xl font-bold text-orange-600">{stats.activeSystems}</p>
              </div>
              <Activity className="h-10 w-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>การจัดการข้อมูลหลัก</span>
          </CardTitle>
          <CardDescription>เข้าถึงฟังก์ชันการจัดการหลักของระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary">{action.count}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>สถานะระบบ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'healthy' ? 'bg-green-500' :
                      service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Uptime: {service.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>กิจกรรมล่าสุด</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">เพิ่มกลุ่มงานใหม่</p>
                  <p className="text-xs text-gray-500">2 นาทีที่แล้ว</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">อัพเดทข้อมูลโรงพยาบาล</p>
                  <p className="text-xs text-gray-500">15 นาทีที่แล้ว</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">สร้างประเภทบุคลากรใหม่</p>
                  <p className="text-xs text-gray-500">1 ชั่วโมงที่แล้ว</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Hospital Pharmacy Management System
              </h3>
              <p className="text-gray-600">
                Version 2.0 - Multi-tenant SaaS Platform
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Neon + Prisma Architecture</span>
                <span>•</span>
                <span>Next.js 14+ Framework</span>
                <span>•</span>
                <span>TypeScript</span>
              </div>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
              Production Ready
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}