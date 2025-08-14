// prisma/seeds/users.seed.ts - 10 Users สำหรับโรงพยาบาลเถิน
import { Prisma, PrismaClient } from "@prisma/client";
import { hashPassword } from "../../lib/password-utils";

export async function seedUsers(
  prisma: PrismaClient, 
  hospitals: any[], 
  departments: Record<string, any[]>, 
  personnelTypes: Record<string, any[]>
) {
  console.log("👥 Creating 10 Users for โรงพยาบาลเถิน...");

  const users: any[] = [];
  const hospital = hospitals[0]; // โรงพยาบาลเถิน

  const userTemplates = [
    // 1. ผู้อำนวยการ
    {
      email: "director@thoen-hospital.go.th",
      username: "director",
      name: "นายวิชัย ศิริผล",
      firstName: "วิชัย",
      lastName: "ศิริผล",
      phoneNumber: "054-231-200",
      employeeId: "DIR001", 
      position: "ผู้อำนวยการโรงพยาบาลเถิน",
      role: "HOSPITAL_ADMIN",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "DIR",
      password: "director123"
    },
    // 2. หัวหน้าเภสัชกรรม
    {
      email: "chief.pharm@thoen-hospital.go.th",
      username: "chief_pharm",
      name: "นางสาวสุภาพร ยาดี",
      firstName: "สุภาพร",
      lastName: "ยาดี",
      phoneNumber: "054-231-210",
      employeeId: "PH001",
      position: "หัวหน้าแผนกเภสัชกรรม",
      role: "PHARMACY_MANAGER",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "CHIEF_PHARM",
      password: "pharm123"
    },
    // 3. เภสัชกรชำนาญการ
    {
      email: "senior.pharm@thoen-hospital.go.th",
      username: "senior_pharm",
      name: "นายเภสัช ชำนาญการ",
      firstName: "เภสัช",
      lastName: "ชำนาญการ",
      phoneNumber: "054-231-211",
      employeeId: "PH002",
      position: "เภสัชกรชำนาญการ",
      role: "SENIOR_PHARMACIST",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "SR_PHARM",
      password: "pharm123"
    },
    // 4. เภสัชกร คนที่ 1
    {
      email: "pharm1@thoen-hospital.go.th",
      username: "pharm1",
      name: "นางสาวยาใส ดูแลดี",
      firstName: "ยาใส",
      lastName: "ดูแลดี",
      phoneNumber: "054-231-212",
      employeeId: "PH003",
      position: "เภสัชกร",
      role: "STAFF_PHARMACIST",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "PHARM",
      password: "pharm123"
    },
    // 5. เภสัชกร คนที่ 2
    {
      email: "pharm2@thoen-hospital.go.th",
      username: "pharm2",
      name: "นายสมชาย จ่ายยา",
      firstName: "สมชาย",
      lastName: "จ่ายยา",
      phoneNumber: "054-231-213",
      employeeId: "PH004",
      position: "เภสัชกร",
      role: "STAFF_PHARMACIST",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "PHARM",
      password: "pharm123"
    },
    // 6. หัวหน้าพยาบาล
    {
      email: "chief.nurse@thoen-hospital.go.th",
      username: "chief_nurse",
      name: "นางสุวิมล ใจดี",
      firstName: "สุวิมล",
      lastName: "ใจดี",
      phoneNumber: "054-231-220",
      employeeId: "N001",
      position: "หัวหน้าฝ่ายการพยาบาล",
      role: "DEPARTMENT_HEAD",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "CHIEF_NURSE",
      password: "nurse123"
    },
    // 7. พยาบาลชำนาญการ
    {
      email: "senior.nurse@thoen-hospital.go.th",
      username: "senior_nurse",
      name: "นางพยาบาล ชำนาญงาน",
      firstName: "พยาบาล",
      lastName: "ชำนาญงาน",
      phoneNumber: "054-231-221",
      employeeId: "N002",
      position: "พยาบาลวิชาชีพชำนาญการ",
      role: "STAFF_NURSE",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "SR_NURSE",
      password: "nurse123"
    },
    // 8. พยาบาล คนที่ 1
    {
      email: "nurse1@thoen-hospital.go.th",
      username: "nurse1",
      name: "นางสาวพยาบาล ดูแลใจ",
      firstName: "พยาบาล",
      lastName: "ดูแลใจ",
      phoneNumber: "054-231-222",
      employeeId: "N003",
      position: "พยาบาลวิชาชีพ",
      role: "STAFF_NURSE",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "NURSE",
      password: "nurse123"
    },
    // 9. พยาบาล คนที่ 2
    {
      email: "nurse2@thoen-hospital.go.th",
      username: "nurse2",
      name: "นางพยาบาล ใจเย็น",
      firstName: "พยาบาล",
      lastName: "ใจเย็น",
      phoneNumber: "054-231-223",
      employeeId: "N004",
      position: "พยาบาลวิชาชีพ",
      role: "STAFF_NURSE",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "NURSE",
      password: "nurse123"
    },
    // 10. ผู้ช่วยเภสัชกร
    {
      email: "pharm.tech@thoen-hospital.go.th",
      username: "pharm_tech",
      name: "นายช่วยเภสัช ขยันงาน",
      firstName: "ช่วยเภสัช",
      lastName: "ขยันงาน",
      phoneNumber: "054-231-214",
      employeeId: "PT001",
      position: "ผู้ช่วยเภสัชกร",
      role: "PHARMACY_TECHNICIAN",
      status: "ACTIVE",
      hospitalId: hospital.id,
      personnelTypeCode: "PHARM_TECH",
      password: "tech123"
    }
  ];

  // Create all users
  for (const template of userTemplates) {
    const hashedPassword = await hashPassword(template.password);
    const personnelType = personnelTypes[template.hospitalId]?.find((pt: any) => pt.typeCode === template.personnelTypeCode);
    
    // Remove fields that don't exist in schema
    const { password, personnelTypeCode, ...userCreateData } = template;
    
    const user = await prisma.user.upsert({
      where: { 
        email: template.email 
      },
      update: {},
      create: {
        ...(userCreateData as Prisma.UserUncheckedCreateInput),
        hospitalId: template.hospitalId,
        personnelTypeId: personnelType?.id || null,
        isProfileComplete: true,
        emailVerified: true,
        password: hashedPassword,
      },
    });
    
    users.push(user);
    console.log(`  ✅ ${user.name} (${template.personnelTypeCode}) - ${template.role}`);
  }

  console.log(`✅ Successfully created ${users.length} users for โรงพยาบาลเถิน`);
  console.log(`👥 User Distribution:`);
  console.log(`   - ผู้บริหาร: 1 คน (ผู้อำนวยการ)`);
  console.log(`   - เภสัชกร: 4 คน (หัวหน้า + ชำนาญการ + เภสัชกร 2 คน)`);
  console.log(`   - พยาบาล: 4 คน (หัวหน้า + ชำนาญการ + พยาบาล 2 คน)`);
  console.log(`   - สนับสนุน: 1 คน (ผู้ช่วยเภสัชกร)`);
  
  return users;
}