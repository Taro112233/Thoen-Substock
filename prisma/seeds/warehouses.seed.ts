// prisma/seeds/warehouses.seed.ts - Fixed Warehouse Creation Seed
import { PrismaClient } from "@prisma/client";

export async function seedWarehouses(
  prisma: PrismaClient, 
  hospitals: any[]
) {
  console.log("🏪 Creating Warehouses for all hospitals...");

  const warehousesByHospital: Record<string, any[]> = {};

  for (const hospital of hospitals) {
    console.log(`🏥 Creating warehouses for ${hospital.name}...`);
    
    // ข้อมูล warehouse ที่ตรงกับ Prisma schema
    const warehouseData = [
      {
        name: "คลังยาหลัก",
        warehouseCode: "MAIN",
        type: "CENTRAL",  // ใช้ enum value ที่ถูกต้อง
        location: "ชั้น 1 อาคารเภสัชกรรม",
        address: "อาคารเภสัชกรรม ชั้น 1 ห้อง 101",
        description: "คลังยาหลักของโรงพยาบาล สำหรับเก็บยาทุกประเภท",
        capacity: 10000,
        area: 200.50,
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
        allowReceiving: true,
        allowDispensing: true,
        allowTransfer: true,
        requireApproval: false,
        isActive: true,
        isMaintenance: false,
        hospitalId: hospital.id,
      },
      {
        name: "คลังยา ICU",
        warehouseCode: "ICU",
        type: "DEPARTMENT",
        location: "ชั้น 3 หอผู้ป่วยวิกฤต",
        address: "อาคารผู้ป่วย ชั้น 3 หน่วย ICU",
        description: "คลังยาประจำหน่วยผู้ป่วยวิกฤต",
        capacity: 500,
        area: 30.00,
        hasTemperatureControl: true,
        minTemperature: 20,
        maxTemperature: 25,
        securityLevel: "STANDARD",
        accessControl: true,
        allowReceiving: true,
        allowDispensing: true,
        allowTransfer: true,
        requireApproval: false,
        isActive: true,
        hospitalId: hospital.id,
      },
      {
        name: "คลังยาฉุกเฉิน",
        warehouseCode: "ER",
        type: "EMERGENCY",
        location: "ชั้น 1 ห้องฉุกเฉิน",
        address: "อาคารผู้ป่วย ชั้น 1 ห้องฉุกเฉิน",
        description: "คลังยาสำหรับห้องฉุกเฉิน พร้อมยาชีวิต",
        capacity: 300,
        area: 20.00,
        hasTemperatureControl: true,
        securityLevel: "HIGH",
        accessControl: true,
        allowReceiving: true,
        allowDispensing: true,
        allowTransfer: true,
        requireApproval: false,
        isActive: true,
        hospitalId: hospital.id,
      },
      {
        name: "ห้องเย็น",
        warehouseCode: "COLD",
        type: "COLD_STORAGE",
        location: "ชั้น 1 อาคารเภสัชกรรม",
        address: "อาคารเภสัชกรรม ชั้น 1 ห้องเย็น",
        description: "ห้องเก็บยาที่ต้องควบคุมอุณหภูมิ 2-8°C",
        capacity: 100,
        area: 15.00,
        hasTemperatureControl: true,
        minTemperature: 2,
        maxTemperature: 8,
        hasHumidityControl: true,
        minHumidity: 40,
        maxHumidity: 60,
        securityLevel: "HIGH",
        accessControl: true,
        cctv: true,
        alarm: true,
        allowReceiving: true,
        allowDispensing: true,
        allowTransfer: true,
        requireApproval: true,
        isActive: true,
        hospitalId: hospital.id,
      },
      {
        name: "ห้องเก็บยาควบคุม",
        warehouseCode: "CTRL",
        type: "CONTROLLED",
        location: "ชั้น 1 อาคารเภสัชกรรม",
        address: "อาคารเภสัชกรรม ชั้น 1 ห้องยาควบคุม",
        description: "ห้องเก็บยาควบคุมและยาเสพติด",
        capacity: 50,
        area: 10.00,
        hasTemperatureControl: true,
        minTemperature: 18,
        maxTemperature: 25,
        securityLevel: "MAXIMUM",
        accessControl: true,
        cctv: true,
        alarm: true,
        allowReceiving: true,
        allowDispensing: true,
        allowTransfer: true,
        requireApproval: true,
        isActive: true,
        hospitalId: hospital.id,
      },
      {
        name: "คลังยาห้องผ่าตัด",
        warehouseCode: "OR",
        type: "DISPENSING",
        location: "ชั้น 2 ห้องผ่าตัด",
        address: "อาคารผู้ป่วย ชั้น 2 ห้องผ่าตัด",
        description: "คลังยาสำหรับห้องผ่าตัดและวิสัญญี",
        capacity: 200,
        area: 25.00,
        hasTemperatureControl: true,
        securityLevel: "HIGH",
        accessControl: true,
        allowReceiving: true,
        allowDispensing: true,
        allowTransfer: true,
        requireApproval: false,
        isActive: true,
        hospitalId: hospital.id,
      }
    ];

    const hospitalWarehouses = [];
    
    for (const warehouseInfo of warehouseData) {
      try {
        const warehouse = await prisma.warehouse.upsert({
          where: {
            hospitalId_warehouseCode: {
              hospitalId: hospital.id,
              warehouseCode: warehouseInfo.warehouseCode
            }
          },
          update: {},
          create: warehouseInfo as any
        });
        
        hospitalWarehouses.push(warehouse);
        console.log(`  ✅ ${warehouse.name} (${warehouse.warehouseCode}) - ${warehouse.type}`);
      } catch (error) {
        console.error(`  ❌ Failed to create warehouse ${warehouseInfo.warehouseCode}:`, error);
      }
    }
    
    warehousesByHospital[hospital.id] = hospitalWarehouses;
    console.log(`✅ Created ${hospitalWarehouses.length} warehouses for ${hospital.name}`);
  }

  const totalWarehouses = Object.values(warehousesByHospital).flat().length;
  console.log(`✅ Successfully created ${totalWarehouses} warehouses for ${hospitals.length} hospitals`);
  
  return warehousesByHospital;
}