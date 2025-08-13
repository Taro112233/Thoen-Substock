// app/dashboard/requisitions/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Building,
  Hash,
  Download,
  Printer,
  Edit,
  Trash2,
  Plus,
  Truck,
  PackageCheck,
  Timer,
  CheckCircle2,
  Ban,
  Eye,
  ChevronRight,
  AlertCircle,
  Loader2,
  MessageSquare,
  Activity,
  DollarSign,
  Pill,
  Box,
  ClipboardList,
  FileSpreadsheet,
  ArrowRight,
  ArrowDownRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
interface Drug {
  id: string;
  hospitalDrugCode: string;
  name: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  unit: string;
  packSize: string;
}

interface RequisitionItem {
  id: string;
  drugId: string;
  drug: Drug;
  requestedQuantity: number;
  approvedQuantity?: number;
  deliveredQuantity?: number;
  receivedQuantity?: number;
  minStock?: number;
  currentStock?: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface DeliveryNote {
  id: string;
  deliveryNumber: string;
  deliveryDate: string;
  status: string;
  totalValue: number;
  totalItems: number;
  preparedBy: string;
  deliveredBy?: string;
  receivedBy?: string;
  deliveredAt?: string;
  receivedAt?: string;
  items: any[];
}

interface RequisitionDetail {
  id: string;
  requisitionNumber: string;
  type: 'REGULAR' | 'EMERGENCY' | 'SCHEDULED' | 'RETURN';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: string;
  sourceWarehouse: {
    id: string;
    name: string;
    warehouseCode: string;
    location: string;
  };
  destinationWarehouse: {
    id: string;
    name: string;
    warehouseCode: string;
    location: string;
  };
  department: string;
  purpose: string;
  requestedBy: string;
  requestedById: string;
  requestedDate: string;
  expectedDeliveryDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  deliveryNotes: DeliveryNote[];
  items: RequisitionItem[];
  totalItems: number;
  totalValue: number;
  notes?: string;
  workflow?: any[];
  isSourceWarehouse?: boolean; // true = เป็นคลังต้นทาง, false = เป็นคลังปลายทาง
}

// Status configuration
const statusConfig = {
  DRAFT: { label: 'ร่าง', color: 'secondary', icon: Edit },
  SUBMITTED: { label: 'รอการอนุมัติ', color: 'blue', icon: Send },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'green', icon: CheckCircle },
  PREPARING: { label: 'กำลังเตรียมจัดส่ง', color: 'yellow', icon: PackageCheck },
  IN_TRANSIT: { label: 'กำลังจัดส่ง', color: 'orange', icon: Truck },
  DELIVERED: { label: 'จัดส่งแล้ว', color: 'blue', icon: PackageCheck },
  RECEIVED: { label: 'รับของแล้ว', color: 'green', icon: CheckCircle2 },
  PARTIALLY_RECEIVED: { label: 'รับของบางส่วน', color: 'yellow', icon: PackageCheck },
  CANCELLED: { label: 'ยกเลิก', color: 'destructive', icon: Ban },
  REJECTED: { label: 'ถูกปฏิเสธ', color: 'destructive', icon: XCircle }
};

// Type configuration
const typeConfig = {
  REGULAR: { label: 'ปกติ', prefix: '', color: 'default', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  EMERGENCY: { label: 'ฉุกเฉิน', prefix: 'ฉ', color: 'destructive', bgColor: 'bg-red-50', textColor: 'text-red-700' },
  SCHEDULED: { label: 'นอกเวลา', prefix: 'น', color: 'warning', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
  RETURN: { label: 'คืน', prefix: 'ค', color: 'secondary', bgColor: 'bg-gray-50', textColor: 'text-gray-700' }
};

// Priority configuration
const priorityConfig = {
  LOW: { label: 'ต่ำ', color: 'secondary', icon: ArrowDownRight },
  NORMAL: { label: 'ปกติ', color: 'default', icon: ArrowRight },
  HIGH: { label: 'สูง', color: 'warning', icon: AlertCircle },
  URGENT: { label: 'ด่วน', color: 'destructive', icon: AlertTriangle }
};

export default function RequisitionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [requisition, setRequisition] = useState<RequisitionDetail | null>(null);
  const [activeTab, setActiveTab] = useState('items');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCreateDeliveryDialog, setShowCreateDeliveryDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRequisition();
  }, [id]);

  const loadRequisition = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/requisitions/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRequisition(data);
      }
    } catch (error) {
      console.error('Error loading requisition:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/requisitions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: 'current-user-id', // Get from session
          approvedDate: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        await loadRequisition();
        setShowApprovalDialog(false);
      }
    } catch (error) {
      console.error('Error approving requisition:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/requisitions/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectedBy: 'current-user-id',
          rejectionReason
        })
      });
      
      if (response.ok) {
        await loadRequisition();
        setShowRejectDialog(false);
      }
    } catch (error) {
      console.error('Error rejecting requisition:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/requisitions/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await loadRequisition();
        setShowCancelDialog(false);
      }
    } catch (error) {
      console.error('Error cancelling requisition:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateDeliveryNote = () => {
    router.push(`/dashboard/requisitions/${id}/delivery/create`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRequisitionNumber = () => {
    if (!requisition) return '';
    const typeConf = typeConfig[requisition.type];
    return `${typeConf.prefix}${requisition.requisitionNumber}`;
  };

  const canApprove = () => {
    return requisition?.status === 'SUBMITTED' && !requisition.isSourceWarehouse;
  };

  const canReject = () => {
    return requisition?.status === 'SUBMITTED' && !requisition.isSourceWarehouse;
  };

  const canCancel = () => {
    return ['DRAFT', 'SUBMITTED'].includes(requisition?.status || '') && requisition?.isSourceWarehouse;
  };

  const canCreateDelivery = () => {
    return requisition?.status === 'APPROVED' && !requisition.isSourceWarehouse;
  };

  const canReceiveDelivery = () => {
    return ['DELIVERED', 'IN_TRANSIT'].includes(requisition?.status || '') && requisition?.isSourceWarehouse;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>ไม่พบข้อมูลใบเบิก</AlertTitle>
          <AlertDescription>
            ไม่สามารถโหลดข้อมูลใบเบิกได้ กรุณาลองใหม่อีกครั้ง
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusConf = statusConfig[requisition.status as keyof typeof statusConfig];
  const StatusIcon = statusConf?.icon || FileText;
  const typeConf = typeConfig[requisition.type];
  const priorityConf = priorityConfig[requisition.priority];
  const PriorityIcon = priorityConf.icon;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">ใบเบิกเลขที่ {getRequisitionNumber()}</h1>
              <Badge variant={statusConf?.color as any} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConf?.label}
              </Badge>
              <Badge variant={typeConf.color as any}>
                {typeConf.label}
              </Badge>
              <Badge variant={priorityConf.color as any} className="flex items-center gap-1">
                <PriorityIcon className="h-3 w-3" />
                {priorityConf.label}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              {requisition.department} • {requisition.purpose}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            พิมพ์
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            ดาวน์โหลด
          </Button>
          
          {canApprove() && (
            <Button 
              onClick={() => setShowApprovalDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              อนุมัติใบเบิก
            </Button>
          )}
          
          {canReject() && (
            <Button 
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              ปฏิเสธ
            </Button>
          )}
          
          {canCancel() && (
            <Button 
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              <Ban className="h-4 w-4 mr-2" />
              ยกเลิก
            </Button>
          )}
          
          {canCreateDelivery() && (
            <Button onClick={handleCreateDeliveryNote}>
              <Truck className="h-4 w-4 mr-2" />
              สร้างใบส่งของ
            </Button>
          )}
          
          {canReceiveDelivery() && (
            <Button 
              onClick={() => router.push(`/dashboard/requisitions/${id}/receive`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PackageCheck className="h-4 w-4 mr-2" />
              รับของ
            </Button>
          )}
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">ต้นทาง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium">{requisition.sourceWarehouse.name}</p>
                <p className="text-xs text-gray-500">{requisition.sourceWarehouse.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">ปลายทาง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium">{requisition.destinationWarehouse.name}</p>
                <p className="text-xs text-gray-500">{requisition.destinationWarehouse.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">ผู้ขอเบิก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium">{requisition.requestedBy}</p>
                <p className="text-xs text-gray-500">{formatDate(requisition.requestedDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">มูลค่ารวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xl font-bold">฿{requisition.totalValue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{requisition.totalItems} รายการ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Timeline */}
      {requisition.workflow && requisition.workflow.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ประวัติการดำเนินการ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {requisition.workflow.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      step.status === 'completed' ? "bg-green-100" : "bg-gray-100"
                    )}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.action}</p>
                      <p className="text-sm text-gray-500">
                        {step.actor} • {formatDate(step.timestamp)}
                      </p>
                      {step.notes && (
                        <p className="text-sm text-gray-600 mt-1">{step.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="items">รายการยา</TabsTrigger>
          <TabsTrigger value="delivery">ใบส่งของ</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">หมายเหตุ</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>รายการยาในใบเบิก</CardTitle>
              <CardDescription>
                จำนวน {requisition.items.length} รายการ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ลำดับ</TableHead>
                    <TableHead>รหัสยา</TableHead>
                    <TableHead>รายการ</TableHead>
                    <TableHead>รูปแบบ</TableHead>
                    <TableHead>ความแรง</TableHead>
                    <TableHead>ขนาด</TableHead>
                    <TableHead className="text-right">Min Stock</TableHead>
                    <TableHead className="text-right">คงเหลือ</TableHead>
                    <TableHead className="text-right">จำนวนเบิก</TableHead>
                    <TableHead className="text-right">จำนวนจ่าย</TableHead>
                    <TableHead className="text-right">ราคา/หน่วย</TableHead>
                    <TableHead className="text-right">มูลค่า</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisition.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-mono">{item.drug.hospitalDrugCode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.drug.name}</p>
                          <p className="text-xs text-gray-500">{item.drug.genericName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.drug.dosageForm}</TableCell>
                      <TableCell>{item.drug.strength}</TableCell>
                      <TableCell>{item.drug.packSize}</TableCell>
                      <TableCell className="text-right">{item.minStock || '-'}</TableCell>
                      <TableCell className="text-right">{item.currentStock || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.requestedQuantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.deliveredQuantity ? (
                          <span className={cn(
                            "font-medium",
                            item.deliveredQuantity < item.requestedQuantity ? "text-yellow-600" : "text-green-600"
                          )}>
                            {item.deliveredQuantity} {item.unit}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">฿{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ฿{item.totalPrice.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-end mt-4 pt-4 border-t">
                <div className="space-y-1">
                  <div className="flex justify-between space-x-8">
                    <span className="text-gray-500">รวมทั้งสิ้น:</span>
                    <span className="text-xl font-bold">฿{requisition.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Notes Tab */}
        <TabsContent value="delivery" className="space-y-4">
          {requisition.deliveryNotes.length > 0 ? (
            requisition.deliveryNotes.map((delivery) => (
              <Card key={delivery.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>ใบส่งของเลขที่ {delivery.deliveryNumber}</CardTitle>
                      <CardDescription>
                        วันที่ {formatDate(delivery.deliveryDate)}
                      </CardDescription>
                    </div>
                    <Badge variant={delivery.status === 'RECEIVED' ? 'default' : 'secondary'}>
                      {delivery.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm text-gray-500">ผู้จัดเตรียม</Label>
                      <p>{delivery.preparedBy}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">ผู้ส่ง</Label>
                      <p>{delivery.deliveredBy || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">ผู้รับ</Label>
                      <p>{delivery.receivedBy || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-sm text-gray-500">จำนวนรายการ:</span>
                        <span className="ml-2 font-medium">{delivery.totalItems}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">มูลค่ารวม:</span>
                        <span className="ml-2 font-medium">฿{delivery.totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/dashboard/delivery-notes/${delivery.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      ดูรายละเอียด
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Truck className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">ยังไม่มีใบส่งของ</p>
                {canCreateDelivery() && (
                  <Button className="mt-4" onClick={handleCreateDeliveryNote}>
                    <Plus className="h-4 w-4 mr-2" />
                    สร้างใบส่งของ
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline การดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline items */}
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">สร้างใบเบิก</p>
                    <p className="text-sm text-gray-500">
                      {requisition.requestedBy} • {formatDate(requisition.requestedDate)}
                    </p>
                  </div>
                </div>
                
                {requisition.approvedDate && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">อนุมัติใบเบิก</p>
                      <p className="text-sm text-gray-500">
                        {requisition.approvedBy} • {formatDate(requisition.approvedDate)}
                      </p>
                    </div>
                  </div>
                )}
                
                {requisition.rejectedDate && (
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">ปฏิเสธใบเบิก</p>
                      <p className="text-sm text-gray-500">
                        {requisition.rejectedBy} • {formatDate(requisition.rejectedDate)}
                      </p>
                      {requisition.rejectionReason && (
                        <p className="text-sm text-gray-600 mt-1">
                          เหตุผล: {requisition.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>หมายเหตุและข้อความ</CardTitle>
            </CardHeader>
            <CardContent>
              {requisition.notes ? (
                <div className="prose max-w-none">
                  <p>{requisition.notes}</p>
                </div>
              ) : (
                <p className="text-gray-500">ไม่มีหมายเหตุ</p>
              )}
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <Label>เพิ่มข้อความ</Label>
                <Textarea 
                  placeholder="พิมพ์ข้อความ..."
                  className="min-h-[100px]"
                />
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  บันทึกข้อความ
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการอนุมัติใบเบิก</DialogTitle>
            <DialogDescription>
              คุณต้องการอนุมัติใบเบิกเลขที่ {getRequisitionNumber()} ใช่หรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              อนุมัติ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธใบเบิก</DialogTitle>
            <DialogDescription>
              กรุณาระบุเหตุผลในการปฏิเสธใบเบิกเลขที่ {getRequisitionNumber()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="เหตุผลในการปฏิเสธ..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              ยกเลิก
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={processing || !rejectionReason}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              ปฏิเสธ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยกเลิกใบเบิก</DialogTitle>
            <DialogDescription>
              คุณต้องการยกเลิกใบเบิกเลขที่ {getRequisitionNumber()} ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              ไม่
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              ยกเลิกใบเบิก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}