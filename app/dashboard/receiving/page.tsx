// app/dashboard/receiving/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  Scan,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Building,
  Hash,
  Truck,
  PackageCheck,
  Timer,
  Info,
  ArrowRight,
  Loader2,
  Check,
  X,
  Eye,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ClipboardCheck,
  Database,
  TrendingUp,
  Activity,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface DrugInRequisition {
  id: string;
  requisitionId: string;
  requisitionNumber: string;
  requisitionType: string;
  deliveryNoteId?: string;
  deliveryNoteNumber?: string;
  drugId: string;
  drugCode: string;
  drugName: string;
  dosageForm: string;
  strength: string;
  packSize: string;
  requestedQuantity: number;
  deliveredQuantity: number;
  receivedQuantity?: number;
  pendingQuantity: number;
  unit: string;
  batchNumber?: string;
  expiryDate?: string;
  manufacturer?: string;
  unitPrice: number;
  totalValue: number;
  sourceWarehouse: string;
  destinationWarehouse: string;
  status: string;
  canReceive: boolean;
}

interface ReceivingSession {
  id: string;
  warehouseId: string;
  startedAt: string;
  completedAt?: string;
  receivedBy: string;
  totalItems: number;
  totalValue: number;
  items: ReceivingItem[];
}

interface ReceivingItem {
  id: string;
  drugId: string;
  drugCode: string;
  drugName: string;
  requisitionId: string;
  requisitionNumber: string;
  deliveryNoteId?: string;
  deliveryNoteNumber?: string;
  quantityReceived: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  manufacturer: string;
  condition: 'GOOD' | 'DAMAGED' | 'EXPIRED';
  notes?: string;
  receivedAt: string;
  addedToStock: boolean;
}

export default function SmartReceivingSystem() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DrugInRequisition[]>([]);
  const [selectedItem, setSelectedItem] = useState<DrugInRequisition | null>(null);
  const [receivingSession, setReceivingSession] = useState<ReceivingSession | null>(null);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  
  // Form states for receiving
  const [receiveQuantity, setReceiveQuantity] = useState<number>(0);
  const [receiveBatch, setReceiveBatch] = useState('');
  const [receiveExpiry, setReceiveExpiry] = useState('');
  const [receiveManufacturer, setReceiveManufacturer] = useState('');
  const [receiveCondition, setReceiveCondition] = useState<'GOOD' | 'DAMAGED' | 'EXPIRED'>('GOOD');
  const [receiveNotes, setReceiveNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Statistics
  const [todayStats, setTodayStats] = useState({
    totalReceived: 0,
    totalValue: 0,
    pendingRequisitions: 0,
    completedRequisitions: 0
  });

  useEffect(() => {
    initializeSession();
    loadTodayStats();
  }, []);

  const initializeSession = async () => {
    // Check if there's an existing session or create new one
    const sessionData = localStorage.getItem('receivingSession');
    if (sessionData) {
      setReceivingSession(JSON.parse(sessionData));
    } else {
      const newSession: ReceivingSession = {
        id: generateId(),
        warehouseId: 'current-warehouse-id', // Get from context
        startedAt: new Date().toISOString(),
        receivedBy: 'current-user', // Get from auth
        totalItems: 0,
        totalValue: 0,
        items: []
      };
      setReceivingSession(newSession);
      localStorage.setItem('receivingSession', JSON.stringify(newSession));
    }
  };

  const loadTodayStats = async () => {
    try {
      const response = await fetch('/api/receiving/stats/today');
      if (response.ok) {
        const data = await response.json();
        setTodayStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const generateId = () => {
    return `RCV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearching(true);
      setSearchResults([]);
      
      // Search for drug in pending requisitions and delivery notes
      const response = await fetch(`/api/receiving/search?q=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        
        if (data.length === 0) {
          // No results found
          setSelectedItem(null);
        } else if (data.length === 1) {
          // Auto-select if only one result
          setSelectedItem(data[0]);
          setShowReceiveDialog(true);
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleReceiveItem = async () => {
    if (!selectedItem || !receivingSession) return;
    
    try {
      setProcessing(true);
      
      // Create receiving item
      const receivingItem: ReceivingItem = {
        id: generateId(),
        drugId: selectedItem.drugId,
        drugCode: selectedItem.drugCode,
        drugName: selectedItem.drugName,
        requisitionId: selectedItem.requisitionId,
        requisitionNumber: selectedItem.requisitionNumber,
        deliveryNoteId: selectedItem.deliveryNoteId,
        deliveryNoteNumber: selectedItem.deliveryNoteNumber,
        quantityReceived: receiveQuantity,
        unit: selectedItem.unit,
        batchNumber: receiveBatch,
        expiryDate: receiveExpiry,
        manufacturer: receiveManufacturer,
        condition: receiveCondition,
        notes: receiveNotes,
        receivedAt: new Date().toISOString(),
        addedToStock: false
      };
      
      // Add to session
      const updatedSession = {
        ...receivingSession,
        items: [...receivingSession.items, receivingItem],
        totalItems: receivingSession.totalItems + 1,
        totalValue: receivingSession.totalValue + (receiveQuantity * selectedItem.unitPrice)
      };
      
      setReceivingSession(updatedSession);
      localStorage.setItem('receivingSession', JSON.stringify(updatedSession));
      
      // Update backend
      await fetch('/api/receiving/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receivingItem)
      });
      
      // Check if this completes the requisition item
      const remainingQty = selectedItem.deliveredQuantity - receiveQuantity;
      if (remainingQty > 0) {
        // Create auto requisition for remaining quantity
        await createAutoRequisition(selectedItem, remainingQty);
      }
      
      // Reset form
      resetReceiveForm();
      setShowReceiveDialog(false);
      setSelectedItem(null);
      setSearchTerm('');
      setSearchResults([]);
      
      // Focus back to search
      searchInputRef.current?.focus();
      
    } catch (error) {
      console.error('Error receiving item:', error);
    } finally {
      setProcessing(false);
    }
  };

  const createAutoRequisition = async (item: DrugInRequisition, remainingQty: number) => {
    // Create emergency requisition for remaining quantity
    const autoRequisition = {
      type: 'EMERGENCY',
      priority: 'HIGH',
      sourceWarehouseId: item.sourceWarehouse,
      destinationWarehouseId: item.destinationWarehouse,
      originalRequisitionId: item.requisitionId,
      items: [{
        drugId: item.drugId,
        requestedQuantity: remainingQty,
        unit: item.unit,
        notes: `ส่งไม่ครบจากใบเบิก ${item.requisitionNumber}`
      }],
      purpose: `เบิกเพิ่มเติมจากใบเบิกเดิม ${item.requisitionNumber} (ได้รับไม่ครบ)`,
      autoGenerated: true
    };
    
    await fetch('/api/requisitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(autoRequisition)
    });
  };

  const resetReceiveForm = () => {
    setReceiveQuantity(0);
    setReceiveBatch('');
    setReceiveExpiry('');
    setReceiveManufacturer('');
    setReceiveCondition('GOOD');
    setReceiveNotes('');
  };

  const handleCompleteSession = async () => {
    if (!receivingSession || receivingSession.items.length === 0) return;
    
    try {
      setProcessing(true);
      
      // Add all items to stock
      for (const item of receivingSession.items) {
        if (!item.addedToStock) {
          await addToStock(item);
        }
      }
      
      // Complete session
      const completedSession = {
        ...receivingSession,
        completedAt: new Date().toISOString()
      };
      
      await fetch('/api/receiving/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completedSession)
      });
      
      // Clear session
      localStorage.removeItem('receivingSession');
      setReceivingSession(null);
      initializeSession();
      
      setShowSummaryDialog(false);
      
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setProcessing(false);
    }
  };

  const addToStock = async (item: ReceivingItem) => {
    // Create stock transaction
    const stockTransaction = {
      type: 'RECEIVE',
      drugId: item.drugId,
      quantity: item.quantityReceived,
      unit: item.unit,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      manufacturer: item.manufacturer,
      referenceType: 'REQUISITION',
      referenceId: item.requisitionId,
      notes: item.notes
    };
    
    await fetch('/api/stock/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockTransaction)
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'GOOD':
        return <Badge className="bg-green-100 text-green-700">สภาพดี</Badge>;
      case 'DAMAGED':
        return <Badge className="bg-yellow-100 text-yellow-700">ชำรุด</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-700">หมดอายุ</Badge>;
      default:
        return <Badge>{condition}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ระบบรับสินค้าอัจฉริยะ</h1>
          <p className="text-gray-600 mt-1">
            ค้นหาและรับสินค้าจากใบเบิกและใบส่งของ
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {receivingSession && receivingSession.items.length > 0 && (
            <Button
              onClick={() => setShowSummaryDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              สรุปการรับของ ({receivingSession.items.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">รับวันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.totalReceived}</div>
            <p className="text-xs text-gray-500 mt-1">รายการ</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">มูลค่ารวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{todayStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">บาท</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">รอรับของ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{todayStats.pendingRequisitions}</div>
            <p className="text-xs text-gray-500 mt-1">ใบเบิก</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">เสร็จสิ้น</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayStats.completedRequisitions}</div>
            <p className="text-xs text-gray-500 mt-1">ใบเบิก</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">ค้นหาสินค้า</TabsTrigger>
          <TabsTrigger value="pending">รอรับของ</TabsTrigger>
          <TabsTrigger value="history">ประวัติ</TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ค้นหาสินค้าเพื่อรับเข้าคลัง</CardTitle>
              <CardDescription>
                พิมพ์รหัสยา, ชื่อยา, เลขที่ใบเบิก หรือสแกนบาร์โค้ด
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    placeholder="ค้นหา... (รหัสยา, ชื่อยา, เลขที่ใบเบิก, บาร์โค้ด)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 text-lg"
                    autoFocus
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching}>
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  ค้นหา
                </Button>
                <Button variant="outline">
                  <Scan className="h-4 w-4 mr-2" />
                  สแกน
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="font-medium">พบ {searchResults.length} รายการ</h3>
                  <div className="space-y-2">
                    {searchResults.map((item) => (
                      <Card
                        key={`${item.requisitionId}-${item.drugId}`}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedItem?.id === item.id && "ring-2 ring-blue-500"
                        )}
                        onClick={() => {
                          setSelectedItem(item);
                          setReceiveQuantity(item.pendingQuantity);
                          setShowReceiveDialog(true);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{item.drugCode}</Badge>
                                <span className="font-medium">{item.drugName}</span>
                                <span className="text-sm text-gray-500">
                                  {item.dosageForm} {item.strength}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>ใบเบิก: {item.requisitionNumber}</span>
                                {item.deliveryNoteNumber && (
                                  <span>ใบส่ง: {item.deliveryNoteNumber}</span>
                                )}
                                <span>จาก: {item.sourceWarehouse}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-sm">
                                  ส่งมา: <strong>{item.deliveredQuantity} {item.unit}</strong>
                                </span>
                                <span className="text-sm">
                                  รอรับ: <strong className="text-yellow-600">{item.pendingQuantity} {item.unit}</strong>
                                </span>
                                {item.receivedQuantity && item.receivedQuantity > 0 && (
                                  <span className="text-sm">
                                    รับแล้ว: <strong className="text-green-600">{item.receivedQuantity} {item.unit}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                                setReceiveQuantity(item.pendingQuantity);
                                setShowReceiveDialog(true);
                              }}
                            >
                              <PackageCheck className="h-4 w-4 mr-2" />
                              รับของ
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {searching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}

              {!searching && searchTerm && searchResults.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>ไม่พบสินค้า</AlertTitle>
                  <AlertDescription>
                    ไม่พบสินค้าที่ค้นหาในใบเบิกหรือใบส่งของที่รอรับ
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Current Session Items */}
          {receivingSession && receivingSession.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>รายการที่รับแล้วในรอบนี้</CardTitle>
                <CardDescription>
                  {receivingSession.items.length} รายการ มูลค่า ฿{receivingSession.totalValue.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสยา</TableHead>
                      <TableHead>ชื่อยา</TableHead>
                      <TableHead>ใบเบิก</TableHead>
                      <TableHead>จำนวน</TableHead>
                      <TableHead>Lot/Batch</TableHead>
                      <TableHead>วันหมดอายุ</TableHead>
                      <TableHead>สภาพ</TableHead>
                      <TableHead>เวลา</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivingSession.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.drugCode}</TableCell>
                        <TableCell>{item.drugName}</TableCell>
                        <TableCell>{item.requisitionNumber}</TableCell>
                        <TableCell>{item.quantityReceived} {item.unit}</TableCell>
                        <TableCell>{item.batchNumber}</TableCell>
                        <TableCell>{formatDate(item.expiryDate)}</TableCell>
                        <TableCell>{getConditionBadge(item.condition)}</TableCell>
                        <TableCell>{formatDate(item.receivedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>รายการที่รอรับของ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">แสดงรายการใบเบิกและใบส่งของที่รอรับ</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการรับของ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">แสดงประวัติการรับของย้อนหลัง</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Receive Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>รับสินค้าเข้าคลัง</DialogTitle>
            <DialogDescription>
              {selectedItem && (
                <div className="space-y-2 mt-2">
                  <div>
                    <Badge variant="outline" className="mr-2">{selectedItem.drugCode}</Badge>
                    <span className="font-medium">{selectedItem.drugName}</span>
                  </div>
                  <div className="text-sm">
                    ใบเบิก: {selectedItem.requisitionNumber} | 
                    จากคลัง: {selectedItem.sourceWarehouse}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>จำนวนที่รับ *</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setReceiveQuantity(Math.max(0, receiveQuantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={receiveQuantity}
                    onChange={(e) => setReceiveQuantity(parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setReceiveQuantity(receiveQuantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500">
                    {selectedItem?.unit}
                  </span>
                </div>
                {selectedItem && receiveQuantity < selectedItem.pendingQuantity && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      รับไม่ครบ: ระบบจะสร้างใบเบิกฉุกเฉินสำหรับจำนวนที่เหลือ {selectedItem.pendingQuantity - receiveQuantity} {selectedItem.unit}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div>
                <Label>Lot/Batch Number *</Label>
                <Input
                  value={receiveBatch}
                  onChange={(e) => setReceiveBatch(e.target.value)}
                  placeholder="เช่น LOT240101"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>วันหมดอายุ *</Label>
                <Input
                  type="date"
                  value={receiveExpiry}
                  onChange={(e) => setReceiveExpiry(e.target.value)}
                />
              </div>
              
              <div>
                <Label>ผู้ผลิต/บริษัท *</Label>
                <Input
                  value={receiveManufacturer}
                  onChange={(e) => setReceiveManufacturer(e.target.value)}
                  placeholder="ชื่อบริษัทผู้ผลิต"
                />
              </div>
            </div>
            
            <div>
              <Label>สภาพสินค้า</Label>
              <div className="flex space-x-2 mt-2">
                <Button
                  variant={receiveCondition === 'GOOD' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReceiveCondition('GOOD')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  สภาพดี
                </Button>
                <Button
                  variant={receiveCondition === 'DAMAGED' ? 'warning' : 'outline'}
                  size="sm"
                  onClick={() => setReceiveCondition('DAMAGED')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  ชำรุด
                </Button>
                <Button
                  variant={receiveCondition === 'EXPIRED' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setReceiveCondition('EXPIRED')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  หมดอายุ
                </Button>
              </div>
            </div>
            
            <div>
              <Label>หมายเหตุ</Label>
              <Textarea
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
                placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>
              ยกเลิก
            </Button>
            <Button 
              onClick={handleReceiveItem}
              disabled={processing || !receiveQuantity || !receiveBatch || !receiveExpiry || !receiveManufacturer}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              รับสินค้า
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>สรุปการรับของ</DialogTitle>
            <DialogDescription>
              ตรวจสอบรายการที่รับแล้วก่อนบันทึกเข้าระบบ
            </DialogDescription>
          </DialogHeader>
          
          {receivingSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">จำนวนรายการ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{receivingSession.items.length}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">มูลค่ารวม</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">฿{receivingSession.totalValue.toLocaleString()}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">ผู้รับของ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{receivingSession.receivedBy}</p>
                  </CardContent>
                </Card>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">ลำดับ</TableHead>
                    <TableHead>รหัสยา</TableHead>
                    <TableHead>ชื่อยา</TableHead>
                    <TableHead>จำนวน</TableHead>
                    <TableHead>Lot/Batch</TableHead>
                    <TableHead>หมดอายุ</TableHead>
                    <TableHead>สภาพ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivingSession.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>{item.drugCode}</TableCell>
                      <TableCell>{item.drugName}</TableCell>
                      <TableCell>{item.quantityReceived} {item.unit}</TableCell>
                      <TableCell>{item.batchNumber}</TableCell>
                      <TableCell>{formatDate(item.expiryDate)}</TableCell>
                      <TableCell>{getConditionBadge(item.condition)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSummaryDialog(false)}>
              กลับ
            </Button>
            <Button 
              onClick={handleCompleteSession}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              บันทึกและเพิ่มเข้าสต็อก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}