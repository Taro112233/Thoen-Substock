// prisma/seeds/departments.seed.ts - Fixed Version
import { PrismaClient } from "@prisma/client";

export async function seedDepartments(prisma: PrismaClient, hospitals: any[]) {
  console.log("🏢 Creating Departments...");

  const departmentTemplates = [
    {
      departmentCode: "ADMIN",
      name: "ฝ่ายบริหาร",
      nameEn: "Administration Department",
      type: "ADMINISTRATION",
      location: "ชั้น 1 อาคารบริหาร",
      phone: "100",
      email: "admin@hospital.go.th",
      // description field removed - not in schema
    },
    {
      departmentCode: "PHARM",
      name: "เภสัชกรรม",
      nameEn: "Pharmacy Department",
      type: "PHARMACY",
      location: "ชั้น 1 อาคารผู้ป่วยนอก",
      phone: "101",
      email: "pharmacy@hospital.go.th",
    },
    {
      departmentCode: "EMERG",
      name: "ห้องฉุกเฉิน", 
      nameEn: "Emergency Department",
      type: "EMERGENCY",
      location: "ชั้น 1 อาคารอุบัติเหตุและฉุกเฉิน",
      phone: "911",
      email: "emergency@hospital.go.th",
    },
    {
      departmentCode: "ICU",
      name: "หอผู้ป่วยวิกฤต",
      nameEn: "Intensive Care Unit", 
      type: "ICU",
      location: "ชั้น 3 อาคารผู้ป่วยใน",
      phone: "301",
      email: "icu@hospital.go.th",
    },
    {
      departmentCode: "OR",
      name: "ห้องผ่าตัด",
      nameEn: "Operating Room",
      type: "SURGERY", 
      location: "ชั้น 2 อาคารผู้ป่วยใน",
      phone: "201",
      email: "or@hospital.go.th",
    },
    {
      departmentCode: "OPD",
      name: "ผู้ป่วยนอก",
      nameEn: "Out Patient Department",
      type: "OUTPATIENT",
      location: "ชั้น 1-2 อาคารผู้ป่วยนอก",
      phone: "102",
      email: "opd@hospital.go.th",
    },
    {
      departmentCode: "IPD",
      name: "ผู้ป่วยใน", 
      nameEn: "In Patient Department",
      type: "INPATIENT",
      location: "ชั้น 4-8 อาคารผู้ป่วยใน",
      phone: "401",
      email: "ipd@hospital.go.th",
    },
    {
      departmentCode: "LAB",
      name: "ห้องปฏิบัติการ",
      nameEn: "Laboratory Department",
      type: "LABORATORY",
      location: "ชั้น 2 อาคารผู้ป่วยนอก",
      phone: "202",
      email: "lab@hospital.go.th",
    },
    {
      departmentCode: "XRAY",
      name: "รังสีวิทยา",
      nameEn: "Radiology Department",
      type: "RADIOLOGY",
      location: "ชั้น 1 อาคารผู้ป่วยนอก",
      phone: "103",
      email: "xray@hospital.go.th",
    }
  ];

  const allDepartments: Record<string, any[]> = {};

  for (const hospital of hospitals) {
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
          email: template.email.replace("@hospital.go.th", `@${hospital.hospitalCode.toLowerCase()}.go.th`),
          isActive: true,
          // description field removed - not in schema
        },
      });
      hospitalDepartments.push(department);
      console.log(`  ✅ ${department.name} (${department.departmentCode})`);
    }
    allDepartments[hospital.id] = hospitalDepartments;
  }

  console.log(`✅ Successfully created ${departmentTemplates.length} departments for ${hospitals.length} hospitals`);
  return allDepartments;
}