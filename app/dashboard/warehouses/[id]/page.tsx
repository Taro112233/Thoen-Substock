// app/dashboard/warehouses/[id]/page.tsx - Fixed null safety
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Shield,
  Clock,
  DollarSign,
  Activity,
  Box,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Calendar,
  Loader2,
  Eye,
  Edit,
  MoreVertical,
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  Hash,
  Pill,
  Building,
  MapPin,
  Phone,
  Mail,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Types - แก้ไขตาม schema และ API response
interface StockItem {
  id: string;
  drug: {
    id: string;
    hospitalDrugCode: string;
    name: string;
    genericName: string | null;
    strength: string | null;
    unit: string;
    dosageForm: string;
  };
  currentStock: number;
  reorderPoint: number;
  maxStock: number | null;
  averageCost: number;
  totalValue: number;
  lowStockAlert: boolean;
  lastUpdated?: string;
}

interface Transaction {
  id: string;
  transactionType: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  createdAt: string;
  drug: {
    name: string;
    hospitalDrugCode: string;
  } | null;
  performer: {
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  reference?: string | null;
  description?: string | null;
}

interface RequisitionSummary {
  incoming: number;
  outgoing: number;
  pending: number;
  completed: number;
}

interface WarehouseDetail {
  id: string;
  name: string;
  warehouseCode: string;
  type: string;
  location: string;
  address?: string | null;
  isActive: boolean;
  isMaintenance: boolean;
  area?: number | null;
  capacity?: number | null;
  hasTemperatureControl: boolean;
  minTemperature?: number | null;
  maxTemperature?: number | null;
  hasHumidityControl: boolean;
  minHumidity?: number | null;
  maxHumidity?: number | null;
  securityLevel: string;
  accessControl: boolean;
  cctv: boolean;
  alarm: boolean;
  lastStockCount?: string | null;
  totalValue: number;
  totalItems: number;
  description?: string | null;
  notes?: string | null;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phoneNumber?: string | null;
    position?: string | null;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  stockCards: StockItem[];
  recentTransactions: Transaction[];
  requisitionSummary: RequisitionSummary;
  statistics: {
    totalDrugs: number;
    totalStock: number;
    stockValue: number;
    lowStockItems: number;
    expiringItems: number;
    outOfStockItems: number;
    overstockItems: number;
    recentActivity: number;
    pendingRequisitions: number;
    turnoverRate: number;
    accuracyRate: number;
    utilizationRate: number;
    avgDailyUsage: number;
    daysOfStock: number;
  };
  stockByCategory: Array<{
    category: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  expiryAnalysis: Array<{
    range: string;
    count: number;
    value: number;
  }>;
  _counts: {
    stockCards: number;
    stockTransactions: number;
  };
}

export default function WarehouseDetailDashboard() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState<WarehouseDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchWarehouseDetail(params.id as string);
    }
  }, [params.id]);

  const fetchWarehouseDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/dashboard/warehouses/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch warehouse data`);
      }
      
      const data = await response.json();
      console.log('📦 [WAREHOUSE DETAIL] Data received:', data);
      
      // Validate data structure และใส่ default values
      const validatedData: WarehouseDetail = {
        ...data,
        stockCards: Array.isArray(data.stockCards) ? data.stockCards : [],
        recentTransactions: Array.isArray(data.recentTransactions) ? data.recentTransactions : [],
        stockByCategory: Array.isArray(data.stockByCategory) ? data.stockByCategory : [],
        expiryAnalysis: Array.isArray(data.expiryAnalysis) ? data.expiryAnalysis : [],
        requisitionSummary: data.requisitionSummary || {
          incoming: 0,
          outgoing: 0,
          pending: 0,
          completed: 0
        },
        statistics: data.statistics || {
          totalDrugs: 0,
          totalStock: 0,
          stockValue: 0,
          lowStockItems: 0,
          expiringItems: 0,
          outOfStockItems: 0,
          overstockItems: 0,
          recentActivity: 0,
          pendingRequisitions: 0,
          turnoverRate: 0,
          accuracyRate: 0,
          utilizationRate: 0,
          avgDailyUsage: 0,
          daysOfStock: 0
        },
        _counts: data._counts || { stockCards: 0, stockTransactions: 0 }
      };
      
      setWarehouse(validatedData);
    } catch (err) {
      console.error('❌ [WAREHOUSE DETAIL] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getTransactionTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      RECEIVE: { label: 'รับเข้า', color: 'text-green-600 bg-green-100', icon: ArrowDownRight },
      DISPENSE: { label: 'จ่ายออก', color: 'text-red-600 bg-red-100', icon: ArrowUpRight },
      TRANSFER_IN: { label: 'โอนเข้า', color: 'text-blue-600 bg-blue-100', icon: ArrowDownRight },
      TRANSFER_OUT: { label: 'โอนออก', color: 'text-orange-600 bg-orange-100', icon: ArrowUpRight },
      ADJUST_INCREASE: { label: 'ปรับเพิ่ม', color: 'text-green-600 bg-green-100', icon: TrendingUp },
      ADJUST_DECREASE: { label: 'ปรับลด', color: 'text-red-600 bg-red-100', icon: TrendingDown },
      RETURN: { label: 'คืนยา', color: 'text-purple-600 bg-purple-100', icon: ArrowDownRight },
      DISPOSE: { label: 'ทำลาย', color: 'text-gray-600 bg-gray-100', icon: AlertTriangle },
    };
    return configs[type] || { label: type, color: 'text-gray-600 bg-gray-100', icon: Activity };
  };

  const getWarehouseTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CENTRAL: 'คลังกลาง',
      DEPARTMENT: 'คลังแผนก',
      EMERGENCY: 'คลังฉุกเฉิน',
      CONTROLLED: 'คลังยาควบคุม',
      COLD_STORAGE: 'ห้องเย็น',
      QUARANTINE: 'ห้องกักกัน',
      DISPOSAL: 'ห้องทำลาย',
      RECEIVING: 'ห้องรับของ',
      DISPENSING: 'ห้องจ่ายยา',
    };
    return types[type] || type;
  };

  const getSecurityLevelBadge = (level: string) => {
    const levels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      BASIC: { label: 'พื้นฐาน', variant: 'secondary' },
      STANDARD: { label: 'มาตรฐาน', variant: 'default' },
      HIGH: { label: 'สูง', variant: 'outline' },
      MAXIMUM: { label: 'สูงสุด', variant: 'destructive' },
    };
    const config = levels[level] || { label: level, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !warehouse) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </Button>
          </div>
          
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
            <AlertDescription>
              {error || 'ไม่พบข้อมูลคลัง'}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Button onClick={() => fetchWarehouseDetail(params.id as string)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              ลองใหม่
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </Button>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {warehouse.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  {warehouse.warehouseCode}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {getWarehouseTypeLabel(warehouse.type)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {warehouse.location}
                </span>
                <div className="flex items-center gap-2">
                  {warehouse.isActive ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      ใช้งานได้
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      ปิดใช้งาน
                    </Badge>
                  )}
                  {warehouse.isMaintenance && (
                    <Badge variant="outline" className="gap-1">
                      <Activity className="h-3 w-3" />
                      บำรุงรักษา
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              ส่งออก
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              รีเฟรช
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <Edit className="h-4 w-4" />
                  แก้ไขข้อมูล
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Eye className="h-4 w-4" />
                  ดูประวัติ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Key Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Stock Value */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">มูลค่าสต็อกรวม</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(warehouse.statistics.stockValue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {warehouse.statistics.totalDrugs} รายการยา
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Stock Quantity */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">จำนวนสต็อกรวม</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {warehouse.statistics.totalStock.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">หน่วย</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">สต็อกต่ำ</p>
                  <p className="text-2xl font-bold text-red-600">
                    {warehouse.statistics.lowStockItems}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">รายการ</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ใกล้หมดอายุ</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {warehouse.statistics.expiringItems}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">รายการ</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stock">สต็อก</TabsTrigger>
              <TabsTrigger value="transactions">การเคลื่อนไหว</TabsTrigger>
            </TabsList>

            {/* Stock Tab */}
            <TabsContent value="stock" className="space-y-6">
              <div className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาชื่อยา, รหัสยา..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    กรอง
                  </Button>
                </div>

                {/* Stock Cards Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">รายการสต็อก</CardTitle>
                    <CardDescription>
                      แสดง {warehouse.stockCards?.length || 0} รายการจากทั้งหมด {warehouse._counts.stockCards} รายการ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {warehouse.stockCards && warehouse.stockCards.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>รหัสยา</TableHead>
                            <TableHead>ชื่อยา</TableHead>
                            <TableHead className="text-right">สต็อกปัจจุบัน</TableHead>
                            <TableHead className="text-right">จุดสั่งซื้อ</TableHead>
                            <TableHead className="text-right">มูลค่า</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">อัปเดตล่าสุด</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {warehouse.stockCards
                            .filter((item) =>
                              searchTerm === "" ||
                              item.drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.drug.hospitalDrugCode.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="font-mono text-sm">
                                    {item.drug.hospitalDrugCode}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{item.drug.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {item.drug.strength} {item.drug.dosageForm}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="font-medium">
                                    {item.currentStock.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.drug.unit}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.reorderPoint.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(item.totalValue)}
                                </TableCell>
                                <TableCell>
                                  {item.lowStockAlert ? (
                                    <Badge variant="destructive" className="gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      สต็อกต่ำ
                                    </Badge>
                                  ) : item.currentStock === 0 ? (
                                    <Badge variant="outline" className="gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      หมด
                                    </Badge>
                                  ) : (
                                    <Badge variant="default" className="gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      ปกติ
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="text-sm">
                                    {item.lastUpdated ? formatDateTime(item.lastUpdated) : 'ไม่ระบุ'}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">ยังไม่มีข้อมูลสต็อก</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ประวัติการเคลื่อนไหว</CardTitle>
                  <CardDescription>
                    แสดง {warehouse.recentTransactions?.length || 0} รายการล่าสุดจากทั้งหมด {warehouse._counts.stockTransactions} รายการ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {warehouse.recentTransactions && warehouse.recentTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>วันที่</TableHead>
                          <TableHead>ประเภท</TableHead>
                          <TableHead>ยา</TableHead>
                          <TableHead className="text-right">จำนวน</TableHead>
                          <TableHead className="text-right">มูลค่า</TableHead>
                          <TableHead>ผู้ดำเนินการ</TableHead>
                          <TableHead>อ้างอิง</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {warehouse.recentTransactions.map((transaction) => {
                          const config = getTransactionTypeConfig(transaction.transactionType);
                          const Icon = config.icon;
                          
                          return (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                <div className="text-sm">
                                  {formatDateTime(transaction.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={cn("p-1 rounded", config.color)}>
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <span className="text-sm">{config.label}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm font-medium">
                                    {transaction.drug?.name || 'ไม่ระบุชื่อยา'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {transaction.drug?.hospitalDrugCode || 'ไม่ระบุรหัส'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={cn(
                                  "font-medium",
                                  transaction.quantity > 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {transaction.quantity > 0 ? '+' : ''}{transaction.quantity.toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(transaction.totalCost)}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {transaction.performer ? 
                                    `${transaction.performer.firstName} ${transaction.performer.lastName}` : 
                                    'ไม่ระบุ'
                                  }
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground">
                                  {transaction.reference || transaction.description || '-'}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">ยังไม่มีประวัติการเคลื่อนไหว</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}