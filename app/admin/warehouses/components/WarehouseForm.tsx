// app/admin/warehouses/components/WarehouseForm.tsx
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
import { 
  Loader2, 
  AlertCircle, 
  Warehouse, 
  MapPin, 
  User,
  Thermometer,
  Droplets,
  Shield,
  Lock,
  Eye,
  Zap
} from 'lucide-react';

// Simplified and more flexible form validation schema
const warehouseFormSchema = z.object({
  name: z.string().min(1, 'ชื่อคลังจำเป็น').max(100, 'ชื่อคลังต้องไม่เกิน 100 ตัวอักษร'),
  warehouseCode: z.string()
    .min(1, 'รหัสคลังจำเป็น')
    .max(10, 'รหัสคลังต้องไม่เกิน 10 ตัวอักษร')
    .regex(/^[A-Z0-9_-]+$/i, 'รหัสคลังต้องเป็นตัวอักษร ตัวเลข หรือ - _ เท่านั้น'),
  type: z.enum([
    'CENTRAL', 'DEPARTMENT', 'EMERGENCY', 'CONTROLLED', 
    'COLD_STORAGE', 'QUARANTINE', 'DISPOSAL', 'RECEIVING', 'DISPENSING'
  ]),
  location: z.string().min(1, 'ตำแหน่งที่ตั้งจำเป็น').max(200, 'ตำแหน่งที่ตั้งต้องไม่เกิน 200 ตัวอักษร'),
  address: z.string().optional().or(z.literal('')),
  managerId: z.string().optional().or(z.literal('')),
  area: z.union([z.number().positive('พื้นที่ต้องเป็นค่าบวก'), z.nan()]).optional(),
  capacity: z.union([z.number().positive('ความจุต้องเป็นค่าบวก'), z.nan()]).optional(),
  hasTemperatureControl: z.boolean(),
  minTemperature: z.union([z.number(), z.nan()]).optional(),
  maxTemperature: z.union([z.number(), z.nan()]).optional(),
  hasHumidityControl: z.boolean(),
  minHumidity: z.union([z.number().min(0).max(100), z.nan()]).optional(),
  maxHumidity: z.union([z.number().min(0).max(100), z.nan()]).optional(),
  securityLevel: z.enum(['BASIC', 'STANDARD', 'HIGH', 'MAXIMUM']),
  accessControl: z.boolean(),
  cctv: z.boolean(),
  alarm: z.boolean(),
  allowReceiving: z.boolean(),
  allowDispensing: z.boolean(),
  allowTransfer: z.boolean(),
  requireApproval: z.boolean(),
  description: z.string().optional().or(z.literal('')),
});

type WarehouseFormData = z.infer<typeof warehouseFormSchema>;

interface WarehouseData {
  id: string;
  name: string;
  warehouseCode: string;
  type: string;
  location: string;
  address?: string;
  managerId?: string;
  area?: number;
  capacity?: number;
  hasTemperatureControl: boolean;
  minTemperature?: number;
  maxTemperature?: number;
  hasHumidityControl: boolean;
  minHumidity?: number;
  maxHumidity?: number;
  securityLevel: string;
  accessControl: boolean;
  cctv: boolean;
  alarm: boolean;
  allowReceiving: boolean;
  allowDispensing: boolean;
  allowTransfer: boolean;
  requireApproval: boolean;
  description?: string;
}

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  position?: string;
  fullName: string;
  warehouseCount: number;
}

interface WarehouseFormProps {
  warehouse?: WarehouseData;
  onSuccess: (message: string) => void;
  onCancel: () => void;
}

// Warehouse type options
const warehouseTypeOptions = [
  { value: 'CENTRAL', label: 'คลังกลาง', icon: '🏢', description: 'คลังหลักของโรงพยาบาล' },
  { value: 'DEPARTMENT', label: 'คลังแผนก', icon: '🏥', description: 'คลังประจำแผนกต่างๆ' },
  { value: 'EMERGENCY', label: 'คลังฉุกเฉิน', icon: '🚨', description: 'คลังสำหรับยาฉุกเฉิน' },
  { value: 'CONTROLLED', label: 'คลังยาควบคุม', icon: '🔒', description: 'คลังสำหรับยาควบคุมพิเศษ' },
  { value: 'COLD_STORAGE', label: 'ห้องเย็น', icon: '❄️', description: 'คลังควบคุมอุณหภูมิ' },
  { value: 'QUARANTINE', label: 'ห้องกักกัน', icon: '⚠️', description: 'คลังสำหรับยาที่ต้องกักกัน' },
  { value: 'DISPOSAL', label: 'ห้องทำลาย', icon: '🗑️', description: 'คลังสำหรับยาที่ต้องทำลาย' },
  { value: 'RECEIVING', label: 'ห้องรับของ', icon: '📦', description: 'คลังรับยาใหม่' },
  { value: 'DISPENSING', label: 'ห้องจ่ายยา', icon: '💊', description: 'คลังจ่ายยาให้ผู้ป่วย' },
];

// Security level options
const securityLevelOptions = [
  { value: 'BASIC', label: 'พื้นฐาน', description: 'การรักษาความปลอดภัยขั้นพื้นฐาน' },
  { value: 'STANDARD', label: 'มาตรฐาน', description: 'การรักษาความปลอดภัยระดับมาตรฐาน' },
  { value: 'HIGH', label: 'สูง', description: 'การรักษาความปลอดภัยระดับสูง' },
  { value: 'MAXIMUM', label: 'สูงสุด', description: 'การรักษาความปลอดภัยสูงสุด' },
];

export default function WarehouseForm({ warehouse, onSuccess, onCancel }: WarehouseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);

  const isEditing = !!warehouse;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors, isDirty },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: warehouse?.name || '',
      warehouseCode: warehouse?.warehouseCode || '',
      type: (warehouse?.type as WarehouseFormData['type']) || 'DEPARTMENT',
      location: warehouse?.location || '',
      address: warehouse?.address || '',
      managerId: warehouse?.managerId || '',
      area: warehouse?.area,
      capacity: warehouse?.capacity,
      hasTemperatureControl: warehouse?.hasTemperatureControl ?? false,
      minTemperature: warehouse?.minTemperature,
      maxTemperature: warehouse?.maxTemperature,
      hasHumidityControl: warehouse?.hasHumidityControl ?? false,
      minHumidity: warehouse?.minHumidity,
      maxHumidity: warehouse?.maxHumidity,
      securityLevel: (warehouse?.securityLevel as WarehouseFormData['securityLevel']) || 'STANDARD',
      accessControl: warehouse?.accessControl ?? false,
      cctv: warehouse?.cctv ?? false,
      alarm: warehouse?.alarm ?? false,
      allowReceiving: warehouse?.allowReceiving ?? true,
      allowDispensing: warehouse?.allowDispensing ?? true,
      allowTransfer: warehouse?.allowTransfer ?? true,
      requireApproval: warehouse?.requireApproval ?? false,
      description: warehouse?.description || '',
    },
  });

  const watchType = watch('type');
  const watchHasTemperatureControl = watch('hasTemperatureControl');
  const watchHasHumidityControl = watch('hasHumidityControl');
  const watchSecurityLevel = watch('securityLevel');
  const watchName = watch('name');
  const watchCode = watch('warehouseCode');
  const watchLocation = watch('location');

  // Check if required fields are filled
  const canSubmit = !loading && watchName?.trim() && watchCode?.trim() && watchLocation?.trim();

  // Debug form state
  useEffect(() => {
    console.log('Form errors:', errors);
    console.log('Form values:', getValues());
    console.log('Can submit:', canSubmit);
  }, [errors, getValues, canSubmit]);

  // Load available managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoadingManagers(true);
        const response = await fetch('/api/admin/warehouses/managers');
        if (response.ok) {
          const data = await response.json();
          setManagers(data.managers || []);
        }
      } catch (err) {
        console.error('Error fetching managers:', err);
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchManagers();
  }, []);

  // Auto-set temperature control for cold storage
  useEffect(() => {
    if (watchType === 'COLD_STORAGE' && !watchHasTemperatureControl) {
      setValue('hasTemperatureControl', true);
      setValue('minTemperature', 2);
      setValue('maxTemperature', 8);
    }
  }, [watchType, watchHasTemperatureControl, setValue]);

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Clean up data before sending
      const cleanedData = {
        ...data,
        warehouseCode: data.warehouseCode.toUpperCase(), // Ensure uppercase
        address: data.address || undefined,
        managerId: (!data.managerId || data.managerId === 'none') ? undefined : data.managerId,
        area: (data.area && !isNaN(data.area)) ? data.area : undefined,
        capacity: (data.capacity && !isNaN(data.capacity)) ? data.capacity : undefined,
        minTemperature: data.hasTemperatureControl && data.minTemperature !== undefined && !isNaN(data.minTemperature) ? data.minTemperature : undefined,
        maxTemperature: data.hasTemperatureControl && data.maxTemperature !== undefined && !isNaN(data.maxTemperature) ? data.maxTemperature : undefined,
        minHumidity: data.hasHumidityControl && data.minHumidity !== undefined && !isNaN(data.minHumidity) ? data.minHumidity : undefined,
        maxHumidity: data.hasHumidityControl && data.maxHumidity !== undefined && !isNaN(data.maxHumidity) ? data.maxHumidity : undefined,
        description: data.description || undefined,
      };

      console.log('Submitting data:', cleanedData);

      const url = isEditing 
        ? `/api/admin/warehouses/${warehouse.id}`
        : '/api/admin/warehouses';
      
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
      onSuccess(result.message || `${isEditing ? 'แก้ไข' : 'สร้าง'}คลังสำเร็จแล้ว`);

    } catch (err) {
      console.error('Error saving warehouse:', err);
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
          <Warehouse className="w-5 h-5 text-blue-600" />
          ข้อมูลพื้นฐาน
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อคลัง *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="เช่น คลังยาแผนกฉุกเฉิน"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouseCode">รหัสคลัง *</Label>
            <Input
              id="warehouseCode"
              {...register('warehouseCode')}
              placeholder="เช่น ER-001"
              className={`font-mono ${errors.warehouseCode ? 'border-red-500' : ''}`}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setValue('warehouseCode', value);
              }}
            />
            {errors.warehouseCode && (
              <p className="text-sm text-red-600">{errors.warehouseCode.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="type">ประเภทคลัง *</Label>
            <Select value={watchType} onValueChange={(value) => setValue('type', value as WarehouseFormData['type'])}>
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="เลือกประเภทคลัง" />
              </SelectTrigger>
              <SelectContent>
                {warehouseTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
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
          <Label htmlFor="description">คำอธิบาย</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="อธิบายหน้าที่และการใช้งานของคลัง..."
            rows={3}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          ข้อมูลตำแหน่งที่ตั้ง
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">ตำแหน่งที่ตั้ง *</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="เช่น อาคาร A ชั้น 1 ห้อง 101"
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerId">ผู้จัดการคลัง</Label>
            <Select 
              value={watch('managerId') || 'none'} 
              onValueChange={(value) => setValue('managerId', value === 'none' ? '' : value)}
              disabled={loadingManagers}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingManagers ? "กำลังโหลด..." : "เลือกผู้จัดการคลัง"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ไม่มีผู้จัดการ</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    <div>
                      <div className="font-medium">{manager.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {manager.position} • จัดการ {manager.warehouseCount} คลัง
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">ที่อยู่โดยละเอียด</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="ระบุที่อยู่โดยละเอียดของคลัง..."
              rows={2}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">พื้นที่ (ตารางเมตร)</Label>
            <Input
              id="area"
              type="number"
              min="0"
              step="0.01"
              {...register('area', { valueAsNumber: true })}
              placeholder="เช่น 25.5"
              className={errors.area ? 'border-red-500' : ''}
            />
            {errors.area && (
              <p className="text-sm text-red-600">{errors.area.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">ความจุ (ลูกบาศก์เมตร)</Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              step="0.01"
              {...register('capacity', { valueAsNumber: true })}
              placeholder="เช่น 100.0"
              className={errors.capacity ? 'border-red-500' : ''}
            />
            {errors.capacity && (
              <p className="text-sm text-red-600">{errors.capacity.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Environmental Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-orange-600" />
          การควบคุมสิ่งแวดล้อม
        </h3>

        {/* Temperature Control */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasTemperatureControl"
              checked={watchHasTemperatureControl}
              onCheckedChange={(checked) => setValue('hasTemperatureControl', !!checked)}
            />
            <Label htmlFor="hasTemperatureControl" className="font-medium">
              ควบคุมอุณหภูมิ
            </Label>
          </div>

          {watchHasTemperatureControl && (
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div className="space-y-2">
                <Label htmlFor="minTemperature">อุณหภูมิต่ำสุด (°C)</Label>
                <Input
                  id="minTemperature"
                  type="number"
                  step="0.1"
                  {...register('minTemperature', { valueAsNumber: true })}
                  placeholder="เช่น 2.0"
                  className={errors.minTemperature ? 'border-red-500' : ''}
                />
                {errors.minTemperature && (
                  <p className="text-sm text-red-600">{errors.minTemperature.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTemperature">อุณหภูมิสูงสุด (°C)</Label>
                <Input
                  id="maxTemperature"
                  type="number"
                  step="0.1"
                  {...register('maxTemperature', { valueAsNumber: true })}
                  placeholder="เช่น 8.0"
                  className={errors.maxTemperature ? 'border-red-500' : ''}
                />
                {errors.maxTemperature && (
                  <p className="text-sm text-red-600">{errors.maxTemperature.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Humidity Control */}
        <div className="space-y-3 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasHumidityControl"
              checked={watchHasHumidityControl}
              onCheckedChange={(checked) => setValue('hasHumidityControl', !!checked)}
            />
            <Label htmlFor="hasHumidityControl" className="font-medium">
              ควบคุมความชื้น
            </Label>
          </div>

          {watchHasHumidityControl && (
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div className="space-y-2">
                <Label htmlFor="minHumidity">ความชื้นต่ำสุด (%)</Label>
                <Input
                  id="minHumidity"
                  type="number"
                  min="0"
                  max="100"
                  {...register('minHumidity', { valueAsNumber: true })}
                  placeholder="เช่น 30"
                  className={errors.minHumidity ? 'border-red-500' : ''}
                />
                {errors.minHumidity && (
                  <p className="text-sm text-red-600">{errors.minHumidity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxHumidity">ความชื้นสูงสุด (%)</Label>
                <Input
                  id="maxHumidity"
                  type="number"
                  min="0"
                  max="100"
                  {...register('maxHumidity', { valueAsNumber: true })}
                  placeholder="เช่น 70"
                  className={errors.maxHumidity ? 'border-red-500' : ''}
                />
                {errors.maxHumidity && (
                  <p className="text-sm text-red-600">{errors.maxHumidity.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          การรักษาความปลอดภัย
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="securityLevel">ระดับความปลอดภัย</Label>
            <Select 
              value={watchSecurityLevel} 
              onValueChange={(value) => setValue('securityLevel', value as WarehouseFormData['securityLevel'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกระดับความปลอดภัย" />
              </SelectTrigger>
              <SelectContent>
                {securityLevelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accessControl"
                checked={watch('accessControl')}
                onCheckedChange={(checked) => setValue('accessControl', !!checked)}
              />
              <Label htmlFor="accessControl" className="font-medium">
                ควบคุมการเข้าถึง
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cctv"
                checked={watch('cctv')}
                onCheckedChange={(checked) => setValue('cctv', !!checked)}
              />
              <Label htmlFor="cctv" className="font-medium">
                กล้องวงจรปิด
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="alarm"
                checked={watch('alarm')}
                onCheckedChange={(checked) => setValue('alarm', !!checked)}
              />
              <Label htmlFor="alarm" className="font-medium">
                ระบบแจ้งเตือน
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          การตั้งค่าการดำเนินงาน
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowReceiving"
                checked={watch('allowReceiving')}
                onCheckedChange={(checked) => setValue('allowReceiving', !!checked)}
              />
              <Label htmlFor="allowReceiving" className="font-medium">
                อนุญาตให้รับของ
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowDispensing"
                checked={watch('allowDispensing')}
                onCheckedChange={(checked) => setValue('allowDispensing', !!checked)}
              />
              <Label htmlFor="allowDispensing" className="font-medium">
                อนุญาตให้จ่ายยา
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowTransfer"
                checked={watch('allowTransfer')}
                onCheckedChange={(checked) => setValue('allowTransfer', !!checked)}
              />
              <Label htmlFor="allowTransfer" className="font-medium">
                อนุญาตให้โอน
              </Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireApproval"
              checked={watch('requireApproval')}
              onCheckedChange={(checked) => setValue('requireApproval', !!checked)}
            />
            <Label htmlFor="requireApproval" className="font-medium">
              ต้องการการอนุมัติสำหรับการดำเนินงาน
            </Label>
          </div>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-gray-100 rounded-lg text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Required fields filled: {watchName?.trim() ? '✅' : '❌'} Name, {watchCode?.trim() ? '✅' : '❌'} Code, {watchLocation?.trim() ? '✅' : '❌'} Location</p>
          <p>Form errors: {Object.keys(errors).length > 0 ? JSON.stringify(errors) : 'None'}</p>
          <p>Can submit: {canSubmit ? '✅' : '❌'}</p>
          <p>Loading: {loading ? '⏳' : '✅'}</p>
        </div>
      )}

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
          disabled={!canSubmit}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>{isEditing ? 'อัพเดตคลัง' : 'สร้างคลัง'}</>
          )}
        </Button>
      </div>
    </form>
  );
}