// app/admin/hospitals/page.tsx - Modular Section Architecture
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

// Import shared types
import { Hospital, PaginationInfo, ApiResponse } from './types/hospital';

// Import modular sections
import { HospitalPageHeader } from './components/HospitalPageHeader';
import { HospitalSearchFilter } from './components/HospitalSearchFilter';
import { HospitalListSection } from './components/HospitalListSection';
import { HospitalPagination } from './components/HospitalPagination';

// Import dialogs (we'll create these as separate components too)
import { HospitalCreateDialog } from './components/HospitalCreateDialog';
import { HospitalEditDialog } from './components/HospitalEditDialog';
import { HospitalViewDialog } from './components/HospitalViewDialog';
import { HospitalDeleteDialog } from './components/HospitalDeleteDialog';

// ===================================
// MAIN COMPONENT
// ===================================

export default function HospitalManagementPage() {
  // ===================================
  // STATE MANAGEMENT
  // ===================================

  // Data states
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // ===================================
  // API FUNCTIONS
  // ===================================

  const fetchHospitals = async (page = 1, limit = pagination.limit) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'ALL' && { status: statusFilter }),
        ...(typeFilter && typeFilter !== 'ALL' && { type: typeFilter }),
      });

      const response = await fetch(`/api/admin/hospitals?${params}`);
      const result: ApiResponse<Hospital[]> = await response.json();

      if (result.success && result.data) {
        setHospitals(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        toast.error('ไม่สามารถดึงข้อมูลโรงพยาบาลได้', {
          description: result.error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        });
        setHospitals([]);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ', {
        description: 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      });
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  // Force refresh function
  const forceRefresh = async () => {
    console.log('Force refreshing data...');
    const refreshToast = toast.loading('กำลังรีเฟรชข้อมูล...', {
      description: 'อัปเดตข้อมูลล่าสุด',
    });
    
    try {
      await fetchHospitals(pagination.page);
      toast.dismiss(refreshToast);
      toast.success('รีเฟรชข้อมูลสำเร็จ', {
        description: `พบข้อมูลโรงพยาบาล ${pagination.totalCount} แห่ง`,
        duration: 2000,
      });
    } catch (error) {
      toast.dismiss(refreshToast);
      toast.error('ไม่สามารถรีเฟรชข้อมูลได้', {
        description: 'กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  // ===================================
  // EVENT HANDLERS
  // ===================================

  const handleCreateSuccess = async () => {
    console.log('Create success, refreshing...');
    await forceRefresh(); // Force refresh data
  };

  const handleUpdateSuccess = async () => {
    console.log('Update success, refreshing...');
    await forceRefresh(); // Force refresh data
  };

  const handleDeleteSuccess = async () => {
    console.log('Delete success, refreshing...');
    await forceRefresh(); // Force refresh data
  };

  const handleView = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowViewDialog(true);
    toast.info('เปิดข้อมูลโรงพยาบาล', {
      description: `แสดงรายละเอียดของ ${hospital.name}`,
      duration: 2000,
    });
  };

  const handleEdit = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowEditDialog(true);
    toast.info('เปิดฟอร์มแก้ไข', {
      description: `แก้ไขข้อมูล ${hospital.name}`,
      duration: 2000,
    });
  };

  const handleDelete = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowDeleteDialog(true);
    toast.warning('ยืนยันการลบ', {
      description: `กำลังลบ ${hospital.name}`,
      duration: 2000,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    toast.info('ล้างฟิลเตอร์แล้ว', {
      description: 'กำลังโหลดข้อมูลทั้งหมด',
    });
  };

  const handlePageChange = (page: number) => {
    fetchHospitals(page, pagination.limit);
  };

  const handleLimitChange = (limit: number) => {
    fetchHospitals(1, limit);
  };

  // ===================================
  // EFFECTS
  // ===================================

  // Initial load
  useEffect(() => {
    fetchHospitals(1);
  }, []);

  // Filter changes with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchHospitals(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, typeFilter]);

  // ===================================
  // RENDER
  // ===================================

  return (
    <>
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Page Header Section */}
          <HospitalPageHeader
            totalCount={pagination.totalCount}
            onCreateClick={() => setShowCreateDialog(true)}
            onRefreshClick={forceRefresh}
            isLoading={loading}
          />

          {/* Search and Filter Section */}
          <HospitalSearchFilter
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            totalCount={pagination.totalCount}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onTypeFilterChange={setTypeFilter}
            onClearFilters={handleClearFilters}
            isLoading={loading}
          />

          {/* Hospital List Section */}
          <HospitalListSection
            hospitals={hospitals}
            isLoading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination Section */}
          {!loading && hospitals.length > 0 && (
            <HospitalPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              isLoading={loading}
            />
          )}

          {/* Dialog Components */}
          <HospitalCreateDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={handleCreateSuccess}
          />

          <HospitalEditDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            hospital={selectedHospital}
            onSuccess={handleUpdateSuccess}
            onClose={() => setSelectedHospital(null)}
          />

          <HospitalViewDialog
            open={showViewDialog}
            onOpenChange={setShowViewDialog}
            hospital={selectedHospital}
            onEdit={() => {
              setShowViewDialog(false);
              setShowEditDialog(true);
            }}
            onClose={() => setSelectedHospital(null)}
          />

          <HospitalDeleteDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            hospital={selectedHospital}
            onSuccess={handleDeleteSuccess}
            onClose={() => setSelectedHospital(null)}
          />

        </div>
      </div>
      
      {/* Sonner Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
          },
          className: 'font-sans',
        }}
        closeButton
        richColors
      />
    </>
  );
}