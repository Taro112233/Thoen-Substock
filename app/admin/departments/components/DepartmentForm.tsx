// app/admin/departments/components/DepartmentForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Building2, Phone, Mail, MapPin, DollarSign } from 'lucide-react';

// Form validation schema
const departmentFormSchema = z.object({
  name: z.string().min(1, 'ชื่อแผนกจำเป็น').max(100, 'ชื่อแผนกต้องไม่เกิน 100 ตัวอักษร'),
  nameEn: z.string().max(100, 'ชื่อภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร').optional(),
  departmentCode: z.string()
    .min(1, 'รหัสแผนกจำเป็น')
    .max(10, 'รหัสแผนกต้องไม่เกิน 10 ตัวอักษร')
    .regex(/^[A-Z0-9_-]+$/, 'รหัสแผนกต้องเป็นตัวอักษรพิมพ์ใหญ่ ตัวเลข หรือ - _ เท่านั้น'),
  type: z.enum([
    'PHARMACY', 'EMERGENCY', 'ICU', 'WARD', 'OPD', 'OR', 'LABORATORY', 
    'RADIOLOGY', 'ADMINISTRATION', 'FINANCE', 'HR', 'IT', 'OTHER'
  ], { 
    errorMap: () => ({ message: 'กรุณาเลือกประเภทแผนก' })
  }),
  parentDepartmentId: z.string().uuid().optional().or(z.literal('')),
  location: z.string().max(200, 'ตำแหน่งที่ตั้งต้องไม่เกิน 200 ตัวอักษร').optional(),
  phone: z.string()
    .regex(/^[0-9-+\s()]*$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง')
    .max(20, 'เบอร์โทรศัพท์ต้องไม่เกิน 20 ตัวอักษร')
    .optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  allowRequisition: z.boolean().default(true),
  requireApproval: z.boolean().default(false),
  maxRequisitionValue: z.number().positive('จำนวนเงินต้องเป็นค่าบวก').optional(),
  budgetLimit: z.number().positive('จำนวนเงินต้องเป็นค่าบวก').optional(),
  description: z.string().max(500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร').optional(),
});

type DepartmentFormData = z.infer<typeof departmentFormSchema>;

interface Department {
  id: string;
  name: string;
  nameEn?: string;
  departmentCode: string;
  type: string;
  parentDepartmentId?: string;
  location?: string;
  phone?: string;
  email?: string;
  allowRequisition: boolean;
  requireApproval: boolean;
  maxRequisitionValue?: number;
  budgetLimit?: number;
  description?: string;
}

interface DepartmentFormProps {
  department?: Department;
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

// Department type options
const departmentTypeOptions = [
  { value: 'PHARMACY', label: 'เภสัชกรรม', icon: '💊' },
  { value: 'EMERGENCY', label: 'ฉุกเฉิน', icon: '🚨' },
  { value: 'ICU', label: 'หอผู้ป่วยวิกฤต', icon: '🏥' },
  { value: 'WARD', label: 'หอผู้ป่วยทั่วไป', icon: '🛏️' },
  { value: 'OPD', label: 'ผู้ป่วยนอก', icon: '🩺' },
  { value: 'OR', label: 'ห้องผ่าตัด', icon: '⚕️' },
  { value: 'LABORATORY', label: 'ห้องปฏิบัติการ', icon: '🔬' },
  { value: 'RADIOLOGY', label: 'รังสีวิทยา', icon: '📸' },
  { value: 'ADMINISTRATION', label: 'บริหารงาน', icon: '📋' },
  { value: 'FINANCE', label: 'การเงิน', icon: '💰' },
  { value: 'HR', label: 'ทรัพยากรบุคคล', icon: '👥' },
  { value: 'IT', label: 'เทคโนโลยีสารสนเทศ', icon: '💻' },
  { value: 'OTHER', label: 'อื่นๆ', icon: '📁' },
];

export default function DepartmentForm({ department, onSuccess, onCancel }: DepartmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentDepartments, setParentDepartments] = useState<Array<{
    id: string;
    name: string;
    departmentCode: string;
  }>>([]);

  const isEditing = !!department;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: department?.name || '',
      nameEn: department?.nameEn || '',
      departmentCode: department?.departmentCode || '',
      type: (department?.type as DepartmentFormData['type']) || 'OTHER',
      parentDepartmentId: department?.parentDepartmentId || '',
      location: department?.location || '',
      phone: department?.phone || '',
      email: department?.email || '',
      allowRequisition: department?.allowRequisition ?? true,
      requireApproval: department?.requireApproval ?? false,
      maxRequisitionValue: department?.maxRequisitionValue || undefined,
      budgetLimit: department?.budgetLimit || undefined,
      description: department?.description || '',
    },
  });

  const watchType = watch('type');
  const watchAllowRequisition = watch('allowRequisition');

  // Load parent departments
  useEffect(() => {
    const fetchParentDepartments = async () => {
      try {
        const response = await fetch('/api/admin/departments?limit=100&active=true');
        if (response.ok) {
          const data = await response.json();
          // Filter out current department if editing
          const availableParents = data.departments.filter((dept: any) => 
            !department || dept.id !== department.id
          );
          setParentDepartments(availableParents);
        }
      } catch (err) {
        console.error('Error fetching parent departments:', err);
      }
    };

    fetchParentDepartments();
  }, [department]);

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Clean up empty strings to undefined
      const cleanedData = {
        ...data,
        nameEn: data.nameEn || undefined,
        parentDepartmentId: data.parentDepartmentId || undefined,
        location: data.location || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        maxRequisitionValue: data.maxRequisitionValue || undefined,
        budgetLimit: data.budgetLimit || undefined,
        description: data.description || undefined,
      };

      const url = isEditing 
        ? `/api/admin/departments/${department.id}`
        : '/api/admin/departments';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

      const result = await response.json();
      onSuccess(result.message || `${isEditing ? 'แก้ไข' : 'สร้าง'}แผนกสำเร็จแล้ว`);

    } catch (err) {
      console.error('Error saving department:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* Error Message */}
      {error && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          ข้อมูลพื้นฐาน
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อแผนก (ภาษาไทย) *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="เช่น แผนกเภสัชกรรม"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameEn">ชื่อแผนก (ภาษาอังกฤษ)</Label>
            <Input
              id="nameEn"
              {...register('nameEn')}
              placeholder="เช่น Pharmacy Department"
              className={errors.nameEn ? 'border-red-500' : ''}
            />
            {errors.nameEn && (
              <p className="text-sm text-red-600">{errors.nameEn.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentCode">รหัสแผนก *</Label>
            <Input
              id="departmentCode"
              {...register('departmentCode')}
              placeholder="เช่น PHARM"
              className={`font-mono ${errors.departmentCode ? 'border-red-500' : ''}`}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.departmentCode && (
              <p className="text-sm text-red-600">{errors.departmentCode.message}</p>
            )}
            <p className="text-xs text-gray-500">
              ใช้ตัวอักษรพิมพ์ใหญ่ ตัวเลข หรือ - _ เท่านั้น
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">ประเภทแผนก *</Label>
            <Select value={watchType} onValueChange={(value) => setValue('type', value as DepartmentFormData['type'])}>
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="เลือกประเภทแผนก" />
              </SelectTrigger>
              <SelectContent>
                {departmentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentDepartmentId">แผนกแม่ (ถ้ามี)</Label>
          <Select 
            value={watch('parentDepartmentId') || ''} 
            onValueChange={(value) => setValue('parentDepartmentId', value || '')}
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกแผนกแม่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ไม่มีแผนกแม่</SelectItem>
              {parentDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.departmentCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">คำอธิบาย</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="อธิบายหน้าที่และความรับผิดชอบของแผนก..."
            rows={3}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          ข้อมูลการติดต่อ
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              ตำแหน่งที่ตั้ง
            </Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="เช่น อาคาร A ชั้น 2 ห้อง 201"
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              เบอร์โทรศัพท์
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="เช่น 02-123-4567"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              อีเมล
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="เช่น pharmacy@hospital.th"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Requisition Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-600" />
          การตั้งค่าการเบิกยา
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowRequisition"
              checked={watchAllowRequisition}
              onCheckedChange={(checked) => setValue('allowRequisition', !!checked)}
            />
            <Label htmlFor="allowRequisition" className="font-medium">
              อนุญาตให้เบิกยาได้
            </Label>
          </div>

          {watchAllowRequisition && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requireApproval"
                  checked={watch('requireApproval')}
                  onCheckedChange={(checked) => setValue('requireApproval', !!checked)}
                />
                <Label htmlFor="requireApproval" className="font-medium">
                  ต้องการการอนุมัติก่อนเบิกยา
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxRequisitionValue">มูลค่าเบิกสูงสุดต่อครั้ง (บาท)</Label>
                  <Input
                    id="maxRequisitionValue"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('maxRequisitionValue', { valueAsNumber: true })}
                    placeholder="เช่น 50000"
                    className={errors.maxRequisitionValue ? 'border-red-500' : ''}
                  />
                  {errors.maxRequisitionValue && (
                    <p className="text-sm text-red-600">{errors.maxRequisitionValue.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budgetLimit">วงเงินงบประมาณ (บาท)</Label>
                  <Input
                    id="budgetLimit"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('budgetLimit', { valueAsNumber: true })}
                    placeholder="เช่น 1000000"
                    className={errors.budgetLimit ? 'border-red-500' : ''}
                  />
                  {errors.budgetLimit && (
                    <p className="text-sm text-red-600">{errors.budgetLimit.message}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 sm:flex-none"
          disabled={loading}
        >
          ยกเลิก
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={loading || !isValid}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>{isEditing ? 'อัพเดตแผนก' : 'สร้างแผนก'}</>
          )}
        </Button>
      </div>
    </form>
  );
}