// app/admin/users/pending/page.tsx - Redesigned with Drug Management UI Structure (Fixed)
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
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
  Settings,
  Search,
  Grid3x3,
  List,
  Shield,
  IdCard,
  Briefcase,
  Users
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

// Approval Dialog Component
function ApprovalDialog({ user, isOpen, onClose, onConfirm, isProcessing }: {
  user: PendingUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assignedRole?: string) => Promise<void>;
  isProcessing: boolean;
}) {
  const [assignedRole, setAssignedRole] = useState<string>('');

  const handleSubmit = async () => {
    if (!user) return;
    await onConfirm(assignedRole || undefined);
    setAssignedRole('');
  };

  useEffect(() => {
    if (!isOpen) {
      setAssignedRole('');
    }
  }, [isOpen]);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span>อนุมัติผู้ใช้งาน</span>
          </DialogTitle>
          <DialogDescription>
            ยืนยันการอนุมัติคำขอของ {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
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
              {user.employeeId && (
                <div className="flex items-center mb-1">
                  <IdCard className="w-3 h-3 mr-1" />
                  {user.employeeId}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                ส่งคำขอ {formatDateAgo(user.createdAt)}
              </div>
            </div>
          </div>

          {/* Role Assignment */}
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
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Rejection Dialog Component
function RejectionDialog({ user, isOpen, onClose, onConfirm, isProcessing }: {
  user: PendingUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isProcessing: boolean;
}) {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = async () => {
    if (!user || !rejectionReason.trim()) return;
    await onConfirm(rejectionReason);
    setRejectionReason('');
  };

  useEffect(() => {
    if (!isOpen) {
      setRejectionReason('');
    }
  }, [isOpen]);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-700">
            <XCircle className="w-5 h-5" />
            <span>ปฏิเสธผู้ใช้งาน</span>
          </DialogTitle>
          <DialogDescription>
            ปฏิเสธคำขอของ {user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
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

          {/* Rejection Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">เหตุผลในการปฏิเสธ *</label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="ระบุเหตุผลในการปฏิเสธคำขอ..."
              required
              disabled={isProcessing}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !rejectionReason.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// User Card Component for Display - Simplified with List View Support
function UserCard({ user, onApprove, onReject, isProcessing, viewMode }: {
  user: PendingUser;
  onApprove: (user: PendingUser) => void;
  onReject: (user: PendingUser) => void;
  isProcessing: boolean;
  viewMode: 'grid' | 'list';
}) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left side - User info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{user.name}</h4>
                <p className="text-sm text-gray-600">{user.department?.name || 'ไม่ระบุแผนก'}</p>
              </div>
            </div>
            
            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => onApprove(user)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                อนุมัติ
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(user)}
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4 mr-1" />
                ปฏิเสธ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view - original layout
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header - Simple */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{user.name}</h4>
                <p className="text-sm text-gray-600">{user.department?.name || 'ไม่ระบุแผนก'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              onClick={() => onApprove(user)}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              อนุมัติ
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(user)}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-1" />
              ปฏิเสธ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PendingUsersPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState({
    pending: 0,
    oldestRequest: null as string | null,
    departmentBreakdown: {} as Record<string, number>
  });

  // Filter users based on search term
  useEffect(() => {
    const filtered = pendingUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [pendingUsers, searchTerm]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users/pending', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
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
      setPendingUsers(data.users);
      setStats(data.stats);
      
    } catch (err) {
      console.error('❌ [UI] Error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (assignedRole?: string) => {
    if (!selectedUser) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'approve',
          assignRole: assignedRole
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถอนุมัติได้');
      }

      setPendingUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setStats(prev => ({ 
        ...prev, 
        pending: prev.pending - 1
      }));
      
      setShowApprovalDialog(false);
      setSelectedUser(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedUser) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'reject',
          reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถปฏิเสธได้');
      }

      setPendingUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setStats(prev => ({ 
        ...prev, 
        pending: prev.pending - 1
      }));
      
      setShowRejectionDialog(false);
      setSelectedUser(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalDialog = (user: PendingUser) => {
    setSelectedUser(user);
    setShowApprovalDialog(true);
  };

  const openRejectionDialog = (user: PendingUser) => {
    setSelectedUser(user);
    setShowRejectionDialog(true);
  };

  const closeDialogs = () => {
    setShowApprovalDialog(false);
    setShowRejectionDialog(false);
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
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">กำลังโหลดข้อมูลผู้ใช้ที่รอการอนุมัติ...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>อนุมัติผู้ใช้งานใหม่</CardTitle>
                <CardDescription>จัดการคำขออนุมัติการเข้าใช้งานระบบจากผู้ใช้ใหม่</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {stats.pending > 0 && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {stats.pending} คำขอรอการอนุมัติ
                </Badge>
              )}
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
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
        </CardHeader>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
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

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาผู้ใช้..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'ไม่พบผู้ใช้ที่ค้นหา' : 'ไม่มีคำขอรอการอนุมัติ'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง' 
                    : 'ขณะนี้ไม่มีผู้ใช้ใหม่ที่รอการอนุมัติจากคุณ'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onApprove={openApprovalDialog}
                  onReject={openRejectionDialog}
                  isProcessing={processing}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <ApprovalDialog
        user={selectedUser}
        isOpen={showApprovalDialog}
        onClose={closeDialogs}
        onConfirm={handleApprove}
        isProcessing={processing}
      />

      {/* Rejection Dialog */}
      <RejectionDialog
        user={selectedUser}
        isOpen={showRejectionDialog}
        onClose={closeDialogs}
        onConfirm={handleReject}
        isProcessing={processing}
      />
    </div>
  );
}