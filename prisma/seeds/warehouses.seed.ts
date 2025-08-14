// prisma/seeds/warehouses.seed.ts - คลังยา 2 ที่สำหรับโรงพยาบาลเถิน
import { PrismaClient } from "@prisma/client";

export async function seedWarehouses(
  prisma: PrismaClient, 
  hospitals: any[]
) {
  console.log("🏪 Creating 2 Warehouses for โรงพยาบาลเถิน...");

  const warehousesByHospital: Record<string, any[]> = {};
  const hospital = hospitals[0]; // โรงพยาบาลเถิน

  console.log(`🏥 Creating warehouses for ${hospital.name}...`);
  
  // ข้อมูล warehouse เฉพาะ 2 ที่
  const warehouseData = [
    {
      name: "คลังยาหลัก",
      warehouseCode: "MAIN",
      type: "CENTRAL",
      location: "ชั้น 1 อาคารเภสัชกรรม",
      address: "อาคารเภสัชกรรม ชั้น 1 ห้อง 101",
      description: "คลังยาหลักของโรงพยาบาลเถิน สำหรับเก็บยาทุกประเภท",
      capacity: 5000,
      area: 150.00,
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
      name: "คลังยา OPD",
      warehouseCode: "OPD",
      type: "DISPENSING",
      location: "ชั้น 1 ห้องจ่ายยาผู้ป่วยนอก",
      address: "อาคารผู้ป่วยนอก ชั้น 1 ห้องจ่ายยา",
      description: "คลังยาสำหรับจ่ายยาผู้ป่วยนอก",
      capacity: 1000,
      area: 80.00,
      hasTemperatureControl: true,
      minTemperature: 18,
      maxTemperature: 25,
      securityLevel: "STANDARD",
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
  console.log(`📦 Warehouses: คลังยาหลัก และ คลังยา OPD`);

  return warehousesByHospital;
}