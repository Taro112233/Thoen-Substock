// prisma/seed.ts - Simple Working Seed Script
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // สร้างโรงพยาบาลตัวอย่าง
    const hospital = await prisma.hospital.upsert({
      where: { hospitalCode: "DEMO001" },
      update: {},
      create: {
        hospitalCode: "DEMO001",
        name: "โรงพยาบาลตัวอย่าง",
        nameEn: "Demo Hospital",
        type: "GOVERNMENT",
        status: "ACTIVE",
        address: "123 ถนนตัวอย่าง",
        district: "ในเมือง",
        subDistrict: "เมือง", 
        province: "กรุงเทพมหานคร",
        postalCode: "10100",
        phone: "02-123-4567",
        email: "info@demo-hospital.th",
        website: "https://demo-hospital.th",
        licenseNo: "LIC001",
        licenseExpiry: new Date("2025-12-31"),
        bedCount: 200,
        employeeCount: 150,
        establishedYear: 2000,
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
        name: "โรงพยาบาลชุมชนตัวอย่าง",
        nameEn: "Demo Community Hospital",
        type: "COMMUNITY",
        status: "ACTIVE",
        address: "456 ถนนชุมชน",
        district: "ในเมือง",
        subDistrict: "เมือง", 
        province: "นนทบุรี",
        postalCode: "11000",
        phone: "02-456-7890",
        email: "info@demo-community.th",
        licenseNo: "LIC002",
        licenseExpiry: new Date("2025-12-31"),
        bedCount: 50,
        employeeCount: 40,
        establishedYear: 2010,
        subscriptionPlan: "STANDARD",
        subscriptionStart: new Date(),
        subscriptionEnd: new Date("2025-12-31"),
        maxUsers: 30,
        maxWarehouses: 5,
        lastActivityAt: new Date(),
      },
    });

    console.log("✅ Created hospital:", hospital2.name);

    // สร้างแผนกสำหรับโรงพยาบาลแรก (ใช้เฉพาะ field ที่มีจริงใน schema)
    const departments = [
      {
        departmentCode: "PHARM",
        name: "เภสัชกรรม",
        nameEn: "Pharmacy Department",
        type: "PHARMACY",
        location: "ชั้น 1",
        phone: "02-123-4567 ต่อ 101",
        email: "pharmacy@demo-hospital.th",
      },
      {
        departmentCode: "EMERG",
        name: "ห้องฉุกเฉิน",
        nameEn: "Emergency Department",
        type: "EMERGENCY",
        location: "ชั้น 1",
        phone: "02-123-4567 ต่อ 911",
        email: "emergency@demo-hospital.th",
      },
      {
        departmentCode: "ICU",
        name: "หอผู้ป่วยวิกฤต",
        nameEn: "Intensive Care Unit",
        type: "ICU",
        location: "ชั้น 3",
        phone: "02-123-4567 ต่อ 301",
        email: "icu@demo-hospital.th",
      },
      {
        departmentCode: "SURG",
        name: "แผนกศัลยกรรม",
        nameEn: "Surgery Department",
        type: "SURGERY",
        location: "ชั้น 2",
        phone: "02-123-4567 ต่อ 201",
        email: "surgery@demo-hospital.th",
      },
      {
        departmentCode: "PEDIA",
        name: "กุมารเวชกรรม",
        nameEn: "Pediatrics Department",
        type: "PEDIATRICS",
        location: "ชั้น 2",
        phone: "02-123-4567 ต่อ 202",
        email: "pediatrics@demo-hospital.th",
      },
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
          type: dept.type,
          location: dept.location,
          phone: dept.phone,
          email: dept.email,
          isActive: true,
        },
      });
      console.log("✅ Created department:", department.name);
    }

    // สร้างแผนกสำหรับโรงพยาบาลที่ 2
    const departments2 = [
      {
        departmentCode: "PHARM",
        name: "เภสัชกรรม",
        nameEn: "Pharmacy Department",
        type: "PHARMACY",
        location: "ชั้น 1",
        phone: "02-456-7890 ต่อ 101",
        email: "pharmacy@demo-community.th",
      },
      {
        departmentCode: "EMERG",
        name: "ห้องฉุกเฉิน",
        nameEn: "Emergency Department",
        type: "EMERGENCY",
        location: "ชั้น 1",
        phone: "02-456-7890 ต่อ 911",
        email: "emergency@demo-community.th",
      },
    ];

    for (const dept of departments2) {
      const department = await prisma.department.upsert({
        where: { 
          hospitalId_departmentCode: {
            hospitalId: hospital2.id,
            departmentCode: dept.departmentCode,
          }
        },
        update: {},
        create: {
          hospitalId: hospital2.id,
          departmentCode: dept.departmentCode,
          name: dept.name,
          nameEn: dept.nameEn,
          type: dept.type,
          location: dept.location,
          phone: dept.phone,
          email: dept.email,
          isActive: true,
        },
      });
      console.log("✅ Created department for hospital 2:", department.name);
    }

    // สร้าง Admin User ตัวอย่าง
    const hashedAdminPassword = await hashPassword("admin123");
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
        employeeId: "ADM001",
        position: "ผู้ดูแลระบบ",
        role: "HOSPITAL_ADMIN",
        status: "ACTIVE",
        hospitalId: hospital.id,
        isProfileComplete: true,
        emailVerified: true,
        password: hashedAdminPassword,
      },
    });

    console.log("✅ Created admin user:", adminUser.email);

    // สร้าง Pharmacy Manager User ตัวอย่าง
    const hashedPharmPassword = await hashPassword("pharm123");
    const pharmDept = await prisma.department.findFirst({ 
      where: { departmentCode: "PHARM", hospitalId: hospital.id } 
    });
    
    const pharmUser = await prisma.user.upsert({
      where: { email: "pharm@demo-hospital.th" },
      update: {},
      create: {
        email: "pharm@demo-hospital.th",
        username: "pharm_manager",
        name: "ผู้จัดการเภสัชกรรม",
        firstName: "ผู้จัดการ",
        lastName: "เภสัชกรรม",
        phoneNumber: "0812345679",
        employeeId: "PH001",
        position: "ผู้จัดการแผนกเภสัชกรรม",
        role: "PHARMACY_MANAGER",
        status: "ACTIVE",
        hospitalId: hospital.id,
        departmentId: pharmDept?.id,
        isProfileComplete: true,
        emailVerified: true,
        password: hashedPharmPassword,
      },
    });

    console.log("✅ Created pharmacy manager:", pharmUser.email);

    // สร้าง Test User ตัวอย่าง (รอการอนุมัติ)
    const hashedNursePassword = await hashPassword("nurse123");
    const icuDept = await prisma.department.findFirst({ 
      where: { departmentCode: "ICU", hospitalId: hospital.id } 
    });
    
    const nurseUser = await prisma.user.upsert({
      where: { email: "nurse@demo-hospital.th" },
      update: {},
      create: {
        email: "nurse@demo-hospital.th", 
        username: "nurse001",
        name: "พยาบาลทดสอบ",
        firstName: "พยาบาล",
        lastName: "ทดสอบ",
        phoneNumber: "0823456789",
        employeeId: "NS001",
        position: "พยาบาลวิชาชีพ",
        role: "STAFF_NURSE",
        status: "PENDING", // รอการอนุมัติ
        hospitalId: hospital.id,
        departmentId: icuDept?.id,
        isProfileComplete: true,
        emailVerified: true,
        password: hashedNursePassword,
      },
    });

    console.log("✅ Created test user:", nurseUser.email);

    console.log("\n🎉 Database seed completed successfully!");
    console.log("\n📋 Test accounts:");
    console.log("👨‍💼 Admin: admin@demo-hospital.th / admin123 (ACTIVE)");
    console.log("👩‍⚕️ Pharmacy Manager: pharm@demo-hospital.th / pharm123 (ACTIVE)");
    console.log("👩‍⚕️ Nurse: nurse@demo-hospital.th / nurse123 (PENDING)");
    console.log("\n🏥 Hospitals:");
    console.log("🏢 โรงพยาบาลตัวอย่าง (DEMO001)");
    console.log("🏢 โรงพยาบาลชุมชนตัวอย่าง (DEMO002)");
    console.log("\n📝 Next steps:");
    console.log("1. Run: pnpm dev");
    console.log("2. Try registration at /auth/register");
    console.log("3. Try login with test accounts");
    console.log("4. Admin can approve pending users");

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