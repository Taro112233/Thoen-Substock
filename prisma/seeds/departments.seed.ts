// prisma/seeds/departments.seed.ts - แผนกสำหรับโรงพยาบาลเถิน
import { PrismaClient } from "@prisma/client";

export async function seedDepartments(prisma: PrismaClient, hospitals: any[]) {
  console.log("🏢 Creating Departments for โรงพยาบาลเถิน...");

  const hospital = hospitals[0]; // โรงพยาบาลเถิน
  
  const departmentTemplates = [
    {
      departmentCode: "ADMIN",
      name: "ฝ่ายบริหาร",
      nameEn: "Administration Department",
      type: "ADMINISTRATION",
      location: "ชั้น 1 อาคารบริหาร",
      phone: "054-231-200",
      email: "admin@thoen-hospital.go.th",
    },
    {
      departmentCode: "PHARM",
      name: "เภสัชกรรม",
      nameEn: "Pharmacy Department",
      type: "PHARMACY",
      location: "ชั้น 1 อาคารผู้ป่วยนอก",
      phone: "054-231-210",
      email: "pharmacy@thoen-hospital.go.th",
    },
    {
      departmentCode: "EMERG",
      name: "ห้องฉุกเฉิน", 
      nameEn: "Emergency Department",
      type: "EMERGENCY",
      location: "ชั้น 1 อาคารอุบัติเหตุและฉุกเฉิน",
      phone: "054-231-911",
      email: "emergency@thoen-hospital.go.th",
    },
    {
      departmentCode: "OPD",
      name: "ผู้ป่วยนอก",
      nameEn: "Out Patient Department",
      type: "OUTPATIENT",
      location: "ชั้น 1-2 อาคารผู้ป่วยนอก",
      phone: "054-231-220",
      email: "opd@thoen-hospital.go.th",
    },
    {
      departmentCode: "IPD",
      name: "ผู้ป่วยใน", 
      nameEn: "In Patient Department",
      type: "INPATIENT",
      location: "ชั้น 2-3 อาคารผู้ป่วยใน",
      phone: "054-231-230",
      email: "ipd@thoen-hospital.go.th",
    },
    {
      departmentCode: "LAB",
      name: "ห้องปฏิบัติการ",
      nameEn: "Laboratory Department",
      type: "LABORATORY",
      location: "ชั้น 1 อาคารผู้ป่วยนอก",
      phone: "054-231-240",
      email: "lab@thoen-hospital.go.th",
    },
    {
      departmentCode: "XRAY",
      name: "รังสีวิทยา",
      nameEn: "Radiology Department",
      type: "RADIOLOGY",
      location: "ชั้น 1 อาคารผู้ป่วยนอก",
      phone: "054-231-250",
      email: "xray@thoen-hospital.go.th",
    },
    {
      departmentCode: "NURSING",
      name: "ฝ่ายการพยาบาล",
      nameEn: "Nursing Department",
      type: "ADMINISTRATION", // เปลี่ยนจาก NURSING เป็น ADMINISTRATION
      location: "ชั้น 2 อาคารบริหาร",
      phone: "054-231-260",
      email: "nursing@thoen-hospital.go.th",
    }
  ];

  console.log(`🏥 Creating departments for ${hospital.name}...`);
  const hospitalDepartments: any[] = [];

  for (const template of departmentTemplates) {
    const department = await prisma.department.upsert({
      where: { 
        hospitalId_departmentCode: {
          hospitalId: hospital.id,
          departmentCode: template.departmentCode,
        }
      },
      update: {},
      create: {
        hospitalId: hospital.id,
        departmentCode: template.departmentCode,
        name: template.name,
        nameEn: template.nameEn,
        type: template.type as any,
        location: template.location,
        phone: template.phone,
        email: template.email,
        isActive: true,
      },
    });
    hospitalDepartments.push(department);
    console.log(`  ✅ ${department.name} (${department.departmentCode})`);
  }

  console.log(`✅ Successfully created ${departmentTemplates.length} departments for โรงพยาบาลเถิน`);
  console.log(`🏢 Department Summary:`);
  console.log(`   - บริหารงาน: ฝ่ายบริหาร, ฝ่ายการพยาบาล`);
  console.log(`   - การรักษา: ผู้ป่วยนอก, ผู้ป่วยใน, ห้องฉุกเฉิน`);
  console.log(`   - สนับสนุน: เภสัชกรรม, ห้องปฏิบัติการ, รังสีวิทยา`);
  
  return { [hospital.id]: hospitalDepartments };
}