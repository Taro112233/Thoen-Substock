// app/api/admin/personnel-types/import/route.ts
// Personnel Types API - Import & Template Features
// API สำหรับนำเข้าข้อมูลและจัดการเทมเพลตประเภทบุคลากร

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// ================================
// VALIDATION SCHEMAS
// ================================

const ImportModeSchema = z.enum(['validate', 'import', 'template'], {
  message: 'โหมดการดำเนินการไม่ถูกต้อง'
});

const ImportOptionsSchema = z.object({
  mode: ImportModeSchema,
  hospitalId: z.string().uuid().optional(),
  updateExisting: z.boolean().default(false),
  skipInvalid: z.boolean().default(false),
  validateOnly: z.boolean().default(false)
});

const PersonnelTypeImportSchema = z.object({
  typeCode: z.string()
    .min(2, 'รหัสประเภทต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(20, 'รหัสประเภทต้องไม่เกิน 20 ตัวอักษร')
    .regex(/^[A-Z0-9_]+$/, 'รหัสประเภทต้องใช้ตัวพิมพ์ใหญ่, ตัวเลข และ _ เท่านั้น'),
  typeName: z.string()
    .min(1, 'ชื่อประเภทบุคลากรจำเป็นต้องระบุ')
    .max(100, 'ชื่อประเภทบุคลากรต้องไม่เกิน 100 ตัวอักษร'),
  typeNameEn: z.string().max(100).optional().nullable().transform(val => val || null),
  hierarchy: z.enum(['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD', 'STAFF', 'STUDENT'], {
    message: 'ระดับลำดับชั้นไม่ถูกต้อง'
  }),
  levelOrder: z.number()
    .int('ลำดับระดับต้องเป็นจำนวนเต็ม')
    .min(1, 'ลำดับระดับต้องมากกว่าหรือเท่ากับ 1')
    .max(100, 'ลำดับระดับต้องไม่เกิน 100'),
  description: z.string().max(500).optional().nullable().transform(val => val || null),
  
  // สิทธิ์และความสามารถ (แปลงจาก string เป็น boolean)
  canManageHospitals: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? ['true', 'ได้', 'yes', '1'].includes(val.toLowerCase()) : val
  ).default(false),
  canManageWarehouses: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? ['true', 'ได้', 'yes', '1'].includes(val.toLowerCase()) : val
  ).default(false),
  canManageDepartments: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? ['true', 'ได้', 'yes', '1'].includes(val.toLowerCase()) : val
  ).default(false),
  canManagePersonnel: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? ['true', 'ได้', 'yes', '1'].includes(val.toLowerCase()) : val
  ).default(false),
  canManageDrugs: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? ['true', 'ได้', 'yes', '1'].includes(val.toLowerCase()) : val
  ).default(false),
  canManageMasterData: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? ['true', 'ได้', 'yes', '1'].includes(val.toLowerCase()) : val
  ).default(false),
  canViewReports: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? ['true', 'ได้', 'yes', '1'].includes(val.toLowerCase()) : val
  ).default(true),
  canApproveUsers: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? ['true', 'ได้', 'yes', '1'].includes(val.toLowerCase()) : val
  ).default(false),
  
  // การตั้งค่าเพิ่มเติม
  maxSubordinates: z.union([z.number(), z.string(), z.null()])
    .transform(val => {
      if (val === null || val === '' || val === undefined) return null;
      const num = typeof val === 'string' ? parseInt(val) : val;
      return isNaN(num) ? null : num;
    })
    .refine(val => val === null || (val >= 0 && val <= 1000), 'จำนวนลูกน้องสูงสุดต้องอยู่ระหว่าง 0-1000')
    .optional()
    .nullable(),
  defaultDepartmentType: z.string().max(50).optional().nullable().transform(val => val || null),
  responsibilities: z.union([z.array(z.string()), z.string()])
    .transform(val => {
      if (typeof val === 'string') {
        return val.split(',').map(r => r.trim()).filter(r => r.length > 0);
      }
      return val || [];
    })
    .optional()
    .nullable(),
  isActive: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? ['true', 'ใช้งาน', 'active', '1'].includes(val.toLowerCase()) : val
  ).default(true)
});

// ================================
// HELPER FUNCTIONS
// ================================

function generateTemplate(role: string): any[] {
  const baseTemplates = [
    {
      typeCode: 'DIR',
      typeName: 'ผู้อำนวยการ',
      typeNameEn: 'Director',
      hierarchy: 'DIRECTOR',
      levelOrder: 10,
      description: 'ผู้บริหารระดับสูงของโรงพยาบาล',
      canManageHospitals: false,
      canManageWarehouses: true,
      canManageDepartments: true,
      canManagePersonnel: true,
      canManageDrugs: false,
      canManageMasterData: true,
      canViewReports: true,
      canApproveUsers: true,
      maxSubordinates: 50,
      defaultDepartmentType: 'ADMINISTRATION',
      responsibilities: ['บริหารโรงพยาบาล', 'อนุมัติงบประมาณ', 'กำหนดนโยบาย'],
      isActive: true
    },
    {
      typeCode: 'GRP_HEAD',
      typeName: 'หัวหน้ากลุ่มงาน',
      typeNameEn: 'Group Head',
      hierarchy: 'GROUP_HEAD',
      levelOrder: 20,
      description: 'หัวหน้ากลุ่มงานในแต่ละสายงาน',
      canManageHospitals: false,
      canManageWarehouses: true,
      canManageDepartments: true,
      canManagePersonnel: false,
      canManageDrugs: true,
      canManageMasterData: false,
      canViewReports: true,
      canApproveUsers: false,
      maxSubordinates: 20,
      defaultDepartmentType: null,
      responsibilities: ['บริหารกลุ่มงาน', 'ควบคุมคุณภาพ', 'พัฒนาบุคลากร'],
      isActive: true
    },
    {
      typeCode: 'STAFF',
      typeName: 'พนักงาน',
      typeNameEn: 'Staff',
      hierarchy: 'STAFF',
      levelOrder: 30,
      description: 'พนักงานระดับปฏิบัติการ',
      canManageHospitals: false,
      canManageWarehouses: false,
      canManageDepartments: false,
      canManagePersonnel: false,
      canManageDrugs: false,
      canManageMasterData: false,
      canViewReports: true,
      canApproveUsers: false,
      maxSubordinates: 5,
      defaultDepartmentType: null,
      responsibilities: ['ปฏิบัติงานตามหน้าที่', 'รายงานผลการทำงาน'],
      isActive: true
    },
    {
      typeCode: 'STU',
      typeName: 'นักศึกษา',
      typeNameEn: 'Student',
      hierarchy: 'STUDENT',
      levelOrder: 40,
      description: 'นักศึกษาฝึกงานและนักศึกษาแพทย์',
      canManageHospitals: false,
      canManageWarehouses: false,
      canManageDepartments: false,
      canManagePersonnel: false,
      canManageDrugs: false,
      canManageMasterData: false,
      canViewReports: false,
      canApproveUsers: false,
      maxSubordinates: 0,
      defaultDepartmentType: null,
      responsibilities: ['เรียนรู้และฝึกปฏิบัติ', 'ปฏิบัติตามกฎระเบียบ'],
      isActive: true
    }
  ];

  // DEVELOPER สามารถดูทุกเทมเพลต
  if (role === 'DEVELOPER') {
    return [
      {
        typeCode: 'DEV',
        typeName: 'นักพัฒนา',
        typeNameEn: 'Developer',
        hierarchy: 'DEVELOPER',
        levelOrder: 1,
        description: 'นักพัฒนาระบบและผู้ดูแลระบบระดับสูงสุด',
        canManageHospitals: true,
        canManageWarehouses: true,
        canManageDepartments: true,
        canManagePersonnel: true,
        canManageDrugs: true,
        canManageMasterData: true,
        canViewReports: true,
        canApproveUsers: true,
        maxSubordinates: null,
        defaultDepartmentType: 'ADMINISTRATION',
        responsibilities: ['พัฒนาระบบ', 'ดูแลระบบ', 'จัดการข้อมูลหลัก', 'แก้ไขปัญหาเทคนิค'],
        isActive: true
      },
      ...baseTemplates
    ];
  }

  // DIRECTOR ดูได้เฉพาะระดับที่ต่ำกว่า
  return baseTemplates;
}

async function validateImportData(
  data: any[],
  hospitalId: string,
  userRole: string,
  updateExisting: boolean
): Promise<{
  valid: any[];
  invalid: any[];
  warnings: any[];
  duplicates: any[];
}> {
  const valid = [];
  const invalid = [];
  const warnings = [];
  const duplicates = [];

  // ตรวจสอบ typeCode ที่มีอยู่แล้วในฐานข้อมูล
  const existingTypes = await prisma.personnelType.findMany({
    where: { hospitalId },
    select: { typeCode: true, typeName: true, id: true }
  });

  const existingCodes = new Set(existingTypes.map(t => t.typeCode));
  const importCodes = new Set();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowIndex = i + 1;

    try {
      // Validate individual row
      const validatedRow = PersonnelTypeImportSchema.parse(row);

      // ตรวจสอบสิทธิ์ hierarchy
      if (userRole === 'DIRECTOR' && ['DEVELOPER', 'DIRECTOR'].includes(validatedRow.hierarchy)) {
        invalid.push({
          row: rowIndex,
          data: row,
          errors: ['ไม่มีสิทธิ์สร้างประเภทบุคลากรในระดับนี้']
        });
        continue;
      }

      // ตรวจสอบ typeCode ซ้ำในไฟล์
      if (importCodes.has(validatedRow.typeCode)) {
        duplicates.push({
          row: rowIndex,
          typeCode: validatedRow.typeCode,
          typeName: validatedRow.typeName,
          reason: 'รหัสประเภทซ้ำในไฟล์ที่นำเข้า'
        });
        continue;
      }

      importCodes.add(validatedRow.typeCode);

      // ตรวจสอบ typeCode ซ้ำในฐานข้อมูล
      if (existingCodes.has(validatedRow.typeCode)) {
        if (updateExisting) {
          warnings.push({
            row: rowIndex,
            typeCode: validatedRow.typeCode,
            typeName: validatedRow.typeName,
            message: 'จะอัพเดทข้อมูลที่มีอยู่แล้ว'
          });
        } else {
          duplicates.push({
            row: rowIndex,
            typeCode: validatedRow.typeCode,
            typeName: validatedRow.typeName,
            reason: 'รหัสประเภทมีอยู่แล้วในระบบ'
          });
          continue;
        }
      }

      valid.push({
        row: rowIndex,
        data: { ...validatedRow, hospitalId }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        invalid.push({
          row: rowIndex,
          data: row,
          errors: error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
        });
      } else {
        invalid.push({
          row: rowIndex,
          data: row,
          errors: ['ข้อผิดพลาดที่ไม่ทราบสาเหตุ']
        });
      }
    }
  }

  return { valid, invalid, warnings, duplicates };
}

async function performImport(
  validData: any[],
  updateExisting: boolean,
  userId: string
): Promise<{
  created: any[];
  updated: any[];
  errors: any[];
}> {
  const created = [];
  const updated = [];
  const errors = [];

  for (const item of validData) {
    try {
      const { row, data } = item;

      // ตรวจสอบว่ามีอยู่แล้วหรือไม่
      const existing = await prisma.personnelType.findFirst({
        where: {
          hospitalId: data.hospitalId,
          typeCode: data.typeCode
        }
      });

      if (existing && updateExisting) {
        // อัพเดทข้อมูลที่มีอยู่
        const updated_type = await prisma.personnelType.update({
          where: { id: existing.id },
          data: {
            ...data,
            createdBy: existing.createdBy, // เก็บผู้สร้างเดิม
            responsibilities: data.responsibilities || []
          },
          include: {
            hospital: {
              select: { name: true, hospitalCode: true }
            }
          }
        });

        updated.push({
          row,
          id: updated_type.id,
          typeCode: updated_type.typeCode,
          typeName: updated_type.typeName,
          action: 'updated'
        });

      } else if (!existing) {
        // สร้างใหม่
        const new_type = await prisma.personnelType.create({
          data: {
            ...data,
            createdBy: userId,
            responsibilities: data.responsibilities || []
          },
          include: {
            hospital: {
              select: { name: true, hospitalCode: true }
            }
          }
        });

        created.push({
          row,
          id: new_type.id,
          typeCode: new_type.typeCode,
          typeName: new_type.typeName,
          action: 'created'
        });
      }

    } catch (error: unknown) {
      errors.push({
        row: item.row,
        typeCode: item.data.typeCode,
        typeName: item.data.typeName,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      });
    }
  }

  return { created, updated, errors };
}

// ================================
// GET HANDLER - Template Download
// ================================
export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบสิทธิ์
    if (!['DEVELOPER', 'DIRECTOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ดาวน์โหลดเทมเพลต' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'template';

    if (mode === 'template') {
      // สร้างเทมเพลต
      const templates = generateTemplate(session.user.role);

      return NextResponse.json({
        success: true,
        message: 'ดาวน์โหลดเทมเพลตเรียบร้อยแล้ว',
        data: {
          templates,
          instructions: {
            th: [
              '1. กรอกข้อมูลตามคอลัมน์ที่กำหนด',
              '2. รหัสประเภท (typeCode) ต้องไม่ซ้ำและใช้ตัวพิมพ์ใหญ่',
              '3. ระดับลำดับชั้น (hierarchy) ต้องเป็น: DEVELOPER, DIRECTOR, GROUP_HEAD, STAFF, STUDENT',
              '4. สิทธิ์ต่างๆ ใส่ "true/false" หรือ "ได้/ไม่ได้"',
              '5. หน้าที่ความรับผิดชอบคั่นด้วยเครื่องหมายจุลภาค (,)',
              '6. ลำดับระดับ (levelOrder) ต้องเป็นตัวเลข 1-100'
            ],
            en: [
              '1. Fill data according to specified columns',
              '2. typeCode must be unique and use uppercase letters',
              '3. hierarchy must be: DEVELOPER, DIRECTOR, GROUP_HEAD, STAFF, STUDENT',
              '4. Permissions use "true/false" or "ได้/ไม่ได้"',
              '5. Responsibilities separated by commas (,)',
              '6. levelOrder must be number 1-100'
            ]
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            userRole: session.user.role,
            version: '1.0'
          }
        }
      });
    }

    return NextResponse.json(
      { error: 'โหมดที่ระบุไม่ถูกต้อง' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Template Download Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างเทมเพลต' },
      { status: 500 }
    );
  }
}

// ================================
// POST HANDLER - Import Data
// ================================
export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบสิทธิ์
    if (!['DEVELOPER', 'DIRECTOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์นำเข้าข้อมูล' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    if (!body.data || !Array.isArray(body.data)) {
      return NextResponse.json(
        { error: 'ข้อมูลที่นำเข้าต้องเป็น array' },
        { status: 400 }
      );
    }

    // Validate options
    const options = ImportOptionsSchema.parse(body.options || {});
    const { mode, hospitalId, updateExisting, skipInvalid, validateOnly } = options;

    // กำหนด hospitalId
    const effectiveHospitalId = session.user.role === 'DEVELOPER' 
      ? (hospitalId || session.user.hospitalId)
      : session.user.hospitalId;

    if (!effectiveHospitalId) {
      return NextResponse.json(
        { error: 'ไม่สามารถระบุโรงพยาบาลได้' },
        { status: 400 }
      );
    }

    // ตรวจสอบสิทธิ์เข้าถึงโรงพยาบาล
    if (session.user.role !== 'DEVELOPER' && effectiveHospitalId !== session.user.hospitalId) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์นำเข้าข้อมูลในโรงพยาบาลนี้' },
        { status: 403 }
      );
    }

    // Validate import data
    const validation = await validateImportData(
      body.data,
      effectiveHospitalId,
      session.user.role,
      updateExisting
    );

    // ถ้าเป็นโหมด validate หรือ validateOnly
    if (mode === 'validate' || validateOnly) {
      return NextResponse.json({
        success: true,
        message: 'ตรวจสอบข้อมูลเรียบร้อยแล้ว',
        validation: {
          totalRows: body.data.length,
          validRows: validation.valid.length,
          invalidRows: validation.invalid.length,
          duplicates: validation.duplicates.length,
          warnings: validation.warnings.length
        },
        details: validation
      });
    }

    // ถ้าเป็นโหมด import
    if (mode === 'import') {
      // ถ้ามี invalid และไม่ skip ให้หยุด
      if (validation.invalid.length > 0 && !skipInvalid) {
        return NextResponse.json({
          success: false,
          error: 'พบข้อมูลที่ไม่ถูกต้อง กรุณาแก้ไขหรือเลือก skipInvalid',
          validation: {
            totalRows: body.data.length,
            validRows: validation.valid.length,
            invalidRows: validation.invalid.length,
            duplicates: validation.duplicates.length
          },
          details: {
            invalid: validation.invalid,
            duplicates: validation.duplicates
          }
        }, { status: 400 });
      }

      // ดำเนินการนำเข้า
      const importResult = await performImport(
        validation.valid,
        updateExisting,
        session.user.id
      );

      return NextResponse.json({
        success: true,
        message: `นำเข้าข้อมูลเรียบร้อยแล้ว สร้างใหม่ ${importResult.created.length} รายการ อัพเดท ${importResult.updated.length} รายการ`,
        result: {
          totalProcessed: validation.valid.length,
          created: importResult.created.length,
          updated: importResult.updated.length,
          errors: importResult.errors.length
        },
        details: {
          created: importResult.created,
          updated: importResult.updated,
          errors: importResult.errors,
          skipped: validation.invalid.length + validation.duplicates.length
        },
        validation
      });
    }

    return NextResponse.json(
      { error: 'โหมดการดำเนินการไม่ถูกต้อง' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Personnel Types Import Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล' },
      { status: 500 }
    );
  }
}