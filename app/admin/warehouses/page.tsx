// app/admin/warehouses/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Warehouse, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Package,
  Thermometer,
  Shield,
  User,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Snowflake,
  Lock
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import WarehouseForm from './components/WarehouseForm';

// Types
interface WarehouseData {
  id: string;
  name: string;
  warehouseCode: string;
  type: string;
  location: string;
  address?: string;
  isActive: boolean;
  hasTemperatureControl: boolean;
  hasHumidityControl: boolean;
  securityLevel: string;
  accessControl: boolean;
  cctv: boolean;
  alarm: boolean;
  temperatureRange?: string;
  humidityRange?: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  stockItemCount: number;
  transactionCount: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseStats {
  byType: Record<string, number>;
  totalValue: number;
  totalWarehouses: number;
}

interface ApiResponse {
  warehouses: WarehouseData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: WarehouseStats;
}

// Warehouse type translations
const warehouseTypeTranslations = {
  CENTRAL: 'คลังกลาง',
  DEPARTMENT: 'คลังแผนก',
  EMERGENCY: 'คลังฉุกเฉิน',
  CONTROLLED: 'คลังยาควบคุม',
  COLD_STORAGE: 'ห้องเย็น',
  QUARANTINE: 'ห้องกักกัน',
  DISPOSAL: 'ห้องทำลาย',
  RECEIVING: 'ห้องรับของ',
  DISPENSING: 'ห้องจ่ายยา'
};

// Warehouse type colors
const warehouseTypeColors = {
  CENTRAL: 'bg-blue-100 text-blue-800 border-blue-200',
  DEPARTMENT: 'bg-green-100 text-green-800 border-green-200',
  EMERGENCY: 'bg-red-100 text-red-800 border-red-200',
  CONTROLLED: 'bg-orange-100 text-orange-800 border-orange-200',
  COLD_STORAGE: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  QUARANTINE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DISPOSAL: 'bg-gray-100 text-gray-800 border-gray-200',
  RECEIVING: 'bg-purple-100 text-purple-800 border-purple-200',
  DISPENSING: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

// Security level translations
const securityLevelTranslations = {
  BASIC: 'พื้นฐาน',
  STANDARD: 'มาตรฐาน',
  HIGH: 'สูง',
  MAXIMUM: 'สูงสุด'
};

export default function WarehousesPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [stats, setStats] = useState<WarehouseStats>({
    byType: {},
    totalValue: 0,
    totalWarehouses: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  
  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseData | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState<WarehouseData | null>(null);

  // Fetch warehouses data
  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (search) params.set('search', search);
      if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
      if (activeFilter && activeFilter !== 'all') params.set('active', activeFilter);
      if (managerFilter && managerFilter !== 'all') params.set('hasManager', managerFilter);
      
      const response = await fetch(`/api/admin/warehouses?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
      
      const data: ApiResponse = await response.json();
      setWarehouses(data.warehouses);
      setStats(data.stats);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  };

  // Delete warehouse
  const handleDeleteWarehouse = async (warehouse: WarehouseData) => {
    try {
      const response = await fetch(`/api/admin/warehouses/${warehouse.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการลบคลัง');
      }
      
      setSuccess(`ลบคลัง "${warehouse.name}" สำเร็จแล้ว`);
      setDeletingWarehouse(null);
      fetchWarehouses();
      
    } catch (err) {
      console.error('Error deleting warehouse:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบคลัง');
    }
  };

  // Handle form success
  const handleFormSuccess = (message: string) => {
    setSuccess(message);
    setCreateDialogOpen(false);
    setEditingWarehouse(null);
    fetchWarehouses();
  };

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setActiveFilter('all');
    setManagerFilter('all');
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchWarehouses();
  }, [pagination.page, search, typeFilter, activeFilter, managerFilter]);

  // Auto-clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Warehouse className="w-6 h-6 text-blue-600" />
              จัดการคลังเก็บยา
            </h1>
            <p className="text-gray-600 mt-1">
              จัดการข้อมูลคลังและสถานที่เก็บยาต่างๆ ในโรงพยาบาล
            </p>
          </div>
          
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มคลังใหม่
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">คลังทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalWarehouses}
                  </p>
                </div>
                <Warehouse className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">คลังกลาง</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.byType.CENTRAL || 0}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ห้องเย็น</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {stats.byType.COLD_STORAGE || 0}
                  </p>
                </div>
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Snowflake className="w-4 h-4 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">มูลค่ารวม</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">₿</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="ค้นหาชื่อคลัง, รหัสคลัง, ตำแหน่ง..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="ประเภทคลัง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกประเภท</SelectItem>
                  {Object.entries(warehouseTypeTranslations).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={managerFilter} onValueChange={setManagerFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <User className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="ผู้จัดการ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="true">มีผู้จัดการ</SelectItem>
                  <SelectItem value="false">ไม่มีผู้จัดการ</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="true">ใช้งาน</SelectItem>
                  <SelectItem value="false">ไม่ใช้งาน</SelectItem>
                </SelectContent>
              </Select>

              {(search || (typeFilter && typeFilter !== 'all') || (activeFilter && activeFilter !== 'all') || (managerFilter && managerFilter !== 'all')) && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="whitespace-nowrap"
                >
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warehouses Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการคลังเก็บยา</CardTitle>
            <CardDescription>
              แสดงรายการคลังทั้งหมด {pagination.total} คลัง
              {search && ` (กรองด้วย "${search}")`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-600" />
                <span className="text-gray-600">กำลังโหลดข้อมูล...</span>
              </div>
            ) : warehouses.length === 0 ? (
              <div className="text-center py-12">
                <Warehouse className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่พบข้อมูลคลัง
                </h3>
                <p className="text-gray-500 mb-4">
                  {search || (typeFilter && typeFilter !== 'all') || (activeFilter && activeFilter !== 'all') || (managerFilter && managerFilter !== 'all')
                    ? 'ไม่พบคลังที่ตรงกับเงื่อนไขการค้นหา'
                    : 'ยังไม่มีคลังในระบบ เริ่มต้นด้วยการเพิ่มคลังแรก'
                  }
                </p>
                {!(search || (typeFilter && typeFilter !== 'all') || (activeFilter && activeFilter !== 'all') || (managerFilter && managerFilter !== 'all')) && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มคลังแรก
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อคลัง</TableHead>
                      <TableHead>รหัส</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>การควบคุม</TableHead>
                      <TableHead>ผู้จัดการ</TableHead>
                      <TableHead className="text-center">สินค้า</TableHead>
                      <TableHead className="text-center">สถานะ</TableHead>
                      <TableHead className="text-center">การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{warehouse.name}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {warehouse.location}
                            </div>
                            {warehouse.address && (
                              <p className="text-xs text-gray-500 mt-1">{warehouse.address}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {warehouse.warehouseCode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={warehouseTypeColors[warehouse.type as keyof typeof warehouseTypeColors]}
                          >
                            {warehouseTypeTranslations[warehouse.type as keyof typeof warehouseTypeTranslations]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {warehouse.hasTemperatureControl && (
                              <Badge variant="outline" className="text-xs">
                                <Thermometer className="w-3 h-3 mr-1" />
                                {warehouse.temperatureRange}
                              </Badge>
                            )}
                            {warehouse.accessControl && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                ควบคุม
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              {securityLevelTranslations[warehouse.securityLevel as keyof typeof securityLevelTranslations]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {warehouse.manager ? (
                            <div>
                              <p className="text-sm font-medium">
                                {warehouse.manager.firstName} {warehouse.manager.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {warehouse.manager.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">ยังไม่กำหนด</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center text-sm">
                            <Package className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="font-medium">{warehouse.stockItemCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={warehouse.isActive ? "default" : "secondary"}
                            className={warehouse.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}
                          >
                            {warehouse.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => router.push(`/admin/warehouses/${warehouse.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                ดูรายละเอียด
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setEditingWarehouse(warehouse)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                แก้ไข
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingWarehouse(warehouse)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                ลบ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              แสดง {((pagination.page - 1) * pagination.limit) + 1} ถึง {Math.min(pagination.page * pagination.limit, pagination.total)} จาก {pagination.total} รายการ
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                ก่อนหน้า
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={pagination.page === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Create Warehouse Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>เพิ่มคลังใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลคลังใหม่ที่ต้องการเพิ่มเข้าระบบ
            </DialogDescription>
          </DialogHeader>
          <WarehouseForm
            onSuccess={handleFormSuccess}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Warehouse Dialog */}
      <Dialog open={!!editingWarehouse} onOpenChange={() => setEditingWarehouse(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลคลัง</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลคลัง "{editingWarehouse?.name}"
            </DialogDescription>
          </DialogHeader>
          {editingWarehouse && (
            <WarehouseForm
              warehouse={editingWarehouse}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingWarehouse(null)}
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}