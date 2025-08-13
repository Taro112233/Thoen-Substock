// app/dashboard/warehouses/[id]/page.tsx
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

// Import new components
import RequisitionList from "@/components/requisitions/RequisitionList";
import SmartReceivingWidget from "@/components/receiving/SmartReceivingWidget";

// Types - แก้ไขตาม schema
interface StockItem {
  id: string;
  drugId: string;
  drug: {
    hospitalDrugCode: string;
    name: string;
    genericName: string | null;
    strength: string | null;
    unit: string;
    dosageForm: string;
  };
  currentStock: number;
  minStock: number | null;
  maxStock: number | null;
  reorderPoint: number;
  reservedStock: number; // แก้ไขจาก reservedQty
  averageCost: number;
  totalValue: number;
  lowStockAlert: boolean;
  batches: Array<{
    id: string;
    batchNumber: string;
    expiryDate: string;
    currentQty: number;
  }>;
}

interface Transaction {
  id: string;
  transactionType: string;
  quantity: number;
  drug: {
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  referenceDocument?: string | null;
  notes?: string | null;
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
    phoneNumber?: string | null; // แก้ไขจาก phone
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
      const response = await fetch(`/api/dashboard/warehouses/${id}`);
      if (!response.ok) throw new Error("Failed to fetch warehouse data");
      
      const data = await response.json();
      setWarehouse(data);
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

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(date));
  };

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date));
  };

  const getTransactionTypeConfig = (type: string) => {
    const configs: Record<string, any> = {
      RECEIVE: { label: "รับเข้า", color: "text-green-600", icon: ArrowDownRight },
      DISPENSE: { label: "จ่ายออก", color: "text-blue-600", icon: ArrowUpRight },
      TRANSFER_OUT: { label: "โอนออก", color: "text-orange-600", icon: ArrowUpRight },
      TRANSFER_IN: { label: "โอนเข้า", color: "text-teal-600", icon: ArrowDownRight },
      ADJUST_INCREASE: { label: "ปรับเพิ่ม", color: "text-green-600", icon: TrendingUp },
      ADJUST_DECREASE: { label: "ปรับลด", color: "text-red-600", icon: TrendingDown },
      RETURN: { label: "รับคืน", color: "text-purple-600", icon: RefreshCw },
      DISPOSE: { label: "ทำลาย", color: "text-gray-600", icon: AlertTriangle }
    };
    return configs[type] || { label: type, color: "text-gray-600", icon: Activity };
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryBadgeVariant = (days: number): "destructive" | "secondary" | "outline" | "default" => {
    if (days <= 0) return "destructive";
    if (days <= 30) return "destructive";
    if (days <= 90) return "secondary";
    if (days <= 180) return "secondary";
    return "outline";
  };

  const filteredStockItems = warehouse?.stockCards.filter(item =>
    item.drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.drug.hospitalDrugCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.drug.genericName && item.drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription>{error || "ไม่พบข้อมูลคลังยา"}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/warehouses")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับไปหน้าภาพรวม
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/warehouses")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{warehouse.warehouseCode}</Badge>
              <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                {warehouse.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
              </Badge>
              {warehouse.isMaintenance && (
                <Badge variant="secondary">บำรุงรักษา</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            ดาวน์โหลดรายงาน
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            แก้ไขข้อมูล
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>การดำเนินการ</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                ดูประวัติ
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="h-4 w-4 mr-2" />
                นับสต็อก
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="h-4 w-4 mr-2" />
                ตั้งค่าความปลอดภัย
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">มูลค่าสต็อก</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(warehouse.statistics.stockValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                จาก {formatNumber(warehouse.statistics.totalStock)} ชิ้น
              </p>
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
              <CardTitle className="text-sm font-medium">รายการยา</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{warehouse.statistics.totalDrugs}</div>
              <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                <span className="text-red-600">ขาด {warehouse.statistics.outOfStockItems}</span>
                <span className="text-yellow-600">ต่ำ {warehouse.statistics.lowStockItems}</span>
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
              <CardTitle className="text-sm font-medium">อัตราหมุนเวียน</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {warehouse.statistics.turnoverRate.toFixed(1)}x
              </div>
              <p className="text-xs text-muted-foreground">
                เฉลี่ย {warehouse.statistics.daysOfStock} วัน
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">ใกล้หมดอายุ</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {warehouse.statistics.expiringItems}
              </div>
              <p className="text-xs text-muted-foreground">
                ภายใน 90 วัน
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">ใบเบิกรอ</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {warehouse.requisitionSummary?.pending || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                รวม {(warehouse.requisitionSummary?.incoming || 0) + (warehouse.requisitionSummary?.outgoing || 0)} ใบ
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                ภาพรวม
              </TabsTrigger>
              <TabsTrigger 
                value="stock" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                สต็อกสินค้า
              </TabsTrigger>
              <TabsTrigger 
                value="requisitions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                ใบเบิก & รับสินค้า
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                การเคลื่อนไหว
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                การวิเคราะห์
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                ข้อมูลคลัง
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">สต็อกตามหมวดหมู่</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {warehouse.stockByCategory.length > 0 ? (
                        warehouse.stockByCategory.map((category) => (
                          <div key={category.category} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{category.category}</span>
                              <span className="font-medium">{formatCurrency(category.value)}</span>
                            </div>
                            <Progress value={category.percentage} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{category.count} รายการ</span>
                              <span>{category.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลหมวดหมู่</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Expiry Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">การวิเคราะห์วันหมดอายุ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {warehouse.expiryAnalysis.length > 0 ? (
                        warehouse.expiryAnalysis.map((range) => (
                          <div key={range.range} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-sm font-medium">{range.range}</p>
                              <p className="text-xs text-muted-foreground">{range.count} รายการ</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{formatCurrency(range.value)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลการวิเคราะห์</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">การเคลื่อนไหวล่าสุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {warehouse.recentTransactions.slice(0, 5).length > 0 ? (
                      warehouse.recentTransactions.slice(0, 5).map((transaction) => {
                        const config = getTransactionTypeConfig(transaction.transactionType);
                        const Icon = config.icon;
                        
                        return (
                          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-full bg-muted", config.color)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{transaction.drug.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {config.label} • {Math.abs(transaction.quantity)} ชิ้น
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(transaction.createdAt)}
                              </p>
                              <p className="text-xs">
                                โดย {transaction.user.firstName}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">ยังไม่มีการเคลื่อนไหว</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stock Tab */}
            <TabsContent value="stock" className="p-6">
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
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {/* Stock Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>รหัสยา</TableHead>
                        <TableHead>ชื่อยา</TableHead>
                        <TableHead className="text-right">คงเหลือ</TableHead>
                        <TableHead className="text-right">จองแล้ว</TableHead>
                        <TableHead className="text-right">พร้อมใช้</TableHead>
                        <TableHead className="text-right">มูลค่า</TableHead>
                        <TableHead>วันหมดอายุ</TableHead>
                        <TableHead>สถานะ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStockItems.length > 0 ? (
                        filteredStockItems.map((item) => {
                          const available = item.currentStock - item.reservedStock;
                          const stockPercentage = item.maxStock ? (item.currentStock / item.maxStock) * 100 : 0;
                          const nearestExpiry = item.batches.length > 0 
                            ? Math.min(...item.batches.map(b => getDaysUntilExpiry(b.expiryDate)))
                            : null;
                          
                          return (
                            <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                              <TableCell className="font-medium">
                                {item.drug.hospitalDrugCode}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.drug.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.drug.genericName || ""} • {item.drug.strength || ""} {item.drug.unit}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(item.currentStock)}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.reservedStock > 0 && (
                                  <span className="text-yellow-600">
                                    {formatNumber(item.reservedStock)}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatNumber(available)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.totalValue)}
                              </TableCell>
                              <TableCell>
                                {nearestExpiry !== null && (
                                  <Badge variant={getExpiryBadgeVariant(nearestExpiry)}>
                                    {nearestExpiry > 0 ? `${nearestExpiry} วัน` : "หมดอายุแล้ว"}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {item.lowStockAlert && (
                                  <Badge variant="secondary" className="gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    สต็อกต่ำ
                                  </Badge>
                                )}
                                {item.currentStock === 0 && (
                                  <Badge variant="destructive">
                                    หมดสต็อก
                                  </Badge>
                                )}
                                {stockPercentage > 90 && (
                                  <Badge variant="secondary">
                                    สต็อกเต็ม
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <p className="text-muted-foreground">ไม่พบข้อมูลสต็อก</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* NEW: Requisitions & Receiving Tab */}
            <TabsContent value="requisitions" className="space-y-6">
              <div>
                {/* Tabs สำหรับแยกใบเบิกเข้า/ออก และระบบรับสินค้า */}
                <Tabs defaultValue="incoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="incoming">
                      ใบเบิกรับเข้า ({warehouse.requisitionSummary?.incoming || 0})
                    </TabsTrigger>
                    <TabsTrigger value="outgoing">
                      ใบเบิกส่งออก ({warehouse.requisitionSummary?.outgoing || 0})
                    </TabsTrigger>
                    <TabsTrigger value="receiving">
                      รับสินค้า
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* ใบเบิกรับเข้า */}
                  <TabsContent value="incoming">
                    <RequisitionList 
                      warehouseId={warehouse.id}
                      viewType="incoming"
                      onRequisitionClick={(requisition) => {
                        router.push(`/dashboard/requisitions/${requisition.id}`);
                      }}
                    />
                  </TabsContent>
                  
                  {/* ใบเบิกส่งออก */}
                  <TabsContent value="outgoing">
                    <RequisitionList 
                      warehouseId={warehouse.id}
                      viewType="outgoing"
                      onRequisitionClick={(requisition) => {
                        router.push(`/dashboard/requisitions/${requisition.id}`);
                      }}
                    />
                  </TabsContent>
                  
                  {/* ระบบรับสินค้า Smart Search */}
                  <TabsContent value="receiving">
                    <SmartReceivingWidget warehouseId={warehouse.id} />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="p-6">
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>วันที่/เวลา</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>ยา</TableHead>
                      <TableHead className="text-right">จำนวน</TableHead>
                      <TableHead>เอกสารอ้างอิง</TableHead>
                      <TableHead>ผู้ทำรายการ</TableHead>
                      <TableHead>หมายเหตุ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouse.recentTransactions.length > 0 ? (
                      warehouse.recentTransactions.map((transaction) => {
                        const config = getTransactionTypeConfig(transaction.transactionType);
                        const Icon = config.icon;
                        
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon className={cn("h-4 w-4", config.color)} />
                                <span className={config.color}>{config.label}</span>
                              </div>
                            </TableCell>
                            <TableCell>{transaction.drug.name}</TableCell>
                            <TableCell className="text-right font-medium">
                              {transaction.quantity > 0 ? "+" : ""}{formatNumber(transaction.quantity)}
                            </TableCell>
                            <TableCell>{transaction.referenceDocument || "-"}</TableCell>
                            <TableCell>
                              {transaction.user.firstName} {transaction.user.lastName}
                            </TableCell>
                            <TableCell>{transaction.notes || "-"}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-muted-foreground">ยังไม่มีการเคลื่อนไหว</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">อัตราการใช้พื้นที่</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {warehouse.statistics.utilizationRate.toFixed(1)}%
                    </div>
                    <Progress value={warehouse.statistics.utilizationRate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">ความแม่นยำสต็อก</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {warehouse.statistics.accuracyRate.toFixed(1)}%
                    </div>
                    <Progress value={warehouse.statistics.accuracyRate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">การใช้เฉลี่ยต่อวัน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(warehouse.statistics.avgDailyUsage)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">ชิ้น/วัน</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">ข้อมูลพื้นฐาน</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>ชื่อคลัง</Label>
                      <p className="text-sm">{warehouse.name}</p>
                    </div>
                    <div>
                      <Label>รหัสคลัง</Label>
                      <p className="text-sm">{warehouse.warehouseCode}</p>
                    </div>
                    <div>
                      <Label>ประเภท</Label>
                      <p className="text-sm">{warehouse.type}</p>
                    </div>
                    <div>
                      <Label>ที่ตั้ง</Label>
                      <p className="text-sm">{warehouse.location}</p>
                    </div>
                    {warehouse.area && (
                      <div>
                        <Label>พื้นที่</Label>
                        <p className="text-sm">{formatNumber(warehouse.area)} ตร.ม.</p>
                      </div>
                    )}
                    {warehouse.capacity && (
                      <div>
                        <Label>ความจุ</Label>
                        <p className="text-sm">{formatNumber(warehouse.capacity)} หน่วย</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Environmental Control */}
                {(warehouse.hasTemperatureControl || warehouse.hasHumidityControl) && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">การควบคุมสิ่งแวดล้อม</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {warehouse.hasTemperatureControl && warehouse.minTemperature && warehouse.maxTemperature && (
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">
                              อุณหภูมิ: {warehouse.minTemperature}-{warehouse.maxTemperature}°C
                            </span>
                          </div>
                        )}
                        {warehouse.hasHumidityControl && warehouse.minHumidity && warehouse.maxHumidity && (
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-cyan-600" />
                            <span className="text-sm">
                              ความชื้น: {warehouse.minHumidity}-{warehouse.maxHumidity}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Security */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">ความปลอดภัย</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>ระดับความปลอดภัย</Label>
                      <p className="text-sm">{warehouse.securityLevel}</p>
                    </div>
                    <div className="space-y-2">
                      {warehouse.accessControl && (
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          ควบคุมการเข้าถึง
                        </Badge>
                      )}
                      {warehouse.cctv && (
                        <Badge variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          กล้องวงจรปิด
                        </Badge>
                      )}
                      {warehouse.alarm && (
                        <Badge variant="outline" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          ระบบเตือนภัย
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Manager */}
                {warehouse.manager && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">ผู้ดูแล</h3>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {warehouse.manager.firstName} {warehouse.manager.lastName}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {warehouse.manager.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {warehouse.manager.email}
                            </div>
                          )}
                          {warehouse.manager.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {warehouse.manager.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}