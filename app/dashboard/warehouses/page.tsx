// app/dashboard/warehouses/page.tsx - Enhanced Styled Dashboard
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Warehouse, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  Thermometer,
  Shield,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Box,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Settings,
  Map,
  Zap,
  Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Types
interface WarehouseData {
  id: string;
  name: string;
  warehouseCode: string;
  type: string;
  location: string;
  isActive: boolean;
  isMaintenance: boolean;
  totalValue: number;
  totalItems: number;
  capacity?: number;
  area?: number;
  hasTemperatureControl: boolean;
  minTemperature?: number;
  maxTemperature?: number;
  securityLevel: string;
  lastStockCount?: string;
  manager?: {
    firstName: string;
    lastName: string;
  };
  _count: {
    stockCards: number;
  };
  metrics: {
    stockValue: number;
    itemCount: number;
    lowStockItems: number;
    expiringItems: number;
    pendingRequisitions: number;
    capacityUsage: number;
    turnoverRate: number;
    accuracy: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface DashboardSummary {
  totalWarehouses: number;
  activeWarehouses: number;
  totalStockValue: number;
  totalItems: number;
  criticalAlerts: number;
  lowStockAlerts: number;
  expiringAlerts: number;
  pendingRequisitions: number;
  warehouseTypes: {
    type: string;
    count: number;
    value?: number;
  }[];
}

// Warehouse Type Config
const warehouseTypeConfig = {
  CENTRAL: { 
    label: "คลังกลาง", 
    icon: Warehouse, 
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200"
  },
  DEPARTMENT: { 
    label: "คลังแผนก", 
    icon: Box, 
    color: "from-green-500 to-green-600",
    bgLight: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200"
  },
  EMERGENCY: { 
    label: "คลังฉุกเฉิน", 
    icon: AlertTriangle, 
    color: "from-red-500 to-red-600",
    bgLight: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200"
  },
  CRITICAL: { 
    label: "คลังยาควบคุม", 
    icon: Shield, 
    color: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200"
  },
  COLD_STORAGE: { 
    label: "คลังยาแช่เย็น", 
    icon: Thermometer, 
    color: "from-cyan-500 to-cyan-600",
    bgLight: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200"
  }
};

// Helper functions with null safety
const formatCurrency = (amount: number | null | undefined): string => {
  const safeAmount = Number(amount) || 0;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

const formatNumber = (num: number | null | undefined): string => {
  const safeNum = Number(num) || 0;
  return safeNum.toLocaleString('th-TH');
};

const formatPercentage = (value: number | null | undefined, decimals: number = 1): string => {
  const safeValue = Number(value) || 0;
  return `${safeValue.toFixed(decimals)}%`;
};

const safeToFixed = (value: number | null | undefined, decimals: number = 2): string => {
  const safeValue = Number(value) || 0;
  return safeValue.toFixed(decimals);
};

export default function WarehousesOverviewDashboard() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/warehouses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      }

      const data = await response.json();
      
      // Validate and ensure metrics exist with default values
      const validatedWarehouses: WarehouseData[] = (data.warehouses || []).map((warehouse: any) => ({
        ...warehouse,
        totalValue: Number(warehouse.totalValue) || 0,
        totalItems: Number(warehouse.totalItems) || 0,
        capacity: warehouse.capacity ? Number(warehouse.capacity) : undefined,
        area: warehouse.area ? Number(warehouse.area) : undefined,
        minTemperature: warehouse.minTemperature ? Number(warehouse.minTemperature) : undefined,
        maxTemperature: warehouse.maxTemperature ? Number(warehouse.maxTemperature) : undefined,
        metrics: {
          stockValue: Number(warehouse.metrics?.stockValue) || 0,
          itemCount: Number(warehouse.metrics?.itemCount) || 0,
          lowStockItems: Number(warehouse.metrics?.lowStockItems) || 0,
          expiringItems: Number(warehouse.metrics?.expiringItems) || 0,
          pendingRequisitions: Number(warehouse.metrics?.pendingRequisitions) || 0,
          capacityUsage: Number(warehouse.metrics?.capacityUsage) || 0,
          turnoverRate: Number(warehouse.metrics?.turnoverRate) || 0,
          accuracy: Number(warehouse.metrics?.accuracy) || 0,
        },
        recentActivity: warehouse.recentActivity || [],
        _count: warehouse._count || { stockCards: 0 }
      }));

      const validatedSummary: DashboardSummary = {
        totalWarehouses: Number(data.summary?.totalWarehouses) || 0,
        activeWarehouses: Number(data.summary?.activeWarehouses) || 0,
        totalStockValue: Number(data.summary?.totalStockValue) || 0,
        totalItems: Number(data.summary?.totalItems) || 0,
        criticalAlerts: Number(data.summary?.criticalAlerts) || 0,
        lowStockAlerts: Number(data.summary?.lowStockAlerts) || 0,
        expiringAlerts: Number(data.summary?.expiringAlerts) || 0,
        pendingRequisitions: Number(data.summary?.pendingRequisitions) || 0,
        warehouseTypes: (data.summary?.warehouseTypes || []).map((wt: any) => ({
          type: wt.type,
          count: Number(wt.count) || 0,
          value: Number(wt.value) || 0
        }))
      };

      setWarehouses(validatedWarehouses);
      setSummary(validatedSummary);

    } catch (err) {
      console.error('❌ [WAREHOUSES DASHBOARD] Error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesType = selectedType === "all" || warehouse.type === selectedType;
    const matchesSearch = searchTerm === "" || 
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.warehouseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getWarehouseTypeConfig = (type: string) => {
    return warehouseTypeConfig[type as keyof typeof warehouseTypeConfig] || {
      label: type,
      icon: Package,
      color: "from-gray-500 to-gray-600",
      bgLight: "bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-200"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Warehouse Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center p-8 max-w-md">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-800 mb-4">เกิดข้อผิดพลาด</h2>
              <p className="text-red-600 mb-6 text-lg leading-relaxed">{error}</p>
              <div className="space-y-3">
                <Button 
                  onClick={handleRefresh}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      กำลังรีเฟรช...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      ลองใหม่อีกครั้ง
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  กลับหน้าหลัก
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">จัดการคลังยา</h1>
                  <p className="text-indigo-100 mb-4">
                    ระบบจัดการคลังยาและพื้นที่เก็บยาทั้งหมดในโรงพยาบาล
                  </p>
                  {summary && (
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <Warehouse className="h-4 w-4" />
                        <span>{formatNumber(summary.totalWarehouses)} คลัง</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(summary.totalStockValue)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>{formatNumber(summary.totalItems)} รายการ</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleRefresh}
                    variant="secondary"
                    size="sm"
                    disabled={isRefreshing}
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    {isRefreshing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard/warehouses/new')}
                    className="bg-white text-indigo-600 hover:bg-gray-50 gap-2 shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    เพิ่มคลังใหม่
                  </Button>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-100">คลังทั้งหมด</p>
                      <p className="text-3xl font-bold">{formatNumber(summary.totalWarehouses)}</p>
                      <p className="text-xs text-blue-200">
                        ใช้งาน {formatNumber(summary.activeWarehouses)} คลัง
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <Warehouse className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-green-100">มูลค่าสต็อกรวม</p>
                      <p className="text-2xl font-bold">{formatCurrency(summary.totalStockValue)}</p>
                      <p className="text-xs text-green-200">
                        {formatNumber(summary.totalItems)} รายการ
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <DollarSign className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-100">แจ้งเตือนสำคัญ</p>
                      <p className="text-3xl font-bold text-white">
                        {formatNumber(summary.criticalAlerts + summary.lowStockAlerts)}
                      </p>
                      <p className="text-xs text-red-200">
                        หมดอายุ {formatNumber(summary.expiringAlerts)} รายการ
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <AlertTriangle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-orange-100">คำขอรอดำเนินการ</p>
                      <p className="text-3xl font-bold text-white">
                        {formatNumber(summary.pendingRequisitions)}
                      </p>
                      <p className="text-xs text-orange-200">รอการอนุมัติ</p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filter */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="ค้นหาคลัง (ชื่อ, รหัส, สถานที่)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
                
                <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full lg:w-auto">
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-gray-100">
                    <TabsTrigger value="all" className="text-xs">ทั้งหมด</TabsTrigger>
                    <TabsTrigger value="CENTRAL" className="text-xs">คลังกลาง</TabsTrigger>
                    <TabsTrigger value="DEPARTMENT" className="text-xs">คลังแผนก</TabsTrigger>
                    <TabsTrigger value="EMERGENCY" className="text-xs">ฉุกเฉิน</TabsTrigger>
                    <TabsTrigger value="CRITICAL" className="text-xs">ยาควบคุม</TabsTrigger>
                    <TabsTrigger value="COLD_STORAGE" className="text-xs">แช่เย็น</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Warehouses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredWarehouses.map((warehouse) => {
                const typeConfig = getWarehouseTypeConfig(warehouse.type);
                const IconComponent = typeConfig.icon;

                return (
                  <motion.div
                    key={warehouse.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                              typeConfig.color
                            )}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
                                {warehouse.name}
                              </CardTitle>
                              <CardDescription className="text-sm font-medium">
                                {warehouse.warehouseCode} • {warehouse.location}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            {warehouse.isActive ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">
                                <Activity className="h-3 w-3 mr-1" />
                                ใช้งาน
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-300 text-gray-600">
                                ไม่ใช้งาน
                              </Badge>
                            )}
                            {warehouse.isMaintenance && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                <Settings className="h-3 w-3 mr-1" />
                                บำรุงรักษา
                              </Badge>
                            )}
                            {warehouse.hasTemperatureControl && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                <Thermometer className="h-3 w-3 mr-1" />
                                {safeToFixed(warehouse.minTemperature, 0)}-{safeToFixed(warehouse.maxTemperature, 0)}°C
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* Main Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                            <p className="text-xs font-medium text-blue-600 mb-1">มูลค่าสต็อก</p>
                            <p className="text-lg font-bold text-blue-800">
                              {formatCurrency(warehouse.metrics.stockValue)}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                            <p className="text-xs font-medium text-green-600 mb-1">จำนวนรายการ</p>
                            <p className="text-lg font-bold text-green-800">
                              {formatNumber(warehouse.metrics.itemCount)}
                            </p>
                          </div>
                        </div>

                        {/* Alert Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                            <p className="text-xs font-medium text-yellow-600 mb-1">สต็อกต่ำ</p>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-bold text-yellow-800">
                                {formatNumber(warehouse.metrics.lowStockItems)}
                              </p>
                              {warehouse.metrics.lowStockItems > 0 && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                            <p className="text-xs font-medium text-orange-600 mb-1">ใกล้หมดอายุ</p>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-bold text-orange-800">
                                {formatNumber(warehouse.metrics.expiringItems)}
                              </p>
                              {warehouse.metrics.expiringItems > 0 && (
                                <Clock className="h-4 w-4 text-orange-600" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-medium text-gray-600">อัตราการหมุนเวียน</p>
                              <p className="text-xs font-bold text-gray-800">
                                {formatPercentage(warehouse.metrics.turnoverRate)}
                              </p>
                            </div>
                            <Progress 
                              value={warehouse.metrics.turnoverRate} 
                              className="h-2 bg-gray-200"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-medium text-gray-600">ความแม่นยำ</p>
                              <p className="text-xs font-bold text-gray-800">
                                {formatPercentage(warehouse.metrics.accuracy)}
                              </p>
                            </div>
                            <Progress 
                              value={warehouse.metrics.accuracy} 
                              className="h-2 bg-gray-200"
                            />
                          </div>

                          {warehouse.capacity && (
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-medium text-gray-600">การใช้งานพื้นที่</p>
                                <p className="text-xs font-bold text-gray-800">
                                  {formatPercentage(warehouse.metrics.capacityUsage)}
                                </p>
                              </div>
                              <Progress 
                                value={warehouse.metrics.capacityUsage} 
                                className="h-2 bg-gray-200"
                              />
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => router.push(`/dashboard/warehouses/${warehouse.id}`)}
                              size="sm" 
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              ดูรายละเอียด
                            </Button>
                            <Button 
                              onClick={() => router.push(`/dashboard/warehouses/${warehouse.id}/stocks`)}
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-xs h-8 border-gray-300"
                            >
                              <Package className="h-3 w-3 mr-1" />
                              จัดการสต็อก
                            </Button>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        {warehouse.recentActivity && warehouse.recentActivity.length > 0 && (
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-600 mb-3">กิจกรรมล่าสุด</p>
                            <div className="space-y-2">
                              {warehouse.recentActivity.slice(0, 2).map((activity, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-700 leading-relaxed">
                                      {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(activity.timestamp).toLocaleDateString('th-TH', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Manager Info */}
                        {warehouse.manager && (
                          <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-600">ผู้รับผิดชอบ</p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {warehouse.manager.firstName} {warehouse.manager.lastName}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredWarehouses.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">ไม่พบคลังยา</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedType !== "all" 
                  ? "ไม่พบคลังยาที่ตรงกับเงื่อนไขการค้นหา" 
                  : "ยังไม่มีคลังยาในระบบ"}
              </p>
              {(!searchTerm && selectedType === "all") && (
                <Button 
                  onClick={() => router.push('/dashboard/warehouses/new')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มคลังยาใหม่
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}