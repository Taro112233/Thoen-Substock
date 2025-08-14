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
  Star,
  Database
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

// Warehouse Type Config with dashboard-consistent colors
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
    color: "from-indigo-500 to-indigo-600",
    bgLight: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200"
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

  // Loading State - Match dashboard style
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="relative">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">กำลังโหลดข้อมูล</h2>
          <p className="text-gray-600">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  // Error State - Match dashboard style
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Success notification if just navigated from somewhere */}
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('from') === 'dashboard' && (
            <div className="fixed top-4 right-4 z-50">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">เข้าสู่หน้าจัดการคลังสำเร็จ!</span>
                </div>
              </div>
            </div>
          )}

          {/* Header Section - Use same gradient style as dashboard */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    ระบบจัดการคลังยา
                  </h2>
                  <p className="text-white/90 mb-1">
                    จัดการคลังยาและพื้นที่เก็บยาทั้งหมดในโรงพยาบาล
                  </p>
                  {summary && (
                    <p className="text-white/80 text-sm">
                      คลังทั้งหมด {formatNumber(summary.totalWarehouses)} คลัง • มูลค่า {formatCurrency(summary.totalStockValue)}
                    </p>
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
                    className="bg-white text-indigo-600 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มคลังใหม่
                  </Button>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>

          {/* Quick Stats - Same style as dashboard */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">สถานะระบบ</p>
                      <p className="text-2xl font-bold text-green-600">ออนไลน์</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">คลังทั้งหมด</p>
                      <p className="text-2xl font-bold text-blue-600">{formatNumber(summary.totalWarehouses)}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Warehouse className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">มูลค่าสต็อก</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalStockValue)}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">แจ้งเตือน</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatNumber(summary.criticalAlerts + summary.lowStockAlerts)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filter */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="ค้นหาคลัง (ชื่อ, รหัส, สถานที่)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "p-3 rounded-lg bg-gradient-to-br",
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
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                ใช้งาน
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-300 text-gray-600">
                                ไม่ใช้งาน
                              </Badge>
                            )}
                            {warehouse.isMaintenance && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                บำรุงรักษา
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* User Info & Actions - Similar to dashboard page */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">มูลค่าสต็อก:</span>
                              <span className="font-medium">{formatCurrency(warehouse.metrics.stockValue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">จำนวนรายการ:</span>
                              <span className="font-medium">{formatNumber(warehouse.metrics.itemCount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">สต็อกต่ำ:</span>
                              <Badge className={warehouse.metrics.lowStockItems > 0 ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-green-100 text-green-800 border-green-200"}>
                                {formatNumber(warehouse.metrics.lowStockItems)} รายการ
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">ใกล้หมดอายุ:</span>
                              <Badge className={warehouse.metrics.expiringItems > 0 ? "bg-orange-100 text-orange-800 border-orange-200" : "bg-green-100 text-green-800 border-green-200"}>
                                {formatNumber(warehouse.metrics.expiringItems)} รายการ
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">ความแม่นยำ:</span>
                              <span className="font-medium">{formatPercentage(warehouse.metrics.accuracy)}</span>
                            </div>
                            {warehouse.hasTemperatureControl && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">อุณหภูมิ:</span>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  <Thermometer className="h-3 w-3 mr-1" />
                                  {safeToFixed(warehouse.minTemperature, 0)}-{safeToFixed(warehouse.maxTemperature, 0)}°C
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions - Same style as dashboard */}
                        <div className="space-y-3">
                          <Button 
                            className="w-full justify-start"
                            onClick={() => router.push(`/dashboard/warehouses/${warehouse.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            ดูรายละเอียด
                          </Button>
                          
                          <Button 
                            className="w-full justify-start"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/warehouses/${warehouse.id}/stocks`)}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            นับสต็อก
                          </Button>

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
                        </div>
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