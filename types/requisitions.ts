// types/requisitions.ts

export interface RequisitionStats {
  requesting: number;        // กำลังเบิก
  preparing: number;         // กำลังเตรียมจัดส่ง  
  shipping: number;          // กำลังจัดส่ง
  completed: number;         // จัดส่งสำเร็จ
  cancelled: number;         // ยกเลิก
  newRequests: number;       // ใบเบิกใหม่ (สำหรับปลายทาง)
  totalValue: number;
  trends: {
    requestingChange: number;
    preparingChange: number;
    shippingChange: number;
    completedChange: number;
  };
}

export interface DepartmentFilter {
  id: string;
  name: string;
  departmentCode: string;
  totalRequisitions: number;
  pendingRequisitions: number;
  completedRequisitions: number;
  totalValue: number;
}

export interface RequisitionItem {
  id: string;
  requisitionNumber: string;
  type: 'REGULAR' | 'EMERGENCY' | 'SCHEDULED' | 'RETURN';
  status: 'REQUESTING' | 'PREPARING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  
  // ข้อมูลหน่วยงาน
  sourceWarehouse: {
    id: string;
    name: string;
    warehouseCode: string;
  };
  targetWarehouse: {
    id: string;
    name: string;
    warehouseCode: string;
  };
  requestingDepartment: {
    id: string;
    name: string;
    departmentCode: string;
  };
  
  // ผู้ลงชื่อในขั้นตอนต่างๆ
  requester: {
    firstName: string;
    lastName: string;
    position: string;
  } | null;
  approver: {
    firstName: string;
    lastName: string;
    position: string;
  } | null;
  dispenser: {
    firstName: string;
    lastName: string;
    position: string;
  } | null;
  receiver: {
    firstName: string;
    lastName: string;
    position: string;
  } | null;
  
  createdAt: string;
  updatedAt: string;
  requestedDate: string;
  expectedDate?: string | null;
  completedDate?: string | null;
  totalItems: number;
  completedItems: number;
  totalValue: number;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: any;
  description: string;
}

export interface PriorityConfig {
  label: string;
  color: string;
  bgColor: string;
}