// components/admin/drugs/drug-form.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Shield, 
  AlertTriangle, 
  Package, 
  QrCode,
  Save,
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

// Types for form data
interface DrugFormData {
  // ข้อมูลพื้นฐาน
  hospitalDrugCode: string;
  genericName: string;
  brandName?: string;
  
  // ข้อมูลเภสัชกรรม
  strength: string;
  dosageForm: string;
  unitOfMeasure: string;
  
  // การจำแนกประเภท
  therapeuticClass: string;
  pharmacologicalClass?: string;
  drugCategoryId?: string;
  
  // สถานะและการควบคุม
  isControlled: boolean;
  controlledLevel: string;
  isDangerous: boolean;
  isHighAlert: boolean;
  isFormulary: boolean;
  requiresPrescription: boolean;
  
  // การเก็บรักษา
  storageCondition: string;
  requiresColdStorage: boolean;
  
  // ข้อมูลทางคลินิก
  indications?: string;
  contraindications?: string;
  sideEffects?: string;
  dosageInstructions?: string;
  precautions?: string;
  warnings?: string;
  
  // ต้นทุนและการจัดหา
  standardCost?: number;
  currentCost?: number;
  reorderPoint: number;
  maxStockLevel?: number;
  
  // หมายเหตุ
  notes?: string;
}

interface DrugFormProps {
  onSuccess?: (drug: any) => void;
  onCancel?: () => void;
}

// Form data constants
const dosageForms = [
  { value: 'TABLET', label: 'เม็ด (Tablet)' },
  { value: 'CAPSULE', label: 'แคปซูล (Capsule)' },
  { value: 'INJECTION', label: 'ยาฉีด (Injection)' },
  { value: 'SYRUP', label: 'น้ำเชื่อม (Syrup)' },
  { value: 'CREAM', label: 'ครีม (Cream)' },
  { value: 'OINTMENT', label: 'ขี้ผึ้ง (Ointment)' },
  { value: 'DROPS', label: 'หยด (Drops)' },
  { value: 'SPRAY', label: 'สเปรย์ (Spray)' },
  { value: 'SUPPOSITORY', label: 'ยาเหน็บ (Suppository)' },
  { value: 'PATCH', label: 'แผ่นแปะ (Patch)' },
  { value: 'POWDER', label: 'ผง (Powder)' },
  { value: 'SOLUTION', label: 'น้ำยา (Solution)' },
  { value: 'OTHER', label: 'อื่นๆ (Other)' }
];

const controlledLevels = [
  { value: 'NONE', label: 'ไม่ใช่ยาควบคุม' },
  { value: 'CATEGORY_1', label: 'ประเภท 1' },
  { value: 'CATEGORY_2', label: 'ประเภท 2' },
  { value: 'CATEGORY_3', label: 'ประเภท 3' },
  { value: 'CATEGORY_4', label: 'ประเภท 4' },
  { value: 'CATEGORY_5', label: 'ประเภท 5' }
];

const storageConditions = [
  { value: 'ปกติ', label: 'ปกติ (อุณหภูมิห้อง)' },
  { value: 'เย็น', label: 'เย็น (2-8°C)' },
  { value: 'แช่แข็ง', label: 'แช่แข็ง (-18°C)' },
  { value: 'ควบคุมอุณหภูมิ', label: 'ควบคุมอุณหภูมิ' },
  { value: 'ป้องกันแสง', label: 'ป้องกันแสง' },
  { value: 'ป้องกันความชื้น', label: 'ป้องกันความชื้น' }
];

export function DrugForm({ onSuccess, onCancel }: DrugFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<DrugFormData>({
    defaultValues: {
      isControlled: false,
      controlledLevel: 'NONE',
      isDangerous: false,
      isHighAlert: false,
      isFormulary: true,
      requiresPrescription: true,
      storageCondition: 'ปกติ',
      requiresColdStorage: false,
      reorderPoint: 10
    }
  });

  // Watch form values for preview
  const watchedValues = watch();

  // Generate QR data for preview
  const generateQRData = () => {
    if (!watchedValues.hospitalDrugCode) return null;
    
    return JSON.stringify({
      hospitalId: 'CURRENT_HOSPITAL',
      drugCode: watchedValues.hospitalDrugCode,
      type: 'DRUG',
      timestamp: new Date().toISOString()
    });
  };

  // Handle form submission
  const onSubmit = async (data: DrugFormData) => {
    setIsLoading(true);
    
    try {
      console.log('🔍 [DRUG FORM] Submitting:', data);
      
      const response = await fetch('/api/admin/drugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'สร้างข้อมูลยาสำเร็จ');
        onSuccess?.(result.drug);
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาดในการสร้างข้อมูลยา');
        
        if (result.details) {
          console.log('🔍 [DRUG FORM] Validation errors:', result.details);
        }
      }
    } catch (error) {
      console.error('❌ [DRUG FORM] Submit error:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
          <TabsTrigger value="classification">การจำแนก</TabsTrigger>
          <TabsTrigger value="clinical">ข้อมูลทางคลินิก</TabsTrigger>
          <TabsTrigger value="inventory">คลัง/ต้นทุน</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
        </TabsList>

        {/* Tab 1: ข้อมูลพื้นฐาน */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5" />
                <span>ข้อมูลยาพื้นฐาน</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalDrugCode">รหัสยาโรงพยาบาล *</Label>
                  <Input
                    id="hospitalDrugCode"
                    {...register('hospitalDrugCode', { 
                      required: 'รหัสยาโรงพยาบาลจำเป็น',
                      maxLength: { value: 20, message: 'รหัสยาต้องไม่เกิน 20 ตัวอักษร' }
                    })}
                    placeholder="เช่น DRG001"
                    className={errors.hospitalDrugCode ? 'border-red-500' : ''}
                  />
                  {errors.hospitalDrugCode && (
                    <p className="text-sm text-red-500">{errors.hospitalDrugCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genericName">ชื่อสามัญ *</Label>
                  <Input
                    id="genericName"
                    {...register('genericName', { required: 'ชื่อสามัญจำเป็น' })}
                    placeholder="เช่น Paracetamol"
                    className={errors.genericName ? 'border-red-500' : ''}
                  />
                  {errors.genericName && (
                    <p className="text-sm text-red-500">{errors.genericName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandName">ชื่อการค้า</Label>
                <Input
                  id="brandName"
                  {...register('brandName')}
                  placeholder="เช่น Tylenol (ไม่บังคับ)"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strength">ความแรง *</Label>
                  <Input
                    id="strength"
                    {...register('strength', { required: 'ความแรงยาจำเป็น' })}
                    placeholder="เช่น 500"
                    className={errors.strength ? 'border-red-500' : ''}
                  />
                  {errors.strength && (
                    <p className="text-sm text-red-500">{errors.strength.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">หน่วยวัด *</Label>
                  <Input
                    id="unitOfMeasure"
                    {...register('unitOfMeasure', { required: 'หน่วยวัดจำเป็น' })}
                    placeholder="เช่น mg, ml, IU"
                    className={errors.unitOfMeasure ? 'border-red-500' : ''}
                  />
                  {errors.unitOfMeasure && (
                    <p className="text-sm text-red-500">{errors.unitOfMeasure.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dosageForm">รูปแบบยา *</Label>
                  <Select
                    onValueChange={(value) => setValue('dosageForm', value)}
                  >
                    <SelectTrigger className={errors.dosageForm ? 'border-red-500' : ''}>
                      <SelectValue placeholder="เลือกรูปแบบยา" />
                    </SelectTrigger>
                    <SelectContent>
                      {dosageForms.map((form) => (
                        <SelectItem key={form.value} value={form.value}>
                          {form.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.dosageForm && (
                    <p className="text-sm text-red-500">{errors.dosageForm.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="therapeuticClass">หมวดหมู่ยา *</Label>
                <Input
                  id="therapeuticClass"
                  {...register('therapeuticClass', { required: 'หมวดหมู่ยาจำเป็น' })}
                  placeholder="เช่น Analgesics, Antibiotics"
                  className={errors.therapeuticClass ? 'border-red-500' : ''}
                />
                {errors.therapeuticClass && (
                  <p className="text-sm text-red-500">{errors.therapeuticClass.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pharmacologicalClass">หมวดหมู่ทางเภสัชวิทยา</Label>
                <Input
                  id="pharmacologicalClass"
                  {...register('pharmacologicalClass')}
                  placeholder="เช่น NSAID, Beta-lactam (ไม่บังคับ)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: การจำแนกประเภท */}
        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>การจำแนกประเภทและการควบคุม</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ยาควบคุม */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isControlled"
                    checked={watchedValues.isControlled}
                    onCheckedChange={(checked) => {
                      setValue('isControlled', checked);
                      if (!checked) {
                        setValue('controlledLevel', 'NONE');
                      }
                    }}
                  />
                  <Label htmlFor="isControlled" className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>ยาควบคุม</span>
                  </Label>
                </div>

                {watchedValues.isControlled && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="controlledLevel">ระดับการควบคุม</Label>
                    <Select
                      onValueChange={(value) => setValue('controlledLevel', value)}
                      defaultValue="NONE"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระดับการควบคุม" />
                      </SelectTrigger>
                      <SelectContent>
                        {controlledLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* ยาอันตราย และ High Alert */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDangerous"
                    checked={watchedValues.isDangerous}
                    onCheckedChange={(checked) => setValue('isDangerous', checked)}
                  />
                  <Label htmlFor="isDangerous" className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>ยาอันตราย</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isHighAlert"
                    checked={watchedValues.isHighAlert}
                    onCheckedChange={(checked) => setValue('isHighAlert', checked)}
                  />
                  <Label htmlFor="isHighAlert" className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>High Alert Drug</span>
                  </Label>
                </div>
              </div>

              {/* สถานะยา */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFormulary"
                    checked={watchedValues.isFormulary}
                    onCheckedChange={(checked) => setValue('isFormulary', checked)}
                  />
                  <Label htmlFor="isFormulary">อยู่ในบัญชียาโรงพยาบาล</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresPrescription"
                    checked={watchedValues.requiresPrescription}
                    onCheckedChange={(checked) => setValue('requiresPrescription', checked)}
                  />
                  <Label htmlFor="requiresPrescription">ต้องมีใบสั่งยา</Label>
                </div>
              </div>

              {/* การเก็บรักษา */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storageCondition">เงื่อนไขการเก็บรักษา</Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('storageCondition', value);
                      setValue('requiresColdStorage', value === 'เย็น' || value === 'แช่แข็ง');
                    }}
                    defaultValue="ปกติ"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกเงื่อนไขการเก็บรักษา" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageConditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresColdStorage"
                    checked={watchedValues.requiresColdStorage}
                    onCheckedChange={(checked) => setValue('requiresColdStorage', checked)}
                  />
                  <Label htmlFor="requiresColdStorage">ต้องเก็บในที่เย็น</Label>
                </div>
              </div>

              {/* Preview badges */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium">ตัวอย่างป้ายกำกับ:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedValues.isControlled && (
                    <Badge variant="secondary">ยาควบคุม {watchedValues.controlledLevel}</Badge>
                  )}
                  {watchedValues.isDangerous && (
                    <Badge variant="destructive">ยาอันตราย</Badge>
                  )}
                  {watchedValues.isHighAlert && (
                    <Badge variant="destructive">High Alert</Badge>
                  )}
                  {watchedValues.isFormulary && (
                    <Badge variant="outline">ในบัญชียา</Badge>
                  )}
                  {watchedValues.requiresPrescription && (
                    <Badge variant="default">ต้องมีใบสั่ง</Badge>
                  )}
                  {watchedValues.requiresColdStorage && (
                    <Badge variant="secondary">เก็บเย็น</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: ข้อมูลทางคลินิก */}
        <TabsContent value="clinical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลทางคลินิก</CardTitle>
              <CardDescription>
                ข้อมูลสำหรับการใช้ยาและคำแนะนำทางการแพทย์
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="indications">ข้อบ่งใช้</Label>
                <Textarea
                  id="indications"
                  {...register('indications')}
                  placeholder="ระบุข้อบ่งใช้ของยา..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraindications">ข้อห้ามใช้</Label>
                <Textarea
                  id="contraindications"
                  {...register('contraindications')}
                  placeholder="ระบุข้อห้ามใช้ของยา..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sideEffects">ผลข้างเคียง</Label>
                <Textarea
                  id="sideEffects"
                  {...register('sideEffects')}
                  placeholder="ระบุผลข้างเคียงที่อาจเกิดขึ้น..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosageInstructions">วิธีใช้ยา</Label>
                <Textarea
                  id="dosageInstructions"
                  {...register('dosageInstructions')}
                  placeholder="ระบุวิธีการใช้ยาและขนาดยา..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precautions">ข้อควรระวัง</Label>
                <Textarea
                  id="precautions"
                  {...register('precautions')}
                  placeholder="ระบุข้อควรระวังในการใช้ยา..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warnings">คำเตือน</Label>
                <Textarea
                  id="warnings"
                  {...register('warnings')}
                  placeholder="ระบุคำเตือนสำคัญ..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: คลัง/ต้นทุน */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>การจัดการคลังและต้นทุน</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="standardCost">ต้นทุนมาตรฐาน (บาท)</Label>
                  <Input
                    id="standardCost"
                    type="number"
                    step="0.01"
                    {...register('standardCost', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCost">ต้นทุนปัจจุบัน (บาท)</Label>
                  <Input
                    id="currentCost"
                    type="number"
                    step="0.01"
                    {...register('currentCost', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">จุดสั่งซื้อใหม่ *</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    {...register('reorderPoint', { 
                      required: 'จุดสั่งซื้อใหม่จำเป็น',
                      valueAsNumber: true,
                      min: { value: 0, message: 'ต้องมากกว่าหรือเท่ากับ 0' }
                    })}
                    placeholder="10"
                    className={errors.reorderPoint ? 'border-red-500' : ''}
                  />
                  {errors.reorderPoint && (
                    <p className="text-sm text-red-500">{errors.reorderPoint.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStockLevel">สต็อกสูงสุด</Label>
                  <Input
                    id="maxStockLevel"
                    type="number"
                    {...register('maxStockLevel', { valueAsNumber: true })}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">หมายเหตุ</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="หมายเหตุเพิ่มเติม..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: QR Code Preview */}
        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>QR Code Preview</span>
              </CardTitle>
              <CardDescription>
                QR Code จะถูกสร้างอัตโนมัติเมื่อบันทึกข้อมูลยา
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {watchedValues.hospitalDrugCode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">ข้อมูลที่จะเก็บใน QR Code:</h4>
                    <div className="font-mono text-sm bg-white p-3 rounded border">
                      <pre>{generateQRData()}</pre>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">รหัสยา</Label>
                      <p className="font-mono">{watchedValues.hospitalDrugCode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">ชื่อยา</Label>
                      <p>{watchedValues.genericName || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">ความแรง</Label>
                      <p>{watchedValues.strength ? `${watchedValues.strength} ${watchedValues.unitOfMeasure || ''}` : '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">รูปแบบ</Label>
                      <p>{watchedValues.dosageForm ? dosageForms.find(f => f.value === watchedValues.dosageForm)?.label : '-'}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 QR Code จะสามารถใช้สำหรับการสแกนเพื่อค้นหาข้อมูลยาและการจัดการสต็อกในอนาคต
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>กรุณากรอกรหัสยาโรงพยาบาลเพื่อดู Preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          ยกเลิก
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              // Go to next tab or submit if on last tab
              const tabs = ['basic', 'classification', 'clinical', 'inventory', 'qr'];
              const currentIndex = tabs.indexOf(activeTab);
              if (currentIndex < tabs.length - 1) {
                setActiveTab(tabs[currentIndex + 1]);
              }
            }}
            disabled={isLoading || activeTab === 'qr'}
          >
            ถัดไป
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                บันทึกยา
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}