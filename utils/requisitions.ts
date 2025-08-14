// utils/requisitions.ts
import { Send, PackageCheck, Truck, CheckCircle, Ban } from "lucide-react";
import { StatusConfig, PriorityConfig } from "@/types/requisitions";

export const getStatusConfig = (status: string): StatusConfig => {
  const configs = {
    REQUESTING: { 
      label: "กำลังเบิก", 
      color: "text-blue-600", 
      bgColor: "bg-blue-100", 
      icon: Send,
      description: "ต้นทางส่งใบเบิกแล้ว รอปลายทางอนุมัติ"
    },
    PREPARING: { 
      label: "กำลังเตรียมจัดส่ง", 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-100", 
      icon: PackageCheck,
      description: "ปลายทางอนุมัติแล้ว กำลังเตรียมสินค้า"
    },
    SHIPPING: { 
      label: "กำลังจัดส่ง", 
      color: "text-orange-600", 
      bgColor: "bg-orange-100", 
      icon: Truck,
      description: "เตรียมสินค้าเสร็จ กำลังจัดส่งไปยังต้นทาง"
    },
    COMPLETED: { 
      label: "จัดส่งสำเร็จ", 
      color: "text-green-600", 
      bgColor: "bg-green-100", 
      icon: CheckCircle,
      description: "ต้นทางรับสินค้าแล้ว เสร็จสิ้นการเบิกจ่าย"
    },
    CANCELLED: { 
      label: "ยกเลิก", 
      color: "text-red-600", 
      bgColor: "bg-red-100", 
      icon: Ban,
      description: "ปลายทางยกเลิกใบเบิก"
    }
  };
  return configs[status as keyof typeof configs] || configs.REQUESTING;
};

export const getPriorityConfig = (priority: string): PriorityConfig => {
  const configs = {
    LOW: { label: "ต่ำ", color: "text-gray-600", bgColor: "bg-gray-100" },
    NORMAL: { label: "ปกติ", color: "text-blue-600", bgColor: "bg-blue-100" },
    HIGH: { label: "สูง", color: "text-orange-600", bgColor: "bg-orange-100" },
    URGENT: { label: "เร่งด่วน", color: "text-red-600", bgColor: "bg-red-100" }
  };
  return configs[priority as keyof typeof configs] || configs.NORMAL;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('th-TH').format(num);
};

export const formatDateTime = (date: string): string => {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
};