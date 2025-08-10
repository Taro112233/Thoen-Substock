// app/api/admin/personnel-types/[id]/route.ts
// Personnel Types API Routes - Detail operations (GET/PUT/DELETE)
// API สำหรับจัดการประเภทบุคลากรรายบุคคล

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// ================================
// VALIDATION SCHEMAS
// ================================

const PersonnelTypeUpdateSchema = z.object({
  typeName: z.string()
    .min(1, 'ชื่อประเภทบุคลากรจำเป็นต้องระบุ')
    .max(100, 'ชื่อประเภทบุคลากรต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
  typeNameEn: z.string()
    .max(100, 'ชื่อภาษาอังกฤษต้องไม่เกิน 100 ตัวอักษร')
    .optional()
    .nullable(),
  hierarchy: z.enum(['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD', 'STAFF', 'STUDENT'])
    .optional(),
  levelOrder: z.number()
    .int('ลำดับระดับต้องเป็นจำนวนเต็ม')
    .min(1, 'ลำดับระดับต้องมากกว่าหรือเท่ากับ 1')
    .max(100, 'ลำดับระดับต้องไม่เกิน 100')
    .optional(),
  
  // สิทธิ์และความสามารถ
  canManageHospitals: z.boolean().optional(),
  canManageWarehouses: z.boolean().optional(),
  canManageDepartments: z.boolean().optional(),
  canManagePersonnel: z.boolean().optional(),
  canManageDrugs: z.boolean().optional(),
  canManageMasterData: z.boolean().optional(),
  canViewReports: z.boolean().optional(),
  canApproveUsers: z.boolean().optional(),
  
  // รายละเอียดเพิ่มเติม
  description: z.string()
    .max(500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร')
    .optional()
    .nullable(),
  responsibilities: z.array(z.string())
    .max(20, 'หน้าที่ความรับผิดชอบต้องไม่เกิน 20 รายการ')
    .optional()
    .nullable(),
  maxSubordinates: z.number()
    .int('จำนวนลูกน้องสูงสุดต้องเป็นจำนวนเต็ม')
    .min(0, 'จำนวนลูกน้องสูงสุดต้องมากกว่าหรือเท่ากับ 0')
    .max(1000, 'จำนวนลูกน้องสูงสุดต้องไม่เกิน 1000')
    .optional()
    .nullable(),
  defaultDepartmentType: z.string()
    .max(50, 'ประเภทแผนกเริ่มต้นต้องไม่เกิน 50 ตัวอักษร')
    .optional()
    .nullable(),
  isActive: z.boolean().optional()
});

const RouteParamsSchema = z.object({
  id: z.string().uuid('ID ประเภทบุคลากรไม่ถูกต้อง')
});

// ================================
// HELPER FUNCTIONS
// ================================

async function getPersonnelTypeWithPermissionCheck(
  id: string, 
  userId: string, 
  userRole: string, 
  userHospitalId: string
) {
  const personnelType = await prisma.personnelType.findUnique({
    where: { id },
    include: {
      hospital: {
        select: {
          id: true,
          name: true,
          hospitalCode: true,
          status: true
        }
      },
      creator: {
        select: {
          id: true,
          name: true,
          role: true
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    }
  });

  if (!personnelType) {
    return { error: 'ไม่พบประเภทบุคลากรที่ระบุ', status: 404 };
  }

  // ตรวจสอบสิทธิ์เข้าถึง (Multi-tenant)
  if (userRole !== 'DEVELOPER' && personnelType.hospitalId !== userHospitalId) {
    return { error: 'ไม่มีสิทธิ์เข้าถึงประเภทบุคลากรนี้', status: 403 };
  }

  return { personnelType };
}

async function canModifyPersonnelType(
  personnelType: any,
  userRole: string,
  operationType: 'update' | 'delete'
): Promise<{ canModify: boolean; reason?: string }> {
  // System default types ไม่สามารถแก้ไขหรือลบได้
  if (personnelType.isSystemDefault) {
    return {
      canModify: false,
      reason: 'ไม่สามารถ' + (operationType === 'delete' ? 'ลบ' : 'แก้ไข') + 'ประเภทบุคลากรเริ่มต้นของระบบได้'
    };
  }

  // DEVELOPER สามารถแก้ไข/ลบได้ทั้งหมด
  if (userRole === 'DEVELOPER') {
    return { canModify: true };
  }

  // DIRECTOR ไม่สามารถแก้ไข/ลบ DEVELOPER และ DIRECTOR hierarchy ได้
  if (userRole === 'DIRECTOR') {
    const forbiddenHierarchies = ['DEVELOPER', 'DIRECTOR'];
    if (forbiddenHierarchies.includes(personnelType.hierarchy)) {
      return {
        canModify: false,
        reason: 'ไม่มีสิทธิ์' + (operationType === 'delete' ? 'ลบ' : 'แก้ไข') + 'ประเภทบุคลากรในระดับนี้'
      };
    }
  }

  // อื่นๆ ไม่มีสิทธิ์
  if (!['DEVELOPER', 'DIRECTOR'].includes(userRole)) {
    return {
      canModify: false,
      reason: 'ไม่มีสิทธิ์' + (operationType === 'delete' ? 'ลบ' : 'แก้ไข') + 'ประเภทบุคลากร'
    };
  }

  return { canModify: true };
}

// ================================
// GET HANDLER - Get Personnel Type Detail
// ================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // ตรวจสอบสิทธิ์การเข้าถึง
    if (!['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึงการจัดการประเภทบุคลากร' },
        { status: 403 }
      );
    }

    // Validate route parameters
    const { id } = RouteParamsSchema.parse(params);

    // ดึงข้อมูลและตรวจสอบสิทธิ์
    const result = await getPersonnelTypeWithPermissionCheck(
      id, 
      session.user.id, 
      session.user.role, 
      session.user.hospitalId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // ข้อมูลเพิ่มเติมเกี่ยวกับการใช้งาน
    const usageStats = await prisma.user.findMany({
      where: { personnelTypeId: id },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // แสดง 10 คนล่าสุด
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result.personnelType,
        recentUsers: usageStats
      }
    });

  } catch (error) {
    console.error('Personnel Type GET Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'พารามิเตอร์ไม่ถูกต้อง',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทบุคลากร' },
      { status: 500 }
    );
  }
}

// ================================
// PUT HANDLER - Update Personnel Type
// ================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // Validate route parameters
    const { id } = RouteParamsSchema.parse(params);

    // ดึงข้อมูลและตรวจสอบสิทธิ์
    const result = await getPersonnelTypeWithPermissionCheck(
      id, 
      session.user.id, 
      session.user.role, 
      session.user.hospitalId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { personnelType } = result;
    if (!personnelType) {
      return NextResponse.json(
        { error: 'ไม่พบประเภทบุคลากรที่ระบุ' },
        { status: 404 }
      );
    }

    // ตรวจสอบสิทธิ์การแก้ไข
    const modifyCheck = await canModifyPersonnelType(personnelType, session.user.role, 'update');
    if (!modifyCheck.canModify) {
      return NextResponse.json(
        { error: modifyCheck.reason },
        { status: 403 }
      );
    }

    // Parse และ validate request body
    const body = await request.json();
    const validatedData = PersonnelTypeUpdateSchema.parse(body);

    // ตรวจสอบการเปลี่ยน hierarchy (DIRECTOR ไม่สามารถเปลี่ยนเป็น DEVELOPER/DIRECTOR ได้)
    if (validatedData.hierarchy && session.user.role === 'DIRECTOR') {
      const forbiddenHierarchies = ['DEVELOPER', 'DIRECTOR'];
      if (forbiddenHierarchies.includes(validatedData.hierarchy)) {
        return NextResponse.json(
          { error: 'ไม่สามารถเปลี่ยนระดับลำดับชั้นเป็นระดับนี้ได้' },
          { status: 403 }
        );
      }
    }

    // ตรวจสอบว่ามีผู้ใช้งานประเภทบุคลากรนี้อยู่หรือไม่ (สำหรับการเปลี่ยนแปลงที่สำคัญ)
    const userCount = await prisma.user.count({
      where: { personnelTypeId: id }
    });

    // เตรียมข้อมูลสำหรับการอัพเดท
    const updateData: any = {
      ...validatedData,
      responsibilities: validatedData.responsibilities || personnelType.responsibilities
    };

    // อัพเดทข้อมูล
    const updatedPersonnelType = await prisma.personnelType.update({
      where: { id },
      data: updateData,
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            hospitalCode: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'อัพเดทประเภทบุคลากรเรียบร้อยแล้ว',
      data: updatedPersonnelType,
      affectedUsers: userCount
    });

  } catch (error) {
    console.error('Personnel Type UPDATE Error:', error);
    
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
      { error: 'เกิดข้อผิดพลาดในการอัพเดทประเภทบุคลากร' },
      { status: 500 }
    );
  }
}

// ================================
// DELETE HANDLER - Delete Personnel Type
// ================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    // Validate route parameters
    const { id } = RouteParamsSchema.parse(params);

    // ดึงข้อมูลและตรวจสอบสิทธิ์
    const result = await getPersonnelTypeWithPermissionCheck(
      id, 
      session.user.id, 
      session.user.role, 
      session.user.hospitalId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const { personnelType } = result;

    // ตรวจสอบสิทธิ์การลบ
    const deleteCheck = await canModifyPersonnelType(personnelType, session.user.role, 'delete');
    if (!deleteCheck.canModify) {
      return NextResponse.json(
        { error: deleteCheck.reason },
        { status: 403 }
      );
    }

    // ตรวจสอบว่ามีผู้ใช้งานประเภทบุคลากรนี้อยู่หรือไม่
    const usersUsingType = await prisma.user.findMany({
      where: { personnelTypeId: id },
      select: {
        id: true,
        name: true,
        role: true,
        status: true
      }
    });

    // ตรวจสอบ force delete header
    const forceDelete = request.headers.get('X-Force-Delete') === 'true';

    if (usersUsingType.length > 0 && !forceDelete) {
      return NextResponse.json(
        {
          error: 'ไม่สามารถลบประเภทบุคลากรที่มีผู้ใช้งานอยู่',
          conflictType: 'USERS_EXIST',
          details: {
            userCount: usersUsingType.length,
            users: usersUsingType.slice(0, 5), // แสดง 5 คนแรก
            hasMore: usersUsingType.length > 5
          },
          suggestion: 'กรุณาย้ายผู้ใช้ไปยังประเภทอื่นก่อน หรือใช้ force delete'
        },
        { status: 409 }
      );
    }

    // ถ้าเป็น force delete ให้ set personnelTypeId เป็น null สำหรับผู้ใช้ที่เกี่ยวข้อง
    if (forceDelete && usersUsingType.length > 0) {
      await prisma.user.updateMany({
        where: { personnelTypeId: id },
        data: { personnelTypeId: null }
      });
    }

    // ลบประเภทบุคลากร
    await prisma.personnelType.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: forceDelete && usersUsingType.length > 0 
        ? `ลบประเภทบุคลากรเรียบร้อยแล้ว (ผู้ใช้ ${usersUsingType.length} คนถูกเปลี่ยนเป็นไม่มีประเภท)`
        : 'ลบประเภทบุคลากรเรียบร้อยแล้ว',
      deletedData: {
        id: result.personnelType!.id,
        typeName: result.personnelType!.typeName,
        typeCode: result.personnelType!.typeCode,
        hierarchy: result.personnelType!.hierarchy
      },
      affectedUsers: forceDelete ? usersUsingType.length : 0
    });

  } catch (error) {
    console.error('Personnel Type DELETE Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'พารามิเตอร์ไม่ถูกต้อง',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Database constraint errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'ไม่สามารถลบประเภทบุคลากรที่มีข้อมูลเกี่ยวข้องอยู่',
          suggestion: 'กรุณาลบข้อมูลที่เกี่ยวข้องก่อน หรือใช้ force delete'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบประเภทบุคลากร' },
      { status: 500 }
    );
  }
}