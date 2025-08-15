// components/warehouse/tabs/StockTab.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Edit3,
  Save,
  X,
  Search,
  Filter,
  Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Drug {
  id: string;
  hospitalDrugCode: string;
  name: string;
  strength: string;
  dosageForm: string;
  unit: string;
  genericName?: string;
  brandName?: string;
}

interface StockItem {
  id: string;
  drug: Drug;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  maxStock?: number;
  averageCost: number;
  totalValue: number;
  lowStockAlert: boolean;
  lastUpdated: string;
  notes?: string;
}

interface StockTabProps {
  warehouse: {
    id: string;
    name: string;
    stockCards: StockItem[];
  };
}

interface EditingState {
  stockCardId: string;
  currentStock: number;
  reorderPoint: number;
}

export default function EnhancedStockTab({ warehouse }: StockTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<EditingState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [stockCards, setStockCards] = useState<StockItem[]>(warehouse.stockCards || []);

  // ฟิลเตอร์ข้อมูลตามการค้นหาและสถานะ
  const filteredStockCards = stockCards.filter((item) => {
    const matchesSearch = 
      item.drug.hospitalDrugCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.drug.genericName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.drug.brandName?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = 
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.lowStockAlert) ||
      (stockFilter === 'out' && item.currentStock === 0) ||
      (stockFilter === 'normal' && !item.lowStockAlert && item.currentStock > 0);

    return matchesSearch && matchesFilter;
  });

  // ฟังก์ชันเริ่มต้นการแก้ไข
  const handleEditStart = (item: StockItem) => {
    setEditingItem({
      stockCardId: item.id,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint
    });
    setIsDialogOpen(true);
  };

  // ฟังก์ชันยกเลิกการแก้ไข
  const handleEditCancel = () => {
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleEditSave = async () => {
    if (!editingItem) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/dashboard/warehouses/${warehouse.id}/stock-cards/${editingItem.stockCardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentStock: editingItem.currentStock,
          reorderPoint: editingItem.reorderPoint,
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถอัปเดตข้อมูลได้');
      }

      const updatedStockCard = await response.json();

      // อัปเดต state
      setStockCards(prev => 
        prev.map(item => 
          item.id === editingItem.stockCardId 
            ? {
                ...item,
                currentStock: editingItem.currentStock,
                reorderPoint: editingItem.reorderPoint,
                availableStock: editingItem.currentStock - item.reservedStock,
                totalValue: editingItem.currentStock * item.averageCost,
                lowStockAlert: editingItem.currentStock <= editingItem.reorderPoint,
                lastUpdated: new Date().toISOString()
              }
            : item
        )
      );

      toast('อัปเดตข้อมูลสต็อกสำเร็จ', {
        description: `ปรับปรุงข้อมูลสต็อกการ์ด ${updatedStockCard.drug?.name} เรียบร้อยแล้ว`,
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
        },
      });

      setEditingItem(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating stock card:', error);
      toast('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถอัปเดตข้อมูลสต็อกได้ กรุณาลองใหม่อีกครั้ง',
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
        },
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // ฟังก์ชันจัดรูปแบบสกุลเงิน
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // ฟังก์ชันจัดรูปแบบวันที่
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // ฟังก์ชันส่งออกข้อมูล
  const handleExport = () => {
    const csvContent = [
      ['รหัสยา', 'ชื่อยา', 'รูปแบบ', 'ความแรง', 'หน่วย', 'จุดสั่งซื้อ', 'สต็อกปัจจุบัน', 'มูลค่ารวม', 'สถานะ'],
      ...filteredStockCards.map(item => [
        item.drug.hospitalDrugCode,
        item.drug.name,
        item.drug.dosageForm,
        item.drug.strength,
        item.drug.unit,
        item.reorderPoint.toString(),
        item.currentStock.toString(),
        item.totalValue.toString(),
        item.lowStockAlert ? 'สต็อกต่ำ' : item.currentStock === 0 ? 'หมด' : 'ปกติ'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stock-report-${warehouse.name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* การควบคุมและฟิลเตอร์ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>รายการสต็อกยา - {warehouse.name}</span>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              ส่งออก
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* ช่องค้นหา */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ค้นหาด้วยรหัสยา, ชื่อยา, ชื่อสามัญ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* ฟิลเตอร์สถานะ */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'ทั้งหมด', count: stockCards.length },
                { key: 'low', label: 'สต็อกต่ำ', count: stockCards.filter(item => item.lowStockAlert).length },
                { key: 'out', label: 'หมดสต็อก', count: stockCards.filter(item => item.currentStock === 0).length },
                { key: 'normal', label: 'ปกติ', count: stockCards.filter(item => !item.lowStockAlert && item.currentStock > 0).length }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={stockFilter === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStockFilter(filter.key as any)}
                  className="relative"
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* สรุปผลการค้นหา */}
          <div className="text-sm text-muted-foreground">
            แสดง {filteredStockCards.length} รายการ จากทั้งหมด {stockCards.length} รายการ
          </div>
        </CardContent>
      </Card>

      {/* ตารางแสดงข้อมูลสต็อก */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">รหัสยา</TableHead>
                  <TableHead>ชื่อยา</TableHead>
                  <TableHead className="text-right w-[120px]">จุดสั่งซื้อ</TableHead>
                  <TableHead className="text-right w-[120px]">สต็อกปัจจุบัน</TableHead>
                  <TableHead className="text-right w-[140px]">มูลค่ารวม</TableHead>
                  <TableHead className="w-[100px]">สถานะ</TableHead>
                  <TableHead className="w-[100px]">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStockCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm ? 'ไม่พบรายการที่ค้นหา' : 'ไม่มีข้อมูลสต็อก'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStockCards.map((item) => (
                    <TableRow 
                      key={item.id}
                      className={cn(
                        "hover:bg-muted/50",
                        item.currentStock === 0 && "bg-red-50/50",
                        item.lowStockAlert && item.currentStock > 0 && "bg-orange-50/50"
                      )}
                    >
                      {/* รหัสยา */}
                      <TableCell>
                        <div className="font-mono text-sm font-medium">
                          {item.drug.hospitalDrugCode}
                        </div>
                      </TableCell>

                      {/* ชื่อยา */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm leading-tight">
                            {item.drug.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.drug.dosageForm} {item.drug.strength} {item.drug.unit}
                          </p>
                        </div>
                      </TableCell>

                      {/* จุดสั่งซื้อ */}
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {item.reorderPoint.toLocaleString()}
                        </div>
                      </TableCell>

                      {/* สต็อกปัจจุบัน */}
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className={cn(
                            "font-medium",
                            item.currentStock === 0 && "text-red-600",
                            item.lowStockAlert && item.currentStock > 0 && "text-orange-600"
                          )}>
                            {item.currentStock.toLocaleString()}
                          </div>
                          {item.reservedStock > 0 && (
                            <div className="text-xs text-blue-600">
                              จอง: {item.reservedStock.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* มูลค่ารวม */}
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {formatCurrency(item.totalValue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          @{formatCurrency(item.averageCost)}/{item.drug.unit}
                        </div>
                      </TableCell>

                      {/* สถานะ */}
                      <TableCell>
                        {item.currentStock === 0 ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            หมด
                          </Badge>
                        ) : item.lowStockAlert ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            สต็อกต่ำ
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            ปกติ
                          </Badge>
                        )}
                      </TableCell>

                      {/* การจัดการ */}
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStart(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog แก้ไขสต็อก */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลสต็อก</DialogTitle>
            <DialogDescription>
              ปรับปรุงสต็อกปัจจุบันและจุดสั่งซื้อ สำหรับ{' '}
              {editingItem && stockCards.find(item => item.id === editingItem.stockCardId)?.drug.name}
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-4">
              {/* ข้อมูลยา */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm font-medium">
                  {stockCards.find(item => item.id === editingItem.stockCardId)?.drug.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  รหัส: {stockCards.find(item => item.id === editingItem.stockCardId)?.drug.hospitalDrugCode}
                </div>
              </div>

              {/* สต็อกปัจจุบัน */}
              <div className="space-y-2">
                <label className="text-sm font-medium">สต็อกปัจจุบัน</label>
                <Input
                  type="number"
                  min="0"
                  value={editingItem.currentStock}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    currentStock: parseInt(e.target.value) || 0
                  })}
                  className="text-right"
                />
              </div>

              {/* จุดสั่งซื้อ */}
              <div className="space-y-2">
                <label className="text-sm font-medium">จุดสั่งซื้อ</label>
                <Input
                  type="number"
                  min="0"
                  value={editingItem.reorderPoint}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    reorderPoint: parseInt(e.target.value) || 0
                  })}
                  className="text-right"
                />
              </div>

              {/* แสดงการเปลี่ยนแปลง */}
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <div className="font-medium text-blue-900 mb-2">สรุปการเปลี่ยนแปลง:</div>
                <div className="space-y-1 text-blue-800">
                  <div>สต็อก: {stockCards.find(item => item.id === editingItem.stockCardId)?.currentStock} → {editingItem.currentStock}</div>
                  <div>จุดสั่งซื้อ: {stockCards.find(item => item.id === editingItem.stockCardId)?.reorderPoint} → {editingItem.reorderPoint}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleEditCancel}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 mr-2" />
              ยกเลิก
            </Button>
            <Button 
              onClick={handleEditSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  บันทึก
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}