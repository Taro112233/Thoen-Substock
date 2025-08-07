// app/admin/drugs/storage/page.tsx
"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { StatCard } from "@/components/admin/StatCard";
import { QuickActionCard } from "@/components/admin/QuickActionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Thermometer,
  Snowflake,
  Sun,
  Droplets,
  Shield,
  Edit,
  Trash2,
  Eye,
  Gauge,
} from "lucide-react";

// Mock data สำหรับ storage conditions
const mockStorageConditions = [
  {
    id: "1",
    storageCode: "RT",
    storageName: "Room Temperature",
    storageNameTh: "อุณหภูมิห้อง",
    temperatureMin: 15,
    temperatureMax: 30,
    requiresRefrigeration: false,
    protectFromLight: false,
    drugCount: 85,
    color: "#22c55e",
    isActive: true,
    isSystemDefault: true,
    storageInstructions: "เก็บในที่แห้ง ป้องกันแสงแดด",
  },
  {
    id: "2",
    storageCode: "FRIDGE",
    storageName: "Refrigerated",
    storageNameTh: "ในตู้เย็น",
    temperatureMin: 2,
    temperatureMax: 8,
    requiresRefrigeration: true,
    monitoringRequired: true,
    drugCount: 25,
    color: "#3b82f6",
    isActive: true,
    isSystemDefault: true,
    storageInstructions: "เก็บในตู้เย็น 2-8°C",
  },
  {
    id: "3",
    storageCode: "FREEZE",
    storageName: "Frozen",
    storageNameTh: "แช่แข็ง",
    temperatureMin: -25,
    temperatureMax: -10,
    requiresFreezing: true,
    monitoringRequired: true,
    drugCount: 8,
    color: "#06b6d4",
    isActive: true,
    isSystemDefault: true,
    storageInstructions: "เก็บในช่องแช่แข็ง -20°C หรือต่ำกว่า",
  },
  {
    id: "4",
    storageCode: "DRY",
    storageName: "Keep Dry",
    storageNameTh: "เก็บในที่แห้ง",
    temperatureMin: 15,
    temperatureMax: 25,
    humidityMax: 60,
    protectFromMoisture: true,
    drugCount: 32,
    color: "#f59e0b",
    isActive: true,
    isSystemDefault: true,
    storageInstructions: "เก็บในที่แห้ง ความชื้นไม่เกิน 60%",
  },
  {
    id: "5",
    storageCode: "DARK",
    storageName: "Protect from Light",
    storageNameTh: "ป้องกันแสง",
    temperatureMin: 15,
    temperatureMax: 30,
    protectFromLight: true,
    drugCount: 18,
    color: "#6b7280",
    isActive: true,
    isSystemDefault: true,
    storageInstructions: "เก็บในที่มืด ป้องกันแสงแดดและแสงไฟ",
  },
  {
    id: "6",
    storageCode: "CONTROLLED",
    storageName: "Controlled Environment",
    storageNameTh: "สภาพแวดล้อมควบคุม",
    temperatureMin: 20,
    temperatureMax: 25,
    humidityMin: 45,
    humidityMax: 65,
    protectFromLight: true,
    protectFromMoisture: true,
    monitoringRequired: true,
    drugCount: 12,
    color: "#8b5cf6",
    isActive: true,
    isSystemDefault: true,
    storageInstructions: "ควบคุมอุณหภูมิ ความชื้น และแสง",
  },
];

const getStorageIcon = (storage: any) => {
  if (storage.requiresFreezing) return <Snowflake className="w-4 h-4" />;
  if (storage.requiresRefrigeration) return <Thermometer className="w-4 h-4" />;
  if (storage.protectFromLight) return <Sun className="w-4 h-4" />;
  if (storage.protectFromMoisture) return <Droplets className="w-4 h-4" />;
  if (storage.monitoringRequired) return <Gauge className="w-4 h-4" />;
  return <Shield className="w-4 h-4" />;
};

export default function DrugStoragePage() {
  const storageColumns = [
    {
      key: "storageCode" as const,
      title: "รหัส",
      render: (value: string) => (
        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </div>
      ),
    },
    {
      key: "storageName" as const,
      title: "ชื่อเงื่อนไข",
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-2">
          <div style={{ color: row.color }}>{getStorageIcon(row)}</div>
          <div>
            <div className="font-medium">{row.storageNameTh}</div>
            <div className="text-sm text-gray-500">{value}</div>
          </div>
        </div>
      ),
    },
    {
      key: "temperatureMin" as const,
      title: "อุณหภูมิ",
      render: (value: number, row: any) => (
        <div className="text-center">
          <div className="font-medium">
            {value}°C - {row.temperatureMax}°C
          </div>
          <div className="text-xs text-gray-500">ช่วงอุณหภูมิที่เหมาะสม</div>
        </div>
      ),
    },
    {
      key: "drugCount" as const,
      title: "จำนวนยา",
      render: (value: number) => (
        <div className="text-center">
          <div className="text-lg font-semibold">{value}</div>
          <div className="text-xs text-gray-500">ยา</div>
        </div>
      ),
    },
    {
      key: "requiresRefrigeration" as const,
      title: "ข้อกำหนดพิเศษ",
      render: (value: boolean, row: any) => (
        <div className="space-y-1">
          {row.requiresRefrigeration && (
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              <Thermometer className="w-3 h-3 mr-1" />
              ตู้เย็น
            </Badge>
          )}
          {row.requiresFreezing && (
            <Badge className="bg-cyan-100 text-cyan-800 text-xs">
              <Snowflake className="w-3 h-3 mr-1" />
              แช่แข็ง
            </Badge>
          )}
          {row.protectFromLight && (
            <Badge className="bg-gray-100 text-gray-800 text-xs">
              <Sun className="w-3 h-3 mr-1" />
              ป้องกันแสง
            </Badge>
          )}
          {row.protectFromMoisture && (
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
              <Droplets className="w-3 h-3 mr-1" />
              ป้องกันความชื้น
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "monitoringRequired" as const,
      title: "การติดตาม",
      render: (value: boolean, row: any) => (
        <div className="text-center">
          {value ? (
            <Badge className="bg-green-100 text-green-800">
              <Eye className="w-3 h-3 mr-1" />
              ต้องติดตาม
            </Badge>
          ) : (
            <Badge variant="outline">ไม่จำเป็น</Badge>
          )}
        </div>
      ),
    },
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
          <h1 className="text-2xl font-bold text-gray-900">การเก็บรักษายา</h1>
          <p className="text-gray-600">
            จัดการเงื่อนไขการเก็บรักษายาและการควบคุมสิ่งแวดล้อม
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="เงื่อนไขทั้งหมด"
          value={mockStorageConditions.length}
          icon={<Thermometer className="w-5 h-5" />}
          color="blue"
          subtitle={`${
            mockStorageConditions.filter((s) => s.isSystemDefault).length
          } เงื่อนไขเริ่มต้น`}
        />
        <StatCard
          title="ต้องควบคุมอุณหภูมิ"
          value={
            mockStorageConditions.filter(
              (s) => s.requiresRefrigeration || s.requiresFreezing
            ).length
          }
          icon={<Snowflake className="w-5 h-5" />}
          color="blue"
          subtitle="ตู้เย็น และ แช่แข็ง"
        />
        <StatCard
          title="ต้องติดตาม"
          value={
            mockStorageConditions.filter((s) => s.monitoringRequired).length
          }
          icon={<Eye className="w-5 h-5" />}
          color="green"
          subtitle="ต้องตรวจสอบสภาพ"
        />
        <StatCard
          title="ยาทั้งหมด"
          value={mockStorageConditions.reduce((sum, s) => sum + s.drugCount, 0)}
          icon={<Shield className="w-5 h-5" />}
          color="purple"
          subtitle="รายการยาในระบบ"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="เพิ่มเงื่อนไขใหม่"
          description="สร้างเงื่อนไขการเก็บรักษาใหม่"
          icon={<Plus className="w-5 h-5" />}
          href="/admin/drugs/storage/new"
          color="blue"
        />
        <QuickActionCard
          title="ระบบติดตามอุณหภูมิ"
          description="จัดการการติดตามและแจ้งเตือน"
          icon={<Gauge className="w-5 h-5" />}
          href="/admin/drugs/storage/monitoring"
          color="green"
        />
        <QuickActionCard
          title="รายงานการเก็บรักษา"
          description="วิเคราะห์ประสิทธิภาพการเก็บรักษา"
          icon={<Shield className="w-5 h-5" />}
          href="/admin/drugs/storage/reports"
          color="purple"
        />
      </div>
    </div>
  );
}
