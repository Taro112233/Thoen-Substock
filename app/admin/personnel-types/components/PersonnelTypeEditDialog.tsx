// app/admin/personnel-types/components/PersonnelTypeEditDialog.tsx
// Personnel Types - Edit Dialog Component (FIXED VERSION)
// แก้ไข Input error props และ type issues

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Loader2,
  Shield,
  Users,
  Settings,
  Info,
  Plus,
  Edit
} from 'lucide-react';
import { PERSONNEL_HIERARCHIES, PERMISSION_LABELS, type PersonnelType, type PersonnelHierarchy } from '../types/personnel-type';

// FIXED: Form validation schema - same as create dialog
const editPersonnelTypeSchema = z.object({
  typeCode: z.string()
    .min(2, 'รหัสประเภทต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(20, 'รหัสประเภทต้องไม่เกิน 20 ตัวอักษร')
    .regex(/^[A-Z0-9_]+$/, 'รหัสประเภทต้องใช้ตัวพิมพ์ใหญ่, ตัวเลข และ _ เท่านั้น'),
  typeName: z.string()
    .min(1, 'ชื่อประเภทบุคลากรจำเป็นต้องระบุ')
    .max(100, 'ชื่อประเภทบุคลากรต้องไม่เกิน 100 ตัวอักษร'),
  typeNameEn: z.string()
    .max(100, 'ชื่อภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
  hierarchy: z.enum(['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD', 'STAFF', 'STUDENT']),
  levelOrder: z.number()
    .int('ลำดับระดับต้องเป็นจำนวนเต็ม')
    .min(1, 'ลำดับระดับต้องมากกว่าหรือเท่ากับ 1')
    .max(100, 'ลำดับระดับต้องไม่เกิน 100'),
  description: z.string()
    .max(500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร')
    .optional(),
  maxSubordinates: z.number()
    .int('จำนวนลูกน้องต้องเป็นจำนวนเต็ม')
    .min(0, 'จำนวนลูกน้องต้องมากกว่าหรือเท่ากับ 0')
    .max(1000, 'จำนวนลูกน้องต้องไม่เกิน 1000')
    .optional(),
  defaultDepartmentType: z.string()
    .max(50, 'ประเภทแผนกเริ่มต้นต้องไม่เกิน 50 ตัวอักษร')
    .optional(),
  
  // FIXED: All permissions are required boolean fields
  canManageHospitals: z.boolean(),
  canManageWarehouses: z.boolean(),
  canManageDepartments: z.boolean(),
  canManagePersonnel: z.boolean(),
  canManageDrugs: z.boolean(),
  canManageMasterData: z.boolean(),
  canViewReports: z.boolean(),
  canApproveUsers: z.boolean(),
  isActive: z.boolean()
});

type EditFormData = z.infer<typeof editPersonnelTypeSchema>;

interface PersonnelTypeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnelType: PersonnelType | null;
  onSuccess: () => void;
}

export function PersonnelTypeEditDialog({
  open,
  onOpenChange,
  personnelType,
  onSuccess
}: PersonnelTypeEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<EditFormData>({
    resolver: zodResolver(editPersonnelTypeSchema)
  });

  const selectedHierarchy = watch('hierarchy');

  // Initialize form with current data
  useEffect(() => {
    if (personnelType && open) {
      reset({
        typeCode: personnelType.typeCode,
        typeName: personnelType.typeName,
        typeNameEn: personnelType.typeNameEn || '',
        hierarchy: personnelType.hierarchy,
        levelOrder: personnelType.levelOrder,
        description: personnelType.description || '',
        maxSubordinates: personnelType.maxSubordinates || undefined,
        defaultDepartmentType: personnelType.defaultDepartmentType || '',
        canManageHospitals: personnelType.canManageHospitals,
        canManageWarehouses: personnelType.canManageWarehouses,
        canManageDepartments: personnelType.canManageDepartments,
        canManagePersonnel: personnelType.canManagePersonnel,
        canManageDrugs: personnelType.canManageDrugs,
        canManageMasterData: personnelType.canManageMasterData,
        canViewReports: personnelType.canViewReports,
        canApproveUsers: personnelType.canApproveUsers,
        isActive: personnelType.isActive
      });
      setResponsibilities(personnelType.responsibilities || []);
    }
  }, [personnelType, open, reset]);

  // Auto-set level order based on hierarchy
  const handleHierarchyChange = (hierarchy: PersonnelHierarchy) => {
    setValue('hierarchy', hierarchy);
    const hierarchyConfig = PERSONNEL_HIERARCHIES.find(h => h.value === hierarchy);
    if (hierarchyConfig) {
      setValue('levelOrder', hierarchyConfig.levelOrder);
    }
  };

  // Handle responsibilities
  const addResponsibility = () => {
    if (responsibilityInput.trim() && !responsibilities.includes(responsibilityInput.trim())) {
      setResponsibilities([...responsibilities, responsibilityInput.trim()]);
      setResponsibilityInput('');
    }
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: EditFormData) => {
    if (!personnelType) return;

    try {
      setLoading(true);

      const formData = {
        ...data,
        responsibilities: responsibilities.length > 0 ? responsibilities : undefined,
        typeNameEn: data.typeNameEn || undefined,
        description: data.description || undefined,
        maxSubordinates: data.maxSubordinates || undefined,
        defaultDepartmentType: data.defaultDepartmentType || undefined
      };

      const response = await fetch(`/api/admin/personnel-types/${personnelType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('แก้ไขข้อมูลเรียบร้อยแล้ว');
        onSuccess();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
      }
    } catch (error) {
      console.error('Error updating personnel type:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setResponsibilityInput('');
      onOpenChange(false);
    }
  };

  if (!personnelType) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-blue-600" />
            <span>แก้ไขประเภทบุคลากร</span>
          </DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูลประเภทบุคลากร: {personnelType.typeName} ({personnelType.typeCode})
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold">ข้อมูลพื้นฐาน</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FIXED: Remove error prop, use className instead */}
                <div className="space-y-2">
                  <Label htmlFor="typeCode">รหัสประเภท *</Label>
                  <Input
                    id="typeCode"
                    {...register('typeCode')}
                    className={errors.typeCode ? 'border-red-500' : ''}
                  />
                  {errors.typeCode && (
                    <p className="text-xs text-red-600">{errors.typeCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeName">ชื่อประเภทบุคลากร *</Label>
                  <Input
                    id="typeName"
                    {...register('typeName')}
                    className={errors.typeName ? 'border-red-500' : ''}
                  />
                  {errors.typeName && (
                    <p className="text-xs text-red-600">{errors.typeName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeNameEn">ชื่อภาษาอังกฤษ</Label>
                  <Input
                    id="typeNameEn"
                    {...register('typeNameEn')}
                    className={errors.typeNameEn ? 'border-red-500' : ''}
                  />
                  {errors.typeNameEn && (
                    <p className="text-xs text-red-600">{errors.typeNameEn.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>สถานะ</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="isActive"
                      checked={watch('isActive')}
                      onCheckedChange={(checked) => setValue('isActive', !!checked)}
                    />
                    <Label htmlFor="isActive">เปิดใช้งาน</Label>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Hierarchy & Level */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold">ระดับลำดับชั้น</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ระดับลำดับชั้น *</Label>
                  <Select
                    value={selectedHierarchy}
                    onValueChange={handleHierarchyChange}
                    disabled={personnelType.isSystemDefault}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONNEL_HIERARCHIES.map((hierarchy) => (
                        <SelectItem key={hierarchy.value} value={hierarchy.value}>
                          {hierarchy.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {personnelType.isSystemDefault && (
                    <p className="text-xs text-amber-600">
                      ไม่สามารถเปลี่ยนระดับของประเภทเริ่มต้นได้
                    </p>
                  )}
                  {errors.hierarchy && (
                    <p className="text-xs text-red-600">{errors.hierarchy.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="levelOrder">ลำดับระดับ *</Label>
                  <Input
                    id="levelOrder"
                    type="number"
                    min="1"
                    max="100"
                    {...register('levelOrder', { valueAsNumber: true })}
                    className={errors.levelOrder ? 'border-red-500' : ''}
                  />
                  {errors.levelOrder && (
                    <p className="text-xs text-red-600">{errors.levelOrder.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Permissions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold">สิทธิ์การเข้าถึง</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(PERMISSION_LABELS).map(([key, config]) => (
                  <div key={key} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <Checkbox
                      id={key}
                      checked={watch(key as keyof EditFormData) as boolean}
                      onCheckedChange={(checked) => setValue(key as keyof EditFormData, !!checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={key} className="font-medium">
                        {config.label}
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Additional Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <h4 className="font-semibold">การตั้งค่าเพิ่มเติม</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxSubordinates">จำนวนลูกน้องสูงสุด</Label>
                  <Input
                    id="maxSubordinates"
                    type="number"
                    min="0"
                    max="1000"
                    {...register('maxSubordinates', { valueAsNumber: true })}
                    className={errors.maxSubordinates ? 'border-red-500' : ''}
                  />
                  {errors.maxSubordinates && (
                    <p className="text-xs text-red-600">{errors.maxSubordinates.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultDepartmentType">ประเภทแผนกเริ่มต้น</Label>
                  <Input
                    id="defaultDepartmentType"
                    {...register('defaultDepartmentType')}
                    className={errors.defaultDepartmentType ? 'border-red-500' : ''}
                  />
                  {errors.defaultDepartmentType && (
                    <p className="text-xs text-red-600">{errors.defaultDepartmentType.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-xs text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Responsibilities */}
              <div className="space-y-2">
                <Label>หน้าที่ความรับผิดชอบ</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="เพิ่มหน้าที่ความรับผิดชอบ"
                    value={responsibilityInput}
                    onChange={(e) => setResponsibilityInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addResponsibility();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addResponsibility}
                    disabled={!responsibilityInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {responsibilities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {responsibilities.map((responsibility, index) => (
                      <Badge 
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                        onClick={() => removeResponsibility(index)}
                      >
                        {responsibility} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            บันทึกการแก้ไข
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}