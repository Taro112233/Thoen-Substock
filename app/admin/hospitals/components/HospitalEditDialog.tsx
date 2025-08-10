// app/admin/hospitals/components/HospitalEditDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import shared types and constants
import { Hospital, HospitalFormData, thailandProvinces, hospitalTypes, hospitalStatuses } from '../types/hospital';

interface HospitalEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospital: Hospital | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function HospitalEditDialog({
  open,
  onOpenChange,
  hospital,
  onSuccess,
  onClose
}: HospitalEditDialogProps) {
  const [formData, setFormData] = useState<HospitalFormData>({
    name: '',
    hospitalCode: '',
    type: 'GOVERNMENT',
    status: 'PENDING',
    address: '',
    province: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Load hospital data when dialog opens
  useEffect(() => {
    if (hospital && open) {
      setFormData({
        name: hospital.name,
        nameEn: hospital.nameEn || '',
        hospitalCode: hospital.hospitalCode,
        type: hospital.type,
        status: hospital.status,
        address: hospital.address,
        district: hospital.district || '',
        subDistrict: hospital.subDistrict || '',
        province: hospital.province,
        postalCode: hospital.postalCode || '',
        phone: hospital.phone || '',
        fax: hospital.fax || '',
        email: hospital.email || '',
        website: hospital.website || '',
        bedCount: hospital.bedCount || 0,
        employeeCount: hospital.employeeCount || 0,
        establishedYear: hospital.establishedYear || new Date().getFullYear(),
        licenseNo: hospital.licenseNo || '',
        licenseExpiry: hospital.licenseExpiry ? hospital.licenseExpiry.split('T')[0] : '',
        taxId: hospital.taxId || '',
      });
    }
  }, [hospital, open]);

  const handleSubmit = async () => {
    if (!hospital) return;

    try {
      setSubmitting(true);
      
      const response = await fetch(`/api/admin/hospitals/${hospital.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('แก้ไขข้อมูลสำเร็จ', {
          description: `ข้อมูลโรงพยาบาล ${formData.name} ถูกอัปเดตแล้ว`,
        });
        onOpenChange(false);
        onClose();
        onSuccess();
      } else {
        toast.error('ไม่สามารถแก้ไขข้อมูลได้', {
          description: result.error || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ',
        });
      }
    } catch (error) {
      console.error('Error updating hospital:', error);
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

  const isFormValid = formData.name && formData.hospitalCode && formData.province && formData.address;

  if (!hospital) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">แก้ไขข้อมูลโรงพยาบาล</DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูลของ <span className="font-medium text-purple-600">{hospital.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">ข้อมูลพื้นฐาน</h4>
            
            <div className="space-y-2">
              <Label htmlFor="edit-name">ชื่อโรงพยาบาล *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="โรงพยาบาล..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nameEn">ชื่อภาษาอังกฤษ</Label>
              <Input
                id="edit-nameEn"
                value={formData.nameEn || ''}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Hospital Name in English"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-hospitalCode">รหัสโรงพยาบาล *</Label>
              <Input
                id="edit-hospitalCode"
                value={formData.hospitalCode}
                onChange={(e) => setFormData({ ...formData, hospitalCode: e.target.value.toUpperCase() })}
                placeholder="H001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">ประเภทโรงพยาบาล *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hospitalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">สถานะ *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hospitalStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">ข้อมูลที่อยู่</h4>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">ที่อยู่ *</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="เลขที่, ซอย, ถนน..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subDistrict">ตำบล/แขวง</Label>
                <Input
                  id="edit-subDistrict"
                  value={formData.subDistrict || ''}
                  onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                  placeholder="ตำบล/แขวง"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-district">อำเภอ/เขต</Label>
                <Input
                  id="edit-district"
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="อำเภอ/เขต"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-province">จังหวัด *</Label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => setFormData({ ...formData, province: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกจังหวัด" />
                  </SelectTrigger>
                  <SelectContent>
                    {thailandProvinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-postalCode">รหัสไปรษณีย์</Label>
                <Input
                  id="edit-postalCode"
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="10200"
                  maxLength={5}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">ข้อมูลติดต่อ</h4>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">เบอร์โทรศัพท์</Label>
              <Input
                id="edit-phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="02-123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fax">เบอร์แฟ็กซ์</Label>
              <Input
                id="edit-fax"
                value={formData.fax || ''}
                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                placeholder="02-123-4568"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">อีเมล</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@hospital.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">เว็บไซต์</Label>
              <Input
                id="edit-website"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.hospital.com"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">ข้อมูลเพิ่มเติม</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-bedCount">จำนวนเตียง</Label>
                <Input
                  id="edit-bedCount"
                  type="number"
                  value={formData.bedCount || ''}
                  onChange={(e) => setFormData({ ...formData, bedCount: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-employeeCount">จำนวนพนักงาน</Label>
                <Input
                  id="edit-employeeCount"
                  type="number"
                  value={formData.employeeCount || ''}
                  onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value) || 0 })}
                  placeholder="500"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-establishedYear">ปีที่ก่อตั้ง</Label>
              <Input
                id="edit-establishedYear"
                type="number"
                value={formData.establishedYear || ''}
                onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-licenseNo">เลขที่ใบอนุญาต</Label>
              <Input
                id="edit-licenseNo"
                value={formData.licenseNo || ''}
                onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                placeholder="LICENSE-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-licenseExpiry">วันหมดอายุใบอนุญาต</Label>
              <Input
                id="edit-licenseExpiry"
                type="date"
                value={formData.licenseExpiry || ''}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-taxId">เลขประจำตัวผู้เสียภาษี</Label>
              <Input
                id="edit-taxId"
                value={formData.taxId || ''}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="1234567890123"
                maxLength={13}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !isFormValid}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                บันทึกการแก้ไข
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}