// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // สร้างโรงพยาบาลตัวอย่าง
  const hospital = await prisma.hospital.upsert({
    where: { code: "DEMO001" },
    update: {},
    create: {
      code: "DEMO001",
      name: "โรงพยาบาลตัวอย่าง",
      type: "GOVERNMENT",
      status: "ACTIVE",
      address: "123 ถนนตัวอย่าง",
      district: "เมือง",
      subDistrict: "ในเมือง", 
      province: "กรุงเทพมหานคร",
      postalCode: "10100",
      phone: "02-123-4567",
      email: "info@demo-hospital.th",
      licenseNumber: "LIC001",
      licenseExpiryDate: new Date("2025-12-31"),
      bedCount: 200,
      isActive: true,
    },
  });

  console.log("✅ Created hospital:", hospital.name);

  // สร้างแผนกต่างๆ
  const departments = [
    {
      code: "PHARM",
      name: "เภสัชกรรม",
      type: "PHARMACY",
      description: "แผนกเภสัชกรรม จัดการยาและเวชภัณฑ์",
      location: "ชั้น 1",
      phone: "02-123-4567 ต่อ 101",
      email: "pharmacy@demo-hospital.th",
    },
    {
      code: "EMERG",
      name: "ห้องฉุกเฉิน",
      type: "EMERGENCY", 
      description: "แผนกฉุกเฉิน รับผู้ป่วยฉุกเฉิน 24 ชั่วโมง",
      location: "ชั้น 1",
      phone: "02-123-4567 ต่อ 911",
      email: "emergency@demo-hospital.th",
    },
    {
      code: "ICU",
      name: "หอผู้ป่วยวิกฤต",
      type: "ICU",
      description: "หอผู้ป่วยวิกฤต ดูแลผู้ป่วยหนัก",
      location: "ชั้น 3",
      phone: "02-123-4567 ต่อ 301",
      email: "icu@demo-hospital.th",
    },
    {
      code: "SURG",
      name: "แผนกศัลยกรรม",
      type: "SURGERY",
      description: "แผนกศัลยกรรม ทำการผ่าตัด",
      location: "ชั้น 2",
      phone: "02-123-4567 ต่อ 201",
      email: "surgery@demo-hospital.th",
    },
    {
      code: "PEDIA",
      name: "กุมารเวชกรรม", 
      type: "PEDIATRICS",
      description: "แผนกกุมารเวชกรรม ดูแลเด็ก",
      location: "ชั้น 2",
      phone: "02-123-4567 ต่อ 202",
      email: "pediatrics@demo-hospital.th",
    },
  ];

  for (const dept of departments) {
    const department = await prisma.department.upsert({
      where: { 
        hospitalId_code: {
          hospitalId: hospital.id,
          code: dept.code,
        }
      },
      update: {},
      create: {
        ...dept,
        hospitalId: hospital.id,
        isActive: true,
      },
    });
    console.log("✅ Created department:", department.name);
  }

  // สร้าง Admin User ตัวอย่าง
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@demo-hospital.th" },
    update: {},
    create: {
      email: "admin@demo-hospital.th",
      username: "admin",
      name: "ผู้ดูแลระบบ",
      firstName: "ผู้ดูแล",
      lastName: "ระบบ",
      phoneNumber: "0812345678",
      position: "ADMIN",
      role: "HOSPITAL_ADMIN",
      status: "ACTIVE",
      hospitalId: hospital.id,
      isProfileComplete: true,
      emailVerified: true,
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/cxLFlNhg5xDw9Ng3G", // password: "admin123"
    },
  });

  console.log("✅ Created admin user:", adminUser.email);

  // สร้าง Test User ตัวอย่าง
  const testUser = await prisma.user.upsert({
    where: { email: "nurse@demo-hospital.th" },
    update: {},
    create: {
      email: "nurse@demo-hospital.th", 
      username: "nurse001",
      name: "พยาบาลทดสอบ",
      firstName: "พยาบาล",
      lastName: "ทดสอบ",
      phoneNumber: "0823456789",
      position: "NURSE",
      role: "STAFF_NURSE",
      status: "PENDING", // รอการอนุมัติ
      hospitalId: hospital.id,
      departmentId: departments.find(d => d.code === "ICU") ? 
        (await prisma.department.findFirst({ 
          where: { code: "ICU", hospitalId: hospital.id } 
        }))?.id : undefined,
      isProfileComplete: true,
      emailVerified: true,
      password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/cxLFlNhg5xDw9Ng3G", // password: "nurse123"
    },
  });

  console.log("✅ Created test user:", testUser.email);

  console.log("\n🎉 Database seed completed successfully!");
  console.log("\n📋 Test accounts:");
  console.log("👨‍💼 Admin: admin@demo-hospital.th / admin123 (ACTIVE)");
  console.log("👩‍⚕️ Nurse: nurse@demo-hospital.th / nurse123 (PENDING)");
  console.log("\n🏥 Hospital: โรงพยาบาลตัวอย่าง");
  console.log("🏢 Departments: เภสัชกรรม, ห้องฉุกเฉิน, หอผู้ป่วยวิกฤต, ศัลยกรรม, กุมารเวชกรรม");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });