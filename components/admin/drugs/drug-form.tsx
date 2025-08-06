// components/admin/drugs/drug-form.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Save, X, AlertTriangle, QrCode } from 'lucide-react';

// Form validation schema
const drugFormSchema = z.object({
  // ข้อมูลพื้นฐาน
  hospitalDrugCode: z.string()
    .min(1, 'รหัสยาโรงพยาบาลจำเป็น')
    .max(20, 'รหัสยาต้องไม่เกิน 20 ตัวอักษร')
    .regex(/^[A-Z0-9\-]+$/, 'รหัสยาต้องเป็นตัวอักษรพิมพ์ใหญ่และตัวเลขเท่านั้น'),
  genericName: z.string().min(1, 'ชื่อสามัญจำเป็น'),
  brandName: z.string().optional(),
  
  // ข้อมูลเภสัชกรรม
  strength: z.string().min(1, 'ความแรงยาจำเป็น'),
  dosageForm: z.enum([
    'TABLET', 'CAPSULE', 'INJECTION', 'SYRUP', 'CREAM', 'OINTMENT',
    'DROPS', 'SPRAY', 'SUPPOSITORY', 'PATCH', 'POWDER', 'SOLUTION', 'OTHER'
  ]),
  unitOfMeasure: z.string().min(1, 'หน่วยวัดจำเป็น'),
  
  // การจำแนกประเภท
  therapeuticClass: z.string().min(1, 'หมวดยาจำเป็น'),
  pharmacologicalClass: z.string().optional(),
  drugCategoryId: z.string().uuid().optional(),
  
  // สถานะและการควบคุม
  isControlled: z.boolean().default(false),
  controlledLevel: z.enum(['NONE', 'CATEGORY_1', 'CATEGORY_2', 'CATEGORY_3', 'CATEGORY_4', 'CATEGORY_5']).default('NONE'),
  isDangerous: z.boolean().default(false),
  isHighAlert: z.boolean().default(false),
  isFormulary: z.boolean().default(true),
  requiresPrescription: z.boolean().default(true),
  
  // การเก็บรักษา
  storageCondition: z.string().default('ปกติ'),
  requiresColdStorage: z.boolean().default(false),
  
  // ข้อมูลทางคลินิก
  indications: z.string().optional(),
  contraindications: z.string().optional(),
  sideEffects: z.string().optional(),
  dosageInstructions: z.string().optional(),
  precautions: z.string().optional(),
  warnings: z.string().optional(),
  
  // ต้นทุนและการจัดหา
  standardCost: z.number().positive().optional(),
  currentCost: z.number().positive().optional(),
  reorderPoint: z.number().int().min(0).default(10),
  maxStockLevel: z.number().int().positive().optional(),
  
  // หมายเหตุ
  notes: z.string().optional(),
});

type DrugFormData = z.infer<typeof drugFormSchema>;

interface DrugFormProps {
  drugId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface DrugCategory {
  id: string;
  categoryName: string;
  categoryCode: string;
  level: number;
  parentCategory?: {
    categoryName: string;
  };
}

export function DrugForm({ drugId, onSuccess, onCancel }: DrugFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<DrugCategory[]>([]);
  const [generatedQR, setGeneratedQR] = useState<string>('');

  const isEditing = !!drugId;

  // Form setup
  const form = useForm({
    resolver: zodResolver(drugFormSchema),
    defaultValues: {
      hospitalDrugCode: '',
      genericName: '',
      brandName: '',
      strength: '',
      dosageForm: 'TABLET',
      unitOfMeasure: 'เม็ด',
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
      reorderPoint: 10,
      notes: '',
    },
  });

  // Options
  const dosageForms = [
    { value: 'TABLET', label: 'เม็ด' },
    { value: 'CAPSULE', label: 'แคปซูล' },
    { value: 'INJECTION', label: 'ฉีด' },
    { value: 'SYRUP', label: 'น้ำเชื่อม' },
    { value: 'CREAM', label: 'ครีม' },
    { value: 'OINTMENT', label: 'ขี้ผึ้ง' },
    { value: 'DROPS', label: 'หยด' },
    { value: 'SPRAY', label: 'สเปรย์' },
    { value: 'SUPPOSITORY', label: 'ยาเหน็บ' },
    { value: 'PATCH', label: 'แผ่นแปะ' },
    { value: 'POWDER', label: 'ผง' },
    { value: 'SOLUTION', label: 'สารละลาย' },
    { value: 'OTHER', label: 'อื่นๆ' },
  ];

  const controlledLevels = [
    { value: 'NONE', label: 'ไม่ใช่ยาควบคุม' },
    { value: 'CATEGORY_1', label: 'ยาควบคุมประเภท 1' },
    { value: 'CATEGORY_2', label: 'ยาควบคุมประเภท 2' },
    { value: 'CATEGORY_3', label: 'ยาควบคุมประเภท 3' },
    { value: 'CATEGORY_4', label: 'ยาควบคุมประเภท 4' },
    { value: 'CATEGORY_5', label: 'ยาควบคุมประเภท 5' },
  ];

  const unitOptions = [
    'เม็ด', 'แคปซูล', 'มล.', 'กรรม', 'มก.', 'หลอด', 'ชิ้น', 'ขวด', 'กล่อง', 'ซอง', 'แผง'
  ];

  const storageConditions = [
    'ปกติ', 'เย็น (2-8°C)', 'แช่แข็ง (-20°C)', 'หลีกเลี่ยงแสง', 'ที่แห้ง', 'ควบคุมอุณหภูมิ'
  ];

  // Load drug categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/drug-categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Load existing drug data if editing
  useEffect(() => {
    if (isEditing) {
      const loadDrug = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/admin/drugs/${drugId}`);
          
          if (!response.ok) {
            throw new Error('Failed to load drug');
          }

          const { drug } = await response.json();
          
          // Reset form with loaded data
          form.reset({
            hospitalDrugCode: drug.hospitalDrugCode,
            genericName: drug.genericName,
            brandName: drug.brandName || '',
            strength: drug.strength,
            dosageForm: drug.dosageForm,
            unitOfMeasure: drug.unitOfMeasure,
            therapeuticClass: drug.therapeuticClass,
            pharmacologicalClass: drug.pharmacologicalClass || '',
            drugCategoryId: drug.drugCategoryId || '',
            isControlled: drug.isControlled,
            controlledLevel: drug.controlledLevel,
            isDangerous: drug.isDangerous,
            isHighAlert: drug.isHighAlert,
            isFormulary: drug.isFormulary,
            requiresPrescription: drug.requiresPrescription,
            storageCondition: drug.storageCondition,
            requiresColdStorage: drug.requiresColdStorage,
            indications: drug.indications || '',
            contraindications: drug.contraindications || '',
            sideEffects: drug.sideEffects || '',
            dosageInstructions: drug.dosageInstructions || '',
            precautions: drug.precautions || '',
            warnings: drug.warnings || '',
            standardCost: drug.standardCost || undefined,
            currentCost: drug.currentCost || undefined,
            reorderPoint: drug.reorderPoint,
            maxStockLevel: drug.maxStockLevel || undefined,
            notes: drug.notes || '',
          });

          if (drug.qrCode) {
            setGeneratedQR(drug.qrCode);
          }

        } catch (error) {
          console.error('Error loading drug:', error);
          toast.error('ไม่สามารถโหลดข้อมูลยาได้');
        } finally {
          setLoading(false);
        }
      };

      loadDrug();
    }
        }, [drugId, isEditing, form]);

  // Generate QR Code preview
  const generateQRPreview = () => {
    const formData = form.getValues();
    if (formData.hospitalDrugCode) {
      const qrData = JSON.stringify({
        type: 'DRUG',
        drugCode: formData.hospitalDrugCode,
        name: formData.genericName,
        timestamp: new Date().toISOString(),
      });
      setGeneratedQR(qrData);
    }
  };

  // Watch for drug code changes to update QR
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'hospitalDrugCode' || name === 'genericName') {
        generateQRPreview();
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Submit handler
  const onSubmit = async (data: any) => {
    try {
      setSaving(true);

      const url = isEditing ? `/api/admin/drugs/${drugId}` : '/api/admin/drugs';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save drug');
      }

      const result = await response.json();

      toast.success(result.message);

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error saving drug:', error);
      toast.error(error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลยาได้');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? 'แก้ไขข้อมูลยา' : 'เพิ่มยาใหม่'}
            </h2>
            <p className="text-gray-600">
              {isEditing ? 'อัพเดทข้อมูลยาในระบบ' : 'เพิ่มข้อมูลยาใหม่เข้าสู่ระบบ'}
            </p>
          </div>
          <div className="flex space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                ยกเลิก
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'อัพเดท' : 'บันทึก'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
            <TabsTrigger value="classification">จำแนกประเภท</TabsTrigger>
            <TabsTrigger value="clinical">ข้อมูลทางคลินิก</TabsTrigger>
            <TabsTrigger value="inventory">การจัดหา</TabsTrigger>
            <TabsTrigger value="preview">ตัวอย่าง QR</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
                <CardDescription>
                  ข้อมูลหลักของยาและเวชภัณฑ์
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hospitalDrugCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสยาโรงพยาบาล *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="เช่น MED001"
                            className="font-mono"
                            onChange={(e) => {
                              field.onChange(e.target.value.toUpperCase());
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          รหัสยาเฉพาะของโรงพยาบาล (A-Z, 0-9, -)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genericName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อสามัญ *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="เช่น Paracetamol" />
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
                        <FormLabel>ชื่อการค้า</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="เช่น Tylenol" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ความแรง *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="เช่น 500" />
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
                        <FormLabel>หน่วยวัด *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกหน่วยวัด" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {unitOptions.map(unit => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
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
                    name="dosageForm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รูปแบบยา *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกรูปแบบยา" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dosageForms.map(form => (
                              <SelectItem key={form.value} value={form.value}>
                                {form.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classification */}
          <TabsContent value="classification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>การจำแนกประเภท</CardTitle>
                <CardDescription>
                  หมวดหมู่และการควบคุมของยา
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="therapeuticClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>หมวดยา *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="เช่น Analgesics" />
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
                        <FormLabel>กลุ่มเภสัชวิทยา</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="เช่น NSAIDs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="drugCategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>หมวดหมู่ยา</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกหมวดหมู่" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">ไม่ระบุ</SelectItem>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.parentCategory 
                                  ? `${category.parentCategory.categoryName} > ${category.categoryName}`
                                  : category.categoryName
                                }
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
                    name="storageCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เงื่อนไขการเก็บรักษา</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกเงื่อนไขการเก็บ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {storageConditions.map(condition => (
                              <SelectItem key={condition} value={condition}>
                                {condition}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="isControlled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>ยาควบคุม</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch('isControlled') && (
                      <FormField
                        control={form.control}
                        name="controlledLevel"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="เลือกประเภท" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {controlledLevels.map(level => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="isDangerous"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>ยาอันตราย</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isHighAlert"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>ยาเสี่ยงสูง</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isFormulary"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>ในบัญชียา</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requiresPrescription"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>ต้องใบสั่งแพทย์</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requiresColdStorage"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>ต้องแช่เย็น</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical Information */}
          <TabsContent value="clinical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลทางคลินิก</CardTitle>
                <CardDescription>
                  ข้อมูลการใช้ยาและคำแนะนำทางคลินิก
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="indications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ข้อบ่งใช้</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="ระบุข้อบ่งใช้ของยา" rows={3} />
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
                      <FormLabel>ข้อห้ามใช้</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="ระบุข้อห้ามใช้ของยา" rows={3} />
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
                      <FormLabel>ผลข้างเคียง</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="ระบุผลข้างเคียงที่อาจเกิดขึ้น" rows={3} />
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
                      <FormLabel>วิธีใช้</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="ระบุวิธีการใช้ยา" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="precautions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ข้อควรระวัง</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="ข้อควรระวังในการใช้ยา" rows={3} />
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
                        <FormLabel>คำเตือน</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="คำเตือนสำคัญ" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Management */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>การจัดหาและสต็อก</CardTitle>
                <CardDescription>
                  ข้อมูลต้นทุนและการจัดการสต็อก
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="standardCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ต้นทุนมาตรฐาน (บาท)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                        <FormLabel>ต้นทุนปัจจุบัน (บาท)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                        <FormLabel>จุดสั่งซื้อ</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="10"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          จำนวนสต็อกขั้นต่ำที่ต้องสั่งซื้อเพิ่ม
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
                        <FormLabel>สต็อกสูงสุด</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="1000"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
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
                      <FormLabel>หมายเหตุ</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="หมายเหตุเพิ่มเติม" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR Code Preview */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>ตัวอย่าง QR Code</span>
                </CardTitle>
                <CardDescription>
                  QR Code จะถูกสร้างอัตโนมัติเมื่อบันทึกข้อมูลยา
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-gray-100 p-8 rounded-lg">
                    <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="font-medium">
                      รหัสยา: {form.watch('hospitalDrugCode') || 'ยังไม่ได้ระบุ'}
                    </p>
                    <p className="text-gray-600">
                      ชื่อยา: {form.watch('genericName') || 'ยังไม่ได้ระบุ'}
                    </p>
                    {generatedQR && (
                      <div className="mt-4 p-3 bg-gray-50 rounded border text-xs font-mono text-gray-600 max-w-md break-all">
                        {generatedQR}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">QR Code Feature</p>
                        <p>QR Code จะสามารถใช้สแกนผ่านกล้องมือถือได้ในอนาคต สำหรับการติดตามและจัดการสต็อกอย่างรวดเร็ว</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}