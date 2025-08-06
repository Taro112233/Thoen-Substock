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
    categoryName: string;
    categoryCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DrugSummary {
  totalDrugs: number;
  activeDrugs: number;
  controlledDrugs: number;
  formularyDrugs: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function DrugManagementPage() {
  
  // State
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [summary, setSummary] = useState<DrugSummary | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [dosageFormFilter, setDosageFormFilter] = useState('');
  const [isControlledFilter, setIsControlledFilter] = useState('');
  const [isFormularyFilter, setIsFormularyFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('true');
  const [sortBy, setSortBy] = useState('genericName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // UI State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  // Dosage Form Options
  const dosageForms = [
    { value: 'TABLET', label: 'เม็ด' },
    { value: 'CAPSULE', label: 'แคปซูล' },
    { value: 'INJECTION', label: 'ฉีด' },
    { value: 'SYRUP', label: 'น้ำเชื่อม' },
    { value: 'CREAM', label: 'ครีม' },
    { value: 'OINTMENT', label: 'ขี้ผึ้ง' },
    { value: 'DROPS', label: 'หยด' },
    { value: 'SPRAY', label: 'สเปรย์' },
    { value: 'OTHER', label: 'อื่นๆ' },
  ];

  // Fetch drugs data
  const fetchDrugs = async (resetPage = false) => {
    try {
      setRefreshing(true);
      
      const params = new URLSearchParams({
        page: resetPage ? '1' : currentPage.toString(),
        limit: pageSize.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.set('search', searchTerm);
      if (getFilterValue(dosageFormFilter)) params.set('dosageForm', getFilterValue(dosageFormFilter));
      if (getFilterValue(isControlledFilter)) params.set('isControlled', getFilterValue(isControlledFilter));
      if (getFilterValue(isFormularyFilter)) params.set('isFormulary', getFilterValue(isFormularyFilter));
      if (getFilterValue(activeFilter)) params.set('active', getFilterValue(activeFilter));

      const response = await fetch(`/api/admin/drugs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch drugs');
      }

      const data = await response.json();
      
      setDrugs(data.drugs);
      setSummary(data.summary);
      setPagination(data.pagination);
      
      if (resetPage) {
        setCurrentPage(1);
      }

    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast.error('ไม่สามารถดึงข้อมูลยาได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDrugs();
  }, [currentPage, pageSize, sortBy, sortOrder]);

  // Update filter handling
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrugs(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, dosageFormFilter, isControlledFilter, isFormularyFilter, activeFilter]);

  // Helper function to convert filter values
  const getFilterValue = (value: string) => {
    return value === 'all' ? '' : value;
  };

  // Handle drug deletion
  const handleDeleteDrug = async (drug: Drug) => {
    if (!confirm(`คุณต้องการลบยา "${drug.fullName}" หรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/drugs/${drug.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete drug');
      }

      const data = await response.json();
      
      toast.success(data.message);

      fetchDrugs();

    } catch (error) {
      console.error('Error deleting drug:', error);
      toast.error('ไม่สามารถลบข้อมูลยาได้');
    }
  };

  // Get stock status badge
  const getStockStatusBadge = (drug: Drug) => {
    if (drug.isOutOfStock) {
      return <Badge variant="destructive">หมด</Badge>;
    } else if (drug.hasLowStock) {
      return <Badge variant="secondary">ต่ำ</Badge>;
    } else if (drug.totalStock > 0) {
      return <Badge variant="default">ปกติ</Badge>;
    } else {
      return <Badge variant="outline">ไม่มีข้อมูล</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการข้อมูลยา</h1>
          <p className="text-gray-600 mt-1">
            ระบบจัดการข้อมูลยาและเวชภัณฑ์ของโรงพยาบาล
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchDrugs()} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มยาใหม่
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยาทั้งหมด</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalDrugs.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยาที่ใช้งาน</CardTitle>
              <Pill className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.activeDrugs.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยาควบคุม</CardTitle>
              <ShieldCheck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.controlledDrugs.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยาในบัญชียา</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.formularyDrugs.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ค้นหาและกรองข้อมูล</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="ค้นหาด้วยชื่อยา, รหัส, ความแรง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={dosageFormFilter} onValueChange={setDosageFormFilter}>
              <SelectTrigger>
                <SelectValue placeholder="รูปแบบยา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {dosageForms.map(form => (
                  <SelectItem key={form.value} value={form.value}>
                    {form.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={isControlledFilter} onValueChange={setIsControlledFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ยาควบคุม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="true">ยาควบคุม</SelectItem>
                <SelectItem value="false">ยาทั่วไป</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={isFormularyFilter} onValueChange={setIsFormularyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="บัญชียา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="true">ในบัญชียา</SelectItem>
                <SelectItem value="false">นอกบัญชียา</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="true">ใช้งาน</SelectItem>
                <SelectItem value="false">ปิดใช้งาน</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drugs Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>รายการยาและเวชภัณฑ์</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {pagination && `${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} จาก ${pagination.total} รายการ`}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสยา</TableHead>
                  <TableHead>ชื่อยา</TableHead>
                  <TableHead>ความแรง</TableHead>
                  <TableHead>รูปแบบ</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>สต็อก</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drugs.map((drug) => (
                  <TableRow key={drug.id}>
                    <TableCell className="font-mono">
                      {drug.hospitalDrugCode}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{drug.genericName}</div>
                        {drug.brandName && (
                          <div className="text-sm text-gray-500">({drug.brandName})</div>
                        )}
                        <div className="flex space-x-1 mt-1">
                          {drug.isControlled && (
                            <Badge variant="secondary" className="text-xs">ควบคุม</Badge>
                          )}
                          {drug.isFormulary && (
                            <Badge variant="outline" className="text-xs">บัญชียา</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{drug.strengthDisplay}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {dosageForms.find(f => f.value === drug.dosageForm)?.label || drug.dosageForm}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* Category not available in current schema */}
                      -
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{drug.totalStock.toLocaleString()}</span>
                        {getStockStatusBadge(drug)}
                        {drug.stockLocations > 0 && (
                          <span className="text-xs text-gray-500">
                            ({drug.stockLocations} คลัง)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={drug.isActive ? "default" : "secondary"}>
                        {drug.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
                          onClick={() => {
                            // TODO: Navigate to edit page
                            console.log('Edit drug:', drug.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDrug(drug)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && drugs.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ไม่พบข้อมูลยาที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">แสดง</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">รายการต่อหน้า</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev || refreshing}
            >
              ก่อนหน้า
            </Button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(
                  pagination.totalPages - 4,
                  Math.max(1, currentPage - 2)
                )) + i;
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={refreshing}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext || refreshing}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      )}

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
                    <p>{selectedDrug.category?.categoryName || '-'}</p>
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
                    {selectedDrug.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  </Badge>
                </div>
              </TabsContent>
              
              <TabsContent value="stock" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">สต็อกรวม</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedDrug.totalStock.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">จำนวนคลัง</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedDrug.stockLocations}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">สถานะสต็อก</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStockStatusBadge(selectedDrug)}
                    </CardContent>
                  </Card>
                </div>
                
                {selectedDrug.hasLowStock && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">สต็อกต่ำ</span>
                    </div>
                    <p className="text-yellow-700 mt-1">
                      ยานี้มีสต็อกต่ำกว่าจุดสั่งซื้อในบางคลัง กรุณาตรวจสอบและสั่งซื้อเพิ่มเติม
                    </p>
                  </div>
                )}
                
                {selectedDrug.isOutOfStock && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">สต็อกหมด</span>
                    </div>
                    <p className="text-red-700 mt-1">
                      ยานี้หมดสต็อกในทุกคลัง กรุณาดำเนินการสั่งซื้อโดยด่วน
                    </p>
                  </div>
                )}
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

      {/* Create Drug Dialog - Placeholder */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มยาใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลยาใหม่ลงในระบบ
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500 text-center">
              ฟอร์มเพิ่มยาใหม่จะอยู่ที่นี่
              <br />
              จะพัฒนาต่อในขั้นตอนถัดไป
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}