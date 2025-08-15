// components/warehouse/tabs/ReceivingsTab.tsx
"use client";

import { Eye, Edit, CheckCircle, Package, FileText, AlertTriangle, Truck, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WarehouseDetail } from "@/types/warehouse";
import { formatCurrency, formatDateTime } from "@/utils/warehouse-helpers";
import { PriorityBadge, ReceivingStatusBadge } from "@/components/warehouse/BadgeComponents";

interface ReceivingsTabProps {
  warehouse: WarehouseDetail;
}

export default function ReceivingsTab({ warehouse }: ReceivingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">รายการยารอรับเข้า</CardTitle>
        <CardDescription>
          แสดง {warehouse.pendingReceivings?.length || 0} รายการที่รอการรับเข้าและตรวจสอบ
        </CardDescription>
      </CardHeader>
      <CardContent>
        {warehouse.pendingReceivings && warehouse.pendingReceivings.length > 0 ? (
          <div className="space-y-4">
            {warehouse.pendingReceivings.map((receiving) => {
              const completionPercentage = receiving.items.reduce((acc, item) => 
                acc + (item.receivedQuantity / item.orderedQuantity), 0
              ) / receiving.items.length * 100;

              return (
                <Card key={receiving.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {receiving.purchaseOrderNumber}
                            </h3>
                            <PriorityBadge value={receiving.priority} />
                            <ReceivingStatusBadge value={receiving.status} />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span>ผู้จัดจำหน่าย: {receiving.supplierName}</span>
                          </div>
                          {receiving.deliveryNote && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Truck className="h-4 w-4" />
                              <span>เลขที่ใบส่งของ: {receiving.deliveryNote}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium">
                            มูลค่ารวม: {formatCurrency(receiving.totalEstimatedValue)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            คาดว่าจะส่งมาถึง: {formatDateTime(receiving.expectedDate)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">ความคืบหน้าการรับเข้า</span>
                          <span className="font-medium">{Math.round(completionPercentage)}%</span>
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                      </div>

                      {/* Items Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-3">รายการยาที่สั่ง ({receiving.totalItems} รายการ)</h4>
                        <div className="space-y-2">
                          {receiving.items.map((item) => {
                            const itemProgress = (item.receivedQuantity / item.orderedQuantity) * 100;
                            
                            return (
                              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                                      {item.drug.hospitalDrugCode}
                                    </span>
                                    <span className="font-medium">{item.drug.name}</span>
                                    {item.drug.strength && (
                                      <span className="text-sm text-muted-foreground">
                                        {item.drug.strength}
                                      </span>
                                    )}
                                  </div>
                                  {item.notes && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      หมายเหตุ: {item.notes}
                                    </p>
                                  )}
                                  {item.batchNumber && (
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                      <span>Batch: {item.batchNumber}</span>
                                      {item.expiryDate && (
                                        <span>หมดอายุ: {new Date(item.expiryDate).toLocaleDateString('th-TH')}</span>
                                      )}
                                      {item.manufacturer && (
                                        <span>ผู้ผลิต: {item.manufacturer}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="text-right">
                                    <p className="font-medium">
                                      รับแล้ว: {item.receivedQuantity.toLocaleString()} / {item.orderedQuantity.toLocaleString()} {item.drug.unit}
                                    </p>
                                    <p className="text-muted-foreground">
                                      คงเหลือ: {item.remainingQuantity.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">
                                      {formatCurrency(item.totalPrice)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      @{formatCurrency(item.unitPrice)}
                                    </p>
                                  </div>
                                  <div className="flex items-center">
                                    {itemProgress >= 100 ? (
                                      <Badge variant="default" className="gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        รับครบ
                                      </Badge>
                                    ) : item.receivedQuantity > 0 ? (
                                      <Badge variant="outline" className="gap-1">
                                        <Package className="h-3 w-3" />
                                        รับบางส่วน
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        รอรับ
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          ดูรายละเอียด
                        </Button>
                        {receiving.status === 'CONFIRMED' && (
                          <Button size="sm" className="gap-2">
                            <Package className="h-4 w-4" />
                            เริ่มรับยา
                          </Button>
                        )}
                        {receiving.status === 'IN_TRANSIT' && (
                          <Button size="sm" className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            รับเข้าคลัง
                          </Button>
                        )}
                        {receiving.status === 'PARTIALLY_RECEIVED' && (
                          <Button size="sm" className="gap-2">
                            <Package className="h-4 w-4" />
                            รับส่วนที่เหลือ
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">ไม่มีรายการยารอรับเข้า</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}