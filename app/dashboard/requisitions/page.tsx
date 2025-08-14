// app/dashboard/requisitions/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Plus,
  Search,
  Package,
  RefreshCw,
  Filter as FilterIcon,
  Send,
  PackageCheck,
  Truck,
  CheckCircle,
  Ban,
  ClipboardList,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Import types and utilities
import { RequisitionStats, DepartmentFilter, RequisitionItem } from "@/types/requisitions";
import { getStatusConfig, formatCurrency, formatNumber } from "@/utils/requisitions";

// Import components
import RequisitionCard from "@/components/RequisitionCard";
import StatsCards from "@/components/StatsCards";

export default function RequisitionsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [activeTab, setActiveTab] = useState('requesting');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Data states
  const [stats, setStats] = useState<RequisitionStats | null>(null);
  const [departments, setDepartments] = useState<DepartmentFilter[]>([]);
  const [warehouses, setWarehouses] = useState<DepartmentFilter[]>([]);
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange, selectedDepartment, selectedWarehouse, activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, deptRes, warehouseRes, requisitionsRes] = await Promise.all([
        fetch(`/api/dashboard/requisitions/stats?timeRange=${timeRange}&department=${selectedDepartment}&warehouse=${selectedWarehouse}`),
        fetch(`/api/dashboard/departments/stats?timeRange=${timeRange}`),
        fetch(`/api/dashboard/warehouses/stats?timeRange=${timeRange}`),
        fetch(`/api/dashboard/requisitions?timeRange=${timeRange}&department=${selectedDepartment}&warehouse=${selectedWarehouse}&status=${activeTab}`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData);
      }

      if (warehouseRes.ok) {
        const warehouseData = await warehouseRes.json();
        setWarehouses(warehouseData);
      }

      if (requisitionsRes.ok) {
        const requisitionsData = await requisitionsRes.json();
        setRequisitions(requisitionsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const filteredRequisitions = useMemo(() => {
    let filtered = [...requisitions];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.requisitionNumber.toLowerCase().includes(searchLower) ||
        req.requester?.firstName.toLowerCase().includes(searchLower) ||
        req.requester?.lastName.toLowerCase().includes(searchLower) ||
        req.requestingDepartment.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }

    return filtered;
  }, [requisitions, searchTerm, priorityFilter]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center p-8">
              <div className="relative">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full mx-auto"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">กำลังโหลดข้อมูล</h2>
              <p className="text-gray-600">กรุณารอสักครู่...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Package className="h-8 w-8" />
                    ระบบจัดการใบเบิกยา
                  </h1>
                  <p className="text-blue-100">
                    ติดตามสถานะการเบิกจ่ายยาและเวชภัณฑ์แบบเรียลไทม์
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">วันนี้</SelectItem>
                      <SelectItem value="7d">7 วัน</SelectItem>
                      <SelectItem value="30d">30 วัน</SelectItem>
                      <SelectItem value="90d">3 เดือน</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                    รีเฟรช
                  </Button>
                  
                  <Link href="/dashboard/requisitions/new">
                    <Button className="bg-white text-blue-600 hover:bg-gray-100 gap-2">
                      <Plus className="h-4 w-4" />
                      สร้างใบเบิกใหม่
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5 text-purple-600" />
                ตัวกรองข้อมูล
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ค้นหา</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="เลขที่ใบเบิก, ผู้เบิก, แผนก..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">แผนกผู้เบิก</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกแผนก</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.departmentCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">คลังต้นทาง</label>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกคลัง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกคลัง</SelectItem>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">ความสำคัญ</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกความสำคัญ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกระดับ</SelectItem>
                      <SelectItem value="URGENT">เร่งด่วน</SelectItem>
                      <SelectItem value="HIGH">สูง</SelectItem>
                      <SelectItem value="NORMAL">ปกติ</SelectItem>
                      <SelectItem value="LOW">ต่ำ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <StatsCards 
            stats={stats} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="requesting" className="gap-2 text-xs lg:text-sm">
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">กำลังเบิก</span>
                <span className="sm:hidden">เบิก</span>
              </TabsTrigger>
              <TabsTrigger value="preparing" className="gap-2 text-xs lg:text-sm">
                <PackageCheck className="h-4 w-4" />
                <span className="hidden sm:inline">เตรียมจัดส่ง</span>
                <span className="sm:hidden">เตรียม</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="gap-2 text-xs lg:text-sm">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">กำลังจัดส่ง</span>
                <span className="sm:hidden">ส่ง</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2 text-xs lg:text-sm">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">สำเร็จ</span>
                <span className="sm:hidden">สำเร็จ</span>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="gap-2 text-xs lg:text-sm">
                <Ban className="h-4 w-4" />
                <span className="hidden sm:inline">ยกเลิก</span>
                <span className="sm:hidden">ยกเลิก</span>
              </TabsTrigger>
            </TabsList>

            {/* Common Tab Content */}
            {(['requesting', 'preparing', 'shipping', 'completed', 'cancelled'] as const).map((status) => (
              <TabsContent key={status} value={status} className="space-y-6">
                {/* Current Status Display */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {(() => {
                      const statusConfig = getStatusConfig(status.toUpperCase());
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div className="flex items-center gap-4">
                          <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center", statusConfig.bgColor)}>
                            <StatusIcon className={cn("h-8 w-8", statusConfig.color)} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">{statusConfig.label}</h3>
                            <p className="text-gray-600">{statusConfig.description}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              แสดง {filteredRequisitions.length} รายการ
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold">
                              {filteredRequisitions.length}
                            </p>
                            <p className="text-sm text-gray-500">รายการ</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Requisitions List */}
                <div className="space-y-4">
                  {filteredRequisitions.length > 0 ? (
                    filteredRequisitions.map((requisition) => (
                      <RequisitionCard
                        key={requisition.id}
                        requisition={requisition}
                        onClick={(req) => {
                          window.location.href = `/dashboard/requisitions/${req.id}`;
                        }}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium mb-2">ไม่พบใบเบิก</h3>
                        <p className="text-gray-500 text-center">
                          {searchTerm || selectedDepartment !== 'all' || selectedWarehouse !== 'all' || priorityFilter !== 'all'
                            ? 'ไม่พบใบเบิกที่ตรงกับเงื่อนไขการค้นหา'
                            : `ไม่มีใบเบิกในสถานะ "${getStatusConfig(status.toUpperCase()).label}"`
                          }
                        </p>
                        {(searchTerm || selectedDepartment !== 'all' || selectedWarehouse !== 'all' || priorityFilter !== 'all') && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedDepartment('all');
                              setSelectedWarehouse('all');
                              setPriorityFilter('all');
                            }}
                          >
                            ล้างตัวกรอง
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Summary Footer */}
                {filteredRequisitions.length > 0 && (
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{filteredRequisitions.length}</p>
                          <p className="text-sm text-gray-500">รายการที่แสดง</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(filteredRequisitions.reduce((sum, req) => sum + req.totalValue, 0))}
                          </p>
                          <p className="text-sm text-gray-500">มูลค่ารวม</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatNumber(filteredRequisitions.reduce((sum, req) => sum + req.totalItems, 0))}
                          </p>
                          <p className="text-sm text-gray-500">รายการยาทั้งหมด</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}