// prisma/seeds/master-data.seed.ts - Fixed Version
import { PrismaClient } from "@prisma/client";

export async function seedMasterData(prisma: PrismaClient, hospitals: any[], devUser: any) {
  console.log("💊 Creating Master Data for all hospitals...");

  const masterData: Record<string, any> = {};

  // ================================
  // DRUG FORMS
  // ================================
  console.log("📋 Creating Drug Forms...");
  const drugForms = [
    { formCode: "TAB", formName: "ยาเม็ด", formNameEn: "Tablet", category: "ORAL", description: "ยาแบบเม็ดรับประทาน" },
    { formCode: "CAP", formName: "ยาแคปซูล", formNameEn: "Capsule", category: "ORAL", description: "ยาแบบแคปซูลรับประทาน" },
    { formCode: "INJ", formName: "ยาฉีด", formNameEn: "Injection", category: "INJECTION", description: "ยาฉีดเข้าหลอดเลือด กล้ามเนื้อ หรือใต้ผิวหนัง" },
    { formCode: "SYR", formName: "ยาน้ำ", formNameEn: "Syrup", category: "ORAL", description: "ยาน้ำรับประทาน" },
    { formCode: "CRE", formName: "ครีม", formNameEn: "Cream", category: "TOPICAL", description: "ครีมทาภายนอก" },
    { formCode: "OIN", formName: "ยาขี้ผึ้ง", formNameEn: "Ointment", category: "TOPICAL", description: "ยาขี้ผึ้งทาภายนอก" },
    { formCode: "DROP", formName: "ยาหยด", formNameEn: "Drops", category: "TOPICAL", description: "ยาหยดตา หู หรือจมูก" },
    { formCode: "SUP", formName: "ยาเหน็บ", formNameEn: "Suppository", category: "RECTAL", description: "ยาเหน็บทางทวารหนัก" },
    { formCode: "PATCH", formName: "แผ่นแปะ", formNameEn: "Patch", category: "TOPICAL", description: "แผ่นแปะผิวหนัง" },
    { formCode: "SPRAY", formName: "ยาสเปรย์", formNameEn: "Spray", category: "TOPICAL", description: "ยาพ่นสเปรย์" }
  ];

  for (const hospital of hospitals) {
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
  masterData.drugForms = drugForms;
  console.log(`✅ Created ${drugForms.length} drug forms for ${hospitals.length} hospitals`);

  // ================================
  // DRUG GROUPS
  // ================================
  console.log("🧬 Creating Drug Groups...");
  const drugGroups = [
    { groupCode: "ANTIBIOTIC", groupName: "ยาปฏิชีวนะ", groupNameTh: "ยาปฏิชีวนะ", description: "ยาต้านเชื้อแบคทีเรีย" },
    { groupCode: "ANALGESIC", groupName: "ยาแก้ปวด", groupNameTh: "ยาแก้ปวด", description: "ยาบรรเทาอาการปวด" },
    { groupCode: "ANTIPYRETIC", groupName: "ยาลดไข้", groupNameTh: "ยาลดไข้", description: "ยาลดไข้" },
    { groupCode: "ANTIHYPERTENSIVE", groupName: "ยาลดความดันโลหิต", groupNameTh: "ยาลดความดันโลหิต", description: "ยาควบคุมความดันโลหิต" },
    { groupCode: "ANTIDIABETIC", groupName: "ยาเบาหวาน", groupNameTh: "ยาเบาหวาน", description: "ยาควบคุมระดับน้ำตาลในเลือด" },
    { groupCode: "ANTIHISTAMINE", groupName: "ยาแก้แพ้", groupNameTh: "ยาแก้แพ้", description: "ยาต้านการแพ้" },
    { groupCode: "VITAMIN", groupName: "วิตามิน", groupNameTh: "วิตามิน", description: "วิตามินและสารอาหารเสริม" },
    { groupCode: "GASTROINTESTINAL", groupName: "ยาทางเดินอาหาร", groupNameTh: "ยาทางเดินอาหาร", description: "ยารักษาโรคทางเดินอาหาร" },
    { groupCode: "RESPIRATORY", groupName: "ยาทางเดินหายใจ", groupNameTh: "ยาทางเดินหายใจ", description: "ยารักษาโรคทางเดินหายใจ" },
    { groupCode: "CARDIOVASCULAR", groupName: "ยาหัวใจและหลอดเลือด", groupNameTh: "ยาหัวใจและหลอดเลือด", description: "ยารักษาโรคหัวใจและหลอดเลือด" },
    { groupCode: "CENTRAL_NERVOUS", groupName: "ยาระบบประสาทกลาง", groupNameTh: "ยาระบบประสาทกลาง", description: "ยาที่มีผลต่อระบบประสาทกลาง" },
    { groupCode: "TOPICAL", groupName: "ยาใช้ภายนอก", groupNameTh: "ยาใช้ภายนอก", description: "ยาสำหรับใช้ภายนอก" }
  ];

  for (const hospital of hospitals) {
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
    }
  }
  masterData.drugGroups = drugGroups;
  console.log(`✅ Created ${drugGroups.length} drug groups for ${hospitals.length} hospitals`);

  // ================================
  // DRUG TYPES - แก้ไขตรงนี้
  // ================================
  console.log("🏷️ Creating Drug Types...");
  const drugTypes = [
    { 
      typeCode: "GENERIC", 
      typeName: "ยาชื่อสามัญ", 
      typeNameTh: "ยาชื่อสามัญ", // แก้จาก typeNameEn เป็น typeNameTh
      description: "ยาชื่อสามัญ ราคาถูก" 
    },
    { 
      typeCode: "BRAND", 
      typeName: "ยาต้นตำรับ", 
      typeNameTh: "ยาต้นตำรับ", 
      description: "ยาต้นตำรับของบริษัทยา" 
    },
    { 
      typeCode: "BIOSIMILAR", 
      typeName: "ยาชีวภาพคล้าย", 
      typeNameTh: "ยาชีวภาพคล้าย", 
      description: "ยาชีวภาพที่คล้ายกับยาต้นตำรับ" 
    },
    { 
      typeCode: "CONTROLLED", 
      typeName: "ยาควบคุม", 
      typeNameTh: "ยาควบคุม", 
      description: "ยาที่ต้องควบคุมการใช้",
      isControlled: true,
      requiresApproval: true,
      auditRequired: true
    },
    { 
      typeCode: "NARCOTIC", 
      typeName: "ยาเสพติด", 
      typeNameTh: "ยาเสพติด", 
      description: "ยาเสพติดให้โทษ",
      isNarcotic: true,
      isControlled: true,
      requiresWitness: true,
      requiresDoubleLock: true,
      auditRequired: true,
      reportingRequired: true
    },
    { 
      typeCode: "PSYCHOTROPIC", 
      typeName: "ยาจิตเวช", 
      typeNameTh: "ยาจิตเวช", 
      description: "ยาจิตเวชที่ต้องควบคุม",
      isPsychotropic: true,
      isControlled: true,
      requiresApproval: true
    },
    { 
      typeCode: "HIGH_ALERT", 
      typeName: "ยาเสี่ยงสูง", 
      typeNameTh: "ยาเสี่ยงสูง", 
      description: "ยาที่มีความเสี่ยงสูงต่อผู้ป่วย",
      isHighAlert: true,
      requiresWitness: true,
      auditRequired: true
    },
    { 
      typeCode: "REFRIGERATED", 
      typeName: "ยาเก็บเย็น", 
      typeNameTh: "ยาเก็บเย็น", 
      description: "ยาที่ต้องเก็บในตู้เย็น" 
    },
    { 
      typeCode: "CHEMOTHERAPY", 
      typeName: "ยาเคมีบำบัด", 
      typeNameTh: "ยาเคมีบำบัด", 
      description: "ยาเคมีบำบัดมะเร็ง",
      isDangerous: true,
      requiresWitness: true,
      requiresApproval: true,
      auditRequired: true
    },
    { 
      typeCode: "HERBAL", 
      typeName: "ยาสมุนไพร", 
      typeNameTh: "ยาสมุนไพร", 
      description: "ยาสมุนไพรและผลิตภัณฑ์ธรรมชาติ" 
    }
  ];

  for (const hospital of hospitals) {
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
    }
  }
  masterData.drugTypes = drugTypes;
  console.log(`✅ Created ${drugTypes.length} drug types for ${hospitals.length} hospitals`);

  // ================================
  // DRUG STORAGE CONDITIONS
  // ================================
  console.log("🌡️ Creating Drug Storage Conditions...");
  const drugStorages = [
    { 
      storageCode: "ROOM_TEMP", 
      storageName: "อุณหภูมิห้อง", 
      storageNameTh: "อุณหภูมิห้อง",
      temperatureMin: 15.0,
      temperatureMax: 30.0,
      humidityMin: 45.0,
      humidityMax: 75.0,
      // ลบ description ออกเพราะไม่มีใน schema
      storageInstructions: "ป้องกันแสง ความร้อน และความชื้น - เก็บที่อุณหภูมิห้อง 15-30°C ความชื้น 45-75%",
      protectFromLight: true,
      protectFromMoisture: true
    },
    { 
      storageCode: "REFRIGERATED", 
      storageName: "เก็บเย็น", 
      storageNameTh: "เก็บเย็น",
      temperatureMin: 2.0,
      temperatureMax: 8.0,
      humidityMin: 45.0,
      humidityMax: 75.0,
      storageInstructions: "ห้ามแช่แข็ง ป้องกันแสง - เก็บในตู้เย็น 2-8°C",
      requiresRefrigeration: true,
      protectFromLight: true
    },
    { 
      storageCode: "FROZEN", 
      storageName: "แช่แข็ง", 
      storageNameTh: "แช่แข็ง",
      temperatureMin: -25.0,
      temperatureMax: -15.0,
      storageInstructions: "แช่แข็งตลอดเวลา ห้ามให้ละลาย - เก็บในตู้แช่แข็ง -25 ถึง -15°C",
      requiresFreezing: true
    },
    { 
      storageCode: "CONTROLLED_ROOM", 
      storageName: "ห้องควบคุม", 
      storageNameTh: "ห้องควบคุม",
      temperatureMin: 20.0,
      temperatureMax: 25.0,
      humidityMin: 45.0,
      humidityMax: 65.0,
      storageInstructions: "ควบคุมอุณหภูมิและความชื้นอย่างเข้มงวด - ห้องควบคุมอุณหภูมิ 20-25°C ความชื้น 45-65%",
      monitoringRequired: true
    },
    { 
      storageCode: "DRY_PLACE", 
      storageName: "ที่แห้ง", 
      storageNameTh: "ที่แห้ง",
      temperatureMin: 15.0,
      temperatureMax: 30.0,
      humidityMax: 60.0,
      storageInstructions: "ป้องกันความชื้นเป็นพิเศษ - เก็บในที่แห้ง ความชื้นไม่เกิน 60%",
      protectFromMoisture: true
    },
    { 
      storageCode: "DARK_PLACE", 
      storageName: "ที่มืด", 
      storageNameTh: "ที่มืด",
      temperatureMin: 15.0,
      temperatureMax: 30.0,
      storageInstructions: "ป้องกันแสงแดดและแสงสว่าง - เก็บในที่มืด ป้องกันแสง",
      protectFromLight: true
    }
  ];

  for (const hospital of hospitals) {
    for (const storage of drugStorages) {
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
    }
  }
  masterData.drugStorages = drugStorages;
  console.log(`✅ Created ${drugStorages.length} storage conditions for ${hospitals.length} hospitals`);

  console.log(`✅ Successfully created all master data for ${hospitals.length} hospitals`);
  console.log(`📊 Master Data Summary:`);
  console.log(`  - Drug Forms: ${drugForms.length}`);
  console.log(`  - Drug Groups: ${drugGroups.length}`);
  console.log(`  - Drug Types: ${drugTypes.length}`);
  console.log(`  - Storage Conditions: ${drugStorages.length}`);

  return masterData;
}