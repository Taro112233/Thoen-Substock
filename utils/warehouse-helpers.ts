// utils/warehouse-helpers.ts
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity 
} from "lucide-react";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (dateString: string) => {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const getTransactionTypeConfig = (type: string) => {
  const configs: Record<string, { label: string; color: string; icon: any }> = {
    RECEIVE: { label: 'รับเข้า', color: 'text-green-600 bg-green-100', icon: ArrowDownRight },
    DISPENSE: { label: 'จ่ายออก', color: 'text-red-600 bg-red-100', icon: ArrowUpRight },
    TRANSFER_IN: { label: 'โอนเข้า', color: 'text-blue-600 bg-blue-100', icon: ArrowDownRight },
    TRANSFER_OUT: { label: 'โอนออก', color: 'text-orange-600 bg-orange-100', icon: ArrowUpRight },
    ADJUST_INCREASE: { label: 'ปรับเพิ่ม', color: 'text-green-600 bg-green-100', icon: TrendingUp },
    ADJUST_DECREASE: { label: 'ปรับลด', color: 'text-red-600 bg-red-100', icon: TrendingDown },
    RETURN: { label: 'คืนยา', color: 'text-purple-600 bg-purple-100', icon: ArrowDownRight },
    DISPOSE: { label: 'ทำลาย', color: 'text-gray-600 bg-gray-100', icon: AlertTriangle },
  };
  return configs[type] || { label: type, color: 'text-gray-600 bg-gray-100', icon: Activity };
};

export const getWarehouseTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    CENTRAL: 'คลังกลาง',
    DEPARTMENT: 'คลังแผนก',
    EMERGENCY: 'คลังฉุกเฉิน',
    CONTROLLED: 'คลังยาควบคุม',
    COLD_STORAGE: 'ห้องเย็น',
    QUARANTINE: 'ห้องกักกัน',
    DISPOSAL: 'ห้องทำลาย',
    RECEIVING: 'ห้องรับของ',
    DISPENSING: 'ห้องจ่ายยา',
  };
  return types[type] || type;
};

export const getSecurityLevelConfig = (level: string) => {
  const levels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    BASIC: { label: 'พื้นฐาน', variant: 'secondary' },
    STANDARD: { label: 'มาตรฐาน', variant: 'default' },
    HIGH: { label: 'สูง', variant: 'outline' },
    MAXIMUM: { label: 'สูงสุด', variant: 'destructive' },
  };
  return levels[level] || { label: level, variant: 'default' as const };
};

export const getPriorityConfig = (priority: string) => {
  const priorities: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    LOW: { label: 'ต่ำ', variant: 'secondary' },
    NORMAL: { label: 'ปกติ', variant: 'default' },
    HIGH: { label: 'สูง', variant: 'outline' },
    URGENT: { label: 'ด่วน', variant: 'destructive' },
  };
  return priorities[priority] || { label: priority, variant: 'default' as const };
};

export const getRequisitionStatusConfig = (status: string) => {
  const statuses: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    DRAFT: { label: 'ร่าง', variant: 'secondary' },
    SUBMITTED: { label: 'ส่งแล้ว', variant: 'outline' },
    UNDER_REVIEW: { label: 'กำลังตรวจสอบ', variant: 'default' },
    APPROVED: { label: 'อนุมัติแล้ว', variant: 'default' },
    PARTIALLY_FILLED: { label: 'จ่ายบางส่วน', variant: 'outline' },
    COMPLETED: { label: 'เสร็จสิ้น', variant: 'default' },
    CANCELLED: { label: 'ยกเลิก', variant: 'destructive' },
    REJECTED: { label: 'ปฏิเสธ', variant: 'destructive' },
  };
  return statuses[status] || { label: status, variant: 'default' as const };
};

export const getReceivingStatusConfig = (status: string) => {
  const statuses: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    PENDING: { label: 'รอดำเนินการ', variant: 'secondary' },
    CONFIRMED: { label: 'ยืนยันแล้ว', variant: 'outline' },
    IN_TRANSIT: { label: 'กำลังจัดส่ง', variant: 'default' },
    PARTIALLY_RECEIVED: { label: 'รับบางส่วน', variant: 'outline' },
    RECEIVED: { label: 'รับครบแล้ว', variant: 'default' },
    CANCELLED: { label: 'ยกเลิก', variant: 'destructive' },
    DELAYED: { label: 'ล่าช้า', variant: 'destructive' },
  };
  return statuses[status] || { label: status, variant: 'default' as const };
};

