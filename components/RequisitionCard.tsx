// components/RequisitionCard.tsx
"use client";

import { 
  Building, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RequisitionItem } from "@/types/requisitions";
import { getStatusConfig, getPriorityConfig, formatDateTime, formatCurrency } from "@/utils/requisitions";

interface RequisitionCardProps {
  requisition: RequisitionItem;
  onClick: (requisition: RequisitionItem) => void;
}

export default function RequisitionCard({ requisition, onClick }: RequisitionCardProps) {
  const statusConfig = getStatusConfig(requisition.status);
  const priorityConfig = getPriorityConfig(requisition.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all cursor-pointer",
        requisition.priority === 'URGENT' && "border-red-300 bg-red-50/50"
      )}
      onClick={() => onClick(requisition)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-lg">{requisition.requisitionNumber}</h4>
                <Badge className={cn("gap-1", priorityConfig.color, priorityConfig.bgColor)}>
                  {priorityConfig.label}
                </Badge>
                <Badge className={cn("gap-1", statusConfig.color, statusConfig.bgColor)}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  <span>แผนก: {requisition.requestingDepartment.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>วันที่เบิก: {formatDateTime(requisition.requestedDate)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(requisition.totalValue)}</p>
                <p className="text-sm text-gray-500">{requisition.totalItems} รายการ</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Warehouse & Progress Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-blue-600" />
                <span>จาก: {requisition.sourceWarehouse.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-green-600" />
                <span>ไปยัง: {requisition.targetWarehouse.name}</span>
              </div>
            </div>

            <div className="text-sm">
              ความคืบหน้า: {requisition.completedItems}/{requisition.totalItems} รายการ
            </div>
          </div>

          {/* Signatories */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="text-gray-500 mb-1">ผู้เบิก</p>
              {requisition.requester ? (
                <div>
                  <p className="font-medium">{requisition.requester.firstName} {requisition.requester.lastName}</p>
                  <p className="text-gray-500">{requisition.requester.position}</p>
                </div>
              ) : (
                <p className="text-gray-400">-</p>
              )}
            </div>

            <div>
              <p className="text-gray-500 mb-1">ผู้อนุมัติ</p>
              {requisition.approver ? (
                <div>
                  <p className="font-medium">{requisition.approver.firstName} {requisition.approver.lastName}</p>
                  <p className="text-gray-500">{requisition.approver.position}</p>
                </div>
              ) : (
                <p className="text-gray-400">รอการอนุมัติ</p>
              )}
            </div>

            <div>
              <p className="text-gray-500 mb-1">ผู้จ่าย</p>
              {requisition.dispenser ? (
                <div>
                  <p className="font-medium">{requisition.dispenser.firstName} {requisition.dispenser.lastName}</p>
                  <p className="text-gray-500">{requisition.dispenser.position}</p>
                </div>
              ) : (
                <p className="text-gray-400">รอการจ่าย</p>
              )}
            </div>

            <div>
              <p className="text-gray-500 mb-1">ผู้รับ</p>
              {requisition.receiver ? (
                <div>
                  <p className="font-medium">{requisition.receiver.firstName} {requisition.receiver.lastName}</p>
                  <p className="text-gray-500">{requisition.receiver.position}</p>
                </div>
              ) : (
                <p className="text-gray-400">รอการรับ</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all",
                  requisition.completedItems === requisition.totalItems ? "bg-green-500" : 
                  requisition.completedItems > 0 ? "bg-blue-500" : "bg-gray-300"
                )}
                style={{ 
                  width: `${requisition.totalItems > 0 ? (requisition.completedItems / requisition.totalItems) * 100 : 0}%` 
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>อัปเดตล่าสุด: {formatDateTime(requisition.updatedAt)}</span>
            {requisition.expectedDate && (
              <span>กำหนดส่ง: {formatDateTime(requisition.expectedDate)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}