// lib/admin-utils.ts
// Utility functions สำหรับ Admin operations

export const roleTranslations = {
    HOSPITAL_ADMIN: 'ผู้ดูแลระบบโรงพยาบาล',
    PHARMACY_MANAGER: 'ผู้จัดการเภสัชกรรม',
    SENIOR_PHARMACIST: 'เภสัชกรอาวุโส',
    STAFF_PHARMACIST: 'เภสัชกรประจำ',
    DEPARTMENT_HEAD: 'หัวหน้าแผนก',
    STAFF_NURSE: 'พยาบาลประจำ',
    PHARMACY_TECHNICIAN: 'เทคนิคเภสัชกรรม'
  } as const;
  
  export const statusTranslations = {
    PENDING: 'รอการอนุมัติ',
    ACTIVE: 'ใช้งานได้',
    INACTIVE: 'ปิดการใช้งานชั่วคราว',
    SUSPENDED: 'ระงับการใช้งาน',
    DELETED: 'ลบแล้ว'
  } as const;
  
  export function translateRole(role: string): string {
    return roleTranslations[role as keyof typeof roleTranslations] || role;
  }
  
  export function translateStatus(status: string): string {
    return statusTranslations[status as keyof typeof statusTranslations] || status;
  }
  
  // ตรวจสอบสิทธิ์ว่าเป็น Admin หรือไม่
  export function isAdmin(userRole: string): boolean {
    return ['HOSPITAL_ADMIN', 'PHARMACY_MANAGER'].includes(userRole);
  }
  
  // ตรวจสอบว่าสามารถแก้ไขผู้ใช้คนนี้ได้หรือไม่
  export function canEditUser(adminRole: string, targetUserRole: string): boolean {
    // Hospital Admin สามารถแก้ไขทุกคนได้
    if (adminRole === 'HOSPITAL_ADMIN') return true;
    
    // Pharmacy Manager แก้ไขได้ทุกคนยกเว้น Hospital Admin
    if (adminRole === 'PHARMACY_MANAGER') {
      return targetUserRole !== 'HOSPITAL_ADMIN';
    }
    
    return false;
  }
  
  // ตรวจสอบว่าสามารถอนุมัติผู้ใช้คนนี้ได้หรือไม่
  export function canApproveUser(adminRole: string, targetUserRole: string): boolean {
    return canEditUser(adminRole, targetUserRole);
  }
  
  // ดึงสีสำหรับแต่ละบทบาท
  export function getRoleColor(role: string): string {
    const colors = {
      HOSPITAL_ADMIN: 'bg-red-100 text-red-800 border-red-200',
      PHARMACY_MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
      SENIOR_PHARMACIST: 'bg-blue-100 text-blue-800 border-blue-200',
      STAFF_PHARMACIST: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      DEPARTMENT_HEAD: 'bg-green-100 text-green-800 border-green-200',
      STAFF_NURSE: 'bg-teal-100 text-teal-800 border-teal-200',
      PHARMACY_TECHNICIAN: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  // ดึงสีสำหรับแต่ละสถานะ
  export function getStatusColor(status: string): string {
    const colors = {
      PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200',
      SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
      DELETED: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  // รายการบทบาทที่สามารถเลือกได้สำหรับแต่ละระดับ Admin
  export function getAvailableRoles(adminRole: string): string[] {
    if (adminRole === 'HOSPITAL_ADMIN') {
      // Hospital Admin สามารถสร้าง/แก้ไขทุกบทบาทได้
      return [
        'HOSPITAL_ADMIN',
        'PHARMACY_MANAGER',
        'SENIOR_PHARMACIST',
        'STAFF_PHARMACIST',
        'DEPARTMENT_HEAD',
        'STAFF_NURSE',
        'PHARMACY_TECHNICIAN'
      ];
    }
    
    if (adminRole === 'PHARMACY_MANAGER') {
      // Pharmacy Manager สามารถจัดการได้ทุกคนยกเว้น Hospital Admin
      return [
        'PHARMACY_MANAGER',
        'SENIOR_PHARMACIST',
        'STAFF_PHARMACIST',
        'DEPARTMENT_HEAD',
        'STAFF_NURSE',
        'PHARMACY_TECHNICIAN'
      ];
    }
    
    return [];
  }
  
  // ตรวจสอบความถูกต้องของข้อมูลผู้ใช้
  export function validateUserData(userData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!userData.email || !isValidEmail(userData.email)) {
      errors.push('อีเมลไม่ถูกต้อง');
    }
    
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร');
    }
    
    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('Username ต้องมีอย่างน้อย 3 ตัวอักษร');
    }
    
    if (!userData.role || !Object.keys(roleTranslations).includes(userData.role)) {
      errors.push('บทบาทไม่ถูกต้อง');
    }
    
    if (!userData.hospitalId) {
      errors.push('ต้องระบุโรงพยาบาล');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // ฟังก์ชันตรวจสอบอีเมล
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // ฟังก์ชันตรวจสอบเบอร์โทรศัพท์ไทย
  export function isValidThaiPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+66|0)[6-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
  }
  
  // ฟังก์ชันจัดรูปแบบเบอร์โทรศัพท์
  export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('66')) {
      return '+66-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4, 7) + '-' + cleaned.slice(7);
    }
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 6) + '-' + cleaned.slice(6);
    }
    return phone;
  }
  
  // สร้าง username อัตโนมัติจากชื่อ
  export function generateUsername(name: string, employeeId?: string): string {
    const nameBase = name.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\w]/g, '');
    
    if (employeeId) {
      return `${nameBase}_${employeeId}`;
    }
    
    const timestamp = Date.now().toString().slice(-4);
    return `${nameBase}_${timestamp}`;
  }
  
  // สร้างรหัสพนักงานแบบสุ่ม
  export function generateEmployeeId(role: string): string {
    const rolePrefix = {
      HOSPITAL_ADMIN: 'ADM',
      PHARMACY_MANAGER: 'PHM', 
      SENIOR_PHARMACIST: 'SPH',
      STAFF_PHARMACIST: 'STF',
      DEPARTMENT_HEAD: 'DEP',
      STAFF_NURSE: 'NUR',
      PHARMACY_TECHNICIAN: 'TEC'
    };
    
    const prefix = rolePrefix[role as keyof typeof rolePrefix] || 'USR';
    const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    
    return `${prefix}${number}`;
  }
  
  // ตรวจสอบความแรงของรหัสผ่าน
  export function validatePasswordStrength(password: string): { 
    isStrong: boolean; 
    score: number; 
    feedback: string[] 
  } {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length >= 8) score += 1;
    else feedback.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('ต้องมีตัวอักษรเล็ก');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('ต้องมีตัวอักษรใหญ่');
    
    if (/\d/.test(password)) score += 1;
    else feedback.push('ต้องมีตัวเลข');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('ต้องมีอักขระพิเศษ');
    
    return {
      isStrong: score >= 4,
      score,
      feedback
    };
  }