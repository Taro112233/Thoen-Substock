// prisma/seeds/demo-data.seed.ts - Fixed Version
import { PrismaClient } from "@prisma/client";

export async function seedDemoData(
  prisma: PrismaClient, 
  hospitals: any[], 
  users: any[], 
  masterData: any
) {
  console.log("🎮 Creating Demo Data for testing...");

  const demoData: Record<string, any> = {};

  // ================================
  // SAMPLE DRUGS
  // ================================
  console.log("💊 Creating Sample Drugs...");
  
  const hospital1 = hospitals[0]; // Lampang Hospital
  const drugFormTab = await prisma.drugForm.findFirst({ 
    where: { hospitalId: hospital1.id, formCode: "TAB" } 
  });
  const drugFormCap = await prisma.drugForm.findFirst({ 
    where: { hospitalId: hospital1.id, formCode: "CAP" } 
  });
  const drugFormInj = await prisma.drugForm.findFirst({ 
    where: { hospitalId: hospital1.id, formCode: "INJ" } 
  });

  const drugGroupAntibiotic = await prisma.drugGroup.findFirst({ 
    where: { hospitalId: hospital1.id, groupCode: "ANTIBIOTIC" } 
  });
  const drugGroupAnalgesic = await prisma.drugGroup.findFirst({ 
    where: { hospitalId: hospital1.id, groupCode: "ANALGESIC" } 
  });

  const drugTypeGeneric = await prisma.drugType.findFirst({ 
    where: { hospitalId: hospital1.id, typeCode: "GENERIC" } 
  });
  const drugTypeBrand = await prisma.drugType.findFirst({ 
    where: { hospitalId: hospital1.id, typeCode: "BRAND" } 
  });

  const storageRoomTemp = await prisma.drugStorage.findFirst({ 
    where: { hospitalId: hospital1.id, storageCode: "ROOM_TEMP" } 
  });
  const storageRefrigerated = await prisma.drugStorage.findFirst({ 
    where: { hospitalId: hospital1.id, storageCode: "REFRIGERATED" } 
  });

  // Note: Based on schema, the correct Drug model fields are:
  // - hospitalDrugCode (not drugCode)
  // - dosageForm (string, not drugFormId)
  // - unit (string, not baseUnitId)
  // - etc.

  const sampleDrugs = [
    {
      hospitalDrugCode: "PARA500",
      name: "Paracetamol 500mg",
      genericName: "Paracetamol",
      brandName: "Tylenol",
      dosageForm: "Tablet",
      strength: "500",
      unit: "mg",
      hospitalId: hospital1.id,
      // Remove invalid fields that don't exist in schema
      description: "ยาแก้ปวด ลดไข้",
      indication: "ปวดหัว ปวดฟัน ลดไข้",
      contraindication: "แพ้พาราเซตามอล",
      sideEffects: "คลื่นไส้ อาเจียน",
      dosageAdult: "500-1000 mg ทุก 4-6 ชั่วโมง",
      dosageChild: "10-15 mg/kg ทุก 4-6 ชั่วโมง",
      maxDailyDose: "4000 mg",
      isActive: true,
      requiresPrescription: false,
      isControlled: false,
      isNarcotic: false,
      isHighAlert: false,
      // Remove stock fields - these belong to StockCard model
    },
    {
      hospitalDrugCode: "AMOX500",
      name: "Amoxicillin 500mg",
      genericName: "Amoxicillin",
      brandName: "Amoxil",
      dosageForm: "Capsule",
      strength: "500",
      unit: "mg",
      hospitalId: hospital1.id,
      description: "ยาปฏิชีวนะ กลุ่ม Penicillin",
      indication: "ติดเชื้อแบคทีเรีย",
      contraindication: "แพ้ Penicillin",
      sideEffects: "ท้องเสีย ผื่น",
      dosageAdult: "500 mg ทุก 8 ชั่วโมง",
      dosageChild: "25-50 mg/kg/วัน แบ่ง 3 ครั้ง",
      maxDailyDose: "3000 mg",
      isActive: true,
      requiresPrescription: true,
      isControlled: false,
      isNarcotic: false,
      isHighAlert: false,
    },
    {
      hospitalDrugCode: "INSULIN",
      name: "Insulin Human 100 IU/ml",
      genericName: "Insulin Human",
      brandName: "Humulin",
      dosageForm: "Injection",
      strength: "100",
      unit: "IU/ml",
      hospitalId: hospital1.id,
      description: "อินซูลินสำหรับควบคุมน้ำตาลในเลือด",
      indication: "เบาหวาน type 1 และ type 2",
      contraindication: "น้ำตาลในเลือดต่ำ",
      sideEffects: "น้ำตาลในเลือดต่ำ น้ำหนักเพิ่ม",
      dosageAdult: "ตามแพทย์กำหนด",
      dosageChild: "ตามแพทย์กำหนด",
      isActive: true,
      requiresPrescription: true,
      isControlled: false,
      isNarcotic: false,
      isHighAlert: true,
    }
  ];

  const createdDrugs = [];
  for (const drug of sampleDrugs) {
    const created = await prisma.drug.upsert({
      where: {
        hospitalId_hospitalDrugCode: { // Fixed: use correct composite key
          hospitalId: drug.hospitalId,
          hospitalDrugCode: drug.hospitalDrugCode
        }
      },
      update: {},
      create: drug
    });
    createdDrugs.push(created);
    console.log(`  ✅ ${created.genericName} (${created.hospitalDrugCode})`);
  }
  demoData.drugs = createdDrugs;

  // ================================
  // WAREHOUSES
  // ================================
  console.log("🏪 Creating Sample Warehouses...");
  
  const sampleWarehouses = [
    {
      warehouseCode: "MAIN",
      name: "คลังยาหลัก",
      nameEn: "Main Pharmacy Warehouse",
      type: "MAIN_PHARMACY" as any, // Type assertion for enum
      location: "ชั้น 1 อาคารเภสัชกรรม",
      description: "คลังยาหลักของโรงพยาบาล",
      isActive: true,
      hospitalId: hospital1.id,
    },
    {
      warehouseCode: "ICU",
      name: "คลังยา ICU",
      nameEn: "ICU Pharmacy",
      type: "DEPARTMENT" as any, // Type assertion for enum
      location: "ชั้น 3 หอผู้ป่วยวิกฤต",
      description: "คลังยาประจำ ICU",
      isActive: true,
      hospitalId: hospital1.id,
    },
    {
      warehouseCode: "ER",
      name: "คลังยาฉุกเฉิน",
      nameEn: "Emergency Pharmacy",
      type: "EMERGENCY" as any, // Type assertion for enum
      location: "ชั้น 1 ห้องฉุกเฉิน",
      description: "คลังยาสำหรับห้องฉุกเฉิน",
      isActive: true,
      hospitalId: hospital1.id,
    }
  ];

  const createdWarehouses = [];
  for (const warehouse of sampleWarehouses) {
    const created = await prisma.warehouse.upsert({
      where: {
        hospitalId_warehouseCode: {
          hospitalId: warehouse.hospitalId,
          warehouseCode: warehouse.warehouseCode
        }
      },
      update: {},
      create: warehouse
    });
    createdWarehouses.push(created);
    console.log(`  ✅ ${created.name} (${created.warehouseCode})`);
  }
  demoData.warehouses = createdWarehouses;

  // ================================
  // STOCK CARDS
  // ================================
  console.log("📋 Creating Sample Stock Cards...");
  
  const mainWarehouse = createdWarehouses.find(w => w.warehouseCode === "MAIN");
  const icuWarehouse = createdWarehouses.find(w => w.warehouseCode === "ICU");
  
  if (!mainWarehouse || !icuWarehouse) {
    console.error("❌ Required warehouses not found");
    return demoData;
  }
  
  const stockCards = [];
  for (const drug of createdDrugs) {
    // Stock card สำหรับคลังหลัก
    const mainStockCard = await prisma.stockCard.upsert({
      where: {
        id: `${hospital1.id}-${mainWarehouse.id}-${drug.id}` // Use composite key approach
      },
      update: {},
      create: {
        cardNumber: `SC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Generate unique card number
        hospitalId: hospital1.id,
        warehouseId: mainWarehouse.id,
        drugId: drug.id,
        currentStock: Math.floor(Math.random() * 1000) + 100, // Random stock 100-1100
        reservedStock: 0,
        availableStock: Math.floor(Math.random() * 1000) + 100, // Calculate properly in real app
        minStock: 1000, // Fixed: StockCard field
        maxStock: 5000, // Fixed: StockCard field
        reorderPoint: 500, // Fixed: StockCard field
        averageCost: Math.random() * 100 + 10, // Random cost 10-110
        totalValue: 0, // Calculate in application logic
        // lastUpdated: new Date(), // Removed - not in schema
        isActive: true,
      }
    });
    stockCards.push(mainStockCard);

    // Stock card สำหรับ ICU (บางยา)
    if (drug.hospitalDrugCode !== "INSULIN") { // ไม่ให้ ICU มี insulin
      const icuStockCard = await prisma.stockCard.upsert({
        where: {
          id: `${hospital1.id}-${icuWarehouse.id}-${drug.id}` // Use composite key approach
        },
        update: {},
        create: {
          cardNumber: `SC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Generate unique card number
          hospitalId: hospital1.id,
          warehouseId: icuWarehouse.id,
          drugId: drug.id,
          currentStock: Math.floor(Math.random() * 100) + 10, // Random stock 10-110
          reservedStock: 0,
          availableStock: Math.floor(Math.random() * 100) + 10,
          minStock: Math.floor(1000 / 10), // Fixed: StockCard values
          maxStock: Math.floor(5000 / 10), // Fixed: StockCard values  
          reorderPoint: Math.floor(500 / 10), // Fixed: StockCard values
          averageCost: Math.random() * 100 + 10,
          totalValue: 0,
          // lastUpdated: new Date(), // Removed - not in schema
          isActive: true,
        }
      });
      stockCards.push(icuStockCard);
    }
  }
  demoData.stockCards = stockCards;
  console.log(`  ✅ Created ${stockCards.length} stock cards`);

  console.log(`✅ Successfully created demo data for testing`);
  console.log(`🎮 Demo Data Summary:`);
  console.log(`  - Sample Drugs: ${createdDrugs.length}`);
  console.log(`  - Warehouses: ${createdWarehouses.length}`);
  console.log(`  - Stock Cards: ${stockCards.length}`);
  console.log(`  - Ready for testing inventory management features`);

  return demoData;
}