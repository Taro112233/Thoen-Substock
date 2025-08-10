// prisma/seed.ts - Enhanced Personnel Types Seed Script
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting enhanced database seed with Personnel Types...");

  try {
    // ================================
    // CREATE HOSPITALS
    // ================================
    console.log("🏥 Creating Hospitals...");

    const hospital1 = await prisma.hospital.upsert({
      where: { hospitalCode: "DEMO001" },
      update: {},
      create: {
        hospitalCode: "DEMO001",
        name: "โรงพยาบาลลำปาง",
        nameEn: "Lampang Hospital",
        type: "GOVERNMENT",
        status: "ACTIVE",
        address: "123 ถนนตะครอ",
        district: "เมือง",
        subDistrict: "ในเมือง", 
        province: "ลำปาง",
        postalCode: "52000",
        phone: "054-237-400",
        email: "info@lampang-hospital.go.th",
        website: "https://lampang-hospital.go.th",
        licenseNo: "LIC001",
        licenseExpiry: new Date("2025-12-31"),
        bedCount: 350,
        employeeCount: 280,
        establishedYear: 1952,
        subscriptionPlan: "PREMIUM",
        subscriptionStart: new Date(),
        subscriptionEnd: new Date("2025-12-31"),
        maxUsers: 100,
        maxWarehouses: 10,
        lastActivityAt: new Date(),
      },
    });

    const hospital2 = await prisma.hospital.upsert({
      where: { hospitalCode: "DEMO002" },
      update: {},
      create: {
        hospitalCode: "DEMO002",
        name: "โรงพยาบาลเถิน",
        nameEn: "Thoen Hospital",
        type: "COMMUNITY",
        status: "ACTIVE",
        address: "456 ถนนเถิน-ลำปาง",
        district: "เถิน",
        subDistrict: "เถิน", 
        province: "ลำปาง",
        postalCode: "52160",
        phone: "054-231-234",
        email: "info@thoen-hospital.go.th",
        licenseNo: "LIC002",
        licenseExpiry: new Date("2025-12-31"),
        bedCount: 120,
        employeeCount: 90,
        establishedYear: 1965,
        subscriptionPlan: "STANDARD",
        subscriptionStart: new Date(),
        subscriptionEnd: new Date("2025-12-31"),
        maxUsers: 50,
        maxWarehouses: 5,
        lastActivityAt: new Date(),
      },
    });

    const hospital3 = await prisma.hospital.upsert({
      where: { hospitalCode: "DEMO003" },
      update: {},
      create: {
        hospitalCode: "DEMO003",
        name: "โรงพยาบาลแม่ทะ",
        nameEn: "Mae Tha Hospital",
        type: "COMMUNITY",
        status: "ACTIVE",
        address: "789 ถนนแม่ทะ-ลำปาง",
        district: "แม่ทะ",
        subDistrict: "แม่ทะ", 
        province: "ลำปาง",
        postalCode: "52150",
        phone: "054-234-567",
        email: "info@maetha-hospital.go.th",
        licenseNo: "LIC003",
        licenseExpiry: new Date("2025-12-31"),
        bedCount: 80,
        employeeCount: 65,
        establishedYear: 1970,
        subscriptionPlan: "BASIC",
        subscriptionStart: new Date(),
        subscriptionEnd: new Date("2025-12-31"),
        maxUsers: 30,
        maxWarehouses: 3,
        lastActivityAt: new Date(),
      },
    });

    console.log("✅ Created hospitals:", [hospital1.name, hospital2.name, hospital3.name]);

    // ================================
    // CREATE SYSTEM DEVELOPER USER FIRST
    // ================================
    console.log("👤 Creating system developer user...");

    const hashedDevPassword = await hashPassword("dev123");
    const devUser = await prisma.user.upsert({
      where: { email: "dev@system.local" },
      update: {},
      create: {
        email: "dev@system.local",
        username: "developer",
        name: "System Developer",
        firstName: "System",
        lastName: "Developer", 
        phoneNumber: "0800000000",
        employeeId: "DEV001",
        position: "System Developer",
        role: "DEVELOPER",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        personnelTypeId: null, // จะอัพเดทภายหลัง
        isProfileComplete: true,
        emailVerified: true,
        password: hashedDevPassword,
      },
    });

    console.log("✅ Created developer user:", devUser.email);

    // ================================
    // CREATE PERSONNEL TYPES FOR ALL HOSPITALS
    // ================================
    console.log("🎯 Creating Personnel Types (Master Data)...");

    type PersonnelHierarchy = "DEVELOPER" | "DIRECTOR" | "GROUP_HEAD" | "STAFF" | "STUDENT";
    
    const personnelTypesTemplate = [
      {
        typeCode: "DEV",
        typeName: "นักพัฒนา",
        typeNameEn: "Developer", 
        hierarchy: "DEVELOPER" as PersonnelHierarchy,
        levelOrder: 1,
        canManageHospitals: true,
        canManageWarehouses: true,
        canManageDepartments: true,
        canManagePersonnel: true,
        canManageDrugs: true,
        canManageMasterData: true,
        canViewReports: true,
        canApproveUsers: true,
        description: "ผู้พัฒนาระบบ มีสิทธิ์สูงสุดในการจัดการข้อมูลทั้งหมด",
        responsibilities: ["พัฒนาระบบ", "ดูแลระบบ", "จัดการข้อมูลหลัก", "แก้ไขปัญหาเทคนิค"],
        isSystemDefault: true,
      },
      {
        typeCode: "DIR",
        typeName: "ผู้อำนวยการ",
        typeNameEn: "Director",
        hierarchy: "DIRECTOR" as PersonnelHierarchy, 
        levelOrder: 10,
        canManageHospitals: false,
        canManageWarehouses: true,
        canManageDepartments: true,
        canManagePersonnel: true,
        canManageDrugs: true,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: true,
        description: "ผู้อำนวยการโรงพยาบาล บริหารจัดการระดับสูง",
        responsibilities: ["บริหารโรงพยาบาล", "อนุมัติงบประมาณ", "กำหนดนโยบาย", "ควบคุมคุณภาพ"],
        maxSubordinates: 50,
        defaultDepartmentType: "ADMINISTRATION",
      },
      {
        typeCode: "ASST_DIR",
        typeName: "รองผู้อำนวยการ",
        typeNameEn: "Assistant Director",
        hierarchy: "DIRECTOR" as PersonnelHierarchy,
        levelOrder: 15,
        canManageHospitals: false,
        canManageWarehouses: true,
        canManageDepartments: true,
        canManagePersonnel: false,
        canManageDrugs: true,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: true,
        description: "รองผู้อำนวยการ ช่วยบริหารงานระดับสูง",
        responsibilities: ["ช่วยบริหารโรงพยาบาล", "ควบคุมการดำเนินงาน", "กำกับแผนก"],
        maxSubordinates: 30,
      },
      {
        typeCode: "CHIEF_PHARM",
        typeName: "หัวหน้าเภสัชกรรม",
        typeNameEn: "Chief Pharmacist",
        hierarchy: "GROUP_HEAD" as PersonnelHierarchy,
        levelOrder: 20,
        canManageHospitals: false,
        canManageWarehouses: true,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: true,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: false,
        description: "หัวหน้าแผนกเภสัชกรรม ดูแลงานยาและเวชภัณฑ์",
        responsibilities: ["จัดการระบบยา", "ควบคุมคุณภาพยา", "อนุมัติการเบิกจ่าย", "บริหารคลังยา"],
        maxSubordinates: 15,
        defaultDepartmentType: "PHARMACY",
      },
      {
        typeCode: "CHIEF_NURSE",
        typeName: "หัวหน้าพยาบาล",
        typeNameEn: "Chief Nurse",
        hierarchy: "GROUP_HEAD" as PersonnelHierarchy,
        levelOrder: 20,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: false,
        description: "หัวหน้าฝ่ายการพยาบาล ดูแลงานพยาบาล",
        responsibilities: ["บริหารงานพยาบาล", "ควบคุมคุณภาพการดูแล", "พัฒนาบุคลากร"],
        maxSubordinates: 20,
        defaultDepartmentType: "NURSING",
      },
      {
        typeCode: "DEPT_HEAD",
        typeName: "หัวหน้าแผนก",
        typeNameEn: "Department Head",
        hierarchy: "GROUP_HEAD" as PersonnelHierarchy,
        levelOrder: 25,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: false,
        description: "หัวหน้าแผนกต่างๆ ดูแลงานเฉพาะด้าน",
        responsibilities: ["บริหารแผนก", "ควบคุมงานประจำ", "รายงานผลการดำเนินงาน"],
        maxSubordinates: 12,
      },
      {
        typeCode: "SR_PHARM",
        typeName: "เภสัชกรชำนาญการ",
        typeNameEn: "Senior Pharmacist",
        hierarchy: "STAFF" as PersonnelHierarchy,
        levelOrder: 30,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: true,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: false,
        description: "เภสัชกรชำนาญการ มีประสบการณ์สูง",
        responsibilities: ["จ่ายยาผู้ป่วยใน", "ให้คำปรึกษายา", "ตรวจสอบคำสั่งยา", "ควบคุมยาพิเศษ"],
        maxSubordinates: 5,
        defaultDepartmentType: "PHARMACY",
      },
      {
        typeCode: "PHARM",
        typeName: "เภสัชกร",
        typeNameEn: "Pharmacist",
        hierarchy: "STAFF" as PersonnelHierarchy,
        levelOrder: 35,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: false,
        description: "เภสัชกรปฏิบัติการ จ่ายยาและให้คำปรึกษา",
        responsibilities: ["จ่ายยาผู้ป่วยนอก", "ให้คำปรึกษายา", "บันทึกข้อมูลยา"],
        defaultDepartmentType: "PHARMACY",
      },
      {
        typeCode: "SR_NURSE",
        typeName: "พยาบาลวิชาชีพชำนาญการ",
        typeNameEn: "Senior Nurse",
        hierarchy: "STAFF" as PersonnelHierarchy,
        levelOrder: 30,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: false,
        description: "พยาบาลวิชาชีพชำนาญการ ดูแลผู้ป่วยและควบคุมงาน",
        responsibilities: ["ดูแลผู้ป่วย", "เบิกยาประจำแผนก", "ควบคุมงานพยาบาล"],
        maxSubordinates: 8,
      },
      {
        typeCode: "NURSE",
        typeName: "พยาบาลวิชาชีพ",
        typeNameEn: "Registered Nurse",
        hierarchy: "STAFF" as PersonnelHierarchy,
        levelOrder: 35,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: false,
        canApproveUsers: false,
        description: "พยาบาลวิชาชีพ ดูแลผู้ป่วยโดยตรง",
        responsibilities: ["ดูแลผู้ป่วย", "ให้ยาตามแพทย์สั่ง", "บันทึกสัญญาณชีพ"],
      },
      {
        typeCode: "NURSE_ASS",
        typeName: "ผู้ช่วยพยาบาล",
        typeNameEn: "Nursing Assistant",
        hierarchy: "STAFF" as PersonnelHierarchy,
        levelOrder: 40,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: false,
        canApproveUsers: false,
        description: "ผู้ช่วยพยาบาล ช่วยงานการพยาบาล",
        responsibilities: ["ช่วยดูแลผู้ป่วย", "ช่วยงานประจำ", "ติดต่อประสานงาน"],
      },
      {
        typeCode: "PHARM_TECH",
        typeName: "ผู้ช่วยเภสัชกร",
        typeNameEn: "Pharmacy Technician",
        hierarchy: "STAFF" as PersonnelHierarchy,
        levelOrder: 40,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: false,
        canApproveUsers: false,
        description: "ผู้ช่วยเภสัชกร ช่วยงานเภสัชกรรม",
        responsibilities: ["ช่วยจ่ายยา", "จัดเก็บยา", "ช่วยงานคลัง"],
        defaultDepartmentType: "PHARMACY",
      },
      {
        typeCode: "ADMIN",
        typeName: "เจ้าหน้าที่บริหาร",
        typeNameEn: "Administrative Staff",
        hierarchy: "STAFF" as PersonnelHierarchy,
        levelOrder: 35,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: false,
        description: "เจ้าหน้าที่บริหารงานทั่วไป",
        responsibilities: ["งานสารบรรณ", "ประสานงาน", "จัดการข้อมูล"],
        defaultDepartmentType: "ADMINISTRATION",
      },
      {
        typeCode: "INTERN_PHARM",
        typeName: "นักศึกษาเภสัชศาสตร์",
        typeNameEn: "Pharmacy Intern",
        hierarchy: "STUDENT" as PersonnelHierarchy,
        levelOrder: 50,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: false,
        canApproveUsers: false,
        description: "นักศึกษาเภสัชศาสตร์ฝึกงาน",
        responsibilities: ["เรียนรู้การจ่ายยา", "ช่วยงานเภสัชกร", "ศึกษาระบบงาน"],
        defaultDepartmentType: "PHARMACY",
      },
      {
        typeCode: "INTERN_NURSE",
        typeName: "นักศึกษาพยาบาล",
        typeNameEn: "Nursing Student",
        hierarchy: "STUDENT" as PersonnelHierarchy,
        levelOrder: 50,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: false,
        canApproveUsers: false,
        description: "นักศึกษาพยาบาลฝึกงาน",
        responsibilities: ["เรียนรู้การดูแลผู้ป่วย", "ช่วยงานพยาบาล", "ศึกษาการปฏิบัติงาน"],
      },
      {
        typeCode: "TRAINEE",
        typeName: "พนักงานฝึกหัด",
        typeNameEn: "Trainee",
        hierarchy: "STUDENT" as PersonnelHierarchy,
        levelOrder: 55,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: false,
        canApproveUsers: false,
        description: "พนักงานฝึกหัดใหม่",
        responsibilities: ["เรียนรู้งานใหม่", "ช่วยงานพื้นฐาน", "ปฏิบัติตามคำแนะนำ"],
      },
    ];

    // สร้าง Personnel Types สำหรับทุกโรงพยาบาล
    const allPersonnelTypes: Record<string, any[]> = {};
    
    for (const hospital of [hospital1, hospital2, hospital3]) {
      console.log(`🏥 Creating Personnel Types for ${hospital.name}...`);
      
      const hospitalPersonnelTypes: any[] = [];
      
      for (const template of personnelTypesTemplate) {
        const created = await prisma.personnelType.upsert({
          where: { 
            hospitalId_typeCode: {
              hospitalId: hospital.id,
              typeCode: template.typeCode
            }
          },
          update: {},
          create: {
            ...template,
            hospitalId: hospital.id,
            createdBy: devUser.id
          }
        });
        hospitalPersonnelTypes.push(created);
        console.log(`  ✅ ${template.typeName} (${template.typeCode})`);
      }
      
      allPersonnelTypes[hospital.id] = hospitalPersonnelTypes;
    }

    // อัพเดท Developer User ให้มี Personnel Type
    const devPersonnelType = allPersonnelTypes[hospital1.id].find(pt => pt.typeCode === "DEV");
    await prisma.user.update({
      where: { id: devUser.id },
      data: { personnelTypeId: devPersonnelType.id }
    });

    console.log("✅ Updated developer user with personnel type");

    // ================================
    // CREATE DEPARTMENTS
    // ================================
    console.log("🏢 Creating Departments...");

    const departmentTemplates = [
      {
        departmentCode: "ADMIN",
        name: "ฝ่ายบริหาร",
        nameEn: "Administration Department",
        type: "ADMINISTRATION",
        location: "ชั้น 1 อาคารบริหาร",
        phone: "100",
        email: "admin@hospital.go.th",
      },
      {
        departmentCode: "PHARM",
        name: "เภสัชกรรม",
        nameEn: "Pharmacy Department",
        type: "PHARMACY",
        location: "ชั้น 1 อาคารผู้ป่วยนอก",
        phone: "101",
        email: "pharmacy@hospital.go.th",
      },
      {
        departmentCode: "EMERG",
        name: "ห้องฉุกเฉิน", 
        nameEn: "Emergency Department",
        type: "EMERGENCY",
        location: "ชั้น 1 อาคารอุบัติเหตุและฉุกเฉิน",
        phone: "911",
        email: "emergency@hospital.go.th",
      },
      {
        departmentCode: "ICU",
        name: "หอผู้ป่วยวิกฤต",
        nameEn: "Intensive Care Unit", 
        type: "ICU",
        location: "ชั้น 3 อาคารผู้ป่วยใน",
        phone: "301",
        email: "icu@hospital.go.th",
      },
      {
        departmentCode: "OR",
        name: "ห้องผ่าตัด",
        nameEn: "Operating Room",
        type: "SURGERY", 
        location: "ชั้น 2 อาคารผู้ป่วยใน",
        phone: "201",
        email: "or@hospital.go.th",
      },
      {
        departmentCode: "OPD",
        name: "ผู้ป่วยนอก",
        nameEn: "Out Patient Department",
        type: "OUTPATIENT",
        location: "ชั้น 1-2 อาคารผู้ป่วยนอก",
        phone: "102",
        email: "opd@hospital.go.th",
      },
      {
        departmentCode: "IPD",
        name: "ผู้ป่วยใน", 
        nameEn: "In Patient Department",
        type: "INPATIENT",
        location: "ชั้น 4-8 อาคารผู้ป่วยใน",
        phone: "401",
        email: "ipd@hospital.go.th",
      }
    ];

    for (const hospital of [hospital1, hospital2, hospital3]) {
      for (const template of departmentTemplates) {
        await prisma.department.upsert({
          where: { 
            hospitalId_departmentCode: {
              hospitalId: hospital.id,
              departmentCode: template.departmentCode,
            }
          },
          update: {},
          create: {
            hospitalId: hospital.id,
            departmentCode: template.departmentCode,
            name: template.name,
            nameEn: template.nameEn,
            type: template.type as any,
            location: template.location,
            phone: template.phone,
            email: template.email.replace("@hospital.go.th", `@${hospital.hospitalCode.toLowerCase()}.go.th`),
            isActive: true,
          },
        });
      }
      console.log(`  ✅ Created departments for ${hospital.name}`);
    }

    // ================================
    // CREATE DIVERSE USERS
    // ================================
    console.log("👥 Creating Diverse Users with Personnel Types...");

    // Get departments for assignments
    const adminDept1 = await prisma.department.findFirst({ where: { departmentCode: "ADMIN", hospitalId: hospital1.id } });
    const pharmDept1 = await prisma.department.findFirst({ where: { departmentCode: "PHARM", hospitalId: hospital1.id } });
    const icuDept1 = await prisma.department.findFirst({ where: { departmentCode: "ICU", hospitalId: hospital1.id } });
    const emergDept1 = await prisma.department.findFirst({ where: { departmentCode: "EMERG", hospitalId: hospital1.id } });
    const opdDept1 = await prisma.department.findFirst({ where: { departmentCode: "OPD", hospitalId: hospital1.id } });

    const userTemplates = [
      // Hospital 1 - Lampang Hospital
      {
        email: "director@lampang-hospital.go.th",
        username: "director01",
        name: "นายวิชัย ใจดี",
        firstName: "วิชัย",
        lastName: "ใจดี",
        phoneNumber: "054-237-400",
        employeeId: "DIR001", 
        position: "ผู้อำนวยการโรงพยาบาลลำปาง",
        role: "DIRECTOR",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: adminDept1?.id,
        personnelTypeCode: "DIR",
        password: "director123"
      },
      {
        email: "asst.director@lampang-hospital.go.th",
        username: "asst_director01",
        name: "นางสาวสุดา ช่วยงาน",
        firstName: "สุดา",
        lastName: "ช่วยงาน",
        phoneNumber: "054-237-401",
        employeeId: "ADIR001", 
        position: "รองผู้อำนวยการโรงพยาบาลลำปาง",
        role: "DIRECTOR",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: adminDept1?.id,
        personnelTypeCode: "ASST_DIR",
        password: "asst123"
      },
      {
        email: "chief.pharm@lampang-hospital.go.th",
        username: "chief_pharm01",
        name: "นางสมใจ ยาดี",
        firstName: "สมใจ",
        lastName: "ยาดี",
        phoneNumber: "054-237-411",
        employeeId: "PH001",
        position: "หัวหน้าแผนกเภสัชกรรม",
        role: "GROUP_HEAD",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: pharmDept1?.id,
        personnelTypeCode: "CHIEF_PHARM",
        password: "chief123"
      },
      {
        email: "chief.nurse@lampang-hospital.go.th",
        username: "chief_nurse01",
        name: "นางพยาบาลใหญ่ ดูแลดี",
        firstName: "พยาบาลใหญ่",
        lastName: "ดูแลดี",
        phoneNumber: "054-237-321",
        employeeId: "CN001",
        position: "หัวหน้าฝ่ายการพยาบาล",
        role: "GROUP_HEAD",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: icuDept1?.id,
        personnelTypeCode: "CHIEF_NURSE",
        password: "nurse123"
      },
      {
        email: "sr.pharm@lampang-hospital.go.th",
        username: "sr_pharm01",
        name: "นายเภสัช ชำนาญการ",
        firstName: "เภสัช",
        lastName: "ชำนาญการ",
        phoneNumber: "054-237-412",
        employeeId: "SPH001",
        position: "เภสัชกรชำนาญการ",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: pharmDept1?.id,
        personnelTypeCode: "SR_PHARM",
        password: "srpharm123"
      },
      {
        email: "pharm01@lampang-hospital.go.th",
        username: "pharm01",
        name: "นางสาวยาใส จ่ายดี",
        firstName: "ยาใส",
        lastName: "จ่ายดี",
        phoneNumber: "054-237-413",
        employeeId: "PH002",
        position: "เภสัชกร",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: pharmDept1?.id,
        personnelTypeCode: "PHARM",
        password: "pharm123"
      },
      {
        email: "pharm02@lampang-hospital.go.th",
        username: "pharm02",
        name: "นายยาสมุนไพร รักษาโรค",
        firstName: "ยาสมุนไพร",
        lastName: "รักษาโรค",
        phoneNumber: "054-237-414",
        employeeId: "PH003",
        position: "เภสัชกร",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: pharmDept1?.id,
        personnelTypeCode: "PHARM",
        password: "pharm123"
      },
      {
        email: "sr.nurse@lampang-hospital.go.th",
        username: "sr_nurse01",
        name: "นางพยาบาล ชำนาญงาน",
        firstName: "พยาบาล",
        lastName: "ชำนาญงาน",
        phoneNumber: "054-237-322",
        employeeId: "SN001",
        position: "พยาบาลวิชาชีพชำนาญการ",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: icuDept1?.id,
        personnelTypeCode: "SR_NURSE",
        password: "srnurse123"
      },
      {
        email: "nurse01@lampang-hospital.go.th",
        username: "nurse01",
        name: "นางสาวพยาบาล ดูแลใจ",
        firstName: "พยาบาล",
        lastName: "ดูแลใจ",
        phoneNumber: "054-237-323",
        employeeId: "N001",
        position: "พยาบาลวิชาชีพ",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: icuDept1?.id,
        personnelTypeCode: "NURSE",
        password: "nurse123"
      },
      {
        email: "nurse02@lampang-hospital.go.th",
        username: "nurse02",
        name: "นางพยาบาล ใจเย็น",
        firstName: "พยาบาล",
        lastName: "ใจเย็น",
        phoneNumber: "054-237-324",
        employeeId: "N002",
        position: "พยาบาลวิชาชีพ",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: emergDept1?.id,
        personnelTypeCode: "NURSE",
        password: "nurse123"
      },
      {
        email: "nurse.assist@lampang-hospital.go.th",
        username: "nurse_assist01",
        name: "นายช่วยพยาบาล ขยันงาน",
        firstName: "ช่วยพยาบาล",
        lastName: "ขยันงาน",
        phoneNumber: "054-237-325",
        employeeId: "NA001",
        position: "ผู้ช่วยพยาบาล",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: opdDept1?.id,
        personnelTypeCode: "NURSE_ASS",
        password: "assist123"
      },
      {
        email: "pharm.tech@lampang-hospital.go.th",
        username: "pharm_tech01",
        name: "นางสาวช่วยเภสัช คล่องแคล่ว",
        firstName: "ช่วยเภสัช",
        lastName: "คล่องแคล่ว",
        phoneNumber: "054-237-415",
        employeeId: "PT001",
        position: "ผู้ช่วยเภสัชกร",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: pharmDept1?.id,
        personnelTypeCode: "PHARM_TECH",
        password: "tech123"
      },
      {
        email: "admin@lampang-hospital.go.th",
        username: "admin01",
        name: "นางสาวธุรการ จัดระเบียบ",
        firstName: "ธุรการ",
        lastName: "จัดระเบียบ",
        phoneNumber: "054-237-100",
        employeeId: "AD001",
        position: "เจ้าหน้าที่บริหารงานทั่วไป",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital1.id,
        departmentId: adminDept1?.id,
        personnelTypeCode: "ADMIN",
        password: "admin123"
      },
      {
        email: "intern.pharm@lampang-hospital.go.th",
        username: "intern_pharm01",
        name: "นายนักศึกษา ฝึกหัดยา",
        firstName: "นักศึกษา",
        lastName: "ฝึกหัดยา",
        phoneNumber: "081-234-5678",
        employeeId: "IP001",
        position: "นักศึกษาเภสัชศาสตร์ฝึกงาน",
        role: "STUDENT",
        status: "PENDING",
        hospitalId: hospital1.id,
        departmentId: pharmDept1?.id,
        personnelTypeCode: "INTERN_PHARM",
        password: "intern123"
      },
      {
        email: "intern.nurse@lampang-hospital.go.th",
        username: "intern_nurse01",
        name: "นางสาวนักศึกษา ฝึกพยาบาล",
        firstName: "นักศึกษา",
        lastName: "ฝึกพยาบาล",
        phoneNumber: "081-234-5679",
        employeeId: "IN001",
        position: "นักศึกษาพยาบาลฝึกงาน",
        role: "STUDENT",
        status: "PENDING",
        hospitalId: hospital1.id,
        departmentId: icuDept1?.id,
        personnelTypeCode: "INTERN_NURSE",
        password: "intern123"
      },
      {
        email: "trainee@lampang-hospital.go.th",
        username: "trainee01",
        name: "นายพนักงานใหม่ เรียนรู้งาน",
        firstName: "พนักงานใหม่",
        lastName: "เรียนรู้งาน",
        phoneNumber: "081-234-5680",
        employeeId: "TR001",
        position: "พนักงานฝึกหัด",
        role: "STAFF",
        status: "PENDING",
        hospitalId: hospital1.id,
        departmentId: adminDept1?.id,
        personnelTypeCode: "TRAINEE",
        password: "trainee123"
      },

      // Hospital 2 - Thoen Hospital Users
      {
        email: "director@thoen-hospital.go.th",
        username: "director02",
        name: "นายผู้อำนวยการ โรงพยาบาลเถิน",
        firstName: "ผู้อำนวยการ",
        lastName: "โรงพยาบาลเถิน",
        phoneNumber: "054-231-234",
        employeeId: "DIR002", 
        position: "ผู้อำนวยการโรงพยาบาลเถิน",
        role: "DIRECTOR",
        status: "ACTIVE",
        hospitalId: hospital2.id,
        personnelTypeCode: "DIR",
        password: "director123"
      },
      {
        email: "pharm@thoen-hospital.go.th",
        username: "pharm_thoen",
        name: "นางเภสัช โรงพยาบาลเถิน",
        firstName: "เภสัช",
        lastName: "โรงพยาบาลเถิน",
        phoneNumber: "054-231-235",
        employeeId: "PH004",
        position: "เภสัชกรหัวหน้า",
        role: "GROUP_HEAD",
        status: "ACTIVE",
        hospitalId: hospital2.id,
        personnelTypeCode: "CHIEF_PHARM",
        password: "pharm123"
      },
      {
        email: "nurse@thoen-hospital.go.th",
        username: "nurse_thoen",
        name: "นางพยาบาล โรงพยาบาลเถิน",
        firstName: "พยาบาล",
        lastName: "โรงพยาบาลเถิน",
        phoneNumber: "054-231-236",
        employeeId: "N003",
        position: "พยาบาลวิชาชีพ",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital2.id,
        personnelTypeCode: "NURSE",
        password: "nurse123"
      },

      // Hospital 3 - Mae Tha Hospital Users
      {
        email: "director@maetha-hospital.go.th",
        username: "director03",
        name: "นายผู้อำนวยการ โรงพยาบาลแม่ทะ",
        firstName: "ผู้อำนวยการ",
        lastName: "โรงพยาบาลแม่ทะ",
        phoneNumber: "054-234-567",
        employeeId: "DIR003", 
        position: "ผู้อำนวยการโรงพยาบาลแม่ทะ",
        role: "DIRECTOR",
        status: "ACTIVE",
        hospitalId: hospital3.id,
        personnelTypeCode: "DIR",
        password: "director123"
      },
      {
        email: "pharm@maetha-hospital.go.th",
        username: "pharm_maetha",
        name: "นายเภสัช โรงพยาบาลแม่ทะ",
        firstName: "เภสัช",
        lastName: "โรงพยาบาลแม่ทะ",
        phoneNumber: "054-234-568",
        employeeId: "PH005",
        position: "เภสัชกร",
        role: "STAFF",
        status: "ACTIVE",
        hospitalId: hospital3.id,
        personnelTypeCode: "PHARM",
        password: "pharm123"
      }
    ];

    // สร้าง Users และ assign Personnel Types
    for (const template of userTemplates) {
      const hashedPassword = await hashPassword(template.password);
      const personnelType = allPersonnelTypes[template.hospitalId].find(pt => pt.typeCode === template.personnelTypeCode);
      
      const user = await prisma.user.upsert({
        where: { email: template.email },
        update: {},
        create: {
          email: template.email,
          username: template.username,
          name: template.name,
          firstName: template.firstName,
          lastName: template.lastName,
          phoneNumber: template.phoneNumber,
          employeeId: template.employeeId,
          position: template.position,
          role: template.role as any,
          status: template.status as any,
          hospitalId: template.hospitalId,
          departmentId: template.departmentId,
          personnelTypeId: personnelType?.id,
          isProfileComplete: true,
          emailVerified: true,
          password: hashedPassword,
        },
      });
      
      console.log(`✅ Created user: ${user.name} (${template.personnelTypeCode})`);
    }

    // ================================
    // CREATE MASTER DATA (ย่อๆ)
    // ================================
    console.log("💊 Creating Basic Master Data...");

    // Drug Forms
    const drugForms = [
      { formCode: "TAB", formName: "ยาเม็ด", formNameEn: "Tablet", category: "ORAL" },
      { formCode: "CAP", formName: "ยาแคปซูล", formNameEn: "Capsule", category: "ORAL" },
      { formCode: "INJ", formName: "ยาฉีด", formNameEn: "Injection", category: "INJECTION" },
      { formCode: "SYR", formName: "ยาน้ำ", formNameEn: "Syrup", category: "ORAL" },
      { formCode: "CRE", formName: "ครีม", formNameEn: "Cream", category: "TOPICAL" }
    ];

    for (const hospital of [hospital1, hospital2, hospital3]) {
      for (const form of drugForms) {
        await prisma.drugForm.upsert({
          where: {
            hospitalId_formCode: {
              hospitalId: hospital.id,
              formCode: form.formCode
            }
          },
          update: {},
          create: {
            ...form,
            hospitalId: hospital.id,
            isSystemDefault: true,
            createdBy: devUser.id
          }
        });
      }
    }

    console.log("✅ Created drug forms for all hospitals");

    // ================================
    // SUMMARY
    // ================================
    console.log("\n🎉 Enhanced Personnel Types seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`🏥 Hospitals: ${[hospital1, hospital2, hospital3].length}`);
    console.log(`👥 Personnel Types: ${personnelTypesTemplate.length} × 3 hospitals = ${personnelTypesTemplate.length * 3}`);
    console.log(`👤 Users: ${userTemplates.length + 1} (including dev user)`);
    
    console.log("\n📋 Test Accounts by Role:");
    console.log("🔧 DEVELOPER:");
    console.log("  - dev@system.local / dev123");
    
    console.log("\n👨‍💼 DIRECTORS:");
    console.log("  - director@lampang-hospital.go.th / director123 (ผู้อำนวยการ)");
    console.log("  - asst.director@lampang-hospital.go.th / asst123 (รองผู้อำนวยการ)");
    console.log("  - director@thoen-hospital.go.th / director123");
    console.log("  - director@maetha-hospital.go.th / director123");
    
    console.log("\n👥 GROUP HEADS:");
    console.log("  - chief.pharm@lampang-hospital.go.th / chief123 (หัวหน้าเภสัชกรรม)");
    console.log("  - chief.nurse@lampang-hospital.go.th / nurse123 (หัวหน้าพยาบาล)");
    console.log("  - pharm@thoen-hospital.go.th / pharm123 (หัวหน้าเภสัชกรรม)");
    
    console.log("\n👩‍⚕️ STAFF:");
    console.log("  - sr.pharm@lampang-hospital.go.th / srpharm123 (เภสัชกรชำนาญการ)");
    console.log("  - pharm01@lampang-hospital.go.th / pharm123 (เภสัชกร)");
    console.log("  - pharm02@lampang-hospital.go.th / pharm123 (เภสัชกร)");
    console.log("  - sr.nurse@lampang-hospital.go.th / srnurse123 (พยาบาลชำนาญการ)");
    console.log("  - nurse01@lampang-hospital.go.th / nurse123 (พยาบาล ICU)");
    console.log("  - nurse02@lampang-hospital.go.th / nurse123 (พยาบาล ER)");
    console.log("  - nurse.assist@lampang-hospital.go.th / assist123 (ผู้ช่วยพยาบาล)");
    console.log("  - pharm.tech@lampang-hospital.go.th / tech123 (ผู้ช่วยเภสัชกร)");
    console.log("  - admin@lampang-hospital.go.th / admin123 (เจ้าหน้าที่บริหาร)");
    
    console.log("\n🎓 STUDENTS (PENDING APPROVAL):");
    console.log("  - intern.pharm@lampang-hospital.go.th / intern123 (นักศึกษาเภสัชศาสตร์)");
    console.log("  - intern.nurse@lampang-hospital.go.th / intern123 (นักศึกษาพยาบาล)");
    console.log("  - trainee@lampang-hospital.go.th / trainee123 (พนักงานฝึกหัด)");
    
    console.log("\n🎯 Personnel Types Created:");
    personnelTypesTemplate.forEach(pt => {
      console.log(`  - ${pt.typeCode}: ${pt.typeName} (${pt.hierarchy}, Level ${pt.levelOrder})`);
    });
    
    console.log("\n📝 Next Steps:");
    console.log("1. Run: pnpm dev");
    console.log("2. Login as dev@system.local / dev123");
    console.log("3. Test Personnel Types Management at /admin/personnel-types");
    console.log("4. Directors can approve pending users");
    console.log("5. Test role-based permissions");
    console.log("6. Verify multi-tenant isolation between hospitals");

  } catch (error) {
    console.error("❌ Seed error:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Database connection closed");
  })
  .catch(async (e) => {
    console.error("❌ Fatal seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });