// app/admin/hospitals/components/HospitalDeleteDialog.tsx
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Trash2, 
  Loader2, 
  Building2,
  Users,
  Package,
  Database,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

// Import shared types
import { Hospital } from '../types/hospital';

interface HospitalDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital: Hospital | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function HospitalDeleteDialog({
  open,
  onOpenChange,
  hospital,
  onSuccess,
  onClose
}: HospitalDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!hospital) return;

    const loadingToast = toast.loading('กำลังลบโรงพยาบาล...', {
      description: 'กรุณารอสักครู่',
    });

    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/admin/hospitals/${hospital.id}`, {
        method: 'DELETE',
        headers: {
          'X-Force-Delete': 'true', // ส่ง header เพื่อบังคับให้ hard delete
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success('ลบโรงพยาบาลสำเร็จ', {
          description: `โรงพยาบาล ${hospital.name} ถูกลบออกจากระบบแล้ว`,
        });
        onOpenChange(false);
        onClose();
        onSuccess();
      } else {
        toast.dismiss(loadingToast);
        toast.error('ไม่สามารถลบโรงพยาบาลได้', {
          description: result.error || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ',
        });
      }
    } catch (error) {
      console.error('Error deleting hospital:', error);
      toast.dismiss(loadingToast);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ', {
        description: 'กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    onClose();
  };

  if (!hospital) return null;

  // Check if hospital has related data
  const hasRelatedData = hospital._count && (
    hospital._count.users > 0 ||
    hospital._count.departments > 0 ||
    hospital._count.warehouses > 0 ||
    (hospital._count.drugs && hospital._count.drugs > 0) ||
    (hospital._count.stockCards && hospital._count.stockCards > 0) ||
    (hospital._count.requisitions && hospital._count.requisitions > 0)
  );

  const isActiveHospital = hospital.status === 'ACTIVE';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            ยืนยันการลบโรงพยาบาล
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Hospital Info */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-6 w-6 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{hospital.name}</h4>
                    <p className="text-sm text-gray-600">รหัส: {hospital.hospitalCode}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700">
                คุณแน่ใจหรือไม่ที่จะลบโรงพยาบาล <strong className="text-gray-900">{hospital.name}</strong>?
              </p>

              {/* Warning based on hospital status and data */}
              <div className="space-y-3">
                {isActiveHospital && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className="h-4 w-4 text-orange-600" />
                      <p className="text-orange-800 text-sm font-medium">
                        ⚠️ โรงพยาบาลนี้อยู่ในสถานะ "ใช้งาน"
                      </p>
                    </div>
                    <p className="text-orange-700 text-sm mt-1">
                      การลบโรงพยาบาลที่กำลังใช้งานอาจส่งผลกระทบต่อผู้ใช้ปัจจุบัน
                    </p>
                  </div>
                )}

                {/* Data Impact Warning */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Database className="h-4 w-4 text-red-600" />
                    <p className="text-red-800 text-sm font-medium">
                      🚨 ผลกระทบจากการลบ:
                    </p>
                  </div>
                  
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• ข้อมูลทั้งหมดของโรงพยาบาลจะถูกลบอย่างถาวร</li>
                    <li>• ผู้ใช้ทั้งหมดจะไม่สามารถเข้าใช้งานได้</li>
                    <li>• ข้อมูลสต็อกยาและการเบิกจ่ายจะหายไป</li>
                    <li>• ประวัติการทำงานและรายงานจะถูกลบ</li>
                    <li>• การกระทำนี้ไม่สามารถย้อนกลับได้</li>
                  </ul>
                </div>

                {/* Related Data Summary */}
                {hospital._count && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Package className="h-4 w-4 text-blue-600" />
                      <p className="text-blue-800 text-sm font-medium">
                        📊 ข้อมูลที่จะถูกลบ:
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {hospital._count.users > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-700 text-sm flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            ผู้ใช้
                          </span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {hospital._count.users} คน
                          </Badge>
                        </div>
                      )}
                      
                      {hospital._count.departments > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-700 text-sm flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            แผนก
                          </span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {hospital._count.departments} แผนก
                          </Badge>
                        </div>
                      )}
                      
                      {hospital._count.warehouses > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-700 text-sm flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            คลัง
                          </span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {hospital._count.warehouses} คลัง
                          </Badge>
                        </div>
                      )}
                      
                      {hospital._count.drugs && hospital._count.drugs > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-700 text-sm">ยา</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {hospital._count.drugs} รายการ
                          </Badge>
                        </div>
                      )}
                      
                      {hospital._count.stockCards && hospital._count.stockCards > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-700 text-sm">บัตรสต็อก</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {hospital._count.stockCards} บัตร
                          </Badge>
                        </div>
                      )}
                      
                      {hospital._count.requisitions && hospital._count.requisitions > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-700 text-sm">ใบเบิก</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {hospital._count.requisitions} ใบ
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Alternative Action Suggestion */}
                {hasRelatedData && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-amber-800 text-sm font-medium mb-1">
                      ⚠️ คำเตือน:
                    </p>
                    <p className="text-amber-700 text-sm">
                      การลบโรงพยาบาลนี้จะลบข้อมูลทั้งหมดอย่างถาวร รวมถึงผู้ใช้งาน แผนก คลัง และข้อมูลยาทั้งหมด
                    </p>
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleClose}
            disabled={submitting}
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                ลบโรงพยาบาล
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}