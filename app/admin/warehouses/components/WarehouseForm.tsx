// app/admin/warehouses/components/WarehouseForm.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Package, Save, X } from 'lucide-react';

interface Warehouse {
  id?: string;
  code: string;
  name: string;
  type: 'main' | 'department' | 'emergency' | 'critical' | 'special';
  status: 'active' | 'inactive';
  hospitalId: string;
  description?: string;
  capacity?: number;
  location?: string;
  temperature?: string;
  humidity?: string;
  manager?: string;
}

interface WarehouseFormProps {
  warehouse?: Warehouse;
  onSave: (warehouse: Warehouse) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const warehouseTypes = [
  { value: 'main', label: 'คลังหลัก', description: 'คลังเภสัชกรรมหลัก' },
  { value: 'department', label: 'แผนกทั่วไป', description: 'คลังประจำแผนก' },
  { value: 'emergency', label: 'หน่วยฉุกเฉิน', description: 'คลังสำหรับฉุกเฉิน' },
  { value: 'critical', label: 'หน่วยวิกฤต', description: 'คลัง ICU, CCU' },
  { value: 'special', label: 'หน่วยพิเศษ', description: 'ห้องผ่าตัด, ห้องเย็น' }
];

export default function WarehouseForm({ 
  warehouse, 
  onSave, 
  onCancel, 
  isLoading = false 
}: WarehouseFormProps) {
  
  const [formData, setFormData] = useState<Warehouse>({
    code: warehouse?.code || '',
    name: warehouse?.name || '',
    type: warehouse?.type || 'department',
    status: warehouse?.status || 'active',
    hospitalId: warehouse?.hospitalId || 'hosp-1',
    description: warehouse?.description || '',
    capacity: warehouse?.capacity || undefined,
    location: warehouse?.location || '',
    temperature: warehouse?.temperature || '',
    humidity: warehouse?.humidity || '',
    manager: warehouse?.manager || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Warehouse, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>
              {warehouse ? 'แก้ไขข้อมูลหน่วยงาน' : 'เพิ่มหน่วยงานใหม่'}
            </CardTitle>
            <CardDescription>
              กรอกข้อมูลหน่วยงาน/คลังยาให้ครบถ้วน
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">รหัสหน่วยงาน *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="เช่น OPD, IPD, ER"
                required
                maxLength={10}
              />
              <p className="text-xs text-gray-500">รหัสย่อสำหรับระบุหน่วยงาน</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อหน่วยงาน *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="ชื่อเต็มของหน่วยงาน"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">ประเภทหน่วยงาน *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent>
                  {warehouseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="รายละเอียดเพิ่มเติมของหน่วยงาน"
              rows={3}
            />
          </div>

          {/* Capacity & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">ความจุ (รายการ)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                placeholder="จำนวนรายการยาที่เก็บได้"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">ที่ตั้ง</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="ชั้น/อาคาร/ห้อง"
              />
            </div>
          </div>

          {/* Storage Conditions */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">เงื่อนไขการเก็บรักษา</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">อุณหภูมิ</Label>
                <Input
                  id="temperature"
                  value={formData.temperature}
                  onChange={(e) => handleChange('temperature', e.target.value)}
                  placeholder="เช่น 15-30°C, 2-8°C"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="humidity">ความชื้น</Label>
                <Input
                  id="humidity"
                  value={formData.humidity}
                  onChange={(e) => handleChange('humidity', e.target.value)}
                  placeholder="เช่น < 60%, < 40%"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager">ผู้ดูแล</Label>
            <Input
              id="manager"
              value={formData.manager}
              onChange={(e) => handleChange('manager', e.target.value)}
              placeholder="ชื่อผู้ดูแลหน่วยงาน"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}