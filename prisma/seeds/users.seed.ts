// prisma/seeds/users.seed.ts - Final Fixed Version
import { Prisma, PrismaClient } from "@prisma/client";
import { hashPassword } from "../../lib/password-utils";

export async function seedUsers(
  prisma: PrismaClient, 
  hospitals: any[], 
  departments: Record<string, any[]>, 
  personnelTypes: Record<string, any[]>
) {
  console.log("👥 Creating Diverse Users with Personnel Types...");

  const users: any[] = [];

  // Hospital 1 - Lampang Hospital (Complete Staff)
  const hospital1 = hospitals[0];

  const userTemplates = [
    // LAMPANG HOSPITAL STAFF
    {
      email: "director@lampang-hospital.go.th",
      username: "director01",
      name: "นายวิชัย ใจดี",
      firstName: "วิชัย",
      lastName: "ใจดี",
      phoneNumber: "054-237-400",
      employeeId: "DIR001", 
      position: "ผู้อำนวยการโรงพยาบาลลำปาง",
      role: "DIRECTOR",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "DIR",
      password: "director123"
    },
    {
      email: "asst.director@lampang-hospital.go.th",
      username: "asst_director01",
      name: "นางสาวสุดา ช่วยงาน",
      firstName: "สุดา",
      lastName: "ช่วยงาน",
      phoneNumber: "054-237-401",
      employeeId: "ADIR001", 
      position: "รองผู้อำนวยการโรงพยาบาลลำปาง",
      role: "DIRECTOR",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "ASST_DIR",
      password: "asst123"
    },
    {
      email: "chief.pharm@lampang-hospital.go.th",
      username: "chief_pharm01",
      name: "นางสมใจ ยาดี",
      firstName: "สมใจ",
      lastName: "ยาดี",
      phoneNumber: "054-237-411",
      employeeId: "PH001",
      position: "หัวหน้าแผนกเภสัชกรรม",
      role: "GROUP_HEAD",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "CHIEF_PHARM",
      password: "chief123"
    },
    {
      email: "chief.nurse@lampang-hospital.go.th",
      username: "chief_nurse01",
      name: "นางพยาบาลใหญ่ ดูแลดี",
      firstName: "พยาบาลใหญ่",
      lastName: "ดูแลดี",
      phoneNumber: "054-237-321",
      employeeId: "CN001",
      position: "หัวหน้าฝ่ายการพยาบาล",
      role: "GROUP_HEAD",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "CHIEF_NURSE",
      password: "nurse123"
    },
    {
      email: "sr.pharm@lampang-hospital.go.th",
      username: "sr_pharm01",
      name: "นายเภสัช ชำนาญการ",
      firstName: "เภสัช",
      lastName: "ชำนาญการ",
      phoneNumber: "054-237-412",
      employeeId: "SPH001",
      position: "เภสัชกรชำนาญการ",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "SR_PHARM",
      password: "srpharm123"
    },
    {
      email: "pharm01@lampang-hospital.go.th",
      username: "pharm01",
      name: "นางสาวยาใส จ่ายดี",
      firstName: "ยาใส",
      lastName: "จ่ายดี",
      phoneNumber: "054-237-413",
      employeeId: "PH002",
      position: "เภสัชกร",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "PHARM",
      password: "pharm123"
    },
    {
      email: "pharm02@lampang-hospital.go.th",
      username: "pharm02",
      name: "นายยาสมุนไพร รักษาโรค",
      firstName: "ยาสมุนไพร",
      lastName: "รักษาโรค",
      phoneNumber: "054-237-414",
      employeeId: "PH003",
      position: "เภสัชกร",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "PHARM",
      password: "pharm123"
    },
    {
      email: "sr.nurse@lampang-hospital.go.th",
      username: "sr_nurse01",
      name: "นางพยาบาล ชำนาญงาน",
      firstName: "พยาบาล",
      lastName: "ชำนาญงาน",
      phoneNumber: "054-237-322",
      employeeId: "SN001",
      position: "พยาบาลวิชาชีพชำนาญการ",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "SR_NURSE",
      password: "srnurse123"
    },
    {
      email: "nurse01@lampang-hospital.go.th",
      username: "nurse01",
      name: "นางสาวพยาบาล ดูแลใจ",
      firstName: "พยาบาล",
      lastName: "ดูแลใจ",
      phoneNumber: "054-237-323",
      employeeId: "N001",
      position: "พยาบาลวิชาชีพ",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "NURSE",
      password: "nurse123"
    },
    {
      email: "nurse02@lampang-hospital.go.th",
      username: "nurse02",
      name: "นางพยาบาล ใจเย็น",
      firstName: "พยาบาล",
      lastName: "ใจเย็น",
      phoneNumber: "054-237-324",
      employeeId: "N002",
      position: "พยาบาลวิชาชีพ",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "NURSE",
      password: "nurse123"
    },
    {
      email: "nurse.assist@lampang-hospital.go.th",
      username: "nurse_assist01",
      name: "นายช่วยพยาบาล ขยันงาน",
      firstName: "ช่วยพยาบาล",
      lastName: "ขยันงาน",
      phoneNumber: "054-237-325",
      employeeId: "NA001",
      position: "ผู้ช่วยพยาบาล",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "NURSE_ASS",
      password: "assist123"
    },
    {
      email: "pharm.tech@lampang-hospital.go.th",
      username: "pharm_tech01",
      name: "นางสาวช่วยเภสัช คล่องแคล่ว",
      firstName: "ช่วยเภสัช",
      lastName: "คล่องแคล่ว",
      phoneNumber: "054-237-415",
      employeeId: "PT001",
      position: "ผู้ช่วยเภสัชกร",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "PHARM_TECH",
      password: "tech123"
    },
    {
      email: "admin@lampang-hospital.go.th",
      username: "admin01",
      name: "นางสาวธุรการ จัดระเบียบ",
      firstName: "ธุรการ",
      lastName: "จัดระเบียบ",
      phoneNumber: "054-237-100",
      employeeId: "AD001",
      position: "เจ้าหน้าที่บริหารงานทั่วไป",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital1.id,
      personnelTypeCode: "ADMIN",
      password: "admin123"
    },

    // STUDENTS (PENDING APPROVAL)
    {
      email: "intern.pharm@lampang-hospital.go.th",
      username: "intern_pharm01",
      name: "นายนักศึกษา ฝึกหัดยา",
      firstName: "นักศึกษา",
      lastName: "ฝึกหัดยา",
      phoneNumber: "081-234-5678",
      employeeId: "IP001",
      position: "นักศึกษาเภสัชศาสตร์ฝึกงาน",
      role: "STUDENT",
      status: "PENDING",
      hospitalId: hospital1.id,
      personnelTypeCode: "INTERN_PHARM",
      password: "intern123"
    },
    {
      email: "intern.nurse@lampang-hospital.go.th",
      username: "intern_nurse01",
      name: "นางสาวนักศึกษา ฝึกพยาบาล",
      firstName: "นักศึกษา",
      lastName: "ฝึกพยาบาล",
      phoneNumber: "081-234-5679",
      employeeId: "IN001",
      position: "นักศึกษาพยาบาลฝึกงาน",
      role: "STUDENT",
      status: "PENDING",
      hospitalId: hospital1.id,
      personnelTypeCode: "INTERN_NURSE",
      password: "intern123"
    },
    {
      email: "trainee@lampang-hospital.go.th",
      username: "trainee01",
      name: "นายพนักงานใหม่ เรียนรู้งาน",
      firstName: "พนักงานใหม่",
      lastName: "เรียนรู้งาน",
      phoneNumber: "081-234-5680",
      employeeId: "TR001",
      position: "พนักงานฝึกหัด",
      role: "STAFF",
      status: "PENDING",
      hospitalId: hospital1.id,
      personnelTypeCode: "TRAINEE",
      password: "trainee123"
    }
  ];

  // Hospital 2 - Thoen Hospital (Essential Staff)
  const hospital2 = hospitals[1];
  const hospital2Users = [
    {
      email: "director@thoen-hospital.go.th",
      username: "director02",
      name: "นายผู้อำนวยการ โรงพยาบาลเถิน",
      firstName: "ผู้อำนวยการ",
      lastName: "โรงพยาบาลเถิน",
      phoneNumber: "054-231-234",
      employeeId: "DIR002", 
      position: "ผู้อำนวยการโรงพยาบาลเถิน",
      role: "DIRECTOR",
      status: "ACTIVE",
      hospitalId: hospital2.id,
      personnelTypeCode: "DIR",
      password: "director123"
    },
    {
      email: "pharm@thoen-hospital.go.th",
      username: "pharm_thoen",
      name: "นางเภสัช โรงพยาบาลเถิน",
      firstName: "เภสัช",
      lastName: "โรงพยาบาลเถิน",
      phoneNumber: "054-231-235",
      employeeId: "PH004",
      position: "เภสัชกรหัวหน้า",
      role: "GROUP_HEAD",
      status: "ACTIVE",
      hospitalId: hospital2.id,
      personnelTypeCode: "CHIEF_PHARM",
      password: "pharm123"
    },
    {
      email: "nurse@thoen-hospital.go.th",
      username: "nurse_thoen",
      name: "นางพยาบาล โรงพยาบาลเถิน",
      firstName: "พยาบาล",
      lastName: "โรงพยาบาลเถิน",
      phoneNumber: "054-231-236",
      employeeId: "N003",
      position: "พยาบาลวิชาชีพ",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital2.id,
      personnelTypeCode: "NURSE",
      password: "nurse123"
    }
  ];

  // Hospital 3 - Mae Tha Hospital (Essential Staff)
  const hospital3 = hospitals[2];
  const hospital3Users = [
    {
      email: "director@maetha-hospital.go.th",
      username: "director03",
      name: "นายผู้อำนวยการ โรงพยาบาลแม่ทะ",
      firstName: "ผู้อำนวยการ",
      lastName: "โรงพยาบาลแม่ทะ",
      phoneNumber: "054-234-567",
      employeeId: "DIR003", 
      position: "ผู้อำนวยการโรงพยาบาลแม่ทะ",
      role: "DIRECTOR",
      status: "ACTIVE",
      hospitalId: hospital3.id,
      personnelTypeCode: "DIR",
      password: "director123"
    },
    {
      email: "pharm@maetha-hospital.go.th",
      username: "pharm_maetha",
      name: "นายเภสัช โรงพยาบาลแม่ทะ",
      firstName: "เภสัช",
      lastName: "โรงพยาบาลแม่ทะ",
      phoneNumber: "054-234-568",
      employeeId: "PH005",
      position: "เภสัชกร",
      role: "STAFF",
      status: "ACTIVE",
      hospitalId: hospital3.id,
      personnelTypeCode: "PHARM",
      password: "pharm123"
    }
  ];

  // Combine all user templates
  const allUserTemplates = [...userTemplates, ...hospital2Users, ...hospital3Users];

  // Create all users with proper type handling - ใช้ upsert แทน create
  for (const template of allUserTemplates) {
    const hashedPassword = await hashPassword(template.password);
    const personnelType = personnelTypes[template.hospitalId].find((pt: any) => pt.typeCode === template.personnelTypeCode);
    
    // Remove fields that don't exist in schema and fix for Prisma
    const { password, personnelTypeCode, ...userCreateData } = template;
    
    // ใช้ upsert แทน create เพื่อป้องกัน duplicate
    const user = await prisma.user.upsert({
      where: { 
        email: template.email 
      },
      update: {}, // ไม่อัพเดทถ้ามีอยู่แล้ว
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
    console.log(`✅ Created user: ${user.name} (${personnelTypeCode})`);
  }

  console.log(`✅ Successfully created ${users.length} users across all hospitals`);
  return users;
}