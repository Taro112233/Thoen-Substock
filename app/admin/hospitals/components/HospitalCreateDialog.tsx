// app/admin/hospitals/components/HospitalCreateDialog.tsx
'use client';

import { useState } from 'react';
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
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import shared types and constants
import { HospitalFormData, thailandProvinces, hospitalTypes, hospitalStatuses } from '../types/hospital';

interface HospitalCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function HospitalCreateDialog({
  open,
  onOpenChange,
  onSuccess
}: HospitalCreateDialogProps) {
  const [formData, setFormData] = useState<HospitalFormData>({
    name: '',
    hospitalCode: '',
    type: 'GOVERNMENT',
    status: 'PENDING',
    address: '',
    province: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      hospitalCode: '',
      type: 'GOVERNMENT',
      status: 'PENDING',
      address: '',
      province: '',
    });
  };

  const handleSubmit = async () => {
    const loadingToast = toast.loading('กำลังเพิ่มโรงพยาบาล...', {
      description: 'กรุณารอสักครู่',
    });

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/admin/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          country: 'Thailand',
          timezone: 'Asia/Bangkok',
          locale: 'th-TH',
          currency: 'THB',
          isTrialAccount: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success('เพิ่มโรงพยาบาลสำเร็จ', {
          description: `โรงพยาบาล ${formData.name} ถูกเพิ่มในระบบแล้ว`,
        });
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        toast.dismiss(loadingToast);
        toast.error('ไม่สามารถเพิ่มโรงพยาบาลได้', {
          description: result.error || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ',
        });
      }
    } catch (error) {
      console.error('Error creating hospital:', error);
      toast.dismiss(loadingToast);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ', {
        description: 'กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.hospitalCode.trim() && formData.province && formData.address.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">เพิ่มโรงพยาบาลใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลโรงพยาบาลที่ต้องการเพิ่มในระบบ
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">ข้อมูลพื้นฐาน</h4>
            
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อโรงพยาบาล *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="โรงพยาบาล..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameEn">ชื่อภาษาอังกฤษ</Label>
              <Input
                id="nameEn"
                value={formData.nameEn || ''}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Hospital Name in English"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalCode">รหัสโรงพยาบาล *</Label>
              <Input
                id="hospitalCode"
                value={formData.hospitalCode}
                onChange={(e) => setFormData({ ...formData, hospitalCode: e.target.value.toUpperCase() })}
                placeholder="H001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">ประเภทโรงพยาบาล *</Label>
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
              <Label htmlFor="status">สถานะ *</Label>
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
              <Label htmlFor="address">ที่อยู่ *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="เลขที่, ซอย, ถนน..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subDistrict">ตำบล/แขวง</Label>
                <Input
                  id="subDistrict"
                  value={formData.subDistrict || ''}
                  onChange={(e) => setFormData({ ...formData, subDistrict: e.target.value })}
                  placeholder="ตำบล/แขวง"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">อำเภอ/เขต</Label>
                <Input
                  id="district"
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="อำเภอ/เขต"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">จังหวัด *</Label>
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
                <Label htmlFor="postalCode">รหัสไปรษณีย์</Label>
                <Input
                  id="postalCode"
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
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="02-123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax">เบอร์แฟ็กซ์</Label>
              <Input
                id="fax"
                value={formData.fax || ''}
                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                placeholder="02-123-4568"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@hospital.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">เว็บไซต์</Label>
              <Input
                id="website"
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
                <Label htmlFor="bedCount">จำนวนเตียง</Label>
                <Input
                  id="bedCount"
                  type="number"
                  value={formData.bedCount || ''}
                  onChange={(e) => setFormData({ ...formData, bedCount: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">จำนวนพนักงาน</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={formData.employeeCount || ''}
                  onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value) || 0 })}
                  placeholder="500"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="establishedYear">ปีที่ก่อตั้ง</Label>
              <Input
                id="establishedYear"
                type="number"
                value={formData.establishedYear || ''}
                onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) || new Date().getFullYear() })}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNo">เลขที่ใบอนุญาต</Label>
              <Input
                id="licenseNo"
                value={formData.licenseNo || ''}
                onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                placeholder="LICENSE-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseExpiry">วันหมดอายุใบอนุญาต</Label>
              <Input
                id="licenseExpiry"
                type="date"
                value={formData.licenseExpiry || ''}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
              <Input
                id="taxId"
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
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={submitting}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !isFormValid}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มโรงพยาบาล
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}