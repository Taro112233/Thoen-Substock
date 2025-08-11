// prisma/seeds/master-data.seed.ts - Updated with Real Drug Groups
import { PrismaClient } from "@prisma/client";

export async function seedMasterData(prisma: PrismaClient, hospitals: any[], devUser: any) {
  console.log("💊 Creating Master Data for all hospitals...");

  const masterData: Record<string, any> = {};

  // ================================
  // DRUG FORMS - อัปเดตตามข้อมูลจริงจากโรงพยาบาล
  // ================================
  console.log("📋 Creating Drug Forms (Real Hospital Classifications)...");
  const drugForms = [
    { 
      formCode: "APP", 
      formName: "Applicator", 
      formNameEn: "Applicator", 
      category: "TOPICAL", 
      description: "อุปกรณ์ทายา เช่น ที่ทายาช่องคลอด",
      usageInstructions: "ใช้ตามคำแนะนำแพทย์",
      sortOrder: 1
    },
    { 
      formCode: "BAG", 
      formName: "ถุงบรรจุยา/สารน้ำ", 
      formNameEn: "Bag (ถุงบรรจุยา/สารน้ำ)", 
      category: "INJECTION", 
      description: "ถุงบรรจุสารน้ำหรือยาฉีด",
      requiresSpecialStorage: true,
      usageInstructions: "เพื่อการฉีดเข้าเส้นเลือด",
      sortOrder: 2
    },
    { 
      formCode: "CAP", 
      formName: "แคปซูล", 
      formNameEn: "Capsule", 
      category: "ORAL", 
      description: "ยาแคปซูลรับประทาน",
      usageInstructions: "กลืนทั้งเม็ด ดื่มน้ำตาม",
      commonStrengths: ["250mg", "500mg", "1000mg"],
      standardUnits: ["mg", "mcg", "IU"],
      sortOrder: 3
    },
    { 
      formCode: "CR", 
      formName: "ครีม", 
      formNameEn: "Cream", 
      category: "TOPICAL", 
      description: "ครีมทาภายนอก",
      usageInstructions: "ทาบางๆ บนผิวหนังที่ต้องการ",
      standardUnits: ["g", "%"],
      sortOrder: 4
    },
    { 
      formCode: "DOP", 
      formName: "ยาหยด", 
      formNameEn: "Drops (หยอด)", 
      category: "TOPICAL", 
      description: "ยาหยดตา หู จมูก",
      requiresSpecialStorage: true,
      usageInstructions: "หยดตามจำนวนที่แพทย์สั่ง",
      standardUnits: ["ml", "drops"],
      sortOrder: 5
    },
    { 
      formCode: "ENE", 
      formName: "ยาเหน็บ", 
      formNameEn: "Enema", 
      category: "RECTAL", 
      description: "ยาเหน็บทางทวารหนัก สำหรับล้างลำไส้",
      usageInstructions: "ใส่ทางทวารหนักตามคำแนะนำ",
      sortOrder: 6
    },
    { 
      formCode: "GEL", 
      formName: "เจล", 
      formNameEn: "Gel", 
      category: "TOPICAL", 
      description: "เจลทาภายนอก",
      usageInstructions: "ทาบางๆ และนวดเบาๆ",
      standardUnits: ["g", "%"],
      sortOrder: 7
    },
    { 
      formCode: "HAN", 
      formName: "เจลล้างมือ/เจลฆ่าเชื้อ", 
      formNameEn: "Handrub / Hand sanitizer", 
      category: "EXTERNAL", 
      description: "เจลฆ่าเชื้อทำความสะอาดมือ",
      usageInstructions: "ทาและถูมือให้ทั่ว",
      standardUnits: ["ml", "%"],
      sortOrder: 8
    },
    { 
      formCode: "IMP", 
      formName: "อิมพลานท์", 
      formNameEn: "Implant", 
      category: "INJECTION", 
      description: "ยาฝังใต้ผิวหนัง",
      requiresSpecialStorage: true,
      isControlledForm: true,
      usageInstructions: "ฝังโดยแพทย์เท่านั้น",
      sortOrder: 9
    },
    { 
      formCode: "INJ", 
      formName: "ยาฉีด", 
      formNameEn: "Injection", 
      category: "INJECTION", 
      description: "ยาฉีดเข้าหลอดเลือด กล้ามเนื้อ หรือใต้ผิวหนัง",
      requiresSpecialStorage: true,
      usageInstructions: "ฉีดโดยบุคลากรทางการแพทย์เท่านั้น",
      commonStrengths: ["1ml", "2ml", "5ml", "10ml"],
      standardUnits: ["ml", "mg/ml", "IU/ml"],
      sortOrder: 10
    },
    { 
      formCode: "LIQ", 
      formName: "ของเหลว", 
      formNameEn: "Liquid", 
      category: "ORAL", 
      description: "ยาเหลวรับประทาน",
      usageInstructions: "วัดตามปริมาณที่กำหนด",
      standardUnits: ["ml", "mg/ml"],
      sortOrder: 11
    },
    { 
      formCode: "LOT", 
      formName: "โลชั่น", 
      formNameEn: "Lotion", 
      category: "TOPICAL", 
      description: "โลชั่นทาผิว",
      usageInstructions: "ทาและกระจายให้ทั่วผิวหนัง",
      standardUnits: ["ml", "%"],
      sortOrder: 12
    },
    { 
      formCode: "LVP", 
      formName: "สารน้ำขนาดใหญ่", 
      formNameEn: "Large Volume Parenteral (สารน้ำขนาดใหญ่ เช่น IV fluid)", 
      category: "INJECTION", 
      description: "สารน้ำเพื่อการฉีดเข้าเส้นเลือดขนาดใหญ่",
      requiresSpecialStorage: true,
      usageInstructions: "ให้ทางเส้นเลือดโดยบุคลากรทางการแพทย์",
      commonStrengths: ["250ml", "500ml", "1000ml"],
      standardUnits: ["ml"],
      sortOrder: 13
    },
    { 
      formCode: "MDI", 
      formName: "ยาสูดขนาดจ่าย", 
      formNameEn: "Metered Dose Inhaler", 
      category: "INHALATION", 
      description: "ยาสูดพ่นขนาดจ่ายแน่นอน",
      requiresSpecialStorage: true,
      usageInstructions: "สูดลึกพร้อมกดพ่น",
      standardUnits: ["mcg/puff", "doses"],
      sortOrder: 14
    },
    { 
      formCode: "MIX", 
      formName: "ยาผสม", 
      formNameEn: "Mixture", 
      category: "ORAL", 
      description: "ยาผสมเหลวรับประทาน",
      usageInstructions: "เขย่าก่อนใช้ วัดตามปริมาณ",
      standardUnits: ["ml"],
      sortOrder: 15
    },
    { 
      formCode: "NAS", 
      formName: "สเปรย์จมูก/หยดจมูก", 
      formNameEn: "Nasal Spray / Nasal Drops", 
      category: "TOPICAL", 
      description: "ยาพ่นหรือหยดจมูก",
      usageInstructions: "พ่นหรือหยดในโพรงจมูก",
      standardUnits: ["ml", "mcg/spray"],
      sortOrder: 16
    },
    { 
      formCode: "NB", 
      formName: "สารละลายสำหรับเครื่องพ่นยา", 
      formNameEn: "Nebulizer Solution", 
      category: "INHALATION", 
      description: "สารละลายสำหรับใช้กับเครื่องพ่นยา",
      requiresSpecialStorage: true,
      usageInstructions: "ใช้กับเครื่องพ่นยาเท่านั้น",
      standardUnits: ["ml", "mg/ml"],
      sortOrder: 17
    },
    { 
      formCode: "OIN", 
      formName: "ยาขี้ผึ้ง", 
      formNameEn: "Ointment", 
      category: "TOPICAL", 
      description: "ยาขี้ผึ้งทาภายนอก",
      usageInstructions: "ทาบางๆ และนวดเบาๆ",
      standardUnits: ["g", "%"],
      sortOrder: 18
    },
    { 
      formCode: "PAT", 
      formName: "แผ่นแปะ", 
      formNameEn: "Patch", 
      category: "TOPICAL", 
      description: "แผ่นแปะยาติดผิวหนัง",
      requiresSpecialStorage: true,
      usageInstructions: "แปะบนผิวหนังที่สะอาดและแห้ง",
      standardUnits: ["mg/patch", "mcg/h"],
      sortOrder: 19
    },
    { 
      formCode: "POW", 
      formName: "ผง", 
      formNameEn: "Powder", 
      category: "TOPICAL", 
      description: "ยาผงสำหรับโรยหรือผสม",
      usageInstructions: "โรยหรือผสมตามคำแนะนำ",
      standardUnits: ["g", "mg"],
      sortOrder: 20
    },
    { 
      formCode: "PWD", 
      formName: "ผงสำหรับฉีด/ผสม", 
      formNameEn: "Powder for Injection/Reconstitution", 
      category: "INJECTION", 
      description: "ยาผงที่ต้องผสมก่อนฉีด",
      requiresSpecialStorage: true,
      usageInstructions: "ผสมกับสารละลายก่อนฉีด",
      standardUnits: ["mg", "IU", "ml after reconstitution"],
      sortOrder: 21
    },
    { 
      formCode: "SAC", 
      formName: "ซอง", 
      formNameEn: "Sachet", 
      category: "ORAL", 
      description: "ยาบรรจุซอง",
      usageInstructions: "เปิดซองและรับประทาน",
      standardUnits: ["g", "mg"],
      sortOrder: 22
    },
    { 
      formCode: "SOL", 
      formName: "สารละลาย", 
      formNameEn: "Solution", 
      category: "MULTIPLE", 
      description: "สารละลายสำหรับใช้หลายวิธี",
      usageInstructions: "ใช้ตามวิธีที่กำหนด",
      standardUnits: ["ml", "mg/ml", "%"],
      sortOrder: 23
    },
    { 
      formCode: "SPR", 
      formName: "สเปรย์", 
      formNameEn: "Spray", 
      category: "TOPICAL", 
      description: "ยาสเปรย์พ่น",
      usageInstructions: "พ่นให้ทั่วบริเวณที่ต้องการ",
      standardUnits: ["ml", "mg/spray"],
      sortOrder: 24
    },
    { 
      formCode: "SUP", 
      formName: "ยาเหน็บ", 
      formNameEn: "Suppository", 
      category: "RECTAL", 
      description: "ยาเหน็บทางทวารหนักหรือช่องคลอด",
      requiresSpecialStorage: true,
      usageInstructions: "ใส่ทางทวารหนักหรือช่องคลอด",
      standardUnits: ["mg", "g"],
      sortOrder: 25
    },
    { 
      formCode: "SUS", 
      formName: "สารแขวนตะกอน", 
      formNameEn: "Suspension", 
      category: "ORAL", 
      description: "ยาสารแขวนตะกอนรับประทาน",
      usageInstructions: "เขย่าให้เข้ากันก่อนใช้",
      standardUnits: ["ml", "mg/ml"],
      sortOrder: 26
    },
    { 
      formCode: "SYR", 
      formName: "น้ำเชื่อม", 
      formNameEn: "Syrup", 
      category: "ORAL", 
      description: "ยาน้ำเชื่อมรับประทาน",
      usageInstructions: "วัดตามปริมาณที่กำหนด",
      standardUnits: ["ml", "mg/ml"],
      sortOrder: 27
    },
    { 
      formCode: "TAB", 
      formName: "เม็ด", 
      formNameEn: "Tablet", 
      category: "ORAL", 
      description: "ยาเม็ดรับประทาน",
      usageInstructions: "กลืนกับน้ำ หรือเคี้ยวตามคำแนะนำ",
      commonStrengths: ["25mg", "50mg", "100mg", "250mg", "500mg"],
      standardUnits: ["mg", "mcg", "IU"],
      sortOrder: 28
    },
    { 
      formCode: "TUR", 
      formName: "เทอร์บูเฮเลอร์", 
      formNameEn: "Turbuhaler", 
      category: "INHALATION", 
      description: "ยาสูดแบบผงแห้ง",
      requiresSpecialStorage: true,
      usageInstructions: "สูดอย่างแรงและลึก",
      standardUnits: ["mcg/dose", "doses"],
      sortOrder: 29
    }
  ];

  for (const hospital of hospitals) {
    for (const form of drugForms) {
      await prisma.drugForm.upsert({
        where: {
          hospitalId_formCode: {
            hospitalId: hospital.id,
            formCode: form.formCode
          }
        },
        update: {},
        create: {
          ...form,
          hospitalId: hospital.id,
          isSystemDefault: true,
          createdBy: devUser.id
        }
      });
    }
  }
  masterData.drugForms = drugForms;
  console.log(`✅ Created ${drugForms.length} drug forms for ${hospitals.length} hospitals`);

  // ================================
  // DRUG GROUPS - อัปเดตตามข้อมูลจริงจากโรงพยาบาล
  // ================================
  console.log("🧬 Creating Drug Groups (Real Hospital Classifications)...");
  const drugGroups = [
    { 
      groupCode: "01", 
      groupName: "Antidotes", 
      groupNameTh: "ยาแก้พิษ", 
      description: "ยาแก้พิษและสารต้านพิษ",
      therapeuticClass: "EMERGENCY",
      riskLevel: "HIGH",
      sortOrder: 1
    },
    { 
      groupCode: "02", 
      groupName: "Anti-Infectives", 
      groupNameTh: "ยาต้านการติดเชื้อ", 
      description: "ยาปฏิชีวนะและยาต้านการติดเชื้อ",
      therapeuticClass: "ANTIMICROBIAL",
      riskLevel: "MEDIUM",
      sortOrder: 2
    },
    { 
      groupCode: "03", 
      groupName: "Antineoplastic & Immunosuppressive Drugs", 
      groupNameTh: "ยาต้านมะเร็งและยากดภูมิคุ้มกัน", 
      description: "ยาเคมีบำบัดและยากดภูมิคุ้มกัน",
      therapeuticClass: "ONCOLOGY",
      riskLevel: "CRITICAL",
      requiresMonitoring: true,
      hasInteractions: true,
      sortOrder: 3
    },
    { 
      groupCode: "04", 
      groupName: "Antiseptics & Disinfectants", 
      groupNameTh: "ยาฆ่าเชื้อและน้ำยาฆ่าเชื้อ", 
      description: "สารฆ่าเชื้อโรคและน้ำยาฆ่าเชื้อ",
      therapeuticClass: "EXTERNAL",
      riskLevel: "LOW",
      sortOrder: 4
    },
    { 
      groupCode: "06", 
      groupName: "Cardiovascular Drugs", 
      groupNameTh: "ยาหัวใจและหลอดเลือด", 
      description: "ยารักษาโรคหัวใจและหลอดเลือด",
      therapeuticClass: "CARDIOVASCULAR",
      riskLevel: "HIGH",
      requiresMonitoring: true,
      hasInteractions: true,
      sortOrder: 6
    },
    { 
      groupCode: "07", 
      groupName: "Drugs Acting On Central Nervous System", 
      groupNameTh: "ยาที่มีผลต่อระบบประสาทกลาง", 
      description: "ยาระบบประสาทกลาง ยาแก้ปวด ยาชา",
      therapeuticClass: "NEUROLOGICAL",
      riskLevel: "HIGH",
      requiresMonitoring: true,
      hasInteractions: true,
      sortOrder: 7
    },
    { 
      groupCode: "08", 
      groupName: "Dental & Oral Preparations", 
      groupNameTh: "เภสัชภัณฑ์ทางทันตกรรมและช่องปาก", 
      description: "ยาและผลิตภัณฑ์สำหรับทันตกรรม",
      therapeuticClass: "DENTAL",
      riskLevel: "LOW",
      sortOrder: 8
    },
    { 
      groupCode: "09", 
      groupName: "Dermatologic Drugs", 
      groupNameTh: "ยาทางผิวหนัง", 
      description: "ยารักษาโรคผิวหนัง",
      therapeuticClass: "DERMATOLOGICAL",
      riskLevel: "LOW",
      sortOrder: 9
    },
    { 
      groupCode: "11", 
      groupName: "Endocrinologic Drugs", 
      groupNameTh: "ยาต่อมไร้ท่อ", 
      description: "ยาฮอร์โมนและต่อมไร้ท่อ",
      therapeuticClass: "ENDOCRINE",
      riskLevel: "HIGH",
      requiresMonitoring: true,
      sortOrder: 11
    },
    { 
      groupCode: "12", 
      groupName: "EENT Preparations", 
      groupNameTh: "เภสัชภัณฑ์ตา หู คอ จมูก", 
      description: "ยาสำหรับตา หู คอ จมูก",
      therapeuticClass: "EENT",
      riskLevel: "MEDIUM",
      sortOrder: 12
    },
    { 
      groupCode: "13", 
      groupName: "Gastro-Intestinal Drugs", 
      groupNameTh: "ยาทางเดินอาหาร", 
      description: "ยารักษาโรคทางเดินอาหาร",
      therapeuticClass: "GASTROINTESTINAL",
      riskLevel: "MEDIUM",
      sortOrder: 13
    },
    { 
      groupCode: "14", 
      groupName: "Genito-urinary & Sex Hormones", 
      groupNameTh: "ยาระบบสืบพันธุ์และฮอร์โมน", 
      description: "ยาระบบสืบพันธุ์และฮอร์โมนเพศ",
      therapeuticClass: "REPRODUCTIVE",
      riskLevel: "MEDIUM",
      requiresMonitoring: true,
      sortOrder: 14
    },
    { 
      groupCode: "15", 
      groupName: "Immunological Preparations", 
      groupNameTh: "เภสัชภัณฑ์เสริมภูมิคุ้มกัน", 
      description: "วัคซีนและเซรุ่ม",
      therapeuticClass: "IMMUNOLOGICAL",
      riskLevel: "HIGH",
      requiresMonitoring: true,
      sortOrder: 15
    },
    { 
      groupCode: "16", 
      groupName: "Local Anaesthetics", 
      groupNameTh: "ยาชาเฉพาะที่", 
      description: "ยาชาเฉพาะที่",
      therapeuticClass: "ANAESTHETIC",
      riskLevel: "MEDIUM",
      sortOrder: 16
    },
    { 
      groupCode: "17", 
      groupName: "Musculoskeletal System Drugs", 
      groupNameTh: "ยาระบบกล้ามเนื้อและกระดูก", 
      description: "ยารักษาโรคกล้ามเนื้อและกระดูก",
      therapeuticClass: "MUSCULOSKELETAL",
      riskLevel: "MEDIUM",
      sortOrder: 17
    },
    { 
      groupCode: "20", 
      groupName: "Drugs Acting on Respiratory System", 
      groupNameTh: "ยาที่มีผลต่อระบบหายใจ", 
      description: "ยารักษาโรคทางเดินหายใจ",
      therapeuticClass: "RESPIRATORY",
      riskLevel: "MEDIUM",
      sortOrder: 20
    },
    { 
      groupCode: "21", 
      groupName: "Solutions & Electrolytes", 
      groupNameTh: "สารละลายและอิเล็กโทรไลต์", 
      description: "น้ำเกลือและสารละลายทางการแพทย์",
      therapeuticClass: "FLUID_ELECTROLYTE",
      riskLevel: "MEDIUM",
      hasInteractions: true,
      sortOrder: 21
    },
    { 
      groupCode: "22", 
      groupName: "Nutritional & Therapeutic Supplements", 
      groupNameTh: "อาหารเสริมและสารอาหาร", 
      description: "วิตามินและสารอาหารเสริม",
      therapeuticClass: "NUTRITIONAL",
      riskLevel: "LOW",
      sortOrder: 22
    },
    { 
      groupCode: "23", 
      groupName: "Miscellaneous", 
      groupNameTh: "อื่นๆ", 
      description: "ยาและเภสัชภัณฑ์อื่นๆ",
      therapeuticClass: "MISCELLANEOUS",
      riskLevel: "LOW",
      sortOrder: 23
    },
    { 
      groupCode: "24", 
      groupName: "Anthelmintics", 
      groupNameTh: "ยาถ่ายพยาธิ", 
      description: "ยากำจัดพยาธิและปรสิต",
      therapeuticClass: "ANTIPARASITIC",
      riskLevel: "MEDIUM",
      sortOrder: 24
    },
    { 
      groupCode: "25", 
      groupName: "Antidepressants", 
      groupNameTh: "ยาต้านอาการซึมเศร้า", 
      description: "ยารักษาโรคซึมเศร้า",
      therapeuticClass: "PSYCHIATRIC",
      riskLevel: "HIGH",
      requiresMonitoring: true,
      hasInteractions: true,
      sortOrder: 25
    },
    { 
      groupCode: "26", 
      groupName: "Antifungals", 
      groupNameTh: "ยาต้านเชื้อรา", 
      description: "ยาฆ่าเชื้อราและรักษาโรคเชื้อรา",
      therapeuticClass: "ANTIFUNGAL",
      riskLevel: "MEDIUM",
      sortOrder: 26
    },
    { 
      groupCode: "27", 
      groupName: "Antimalarials", 
      groupNameTh: "ยาป้องกันและรักษาไข้จับสั่น", 
      description: "ยารักษาและป้องกันมาลาเรีย",
      therapeuticClass: "ANTIMALARIAL",
      riskLevel: "MEDIUM",
      sortOrder: 27
    },
    { 
      groupCode: "28", 
      groupName: "Antiprotozoals", 
      groupNameTh: "ยาต้านโปรโตซัว", 
      description: "ยากำจัดเชื้อโปรโตซัว",
      therapeuticClass: "ANTIPROTOZOAL",
      riskLevel: "MEDIUM",
      sortOrder: 28
    },
    { 
      groupCode: "29", 
      groupName: "Herbal Medicines", 
      groupNameTh: "ยาสมุนไพร", 
      description: "ยาสมุนไพรและผลิตภัณฑ์ธรรมชาติ",
      therapeuticClass: "HERBAL",
      riskLevel: "LOW",
      sortOrder: 29
    },
    { 
      groupCode: "30", 
      groupName: "Antiepileptics", 
      groupNameTh: "ยาต้านลมชัก", 
      description: "ยารักษาโรคลมชักและโรคทางประสาท",
      therapeuticClass: "ANTIEPILEPTIC",
      riskLevel: "HIGH",
      requiresMonitoring: true,
      hasInteractions: true,
      sortOrder: 30
    },
    { 
      groupCode: "31", 
      groupName: "Antituberculous", 
      groupNameTh: "ยาต้านวัณโรค", 
      description: "ยารักษาวัณโรค",
      therapeuticClass: "ANTITUBERCULOUS",
      riskLevel: "HIGH",
      requiresMonitoring: true,
      hasInteractions: true,
      sortOrder: 31
    },
    { 
      groupCode: "32", 
      groupName: "Antivirals", 
      groupNameTh: "ยาต้านไวรัส", 
      description: "ยารักษาโรคไวรัส",
      therapeuticClass: "ANTIVIRAL",
      riskLevel: "MEDIUM",
      hasInteractions: true,
      sortOrder: 32
    },
    { 
      groupCode: "33", 
      groupName: "DMARDs", 
      groupNameTh: "ยาแก้รอยรอยรูมาติก", 
      description: "ยาต้านรูมาติกที่ปรับเปลี่ยนการดำเนินโรค",
      therapeuticClass: "ANTIRHEUMATIC",
      riskLevel: "HIGH",
      requiresMonitoring: true,
      hasInteractions: true,
      sortOrder: 33
    },
    { 
      groupCode: "35", 
      groupName: "Vasodilators", 
      groupNameTh: "ยาขยายหลอดเลือด", 
      description: "ยาขยายหลอดเลือด",
      therapeuticClass: "VASODILATOR",
      riskLevel: "HIGH",
      hasInteractions: true,
      sortOrder: 35
    },
    { 
      groupCode: "36", 
      groupName: "Hypothalamic & Pituitary Hormones", 
      groupNameTh: "ฮอร์โมนไฮโปธาลามัสและต่อมใต้สมอง", 
      description: "ฮอร์โมนจากต่อมใต้สมองและไฮโปธาลามัส",
      therapeuticClass: "PITUITARY_HORMONE",
      riskLevel: "HIGH",
      requiresMonitoring: true,
      sortOrder: 36
    }
  ];

  for (const hospital of hospitals) {
    for (const group of drugGroups) {
      await prisma.drugGroup.upsert({
        where: {
          hospitalId_groupCode: {
            hospitalId: hospital.id,
            groupCode: group.groupCode
          }
        },
        update: {},
        create: {
          ...group,
          hospitalId: hospital.id,
          isSystemDefault: true,
          createdBy: devUser.id
        }
      });
    }
  }
  masterData.drugGroups = drugGroups;
  console.log(`✅ Created ${drugGroups.length} drug groups for ${hospitals.length} hospitals`);

  // ================================
  // DRUG TYPES
  // ================================
  console.log("🏷️ Creating Drug Types...");
  const drugTypes = [
    { 
      typeCode: "GENERIC", 
      typeName: "ยาชื่อสามัญ", 
      typeNameTh: "ยาชื่อสามัญ",
      description: "ยาชื่อสามัญ ราคาถูก",
      color: "#10B981",
      iconName: "pill"
    },
    { 
      typeCode: "BRAND", 
      typeName: "ยาต้นตำรับ", 
      typeNameTh: "ยาต้นตำรับ", 
      description: "ยาต้นตำรับของบริษัทยา",
      color: "#3B82F6",
      iconName: "brand"
    },
    { 
      typeCode: "BIOSIMILAR", 
      typeName: "ยาชีวภาพคล้าย", 
      typeNameTh: "ยาชีวภาพคล้าย", 
      description: "ยาชีวภาพที่คล้ายกับยาต้นตำรับ",
      color: "#8B5CF6",
      iconName: "dna"
    },
    { 
      typeCode: "CONTROLLED", 
      typeName: "ยาควบคุม", 
      typeNameTh: "ยาควบคุม", 
      description: "ยาที่ต้องควบคุมการใช้",
      isControlled: true,
      requiresApproval: true,
      auditRequired: true,
      color: "#F59E0B",
      iconName: "lock"
    },
    { 
      typeCode: "NARCOTIC", 
      typeName: "ยาเสพติด", 
      typeNameTh: "ยาเสพติด", 
      description: "ยาเสพติดให้โทษ",
      isNarcotic: true,
      isControlled: true,
      requiresWitness: true,
      requiresDoubleLock: true,
      auditRequired: true,
      reportingRequired: true,
      color: "#DC2626",
      iconName: "shield-alert"
    },
    { 
      typeCode: "PSYCHOTROPIC", 
      typeName: "ยาจิตเวช", 
      typeNameTh: "ยาจิตเวช", 
      description: "ยาจิตเวชที่ต้องควบคุม",
      isPsychotropic: true,
      isControlled: true,
      requiresApproval: true,
      color: "#7C3AED",
      iconName: "brain"
    },
    { 
      typeCode: "HIGH_ALERT", 
      typeName: "ยาเสี่ยงสูง", 
      typeNameTh: "ยาเสี่ยงสูง", 
      description: "ยาที่มีความเสี่ยงสูงต่อผู้ป่วย",
      isHighAlert: true,
      requiresWitness: true,
      auditRequired: true,
      color: "#EF4444",
      iconName: "alert-triangle"
    },
    { 
      typeCode: "REFRIGERATED", 
      typeName: "ยาเก็บเย็น", 
      typeNameTh: "ยาเก็บเย็น", 
      description: "ยาที่ต้องเก็บในตู้เย็น",
      color: "#06B6D4",
      iconName: "snowflake"
    },
    { 
      typeCode: "CHEMOTHERAPY", 
      typeName: "ยาเคมีบำบัด", 
      typeNameTh: "ยาเคมีบำบัด", 
      description: "ยาเคมีบำบัดมะเร็ง",
      isDangerous: true,
      requiresWitness: true,
      requiresApproval: true,
      auditRequired: true,
      color: "#EC4899",
      iconName: "zap"
    },
    { 
      typeCode: "HERBAL", 
      typeName: "ยาสมุนไพร", 
      typeNameTh: "ยาสมุนไพร", 
      description: "ยาสมุนไพรและผลิตภัณฑ์ธรรมชาติ",
      color: "#22C55E",
      iconName: "leaf"
    }
  ];

  for (const hospital of hospitals) {
    for (const type of drugTypes) {
      await prisma.drugType.upsert({
        where: {
          hospitalId_typeCode: {
            hospitalId: hospital.id,
            typeCode: type.typeCode
          }
        },
        update: {},
        create: {
          ...type,
          hospitalId: hospital.id,
          isSystemDefault: true,
          createdBy: devUser.id
        }
      });
    }
  }
  masterData.drugTypes = drugTypes;
  console.log(`✅ Created ${drugTypes.length} drug types for ${hospitals.length} hospitals`);

  // ================================
  // DRUG STORAGE CONDITIONS
  // ================================
  console.log("🌡️ Creating Drug Storage Conditions...");
  const drugStorages = [
    { 
      storageCode: "ROOM_TEMP", 
      storageName: "อุณหภูมิห้อง", 
      storageNameTh: "อุณหภูมิห้อง",
      temperatureMin: 15.0,
      temperatureMax: 30.0,
      humidityMin: 45.0,
      humidityMax: 75.0,
      storageInstructions: "ป้องกันแสง ความร้อน และความชื้น - เก็บที่อุณหภูมิห้อง 15-30°C ความชื้น 45-75%",
      protectFromLight: true,
      protectFromMoisture: true
    },
    { 
      storageCode: "REFRIGERATED", 
      storageName: "เก็บเย็น", 
      storageNameTh: "เก็บเย็น",
      temperatureMin: 2.0,
      temperatureMax: 8.0,
      humidityMin: 45.0,
      humidityMax: 75.0,
      storageInstructions: "ห้ามแช่แข็ง ป้องกันแสง - เก็บในตู้เย็น 2-8°C",
      requiresRefrigeration: true,
      protectFromLight: true
    },
    { 
      storageCode: "FROZEN", 
      storageName: "แช่แข็ง", 
      storageNameTh: "แช่แข็ง",
      temperatureMin: -25.0,
      temperatureMax: -15.0,
      storageInstructions: "แช่แข็งตลอดเวลา ห้ามให้ละลาย - เก็บในตู้แช่แข็ง -25 ถึง -15°C",
      requiresFreezing: true
    },
    { 
      storageCode: "CONTROLLED_ROOM", 
      storageName: "ห้องควบคุม", 
      storageNameTh: "ห้องควบคุม",
      temperatureMin: 20.0,
      temperatureMax: 25.0,
      humidityMin: 45.0,
      humidityMax: 65.0,
      storageInstructions: "ควบคุมอุณหภูมิและความชื้นอย่างเข้มงวด - ห้องควบคุมอุณหภูมิ 20-25°C ความชื้น 45-65%",
      monitoringRequired: true
    },
    { 
      storageCode: "DRY_PLACE", 
      storageName: "ที่แห้ง", 
      storageNameTh: "ที่แห้ง",
      temperatureMin: 15.0,
      temperatureMax: 30.0,
      humidityMax: 60.0,
      storageInstructions: "ป้องกันความชื้นเป็นพิเศษ - เก็บในที่แห้ง ความชื้นไม่เกิน 60%",
      protectFromMoisture: true
    },
    { 
      storageCode: "DARK_PLACE", 
      storageName: "ที่มืด", 
      storageNameTh: "ที่มืด",
      temperatureMin: 15.0,
      temperatureMax: 30.0,
      storageInstructions: "ป้องกันแสงแดดและแสงสว่าง - เก็บในที่มืด ป้องกันแสง",
      protectFromLight: true
    }
  ];

  for (const hospital of hospitals) {
    for (const storage of drugStorages) {
      await prisma.drugStorage.upsert({
        where: {
          hospitalId_storageCode: {
            hospitalId: hospital.id,
            storageCode: storage.storageCode
          }
        },
        update: {},
        create: {
          ...storage,
          hospitalId: hospital.id,
          isSystemDefault: true,
          createdBy: devUser.id
        }
      });
    }
  }
  masterData.drugStorages = drugStorages;
  console.log(`✅ Created ${drugStorages.length} storage conditions for ${hospitals.length} hospitals`);

  console.log(`✅ Successfully created all master data for ${hospitals.length} hospitals`);
  console.log(`📊 Master Data Summary:`);
  console.log(`  - Drug Forms: ${drugForms.length}`);
  console.log(`  - Drug Groups: ${drugGroups.length} (Real Hospital Classifications)`);
  console.log(`  - Drug Types: ${drugTypes.length}`);
  console.log(`  - Storage Conditions: ${drugStorages.length}`);
  console.log(`🎯 Drug Groups now follow standard hospital therapeutic classifications`);

  return masterData;
}