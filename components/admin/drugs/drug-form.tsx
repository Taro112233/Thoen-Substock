// components/admin/drugs/drug-form.tsx - Enhanced Modal Size
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Pill, 
  Shield, 
  AlertTriangle, 
  Thermometer, 
  DollarSign,
  QrCode,
  Save,
  X,
  Info
} from 'lucide-react';

// Enhanced drug form schema
const drugFormSchema = z.object({
  hospitalDrugCode: z.string().min(1, 'รหัสยาโรงพยาบาลจำเป็น').max(20, 'รหัสยาต้องไม่เกิน 20 ตัวอักษร'),
  genericName: z.string().min(1, 'ชื่อสามัญจำเป็น'),
  brandName: z.string().optional(),
  name: z.string().min(1, 'ชื่อยาจำเป็น'),
  strength: z.string().min(1, 'ความแรงยาจำเป็น'),
  dosageForm: z.enum([
    'TABLET', 'CAPSULE', 'INJECTION', 'SYRUP', 'CREAM', 'OINTMENT',
    'DROPS', 'SPRAY', 'SUPPOSITORY', 'PATCH', 'POWDER', 'SOLUTION', 'OTHER'
  ]),
  unitOfMeasure: z.string().min(1, 'หน่วยวัดจำเป็น'),
  therapeuticClass: z.string().min(1, 'หมวดยาจำเป็น'),
  pharmacologicalClass: z.string().optional(),
  isControlled: z.boolean().default(false),
  controlledLevel: z.enum(['NONE', 'CATEGORY_1', 'CATEGORY_2', 'CATEGORY_3', 'CATEGORY_4', 'CATEGORY_5']).default('NONE'),
  isDangerous: z.boolean().default(false),
  isHighAlert: z.boolean().default(false),
  isFormulary: z.boolean().default(true),
  requiresPrescription: z.boolean().default(true),
  storageCondition: z.string().default('ปกติ'),
  requiresColdStorage: z.boolean().default(false),
  indications: z.string().optional(),
  contraindications: z.string().optional(),
  sideEffects: z.string().optional(),
  dosageInstructions: z.string().optional(),
  precautions: z.string().optional(),
  warnings: z.string().optional(),
  standardCost: z.number().min(0, 'ต้นทุนมาตรฐานต้องเป็นจำนวนบวก'),
  currentCost: z.number().min(0, 'ต้นทุนปัจจุบันต้องเป็นจำนวนบวก'),
  reorderPoint: z.number().int().min(0, 'จุดสั่งซื้อใหม่ต้องเป็นจำนวนเต็มบวก'),
  maxStockLevel: z.number().int().min(1, 'สต็อกสูงสุดต้องมากกว่า 0'),
  notes: z.string().optional(),
});

type DrugFormData = z.infer<typeof drugFormSchema>;

const dosageFormOptions = [
  { value: 'TABLET', label: 'เม็ด (Tablet)' },
  { value: 'CAPSULE', label: 'แคปซูล (Capsule)' },
  { value: 'INJECTION', label: 'ฉีด (Injection)' },
  { value: 'SYRUP', label: 'น้ำเชื่อม (Syrup)' },
  { value: 'CREAM', label: 'ครีม (Cream)' },
  { value: 'OINTMENT', label: 'ขี้ผึ้ง (Ointment)' },
  { value: 'DROPS', label: 'หยด (Drops)' },
  { value: 'SPRAY', label: 'สเปรย์ (Spray)' },
  { value: 'SUPPOSITORY', label: 'ลูกปืน (Suppository)' },
  { value: 'PATCH', label: 'แผ่นแปะ (Patch)' },
  { value: 'POWDER', label: 'ผง (Powder)' },
  { value: 'SOLUTION', label: 'สารละลาย (Solution)' },
  { value: 'OTHER', label: 'อื่นๆ (Other)' },
];

const controlledLevelOptions = [
  { value: 'NONE', label: 'ไม่ใช่ยาควบคุม' },
  { value: 'CATEGORY_1', label: 'ยาควบคุม ประเภท 1' },
  { value: 'CATEGORY_2', label: 'ยาควบคุม ประเภท 2' },
  { value: 'CATEGORY_3', label: 'ยาควบคุม ประเภท 3' },
  { value: 'CATEGORY_4', label: 'ยาควบคุม ประเภท 4' },
  { value: 'CATEGORY_5', label: 'ยาควบคุม ประเภท 5' },
];

interface DrugFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DrugForm({ open, onOpenChange, onSuccess }: DrugFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(drugFormSchema),
    defaultValues: {
      hospitalDrugCode: '',
      genericName: '',
      brandName: '',
      name: '',
      strength: '',
      dosageForm: 'TABLET',
      unitOfMeasure: '',
      therapeuticClass: '',
      pharmacologicalClass: '',
      isControlled: false,
      controlledLevel: 'NONE',
      isDangerous: false,
      isHighAlert: false,
      isFormulary: true,
      requiresPrescription: true,
      storageCondition: 'ปกติ',
      requiresColdStorage: false,
      indications: '',
      contraindications: '',
      sideEffects: '',
      dosageInstructions: '',
      precautions: '',
      warnings: '',
      standardCost: 0,
      currentCost: 0,
      reorderPoint: 10,
      maxStockLevel: 1000,
      notes: '',
    },
  });

  const { watch, setValue } = form;
  const watchedGenericName = watch('genericName');
  const watchedBrandName = watch('brandName');

  // Auto-generate name when genericName or brandName changes
  React.useEffect(() => {
    if (watchedGenericName) {
      const autoName = watchedBrandName 
        ? `${watchedGenericName} (${watchedBrandName})`
        : watchedGenericName;
      setValue('name', autoName);
    }
  }, [watchedGenericName, watchedBrandName, setValue]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 [DRUG FORM] Submitting data:', data);
      
      const response = await fetch('/api/admin/drugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          result.details.forEach((detail: any) => {
            form.setError(detail.field as any, {
              type: 'server',
              message: detail.message,
            });
          });
        }
        throw new Error(result.error || 'เกิดข้อผิดพลาด');
      }

      toast.success(result.message || 'สร้างข้อมูลยาสำเร็จ');
      form.reset();
      onOpenChange(false);
      onSuccess?.();

    } catch (error: any) {
      console.error('❌ [DRUG FORM] Submit error:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setActiveTab('basic');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-7xl w-[95vw] h-[95vh] p-0 gap-0 overflow-hidden"
        style={{ 
          maxHeight: '95vh', 
          maxWidth: '95vw',
          width: '95vw',
          height: '95vh'
        }}
      >
        {/* Header - Fixed */}
        <DialogHeader className="flex-shrink-0 px-8 py-6 border-b bg-white rounded-t-lg">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
            เพิ่มยาใหม่
          </DialogTitle>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                {/* Tab Navigation - Fixed */}
                <div className="flex-shrink-0 px-8 py-4 bg-white border-b">
                  <TabsList className="grid w-full grid-cols-5 h-12">
                    <TabsTrigger value="basic" className="text-sm">
                      ข้อมูลพื้นฐาน
                    </TabsTrigger>
                    <TabsTrigger value="classification" className="text-sm">
                      การจำแนก
                    </TabsTrigger>
                    <TabsTrigger value="clinical" className="text-sm">
                      ข้อมูลทางคลินิก
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="text-sm">
                      คลัง/ต้นทุน
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-sm">
                      ตัวอย่าง QR
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-6" style={{ maxHeight: 'calc(95vh - 240px)' }}>
                  {/* Tab 1: ข้อมูลพื้นฐาน */}
                  <TabsContent value="basic" className="mt-0 space-y-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg">ข้อมูลพื้นฐานของยา</CardTitle>
                        <CardDescription>
                          กรอกข้อมูลพื้นฐานของยาที่ต้องการเพิ่มในระบบ
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <FormField
                            control={form.control}
                            name="hospitalDrugCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">รหัสยาโรงพยาบาล *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="เช่น TAB001, INJ177" 
                                    className="h-10"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dosageForm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">รูปแบบยา *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="เลือกรูปแบบยา" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {dosageFormOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="therapeuticClass"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">หมวดยา *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="เช่น Analgesics, Antibiotics" 
                                    className="h-10"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="genericName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ชื่อสามัญ (Generic Name) *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="เช่น Paracetamol, Diazepam" 
                                    className="h-10"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="brandName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ชื่อการค้า (Brand Name)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="เช่น Tylenol, Valium" 
                                    className="h-10"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ชื่อยาในระบบ *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ชื่อยาที่จะแสดงในระบบ" 
                                    className="h-10"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  ชื่อนี้จะสร้างอัตโนมัติจากชื่อสามัญและชื่อการค้า หรือสามารถแก้ไขได้
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormField
                            control={form.control}
                            name="strength"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ความแรง *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="เช่น 500, 10" 
                                    className="h-10"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="unitOfMeasure"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">หน่วยวัด *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="เช่น mg, g, ml" 
                                    className="h-10"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="pharmacologicalClass"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">หมวดเภสัชวิทยา</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="เช่น NSAIDs, Beta-lactam" 
                                    className="h-10"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab 2: การจำแนก */}
                  <TabsContent value="classification" className="mt-0 space-y-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          การจำแนกประเภทยา
                        </CardTitle>
                        <CardDescription>
                          ระบุประเภทและสถานะการควบคุมของยา
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {/* ยาควบคุม */}
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="isControlled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-6">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium">ยาควบคุม</FormLabel>
                                  <FormDescription>
                                    ยาที่อยู่ในบัญชียาควบคุมตามกฎหมาย
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {watch('isControlled') && (
                            <FormField
                              control={form.control}
                              name="controlledLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">ระดับการควบคุม</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-10">
                                        <SelectValue placeholder="เลือกระดับการควบคุม" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {controlledLevelOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        <Separator />

                        {/* สถานะอื่นๆ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="isDangerous"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-6">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    ยาอันตราย
                                  </FormLabel>
                                  <FormDescription>
                                    ยาที่มีความเสี่ยงสูง
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isHighAlert"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-6">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    High Alert
                                  </FormLabel>
                                  <FormDescription>
                                    ยาที่ต้องระวังสูง
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isFormulary"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-6">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium">ในบัญชียา</FormLabel>
                                  <FormDescription>
                                    ยาที่อยู่ในบัญชียาโรงพยาบาล
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="requiresPrescription"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-6">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium">ต้องมีใบสั่ง</FormLabel>
                                  <FormDescription>
                                    ต้องมีใบสั่งแพทย์
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        {/* การเก็บรักษา */}
                        <div className="space-y-6">
                          <h4 className="text-base font-medium flex items-center gap-2">
                            <Thermometer className="h-4 w-4" />
                            การเก็บรักษา
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="storageCondition"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">สภาพการเก็บรักษา</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="เช่น ปกติ, เย็น, แห้ง" 
                                      className="h-10"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="requiresColdStorage"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-6">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base font-medium">ต้องเก็บเย็น</FormLabel>
                                    <FormDescription>
                                      ต้องเก็บในห้องเย็น 2-8°C
                                    </FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab 3: ข้อมูลทางคลินิก */}
                  <TabsContent value="clinical" className="mt-0 space-y-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Info className="h-5 w-5" />
                          ข้อมูลทางคลินิก
                        </CardTitle>
                        <CardDescription>
                          ข้อมูลสำหรับการใช้ยาทางคลินิก
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="indications"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ข้อบ่งใช้</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="ระบุข้อบ่งใช้ของยา..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="contraindications"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ข้อห้ามใช้</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="ระบุข้อห้ามใช้ของยา..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="sideEffects"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ผลข้างเคียง</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="ระบุผลข้างเคียงที่อาจเกิดขึ้น..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dosageInstructions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">วิธีใช้และขนาด</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="ระบุวิธีการใช้และขนาดยา..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="precautions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ข้อควรระวัง</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="ระบุข้อควรระวังในการใช้ยา..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="warnings"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">คำเตือน</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="ระบุคำเตือนสำคัญ..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab 4: คลัง/ต้นทุน */}
                  <TabsContent value="inventory" className="mt-0 space-y-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          ข้อมูลคลังและต้นทุน
                        </CardTitle>
                        <CardDescription>
                          ข้อมูลสำหรับการจัดการสต็อกและต้นทุน
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="standardCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ต้นทุนมาตรฐาน (บาท)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="h-10"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="currentCost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">ต้นทุนปัจจุบัน (บาท)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="h-10"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="reorderPoint"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">จุดสั่งซื้อใหม่</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="10"
                                    className="h-10"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  เมื่อสต็อกเหลือถึงจำนวนนี้ให้แจ้งเตือน
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="maxStockLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">สต็อกสูงสุด</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="1000"
                                    className="h-10"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  จำนวนสต็อกสูงสุดที่ควรเก็บ
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">หมายเหตุ</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="หมายเหตุเพิ่มเติม..."
                                  rows={6}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab 5: QR Preview */}
                  <TabsContent value="preview" className="mt-0 space-y-6">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <QrCode className="h-5 w-5" />
                          ตัวอย่าง QR Code
                        </CardTitle>
                        <CardDescription>
                          ตัวอย่าง QR Code ที่จะสร้างสำหรับยานี้
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex flex-col lg:flex-row items-start gap-8">
                          {/* QR Code Preview */}
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                              <div className="text-center text-gray-500">
                                <QrCode className="h-16 w-16 mx-auto mb-4" />
                                <p className="text-lg font-medium">QR Code Preview</p>
                                <p className="text-sm">(จะสร้างหลังบันทึก)</p>
                              </div>
                            </div>

                            <div className="text-center space-y-2">
                              <Badge variant="outline" className="text-base px-4 py-2">
                                รหัส: {watch('hospitalDrugCode') || 'ยังไม่ได้กรอก'}
                              </Badge>
                              <p className="text-lg font-medium text-gray-900">
                                {watch('name') || watch('genericName') || 'ชื่อยา'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {watch('strength')} {watch('unitOfMeasure')} • {dosageFormOptions.find(opt => opt.value === watch('dosageForm'))?.label}
                              </p>
                            </div>
                          </div>

                          {/* QR Information */}
                          <div className="flex-1 space-y-6">
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                              <h4 className="font-semibold text-blue-900 mb-4 text-lg">ข้อมูลใน QR Code</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <p><span className="font-medium text-blue-800">รหัสโรงพยาบาล:</span> HOSPITAL_001</p>
                                  <p><span className="font-medium text-blue-800">รหัสยา:</span> {watch('hospitalDrugCode') || 'ยังไม่ได้กรอก'}</p>
                                  <p><span className="font-medium text-blue-800">ประเภท:</span> DRUG</p>
                                </div>
                                <div className="space-y-2">
                                  <p><span className="font-medium text-blue-800">วันที่สร้าง:</span> {new Date().toLocaleDateString('th-TH')}</p>
                                  <p><span className="font-medium text-blue-800">เวอร์ชัน:</span> 1.0</p>
                                  <p><span className="font-medium text-blue-800">สถานะ:</span> ใช้งาน</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                              <h4 className="font-semibold text-green-900 mb-4 text-lg">การใช้งาน QR Code</h4>
                              <ul className="text-sm text-green-800 space-y-2">
                                <li className="flex items-start gap-2">
                                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                  สแกนเพื่อดูข้อมูลยาอย่างรวดเร็ว
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                  ตรวจสอบความถูกต้องของยาก่อนจ่าย
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                  บันทึกการใช้ยาและติดตามสต็อก
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                  เชื่อมโยงกับระบบ EMR โรงพยาบาล
                                </li>
                              </ul>
                            </div>

                            {/* Summary Information */}
                            <div className="bg-gray-50 p-6 rounded-lg border">
                              <h4 className="font-semibold text-gray-900 mb-4 text-lg">สรุปข้อมูลยา</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                  <div>
                                    <span className="font-medium text-gray-700">ชื่อยา:</span>
                                    <p className="text-gray-900">{watch('name') || watch('genericName') || '-'}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">ความแรง:</span>
                                    <p className="text-gray-900">{watch('strength')} {watch('unitOfMeasure')}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">หมวดยา:</span>
                                    <p className="text-gray-900">{watch('therapeuticClass') || '-'}</p>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <span className="font-medium text-gray-700">สถานะควบคุม:</span>
                                    <p className="text-gray-900">
                                      {watch('isControlled') ? 
                                        controlledLevelOptions.find(opt => opt.value === watch('controlledLevel'))?.label || 'ยาควบคุม'
                                        : 'ยาทั่วไป'
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">การเก็บรักษา:</span>
                                    <p className="text-gray-900">
                                      {watch('requiresColdStorage') ? 'เก็บเย็น (2-8°C)' : watch('storageCondition') || 'ปกติ'}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">ต้นทุน:</span>
                                    <p className="text-gray-900">{watch('currentCost')} บาท</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>

                {/* Form Actions - Fixed at bottom */}
                <div className="flex-shrink-0 bg-white border-t px-8 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="h-11 px-6"
                      >
                        <X className="h-4 w-4 mr-2" />
                        ยกเลิก
                      </Button>
                    </div>

                    <div className="flex items-center space-x-3">
                      {activeTab !== 'basic' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            const tabs = ['basic', 'classification', 'clinical', 'inventory', 'preview'];
                            const currentIndex = tabs.indexOf(activeTab);
                            if (currentIndex > 0) {
                              setActiveTab(tabs[currentIndex - 1]);
                            }
                          }}
                          disabled={isLoading}
                          className="h-11 px-6"
                        >
                          ← ก่อนหน้า
                        </Button>
                      )}

                      {activeTab !== 'preview' ? (
                        <Button
                          type="button"
                          size="lg"
                          onClick={() => {
                            const tabs = ['basic', 'classification', 'clinical', 'inventory', 'preview'];
                            const currentIndex = tabs.indexOf(activeTab);
                            if (currentIndex < tabs.length - 1) {
                              setActiveTab(tabs[currentIndex + 1]);
                            }
                          }}
                          disabled={isLoading}
                          className="h-11 px-6"
                        >
                          ถัดไป →
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isLoading}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 h-11 px-8"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              กำลังบันทึก...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              บันทึกข้อมูลยา
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Tabs>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}