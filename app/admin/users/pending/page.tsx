// app/admin/users/pending/page.tsx - Fixed Fetch with Credentials
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  Clock,
  AlertTriangle,
  UserCheck,
  Loader2,
  RefreshCw,
  Settings
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
    departmentCode: string;
  };
  hospital: {
    name: string;
    hospitalCode: string;
  };
  createdAt: string;
  position?: string;
}

interface ApiResponse {
  users: PendingUser[];
  count: number;
  stats: {
    pending: number;
    oldestRequest: string | null;
    departmentBreakdown: Record<string, number>;
  };
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

function formatDateAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'เมื่อไม่กี่นาทีที่แล้ว';
  if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} วันที่แล้ว`;
}

interface ApprovalDialogProps {
  user: PendingUser | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string, assignedRole?: string) => Promise<void>;
  onReject: (userId: string, reason: string) => Promise<void>;
  isProcessing: boolean;
}

function ApprovalDialog({ user, isOpen, onClose, onApprove, onReject, isProcessing }: ApprovalDialogProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [assignedRole, setAssignedRole] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = async () => {
    if (!user || !action) return;

    if (action === 'approve') {
      await onApprove(user.id, assignedRole || undefined);
    } else {
      await onReject(user.id, rejectionReason);
    }
    
    // Reset form
    setAction(null);
    setAssignedRole('');
    setRejectionReason('');
  };

  useEffect(() => {
    if (!isOpen) {
      setAction(null);
      setAssignedRole('');
      setRejectionReason('');
    }
  }, [isOpen]);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>จัดการคำขออนุมัติ</span>
          </DialogTitle>
          <DialogDescription>
            ตรวจสอบข้อมูลและอนุมัติ/ปฏิเสธคำขอของ {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{user.name}</span>
              <Badge className={getRoleColor(user.role)}>
                {roleTranslations[user.role as keyof typeof roleTranslations]}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center mb-1">
                <Mail className="w-3 h-3 mr-1" />
                {user.email}
              </div>
              <div className="flex items-center mb-1">
                <Building2 className="w-3 h-3 mr-1" />
                {user.department?.name || 'ไม่ระบุแผนก'}
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                ส่งคำขอ {formatDateAgo(user.createdAt)}
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">เลือกการดำเนินการ</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={action === 'approve' ? 'default' : 'outline'}
                onClick={() => setAction('approve')}
                className="w-full"
                disabled={isProcessing}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                อนุมัติ
              </Button>
              <Button
                variant={action === 'reject' ? 'destructive' : 'outline'}
                onClick={() => setAction('reject')}
                className="w-full"
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                ปฏิเสธ
              </Button>
            </div>
          </div>

          {/* Role Assignment for Approval */}
          {action === 'approve' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">กำหนดบทบาท (ถ้าต้องการเปลี่ยน)</label>
              <Select value={assignedRole} onValueChange={setAssignedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="ใช้บทบาทเดิม" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleTranslations).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Rejection Reason */}
          {action === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">เหตุผลในการปฏิเสธ *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="ระบุเหตุผลในการปฏิเสธคำขอ..."
                required
                disabled={isProcessing}
              />
            </div>
          )}
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isProcessing || 
              !action || 
              (action === 'reject' && !rejectionReason.trim())
            }
            className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : (
              <>
                {action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PendingUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    oldestRequest: null as string | null,
    departmentBreakdown: {} as Record<string, number>
  });

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [UI] Fetching pending users...');
      console.log('🔍 [UI] Current cookies:', document.cookie);

      const response = await fetch('/api/admin/users/pending', {
        method: 'GET',
        credentials: 'include', // ส่ง cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 [UI] Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('กรุณาเข้าสู่ระบบใหม่');
        } else if (response.status === 403) {
          throw new Error('ไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้');
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'ไม่สามารถดึงข้อมูลได้');
      }

      const data: ApiResponse = await response.json();
      console.log('🔍 [UI] Received data:', data);
      
      setPendingUsers(data.users);
      setStats(data.stats);
      
    } catch (err) {
      console.error('❌ [UI] Error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, assignedRole?: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        credentials: 'include', // ส่ง cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'approve',
          assignRole: assignedRole
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถอนุมัติได้');
      }

      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      setStats(prev => ({ 
        ...prev, 
        pending: prev.pending - 1
      }));
      
      setShowDialog(false);
      setSelectedUser(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        credentials: 'include', // ส่ง cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'reject',
          reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถปฏิเสธได้');
      }

      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      setStats(prev => ({ 
        ...prev, 
        pending: prev.pending - 1
      }));
      
      setShowDialog(false);
      setSelectedUser(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalDialog = (user: PendingUser) => {
    setSelectedUser(user);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedUser(null);
    if (error) {
      setError(null);
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
        <div className="flex items-center justify-between mb-6">
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

        {/* Stats Overview */}
        {stats.pending > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">คำขอที่รอนานที่สุด</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.oldestRequest ? formatDateAgo(stats.oldestRequest) : 'ไม่มีข้อมูล'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Building2 className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">แผนกที่มีคำขอมากที่สุด</p>
                    <p className="text-lg font-bold text-gray-900">
                      {Object.entries(stats.departmentBreakdown).length > 0 
                        ? Object.entries(stats.departmentBreakdown)
                            .sort(([,a], [,b]) => b - a)[0][0]
                        : 'ไม่มีข้อมูล'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <UserCheck className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">รวมคำขอรอการอนุมัติ</p>
                    <p className="text-lg font-bold text-gray-900">{stats.pending} คำขอ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button 
                variant="link" 
                className="ml-2 h-auto p-0 text-red-600"
                onClick={() => setError(null)}
              >
                ปิด
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ไม่มีคำขอรอการอนุมัติ
              </h3>
              <p className="text-gray-600">
                ขณะนี้ไม่มีผู้ใช้ใหม่ที่รอการอนุมัติจากคุณ
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        {user.employeeId && (
                          <p className="text-sm text-gray-600">{user.employeeId}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getRoleColor(user.role)}>
                      {roleTranslations[user.role as keyof typeof roleTranslations]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        {user.phoneNumber}
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{user.department?.name || 'ไม่ระบุแผนก'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      ส่งคำขอ {formatDateAgo(user.createdAt)}
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Button
                      onClick={() => openApprovalDialog(user)}
                      disabled={processing}
                      className="w-full"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      จัดการคำขอ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approval Dialog */}
      <ApprovalDialog
        user={selectedUser}
        isOpen={showDialog}
        onClose={closeDialog}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={processing}
      />
    </div>
  );
}