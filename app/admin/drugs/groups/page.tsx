// app/admin/drugs/groups/page.tsx
'use client';

import { useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatCard } from '@/components/admin/StatCard';
import { QuickActionCard } from '@/components/admin/QuickActionCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Tags, 
  Activity,
  AlertTriangle,
  Shield,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

// Mock data สำหรับ drug groups
const mockDrugGroups = [
  {
    id: '1',
    groupCode: 'ANTI',
    groupName: 'Antibiotic',
    groupNameTh: 'ยาปฏิชีวนะ',
    therapeuticClass: 'Anti-infective',
    description: 'ยาต้านเชื้อแบคทีเรีย',
    requiresMonitoring: true,
    hasInteractions: true,
    riskLevel: 'MEDIUM',
    drugCount: 25,
    isActive: true,
    isSystemDefault: true,
    parentGroup: null,
    childrenCount: 3
  },
  {
    id: '2',
    groupCode: 'ANALG',
    groupName: 'Analgesic',
    groupNameTh: 'ยาแก้ปวด',
    therapeuticClass: 'Pain Relief',
    description: 'ยาบรรเทาอาการปวด',
    requiresMonitoring: false,
    hasInteractions: false,
    riskLevel: 'LOW',
    drugCount: 18,
    isActive: true,
    isSystemDefault: true,
    parentGroup: null,
    childrenCount: 2
  },
  {
    id: '3',
    groupCode: 'ANTIH',
    groupName: 'Antihistamine',
    groupNameTh: 'ยาต้านฮีสตามีน',
    therapeuticClass: 'Allergy',
    description: 'ยาแก้แพ้',
    requiresMonitoring: false,
    hasInteractions: false,
    riskLevel: 'LOW',
    drugCount: 12,
    isActive: true,
    isSystemDefault: true,
    parentGroup: null,
    childrenCount: 0
  },
  {
    id: '4',
    groupCode: 'ANTIV',
    groupName: 'Antiviral',
    groupNameTh: 'ยาต้านไวรัส',
    therapeuticClass: 'Anti-infective',
    description: 'ยาต้านเชื้อไวรัส',
    requiresMonitoring: true,
    hasInteractions: true,
    riskLevel: 'MEDIUM',
    drugCount: 8,
    isActive: true,
    isSystemDefault: true,
    parentGroup: null,
    childrenCount: 1
  },
  {
    id: '5',
    groupCode: 'CARD',
    groupName: 'Cardiovascular',
    groupNameTh: 'ยาหัวใจและหลอดเลือด',
    therapeuticClass: 'Cardiovascular',
    description: 'ยาสำหรับโรคหัวใจและหลอดเลือด',
    requiresMonitoring: true,
    hasInteractions: true,
    riskLevel: 'HIGH',
    drugCount: 32,
    isActive: true,
    isSystemDefault: true,
    parentGroup: null,
    childrenCount: 4
  }
];

const riskLevelColors = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-red-100 text-red-800 border-red-200',
  CRITICAL: 'bg-red-200 text-red-900 border-red-300'
};

export default function DrugGroupsPage() {
  const drugGroupColumns = [
    {
      key: 'groupCode' as const,
      title: 'รหัส',
      render: (value: string) => (
        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </div>
      )
    },
    {
      key: 'groupName' as const,
      title: 'ชื่อกลุ่ม',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{row.groupNameTh}</div>
          <div className="text-sm text-gray-500">{value}</div>
          <Badge variant="outline" className="text-xs mt-1">
            {row.therapeuticClass}
          </Badge>
        </div>
      )
    },
    {
      key: 'description' as const,
      title: 'คำอธิบาย',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate" title={value}>
            {value}
          </p>
        </div>
      )
    },
    {
      key: 'drugCount' as const,
      title: 'จำนวนยา',
      render: (value: number, row: any) => (
        <div className="text-center">
          <div className="text-lg font-semibold">{value}</div>
          <div className="text-xs text-gray-500">ยา</div>
          {row.childrenCount > 0 && (
            <div className="text-xs text-blue-600 mt-1">
              {row.childrenCount} กลุ่มย่อย
            </div>
          )}
        </div>
      )
    },
    {
      key: 'riskLevel' as const,
      title: 'ความเสี่ยง',
      render: (value: string, row: any) => (
        <div className="space-y-2">
          <Badge className={riskLevelColors[value as keyof typeof riskLevelColors]}>
            {value === 'LOW' && 'ต่ำ'}
            {value === 'MEDIUM' && 'ปานกลาง'}
            {value === 'HIGH' && 'สูง'}
            {value === 'CRITICAL' && 'วิกฤต'}
          </Badge>
          <div className="space-y-1">
            {row.requiresMonitoring && (
              <div className="flex items-center text-xs text-orange-600">
                <Eye className="w-3 h-3 mr-1" />
                ต้องติดตาม
              </div>
            )}
            {row.hasInteractions && (
              <div className="flex items-center text-xs text-red-600">
                <AlertTriangle className="w-3 h-3 mr-1" />
                มีปฏิกิริยา
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'isSystemDefault' as const,
      title: 'สถานะ',
      render: (value: boolean, row: any) => (
        <div className="space-y-1">
          <Badge variant={row.isActive ? 'default' : 'secondary'}>
            {row.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
          </Badge>
          {value && (
            <Badge variant="outline" className="text-xs">
              ระบบ
            </Badge>
          )}
        </div>
      )
    }
  ];

  const rowActions = (row: any) => (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm">
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <Edit className="w-4 h-4" />
      </Button>
      {!row.isSystemDefault && (
        <Button variant="ghost" size="sm" className="text-red-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">กลุ่มยา</h1>
          <p className="text-gray-600">จัดการกลุ่มยาตามการรักษาและเภสัชวิทยา</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="กลุ่มยาทั้งหมด"
          value={mockDrugGroups.length}
          icon={<Tags className="w-5 h-5" />}
          color="blue"
          subtitle={`${mockDrugGroups.filter(g => g.isSystemDefault).length} กลุ่มเริ่มต้น`}
        />
        <StatCard
          title="ยาทั้งหมด"
          value={mockDrugGroups.reduce((sum, g) => sum + g.drugCount, 0)}
          icon={<Activity className="w-5 h-5" />}
          color="green"
          subtitle="รายการยาในระบบ"
        />
        <StatCard
          title="ความเสี่ยงสูง"
          value={mockDrugGroups.filter(g => ['HIGH', 'CRITICAL'].includes(g.riskLevel)).length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          subtitle="กลุ่มที่ต้องระวัง"
        />
        <StatCard
          title="ต้องติดตาม"
          value={mockDrugGroups.filter(g => g.requiresMonitoring).length}
          icon={<Shield className="w-5 h-5" />}
          color="orange"
          subtitle="กลุ่มที่ต้องติดตามการใช้"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="เพิ่มกลุ่มยาใหม่"
          description="สร้างกลุ่มยาใหม่สำหรับการจัดหมวดหมู่"
          icon={<Plus className="w-5 h-5" />}
          href="/admin/drugs/groups/new"
          color="blue"
        />
        <QuickActionCard
          title="จัดการความเสี่ยง"
          description="ตั้งค่าระดับความเสี่ยงและการติดตาม"
          icon={<AlertTriangle className="w-5 h-5" />}
          href="/admin/drugs/groups/risk"
          color="orange"
        />
        <QuickActionCard
          title="ปฏิกิริยาระหว่างยา"
          description="จัดการข้อมูลปฏิกิริยาระหว่างกลุ่มยา"
          icon={<Shield className="w-5 h-5" />}
          href="/admin/drugs/groups/interactions"
          color="red"
        />
      </div>

      {/* Data Table */}
      <DataTable
        title="กลุ่มยาทั้งหมด"
        description="รายการกลุ่มยาและข้อมูลความปลอดภัย"
        data={mockDrugGroups}
        columns={drugGroupColumns}
        searchKeys={['groupName', 'groupNameTh', 'groupCode', 'therapeuticClass']}
        rowActions={rowActions}
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มกลุ่มยา
          </Button>
        }
      />

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">การกระจายตามความเสี่ยง</h3>
          <div className="space-y-3">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((risk) => {
              const count = mockDrugGroups.filter(g => g.riskLevel === risk).length;
              const percentage = (count / mockDrugGroups.length) * 100;
              
              return (
                <div key={risk} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {risk === 'LOW' && 'ความเสี่ยงต่ำ'}
                      {risk === 'MEDIUM' && 'ความเสี่ยงปานกลาง'}
                      {risk === 'HIGH' && 'ความเสี่ยงสูง'}
                      {risk === 'CRITICAL' && 'ความเสี่ยงวิกฤต'}
                    </span>
                    <span>{count} กลุ่ม</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">การจัดการพิเศษ</h3>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-5 h-5 text-orange-600" />
                <span className="font-medium">ต้องติดตามการใช้</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {mockDrugGroups.filter(g => g.requiresMonitoring).length}
              </div>
              <div className="text-sm text-orange-700">กลุ่มยา</div>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium">มีปฏิกิริยาระหว่างยา</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {mockDrugGroups.filter(g => g.hasInteractions).length}
              </div>
              <div className="text-sm text-red-700">กลุ่มยา</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}