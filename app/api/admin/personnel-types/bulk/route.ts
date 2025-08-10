// app/api/admin/personnel-types/bulk/route.ts
// Personnel Types API - Bulk Operations
// API สำหรับจัดการประเภทบุคลากรแบบกลุ่ม (Bulk Operations)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// ================================
// VALIDATION SCHEMAS
// ================================

const BulkOperationSchema = z.object({
  operation: z.enum(['delete', 'activate', 'deactivate', 'export'], {
    message: 'ประเภทการดำเนินการไม่ถูกต้อง'
  }),
  ids: z.array(z.string().uuid('ID ไม่ถูกต้อง'))
    .min(1, 'ต้องเลือกอย่างน้อย 1 รายการ')
    .max(100, 'เลือกได้สูงสุด 100 รายการต่อครั้ง'),
  force: z.boolean().default(false), // สำหรับ force delete
  reason: z.string().max(500, 'เหตุผลต้องไม่เกิน 500 ตัวอักษร').optional()
});

const BulkCreateSchema = z.object({
  personnelTypes: z.array(z.object({
    hospitalId: z.string().uuid('รหัสโรงพยาบาลไม่ถูกต้อง'),
    typeCode: z.string()
      .min(2, 'รหัสประเภทต้องมีอย่างน้อย 2 ตัวอักษร')
      .max(20, 'รหัสประเภทต้องไม่เกิน 20 ตัวอักษร')
      .regex(/^[A-Z0-9_]+$/, 'รหัสประเภทต้องใช้ตัวพิมพ์ใหญ่, ตัวเลข และ _ เท่านั้น'),
    typeName: z.string()
      .min(1, 'ชื่อประเภทบุคลากรจำเป็นต้องระบุ')
      .max(100, 'ชื่อประเภทบุคลากรต้องไม่เกิน 100 ตัวอักษร'),
    typeNameEn: z.string().max(100).optional().nullable(),
    hierarchy: z.enum(['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD', 'STAFF', 'STUDENT']),
    levelOrder: z.number().int().min(1).max(100),
    description: z.string().max(500).optional().nullable(),
    responsibilities: z.array(z.string()).max(20).optional().nullable(),
    
    // สิทธิ์และความสามารถ
    canManageHospitals: z.boolean().default(false),
    canManageWarehouses: z.boolean().default(false),
    canManageDepartments: z.boolean().default(false),
    canManagePersonnel: z.boolean().default(false),
    canManageDrugs: z.boolean().default(false),
    canManageMasterData: z.boolean().default(false),
    canViewReports: z.boolean().default(true),
    canApproveUsers: z.boolean().default(false),
    
    // การตั้งค่าเพิ่มเติม
    maxSubordinates: z.number().int().min(0).max(1000).optional().nullable(),
    defaultDepartmentType: z.string().max(50).optional().nullable(),
    isActive: z.boolean().default(true)
  }))
  .min(1, 'ต้องมีข้อมูลอย่างน้อย 1 รายการ')
  .max(50, 'สร้างได้สูงสุด 50 รายการต่อครั้ง')
});

// ================================
// HELPER FUNCTIONS
// ================================

async function validateBulkPermissions(
  ids: string[],
  userId: string,
  userRole: string,
  userHospitalId: string,
  operation: 'delete' | 'activate' | 'deactivate' | 'export'
) {
  // ดึงข้อมูลประเภทบุคลากรที่ต้องการดำเนินการ
  const personnelTypes = await prisma.personnelType.findMany({
    where: { id: { in: ids } },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });

  if (personnelTypes.length !== ids.length) {
    return {
      success: false,
      error: 'พบข้อมูลที่ไม่ถูกต้องหรือไม่มีอยู่',
      details: {
        requested: ids.length,
        found: personnelTypes.length
      }
    };
  }

  const violations: Array<{
    id: string;
    typeName: string;
    reason: string;
  }> = [];
  
  const warnings: Array<{
    id: string;
    typeName: string;
    userCount?: number;
    message: string;
  }> = [];

  for (const type of personnelTypes) {
    // ตรวจสอบสิทธิ์เข้าถึงโรงพยาบาล
    if (userRole !== 'DEVELOPER' && type.hospitalId !== userHospitalId) {
      violations.push({
        id: type.id,
        typeName: type.typeName,
        reason: 'ไม่มีสิทธิ์เข้าถึงข้อมูลโรงพยาบาลนี้'
      });
      continue;
    }

    // ตรวจสอบสิทธิ์การดำเนินการ
    if (operation === 'delete') {
      // ไม่สามารถลบ system default
      if (type.isSystemDefault) {
        violations.push({
          id: type.id,
          typeName: type.typeName,
          reason: 'ไม่สามารถลบประเภทบุคลากรเริ่มต้นของระบบได้'
        });
        continue;
      }

      // DIRECTOR ไม่สามารถลบ DEVELOPER/DIRECTOR hierarchy
      if (userRole === 'DIRECTOR' && ['DEVELOPER', 'DIRECTOR'].includes(type.hierarchy)) {
        violations.push({
          id: type.id,
          typeName: type.typeName,
          reason: 'ไม่มีสิทธิ์ลบประเภทบุคลากรในระดับนี้'
        });
        continue;
      }

      // เตือนถ้ามีผู้ใช้งาน
      if (type._count.users > 0) {
        warnings.push({
          id: type.id,
          typeName: type.typeName,
          userCount: type._count.users,
          message: `มีผู้ใช้งาน ${type._count.users} คน`
        });
      }
    }

    // ตรวจสอบสิทธิ์การแก้ไข (activate/deactivate)
    if (['activate', 'deactivate'].includes(operation)) {
      if (userRole === 'DIRECTOR' && ['DEVELOPER', 'DIRECTOR'].includes(type.hierarchy)) {
        violations.push({
          id: type.id,
          typeName: type.typeName,
          reason: 'ไม่มีสิทธิ์แก้ไขประเภทบุคลากรในระดับนี้'
        });
      }
    }
  }

  // ตรวจสอบสิทธิ์ทั่วไป
  if (!['DEVELOPER', 'DIRECTOR'].includes(userRole) && operation !== 'export') {
    return {
      success: false,
      error: 'ไม่มีสิทธิ์ดำเนินการนี้'
    };
  }

  return {
    success: violations.length === 0,
    error: violations.length > 0 ? 'พบข้อมูลที่ไม่สามารถดำเนินการได้' : null,
    violations,
    warnings,
    validTypes: personnelTypes.filter(type => 
      !violations.some(v => v.id === type.id)
    )
  };
}

// ================================
// POST HANDLER - Bulk Operations
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

    // Parse request body
    const body = await request.json();

    // ตรวจสอบว่าเป็น bulk create หรือ bulk operation
    if (body.personnelTypes) {
      return handleBulkCreate(body, session);
    } else {
      return handleBulkOperation(body, session);
    }

  } catch (error) {
    console.error('Personnel Types Bulk Error:', error);
    
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
      { error: 'เกิดข้อผิดพลาดในการดำเนินการ' },
      { status: 500 }
    );
  }
}

// ================================
// BULK CREATE HANDLER
// ================================
async function handleBulkCreate(body: any, session: any) {
  // ตรวจสอบสิทธิ์การสร้าง
  if (!['DEVELOPER', 'DIRECTOR'].includes(session.user.role)) {
    return NextResponse.json(
      { error: 'ไม่มีสิทธิ์สร้างประเภทบุคลากร' },
      { status: 403 }
    );
  }

  const validatedData = BulkCreateSchema.parse(body);

  const results: {
    created: Array<{
      row: number;
      id: string;
      typeCode: string;
      typeName: string;
      action: string;
    }>;
    skipped: Array<{
      typeCode: string;
      typeName: string;
      reason: string;
    }>;
    errors: Array<{
      typeCode: string;
      typeName: string;
      error: string;
    }>;
  } = {
    created: [],
    skipped: [],
    errors: []
  };

  // ประมวลผลทีละรายการ
  for (const typeData of validatedData.personnelTypes) {
    try {
      // ตรวจสอบสิทธิ์เข้าถึงโรงพยาบาล
      if (session.user.role !== 'DEVELOPER' && typeData.hospitalId !== session.user.hospitalId) {
        results.errors.push({
          typeCode: typeData.typeCode,
          typeName: typeData.typeName,
          error: 'ไม่มีสิทธิ์สร้างในโรงพยาบาลนี้'
        });
        continue;
      }

      // ตรวจสอบ hierarchy permissions
      if (session.user.role === 'DIRECTOR' && ['DEVELOPER', 'DIRECTOR'].includes(typeData.hierarchy)) {
        results.errors.push({
          typeCode: typeData.typeCode,
          typeName: typeData.typeName,
          error: 'ไม่สามารถสร้างประเภทบุคลากรในระดับนี้ได้'
        });
        continue;
      }

      // ตรวจสอบว่า typeCode ไม่ซ้ำ
      const existing = await prisma.personnelType.findFirst({
        where: {
          hospitalId: typeData.hospitalId,
          typeCode: typeData.typeCode
        }
      });

      if (existing) {
        results.skipped.push({
          typeCode: typeData.typeCode,
          typeName: typeData.typeName,
          reason: 'รหัสประเภทซ้ำกับที่มีอยู่แล้ว'
        });
        continue;
      }

      // สร้างรายการใหม่
      const newType = await prisma.personnelType.create({
        data: {
          ...typeData,
          createdBy: session.user.id,
          responsibilities: typeData.responsibilities || []
        },
        include: {
          hospital: {
            select: {
              name: true,
              hospitalCode: true
            }
          }
        }
      });

      results.created.push({
        row: results.created.length + 1,
        id: newType.id,
        typeCode: newType.typeCode,
        typeName: newType.typeName,
        action: 'created'
      });

    } catch (error: unknown) {
      results.errors.push({
        typeCode: typeData.typeCode,
        typeName: typeData.typeName,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้าง'
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: `สร้างเรียบร้อย ${results.created.length} รายการ`,
    results
  });
}

// ================================
// BULK OPERATION HANDLER
// ================================
async function handleBulkOperation(body: any, session: any) {
  const validatedData = BulkOperationSchema.parse(body);
  const { operation, ids, force, reason } = validatedData;

  // ตรวจสอบสิทธิ์
  const permissionCheck = await validateBulkPermissions(
    ids,
    session.user.id,
    session.user.role,
    session.user.hospitalId,
    operation
  );

  if (!permissionCheck.success) {
    return NextResponse.json(
      {
        error: permissionCheck.error,
        violations: permissionCheck.violations,
        warnings: permissionCheck.warnings
      },
      { status: 403 }
    );
  }

  const validIds = permissionCheck.validTypes?.map(t => t.id) || [];

  if (validIds.length === 0) {
    return NextResponse.json(
      { error: 'ไม่มีรายการที่สามารถดำเนินการได้' },
      { status: 400 }
    );
  }

  let result;

  switch (operation) {
    case 'delete':
      result = await handleBulkDelete(validIds, force, session);
      break;
    case 'activate':
      result = await handleBulkStatusChange(validIds, true, session);
      break;
    case 'deactivate':
      result = await handleBulkStatusChange(validIds, false, session);
      break;
    case 'export':
      result = await handleBulkExport(validIds, session);
      break;
    default:
      return NextResponse.json(
        { error: 'ประเภทการดำเนินการไม่ถูกต้อง' },
        { status: 400 }
      );
  }

  return NextResponse.json({
    success: true,
    ...result,
    warnings: permissionCheck.warnings
  });
}

// ================================
// BULK DELETE HANDLER
// ================================
async function handleBulkDelete(ids: string[], force: boolean, session: any) {
  // ตรวจสอบ users ที่ใช้ประเภทบุคลากรเหล่านี้
  const usersUsingTypes = await prisma.user.findMany({
    where: { personnelTypeId: { in: ids } },
    select: {
      id: true,
      name: true,
      personnelTypeId: true,
      personnelType: {
        select: {
          typeName: true,
          typeCode: true
        }
      }
    }
  });

  if (usersUsingTypes.length > 0 && !force) {
    return {
      error: 'มีผู้ใช้งานประเภทบุคลากรที่ต้องการลบ',
      conflictType: 'USERS_EXIST',
      userCount: usersUsingTypes.length,
      suggestion: 'ใช้ force delete หรือย้ายผู้ใช้ไปยังประเภทอื่นก่อน'
    };
  }

  // Force delete: เปลี่ยน personnelTypeId เป็น null
  if (force && usersUsingTypes.length > 0) {
    await prisma.user.updateMany({
      where: { personnelTypeId: { in: ids } },
      data: { personnelTypeId: null }
    });
  }

  // ลบประเภทบุคลากร
  const deletedTypes = await prisma.personnelType.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      typeName: true,
      typeCode: true,
      hierarchy: true
    }
  });

  await prisma.personnelType.deleteMany({
    where: { id: { in: ids } }
  });

  return {
    message: `ลบประเภทบุคลากร ${ids.length} รายการเรียบร้อยแล้ว`,
    deletedCount: ids.length,
    affectedUsers: force ? usersUsingTypes.length : 0,
    deletedTypes
  };
}

// ================================
// BULK STATUS CHANGE HANDLER
// ================================
async function handleBulkStatusChange(ids: string[], isActive: boolean, session: any) {
  const updatedTypes = await prisma.personnelType.updateMany({
    where: { id: { in: ids } },
    data: { isActive }
  });

  const action = isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน';

  return {
    message: `${action}ประเภทบุคลากร ${updatedTypes.count} รายการเรียบร้อยแล้ว`,
    updatedCount: updatedTypes.count,
    action: isActive ? 'activated' : 'deactivated'
  };
}

// ================================
// BULK EXPORT HANDLER
// ================================
async function handleBulkExport(ids: string[], session: any) {
  const personnelTypes = await prisma.personnelType.findMany({
    where: { id: { in: ids } },
    include: {
      hospital: {
        select: {
          name: true,
          hospitalCode: true
        }
      },
      creator: {
        select: {
          name: true,
          role: true
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    },
    orderBy: [
      { hierarchy: 'asc' },
      { levelOrder: 'asc' },
      { typeName: 'asc' }
    ]
  });

  // สร้าง export data
  const exportData = personnelTypes.map(type => ({
    รหัสประเภท: type.typeCode,
    ชื่อประเภท: type.typeName,
    ชื่อภาษาอังกฤษ: type.typeNameEn || '',
    ระดับลำดับชั้น: type.hierarchy,
    ลำดับระดับ: type.levelOrder,
    โรงพยาบาล: `${type.hospital.name} (${type.hospital.hospitalCode})`,
    คำอธิบาย: type.description || '',
    จำนวนผู้ใช้: type._count.users,
    สถานะ: type.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน',
    ผู้สร้าง: type.creator.name,
    วันที่สร้าง: type.createdAt.toISOString().split('T')[0],
    'จัดการโรงพยาบาล': type.canManageHospitals ? 'ได้' : 'ไม่ได้',
    'จัดการคลัง': type.canManageWarehouses ? 'ได้' : 'ไม่ได้',
    'จัดการแผนก': type.canManageDepartments ? 'ได้' : 'ไม่ได้',
    'จัดการบุคลากร': type.canManagePersonnel ? 'ได้' : 'ไม่ได้',
    'จัดการยา': type.canManageDrugs ? 'ได้' : 'ไม่ได้',
    'จัดการข้อมูลหลัก': type.canManageMasterData ? 'ได้' : 'ไม่ได้',
    'ดูรายงาน': type.canViewReports ? 'ได้' : 'ไม่ได้',
    'อนุมัติผู้ใช้': type.canApproveUsers ? 'ได้' : 'ไม่ได้'
  }));

  return {
    message: `ส่งออกข้อมูลประเภทบุคลากร ${personnelTypes.length} รายการเรียบร้อยแล้ว`,
    exportCount: personnelTypes.length,
    data: exportData,
    filename: `personnel-types-export-${new Date().toISOString().split('T')[0]}.json`,
    exportedAt: new Date().toISOString()
  };
}