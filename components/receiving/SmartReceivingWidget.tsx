// components/receiving/SmartReceivingWidget.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Scan, 
  Package, 
  PackageCheck,
  Loader2,
  AlertCircle,
  Clock,
  User,
  FileText,
  CheckCircle2,
  Truck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ReceivingItem {
  id: string;
  drugCode: string;
  drugName: string;
  unit: string;
  pendingQuantity: number;
  receivedQuantity: number;
  requisitionId: string;
  requisitionNumber: string;
  sourceWarehouse: string;
  targetWarehouse: string;
  requestedBy: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  dueDate: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

interface SmartReceivingWidgetProps {
  warehouseId: string;
}

export default function SmartReceivingWidget({ warehouseId }: SmartReceivingWidgetProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ReceivingItem[]>([]);
  const [quickStats, setQuickStats] = useState({
    pendingToday: 0,
    overdue: 0,
    receivedToday: 0
  });

  // Load quick stats on mount
  useEffect(() => {
    loadQuickStats();
  }, [warehouseId]);

  const loadQuickStats = async () => {
    try {
      const response = await fetch(`/api/receiving/stats?warehouseId=${warehouseId}`);
      if (response.ok) {
        const stats = await response.json();
        setQuickStats(stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearching(true);
      setSearchResults([]);
      
      const response = await fetch(
        `/api/receiving/search?q=${encodeURIComponent(searchTerm)}&warehouseId=${warehouseId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleQuickReceive = (item: ReceivingItem) => {
    // Navigate to receive page with pre-filled data
    const params = new URLSearchParams({
      item: item.id,
      requisition: item.requisitionId,
      drug: item.drugCode,
      quantity: item.pendingQuantity.toString(),
      batch: item.batchNumber || '',
      expiry: item.expiryDate || ''
    });
    
    window.location.href = `/dashboard/receiving?${params.toString()}`;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      LOW: { label: "ต่ำ", color: "text-gray-600", bgColor: "bg-gray-100" },
      NORMAL: { label: "ปกติ", color: "text-blue-600", bgColor: "bg-blue-100" },
      HIGH: { label: "สูง", color: "text-orange-600", bgColor: "bg-orange-100" },
      URGENT: { label: "เร่งด่วน", color: "text-red-600", bgColor: "bg-red-100" }
    };
    return configs[priority as keyof typeof configs] || configs.NORMAL;
  };

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat("th-TH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(date));
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Quick Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5" />
            ค้นหาสินค้าเพื่อรับเข้าคลัง
          </CardTitle>
          <CardDescription>
            พิมพ์รหัสยา, ชื่อยา, เลขที่ใบเบิก หรือสแกนบาร์โค้ดเพื่อรับสินค้าเข้าคลัง
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="ค้นหา... (รหัสยา, ชื่อยา, เลขที่ใบเบิก)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 text-lg"
                autoFocus
              />
            </div>
            <Button onClick={handleSearch} disabled={searching || !searchTerm.trim()}>
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
              <div className="flex items-center justify-between">
                <h3 className="font-medium">พบ {searchResults.length} รายการ</h3>
                <Button variant="outline" size="sm" onClick={() => setSearchResults([])}>
                  ล้างผลลัพธ์
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((item) => {
                  const priorityConfig = getPriorityConfig(item.priority);
                  const overdue = isOverdue(item.dueDate);
                  
                  return (
                    <Card key={item.id} className={cn(
                      "hover:shadow-md transition-all",
                      overdue && "border-red-200 bg-red-50/50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            {/* Drug Info */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="font-mono">
                                {item.drugCode}
                              </Badge>
                              <span className="font-medium">{item.drugName}</span>
                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs", priorityConfig.color, priorityConfig.bgColor)}
                              >
                                {priorityConfig.label}
                              </Badge>
                              {overdue && (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  เกินกำหนด
                                </Badge>
                              )}
                            </div>
                            
                            {/* Requisition Info */}
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  <span>ใบเบิก: {item.requisitionNumber}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Truck className="h-3 w-3" />
                                  <span>จาก: {item.sourceWarehouse}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>ผู้เบิก: {item.requestedBy}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span className={overdue ? "text-red-600 font-medium" : ""}>
                                    กำหนด: {formatDateTime(item.dueDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Quantity Info */}
                            <div className="flex items-center gap-4">
                              <span className="text-sm">
                                รอรับ: <strong className="text-yellow-600">
                                  {item.pendingQuantity} {item.unit}
                                </strong>
                              </span>
                              {item.receivedQuantity > 0 && (
                                <span className="text-sm">
                                  รับแล้ว: <strong className="text-green-600">
                                    {item.receivedQuantity} {item.unit}
                                  </strong>
                                </span>
                              )}
                            </div>

                            {/* Batch Info if available */}
                            {(item.batchNumber || item.expiryDate) && (
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {item.batchNumber && (
                                  <span>Batch: {item.batchNumber}</span>
                                )}
                                {item.expiryDate && (
                                  <span>หมดอายุ: {formatDateTime(item.expiryDate)}</span>
                                )}
                              </div>
                            )}

                            {/* Notes if available */}
                            {item.notes && (
                              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                <strong>หมายเหตุ:</strong> {item.notes}
                              </div>
                            )}
                          </div>
                          
                          {/* Action Button */}
                          <Button
                            size="sm"
                            onClick={() => handleQuickReceive(item)}
                            className="ml-4 flex-shrink-0"
                          >
                            <PackageCheck className="h-4 w-4 mr-2" />
                            รับของ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard/receiving'}
                >
                  ไปยังระบบรับสินค้าแบบเต็ม
                </Button>
              </div>
            </div>
          )}

          {!searching && searchTerm && searchResults.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>ไม่พบสินค้า</AlertTitle>
              <AlertDescription>
                ไม่พบสินค้าที่ค้นหาในใบเบิกหรือใบส่งของที่รอรับ ลองค้นหาด้วยคำอื่น หรือตรวจสอบว่าใบเบิกถูกอนุมัติแล้วหรือยัง
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = `/dashboard/receiving?filter=today&warehouseId=${warehouseId}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              รอรับวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{quickStats.pendingToday}</div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "hover:shadow-md transition-shadow cursor-pointer",
          quickStats.overdue > 0 && "border-red-200 bg-red-50/30"
        )}
              onClick={() => window.location.href = `/dashboard/receiving?filter=overdue&warehouseId=${warehouseId}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              เกินกำหนด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{quickStats.overdue}</div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = `/dashboard/receiving?filter=completed&warehouseId=${warehouseId}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              รับแล้ววันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{quickStats.receivedToday}</div>
            <p className="text-xs text-gray-500">รายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">การดำเนินการเร็ว</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = `/dashboard/receiving/bulk?warehouseId=${warehouseId}`}
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">รับสินค้าหลายรายการ</div>
                  <div className="text-xs text-gray-500">รับสินค้าจากใบเบิกหลายใบพร้อมกัน</div>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = `/dashboard/receiving/emergency?warehouseId=${warehouseId}`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">รับสินค้าฉุกเฉิน</div>
                  <div className="text-xs text-gray-500">รับสินค้าด่วนที่ไม่ผ่านใบเบิก</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}