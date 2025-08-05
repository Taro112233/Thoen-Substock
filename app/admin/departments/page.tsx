// app/admin/departments/page.tsx - Complete Version
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
  DialogFooter,
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
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Users,
  FileText,
  Phone,
  Mail,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DepartmentForm from './components/DepartmentForm';

// Types
interface Department {
  id: string;
  name: string;
  nameEn?: string;
  departmentCode: string;
  type: string;
  location?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  allowRequisition: boolean;
  requireApproval: boolean;
  maxRequisitionValue?: number;
  budgetLimit?: number;
  parentDepartment?: {
    id: string;
    name: string;
    departmentCode: string;
  };
  childDepartments?: Array<{
    id: string;
    name: string;
    departmentCode: string;
  }>;
  headOfDepartment?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  userCount: number;
  requisitionCount: number;
  budgetUtilization: number;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentStats {
  [key: string]: number;
}

interface ApiResponse {
  departments: Department[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: DepartmentStats;
}

// Department type translations
const departmentTypeTranslations = {
  PHARMACY: 'เภสัชกรรม',
  EMERGENCY: 'ฉุกเฉิน',
  ICU: 'หอผู้ป่วยวิกฤต',
  WARD: 'หอผู้ป่วยทั่วไป',
  OPD: 'ผู้ป่วยนอก',
  OR: 'ห้องผ่าตัด',
  LABORATORY: 'ห้องปฏิบัติการ',
  RADIOLOGY: 'รังสีวิทยา',
  ADMINISTRATION: 'บริหารงาน',
  FINANCE: 'การเงิน',
  HR: 'ทรัพยากรบุคคล',
  IT: 'เทคโนโลยีสารสนเทศ',
  OTHER: 'อื่นๆ'
};

// Department type colors
const departmentTypeColors = {
  PHARMACY: 'bg-blue-100 text-blue-800 border-blue-200',
  EMERGENCY: 'bg-red-100 text-red-800 border-red-200',
  ICU: 'bg-purple-100 text-purple-800 border-purple-200',
  WARD: 'bg-green-100 text-green-800 border-green-200',
  OPD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  OR: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  LABORATORY: 'bg-pink-100 text-pink-800 border-pink-200',
  RADIOLOGY: 'bg-orange-100 text-orange-800 border-orange-200',
  ADMINISTRATION: 'bg-gray-100 text-gray-800 border-gray-200',
  FINANCE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  HR: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  IT: 'bg-violet-100 text-violet-800 border-violet-200',
  OTHER: 'bg-slate-100 text-slate-800 border-slate-200'
};

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DepartmentStats>({});
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
  
  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Fetch departments data
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (activeFilter) params.set('active', activeFilter);
      
      const response = await fetch(`/api/admin/departments?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
      
      const data: ApiResponse = await response.json();
      setDepartments(data.departments);
      setStats(data.stats);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setLoading(false);
    }
  };

  // Delete department
  const handleDeleteDepartment = async (department: Department) => {
    if (deleteConfirmation !== department.name) {
      setError('กรุณาพิมพ์ชื่อแผนกให้ถูกต้องเพื่อยืนยันการลบ');
      return;
    }

    try {
      const response = await fetch(`/api/admin/departments/${department.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการลบแผนก');
      }
      
      setSuccess(`ลบแผนก "${department.name}" สำเร็จแล้ว`);
      setDeletingDepartment(null);
      setDeleteConfirmation('');
      fetchDepartments();
      
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบแผนก');
    }
  };

  // Handle form success
  const handleFormSuccess = (message: string) => {
    setSuccess(message);
    setCreateDialogOpen(false);
    setEditingDepartment(null);
    fetchDepartments();
  };

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setActiveFilter('');
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchDepartments();
  }, [pagination.page, search, typeFilter, activeFilter]);

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

  // Calculate total departments
  const totalDepartments = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              จัดการแผนกงาน
            </h1>
            <p className="text-gray-600 mt-1">
              จัดการข้อมูลแผนกและหน่วยงานต่างๆ ในโรงพยาบาล
            </p>
          </div>
          
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มแผนกใหม่
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
                  <p className="text-sm text-gray-600">แผนกทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalDepartments}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">เภสัชกรรม</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.PHARMACY || 0}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">💊</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">หอผู้ป่วย</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(stats.ICU || 0) + (stats.WARD || 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">🏥</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ฉุกเฉิน</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.EMERGENCY || 0}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">🚨</span>
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
                    placeholder="ค้นหาชื่อแผนก, รหัสแผนก..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="ประเภทแผนก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทุกประเภท</SelectItem>
                  {Object.entries(departmentTypeTranslations).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  <SelectItem value="true">ใช้งาน</SelectItem>
                  <SelectItem value="false">ไม่ใช้งาน</SelectItem>
                </SelectContent>
              </Select>

              {(search || typeFilter || activeFilter) && (
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

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle>รายการแผนกงาน</CardTitle>
            <CardDescription>
              แสดงรายการแผนกทั้งหมด {pagination.total} แผนง
              {search && ` (กรองด้วย "${search}")`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mr-3 text-blue-600" />
                <span className="text-gray-600">กำลังโหลดข้อมูล...</span>
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ไม่พบข้อมูลแผนก
                </h3>
                <p className="text-gray-500 mb-4">
                  {search || typeFilter || activeFilter
                    ? 'ไม่พบแผนกที่ตรงกับเงื่อนไขการค้นหา'
                    : 'ยังไม่มีแผนกในระบบ เริ่มต้นด้วยการเพิ่มแผนกแรก'
                  }
                </p>
                {!(search || typeFilter || activeFilter) && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มแผนกแรก
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อแผนก</TableHead>
                      <TableHead>รหัส</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>หัวหน้าแผนก</TableHead>
                      <TableHead className="text-center">พนักงาน</TableHead>
                      <TableHead className="text-center">สถานะ</TableHead>
                      <TableHead className="text-center">การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.map((department) => (
                      <TableRow key={department.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{department.name}</p>
                            {department.nameEn && (
                              <p className="text-sm text-gray-500">{department.nameEn}</p>
                            )}
                            {department.location && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {department.location}
                              </div>
                            )}
                            {department.parentDepartment && (
                              <div className="flex items-center text-xs text-blue-600 mt-1">
                                <Building2 className="w-3 h-3 mr-1" />
                                สังกัด: {department.parentDepartment.name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {department.departmentCode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={departmentTypeColors[department.type as keyof typeof departmentTypeColors]}
                          >
                            {departmentTypeTranslations[department.type as keyof typeof departmentTypeTranslations]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {department.headOfDepartment ? (
                            <div>
                              <p className="text-sm font-medium">
                                {department.headOfDepartment.firstName} {department.headOfDepartment.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {department.headOfDepartment.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">ยังไม่กำหนด</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center text-sm">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="font-medium">{department.userCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={department.isActive ? "default" : "secondary"}
                            className={department.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}
                          >
                            {department.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
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
                                onClick={() => router.push(`/admin/departments/${department.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                ดูรายละเอียด
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setEditingDepartment(department)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                แก้ไข
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeletingDepartment(department)}
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

      {/* Create Department Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>เพิ่มแผนกใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลแผนกใหม่ที่ต้องการเพิ่มเข้าระบบ
            </DialogDescription>
          </DialogHeader>
          <DepartmentForm
            onSuccess={handleFormSuccess}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลแผนก</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลแผนก "{editingDepartment?.name}"
            </DialogDescription>
          </DialogHeader>
          {editingDepartment && (
            <DepartmentForm
              department={editingDepartment}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingDepartment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingDepartment} onOpenChange={() => {
        setDeletingDepartment(null);
        setDeleteConfirmation('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              ยืนยันการลบแผนก
            </DialogTitle>
            <DialogDescription>
              การกระทำนี้ไม่สามารถยกเลิกได้ กรุณาพิจารณาอย่างรอบคอบ
            </DialogDescription>
          </DialogHeader>
          
          {deletingDepartment && (
            <div className="space-y-4">
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  การลบแผนก "{deletingDepartment.name}" จะส่งผลต่อข้อมูลที่เกี่ยวข้อง เช่น ผู้ใช้งานในแผนก, ใบเบิกยา, และข้อมูลสถิติต่างๆ
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-gray-900">ข้อมูลที่จะได้รับผลกระทบ:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">พนักงานในแผนก:</span>
                    <span className="font-medium">{deletingDepartment.userCount} คน</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ใบเบิกยา:</span>
                    <span className="font-medium">{deletingDepartment.requisitionCount} ใบ</span>
                  </div>
                  {deletingDepartment.childDepartments && deletingDepartment.childDepartments.length > 0 && (
                    <div className="flex items-center justify-between col-span-2">
                      <span className="text-gray-600">แผนกย่อย:</span>
                      <span className="font-medium">{deletingDepartment.childDepartments.length} แผนก</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-900 font-medium">
                  เพื่อยืนยันการลบ กรุณาพิมพ์ชื่อแผนก:
                </p>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded border">
                  {deletingDepartment.name}
                </p>
                <Input
                  placeholder={`พิมพ์ "${deletingDepartment.name}" เพื่อยืนยัน`}
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className={deleteConfirmation === deletingDepartment.name ? "border-green-500" : "border-red-300"}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeletingDepartment(null);
                setDeleteConfirmation('');
              }}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingDepartment && handleDeleteDepartment(deletingDepartment)}
              disabled={!deletingDepartment || deleteConfirmation !== deletingDepartment.name}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              ลบแผนกอย่างถาวร
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}