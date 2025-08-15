// components/warehouse/tabs/RequisitionsTab.tsx
"use client";

import { Eye, Edit, CheckCircle, Package, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WarehouseDetail } from "@/types/warehouse";
import { formatCurrency, formatDateTime } from "@/utils/warehouse-helpers";
import { PriorityBadge, RequisitionStatusBadge } from "@/components/warehouse/BadgeComponents";

interface RequisitionsTabProps {
  warehouse: WarehouseDetail;
}

export default function RequisitionsTab({ warehouse }: RequisitionsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">รายการยารอเบิก</CardTitle>
        <CardDescription>
          แสดง {warehouse.pendingRequisitions?.length || 0} รายการที่รอการอนุมัติและจ่ายยา
        </CardDescription>
      </CardHeader>
      <CardContent>
        {warehouse.pendingRequisitions && warehouse.pendingRequisitions.length > 0 ? (
          <div className="space-y-4">
            {warehouse.pendingRequisitions.map((requisition) => (
              <Card key={requisition.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {requisition.requisitionNumber}
                          </h3>
                          <PriorityBadge value={requisition.priority} />
                          <RequisitionStatusBadge value={requisition.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          จาก: {requisition.fromDepartment.name} ({requisition.fromDepartment.code})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ผู้เบิก: {requisition.requester.firstName} {requisition.requester.lastName}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">
                          มูลค่าประมาณ: {formatCurrency(requisition.totalEstimatedValue)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(requisition.requestDate)}
                        </p>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3">รายการยาที่เบิก ({requisition.totalItems} รายการ)</h4>
                      <div className="space-y-2">
                        {requisition.items.map((item) => (
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
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="text-right">
                                <p className="font-medium">
                                  เบิก: {item.requestedQuantity.toLocaleString()} {item.drug.unit}
                                </p>
                                <p className="text-muted-foreground">
                                  คงเหลือ: {item.availableStock.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {formatCurrency(item.estimatedCost)}
                                </p>
                              </div>
                              <div className="flex items-center">
                                {item.availableStock >= item.requestedQuantity ? (
                                  <Badge variant="default" className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    พอจ่าย
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    ไม่พอ
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        ดูรายละเอียด
                      </Button>
                      {requisition.status === 'SUBMITTED' && (
                        <>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="h-4 w-4" />
                            แก้ไข
                          </Button>
                          <Button size="sm" className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            อนุมัติ
                          </Button>
                        </>
                      )}
                      {requisition.status === 'APPROVED' && (
                        <Button size="sm" className="gap-2">
                          <Package className="h-4 w-4" />
                          จ่ายยา
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">ไม่มีรายการยารอเบิก</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}