// components/warehouse/tabs/TransactionsTab.tsx
"use client";

import { Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WarehouseDetail } from "@/types/warehouse";
import { formatCurrency, formatDateTime, getTransactionTypeConfig } from "@/utils/warehouse-helpers";
import { cn } from "@/lib/utils";

interface TransactionsTabProps {
  warehouse: WarehouseDetail;
}

export default function TransactionsTab({ warehouse }: TransactionsTabProps) {
  return (
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
  );
}