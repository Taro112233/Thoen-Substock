// prisma/seeds/hospitals.seed.ts - โรงพยาบาลเถิน เฉพาะ
import { PrismaClient } from "@prisma/client";

export async function seedHospitals(prisma: PrismaClient, devUser: any) {
  console.log("🏥 Creating โรงพยาบาลเถิน...");

  const hospitalTemplate = {
    hospitalCode: "THOEN001",
    name: "โรงพยาบาลเถิน",
    nameEn: "Thoen Hospital",
    type: "COMMUNITY" as any,
    status: "ACTIVE" as any,
    address: "456 ถนนเถิน-ลำปาง อำเภอเถิน",
    district: "เถิน",
    subDistrict: "เถิน", 
    province: "ลำปาง",
    postalCode: "52160",
    phone: "054-231-234",
    email: "info@thoen-hospital.go.th",
    website: "https://thoen-hospital.go.th",
    licenseNo: "TH001",
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
  };

  const hospital = await prisma.hospital.upsert({
    where: { hospitalCode: hospitalTemplate.hospitalCode },
    update: {},
    create: hospitalTemplate,
  });

  console.log(`  ✅ ${hospital.name} (${hospital.hospitalCode})`);
  console.log(`✅ Successfully created โรงพยาบาลเถิน`);
  
  return [hospital]; // Return array with single hospital
}