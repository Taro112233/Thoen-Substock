// components/warehouse/WarehouseHeader.tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Hash,
  Building,
  MapPin,
  CheckCircle,
  AlertCircle,
  Activity,
  Download,
  RefreshCw,
  MoreVertical,
  Edit,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WarehouseDetail } from "@/types/warehouse";
import { getWarehouseTypeLabel } from "@/utils/warehouse-helpers";

interface WarehouseHeaderProps {
  warehouse: WarehouseDetail;
  onRefresh: () => void;
}

export default function WarehouseHeader({ warehouse, onRefresh }: WarehouseHeaderProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ
        </Button>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {warehouse.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              {warehouse.warehouseCode}
            </span>
            <span className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {getWarehouseTypeLabel(warehouse.type)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {warehouse.location}
            </span>
            <div className="flex items-center gap-2">
              {warehouse.isActive ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  ใช้งานได้
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  ปิดใช้งาน
                </Badge>
              )}
              {warehouse.isMaintenance && (
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3" />
                  บำรุงรักษา
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          ส่งออก
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <Edit className="h-4 w-4" />
              แก้ไขข้อมูล
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Eye className="h-4 w-4" />
              ดูประวัติ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}