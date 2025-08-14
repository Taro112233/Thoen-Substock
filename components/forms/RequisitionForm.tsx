'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Trash2,
  Calendar,
  Package,
  FileText,
  Save,
  Send,
  Pill,
  Hash,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
interface Drug {
  id: string;
  hospitalDrugCode: string;
  name: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  unit: string;
  isControlled?: boolean;
  isDangerous?: boolean;
  isHighAlert?: boolean;
  displayName?: string;
}

interface RequisitionItem {
  drugId: string;
  drugName: string;
  drugCode: string;
  form: string;
  strength: string;
  unit: string;
  requestedQuantity: number;
  notes?: string;
}

// Mock data สำหรับแผนก
const mockDepartments = [
  { id: '1', name: 'แผนกผู้ป่วยใน' },
  { id: '2', name: 'แผนกผู้ป่วยนอก' },
  { id: '3', name: 'แผนกฉุกเฉิน' },
  { id: '4', name: 'แผนกไอซียู' },
  { id: '5', name: 'แผนกห้องผ่าตัด' },
];

// Mock data สำหรับคลัง
const mockWarehouses = [
  { id: '1', name: 'เภสัชกรรมกลาง', type: 'MAIN_PHARMACY' },
  { id: '2', name: 'คลังยาแผนกผู้ป่วยใน', type: 'DEPARTMENT_STOCK' },
  { id: '3', name: 'คลังยาฉุกเฉิน', type: 'EMERGENCY_STOCK' },
];

// Form validation schema - ใช้ field ง่ายๆ
const requisitionFormSchema = z.object({
  requisitionNumber: z.string().min(1, 'เลขที่ใบเบิกจำเป็นต้องระบุ'),
  purpose: z.string().min(1, 'วัตถุประสงค์จำเป็นต้องระบุ'),
  type: z.enum(['REGULAR', 'EMERGENCY', 'SCHEDULED', 'RETURN']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  requiredDate: z.string().min(1, 'วันที่ต้องการจำเป็นต้องระบุ'),
  requestingDepartmentId: z.string().min(1, 'แผนกที่เบิกจำเป็นต้องระบุ'),
  fulfillmentWarehouseId: z.string().min(1, 'คลังที่จ่ายจำเป็นต้องระบุ'),
  items: z.array(z.object({
    drugId: z.string(),
    drugName: z.string(),
    drugCode: z.string(),
    form: z.string(),
    strength: z.string(),
    unit: z.string(),
    requestedQuantity: z.number().positive('จำนวนต้องมากกว่า 0'),
    notes: z.string().optional()
  })).min(1, 'ต้องมีรายการยาอย่างน้อย 1 รายการ'),
  notes: z.string().optional()
});

type RequisitionFormData = z.infer<typeof requisitionFormSchema>;

// Drug Search Modal Component
interface DrugSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDrug: (drug: Drug) => void;
  selectedDrugIds: string[];
}

const DrugSearchModal: React.FC<DrugSearchModalProps> = ({
  open,
  onOpenChange,
  onSelectDrug,
  selectedDrugIds
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);

  // ค้นหายาจาก API
  const searchDrugs = async (query: string) => {
    if (!query.trim()) {
      setDrugs([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/drugs/search?q=${encodeURIComponent(query)}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setDrugs(data.data);
      } else {
        console.error('Search error:', data.error);
        setDrugs([]);
      }
    } catch (error) {
      console.error('Search fetch error:', error);
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchDrugs(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectDrug = (drug: Drug) => {
    if (!selectedDrugIds.includes(drug.id)) {
      onSelectDrug(drug);
      setSearchQuery('');
      setDrugs([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            ค้นหาและเลือกยา
          </DialogTitle>
          <DialogDescription>
            ค้นหายาจากรหัส ชื่อยา หรือชื่อสามัญ
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            placeholder="พิมพ์เพื่อค้นหายา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-auto">
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              กำลังค้นหา...
            </div>
          )}
          
          {!loading && drugs.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบยาที่ตรงกับคำค้นหา
            </div>
          )}

          {!loading && drugs.length === 0 && !searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              พิมพ์ชื่อยาเพื่อเริ่มค้นหา
            </div>
          )}

          {!loading && drugs.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสยา</TableHead>
                  <TableHead>ชื่อยา</TableHead>
                  <TableHead>รูปแบบ</TableHead>
                  <TableHead>ความแรง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="w-24">เลือก</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drugs.map(drug => {
                  const isSelected = selectedDrugIds.includes(drug.id);
                  
                  return (
                    <TableRow key={drug.id} className={isSelected ? 'bg-muted' : ''}>
                      <TableCell className="font-mono">{drug.hospitalDrugCode}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{drug.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {drug.genericName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{drug.dosageForm}</TableCell>
                      <TableCell>{drug.strength}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {drug.isControlled && (
                            <Badge variant="destructive" className="text-xs">ควบคุม</Badge>
                          )}
                          {drug.isHighAlert && (
                            <Badge variant="outline" className="text-xs">เฝ้าระวัง</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelectDrug(drug)}
                          disabled={isSelected}
                          variant={isSelected ? "outline" : "default"}
                        >
                          {isSelected ? 'เลือกแล้ว' : 'เลือก'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main RequisitionForm Component
export default function RequisitionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const form = useForm<RequisitionFormData>({
    resolver: zodResolver(requisitionFormSchema),
    defaultValues: {
      requisitionNumber: '',
      purpose: '',
      type: 'REGULAR',
      priority: 'NORMAL',
      requiredDate: format(new Date(), 'yyyy-MM-dd'),
      requestingDepartmentId: '',
      fulfillmentWarehouseId: '',
      items: [],
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  // Generate requisition number
  useEffect(() => {
    const generateReqNumber = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
      return `REQ${year}${month}${day}-${time}`;
    };

    if (!form.watch('requisitionNumber')) {
      form.setValue('requisitionNumber', generateReqNumber());
    }
  }, [form]);

  const handleAddDrug = (drug: Drug) => {
    const newItem: RequisitionItem = {
      drugId: drug.id,
      drugName: drug.name,
      drugCode: drug.hospitalDrugCode,
      form: drug.dosageForm,
      strength: drug.strength,
      unit: drug.unit,
      requestedQuantity: 1,
      notes: ''
    };

    append(newItem);
    setSearchModalOpen(false);
    
    toast({
      title: "เพิ่มยาสำเร็จ",
      description: `เพิ่ม ${drug.name} เข้าในรายการเบิกแล้ว`,
    });
  };

  const handleRemoveItem = (index: number) => {
    const item = fields[index];
    remove(index);
    
    toast({
      title: "ลบรายการสำเร็จ",
      description: `ลบ ${item.drugName} ออกจากรายการเบิกแล้ว`,
    });
  };

  const handleSubmit = async (data: RequisitionFormData, saveAsDraft = false) => {
    try {
      setLoading(true);
      
      // แปลงข้อมูลให้ตรงกับ API
      const submitData = {
        requisitionNumber: data.requisitionNumber,
        purpose: data.purpose,
        type: data.type,
        priority: data.priority,
        requiredDate: data.requiredDate,
        requestingDepartmentId: data.requestingDepartmentId,
        fulfillmentWarehouseId: data.fulfillmentWarehouseId,
        items: data.items.map(item => ({
          drugId: item.drugId,
          requestedQuantity: item.requestedQuantity,
          notes: item.notes
        })),
        notes: data.notes,
        saveAsDraft
      };

      const response = await fetch('/api/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: saveAsDraft ? "บันทึกฉบับร่างสำเร็จ" : "ส่งใบเบิกสำเร็จ",
          description: result.message,
        });

        // Redirect to requisitions list
        router.push('/dashboard/requisitions');
      } else {
        throw new Error(result.error || 'เกิดข้อผิดพลาด');
      }
      
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถบันทึกใบเบิกได้ กรุณาลองใหม่",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedDrugIds = fields.map(field => field.drugId);
  const totalItems = fields.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">สร้างใบเบิกยาใหม่</h1>
          <p className="text-muted-foreground">
            กรอกข้อมูลและเลือกรายการยาที่ต้องการเบิก
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">วันที่สร้าง</div>
          <div className="font-medium">
            {format(new Date(), 'dd MMMM yyyy', { locale: th })}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => handleSubmit(data, false))}>
          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ข้อมูลพื้นฐาน
              </CardTitle>
              <CardDescription>
                ข้อมูลทั่วไปของใบเบิกยา
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requisitionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        เลขที่ใบเบิก
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="REQ20240101-0001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        วัตถุประสงค์
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="สำหรับการรักษาผู้ป่วย" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ประเภทการเบิก</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกประเภทการเบิก" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REGULAR">การเบิกปกติ</SelectItem>
                          <SelectItem value="EMERGENCY">การเบิกฉุกเฉิน</SelectItem>
                          <SelectItem value="SCHEDULED">การเบิกตามตารางเวลา</SelectItem>
                          <SelectItem value="RETURN">การส่งคืนยา</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ระดับความสำคัญ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกระดับความสำคัญ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">ต่ำ</SelectItem>
                          <SelectItem value="NORMAL">ปกติ</SelectItem>
                          <SelectItem value="HIGH">สูง</SelectItem>
                          <SelectItem value="URGENT">เร่งด่วน</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requestingDepartmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        แผนกที่เบิก
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกแผนกที่เบิก" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockDepartments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
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
                  name="fulfillmentWarehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        คลังที่จ่าย
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกคลังที่จ่าย" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockWarehouses.map(warehouse => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requiredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        วันที่ต้องการ
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Drug Items */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    รายการยาที่เบิก
                    {totalItems > 0 && (
                      <Badge variant="secondary">{totalItems} รายการ</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    เลือกยาและระบุจำนวนที่ต้องการเบิก
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => setSearchModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มยา
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>ยังไม่มีรายการยา</p>
                  <p className="text-sm">คลิกปุ่ม "เพิ่มยา" เพื่อเลือกยาที่ต้องการเบิก</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">ลำดับ</TableHead>
                        <TableHead>รายการ</TableHead>
                        <TableHead>รูปแบบ</TableHead>
                        <TableHead>ความแรง</TableHead>
                        <TableHead>หน่วย</TableHead>
                        <TableHead className="w-24">จำนวนเบิก</TableHead>
                        <TableHead>หมายเหตุ</TableHead>
                        <TableHead className="w-12">ลบ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className="text-center">{index + 1}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{field.drugName}</div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {field.drugCode}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{field.form}</TableCell>
                          <TableCell>{field.strength}</TableCell>
                          <TableCell>{field.unit}</TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.requestedQuantity`}
                              render={({ field: quantityField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...quantityField}
                                      onChange={(e) => quantityField.onChange(parseInt(e.target.value) || 0)}
                                      className="w-20"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.notes`}
                              render={({ field: notesField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...notesField}
                                      placeholder="หมายเหตุ..."
                                      className="w-32"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>หมายเหตุเพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="หมายเหตุหรือข้อมูลเพิ่มเติม (ถ้ามี)"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                ยกเลิก
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit(form.getValues(), true)}
                disabled={loading || fields.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                บันทึกร่าง
              </Button>
              <Button
                type="submit"
                disabled={loading || fields.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                ส่งใบเบิก
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Drug Search Modal */}
      <DrugSearchModal
        open={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        onSelectDrug={handleAddDrug}
        selectedDrugIds={selectedDrugIds}
      />
    </div>
  );
}