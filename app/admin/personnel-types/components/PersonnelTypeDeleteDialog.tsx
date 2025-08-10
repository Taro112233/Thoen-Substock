// app/admin/personnel-types/components/PersonnelTypeDeleteDialog.tsx
// ===================================

'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Loader2, 
  AlertTriangle,
  Users,
  Shield,
  Crown,
  Trash2
} from 'lucide-react';
import type { PersonnelType } from '../types/personnel-type';

interface PersonnelTypeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnelType: PersonnelType | null;
  onSuccess: () => void;
}

export function PersonnelTypeDeleteDialog({
  open,
  onOpenChange,
  personnelType,
  onSuccess
}: PersonnelTypeDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  const handleDelete = async () => {
    if (!personnelType) return;

    try {
      setLoading(true);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (forceDelete) {
        headers['X-Force-Delete'] = 'true';
      }

      const response = await fetch(`/api/admin/personnel-types/${personnelType.id}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'ลบประเภทบุคลากรเรียบร้อยแล้ว');
        onSuccess();
      } else if (response.status === 409) {
        // Conflict - มีผู้ใช้งาน
        toast.error(result.error);
        if (result.conflictType === 'USERS_EXIST') {
          // แสดงข้อมูลผู้ใช้ที่เกี่ยวข้อง
          console.log('Users using this type:', result.details);
        }
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (error) {
      console.error('Error deleting personnel type:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForceDelete(false);
      onOpenChange(false);
    }
  };

  if (!personnelType) return null;

  const isSystemDefault = personnelType.isSystemDefault;
  const hasUsers = personnelType._count.users > 0;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>ยืนยันการลบ</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>คุณต้องการลบประเภทบุคลากรนี้หรือไม่?</p>
              
              {/* Personnel Type Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">{personnelType.typeName}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>รหัส: {personnelType.typeCode}</p>
                  <p>ระดับ: {personnelType.hierarchy}</p>
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3" />
                    <span>ผู้ใช้งาน: {personnelType._count.users} คน</span>
                  </div>
                </div>
              </div>

              {/* System Default Warning */}
              {isSystemDefault && (
                <Alert className="border-amber-200 bg-amber-50">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>ประเภทเริ่มต้นของระบบ</strong><br />
                    ไม่สามารถลบประเภทบุคลากรเริ่มต้นของระบบได้
                  </AlertDescription>
                </Alert>
              )}

              {/* Users Warning */}
              {hasUsers && !isSystemDefault && (
                <Alert className="border-red-200 bg-red-50">
                  <Users className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>มีผู้ใช้งาน {personnelType._count.users} คน</strong><br />
                    การลบจะส่งผลกระทบต่อผู้ใช้เหล่านี้
                  </AlertDescription>
                </Alert>
              )}

              {/* Force Delete Option */}
              {hasUsers && !isSystemDefault && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="forceDelete"
                      checked={forceDelete}
                      onCheckedChange={(checked) => setForceDelete(!!checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="forceDelete" className="text-sm font-medium text-red-700">
                        บังคับลบ (Force Delete)
                      </Label>
                      <p className="text-xs text-gray-600">
                        ลบประเภทบุคลากรและตั้งค่าผู้ใช้ที่เกี่ยวข้องเป็น "ไม่มีประเภท"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Message */}
              {!isSystemDefault && (
                <Alert className="border-gray-200">
                  <AlertTriangle className="h-4 w-4 text-gray-600" />
                  <AlertDescription>
                    การกระทำนี้ไม่สามารถยกเลิกได้ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || isSystemDefault || (hasUsers && !forceDelete)}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Trash2 className="h-4 w-4 mr-2" />
            {forceDelete ? 'บังคับลบ' : 'ลบ'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}