// app/admin/warehouses/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/DataTable';
import { StatCard } from '@/components/admin/StatCard';
import { QuickActionCard } from '@/components/admin/QuickActionCard';
import { 
  Plus, 
  Warehouse, 
  Thermometer,
  Shield,
  Activity,
  MapPin,
  Settings,
  Edit,
  Trash2
} from 'lucide-react';

// Mock data สำหรับ warehouses
const mockWarehouses = [
  {
    id: '1',
    warehouseCode: 'CENTRAL',
    name: 'คลังยาหลัก',
    type: 'CENTRAL',
    location: 'ชั้น B1 อาคารเภสัชกรรม',
    hospital: 'โรงพยาบาลลำปาง',
    area: 200.5,
    capacity: 10000,
    currentItems: 8500,
    hasTemperatureControl: true,
    securityLevel: 'HIGH',
    isActive: true,
    manager: 'หัวหน้าเภสัชกรรม',
    lastStockCount: '2024-02-10'
  },
  {
    id: '2',
    warehouseCode: 'EMERG_STORE',
    name: 'คลังยาฉุกเฉิน',
    type: 'EMERGENCY',
    location: 'ห้องฉุกเฉิน',
    hospital: 'โรงพยาบาลลำปาง',
    area: 15.0,
    capacity: 500,
    currentItems: 450,
    hasTemperatureControl: false,
    securityLevel: 'STANDARD',
    isActive: true,
    manager: 'หัวหน้าห้องฉุกเฉิน',
    lastStockCount: '2024-02-12'
  },
  {
    id: '3',
    warehouseCode: 'CONTROLLED',
    name: 'คลังยาควบคุม',
    type: 'CONTROLLED',
    location: 'ชั้น B1 ห้องพิเศษ',
    hospital: 'โรงพยาบาลลำปาง',
    area: 25.0,
    capacity: 1000,
    currentItems: 850,
    hasTemperatureControl: true,
    securityLevel: 'MAXIMUM',
    isActive: true,
    manager: 'เภสัชกรอาวุโส',
    lastStockCount: '2024-02-14'
  },
  {
    id: '4',
    warehouseCode: 'COLD_STORE',
    name: 'ห้องเย็น',
    type: 'COLD_STORAGE',
    location: 'ชั้น B1 อาคารเภสัชกรรม',
    hospital: 'โรงพยาบาลลำปาง',
    area: 20.0,
    capacity: 1500,
    currentItems: 1200,
    hasTemperatureControl: true,
    securityLevel: 'HIGH',
    isActive: true,
    manager: 'เทคนิคเภสัชกรรม',
    lastStockCount: '2024-02-13'
  }
];

const warehouseTypeLabels = {
  CENTRAL: 'คลังกลาง',
  DEPARTMENT: 'คลังแผนก',
  EMERGENCY: 'คลังฉุกเฉิน',
  CONTROLLED: 'คลังยาควบคุม',
  COLD_STORAGE: 'ห้องเย็น',
  QUARANTINE: 'ห้องกักกัน',
  DISPOSAL: 'ห้องทำลาย',
  RECEIVING: 'ห้องรับของ',
  DISPENSING: 'ห้องจ่ายยา'
};

const securityLevelColors = {
  BASIC: 'bg-gray-100 text-gray-800',
  STANDARD: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MAXIMUM: 'bg-red-100 text-red-800'
};

export default function WarehousesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const warehouseColumns = [
    {
      key: 'warehouseCode' as const,
      title: 'รหัส',
      render: (value: string) => (
        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </div>
      )
    },
    {
      key: 'name' as const,
      title: 'ชื่อคลัง',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">
            <Badge variant="outline" className="text-xs">
              {warehouseTypeLabels[row.type as keyof typeof warehouseTypeLabels]}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'location' as const,
      title: 'ตำแหน่ง',
      render: (value: string, row: any) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
            {value}
          </div>
          <div className="text-xs text-gray-500">{row.hospital}</div>
        </div>
      )
    },
    {
      key: 'capacity' as const,
      title: 'ความจุ',
      render: (value: number, row: any) => (
        <div className="text-center">
          <div className="text-sm font-medium">
            {row.currentItems.toLocaleString()} / {value.toLocaleString()}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(row.currentItems / value) * 100}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((row.currentItems / value) * 100)}% ใช้งาน
          </div>
        </div>
      )
    },
    {
      key: 'securityLevel' as const,
      title: 'ความปลอดภัย',
      render: (value: string, row: any) => (
        <div className="space-y-1">
          <Badge className={securityLevelColors[value as keyof typeof securityLevelColors]}>
            <Shield className="w-3 h-3 mr-1" />
            {value}
          </Badge>
          {row.hasTemperatureControl && (
            <div className="flex items-center text-xs text-blue-600">
              <Thermometer className="w-3 h-3 mr-1" />
              ควบคุมอุณหภูมิ
            </div>
          )}
        </div>
      )
    },
    {
      key: 'manager' as const,
      title: 'ผู้รับผิดชอบ',
      render: (value: string, row: any) => (
        <div>
          <div className="text-sm font-medium">{value}</div>
          <div className="text-xs text-gray-500">
            นับสต็อกล่าสุด: {row.lastStockCount}
          </div>
        </div>
      )
    }
  ];

  const rowActions = (row: any) => (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm">
        <Edit className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ประเภทบุคลากร</h1>
          <p className="text-gray-600">จัดการประเภทและตำแหน่งบุคลากรในระบบ</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="ประเภททั้งหมด"
          value={mockPersonnelTypes.length}
          icon={<UserCheck className="w-5 h-5" />}
          color="blue"
          subtitle={`${mockPersonnelTypes.filter(p => p.isSystemDefault).length} ระบบเริ่มต้น`}
        />
        <StatCard
          title="ผู้ใช้รวม"
          value={mockPersonnelTypes.reduce((sum, p) => sum + p.userCount, 0)}
          icon={<Users className="w-5 h-5" />}
          color="green"
          subtitle="ผู้ใช้ทั้งหมดในระบบ"
        />
        <StatCard
          title="ระดับการจัดการ"
          value={mockPersonnelTypes.filter(p => getPermissionsCount(p) > 2).length}
          icon={<Shield className="w-5 h-5" />}
          color="purple"
          subtitle="ประเภทที่มีสิทธิ์จัดการ"
        />
        <StatCard
          title="ประเภทกำหนดเอง"
          value={mockPersonnelTypes.filter(p => !p.isSystemDefault).length}
          icon={<Settings className="w-5 h-5" />}
          color="orange"
          subtitle="สร้างโดยโรงพยาบาล"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="เพิ่มประเภทใหม่"
          description="สร้างประเภทบุคลากรใหม่สำหรับโรงพยาบาล"
          icon={<Plus className="w-5 h-5" />}
          href="/admin/personnel-types/new"
          color="blue"
        />
        <QuickActionCard
          title="จัดการสิทธิ์"
          description="กำหนดสิทธิ์การเข้าถึงตามประเภท"
          icon={<Shield className="w-5 h-5" />}
          href="/admin/personnel-types/permissions"
          color="green"
        />
        <QuickActionCard
          title="ลำดับชั้น"
          description="จัดการโครงสร้างลำดับชั้นองค์กร"
          icon={<Crown className="w-5 h-5" />}
          href="/admin/personnel-types/hierarchy"
          color="purple"
        />
      </div>

      {/* Data Table */}
      <DataTable
        title="ประเภทบุคลากรทั้งหมด"
        description="รายการประเภทบุคลากรและสิทธิ์การเข้าถึง"
        data={mockPersonnelTypes}
        columns={personnelColumns}
        searchKeys={['typeName', 'typeCode', 'typeNameEn', 'description']}
        rowActions={rowActions}
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มประเภทใหม่
          </Button>
        }
      />

      {/* Hierarchy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">โครงสร้างลำดับชั้น</h3>
          {mockPersonnelTypes
            .sort((a, b) => a.levelOrder - b.levelOrder)
            .map((type, index) => (
              <div key={type.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-400">
                  {type.levelOrder}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {hierarchyIcons[type.hierarchy as keyof typeof hierarchyIcons]}
                    <span className="font-medium">{type.typeName}</span>
                    <Badge variant="outline" className="text-xs">
                      {type.userCount} คน
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
              </div>
            ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">สิทธิ์การเข้าถึง</h3>
          <div className="space-y-3">
            {[
              { key: 'canManageHospitals', label: 'จัดการโรงพยาบาล' },
              { key: 'canManageWarehouses', label: 'จัดการคลัง' },
              { key: 'canManageDepartments', label: 'จัดการแผนก' },
              { key: 'canManagePersonnel', label: 'จัดการบุคลากร' },
              { key: 'canManageDrugs', label: 'จัดการยา' },
              { key: 'canManageMasterData', label: 'จัดการข้อมูลหลัก' }
            ].map((permission) => (
              <div key={permission.key} className="p-3 bg-white border rounded-lg">
                <div className="font-medium text-sm mb-2">{permission.label}</div>
                <div className="flex space-x-2">
                  {mockPersonnelTypes.map((type) => (
                    <div key={type.id} className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        type[permission.key as keyof typeof type] 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {type.levelOrder}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}