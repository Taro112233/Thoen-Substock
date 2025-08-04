// app/admin/users/pending/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield,
  Calendar,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  phoneNumber?: string;
  department?: {
    name: string;
    code: string;
  };
  hospital: {
    name: string;
    code: string;
  };
  createdAt: string;
  position?: string;
}

interface ApiResponse {
  users: PendingUser[];
  count: number;
}

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
    HOSPITAL_ADMIN: 'bg-red-100 text-red-800 border-red-200',
    PHARMACY_MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
    SENIOR_PHARMACIST: 'bg-blue-100 text-blue-800 border-blue-200',
    STAFF_PHARMACIST: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    DEPARTMENT_HEAD: 'bg-green-100 text-green-800 border-green-200',
    STAFF_NURSE: 'bg-teal-100 text-teal-800 border-teal-200',
    PHARMACY_TECHNICIAN: 'bg-orange-100 text-orange-800 border-orange-200'
  };
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface UserApprovalCardProps {
  user: PendingUser;
  onApprove: (userId: string) => Promise<void>;
  onReject: (userId: string) => Promise<void>;
  disabled: boolean;
}

function UserApprovalCard({ user, onApprove, onReject, disabled }: UserApprovalCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    if (disabled || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setAction('approve');
      await onApprove(user.id);
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (disabled || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setAction('reject');
      await onReject(user.id);
    } catch (error) {
      console.error('Reject error:', error);
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {user.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{user.position || 'ไม่ระบุตำแหน่ง'}</p>
            </div>
          </div>
          <Badge className={`${getRoleColor(user.role)} border`}>
            {roleTranslations[user.role as keyof typeof roleTranslations] || user.role}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* ข้อมูลผู้ใช้ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{user.phoneNumber || 'ไม่ระบุ'}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Building2 className="w-4 h-4" />
            <span>{user.department?.name || 'ไม่ระบุแผนก'}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Shield className="w-4 h-4" />
            <span>รหัส: {user.employeeId || 'ไม่ระบุ'}</span>
          </div>
        </div>

        {/* วันที่สมัคร */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
          <Calendar className="w-4 h-4" />
          <span>สมัครเมื่อ: {formatDate(user.createdAt)}</span>
        </div>

        {/* ปุ่มดำเนินการ */}
        <div className="flex space-x-3 pt-4">
          <Button 
            onClick={handleApprove}
            disabled={disabled || isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {isProcessing && action === 'approve' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังอนุมัติ...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                อนุมัติ
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleReject}
            disabled={disabled || isProcessing}
            variant="destructive"
            className="flex-1 disabled:opacity-50"
          >
            {isProcessing && action === 'reject' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังปฏิเสธ...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                ปฏิเสธ
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PendingUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0
  });

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual hospital ID from user context
      const response = await fetch('/api/admin/users/pending?hospitalId=demo-hospital-id');
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลได้');
      }

      const data: ApiResponse = await response.json();
      setPendingUsers(data.users);
      setStats(prev => ({ ...prev, pending: data.count }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'approve'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถอนุมัติได้');
      }

      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      setStats(prev => ({ 
        ...prev, 
        pending: prev.pending - 1,
        approvedToday: prev.approvedToday + 1 
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'reject',
          reason: 'ปฏิเสธโดยผู้ดูแลระบบ' // TODO: Add reason input
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถปฏิเสธได้');
      }

      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      setStats(prev => ({ 
        ...prev, 
        pending: prev.pending - 1,
        rejectedToday: prev.rejectedToday + 1 
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">กำลังโหลดข้อมูลผู้ใช้ที่รอการอนุมัติ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              อนุมัติผู้ใช้งานใหม่
            </h1>
            <p className="text-gray-600">
              จัดการคำขออนุมัติการเข้าใช้งานระบบจากผู้ใช้ใหม่
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {stats.pending > 0 && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {stats.pending} คำขอรอการอนุมัติ
              </Badge>
            )}
            <Button 
              onClick={fetchPendingUsers}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <Alert variant="error">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* สถิติ */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">รอการอนุมัติ</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">อนุมัติวันนี้</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedToday}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ปฏิเสธวันนี้</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedToday}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* รายการผู้ใช้รอการอนุมัติ */}
      <div className="max-w-7xl mx-auto">
        {pendingUsers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingUsers.map((user) => (
              <UserApprovalCard
                key={user.id}
                user={user}
                onApprove={handleApprove}
                onReject={handleReject}
                disabled={processing}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ไม่มีคำขอรอการอนุมัติ
              </h3>
              <p className="text-gray-600 mb-4">
                ผู้ใช้งานใหม่ทั้งหมดได้รับการอนุมัติแล้ว
              </p>
              <Button 
                onClick={fetchPendingUsers}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                ตรวจสอบอีกครั้ง
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}