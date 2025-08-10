// app/admin/personnel-types/types/personnel-type.ts
// Personnel Types - TypeScript Interfaces & Constants
// Types สำหรับระบบจัดการประเภทบุคลากร

export interface PersonnelType {
  id: string;
  hospitalId: string;
  typeCode: string;
  typeName: string;
  typeNameEn?: string | null;
  hierarchy: PersonnelHierarchy;
  levelOrder: number;
  
  // สิทธิ์และความสามารถ
  canManageHospitals: boolean;
  canManageWarehouses: boolean;
  canManageDepartments: boolean;
  canManagePersonnel: boolean;
  canManageDrugs: boolean;
  canManageMasterData: boolean;
  canViewReports: boolean;
  canApproveUsers: boolean;
  
  // รายละเอียดเพิ่มเติม
  description?: string | null;
  responsibilities?: string[] | null;
  maxSubordinates?: number | null;
  defaultDepartmentType?: string | null;
  
  // สถานะ
  isActive: boolean;
  isSystemDefault: boolean;
  
  // ข้อมูลความสัมพันธ์
  hospital: {
    id: string;
    name: string;
    hospitalCode: string;
    status: string;
  };
  creator: {
    id: string;
    name: string;
    role: string;
  };
  _count: {
    users: number;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PersonnelTypeFormData {
  hospitalId?: string;
  typeCode: string;
  typeName: string;
  typeNameEn?: string;
  hierarchy: PersonnelHierarchy;
  levelOrder: number;
  
  // สิทธิ์และความสามารถ
  canManageHospitals: boolean;
  canManageWarehouses: boolean;
  canManageDepartments: boolean;
  canManagePersonnel: boolean;
  canManageDrugs: boolean;
  canManageMasterData: boolean;
  canViewReports: boolean;
  canApproveUsers: boolean;
  
  // รายละเอียดเพิ่มเติม
  description?: string;
  responsibilities?: string[];
  maxSubordinates?: number;
  defaultDepartmentType?: string;
  isActive: boolean;
}

export type PersonnelHierarchy = 'DEVELOPER' | 'DIRECTOR' | 'GROUP_HEAD' | 'STAFF' | 'STUDENT';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PersonnelTypeStatistics {
  byHierarchy: Record<PersonnelHierarchy, number>;
  totalActive: number;
  totalInactive: number;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
  statistics?: PersonnelTypeStatistics;
}

// Constants
export const PERSONNEL_HIERARCHIES: { value: PersonnelHierarchy; label: string; description: string; levelOrder: number }[] = [
  { value: 'DEVELOPER', label: 'นักพัฒนา', description: 'สิทธิ์สูงสุดในการจัดการระบบ', levelOrder: 1 },
  { value: 'DIRECTOR', label: 'ผู้อำนวยการ', description: 'ผู้บริหารระดับสูงของโรงพยาบาล', levelOrder: 10 },
  { value: 'GROUP_HEAD', label: 'หัวหน้ากลุ่มงาน', description: 'หัวหน้ากลุ่มงานในแต่ละสายงาน', levelOrder: 20 },
  { value: 'STAFF', label: 'พนักงาน', description: 'พนักงานระดับปฏิบัติการ', levelOrder: 30 },
  { value: 'STUDENT', label: 'นักศึกษา', description: 'นักศึกษาฝึกงานและนักศึกษาแพทย์', levelOrder: 40 }
];

export const PERMISSION_LABELS: Record<string, { label: string; description: string; color: string }> = {
  canManageHospitals: {
    label: 'จัดการโรงพยาบาล',
    description: 'สร้าง แก้ไข และลบข้อมูลโรงพยาบาล',
    color: 'bg-red-100 text-red-700'
  },
  canManageWarehouses: {
    label: 'จัดการคลัง',
    description: 'จัดการคลังยาและระบบสต็อก',
    color: 'bg-blue-100 text-blue-700'
  },
  canManageDepartments: {
    label: 'จัดการแผนก',
    description: 'สร้างและจัดการแผนกต่างๆ',
    color: 'bg-green-100 text-green-700'
  },
  canManagePersonnel: {
    label: 'จัดการบุคลากร',
    description: 'จัดการประเภทบุคลากรและผู้ใช้',
    color: 'bg-purple-100 text-purple-700'
  },
  canManageDrugs: {
    label: 'จัดการยา',
    description: 'จัดการข้อมูลยาและเวชภัณฑ์',
    color: 'bg-orange-100 text-orange-700'
  },
  canManageMasterData: {
    label: 'จัดการข้อมูลหลัก',
    description: 'จัดการข้อมูลหลักของระบบ',
    color: 'bg-gray-100 text-gray-700'
  },
  canViewReports: {
    label: 'ดูรายงาน',
    description: 'เข้าถึงรายงานและสถิติ',
    color: 'bg-indigo-100 text-indigo-700'
  },
  canApproveUsers: {
    label: 'อนุมัติผู้ใช้',
    description: 'อนุมัติการสมัครสมาชิกใหม่',
    color: 'bg-yellow-100 text-yellow-700'
  }
};

export const HIERARCHY_COLORS: Record<PersonnelHierarchy, string> = {
  DEVELOPER: 'from-purple-500 to-purple-600',
  DIRECTOR: 'from-blue-500 to-blue-600', 
  GROUP_HEAD: 'from-green-500 to-green-600',
  STAFF: 'from-gray-500 to-gray-600',
  STUDENT: 'from-yellow-500 to-yellow-600'
};

export const HIERARCHY_ICONS: Record<PersonnelHierarchy, string> = {
  DEVELOPER: '👨‍💻',
  DIRECTOR: '👔',
  GROUP_HEAD: '👥',
  STAFF: '👤',
  STUDENT: '🎓'
};