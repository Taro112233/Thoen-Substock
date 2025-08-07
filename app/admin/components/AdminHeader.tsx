// app/admin/components/AdminHeader.tsx
'use client';

import { mockCurrentUser } from '@/lib/mock-data';
import { Settings } from 'lucide-react';
import HierarchyBadge from './HierarchyBadge';

export default function AdminHeader() {
  return (
    <header className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ศูนย์จัดการข้อมูลหลัก</h1>
              <p className="text-gray-600 mt-1">Admin Panel - Hospital Pharmacy Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">ผู้ใช้งาน</p>
              <p className="font-semibold">{mockCurrentUser.name}</p>
            </div>
            <HierarchyBadge hierarchy={mockCurrentUser.hierarchy} />
          </div>
        </div>
      </div>
    </header>
  );
}