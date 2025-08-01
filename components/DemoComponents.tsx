// components/DemoComponents.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calculator, 
  Pill, 
  Heart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Eye,
  EyeOff,
  Loader2,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: number;
}

interface DoseCalculation {
  drugName: string;
  dose: string;
  volume: string;
  frequency: string;
  duration: string;
}

// Main Demo Stats Component (existing)
const DemoStats = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(85), 500);
    return () => clearTimeout(timer);
  }, []);

  const stats: StatItem[] = [
    {
      label: 'ยาในระบบ',
      value: '524',
      icon: Pill,
      color: 'text-blue-600',
      trend: 12
    },
    {
      label: 'การคำนวณวันนี้',
      value: '148',
      icon: Calculator,
      color: 'text-green-600',
      trend: 8
    },
    {
      label: 'ผู้ใช้งานออนไลน์',
      value: '32',
      icon: Users,
      color: 'text-purple-600',
      trend: -3
    },
    {
      label: 'ความแม่นยำ',
      value: '99.7%',
      icon: CheckCircle,
      color: 'text-emerald-600',
      trend: 0.2
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.trend !== undefined && (
                      <div className={`flex items-center text-sm mt-1 ${
                        stat.trend > 0 ? 'text-green-600' : 
                        stat.trend < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.trend > 0 ? '+' : ''}{stat.trend}%
                      </div>
                    )}
                  </div>
                  <IconComponent className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">ระบบพร้อมใช้งาน</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
};

// NEW EXPORTS - Missing Components

// 1. Stateful UI Pattern Demo
export const StatefulUIPatternDemo = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [data, setData] = useState<string>('');
  
  const handleAction = (newStatus: typeof status) => {
    setStatus('loading');
    setTimeout(() => {
      setStatus(newStatus);
      if (newStatus === 'success') {
        setData('ข้อมูลโหลดสำเร็จ - พบยา 156 รายการ');
      } else if (newStatus === 'error') {
        setData('เกิดข้อผิดพลาด - ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
      }
    }, 1000);
  };
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={() => handleAction('success')} 
            size="sm" 
            variant="default"
            disabled={status === 'loading'}
          >
            โหลดสำเร็จ
          </Button>
          <Button 
            onClick={() => handleAction('error')} 
            size="sm" 
            variant="destructive"
            disabled={status === 'loading'}
          >
            จำลองข้อผิดพลาด
          </Button>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={
              status === 'success' ? 'default' : 
              status === 'error' ? 'destructive' : 
              status === 'loading' ? 'secondary' : 'outline'
            }>
              {status === 'loading' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              Status: {status === 'idle' ? 'พร้อม' : status === 'loading' ? 'กำลังโหลด' : status === 'success' ? 'สำเร็จ' : 'ข้อผิดพลาด'}
            </Badge>
          </div>
          
          {status === 'loading' && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          
          {(status === 'success' || status === 'error') && (
            <p className="text-sm">{data}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// 2. Role-based UI Demo
export const RoleBasedUIDemo = () => {
  const [role, setRole] = useState<'doctor' | 'nurse' | 'pharmacist' | 'admin'>('doctor');
  
  const roleConfigs = {
    doctor: {
      title: 'แพทย์',
      description: 'จัดการข้อมูลผู้ป่วย, สั่งยา, ดูประวัติการรักษา',
      permissions: ['ดูข้อมูลผู้ป่วย', 'สั่งยา', 'ดูผลแลป', 'เขียนใบรับรอง'],
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    nurse: {
      title: 'พยาบาล',
      description: 'ดูแลผู้ป่วย, บันทึกอาการ, ให้ยาตามคำสั่งแพทย์',
      permissions: ['ดูข้อมูลผู้ป่วย', 'บันทึกอาการ', 'ให้ยา', 'วัดสัญญาณชีพ'],
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    pharmacist: {
      title: 'เภสัชกร',
      description: 'ตรวจสอบใบสั่งยา, คำนวณขนาดยา, ให้คำปรึกษา',
      permissions: ['ดูใบสั่งยา', 'คำนวณขนาดยา', 'ตรวจสอบอันตรกิริยา', 'ปรึกษายา'],
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    admin: {
      title: 'ผู้ดูแลระบบ',
      description: 'จัดการผู้ใช้, ตั้งค่าระบบ, ดูรายงาน',
      permissions: ['จัดการผู้ใช้', 'ตั้งค่าระบบ', 'ดูรายงาน', 'สำรองข้อมูล'],
      color: 'text-red-600 bg-red-50 border-red-200'
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(roleConfigs) as Array<keyof typeof roleConfigs>).map(r => (
            <Button 
              key={r} 
              onClick={() => setRole(r)} 
              variant={role === r ? 'default' : 'outline'} 
              size="sm"
            >
              {roleConfigs[r].title}
            </Button>
          ))}
        </div>
        
        <div className={`p-4 border rounded-lg ${roleConfigs[role].color}`}>
          <h4 className="font-semibold mb-2">{roleConfigs[role].title} Dashboard</h4>
          <p className="text-sm mb-3">{roleConfigs[role].description}</p>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">สิทธิ์การเข้าถึง:</p>
            <ul className="text-sm space-y-1">
              {roleConfigs[role].permissions.map((permission, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  {permission}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 3. Form Validation Demo
export const FormValidationDemo = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    weight: '',
    allergies: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'กรุณาระบุชื่อผู้ป่วย';
    }
    
    if (!formData.age || parseInt(formData.age) < 0 || parseInt(formData.age) > 120) {
      newErrors.age = 'กรุณาระบุอายุที่ถูกต้อง (0-120 ปี)';
    }
    
    if (!formData.weight || parseFloat(formData.weight) < 1 || parseFloat(formData.weight) > 200) {
      newErrors.weight = 'กรุณาระบุน้ำหนักที่ถูกต้อง (1-200 kg)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    // จำลองการส่งข้อมูล
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    // แสดงผลสำเร็จ
    alert('บันทึกข้อมูลสำเร็จ!');
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">ชื่อผู้ป่วย *</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
              error={!!errors.patientName}
              placeholder="ระบุชื่อผู้ป่วย"
            />
            {errors.patientName && (
              <p className="text-sm text-red-600">{errors.patientName}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">อายุ (ปี) *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                error={!!errors.age}
                placeholder="0"
                min="0"
                max="120"
              />
              {errors.age && (
                <p className="text-sm text-red-600">{errors.age}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">น้ำหนัก (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                error={!!errors.weight}
                placeholder="0.0"
                min="1"
                max="200"
              />
              {errors.weight && (
                <p className="text-sm text-red-600">{errors.weight}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">ประวัติแพ้ยา</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
              placeholder="ระบุยาที่แพ้ (ถ้ามี)"
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// 4. Accessibility Demo
export const AccessibilityDemo = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [screenReader, setScreenReader] = useState(false);
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <h4 className="font-semibold">การเข้าถึงสำหรับผู้พิการ</h4>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="rounded"
              />
              <span>โหมดความคมชัดสูง</span>
            </Label>
            
            <div className="space-y-2">
              <Label>ขนาดตัวอักษร</Label>
              <div className="flex gap-2">
                {['small', 'normal', 'large'].map(size => (
                  <Button
                    key={size}
                    variant={fontSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFontSize(size)}
                  >
                    {size === 'small' ? 'เล็ก' : size === 'normal' ? 'ปกติ' : 'ใหญ่'}
                  </Button>
                ))}
              </div>
            </div>
            
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={screenReader}
                onChange={(e) => setScreenReader(e.target.checked)}
                className="rounded"
              />
              <span>เปิดใช้งาน Screen Reader</span>
            </Label>
          </div>
        </div>
        
        <div 
          className={`p-4 border rounded-lg transition-all ${
            highContrast ? 'bg-black text-white border-white' : 'bg-gray-50'
          } ${
            fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'
          }`}
        >
          <h5 className="font-semibold mb-2">ตัวอย่างเนื้อหา</h5>
          <p>
            ระบบนี้รองรับการเข้าถึงสำหรับผู้ใช้ทุกกลุ่ม รวมถึงผู้พิการทางสายตา 
            และผู้ที่มีความต้องการพิเศษอื่นๆ
          </p>
          
          {screenReader && (
            <Alert className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Screen Reader Mode เปิดใช้งาน - ข้อความจะถูกอ่านออกเสียง
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// 5. Data Fetching Demo
export const DataFetchingDemo = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [dataSource, setDataSource] = useState<'online' | 'cache' | 'offline'>('online');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  
  const fetchData = async (source: typeof dataSource) => {
    setIsLoading(true);
    setError('');
    
    try {
      // จำลองการเรียกข้อมูล
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (source === 'online' && !isOnline) {
        throw new Error('ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้');
      }
      
      const mockData = {
        online: [
          { id: 1, name: 'Paracetamol', stock: 150, updated: 'Live' },
          { id: 2, name: 'Amoxicillin', stock: 89, updated: 'Live' },
          { id: 3, name: 'Ibuprofen', stock: 67, updated: 'Live' }
        ],
        cache: [
          { id: 1, name: 'Paracetamol', stock: 145, updated: '5 นาทีที่แล้ว' },
          { id: 2, name: 'Amoxicillin', stock: 92, updated: '5 นาทีที่แล้ว' },
          { id: 3, name: 'Ibuprofen', stock: 70, updated: '5 นาทีที่แล้ว' }
        ],
        offline: [
          { id: 1, name: 'Paracetamol', stock: 140, updated: 'Offline' },
          { id: 2, name: 'Amoxicillin', stock: 95, updated: 'Offline' },
          { id: 3, name: 'Ibuprofen', stock: 75, updated: 'Offline' }
        ]
      };
      
      setData(mockData[source]);
      setDataSource(source);
    } catch (err: any) {
      setError(err.message);
      // Fallback to cache/offline
      if (source === 'online') {
        await fetchData('cache');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData('online');
  }, []);
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">การจัดการข้อมูล</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOnline(!isOnline)}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isOnline ? 'Online' : 'Offline'}
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={dataSource === 'online' ? 'default' : 'outline'}
            size="sm"
            onClick={() => fetchData('online')}
            disabled={isLoading}
          >
            <Database className="w-4 h-4 mr-1" />
            Live Data
          </Button>
          <Button
            variant={dataSource === 'cache' ? 'default' : 'outline'}
            size="sm"
            onClick={() => fetchData('cache')}
            disabled={isLoading}
          >
            <Clock className="w-4 h-4 mr-1" />
            Cache
          </Button>
          <Button
            variant={dataSource === 'offline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => fetchData('offline')}
            disabled={isLoading}
          >
            <WifiOff className="w-4 h-4 mr-1" />
            Offline
          </Button>
        </div>
        
        {error && (
          <Alert variant="error">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="border rounded-lg">
          {isLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="divide-y">
              {data.map(item => (
                <div key={item.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">คงเหลือ: {item.stock} หน่วย</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.updated}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          แหล่งข้อมูล: {dataSource === 'online' ? 'Live Database' : dataSource === 'cache' ? 'Local Cache' : 'Offline Storage'}
        </div>
      </CardContent>
    </Card>
  );
};

// Export existing components
export { DemoStats };