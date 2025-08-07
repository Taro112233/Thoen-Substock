// lib/mock-data.ts

export const mockCurrentUser = {
  id: '1',
  name: 'ผู้พัฒนาระบบ',
  email: 'developer@hospital.com',
  hierarchy: 'DEVELOPER',
  hospitalId: 'hosp-1',
  permissions: {
    canManageHospitals: true,
    canManageWarehouses: true,
    canManageDepartments: true,
    canManagePersonnel: true,
    canManageDrugs: true,
    canManageMasterData: true
  }
};

export const mockHospitals = [
  { id: 'hosp-1', name: 'โรงพยาบาลลำปาง', province: 'ลำปาง', beds: 800, status: 'active' },
  { id: 'hosp-2', name: 'โรงพยาบาลเถิน', province: 'ลำปาง', beds: 120, status: 'active' },
  { id: 'hosp-3', name: 'โรงพยาบาลแม่ทะ', province: 'ลำปาง', beds: 60, status: 'active' },
  { id: 'hosp-4', name: 'โรงพยาบาลงาว', province: 'ลำปาง', beds: 30, status: 'active' },
  { id: 'hosp-5', name: 'โรงพยาบาลวังเหนือ', province: 'ลำปาง', beds: 30, status: 'active' }
];

export const mockWarehouses = [
  { id: 'wh-1', code: 'OPD', name: 'แผนกผู้ป่วยนอก', type: 'department', status: 'active', hospitalId: 'hosp-1' },
  { id: 'wh-2', code: 'IPD', name: 'แผนกผู้ป่วยใน', type: 'department', status: 'active', hospitalId: 'hosp-1' },
  { id: 'wh-3', code: 'ER', name: 'แผนกฉุกเฉิน', type: 'emergency', status: 'active', hospitalId: 'hosp-1' },
  { id: 'wh-4', code: 'OR', name: 'ห้องผ่าตัด', type: 'special', status: 'active', hospitalId: 'hosp-1' },
  { id: 'wh-5', code: 'ICU', name: 'หอผู้ป่วยวิกฤต', type: 'critical', status: 'active', hospitalId: 'hosp-1' },
  { id: 'wh-6', code: 'PHAR', name: 'คลังเภสัชกรรม', type: 'main', status: 'active', hospitalId: 'hosp-1' }
];

export const mockDepartments = [
  { id: 'dept-1', name: 'กลุ่มงานแพทย์', code: 'MED', staffCount: 45, head: 'นพ.สมชาย ใจดี', hospitalId: 'hosp-1' },
  { id: 'dept-2', name: 'กลุ่มงานพยาบาล', code: 'NUR', staffCount: 120, head: 'คุณสมหญิง รักษ์ผู้ป่วย', hospitalId: 'hosp-1' },
  { id: 'dept-3', name: 'กลุ่มงานเภสัชกรรม', code: 'PHAR', staffCount: 25, head: 'ภญ.สมใจ ปรุงยา', hospitalId: 'hosp-1' },
  { id: 'dept-4', name: 'กลุ่มงานเทคนิคการแพทย์', code: 'LAB', staffCount: 18, head: 'คุณสมศักดิ์ ตรวจเลือด', hospitalId: 'hosp-1' },
  { id: 'dept-5', name: 'กลุ่มงานรังสีวิทยา', code: 'RAD', staffCount: 12, head: 'นพ.สมบัติ เอกซเรย์', hospitalId: 'hosp-1' }
];

export const mockPersonnelTypes = [
  { 
    id: 'pt-1', 
    code: 'DIR', 
    name: 'ผู้อำนวยการ', 
    hierarchy: 'DIRECTOR',
    level: 2,
    permissions: ['warehouses', 'departments', 'personnel'],
    count: 1,
    hospitalId: 'hosp-1'
  },
  { 
    id: 'pt-2', 
    code: 'GRP_HEAD', 
    name: 'หัวหน้ากลุ่มงาน', 
    hierarchy: 'GROUP_HEAD',
    level: 3,
    permissions: ['drugs', 'reports'],
    count: 8,
    hospitalId: 'hosp-1'
  },
  { 
    id: 'pt-3', 
    code: 'STAFF', 
    name: 'พนักงาน', 
    hierarchy: 'STAFF',
    level: 4,
    permissions: ['view', 'request'],
    count: 145,
    hospitalId: 'hosp-1'
  },
  { 
    id: 'pt-4', 
    code: 'STU', 
    name: 'นักศึกษาฝึกงาน', 
    hierarchy: 'STUDENT',
    level: 5,
    permissions: ['view'],
    count: 32,
    hospitalId: 'hosp-1'
  }
];

export const mockDrugForms = [
  { id: 1, code: 'TAB', name: 'ยาเม็ด', nameEn: 'Tablet', icon: '💊', count: 245 },
  { id: 2, code: 'CAP', name: 'ยาแคปซูล', nameEn: 'Capsule', icon: '💊', count: 189 },
  { id: 3, code: 'SYR', name: 'ยาน้ำ', nameEn: 'Syrup', icon: '🥤', count: 78 },
  { id: 4, code: 'INJ', name: 'ยาฉีด', nameEn: 'Injection', icon: '💉', count: 156 },
  { id: 5, code: 'CRM', name: 'ยาครีม', nameEn: 'Cream', icon: '🧴', count: 92 },
  { id: 6, code: 'OIT', name: 'ยาขี้ผึ้ง', nameEn: 'Ointment', icon: '🧴', count: 45 },
  { id: 7, code: 'SUP', name: 'ยาเหน็บ', nameEn: 'Suppository', icon: '💊', count: 23 },
  { id: 8, code: 'INH', name: 'ยาสูดพ่น', nameEn: 'Inhaler', icon: '💨', count: 34 }
];

export const mockDrugGroups = [
  { id: 1, code: 'ANTI', name: 'ยาปฏิชีวนะ', nameEn: 'Antibiotic', color: 'bg-red-100 text-red-700', count: 89 },
  { id: 2, code: 'HIST', name: 'ยาแก้แพ้', nameEn: 'Antihistamine', color: 'bg-blue-100 text-blue-700', count: 45 },
  { id: 3, code: 'ANAL', name: 'ยาแก้ปวด', nameEn: 'Analgesic', color: 'bg-green-100 text-green-700', count: 67 },
  { id: 4, code: 'VITA', name: 'วิตามิน', nameEn: 'Vitamin', color: 'bg-yellow-100 text-yellow-700', count: 112 },
  { id: 5, code: 'HORM', name: 'ฮอร์โมน', nameEn: 'Hormone', color: 'bg-purple-100 text-purple-700', count: 38 },
  { id: 6, code: 'CARD', name: 'ยาโรคหัวใจ', nameEn: 'Cardiovascular', color: 'bg-pink-100 text-pink-700', count: 76 }
];

export const mockDrugTypes = [
  { id: 1, code: 'HAD', name: 'High Alert Drug', description: 'ยาที่ต้องระวังสูง', color: 'bg-red-500', count: 28 },
  { id: 2, code: 'NAR', name: 'ยาเสพติด', description: 'Narcotic drugs', color: 'bg-purple-500', count: 12 },
  { id: 3, code: 'REF', name: 'ยา Refer', description: 'ยาที่ต้องส่งต่อ', color: 'bg-orange-500', count: 45 },
  { id: 4, code: 'PSY', name: 'วัตถุออกฤทธิ์', description: 'Psychotropic', color: 'bg-pink-500', count: 34 },
  { id: 5, code: 'PRE', name: 'ยาควบคุมพิเศษ', description: 'Precursor', color: 'bg-indigo-500', count: 18 },
  { id: 6, code: 'OTC', name: 'ยาสามัญประจำบ้าน', description: 'Over the counter', color: 'bg-green-500', count: 156 }
];

export const mockStorageConditions = [
  { 
    id: 1, 
    code: 'RT', 
    name: 'อุณหภูมิห้อง', 
    nameEn: 'Room Temperature',
    temp: '15-30°C',
    humidity: '< 60%',
    icon: '🌡️',
    count: 567
  },
  { 
    id: 2, 
    code: 'REF', 
    name: 'ในตู้เย็น', 
    nameEn: 'Refrigerated',
    temp: '2-8°C',
    humidity: 'Controlled',
    icon: '❄️',
    count: 234
  },
  { 
    id: 3, 
    code: 'FRZ', 
    name: 'แช่แข็ง', 
    nameEn: 'Frozen',
    temp: '-20°C',
    humidity: 'N/A',
    icon: '🧊',
    count: 45
  },
  { 
    id: 4, 
    code: 'COOL', 
    name: 'เย็น', 
    nameEn: 'Cool',
    temp: '8-15°C',
    humidity: '< 60%',
    icon: '🌡️',
    count: 89
  },
  { 
    id: 5, 
    code: 'DRY', 
    name: 'ที่แห้ง', 
    nameEn: 'Dry Place',
    temp: 'Room temp',
    humidity: '< 40%',
    icon: '☀️',
    count: 123
  }
];