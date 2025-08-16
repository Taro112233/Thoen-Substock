// components/stock/StockTable.tsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Edit3,
  Package,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StockItem } from '@/types/stock';
import { formatCurrency, calculateTotalUnits } from '@/utils/stock-helpers';

interface StockTableProps {
  stockCards: StockItem[];
  onEditStart: (item: StockItem) => void;
  showPackageView?: boolean; // เพิ่ม prop สำหรับควบคุมการแสดงผล package view
}

export function StockTable({ 
  stockCards, 
  onEditStart, 
  showPackageView = true // default เป็น true
}: StockTableProps) {
  if (stockCards.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          ไม่มีข้อมูลสต็อก
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">รหัสยา</TableHead>
            <TableHead>ชื่อยา</TableHead>
            {showPackageView && (
              <TableHead className="text-center w-[120px]">Package Info</TableHead>
            )}
            {showPackageView && (
              <TableHead className="text-right w-[120px]">ราคาต่อกล่อง</TableHead>
            )}
            <TableHead className="text-right w-[120px]">จุดสั่งซื้อ</TableHead>
            <TableHead className="text-right w-[120px]">สต็อกปัจจุบัน</TableHead>
            <TableHead className="text-right w-[140px]">มูลค่ารวม</TableHead>
            <TableHead className="w-[100px]">สถานะ</TableHead>
            <TableHead className="w-[100px]">การจัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockCards.map((item) => (
            <TableRow 
              key={item.id}
              className={cn(
                "hover:bg-muted/50",
                item.currentStock === 0 && "bg-red-50/50",
                item.lowStockAlert && item.currentStock > 0 && "bg-orange-50/50",
                // ตรวจสอบ pricePerBox อย่างปลอดภัย
                (item as any).pricePerBox && (item as any).pricePerBox > 500 && "bg-purple-50/30"
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

              {/* Package Info - แสดงเฉพาะเมื่อ showPackageView เป็น true */}
              {showPackageView && (
                <TableCell className="text-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="h-3 w-3 text-gray-500" />
                      <span className="text-sm font-medium">
                        {(item as any).packageSize || (item.drug as any).packageSize || 1}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(item as any).packageUnit || (item.drug as any).packageUnit || 'units'}/pkg
                    </div>
                    <div className="text-xs text-blue-600">
                      = {calculateTotalUnits(item).toLocaleString()} units
                    </div>
                  </div>
                </TableCell>
              )}

              {/* ราคาต่อกล่อง - แสดงเฉพาะเมื่อ showPackageView เป็น true */}
              {showPackageView && (
                <TableCell className="text-right">
                  <div className="space-y-1">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span className="font-medium text-green-600">
                        {formatCurrency((item as any).pricePerBox || (item as any).packageCost || 0)}
                      </span>
                    </div>
                    {(item as any).pricePerBox && (item as any).packageCost && 
                     Math.abs((item as any).pricePerBox - (item as any).packageCost) > 0.01 && (
                      <div className="text-xs text-orange-600">
                        Cost: {formatCurrency((item as any).packageCost)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(item.averageCost)}/unit
                    </div>
                  </div>
                </TableCell>
              )}

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
                    {showPackageView && (
                      <span className="text-xs text-muted-foreground ml-1">pkgs</span>
                    )}
                  </div>
                  {item.reservedStock > 0 && (
                    <div className="text-xs text-blue-600">
                      จอง: {item.reservedStock.toLocaleString()}
                    </div>
                  )}
                  {showPackageView && (
                    <div className="text-xs text-muted-foreground">
                      {calculateTotalUnits(item).toLocaleString()} units
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
                {showPackageView && (item as any).pricePerBox && (
                  <div className="text-xs text-green-600">
                    @{formatCurrency((item as any).pricePerBox)}/pkg
                  </div>
                )}
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
                ) : ((item as any).pricePerBox || 0) > 500 ? (
                  <Badge variant="default" className="gap-1 bg-purple-600">
                    <DollarSign className="h-3 w-3" />
                    มูลค่าสูง
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
                  onClick={() => onEditStart(item)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}