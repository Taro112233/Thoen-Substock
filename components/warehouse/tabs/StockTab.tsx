// components/warehouse/tabs/StockTab.tsx
"use client";

import { useState } from "react";
import { Search, Filter, Package, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WarehouseDetail } from "@/types/warehouse";
import { formatCurrency, formatDateTime } from "@/utils/warehouse-helpers";

interface StockTabProps {
  warehouse: WarehouseDetail;
}

export default function StockTab({ warehouse }: StockTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStockCards = warehouse.stockCards?.filter((item) =>
    searchTerm === "" ||
    item.drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.drug.hospitalDrugCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
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
            แสดง {filteredStockCards.length} รายการจากทั้งหมด {warehouse._counts.stockCards} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStockCards.length > 0 ? (
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
                {filteredStockCards.map((item) => (
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
  );
}