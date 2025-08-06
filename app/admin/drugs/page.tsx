// app/admin/drugs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  AlertTriangle,
  Package,
  Pill,
  ShieldCheck,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { DrugForm } from '@/components/admin/drugs/drug-form';

// Types
interface Drug {
  id: string;
  hospitalDrugCode: string;
  genericName: string;
  brandName?: string;
  strength: string;
  unitOfMeasure: string;
  dosageForm: string;
  therapeuticClass: string;
  isControlled: boolean;
  isFormulary: boolean;
  isActive: boolean;
  totalStock: number;
  stockLocations: number;
  hasLowStock: boolean;
  isOutOfStock: boolean;
  fullName: string;
  strengthDisplay: string;
  category?: {
    id: string;
    categoryName: string;
    categoryCode: string;
  };
}

interface DrugSummary {
  totalDrugs: number;
  activeDrugs: number;
  controlledDrugs: number;
  formularyDrugs: number;
}

interface DrugFilters {
  search: string;
  dosageForm: string;
  isControlled: string;
  isFormulary: string;
  active: string;
  sortBy: string;
  sortOrder: string;
}

// Constants
const dosageForms = [
  { value: 'TABLET', label: 'เม็ด' },
  { value: 'CAPSULE', label: 'แคปซูล' },
  { value: 'INJECTION', label: 'ยาฉีด' },
  { value: 'SYRUP', label: 'น้ำเชื่อม' },
  { value: 'CREAM', label: 'ครีม' },
  { value: 'OINTMENT', label: 'ขี้ผึ้ง' },
  { value: 'DROPS', label: 'หยด' },
  { value: 'SPRAY', label: 'สเปรย์' },
  { value: 'SUPPOSITORY', label: 'ยาเหน็บ' },
  { value: 'PATCH', label: 'แผ่นแปะ' },
  { value: 'POWDER', label: 'ผง' },
  { value: 'SOLUTION', label: 'น้ำยา' },
  { value: 'OTHER', label: 'อื่นๆ' },
];

export default function DrugsPage() {
  // State management
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [summary, setSummary] = useState<DrugSummary>({
    totalDrugs: 0,
    activeDrugs: 0,
    controlledDrugs: 0,
    formularyDrugs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Filters state
  const [filters, setFilters] = useState<DrugFilters>({
    search: '',
    dosageForm: '',
    isControlled: '',
    isFormulary: '',
    active: 'true',
    sortBy: 'genericName',
    sortOrder: 'asc',
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch drugs data
  const fetchDrugs = async () => {
    try {
      setLoading(true);
      console.log('🔍 [DRUGS PAGE] Fetching drugs with filters:', filters);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });

      const response = await fetch(`/api/admin/drugs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setDrugs(data.drugs);
        setSummary(data.summary);
        setTotalPages(data.pagination.totalPages);
        console.log('✅ [DRUGS PAGE] Data loaded:', {
          count: data.drugs.length,
          total: data.summary.totalDrugs,
        });
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (error) {
      console.error('❌ [DRUGS PAGE] Fetch error:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when filters/page change
  useEffect(() => {
    fetchDrugs();
  }, [filters, currentPage]);

  // Handle drug creation success
  const handleDrugCreated = (newDrug: Drug) => {
    console.log('✅ [DRUGS PAGE] Drug created:', newDrug);
    setShowCreateDialog(false);
    toast.success('เพิ่มยาใหม่สำเร็จ');
    
    // Refresh the drug list
    fetchDrugs();
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof DrugFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      search: '',
      dosageForm: '',
      isControlled: '',
      isFormulary: '',
      active: 'true',
      sortBy: 'genericName',
      sortOrder: 'asc',
    });
    setCurrentPage(1);
  };

  // Render stock status badge
  const renderStockStatus = (drug: Drug) => {
    if (drug.isOutOfStock) {
      return <Badge variant="destructive">หมด</Badge>;
    } else if (drug.hasLowStock) {
      return <Badge variant="secondary">ต่ำ</Badge>;
    } else {
      return <Badge variant="default">ปกติ</Badge>;
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จัดการข้อมูลยา</h1>
          <p className="text-muted-foreground">
            จัดการข้อมูลยาและการควบคุมสต็อกโรงพยาบาล
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchDrugs()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            รีเฟรช
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            ส่งออก
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มยาใหม่
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยาทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalDrugs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">รายการยาทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยาที่ใช้งาน</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.activeDrugs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ยาที่เปิดใช้งาน</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยาควบคุม</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.controlledDrugs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ยาประเภทควบคุม</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยาในบัญชี</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.formularyDrugs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">ยาในบัญชีโรงพยาบาล</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>ค้นหาและกรองข้อมูล</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาด้วยชื่อยา, รหัสยา, หรือหมวดหมู่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={clearFilters}>
              ล้างตัวกรอง
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              value={filters.dosageForm}
              onValueChange={(value) => handleFilterChange('dosageForm', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="ทุกรูปแบบ" />
              </SelectTrigger>
              <SelectContent>
                {dosageForms.map((form) => (
                  <SelectItem key={form.value} value={form.value}>
                    {form.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.isControlled}
              onValueChange={(value) => handleFilterChange('isControlled', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="ยาควบคุม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ทั้งหมด</SelectItem>
                <SelectItem value="true">ยาควบคุม</SelectItem>
                <SelectItem value="false">ยาทั่วไป</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isFormulary}
              onValueChange={(value) => handleFilterChange('isFormulary', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="ยาในบัญชี" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ทั้งหมด</SelectItem>
                <SelectItem value="true">ในบัญชี</SelectItem>
                <SelectItem value="false">นอกบัญชี</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.active}
              onValueChange={(value) => handleFilterChange('active', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ทั้งหมด</SelectItem>
                <SelectItem value="true">เปิดใช้งาน</SelectItem>
                <SelectItem value="false">ปิดใช้งาน</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="genericName-asc">ชื่อ A-Z</SelectItem>
                <SelectItem value="genericName-desc">ชื่อ Z-A</SelectItem>
                <SelectItem value="hospitalDrugCode-asc">รหัส A-Z</SelectItem>
                <SelectItem value="hospitalDrugCode-desc">รหัส Z-A</SelectItem>
                <SelectItem value="createdAt-desc">ใหม่ล่าสุด</SelectItem>
                <SelectItem value="createdAt-asc">เก่าสุด</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drug List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>รายการยา</CardTitle>
            <div className="text-sm text-muted-foreground">
              แสดง {drugs.length} จาก {summary.totalDrugs} รายการ
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : drugs.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">ไม่พบข้อมูลยา</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search || Object.values(filters).some(f => f !== '' && f !== 'true' && f !== 'genericName' && f !== 'asc')
                  ? 'ไม่พบยาที่ตรงกับเงื่อนไขการค้นหา'
                  : 'ยังไม่มีข้อมูลยาในระบบ'
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มยาแรก
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัส</TableHead>
                    <TableHead>ชื่อยา</TableHead>
                    <TableHead>ความแรง</TableHead>
                    <TableHead>รูปแบบ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>สต็อก</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drugs.map((drug) => (
                    <TableRow key={drug.id}>
                      <TableCell className="font-mono">{drug.hospitalDrugCode}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{drug.fullName}</div>
                          <div className="text-sm text-muted-foreground">{drug.therapeuticClass}</div>
                        </div>
                      </TableCell>
                      <TableCell>{drug.strengthDisplay}</TableCell>
                      <TableCell>
                        {dosageForms.find(f => f.value === drug.dosageForm)?.label}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {drug.isControlled && (
                            <Badge variant="secondary">ควบคุม</Badge>
                          )}
                          {drug.isFormulary && (
                            <Badge variant="outline">บัญชี</Badge>
                          )}
                          <Badge variant={drug.isActive ? "default" : "secondary"}>
                            {drug.isActive ? 'เปิด' : 'ปิด'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {renderStockStatus(drug)}
                          <span className="text-sm">{drug.totalStock}</span>
                          {drug.stockLocations > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({drug.stockLocations} จุด)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDrug(drug)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    หน้า {currentPage} จาก {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      ก่อนหน้า
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      ถัดไป
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drug Detail Dialog */}
      {selectedDrug && (
        <Dialog open={!!selectedDrug} onOpenChange={() => setSelectedDrug(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5" />
                <span>ข้อมูลยา: {selectedDrug.fullName}</span>
              </DialogTitle>
              <DialogDescription>
                รหัสยา: {selectedDrug.hospitalDrugCode}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
                <TabsTrigger value="stock">สต็อก</TabsTrigger>
                <TabsTrigger value="clinical">ข้อมูลทางคลินิก</TabsTrigger>
                <TabsTrigger value="history">ประวัติ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">รหัสยาโรงพยาบาล</label>
                    <p className="font-mono">{selectedDrug.hospitalDrugCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ชื่อสามัญ</label>
                    <p>{selectedDrug.genericName}</p>
                  </div>
                  {selectedDrug.brandName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ชื่อการค้า</label>
                      <p>{selectedDrug.brandName}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">ความแรง</label>
                    <p>{selectedDrug.strengthDisplay}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">รูปแบบยา</label>
                    <p>{dosageForms.find(f => f.value === selectedDrug.dosageForm)?.label}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">หมวดหมู่</label>
                    <p>{selectedDrug.category?.categoryName || selectedDrug.therapeuticClass}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {selectedDrug.isControlled && (
                    <Badge variant="secondary">ยาควบคุม</Badge>
                  )}
                  {selectedDrug.isFormulary && (
                    <Badge variant="outline">ในบัญชียา</Badge>
                  )}
                  <Badge variant={selectedDrug.isActive ? "default" : "secondary"}>
                    {selectedDrug.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </Badge>
                </div>
              </TabsContent>
              
              <TabsContent value="stock">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">สต็อกทั้งหมด</label>
                      <p className="text-2xl font-bold">{selectedDrug.totalStock}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">จุดเก็บ</label>
                      <p className="text-2xl font-bold">{selectedDrug.stockLocations}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">สถานะสต็อก</label>
                      <div className="mt-1">
                        {renderStockStatus(selectedDrug)}
                      </div>
                    </div>
                  </div>
                  {selectedDrug.stockLocations === 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-yellow-800">ยายังไม่มีสต็อกในระบบ</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="clinical">
                <div className="space-y-4">
                  <p className="text-gray-500">ข้อมูลทางคลินิกจะแสดงที่นี่เมื่อมีการเพิ่มข้อมูล</p>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="space-y-4">
                  <p className="text-gray-500">ประวัติการเคลื่อนไหวและการทำรายการจะแสดงที่นี่</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Drug Dialog - Now with Full Form */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>เพิ่มยาใหม่</span>
            </DialogTitle>
            <DialogDescription>
              กรอกข้อมูลยาใหม่ลงในระบบ กรุณากรอกข้อมูลให้ครบถ้วนในแต่ละแท็บ
            </DialogDescription>
          </DialogHeader>
          
          <DrugForm
            onSuccess={handleDrugCreated}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}