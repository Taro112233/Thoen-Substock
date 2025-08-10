// app/admin/hospitals/types/hospital.ts
// ===================================
// HOSPITAL TYPES - Shared across all components
// ===================================

export interface Hospital {
  id: string;
  name: string;
  nameEn?: string;
  hospitalCode: string;
  type: 'GOVERNMENT' | 'PRIVATE' | 'UNIVERSITY' | 'MILITARY' | 'POLICE' | 'COMMUNITY' | 'SPECIALIZED';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'MAINTENANCE';
  address: string;
  district?: string;
  subDistrict?: string;
  province: string;
  postalCode?: string;
  country: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  bedCount?: number;
  employeeCount?: number;
  establishedYear?: number;
  licenseNo?: string;
  licenseExpiry?: string;
  taxId?: string;
  registrationNo?: string;
  timezone: string;
  locale: string;
  currency: string;
  subscriptionPlan?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  maxUsers?: number;
  maxWarehouses?: number;
  isTrialAccount: boolean;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    departments: number;
    warehouses: number;
    drugs?: number;
    stockCards?: number;
    requisitions?: number;
    purchaseOrders?: number;
  };
}

export interface HospitalFormData {
  name: string;
  nameEn?: string;
  hospitalCode: string;
  type: string;
  status: string;
  address: string;
  district?: string;
  subDistrict?: string;
  province: string;
  postalCode?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  bedCount?: number;
  employeeCount?: number;
  establishedYear?: number;
  licenseNo?: string;
  licenseExpiry?: string;
  taxId?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

// ===================================
// CONSTANTS
// ===================================

export const thailandProvinces = [
  'กรุงเทพมหานคร', 'กราบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
  'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ',
  'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก',
  'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี',
  'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง', 'พิจิตร',
  'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม',
  'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโซธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
  'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร',
  'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว',
  'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์',
  'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์',
  'อุทัยธานี', 'อุบลราชธานี'
];

export const hospitalTypes = [
  { value: 'GOVERNMENT', label: 'โรงพยาบาลรัฐ' },
  { value: 'PRIVATE', label: 'โรงพยาบาลเอกชน' },
  { value: 'UNIVERSITY', label: 'โรงพยาบาลมหาวิทยาลัย' },
  { value: 'MILITARY', label: 'โรงพยาบาลทหาร' },
  { value: 'POLICE', label: 'โรงพยาบาลตำรวจ' },
  { value: 'COMMUNITY', label: 'โรงพยาบาลชุมชน' },
  { value: 'SPECIALIZED', label: 'โรงพยาบาลเฉพาะทาง' },
];

export const hospitalStatuses = [
  { value: 'ACTIVE', label: 'ใช้งาน', color: 'bg-green-500' },
  { value: 'INACTIVE', label: 'ไม่ใช้งาน', color: 'bg-gray-500' },
  { value: 'SUSPENDED', label: 'ระงับ', color: 'bg-red-500' },
  { value: 'PENDING', label: 'รอดำเนินการ', color: 'bg-yellow-500' },
  { value: 'MAINTENANCE', label: 'บำรุงรักษา', color: 'bg-blue-500' },
];