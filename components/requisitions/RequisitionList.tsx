// components/requisitions/RequisitionList.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Clock, 
  User, 
  Package, 
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Truck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface RequisitionItem {
  id: string;
  drugCode: string;
  drugName: string;
  requestedQuantity: number;
  approvedQuantity: number;
  receivedQuantity: number;
  unit: string;
  status: string;
  notes?: string;
}

interface Requisition {
  id: string;
  requisitionNumber: string;
  type: 'REGULAR' | 'EMERGENCY' | 'SCHEDULED' | 'RETURN';
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PARTIALLY_FILLED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  sourceWarehouse: {
    id: string;
    name: string;
    warehouseCode: string;
  };
  targetWarehouse: {
    id: string;
    name: string;
    warehouseCode: string;
  };
  requestedBy: {
    firstName: string;
    lastName: string;
    position?: string;
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  requestedDate: string;
  expectedDate?: string | null;
  completedDate?: string | null;
  notes?: string | null;
  totalItems: number;
  completedItems: number;
  items: RequisitionItem[];
}

interface RequisitionListProps {
  warehouseId: string;
  viewType: 'incoming' | 'outgoing'; // incoming = ใบเบิกที่ส่งมาให้คลังนี้, outgoing = ใบเบิกที่คลังนี้ส่งออกไป
  onRequisitionClick: (requisition: Requisition) => void;
}

export default function RequisitionList({ warehouseId, viewType, onRequisitionClick }: RequisitionListProps) {
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<Requisition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequisitions();
  }, [warehouseId, viewType]);

  useEffect(() => {
    filterRequisitions();
  }, [requisitions, searchTerm, statusFilter, priorityFilter]);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/dashboard/requisitions?warehouseId=${warehouseId}&viewType=${viewType}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setRequisitions(data);
      }
    } catch (error) {
      console.error('Error loading requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequisitions();
    setRefreshing(false);
  };

  const filterRequisitions = () => {
    let filtered = [...requisitions];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.requisitionNumber.toLowerCase().includes(searchLower) ||
        req.requestedBy.firstName.toLowerCase().includes(searchLower) ||
        req.requestedBy.lastName.toLowerCase().includes(searchLower) ||
        req.items.some(item => 
          item.drugName.toLowerCase().includes(searchLower) ||
          item.drugCode.toLowerCase().includes(searchLower)
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(req => req.priority === priorityFilter);
    }

    setFilteredRequisitions(filtered);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      DRAFT: { label: "ร่าง", color: "text-gray-600", bgColor: "bg-gray-100", icon: FileText },
      SUBMITTED: { label: "ส่งแล้ว", color: "text-blue-600", bgColor: "bg-blue-100", icon: ArrowUpRight },
      UNDER_REVIEW: { label: "ตรวจสอบ", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
      APPROVED: { label: "อนุมัติ", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
      PARTIALLY_FILLED: { label: "รับบางส่วน", color: "text-orange-600", bgColor: "bg-orange-100", icon: Package },
      COMPLETED: { label: "เสร็จสิ้น", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
      CANCELLED: { label: "ยกเลิก", color: "text-gray-600", bgColor: "bg-gray-100", icon: XCircle },
      REJECTED: { label: "ปฏิเสธ", color: "text-red-600", bgColor: "bg-red-100", icon: XCircle }
    };
    return configs[status as keyof typeof configs] || configs.DRAFT;
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      REGULAR: { label: "ปกติ", color: "text-blue-600" },
      EMERGENCY: { label: "ฉุกเฉิน", color: "text-red-600" },
      SCHEDULED: { label: "ตามกำหนด", color: "text-green-600" },
      RETURN: { label: "คืน", color: "text-purple-600" }
    };
    return configs[type as keyof typeof configs] || configs.REGULAR;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      LOW: { label: "ต่ำ", color: "text-gray-600" },
      NORMAL: { label: "ปกติ", color: "text-blue-600" },
      HIGH: { label: "สูง", color: "text-orange-600" },
      URGENT: { label: "เร่งด่วน", color: "text-red-600" }
    };
    return configs[priority as keyof typeof configs] || configs.NORMAL;
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

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(date));
  };

  const isOverdue = (expectedDate: string | null) => {
    if (!expectedDate) return false;
    return new Date(expectedDate) < new Date();
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {viewType === 'incoming' ? (
                <ArrowDownRight className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-blue-600" />
              )}
              {viewType === 'incoming' ? 'ใบเบิกรับเข้า' : 'ใบเบิกส่งออก'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {viewType === 'incoming' 
                ? 'ใบเบิกที่ส่งมายังคลังนี้' 
                : 'ใบเบิกที่คลังนี้ส่งออกไป'
              }
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            รีเฟรช
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาเลขที่ใบเบิก, ผู้เบิก, ชื่อยา..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="SUBMITTED">ส่งแล้ว</SelectItem>
              <SelectItem value="UNDER_REVIEW">ตรวจสอบ</SelectItem>
              <SelectItem value="APPROVED">อนุมัติ</SelectItem>
              <SelectItem value="PARTIALLY_FILLED">รับบางส่วน</SelectItem>
              <SelectItem value="COMPLETED">เสร็จสิ้น</SelectItem>
              <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
              <SelectItem value="REJECTED">ปฏิเสธ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="ความสำคัญ" />
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

      {/* Requisitions List */}
      <div className="space-y-4">
        {filteredRequisitions.length > 0 ? (
          filteredRequisitions.map((requisition) => {
            const statusConfig = getStatusConfig(requisition.status);
            const typeConfig = getTypeConfig(requisition.type);
            const priorityConfig = getPriorityConfig(requisition.priority);
            const StatusIcon = statusConfig.icon;
            const overdue = isOverdue(requisition.expectedDate ?? null);
            const progress = getProgressPercentage(requisition.completedItems, requisition.totalItems);
            
            return (
              <Card 
                key={requisition.id}
                className={cn(
                  "hover:shadow-md transition-all cursor-pointer",
                  overdue && "border-red-200 bg-red-50/30",
                  requisition.priority === 'URGENT' && "border-red-300 bg-red-50/50"
                )}
                onClick={() => onRequisitionClick(requisition)}
              >
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{requisition.requisitionNumber}</h4>
                          <Badge variant="outline" className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                          {requisition.priority !== 'NORMAL' && (
                            <Badge variant="secondary" className={priorityConfig.color}>
                              {priorityConfig.label}
                            </Badge>
                          )}
                          {overdue && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              เกินกำหนด
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>ผู้เบิก: {requisition.requestedBy.firstName} {requisition.requestedBy.lastName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>วันที่เบิก: {formatDate(requisition.requestedDate)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={cn("gap-1", statusConfig.color, statusConfig.bgColor)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Warehouse Info */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">
                          {viewType === 'incoming' 
                            ? `จาก: ${requisition.sourceWarehouse.name}` 
                            : `ไปยัง: ${requisition.targetWarehouse.name}`
                          }
                        </span>
                      </div>
                      {requisition.expectedDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className={cn(
                            "text-muted-foreground",
                            overdue && "text-red-600 font-medium"
                          )}>
                            กำหนดส่ง: {formatDate(requisition.expectedDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>ความคืบหน้า: {requisition.completedItems}/{requisition.totalItems} รายการ</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all",
                            progress === 100 ? "bg-green-500" : 
                            progress > 0 ? "bg-blue-500" : "bg-gray-300"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">รายการยา ({requisition.items.length} รายการ)</div>
                      <div className="space-y-1">
                        {requisition.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                            <span>{item.drugName}</span>
                            <span>
                              {item.receivedQuantity > 0 && (
                                <span className="text-green-600">{item.receivedQuantity}/</span>
                              )}
                              <span>{item.requestedQuantity} {item.unit}</span>
                            </span>
                          </div>
                        ))}
                        {requisition.items.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            และอีก {requisition.items.length - 3} รายการ...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {requisition.notes && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        <strong>หมายเหตุ:</strong> {requisition.notes}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>สร้างเมื่อ: {formatDateTime(requisition.createdAt)}</span>
                      {requisition.approvedBy && (
                        <span>อนุมัติโดย: {requisition.approvedBy.firstName} {requisition.approvedBy.lastName}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">ไม่พบใบเบิก</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'ไม่พบใบเบิกที่ตรงกับเงื่อนไขการค้นหา'
                  : viewType === 'incoming' 
                    ? 'ยังไม่มีใบเบิกที่ส่งมายังคลังนี้'
                    : 'ยังไม่มีใบเบิกที่คลังนี้ส่งออกไป'
                }
              </p>
              {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
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

      {/* Summary */}
      {filteredRequisitions.length > 0 && (
        <div className="text-sm text-muted-foreground text-center py-4 border-t">
          แสดง {filteredRequisitions.length} จาก {requisitions.length} ใบเบิก
        </div>
      )}
    </div>
  );
}