// app/admin/hospitals/components/HospitalViewDialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Package,
  FileText,
  Edit,
  Users,
  Building,
  Bed
} from 'lucide-react';

// Import shared types and constants
import { Hospital, hospitalTypes, hospitalStatuses } from '../types/hospital';

interface HospitalViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital: Hospital | null;
  onEdit: () => void;
  onClose: () => void;
}

export function HospitalViewDialog({
  open,
  onOpenChange,
  hospital,
  onEdit,
  onClose
}: HospitalViewDialogProps) {
  const getStatusBadge = (status: Hospital['status']) => {
    const statusConfig = hospitalStatuses.find(s => s.value === status);
    return (
      <Badge 
        variant="secondary" 
        className={`${statusConfig?.color} text-white`}
      >
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getTypeLabel = (type: Hospital['type']) => {
    const typeConfig = hospitalTypes.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  const handleClose = () => {
    onOpenChange(false);
    onClose();
  };

  if (!hospital) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-purple-600" />
            รายละเอียดโรงพยาบาล
          </DialogTitle>
          <DialogDescription>
            ข้อมูลของ <span className="font-medium text-purple-600">{hospital.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Hospital Header Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{hospital.name}</h3>
                  {hospital.nameEn && (
                    <p className="text-gray-600 mt-1">{hospital.nameEn}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    {getStatusBadge(hospital.status)}
                    <Badge variant="outline" className="bg-white/60">
                      {getTypeLabel(hospital.type)}
                    </Badge>
                    {hospital.isTrialAccount && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Trial Account
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>รหัส: <span className="font-mono font-medium">{hospital.hospitalCode}</span></p>
                <p>ID: <span className="font-mono text-xs">{hospital.id}</span></p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center border-b pb-2">
                <Building2 className="h-4 w-4 mr-2" />
                ข้อมูลพื้นฐาน
              </h4>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">ชื่อโรงพยาบาล</Label>
                  <p className="font-medium">{hospital.name}</p>
                  {hospital.nameEn && (
                    <p className="text-sm text-gray-600">{hospital.nameEn}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600">รหัสโรงพยาบาล</Label>
                  <p className="font-medium font-mono">{hospital.hospitalCode}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">ประเภท</Label>
                  <p className="font-medium">{getTypeLabel(hospital.type)}</p>
                </div>
                {hospital.establishedYear && (
                  <div>
                    <Label className="text-sm text-gray-600">ปีที่ก่อตั้ง</Label>
                    <p className="font-medium">{hospital.establishedYear}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center border-b pb-2">
                <MapPin className="h-4 w-4 mr-2" />
                ที่อยู่
              </h4>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <Label className="text-sm text-gray-600">ที่อยู่</Label>
                  <p className="font-medium">{hospital.address}</p>
                </div>
                {hospital.subDistrict && (
                  <div>
                    <Label className="text-sm text-gray-600">ตำบล/แขวง</Label>
                    <p className="font-medium">{hospital.subDistrict}</p>
                  </div>
                )}
                {hospital.district && (
                  <div>
                    <Label className="text-sm text-gray-600">อำเภอ/เขต</Label>
                    <p className="font-medium">{hospital.district}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-gray-600">จังหวัด</Label>
                  <p className="font-medium">{hospital.province}</p>
                </div>
                {hospital.postalCode && (
                  <div>
                    <Label className="text-sm text-gray-600">รหัสไปรษณีย์</Label>
                    <p className="font-medium">{hospital.postalCode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center border-b pb-2">
                <Phone className="h-4 w-4 mr-2" />
                ข้อมูลติดต่อ
              </h4>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                {hospital.phone && (
                  <div>
                    <Label className="text-sm text-gray-600">โทรศัพท์</Label>
                    <p className="font-medium flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-blue-500" />
                      {hospital.phone}
                    </p>
                  </div>
                )}
                {hospital.fax && (
                  <div>
                    <Label className="text-sm text-gray-600">แฟ็กซ์</Label>
                    <p className="font-medium">{hospital.fax}</p>
                  </div>
                )}
                {hospital.email && (
                  <div>
                    <Label className="text-sm text-gray-600">อีเมล</Label>
                    <p className="font-medium flex items-center">
                      <Mail className="h-3 w-3 mr-1 text-green-500" />
                      <a href={`mailto:${hospital.email}`} className="text-blue-600 hover:underline">
                        {hospital.email}
                      </a>
                    </p>
                  </div>
                )}
                {hospital.website && (
                  <div>
                    <Label className="text-sm text-gray-600">เว็บไซต์</Label>
                    <p className="font-medium flex items-center">
                      <Globe className="h-3 w-3 mr-1 text-purple-500" />
                      <a 
                        href={hospital.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {hospital.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hospital Statistics */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center border-b pb-2">
                <Package className="h-4 w-4 mr-2" />
                สถิติโรงพยาบาล
              </h4>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                {hospital.bedCount && (
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-gray-600 flex items-center">
                      <Bed className="h-3 w-3 mr-1" />
                      จำนวนเตียง
                    </Label>
                    <span className="font-medium text-blue-600">{hospital.bedCount} เตียง</span>
                  </div>
                )}
                {hospital.employeeCount && (
                  <div className="flex justify-between items-center">
                    <Label className="text-sm text-gray-600 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      จำนวนพนักงาน
                    </Label>
                    <span className="font-medium text-green-600">{hospital.employeeCount} คน</span>
                  </div>
                )}
                {hospital._count && (
                  <>
                    <div className="flex justify-between items-center">
                      <Label className="text-sm text-gray-600 flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        ผู้ใช้ในระบบ
                      </Label>
                      <span className="font-medium text-purple-600">{hospital._count.users} คน</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-sm text-gray-600 flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        แผนกทั้งหมด
                      </Label>
                      <span className="font-medium text-orange-600">{hospital._count.departments} แผนก</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Label className="text-sm text-gray-600 flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        คลังทั้งหมด
                      </Label>
                      <span className="font-medium text-indigo-600">{hospital._count.warehouses} คลัง</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* License & Registration (if available) */}
          {(hospital.licenseNo || hospital.taxId) && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center border-b pb-2">
                <FileText className="h-4 w-4 mr-2" />
                ใบอนุญาตและการจดทะเบียน
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospital.licenseNo && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-sm text-gray-600">เลขที่ใบอนุญาต</Label>
                    <p className="font-medium font-mono">{hospital.licenseNo}</p>
                    {hospital.licenseExpiry && (
                      <p className="text-sm text-gray-600 mt-1">
                        หมดอายุ: {new Date(hospital.licenseExpiry).toLocaleDateString('th-TH')}
                      </p>
                    )}
                  </div>
                )}
                {hospital.taxId && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-sm text-gray-600">เลขประจำตัวผู้เสียภาษี</Label>
                    <p className="font-medium font-mono">{hospital.taxId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center border-b pb-2">
              <Calendar className="h-4 w-4 mr-2" />
              ข้อมูลระบบ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm text-gray-600">วันที่เข้าร่วมระบบ</Label>
                <p className="font-medium">
                  {new Date(hospital.createdAt).toLocaleDateString('th-TH')}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(hospital.createdAt).toLocaleTimeString('th-TH')}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm text-gray-600">อัปเดตล่าสุด</Label>
                <p className="font-medium">
                  {new Date(hospital.updatedAt).toLocaleDateString('th-TH')}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(hospital.updatedAt).toLocaleTimeString('th-TH')}
                </p>
              </div>
              {hospital.lastActivityAt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-sm text-gray-600">เข้าใช้งานล่าสุด</Label>
                  <p className="font-medium">
                    {new Date(hospital.lastActivityAt).toLocaleDateString('th-TH')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(hospital.lastActivityAt).toLocaleTimeString('th-TH')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Information (if available) */}
          {hospital.subscriptionPlan && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center border-b pb-2">
                <Package className="h-4 w-4 mr-2" />
                ข้อมูลการสมัครสมาชิก
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <Label className="text-sm text-gray-600">แผนการใช้งาน</Label>
                  <p className="font-medium text-blue-700">{hospital.subscriptionPlan}</p>
                  {hospital.isTrialAccount && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 mt-2">
                      บัญชีทดลองใช้
                    </Badge>
                  )}
                </div>
                {hospital.subscriptionEnd && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="text-sm text-gray-600">วันหมดอายุ</Label>
                    <p className="font-medium">
                      {new Date(hospital.subscriptionEnd).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                )}
              </div>
              
              {(hospital.maxUsers || hospital.maxWarehouses) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hospital.maxUsers && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Label className="text-sm text-gray-600">จำนวนผู้ใช้สูงสุด</Label>
                      <p className="font-medium">{hospital.maxUsers} คน</p>
                    </div>
                  )}
                  {hospital.maxWarehouses && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Label className="text-sm text-gray-600">จำนวนคลังสูงสุด</Label>
                      <p className="font-medium">{hospital.maxWarehouses} คลัง</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            ปิด
          </Button>
          <Button
            onClick={onEdit}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
          >
            <Edit className="h-4 w-4 mr-2" />
            แก้ไขข้อมูล
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}