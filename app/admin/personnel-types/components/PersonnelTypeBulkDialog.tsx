// app/admin/personnel-types/components/PersonnelTypeBulkDialog.tsx
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Loader2, 
  AlertTriangle,
  Trash2,
  CheckSquare,
  XSquare,
  FileDown,
  Users
} from 'lucide-react';

interface PersonnelTypeBulkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: 'delete' | 'activate' | 'deactivate' | 'export';
  selectedIds: string[];
  onSuccess: () => void;
}

export function PersonnelTypeBulkDialog({
  open,
  onOpenChange,
  operation,
  selectedIds,
  onSuccess
}: PersonnelTypeBulkDialogProps) {
  const [loading, setLoading] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);

  const getOperationConfig = () => {
    switch (operation) {
      case 'delete':
        return {
          title: 'ยืนยันการลบหลายรายการ',
          description: `คุณต้องการลบประเภทบุคลากร ${selectedIds.length} รายการหรือไม่?`,
          icon: <Trash2 className="h-5 w-5 text-red-600" />,
          confirmText: forceDelete ? 'บังคับลบ' : 'ลบ',
          variant: 'destructive' as const,
          warning: true
        };
      case 'activate':
        return {
          title: 'ยืนยันการเปิดใช้งาน',
          description: `คุณต้องการเปิดใช้งานประเภทบุคลากร ${selectedIds.length} รายการหรือไม่?`,
          icon: <CheckSquare className="h-5 w-5 text-green-600" />,
          confirmText: 'เปิดใช้งาน',
          variant: 'default' as const,
          warning: false
        };
      case 'deactivate':
        return {
          title: 'ยืนยันการปิดใช้งาน',
          description: `คุณต้องการปิดใช้งานประเภทบุคลากร ${selectedIds.length} รายการหรือไม่?`,
          icon: <XSquare className="h-5 w-5 text-orange-600" />,
          confirmText: 'ปิดใช้งาน',
          variant: 'default' as const,
          warning: true
        };
      case 'export':
        return {
          title: 'ยืนยันการส่งออกข้อมูล',
          description: `คุณต้องการส่งออกข้อมูลประเภทบุคลากร ${selectedIds.length} รายการหรือไม่?`,
          icon: <FileDown className="h-5 w-5 text-blue-600" />,
          confirmText: 'ส่งออก',
          variant: 'default' as const,
          warning: false
        };
      default:
        return {
          title: 'ยืนยันการดำเนินการ',
          description: `คุณต้องการดำเนินการกับ ${selectedIds.length} รายการหรือไม่?`,
          icon: <AlertTriangle className="h-5 w-5 text-gray-600" />,
          confirmText: 'ดำเนินการ',
          variant: 'default' as const,
          warning: false
        };
    }
  };

  const handleOperation = async () => {
    try {
      setLoading(true);

      const payload = {
        operation,
        ids: selectedIds,
        force: forceDelete,
        reason: `Bulk ${operation} operation`
      };

      const response = await fetch('/api/admin/personnel-types/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'ดำเนินการเรียบร้อยแล้ว');
        
        // Handle export operation
        if (operation === 'export' && result.data) {
          // Create download link
          const dataStr = JSON.stringify(result.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = result.filename || 'personnel-types-export.json';
          link.click();
          URL.revokeObjectURL(url);
        }
        
        onSuccess();
      } else if (response.status === 403) {
        toast.error('มีรายการที่ไม่สามารถดำเนินการได้');
        if (result.violations) {
          console.log('Violations:', result.violations);
        }
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาดในการดำเนินการ');
      }
    } catch (error) {
      console.error('Error in bulk operation:', error);
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

  const config = getOperationConfig();

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            {config.icon}
            <span>{config.title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>{config.description}</p>
              
              {/* Selected Items Count */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">รายการที่เลือก:</span>
                  <Badge variant="outline">
                    {selectedIds.length} รายการ
                  </Badge>
                </div>
              </div>

              {/* Force Delete Option for Delete Operation */}
              {operation === 'delete' && (
                <div className="space-y-3">
                  <Alert className="border-red-200 bg-red-50">
                    <Users className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>คำเตือน:</strong> การลบประเภทบุคลากรอาจส่งผลกระทบต่อผู้ใช้ที่เกี่ยวข้อง
                    </AlertDescription>
                  </Alert>

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
                        ลบประเภทบุคลากรทั้งหมดและตั้งค่าผู้ใช้ที่เกี่ยวข้องเป็น "ไม่มีประเภท"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Deactivate Warning */}
              {operation === 'deactivate' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <Users className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>คำเตือน:</strong> การปิดใช้งานจะทำให้ผู้ใช้ที่มีประเภทนี้ไม่สามารถเข้าสู่ระบบได้
                  </AlertDescription>
                </Alert>
              )}

              {/* General Warning */}
              {config.warning && (
                <Alert className="border-gray-200">
                  <AlertTriangle className="h-4 w-4 text-gray-600" />
                  <AlertDescription>
                    การกระทำนี้จะส่งผลกระทบต่อรายการที่เลือกทั้งหมด กรุณาตรวจสอบให้แน่ใจ
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
            variant={config.variant}
            onClick={handleOperation}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {config.confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}