// app/dashboard/warehouses/page.tsx
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
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
    value: number;
  }[];
}

// Warehouse Type Config
const warehouseTypeConfig = {
  CENTRAL: { 
    label: "คลังกลาง", 
    icon: Warehouse, 
    color: "bg-blue-500",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700"
  },
  DEPARTMENT: { 
    label: "คลังแผนก", 
    icon: Box, 
    color: "bg-green-500",
    bgLight: "bg-green-50",
    textColor: "text-green-700"
  },
  EMERGENCY: { 
    label: "คลังฉุกเฉิน", 
    icon: AlertCircle, 
    color: "bg-red-500",
    bgLight: "bg-red-50",
    textColor: "text-red-700"
  },
  CONTROLLED: { 
    label: "คลังยาควบคุม", 
    icon: Shield, 
    color: "bg-purple-500",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700"
  },
  COLD_STORAGE: { 
    label: "ห้องเย็น", 
    icon: Thermometer, 
    color: "bg-cyan-500",
    bgLight: "bg-cyan-50",
    textColor: "text-cyan-700"
  },
  QUARANTINE: { 
    label: "ห้องกักกัน", 
    icon: AlertTriangle, 
    color: "bg-yellow-500",
    bgLight: "bg-yellow-50",
    textColor: "text-yellow-700"
  },
  DISPOSAL: { 
    label: "ห้องทำลาย", 
    icon: XCircle, 
    color: "bg-gray-500",
    bgLight: "bg-gray-50",
    textColor: "text-gray-700"
  },
  RECEIVING: { 
    label: "ห้องรับของ", 
    icon: Package, 
    color: "bg-indigo-500",
    bgLight: "bg-indigo-50",
    textColor: "text-indigo-700"
  },
  DISPENSING: { 
    label: "ห้องจ่ายยา", 
    icon: FileText, 
    color: "bg-teal-500",
    bgLight: "bg-teal-50",
    textColor: "text-teal-700"
  }
};

export default function WarehousesOverviewDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/warehouses");
      if (!response.ok) throw new Error("Failed to fetch data");
      
      const data = await response.json();
      setWarehouses(data.warehouses);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("th-TH").format(value);
  };

  const filteredWarehouses = selectedType === "all" 
    ? warehouses 
    : warehouses.filter(w => w.type === selectedType);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">ภาพรวมคลังยา</h1>
        <p className="text-muted-foreground">
          จัดการและติดตามสถานะคลังยาทั้งหมดในโรงพยาบาล
        </p>
      </motion.div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">คลังทั้งหมด</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalWarehouses}</div>
                <p className="text-xs text-muted-foreground">
                  ใช้งาน {summary.activeWarehouses} คลัง
                </p>
                <Progress 
                  value={(summary.activeWarehouses / summary.totalWarehouses) * 100} 
                  className="mt-2 h-1"
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">มูลค่าสต็อกรวม</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary.totalStockValue)}
                </div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% จากเดือนที่แล้ว
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">จำนวนรายการยา</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(summary.totalItems)}</div>
                <p className="text-xs text-muted-foreground">
                  ทุกคลังรวมกัน
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">การแจ้งเตือน</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">วิกฤต</span>
                    <Badge variant="destructive" className="h-5">
                      {summary.criticalAlerts}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">สต็อกต่ำ</span>
                    <Badge variant="outline" className="h-5 border-yellow-500 text-yellow-700">
                      {summary.lowStockAlerts}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">ใกล้หมดอายุ</span>
                    <Badge variant="outline" className="h-5 border-orange-500 text-orange-700">
                      {summary.expiringAlerts}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Warehouse Type Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>คลังยาตามประเภท</CardTitle>
          <CardDescription>เลือกดูคลังยาตามประเภทการใช้งาน</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="grid grid-cols-5 lg:grid-cols-10 h-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary">
                ทั้งหมด ({warehouses.length})
              </TabsTrigger>
              {Object.entries(warehouseTypeConfig).map(([type, config]) => {
                const count = warehouses.filter(w => w.type === type).length;
                if (count === 0) return null;
                
                const Icon = config.icon;
                return (
                  <TabsTrigger 
                    key={type} 
                    value={type}
                    className="flex flex-col gap-1 h-auto py-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{config.label}</span>
                    <Badge variant="secondary" className="h-4 px-1 text-xs">
                      {count}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={selectedType} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredWarehouses.map((warehouse, index) => {
                    const typeConfig = warehouseTypeConfig[warehouse.type as keyof typeof warehouseTypeConfig];
                    const Icon = typeConfig?.icon || Warehouse;
                    
                    return (
                      <motion.div
                        key={warehouse.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-lg",
                            warehouse.isMaintenance && "opacity-75",
                            !warehouse.isActive && "opacity-50"
                          )}
                          onClick={() => router.push(`/dashboard/warehouses/${warehouse.id}`)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  typeConfig?.bgLight
                                )}>
                                  <Icon className={cn("h-4 w-4", typeConfig?.textColor)} />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{warehouse.name}</CardTitle>
                                  <CardDescription className="text-xs">
                                    {warehouse.warehouseCode} • {warehouse.location}
                                  </CardDescription>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/warehouses/${warehouse.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex gap-2 mt-3">
                              {warehouse.isActive ? (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                  ใช้งาน
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs border-gray-500 text-gray-700">
                                  ไม่ใช้งาน
                                </Badge>
                              )}
                              {warehouse.isMaintenance && (
                                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                                  บำรุงรักษา
                                </Badge>
                              )}
                              {warehouse.hasTemperatureControl && (
                                <Badge variant="outline" className="text-xs border-blue-500 text-blue-700">
                                  <Thermometer className="h-3 w-3 mr-1" />
                                  {warehouse.minTemperature}-{warehouse.maxTemperature}°C
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">มูลค่าสต็อก</p>
                                <p className="text-sm font-semibold">
                                  {formatCurrency(warehouse.metrics.stockValue)}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">จำนวนรายการ</p>
                                <p className="text-sm font-semibold">
                                  {formatNumber(warehouse.metrics.itemCount)}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">สต็อกต่ำ</p>
                                <div className="flex items-center gap-1">
                                  <p className="text-sm font-semibold">
                                    {warehouse.metrics.lowStockItems}
                                  </p>
                                  {warehouse.metrics.lowStockItems > 0 && (
                                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">ใกล้หมดอายุ</p>
                                <div className="flex items-center gap-1">
                                  <p className="text-sm font-semibold">
                                    {warehouse.metrics.expiringItems}
                                  </p>
                                  {warehouse.metrics.expiringItems > 0 && (
                                    <Clock className="h-3 w-3 text-orange-600" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Capacity Usage */}
                            {warehouse.capacity && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">การใช้พื้นที่</span>
                                  <span className="font-medium">
                                    {warehouse.metrics.capacityUsage.toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={warehouse.metrics.capacityUsage} 
                                  className={cn(
                                    "h-2",
                                    warehouse.metrics.capacityUsage > 90 && "bg-red-100",
                                    warehouse.metrics.capacityUsage > 75 && warehouse.metrics.capacityUsage <= 90 && "bg-yellow-100"
                                  )}
                                />
                              </div>
                            )}

                            {/* Manager */}
                            {warehouse.manager && (
                              <div className="flex items-center gap-2 pt-2 border-t">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">ผู้ดูแล:</span>
                                <span className="text-xs font-medium">
                                  {warehouse.manager.firstName} {warehouse.manager.lastName}
                                </span>
                              </div>
                            )}

                            {/* Recent Activity */}
                            {warehouse.recentActivity && warehouse.recentActivity.length > 0 && (
                              <div className="pt-2 border-t">
                                <div className="flex items-center gap-1 mb-2">
                                  <Activity className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">กิจกรรมล่าสุด</span>
                                </div>
                                <div className="space-y-1">
                                  {warehouse.recentActivity.slice(0, 2).map((activity, idx) => (
                                    <div key={idx} className="text-xs text-muted-foreground">
                                      • {activity.description}
                                    </div>
                                  ))}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Stats by Warehouse Type */}
      {summary?.warehouseTypes && summary.warehouseTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>สถิติตามประเภทคลัง</CardTitle>
            <CardDescription>เปรียบเทียบมูลค่าและจำนวนคลังตามประเภท</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.warehouseTypes.map((type) => {
                const config = warehouseTypeConfig[type.type as keyof typeof warehouseTypeConfig];
                const Icon = config?.icon || Warehouse;
                
                return (
                  <div key={type.type} className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", config?.bgLight)}>
                      <Icon className={cn("h-4 w-4", config?.textColor)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{config?.label || type.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {type.count} คลัง
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Progress 
                          value={(type.value / summary.totalStockValue) * 100} 
                          className="flex-1 mr-4 h-2"
                        />
                        <span className="text-xs font-medium">
                          {formatCurrency(type.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}