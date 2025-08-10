// app/admin/personnel-types/page.tsx
// Personnel Types Management Interface - Complete Implementation
// หน้าจัดการประเภทบุคลากรที่สมบูรณ์แบบ

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter,
  Users,
  Download,
  Upload,
  BarChart3,
  RefreshCw,
  Crown,
  Building2,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

import type { PersonnelType, PersonnelTypeFormData, PaginationInfo } from './types/personnel-type';
import { PersonnelTypeHeader } from './components/PersonnelTypeHeader';
import { PersonnelTypeSearchFilter } from './components/PersonnelTypeSearchFilter';
import { PersonnelTypeList } from './components/PersonnelTypeList';
import { PersonnelTypePagination } from './components/PersonnelTypePagination';
import { PersonnelTypeCreateDialog } from './components/PersonnelTypeCreateDialog';
import { PersonnelTypeEditDialog } from './components/PersonnelTypeEditDialog';
import { PersonnelTypeViewDialog } from './components/PersonnelTypeViewDialog';
import { PersonnelTypeDeleteDialog } from './components/PersonnelTypeDeleteDialog';
import { PersonnelTypeBulkDialog } from './components/PersonnelTypeBulkDialog';
import { PersonnelTypeImportDialog } from './components/PersonnelTypeImportDialog';
import { PersonnelTypeStatsDialog } from './components/PersonnelTypeStatsDialog';

export default function PersonnelTypesManagementPage() {
  // ================================
  // STATE MANAGEMENT
  // ================================
  
  const [personnelTypes, setPersonnelTypes] = useState<PersonnelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [hierarchyFilter, setHierarchyFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('typeName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  
  // Selected Item for Operations
  const [selectedPersonnelType, setSelectedPersonnelType] = useState<PersonnelType | null>(null);
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'activate' | 'deactivate' | 'export'>('delete');

  // ================================
  // DATA FETCHING
  // ================================
  
  const fetchPersonnelTypes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(hierarchyFilter && { hierarchy: hierarchyFilter }),
        ...(statusFilter !== '' && { isActive: statusFilter })
      });

      const response = await fetch(`/api/admin/personnel-types?${params}`);
      const data = await response.json();

      if (data.success) {
        setPersonnelTypes(data.data);
        setTotalCount(data.pagination.totalCount);
        setStatistics(data.statistics);
      } else {
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } catch (error) {
      console.error('Error fetching personnel types:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchPersonnelTypes();
  }, [currentPage, itemsPerPage, searchTerm, hierarchyFilter, statusFilter, sortBy, sortOrder]);

  // ================================
  // EVENT HANDLERS
  // ================================
  
  const handleRefresh = () => {
    setSelectedItems([]);
    fetchPersonnelTypes();
    toast.success('รีเฟรชข้อมูลเรียบร้อยแล้ว');
  };

  const handleCreate = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    fetchPersonnelTypes();
    toast.success('สร้างประเภทบุคลากรเรียบร้อยแล้ว');
  };

  const handleEdit = (personnelType: PersonnelType) => {
    setSelectedPersonnelType(personnelType);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedPersonnelType(null);
    fetchPersonnelTypes();
    toast.success('แก้ไขข้อมูลเรียบร้อยแล้ว');
  };

  const handleView = (personnelType: PersonnelType) => {
    setSelectedPersonnelType(personnelType);
    setViewDialogOpen(true);
  };

  const handleDelete = (personnelType: PersonnelType) => {
    setSelectedPersonnelType(personnelType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedPersonnelType(null);
    fetchPersonnelTypes();
    toast.success('ลบข้อมูลเรียบร้อยแล้ว');
  };

  const handleBulkOperation = (operation: 'delete' | 'activate' | 'deactivate' | 'export') => {
    if (selectedItems.length === 0) {
      toast.error('กรุณาเลือกรายการที่ต้องการดำเนินการ');
      return;
    }
    setBulkOperation(operation);
    setBulkDialogOpen(true);
  };

  const handleBulkSuccess = () => {
    setBulkDialogOpen(false);
    setSelectedItems([]);
    fetchPersonnelTypes();
    toast.success('ดำเนินการเรียบร้อยแล้ว');
  };

  const handleImport = () => {
    setImportDialogOpen(true);
  };

  const handleImportSuccess = () => {
    setImportDialogOpen(false);
    fetchPersonnelTypes();
    toast.success('นำเข้าข้อมูลเรียบร้อยแล้ว');
  };

  const handleShowStats = () => {
    setStatsDialogOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(personnelTypes.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  // ================================
  // COMPUTED VALUES
  // ================================
  
  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages: Math.ceil(totalCount / itemsPerPage),
    totalCount,
    itemsPerPage,
    hasNextPage: currentPage < Math.ceil(totalCount / itemsPerPage),
    hasPrevPage: currentPage > 1
  };

  const hasSelection = selectedItems.length > 0;

  // ================================
  // RENDER
  // ================================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PersonnelTypeHeader
        totalCount={totalCount}
        selectedCount={selectedItems.length}
        statistics={statistics}
        onRefresh={handleRefresh}
        onCreate={handleCreate}
        onImport={handleImport}
        onShowStats={handleShowStats}
        onBulkDelete={() => handleBulkOperation('delete')}
        onBulkActivate={() => handleBulkOperation('activate')}
        onBulkDeactivate={() => handleBulkOperation('deactivate')}
        onBulkExport={() => handleBulkOperation('export')}
        hasSelection={hasSelection}
      />

      {/* Hierarchy Visualization */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 text-lg flex items-center">
            <Crown className="h-5 w-5 mr-2 text-purple-600" />
            ลำดับชั้นการบังคับบัญชา (Hierarchy)
          </h4>
          <div className="flex items-center justify-center space-x-4 overflow-x-auto py-4">
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="p-3 bg-purple-600 text-white rounded-full mb-2">
                <Crown className="h-6 w-6" />
              </div>
              <Badge className="bg-purple-600 text-white mb-1">DEVELOPER</Badge>
              <p className="text-xs text-gray-600">สิทธิ์สูงสุด</p>
              <p className="text-xs text-purple-600 font-semibold">
                {statistics?.byHierarchy?.DEVELOPER || 0} คน
              </p>
            </div>
            
            <ChevronRight className="h-6 w-6 text-gray-400" />
            
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="p-3 bg-blue-600 text-white rounded-full mb-2">
                <Building2 className="h-6 w-6" />
              </div>
              <Badge className="bg-blue-600 text-white mb-1">DIRECTOR</Badge>
              <p className="text-xs text-gray-600">ผู้อำนวยการ</p>
              <p className="text-xs text-blue-600 font-semibold">
                {statistics?.byHierarchy?.DIRECTOR || 0} คน
              </p>
            </div>
            
            <ChevronRight className="h-6 w-6 text-gray-400" />
            
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="p-3 bg-green-600 text-white rounded-full mb-2">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-green-600 text-white mb-1">GROUP_HEAD</Badge>
              <p className="text-xs text-gray-600">หัวหน้ากลุ่มงาน</p>
              <p className="text-xs text-green-600 font-semibold">
                {statistics?.byHierarchy?.GROUP_HEAD || 0} คน
              </p>
            </div>
            
            <ChevronRight className="h-6 w-6 text-gray-400" />
            
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="p-3 bg-gray-600 text-white rounded-full mb-2">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-gray-600 text-white mb-1">STAFF</Badge>
              <p className="text-xs text-gray-600">พนักงาน</p>
              <p className="text-xs text-gray-600 font-semibold">
                {statistics?.byHierarchy?.STAFF || 0} คน
              </p>
            </div>
            
            <ChevronRight className="h-6 w-6 text-gray-400" />
            
            <div className="flex flex-col items-center min-w-[120px]">
              <div className="p-3 bg-yellow-600 text-white rounded-full mb-2">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-yellow-600 text-white mb-1">STUDENT</Badge>
              <p className="text-xs text-gray-600">นักศึกษา</p>
              <p className="text-xs text-yellow-600 font-semibold">
                {statistics?.byHierarchy?.STUDENT || 0} คน
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <PersonnelTypeSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        hierarchyFilter={hierarchyFilter}
        onHierarchyFilterChange={setHierarchyFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onClearFilters={() => {
          setSearchTerm('');
          setHierarchyFilter('');
          setStatusFilter('');
          setCurrentPage(1);
        }}
      />

      {/* Personnel Type List */}
      <PersonnelTypeList
        personnelTypes={personnelTypes}
        loading={loading}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <PersonnelTypePagination
        pagination={paginationInfo}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(newLimit) => {
          setItemsPerPage(newLimit);
          setCurrentPage(1);
        }}
      />

      {/* Dialogs */}
      <PersonnelTypeCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <PersonnelTypeEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        personnelType={selectedPersonnelType}
        onSuccess={handleEditSuccess}
      />

      <PersonnelTypeViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        personnelType={selectedPersonnelType}
        onEdit={() => {
          setViewDialogOpen(false);
          if (selectedPersonnelType) {
            handleEdit(selectedPersonnelType);
          }
        }}
        onDelete={() => {
          setViewDialogOpen(false);
          if (selectedPersonnelType) {
            handleDelete(selectedPersonnelType);
          }
        }}
      />

      <PersonnelTypeDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        personnelType={selectedPersonnelType}
        onSuccess={handleDeleteSuccess}
      />

      <PersonnelTypeBulkDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        operation={bulkOperation}
        selectedIds={selectedItems}
        onSuccess={handleBulkSuccess}
      />

      <PersonnelTypeImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={handleImportSuccess}
      />

      <PersonnelTypeStatsDialog
        open={statsDialogOpen}
        onOpenChange={setStatsDialogOpen}
      />
    </div>
  );
}