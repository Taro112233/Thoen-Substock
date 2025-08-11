// prisma/seeds/hospitals.seed.ts - Fixed Version
import { PrismaClient } from "@prisma/client";

export async function seedHospitals(prisma: PrismaClient, devUser: any) {
  console.log("🏥 Creating Hospitals...");

  const hospitalTemplates = [
    {
      hospitalCode: "DEMO001",
      name: "โรงพยาบาลลำปาง",
      nameEn: "Lampang Hospital",
      type: "GOVERNMENT" as any, // Type assertion for enum
      status: "ACTIVE" as any, // Type assertion for enum
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
      subscriptionPlan: "PREMIUM" as any, // Type assertion for enum
      subscriptionStart: new Date(),
      subscriptionEnd: new Date("2025-12-31"),
      maxUsers: 100,
      maxWarehouses: 10,
      lastActivityAt: new Date(),
    },
    {
      hospitalCode: "DEMO002",
      name: "โรงพยาบาลเถิน",
      nameEn: "Thoen Hospital",
      type: "COMMUNITY" as any,
      status: "ACTIVE" as any,
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
      subscriptionPlan: "STANDARD" as any,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date("2025-12-31"),
      maxUsers: 50,
      maxWarehouses: 5,
      lastActivityAt: new Date(),
    },
    {
      hospitalCode: "DEMO003",
      name: "โรงพยาบาลแม่ทะ",
      nameEn: "Mae Tha Hospital",
      type: "COMMUNITY" as any,
      status: "ACTIVE" as any,
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
      subscriptionPlan: "BASIC" as any,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date("2025-12-31"),
      maxUsers: 30,
      maxWarehouses: 3,
      lastActivityAt: new Date(),
    },
  ];

  const hospitals = [];

  for (const template of hospitalTemplates) {
    const hospital = await prisma.hospital.upsert({
      where: { hospitalCode: template.hospitalCode },
      update: {},
      create: template,
    });
    hospitals.push(hospital);
    console.log(`  ✅ ${hospital.name} (${hospital.hospitalCode})`);
  }

  console.log(`✅ Successfully created ${hospitals.length} hospitals`);
  return hospitals;
}