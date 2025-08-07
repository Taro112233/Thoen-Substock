// prisma/seed.ts - Enhanced Seed Script with Master Data (FIXED)
import { PrismaClient, PersonnelHierarchy } from "@prisma/client";
import { hashPassword } from "../lib/password-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting enhanced database seed with Master Data...");

  try {
    // สร้างโรงพยาบาลตัวอย่าง
    const hospital = await prisma.hospital.upsert({
      where: { hospitalCode: "DEMO001" },
      update: {},
      create: {
        hospitalCode: "DEMO001",
        name: "โรงพยาบาลลำปาง",
        nameEn: "Lampang Hospital",
        type: "GOVERNMENT",
        status: "ACTIVE",
        address: "123 ถนนตะครอ",
        district: "ในเมือง",
        subDistrict: "เมือง", 
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

    console.log("✅ Created hospital:", hospital.name);

    // สร้างโรงพยาบาลเพิ่มเติม
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
        district: "ในเมือง",
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

    console.log("✅ Created hospital:", hospital2.name);

    // ================================
    // CREATE SYSTEM USER FIRST (ไม่มี PersonnelType)
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
        hospitalId: hospital.id,
        personnelTypeId: null, // ยังไม่มี PersonnelType
        isProfileComplete: true,
        emailVerified: true,
        password: hashedDevPassword,
      },
    });

    console.log("✅ Created developer user:", devUser.email);

    // ================================
    // MASTER DATA - PERSONNEL TYPES (ใช้ devUser.id แทน "system")
    // ================================
    console.log("🎯 Creating Personnel Types (Master Data)...");

    const personnelTypes = [
      {
        typeCode: "DEV",
        typeName: "นักพัฒนา",
        typeNameEn: "Developer", 
        hierarchy: PersonnelHierarchy.DEVELOPER, // ใช้ enum จาก Prisma
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
        isSystemDefault: true,
      },
      {
        typeCode: "DIR",
        typeName: "ผู้อำนวยการ",
        typeNameEn: "Director",
        hierarchy: PersonnelHierarchy.DIRECTOR, 
        levelOrder: 2,
        canManageHospitals: false,
        canManageWarehouses: true,
        canManageDepartments: true,
        canManagePersonnel: true,
        canManageDrugs: true,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: true,
        description: "ผู้อำนวยการโรงพยาบาล บริหารจัดการระดับสูง",
        maxSubordinates: 50,
      },
      {
        typeCode: "GRP_HEAD",
        typeName: "หัวหน้ากลุ่มงาน",
        typeNameEn: "Group Head",
        hierarchy: PersonnelHierarchy.GROUP_HEAD,
        levelOrder: 3, 
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: true,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: false,
        description: "หัวหน้ากลุ่มงาน ดูแลงานเฉพาะด้าน",
        maxSubordinates: 15,
      },
      {
        typeCode: "STAFF",
        typeName: "พนักงาน",
        typeNameEn: "Staff",
        hierarchy: PersonnelHierarchy.STAFF,
        levelOrder: 4,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: true,
        canApproveUsers: false,
        description: "พนักงานทั่วไป ปฏิบัติงานตามหน้าที่",
      },
      {
        typeCode: "STU",
        typeName: "นักศึกษา",
        typeNameEn: "Student",
        hierarchy: PersonnelHierarchy.STUDENT,
        levelOrder: 5,
        canManageHospitals: false,
        canManageWarehouses: false,
        canManageDepartments: false,
        canManagePersonnel: false,
        canManageDrugs: false,
        canManageMasterData: false,
        canViewReports: false,
        canApproveUsers: false,
        description: "นักศึกษาฝึกงาน สิทธิ์จำกัด",
      }
    ];

    // สร้าง PersonnelTypes ใช้ devUser.id แทน "system"
    const createdPersonnelTypes: any[] = [];
    
    for (const personnelType of personnelTypes) {
      const created = await prisma.personnelType.upsert({
        where: { 
          hospitalId_typeCode: {
            hospitalId: hospital.id,
            typeCode: personnelType.typeCode
          }
        },
        update: {},
        create: {
          ...personnelType,
          hospitalId: hospital.id,
          createdBy: devUser.id // ใช้ devUser.id แทน "system"
        }
      });
      createdPersonnelTypes.push(created);
      console.log(`✅ Created personnel type: ${personnelType.typeName}`);
    }

    // อัพเดท devUser ให้มี personnelTypeId
    const devPersonnelType = createdPersonnelTypes.find(pt => pt.typeCode === "DEV");
    await prisma.user.update({
      where: { id: devUser.id },
      data: { personnelTypeId: devPersonnelType.id }
    });

    console.log("✅ Updated developer user with personnel type");

    // ================================
    // MASTER DATA - DRUG FORMS
    // ================================
    console.log("💊 Creating Drug Forms (Master Data)...");

    const drugForms = [
      {
        formCode: "TAB",
        formName: "ยาเม็ด",
        formNameEn: "Tablet",
        category: "ORAL",
        description: "ยารูปแบบเม็ด สำหรับรับประทาน",
        usageInstructions: "รับประทานพร้อมน้ำ",
        commonStrengths: ["250mg", "500mg", "1g"],
        standardUnits: ["tablet", "tabs"]
      },
      {
        formCode: "CAP",
        formName: "ยาแคปซูล",
        formNameEn: "Capsule", 
        category: "ORAL",
        description: "ยารูปแบบแคปซูล สำหรับรับประทาน",
        usageInstructions: "รับประทานทั้งเม็ด ห้ามเปิด",
        commonStrengths: ["250mg", "500mg"],
        standardUnits: ["capsule", "caps"]
      },
      {
        formCode: "INJ",
        formName: "ยาฉีด",
        formNameEn: "Injection",
        category: "INJECTION", 
        description: "ยาสำหรับฉีด",
        requiresSpecialStorage: true,
        usageInstructions: "ฉีดโดยบุคลากรที่ผ่านการฝึกอบรม",
        commonStrengths: ["1ml", "2ml", "5ml", "10ml"],
        standardUnits: ["ampoule", "vial", "ml"]
      },
      {
        formCode: "SYR",
        formName: "ยาน้ำ",
        formNameEn: "Syrup",
        category: "ORAL",
        description: "ยาในรูปแบบน้ำเชื่อม",
        usageInstructions: "เขย่าก่อนใช้",
        commonStrengths: ["60ml", "100ml", "120ml"],
        standardUnits: ["bottle", "ml"]
      },
      {
        formCode: "CRE",
        formName: "ครีม",
        formNameEn: "Cream",
        category: "TOPICAL",
        description: "ยาทาภายนอก",
        usageInstructions: "ทาบางๆ บริเวณที่ต้องการ",
        commonStrengths: ["15g", "30g"],
        standardUnits: ["tube", "g"]
      },
      {
        formCode: "SUP",
        formName: "ยาเหน็บ",
        formNameEn: "Suppository",
        category: "OTHER",
        description: "ยาสำหรับใช้ทางทวารหนัก",
        requiresSpecialStorage: true,
        usageInstructions: "เก็บในตู้เย็น",
        standardUnits: ["suppository", "piece"]
      }
    ];

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
      console.log(`✅ Created drug form: ${form.formName}`);
    }

    // ================================
    // MASTER DATA - DRUG GROUPS  
    // ================================
    console.log("🧬 Creating Drug Groups (Master Data)...");

    const drugGroups = [
      {
        groupCode: "ANTI",
        groupName: "Antibiotic",
        groupNameTh: "ยาปฏิชีวนะ",
        therapeuticClass: "Anti-infective",
        description: "ยาต้านเชื้อแบคทีเรีย",
        requiresMonitoring: true,
        hasInteractions: true,
        riskLevel: "MEDIUM"
      },
      {
        groupCode: "ANALG",
        groupName: "Analgesic",
        groupNameTh: "ยาแก้ปวด",
        therapeuticClass: "Pain Relief",
        description: "ยาบรรเทาอาการปวด",
        riskLevel: "LOW"
      },
      {
        groupCode: "ANTIH",
        groupName: "Antihistamine", 
        groupNameTh: "ยาต้านฮีสตามีน",
        therapeuticClass: "Allergy",
        description: "ยาแก้แพ้",
        riskLevel: "LOW"
      },
      {
        groupCode: "ANTIV",
        groupName: "Antiviral",
        groupNameTh: "ยาต้านไวรัส",
        therapeuticClass: "Anti-infective",
        description: "ยาต้านเชื้อไวรัส",
        requiresMonitoring: true,
        riskLevel: "MEDIUM"
      },
      {
        groupCode: "CARD",
        groupName: "Cardiovascular",
        groupNameTh: "ยาหัวใจและหลอดเลือด", 
        therapeuticClass: "Cardiovascular",
        description: "ยาสำหรับโรคหัวใจและหลอดเลือด",
        requiresMonitoring: true,
        hasInteractions: true,
        riskLevel: "HIGH"
      }
    ];

    for (const group of drugGroups) {
      await prisma.drugGroup.upsert({
        where: {
          hospitalId_groupCode: {
            hospitalId: hospital.id,
            groupCode: group.groupCode
          }
        },
        update: {},
        create: {
          ...group,
          hospitalId: hospital.id,
          isSystemDefault: true,
          createdBy: devUser.id
        }
      });
      console.log(`✅ Created drug group: ${group.groupNameTh}`);
    }

    // ================================
    // MASTER DATA - DRUG TYPES
    // ================================
    console.log("⚠️ Creating Drug Types (Master Data)...");

    const drugTypes = [
      {
        typeCode: "HIGH_ALERT",
        typeName: "High Alert Drug",
        typeNameTh: "ยาเสี่ยงสูง",
        isHighAlert: true,
        requiresWitness: true,
        requiresApproval: true,
        auditRequired: true,
        description: "ยาที่มีความเสี่ยงสูงในการใช้ ต้องมีการตรวจสอบพิเศษ",
        precautions: "ตรวจสอบขนาดยาและวิธีการใช้อย่างละเอียด",
        color: "#dc2626",
        iconName: "alert-triangle"
      },
      {
        typeCode: "NARCOTIC",
        typeName: "Narcotic Drug", 
        typeNameTh: "ยาเสพติด",
        isNarcotic: true,
        isControlled: true,
        requiresWitness: true,
        requiresApproval: true,
        requiresDoubleLock: true,
        maxDispenseQty: 30,
        auditRequired: true,
        reportingRequired: true,
        description: "ยาเสพติดที่ต้องควบคุมอย่างเข้มงวด",
        precautions: "เก็บในตู้ล็อคคู่ บันทึกการใช้ทุกครั้ง",
        color: "#dc2626",
        iconName: "shield-alert"
      },
      {
        typeCode: "CONTROLLED",
        typeName: "Controlled Drug",
        typeNameTh: "ยาควบคุม",
        isControlled: true,
        requiresApproval: true,
        auditRequired: true,
        description: "ยาที่ต้องมีการควบคุมการใช้",
        color: "#f59e0b",
        iconName: "lock"
      },
      {
        typeCode: "PSYCHO",
        typeName: "Psychotropic Drug",
        typeNameTh: "ยาจิตเวช",
        isPsychotropic: true,
        isControlled: true,
        requiresApproval: true,
        auditRequired: true,
        description: "ยาจิตเวชที่ต้องควบคุม",
        color: "#8b5cf6",
        iconName: "brain"
      },
      {
        typeCode: "REFER",
        typeName: "Refer Drug",
        typeNameTh: "ยา Refer", 
        isRefer: true,
        requiresApproval: true,
        description: "ยาที่ต้องส่งต่อหรือขออนุมัติพิเศษ",
        color: "#06b6d4",
        iconName: "arrow-right-circle"
      },
      {
        typeCode: "DANGEROUS",
        typeName: "Dangerous Drug",
        typeNameTh: "ยาอันตราย",
        isDangerous: true,
        requiresWitness: true,
        auditRequired: true,
        description: "ยาที่อันตรายต่อการใช้",
        precautions: "ใช้ความระมัดระวังสูงสุด",
        color: "#dc2626",
        iconName: "skull"
      }
    ];

    for (const type of drugTypes) {
      await prisma.drugType.upsert({
        where: {
          hospitalId_typeCode: {
            hospitalId: hospital.id,
            typeCode: type.typeCode
          }
        },
        update: {},
        create: {
          ...type,
          hospitalId: hospital.id,
          isSystemDefault: true,
          createdBy: devUser.id
        }
      });
      console.log(`✅ Created drug type: ${type.typeNameTh}`);
    }

    // ================================
    // MASTER DATA - DRUG STORAGE CONDITIONS
    // ================================
    console.log("❄️ Creating Drug Storage Conditions (Master Data)...");

    const storageConditions = [
      {
        storageCode: "RT",
        storageName: "Room Temperature",
        storageNameTh: "อุณหภูมิห้อง",
        temperatureMin: 15,
        temperatureMax: 30,
        storageInstructions: "เก็บในที่แห้ง ป้องกันแสงแดด",
        color: "#22c55e",
        iconName: "thermometer"
      },
      {
        storageCode: "FRIDGE",
        storageName: "Refrigerated",
        storageNameTh: "ในตู้เย็น",
        temperatureMin: 2,
        temperatureMax: 8,
        requiresRefrigeration: true,
        monitoringRequired: true,
        checkFrequency: "DAILY",
        storageInstructions: "เก็บในตู้เย็น 2-8°C",
        handlingPrecautions: "ห้ามปล่อยให้อุณหภูมิสูงเกิน 8°C",
        color: "#3b82f6",
        iconName: "snowflake"
      },
      {
        storageCode: "FREEZE",
        storageName: "Frozen",
        storageNameTh: "แช่แข็ง",
        temperatureMin: -25,
        temperatureMax: -10,
        requiresFreezing: true,
        monitoringRequired: true,
        checkFrequency: "DAILY",
        storageInstructions: "เก็บในช่องแช่แข็ง -20°C หรือต่ำกว่า",
        handlingPrecautions: "ห้ามให้ละลาย ใช้ทันทีหลังละลาย",
        color: "#06b6d4",
        iconName: "ice-cream-2"
      },
      {
        storageCode: "DRY",
        storageName: "Keep Dry",
        storageNameTh: "เก็บในที่แห้ง",
        temperatureMin: 15,
        temperatureMax: 25,
        humidityMax: 60,
        protectFromMoisture: true,
        storageInstructions: "เก็บในที่แห้ง ความชื้นไม่เกิน 60%",
        color: "#f59e0b",
        iconName: "droplets-off"
      },
      {
        storageCode: "DARK",
        storageName: "Protect from Light",
        storageNameTh: "ป้องกันแสง",
        temperatureMin: 15,
        temperatureMax: 30,
        protectFromLight: true,
        storageInstructions: "เก็บในที่มืด ป้องกันแสงแดดและแสงไฟ",
        color: "#6b7280",
        iconName: "sun-off"
      },
      {
        storageCode: "CONTROLLED",
        storageName: "Controlled Environment",
        storageNameTh: "สภาพแวดล้อมควบคุม",
        temperatureMin: 20,
        temperatureMax: 25,
        humidityMin: 45,
        humidityMax: 65,
        protectFromLight: true,
        protectFromMoisture: true,
        requiresInertGas: true,
        monitoringRequired: true,
        checkFrequency: "HOURLY",
        storageInstructions: "ควบคุมอุณหภูมิ ความชื้น และแสง",
        color: "#8b5cf6",
        iconName: "gauge"
      }
    ];

    for (const storage of storageConditions) {
      await prisma.drugStorage.upsert({
        where: {
          hospitalId_storageCode: {
            hospitalId: hospital.id,
            storageCode: storage.storageCode
          }
        },
        update: {},
        create: {
          ...storage,
          hospitalId: hospital.id,
          isSystemDefault: true,
          createdBy: devUser.id
        }
      });
      console.log(`✅ Created storage condition: ${storage.storageNameTh}`);
    }

    // ================================
    // CREATE DEPARTMENTS
    // ================================
    console.log("🏢 Creating Departments...");

    const departments = [
      {
        departmentCode: "PHARM",
        name: "เภสัชกรรม",
        nameEn: "Pharmacy Department",
        type: "PHARMACY",
        location: "ชั้น 1 อาคารผู้ป่วยนอก",
        phone: "054-237-400 ต่อ 101",
        email: "pharmacy@lampang-hospital.go.th",
      },
      {
        departmentCode: "EMERG",
        name: "ห้องฉุกเฉิน", 
        nameEn: "Emergency Department",
        type: "EMERGENCY",
        location: "ชั้น 1 อาคารอุบัติเหตุและฉุกเฉิน",
        phone: "054-237-400 ต่อ 911",
        email: "emergency@lampang-hospital.go.th",
      },
      {
        departmentCode: "ICU",
        name: "หอผู้ป่วยวิกฤต",
        nameEn: "Intensive Care Unit", 
        type: "ICU",
        location: "ชั้น 3 อาคารผู้ป่วยใน",
        phone: "054-237-400 ต่อ 301",
        email: "icu@lampang-hospital.go.th",
      },
      {
        departmentCode: "OR",
        name: "ห้องผ่าตัด",
        nameEn: "Operating Room",
        type: "SURGERY", 
        location: "ชั้น 2 อาคารผู้ป่วยใน",
        phone: "054-237-400 ต่อ 201",
        email: "or@lampang-hospital.go.th",
      },
      {
        departmentCode: "OPD",
        name: "ผู้ป่วยนอก",
        nameEn: "Out Patient Department",
        type: "OUTPATIENT",
        location: "ชั้น 1-2 อาคารผู้ป่วยนอก",
        phone: "054-237-400 ต่อ 102",
        email: "opd@lampang-hospital.go.th",
      },
      {
        departmentCode: "IPD",
        name: "ผู้ป่วยใน", 
        nameEn: "In Patient Department",
        type: "INPATIENT",
        location: "ชั้น 4-8 อาคารผู้ป่วยใน",
        phone: "054-237-400 ต่อ 401",
        email: "ipd@lampang-hospital.go.th",
      }
    ];

    for (const dept of departments) {
      const department = await prisma.department.upsert({
        where: { 
          hospitalId_departmentCode: {
            hospitalId: hospital.id,
            departmentCode: dept.departmentCode,
          }
        },
        update: {},
        create: {
          hospitalId: hospital.id,
          departmentCode: dept.departmentCode,
          name: dept.name,
          nameEn: dept.nameEn,
          type: dept.type as any,
          location: dept.location,
          phone: dept.phone,
          email: dept.email,
          isActive: true,
        },
      });
      console.log("✅ Created department:", department.name);
    }

    // ================================
    // CREATE WAREHOUSES  
    // ================================
    console.log("🏪 Creating Warehouses...");

    const warehouses = [
      {
        warehouseCode: "CENTRAL",
        name: "คลังยาหลัก",
        type: "CENTRAL",
        location: "ชั้น B1 อาคารเภสัชกรรม",
        area: 200.5,
        capacity: 10000,
        hasTemperatureControl: true,
        minTemperature: 15,
        maxTemperature: 25,
        hasHumidityControl: true,
        minHumidity: 45,
        maxHumidity: 65,
        securityLevel: "HIGH",
        accessControl: true,
        cctv: true,
        alarm: true,
        requireApproval: true
      },
      {
        warehouseCode: "EMERG_STORE",
        name: "คลังยาฉุกเฉิน",
        type: "EMERGENCY", 
        location: "ห้องฉุกเฉิน",
        area: 15.0,
        capacity: 500,
        securityLevel: "STANDARD",
        accessControl: true
      },
      {
        warehouseCode: "CONTROLLED",
        name: "คลังยาควบคุม",
        type: "CONTROLLED",
        location: "ชั้น B1 ห้องพิเศษ",
        area: 25.0,
        capacity: 1000,
        hasTemperatureControl: true,
        minTemperature: 20,
        maxTemperature: 25,
        securityLevel: "MAXIMUM",
        accessControl: true,
        cctv: true,
        alarm: true
      },
      {
        warehouseCode: "COLD_STORE", 
        name: "ห้องเย็น",
        type: "COLD_STORAGE",
        location: "ชั้น B1 อาคารเภสัชกรรม",
        area: 20.0,
        capacity: 1500,
        hasTemperatureControl: true,
        minTemperature: 2,
        maxTemperature: 8,
        securityLevel: "HIGH",
        accessControl: true,
        cctv: true
      }
    ];

    for (const warehouse of warehouses) {
      const warehouseRecord = await prisma.warehouse.upsert({
        where: {
          hospitalId_warehouseCode: {
            hospitalId: hospital.id,
            warehouseCode: warehouse.warehouseCode
          }
        },
        update: {},
        create: {
          ...warehouse,
          type: warehouse.type as any,
          hospitalId: hospital.id,
          isActive: true
        }
      });
      console.log("✅ Created warehouse:", warehouseRecord.name);
    }

    // ================================
    // CREATE ADDITIONAL USERS
    // ================================
    console.log("👥 Creating Additional Users...");

    // สร้าง Director User
    const hashedDirectorPassword = await hashPassword("director123");
    const directorPersonnelType = createdPersonnelTypes.find(pt => pt.typeCode === "DIR");

    const directorUser = await prisma.user.upsert({
      where: { email: "director@lampang-hospital.go.th" },
      update: {},
      create: {
        email: "director@lampang-hospital.go.th",
        username: "director",
        name: "ผู้อำนวยการโรงพยาบาล",
        firstName: "ผู้อำนวยการ",
        lastName: "โรงพยาบาล",
        phoneNumber: "054-237-400",
        employeeId: "DIR001", 
        position: "ผู้อำนวยการโรงพยาบาลลำปาง",
        role: "DIRECTOR",
        status: "ACTIVE",
        hospitalId: hospital.id,
        personnelTypeId: directorPersonnelType?.id,
        isProfileComplete: true,
        emailVerified: true,
        password: hashedDirectorPassword,
      },
    });

    console.log("✅ Created director user:", directorUser.email);

    // สร้าง Pharmacy Manager User
    const hashedPharmPassword = await hashPassword("pharm123");
    const pharmDept = await prisma.department.findFirst({ 
      where: { departmentCode: "PHARM", hospitalId: hospital.id } 
    });
    const groupHeadPersonnelType = createdPersonnelTypes.find(pt => pt.typeCode === "GRP_HEAD");
    
    const pharmUser = await prisma.user.upsert({
      where: { email: "pharm@lampang-hospital.go.th" },
      update: {},
      create: {
        email: "pharm@lampang-hospital.go.th",
        username: "pharm_head",
        name: "หัวหน้าเภสัชกรรม",
        firstName: "หัวหน้า",
        lastName: "เภสัชกรรม",
        phoneNumber: "054-237-401",
        employeeId: "PH001",
        position: "หัวหน้าแผนกเภสัชกรรม",
        role: "GROUP_HEAD",
        status: "ACTIVE",
        hospitalId: hospital.id,
        departmentId: pharmDept?.id,
        personnelTypeId: groupHeadPersonnelType?.id,
        isProfileComplete: true,
        emailVerified: true,
        password: hashedPharmPassword,
      },
    });

    console.log("✅ Created pharmacy head user:", pharmUser.email);

    // สร้าง Staff User ตัวอย่าง (รอการอนุมัติ)
    const hashedStaffPassword = await hashPassword("staff123");
    const icuDept = await prisma.department.findFirst({ 
      where: { departmentCode: "ICU", hospitalId: hospital.id } 
    });
    const staffPersonnelType = createdPersonnelTypes.find(pt => pt.typeCode === "STAFF");
    
    const staffUser = await prisma.user.upsert({
      where: { email: "nurse@lampang-hospital.go.th" },
      update: {},
      create: {
        email: "nurse@lampang-hospital.go.th", 
        username: "nurse001",
        name: "พยาบาลทดสอบ",
        firstName: "พยาบาล",
        lastName: "ทดสอบ",
        phoneNumber: "054-237-301",
        employeeId: "NS001",
        position: "พยาบาลวิชาชีพ",
        role: "STAFF",
        status: "PENDING", // รอการอนุมัติ
        hospitalId: hospital.id,
        departmentId: icuDept?.id,
        personnelTypeId: staffPersonnelType?.id,
        isProfileComplete: true,
        emailVerified: true,
        password: hashedStaffPassword,
      },
    });

    console.log("✅ Created staff user:", staffUser.email);

    // สร้าง Student User ตัวอย่าง
    const hashedStudentPassword = await hashPassword("student123");
    const studentPersonnelType = createdPersonnelTypes.find(pt => pt.typeCode === "STU");
    
    const studentUser = await prisma.user.upsert({
      where: { email: "student@lampang-hospital.go.th" },
      update: {},
      create: {
        email: "student@lampang-hospital.go.th",
        username: "student001", 
        name: "นักศึกษาฝึกงาน",
        firstName: "นักศึกษา",
        lastName: "ฝึกงาน",
        phoneNumber: "081-234-5678",
        employeeId: "STU001",
        position: "นักศึกษาเภสัชศาสตร์",
        role: "STUDENT",
        status: "PENDING",
        hospitalId: hospital.id,
        departmentId: pharmDept?.id,
        personnelTypeId: studentPersonnelType?.id,
        isProfileComplete: true,
        emailVerified: true,
        password: hashedStudentPassword,
      },
    });

    console.log("✅ Created student user:", studentUser.email);

    // ================================
    // CREATE ADDITIONAL TEST USERS FOR HOSPITAL 2
    // ================================
    console.log("👥 Creating Users for Hospital 2...");

    // สร้าง PersonnelTypes สำหรับโรงพยาบาลที่ 2
    const hospital2PersonnelTypes: any[] = [];
    for (const personnelType of personnelTypes) {
      const created = await prisma.personnelType.upsert({
        where: { 
          hospitalId_typeCode: {
            hospitalId: hospital2.id,
            typeCode: personnelType.typeCode
          }
        },
        update: {},
        create: {
          ...personnelType,
          hospitalId: hospital2.id,
          createdBy: devUser.id
        }
      });
      hospital2PersonnelTypes.push(created);
    }

    // สร้าง Director สำหรับโรงพยาบาลที่ 2
    const hashedDirector2Password = await hashPassword("director2123");
    const director2PersonnelType = hospital2PersonnelTypes.find(pt => pt.typeCode === "DIR");

    const director2User = await prisma.user.upsert({
      where: { email: "director@thoen-hospital.go.th" },
      update: {},
      create: {
        email: "director@thoen-hospital.go.th",
        username: "director2",
        name: "ผู้อำนวยการโรงพยาบาลเถิน",
        firstName: "ผู้อำนวยการ",
        lastName: "โรงพยาบาลเถิน",
        phoneNumber: "054-231-234",
        employeeId: "DIR002", 
        position: "ผู้อำนวยการโรงพยาบาลเถิน",
        role: "DIRECTOR",
        status: "ACTIVE",
        hospitalId: hospital2.id,
        personnelTypeId: director2PersonnelType?.id,
        isProfileComplete: true,
        emailVerified: true,
        password: hashedDirector2Password,
      },
    });

    console.log("✅ Created director user for hospital 2:", director2User.email);

    console.log("\n🎉 Enhanced database seed completed successfully!");
    console.log("\n📋 Test accounts:");
    console.log("🔧 Developer: dev@system.local / dev123 (ACTIVE)");
    console.log("👨‍💼 Director (Lampang): director@lampang-hospital.go.th / director123 (ACTIVE)");
    console.log("👨‍💼 Director (Thoen): director@thoen-hospital.go.th / director2123 (ACTIVE)");
    console.log("👩‍⚕️ Pharmacy Head: pharm@lampang-hospital.go.th / pharm123 (ACTIVE)"); 
    console.log("👩‍⚕️ Nurse: nurse@lampang-hospital.go.th / staff123 (PENDING)");
    console.log("🎓 Student: student@lampang-hospital.go.th / student123 (PENDING)");
    
    console.log("\n🏥 Hospitals:");
    console.log("🏢 โรงพยาบาลลำปาง (DEMO001) - 5 users");
    console.log("🏢 โรงพยาบาลเถิน (DEMO002) - 1 user");
    
    console.log("\n🎯 Master Data Created:");
    console.log("👥 Personnel Types: Developer, Director, Group Head, Staff, Student (×2 hospitals)");
    console.log("💊 Drug Forms: Tablet, Capsule, Injection, Syrup, Cream, Suppository");
    console.log("🧬 Drug Groups: Antibiotic, Analgesic, Antihistamine, Antiviral, Cardiovascular");
    console.log("⚠️ Drug Types: High Alert, Narcotic, Controlled, Psychotropic, Refer, Dangerous");
    console.log("❄️ Storage Conditions: Room Temp, Refrigerated, Frozen, Dry, Dark, Controlled");
    
    console.log("\n🏢 Departments & Warehouses:");
    console.log("🏥 Departments: Pharmacy, Emergency, ICU, OR, OPD, IPD");
    console.log("🏪 Warehouses: Central, Emergency, Controlled, Cold Storage");
    
    console.log("\n📝 Next steps:");
    console.log("1. Run: pnpm dev");
    console.log("2. Login as dev@system.local / dev123");
    console.log("3. Test Admin Panel at /admin");
    console.log("4. Director can approve pending users");
    console.log("5. Group Head can manage drug master data");
    console.log("6. Start building API endpoints");

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
