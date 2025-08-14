// app/dashboard/requisitions/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Plus,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Package,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Calendar,
  RefreshCw,
  Settings,
  BarChart3,
  PieChart,
  Users,
  Target,
  Activity,
  Zap,
  AlertTriangle,
  Timer,
  Loader2,
  ChevronRight,
  Grid3x3,
  List,
  Download,
  Filter as FilterIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import RequisitionList from "@/components/requisitions/RequisitionList";

// Types
interface RequisitionStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  emergency: number;
  value: number;
  trends: {
    totalChange: number;
    pendingChange: number;
    valueChange: number;
  };
}

interface DepartmentStats {
  id: string;
  name: string;
  departmentCode: string;
  totalRequisitions: number;
  pendingRequisitions: number;
  completedRequisitions: number;
  totalValue: number;
  averageProcessingTime: number;
  urgentCount: number;
  lastRequisition?: string;
}

interface WarehouseActivity {
  id: string;
  name: string;
  warehouseCode: string;
  incomingCount: number;
  outgoingCount: number;
  pendingIn: number;
  pendingOut: number;
  totalValue: number;
  utilizationRate: number;
}

export default function RequisitionsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [stats, setStats] = useState<RequisitionStats | null>(null);
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseActivity[]>([]);
  const [selectedRequisitionWarehouse, setSelectedRequisitionWarehouse] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange, selectedWarehouse, selectedDepartment]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, deptRes, warehouseRes] = await Promise.all([
        fetch(`/api/dashboard/requisitions/stats?timeRange=${timeRange}&warehouse=${selectedWarehouse}&department=${selectedDepartment}`),
        fetch(`/api/dashboard/departments/stats?timeRange=${timeRange}`),
        fetch(`/api/dashboard/warehouses/activity?timeRange=${timeRange}`)
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
        // Set default warehouse if available
        if (warehouseData.length > 0 && !selectedRequisitionWarehouse) {
          setSelectedRequisitionWarehouse(warehouseData[0].id);
        }
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

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-100",
      approved: "text-green-600 bg-green-100", 
      completed: "text-blue-600 bg-blue-100",
      rejected: "text-red-600 bg-red-100",
      emergency: "text-red-600 bg-red-100"
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const quickStats = useMemo(() => {
    if (!stats) return [];
    
    return [
      {
        title: "ใบเบิกทั้งหมด",
        value: formatNumber(stats.total),
        change: stats.trends.totalChange,
        icon: FileText,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        title: "รอดำเนินการ", 
        value: formatNumber(stats.pending),
        change: stats.trends.pendingChange,
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100"
      },
      {
        title: "เสร็จสิ้น",
        value: formatNumber(stats.completed),
        change: 0,
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        title: "มูลค่ารวม",
        value: formatCurrency(stats.value),
        change: stats.trends.valueChange,
        icon: Target,
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      },
      {
        title: "ฉุกเฉิน",
        value: formatNumber(stats.emergency),
        change: 0,
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100"
      }
    ];
  }, [stats]);

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
                    ภาพรวมการเบิกจ่ายยาและเวชภัณฑ์ทั่วโรงพยาบาล
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

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8"
        >
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">
                        {stat.value}
                      </p>
                    </div>
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", stat.bgColor)}>
                      <Icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                  </div>
                  {stat.change !== 0 && (
                    <div className="flex items-center mt-2 text-sm">
                      {getTrendIcon(stat.change)}
                      <span className={cn(
                        "ml-1",
                        stat.change > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {Math.abs(stat.change)}%
                      </span>
                      <span className="text-gray-500 ml-1">
                        จากช่วงก่อน
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                ภาพรวม
              </TabsTrigger>
              <TabsTrigger value="departments" className="gap-2">
                <Building className="h-4 w-4" />
                ตามแผนก
              </TabsTrigger>
              <TabsTrigger value="warehouses" className="gap-2">
                <Package className="h-4 w-4" />
                ตามคลัง
              </TabsTrigger>
              <TabsTrigger value="requisitions" className="gap-2">
                <List className="h-4 w-4" />
                รายการใบเบิก
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Distribution */}
                <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-600" />
                      สถานะใบเบิก
                    </CardTitle>
                    <CardDescription>
                      การกระจายตัวของใบเบิกตามสถานะ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats && (
                      <div className="space-y-4">
                        {[
                          { label: "รอดำเนินการ", value: stats.pending, total: stats.total, color: "bg-yellow-500" },
                          { label: "อนุมัติแล้ว", value: stats.approved, total: stats.total, color: "bg-green-500" },
                          { label: "เสร็จสิ้น", value: stats.completed, total: stats.total, color: "bg-blue-500" },
                          { label: "ปฏิเสธ", value: stats.rejected, total: stats.total, color: "bg-red-500" }
                        ].map((item, index) => {
                          const percentage = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{item.label}</span>
                                <span className="text-sm text-gray-500">
                                  {formatNumber(item.value)} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      การดำเนินการด่วน
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/dashboard/requisitions/new">
                      <Button className="w-full justify-start gap-2" variant="outline">
                        <Plus className="h-4 w-4" />
                        สร้างใบเบิกใหม่
                      </Button>
                    </Link>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Download className="h-4 w-4" />
                      ดาวน์โหลดรายงาน
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Settings className="h-4 w-4" />
                      ตั้งค่าระบบ
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="departments" className="space-y-6">
              {/* Department Filters */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-green-600" />
                    สถิติตามแผนก
                  </CardTitle>
                  <CardDescription>
                    ข้อมูลการเบิกจ่ายแยกตามแผนกต่างๆ ในโรงพยาบาล
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {departments.map((dept) => (
                  <Card key={dept.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{dept.name}</h3>
                            <p className="text-sm text-gray-500">
                              รหัส: {dept.departmentCode}
                            </p>
                          </div>
                          {dept.urgentCount > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {dept.urgentCount}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">ใบเบิกทั้งหมด</p>
                            <p className="font-semibold">{formatNumber(dept.totalRequisitions)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">รอดำเนินการ</p>
                            <p className="font-semibold text-yellow-600">{formatNumber(dept.pendingRequisitions)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">เสร็จสิ้น</p>
                            <p className="font-semibold text-green-600">{formatNumber(dept.completedRequisitions)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">มูลค่ารวม</p>
                            <p className="font-semibold">{formatCurrency(dept.totalValue)}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>เวลาดำเนินการเฉลี่ย</span>
                            <span>{dept.averageProcessingTime.toFixed(1)} ชั่วโมง</span>
                          </div>
                          {dept.lastRequisition && (
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>เบิกล่าสุด</span>
                              <span>{new Date(dept.lastRequisition).toLocaleDateString('th-TH')}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">ความคืบหน้า</span>
                            <span className="text-sm font-medium">
                              {dept.totalRequisitions > 0 
                                ? ((dept.completedRequisitions / dept.totalRequisitions) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </div>
                          <Progress 
                            value={dept.totalRequisitions > 0 
                              ? (dept.completedRequisitions / dept.totalRequisitions) * 100 
                              : 0
                            } 
                            className="h-2 mt-1" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="warehouses" className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    กิจกรรมคลังยา
                  </CardTitle>
                  <CardDescription>
                    ข้อมูลการเคลื่อนไหวสต็อกและการเบิกจ่ายในแต่ละคลัง
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {warehouses.map((warehouse) => (
                  <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              <Package className="h-4 w-4 text-blue-600" />
                              {warehouse.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              รหัส: {warehouse.warehouseCode}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {warehouse.utilizationRate.toFixed(1)}% ใช้งาน
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <ArrowDownRight className="h-4 w-4 text-green-600" />
                              เข้าคลัง
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold">{formatNumber(warehouse.incomingCount)} รายการ</p>
                              <p className="text-sm text-yellow-600">รอ {warehouse.pendingIn} รายการ</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <ArrowUpRight className="h-4 w-4 text-blue-600" />
                              ออกจากคลัง
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold">{formatNumber(warehouse.outgoingCount)} รายการ</p>
                              <p className="text-sm text-yellow-600">รอ {warehouse.pendingOut} รายการ</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">มูลค่ารวม</span>
                            <span className="font-semibold">{formatCurrency(warehouse.totalValue)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">อัตราการใช้งาน</span>
                            <div className="flex items-center gap-2">
                              <Progress value={warehouse.utilizationRate} className="h-2 w-16" />
                              <span className="text-sm font-medium">{warehouse.utilizationRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="requisitions" className="space-y-6">
              {/* Warehouse Selection for Requisition List */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5 text-orange-600" />
                    รายการใบเบิก
                  </CardTitle>
                  <CardDescription>
                    เลือกคลังเพื่อดูรายการใบเบิกเข้าและออก
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={selectedRequisitionWarehouse} onValueChange={setSelectedRequisitionWarehouse}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder="เลือกคลัง" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.warehouseCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Requisition Lists */}
              {selectedRequisitionWarehouse && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <ArrowDownRight className="h-5 w-5" />
                        ใบเบิกรับเข้า
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RequisitionList 
                        warehouseId={selectedRequisitionWarehouse}
                        viewType="incoming"
                        onRequisitionClick={(requisition) => {
                          // Navigate to requisition detail
                          window.location.href = `/dashboard/requisitions/${requisition.id}`;
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <ArrowUpRight className="h-5 w-5" />
                        ใบเบิกส่งออก
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RequisitionList 
                        warehouseId={selectedRequisitionWarehouse}
                        viewType="outgoing"
                        onRequisitionClick={(requisition) => {
                          // Navigate to requisition detail
                          window.location.href = `/dashboard/requisitions/${requisition.id}`;
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}