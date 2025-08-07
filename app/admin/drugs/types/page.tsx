// app/admin/drugs/types/page.tsx
'use client';

import { useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { StatCard } from '@/components/admin/StatCard';
import { QuickActionCard } from '@/components/admin/QuickActionCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Shield, 
  AlertTriangle,
  Eye,
  Lock,
  Skull,
  ArrowRight,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';

// Mock data สำหรับ drug types
const mockDrugTypes = [
  {
    id: '1',
    typeCode: 'HIGH_ALERT',
    typeName: 'High Alert Drug',
    typeNameTh: 'ยาเสี่ยงสูง',
    isHighAlert: true,
    isNarcotic: false,
    isControlled: false,
    requiresWitness: true,
    requiresApproval: true,
    auditRequired: true,
    drugCount: 15,
    color: '#dc2626',
    isActive: true,
    isSystemDefault: true,
    description: 'ยาที่มีความเสี่ยงสูงในการใช้ ต้องมีการตรวจสอบพิเศษ'
  },
  {
    id: '2',
    typeCode: 'NARCOTIC',
    typeName: 'Narcotic Drug',
    typeNameTh: 'ยาเสพติด',
    isHighAlert: true,
    isNarcotic: true,
    isControlled: true,
    requiresWitness: true,
    requiresApproval: true,
    requiresDoubleLock: true,
    auditRequired: true,
    reportingRequired: true,
    drugCount: 8,
    color: '#dc2626',
    isActive: true,
    isSystemDefault: true,
    description: 'ยาเสพติดที่ต้องควบคุมอย่างเข้มงวด'
  },
  {
    id: '3',
    typeCode: 'CONTROLLED',
    typeName: 'Controlled Drug',
    typeNameTh: 'ยาควบคุม',
    isHighAlert: false,
    isNarcotic: false,
    isControlled: true,
    requiresApproval: true,
    auditRequired: true,
    drugCount: 22,
    color: '#f59e0b',
    isActive: true,
    isSystemDefault: true,
    description: 'ยาที่ต้องมีการควบคุมการใช้'
  },
  {
    id: '4',
    typeCode: 'PSYCHO',
    typeName: 'Psychotropic Drug',
    typeNameTh: 'ยาจิตเวช',
    isHighAlert: false,
    isNarcotic: false,
    isPsychotropic: true,
    isControlled: true,
    requiresApproval: true,
    auditRequired: true,
    drugCount: 12,
    color: '#8b5cf6',
    isActive: true,
    isSystemDefault: true,
    description: 'ยาจิตเวชที่ต้องควบคุม'
  },
  {
    id: '5',
    typeCode: 'REFER',
    typeName: 'Refer Drug',
    typeNameTh: 'ยา Refer',
    isHighAlert: false,
    isNarcotic: false,
    isRefer: true,
    requiresApproval: true,
    drugCount: 18,
    color: '#06b6d4',
    isActive: true,
    isSystemDefault: true,
    description: 'ยาที่ต้องส่งต่อหรือขออนุมัติพิเศษ'
  },
  {
    id: '6',
    typeCode: 'DANGEROUS',
    typeName: 'Dangerous Drug',
    typeNameTh: 'ยาอันตราย',
    isHighAlert: true,
    isNarcotic: false,
    isDangerous: true,
    requiresWitness: true,
    auditRequired: true,
    drugCount: 6,
    color: '#dc2626',
    isActive: true,
    isSystemDefault: true,
    description: 'ยาที่อันตรายต่อการใช้'
  }
];

const getTypeIcon = (type: any) => {
  if (type.isNarcotic) return <Skull className="w-4 h-4" />;
  if (type.isHighAlert) return <AlertTriangle className="w-4 h-4" />;
  if (type.isControlled) return <Lock className="w-4 h-4" />;
  if (type.isRefer) return <ArrowRight className="w-4 h-4" />;
  return <Shield className="w-4 h-4" />;
};

export default function DrugTypesPage() {
  const drugTypeColumns = [
    {
      key: 'typeCode' as const,
      title: 'รหัส',
      render: (value: string) => (
        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </div>
      )
    },
    {
      key: 'typeName' as const,
      title: 'ชื่อประเภท',
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <div style={{ color: row.color }}>
            {getTypeIcon(row)}
          </div>
          <div>
            <div className="font-medium">{row.typeNameTh}</div>
            <div className="text-sm text-gray-500">{value}</div>
          </div>
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
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-semibold">{value}</div>
          <div className="text-xs text-gray-500">ยา</div>
        </div>
      )
    },
    {
      key: 'isHighAlert' as const,
      title: 'ข้อกำหนดพิเศษ',
      render: (value: boolean, row: any) => (
        <div className="space-y-1">
          {row.isHighAlert && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              High Alert
            </Badge>
          )}
          {row.isNarcotic && (
            <Badge className="bg-red-100 text-red-800 text-xs">
              <Skull className="w-3 h-3 mr-1" />
              เสพติด
            </Badge>
          )}
          {row.isControlled && (
            <Badge className="bg-orange-100 text-orange-800 text-xs">
              <Lock className="w-3 h-3 mr-1" />
              ควบคุม
            </Badge>
          )}
          {row.requiresWitness && (
            <Badge variant="outline" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              ต้องมีพยาน
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'auditRequired' as const,
      title: 'การตรวจสอบ',
      render: (value: boolean, row: any) => (
        <div className="space-y-1">
          {value && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Audit Trail
            </Badge>
          )}
          {row.requiresApproval && (
            <Badge className="bg-purple-100 text-purple-800 text-xs">
              ต้องอนุมัติ
            </Badge>
          )}
          {row.reportingRequired && (
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
              ต้องรายงาน
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
          <h1 className="text-2xl font-bold text-gray-900">ประเภทยา</h1>
          <p className="text-gray-600">จัดการประเภทยาและข้อกำหนดความปลอดภัย</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="ประเภททั้งหมด"
          value={mockDrugTypes.length}
          icon={<Shield className="w-5 h-5" />}
          color="blue"
          subtitle={`${mockDrugTypes.filter(t => t.isSystemDefault).length} ประเภทเริ่มต้น`}
        />
        <StatCard
          title="High Alert Drug"
          value={mockDrugTypes.filter(t => t.isHighAlert).length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          subtitle="ยาเสี่ยงสูง"
        />
        <StatCard
          title="ยาควบคุม"
          value={mockDrugTypes.filter(t => t.isControlled).length}
          icon={<Lock className="w-5 h-5" />}
          color="orange"
          subtitle="ต้องควบคุมการใช้"
        />
        <StatCard
          title="ต้องมี Audit"
          value={mockDrugTypes.filter(t => t.auditRequired).length}
          icon={<Settings className="w-5 h-5" />}
          color="purple"
          subtitle="ต้องบันทึกการใช้"
        />
      </div>

      {/* Data Table */}
      <DataTable
        title="เงื่อนไขการเก็บรักษาทั้งหมด"
        description="รายการเงื่อนไขการเก็บรักษายาและการควบคุมสิ่งแวดล้อม"
        data={mockStorageConditions}
        columns={storageColumns}
        searchKeys={['storageName', 'storageNameTh', 'storageCode', 'storageInstructions']}
        rowActions={rowActions}
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มเงื่อนไขใหม่
          </Button>
        }
      />

      {/* Temperature Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">การกระจายตามอุณหภูมิ</h3>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Snowflake className="w-5 h-5 text-blue-600" />
                <span className="font-medium">แช่แข็ง (≤ -10°C)</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {mockStorageConditions.filter(s => s.requiresFreezing).length}
              </div>
              <div className="text-sm text-blue-700">เงื่อนไข</div>
              <div className="mt-2">
                <Progress 
                  value={(mockStorageConditions.filter(s => s.requiresFreezing).length / mockStorageConditions.length) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
            
            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Thermometer className="w-5 h-5 text-cyan-600" />
                <span className="font-medium">ตู้เย็น (2-8°C)</span>
              </div>
              <div className="text-2xl font-bold text-cyan-600">
                {mockStorageConditions.filter(s => s.requiresRefrigeration && !s.requiresFreezing).length}
              </div>
              <div className="text-sm text-cyan-700">เงื่อนไข</div>
              <div className="mt-2">
                <Progress 
                  value={(mockStorageConditions.filter(s => s.requiresRefrigeration && !s.requiresFreezing).length / mockStorageConditions.length) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium">อุณหภูมิห้อง (15-30°C)</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {mockStorageConditions.filter(s => !s.requiresRefrigeration && !s.requiresFreezing).length}
              </div>
              <div className="text-sm text-green-700">เงื่อนไข</div>
              <div className="mt-2">
                <Progress 
                  value={(mockStorageConditions.filter(s => !s.requiresRefrigeration && !s.requiresFreezing).length / mockStorageConditions.length) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ข้อกำหนดพิเศษ</h3>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">ป้องกันแสง</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {mockStorageConditions.filter(s => s.protectFromLight).length}
              </div>
              <div className="text-sm text-yellow-700">เงื่อนไข</div>
              <div className="text-xs text-yellow-600 mt-1">
                {mockStorageConditions.filter(s => s.protectFromLight).reduce((sum, s) => sum + s.drugCount, 0)} ยา
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-5 h-5 text-orange-600" />
                <span className="font-medium">ป้องกันความชื้น</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {mockStorageConditions.filter(s => s.protectFromMoisture).length}
              </div>
              <div className="text-sm text-orange-700">เงื่อนไข</div>
              <div className="text-xs text-orange-600 mt-1">
                {mockStorageConditions.filter(s => s.protectFromMoisture).reduce((sum, s) => sum + s.drugCount, 0)} ยา
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Gauge className="w-5 h-5 text-purple-600" />
                <span className="font-medium">ต้องติดตามอย่างใกล้ชิด</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {mockStorageConditions.filter(s => s.monitoringRequired).length}
              </div>
              <div className="text-sm text-purple-700">เงื่อนไข</div>
              <div className="text-xs text-purple-600 mt-1">
                ติดตามอุณหภูมิและความชื้นตลอดเวลา
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Instructions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockStorageConditions.map((storage) => (
          <div key={storage.id} className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <div style={{ color: storage.color }}>
                {getStorageIcon(storage)}
              </div>
              <div>
                <h4 className="font-medium">{storage.storageNameTh}</h4>
                <p className="text-sm text-gray-500">{storage.storageName}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">อุณหภูมิ:</span>
                <span className="font-medium">{storage.temperatureMin}°C - {storage.temperatureMax}°C</span>
              </div>
              
              {storage.humidityMax && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ความชื้น:</span>
                  <span className="font-medium">≤ {storage.humidityMax}%</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">จำนวนยา:</span>
                <span className="font-medium">{storage.drugCount} ยา</span>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-600">{storage.storageInstructions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="เพิ่มประเภทใหม่"
          description="สร้างประเภทยาใหม่สำหรับการจัดการ"
          icon={<Plus className="w-5 h-5" />}
          href="/admin/drugs/types/new"
          color="blue"
        />
        <QuickActionCard
          title="ตั้งค่าความปลอดภัย"
          description="กำหนดข้อกำหนดและระดับความปลอดภัย"
          icon={<Shield className="w-5 h-5" />}
          href="/admin/drugs/types/security"
          color="orange"
        />
        <QuickActionCard
          title="Audit & Reporting"
          description="จัดการการตรวจสอบและรายงาน"
          icon={<Settings className="w-5 h-5" />}
          href="/admin/drugs/types/audit"
          color="purple"
        />
      </div>

      {/* Data Table */}
      <DataTable
        title="ประเภทยาทั้งหมด"
        description="รายการประเภทยาและข้อกำหนดความปลอดภัย"
        data={mockDrugTypes}
        columns={drugTypeColumns}
        searchKeys={['typeName', 'typeNameTh', 'typeCode', 'description']}
        rowActions={rowActions}
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มประเภทยา
          </Button>
        }
      />

      {/* Security Requirements Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">ข้อกำหนดความปลอดภัย</h3>
          <div className="space-y-3">
            {[
              { key: 'requiresWitness', label: 'ต้องมีพยาน', icon: <Eye className="w-4 h-4" /> },
              { key: 'requiresApproval', label: 'ต้องการอนุมัติ', icon: <Settings className="w-4 h-4" /> },
              { key: 'requiresDoubleLock', label: 'ต้องล็อคคู่', icon: <Lock className="w-4 h-4" /> },
              { key: 'auditRequired', label: 'ต้องมี Audit Trail', icon: <Shield className="w-4 h-4" /> }
            ].map((req) => {
              const count = mockDrugTypes.filter(type => type[req.key as keyof typeof type]).length;
              return (
                <div key={req.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-600">{req.icon}</div>
                    <span className="font-medium">{req.label}</span>
                  </div>
                  <Badge variant="outline">{count} ประเภท</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">การจำแนกตามความเสี่ยง</h3>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Skull className="w-5 h-5 text-red-600" />
                <span className="font-medium">ยาเสพติด</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {mockDrugTypes.filter(t => t.isNarcotic).length}
              </div>
              <div className="text-sm text-red-700">ประเภท</div>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-medium">High Alert Drug</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {mockDrugTypes.filter(t => t.isHighAlert).length}
              </div>
              <div className="text-sm text-orange-700">ประเภท</div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowRight className="w-5 h-5 text-blue-600" />
                <span className="font-medium">ยา Refer</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {mockDrugTypes.filter(t => t.isRefer).length}
              </div>
              <div className="text-sm text-blue-700">ประเภท</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}