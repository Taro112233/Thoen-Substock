// app/api/admin/hospitals/[id]/route.ts - Fixed ZodError handling
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z, ZodError } from 'zod';

const UpdateHospitalSchema = z.object({
  name: z.string().min(1, 'ชื่อโรงพยาบาลจำเป็น').optional(),
  nameEn: z.string().optional(),
  hospitalCode: z.string().min(1, 'รหัสโรงพยาบาลจำเป็น').optional(),
  type: z.enum(['GOVERNMENT', 'PRIVATE', 'UNIVERSITY', 'MILITARY', 'POLICE', 'COMMUNITY', 'SPECIALIZED']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'MAINTENANCE']).optional(),
  
  // ข้อมูลการจดทะเบียน
  licenseNo: z.string().optional(),
  licenseExpiry: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  taxId: z.string().optional(),
  registrationNo: z.string().optional(),
  
  // ที่อยู่
  address: z.string().min(1, 'ที่อยู่จำเป็น').optional(),
  district: z.string().optional(),
  subDistrict: z.string().optional(),
  province: z.string().min(1, 'จังหวัดจำเป็น').optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Thailand').optional(),
  
  // ข้อมูลติดต่อ
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional(),
  website: z.string().url('รูปแบบ URL ไม่ถูกต้อง').optional(),
  
  // ข้อมูลเพิ่มเติม
  bedCount: z.number().int().min(0).optional(),
  employeeCount: z.number().int().min(0).optional(),
  establishedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  
  // การตั้งค่าระบบ
  timezone: z.string().optional(),
  locale: z.string().optional(),
  currency: z.string().optional(),
  
  // การสมัครสมาชิก
  subscriptionPlan: z.string().optional(),
  subscriptionStart: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  subscriptionEnd: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  maxUsers: z.number().int().min(1).optional(),
  maxWarehouses: z.number().int().min(1).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'ต้องมีข้อมูลอย่างน้อย 1 ฟิลด์ที่จะแก้ไข'
});

// ===================================
// HELPER FUNCTIONS
// ===================================

async function getUserSession() {
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'dev-user-1',
      role: 'DEVELOPER',
      hospitalId: 'dev-hospital-1',
      status: 'ACTIVE',
    };
  }

  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลการเข้าสู่ระบบ');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      hospital: true,
      personnelType: true,
    },
  });

  if (!user) {
    throw new Error('ไม่พบข้อมูลผู้ใช้');
  }

  return user;
}

function checkHospitalPermission(user: any, action: 'READ' | 'UPDATE' | 'DELETE', targetHospitalId?: string) {
  if (user.role === 'DEVELOPER') {
    return true;
  }

  if (user.role === 'HOSPITAL_ADMIN' || user.role === 'DIRECTOR') {
    return user.hospitalId === targetHospitalId;
  }

  if (user.personnelType?.canManageHospitals) {
    return user.hospitalId === targetHospitalId;
  }

  return false;
}

async function getHospitalWithDetails(hospitalId: string) {
  return await prisma.hospital.findUnique({
    where: { id: hospitalId },
    include: {
      _count: {
        select: {
          users: true,
          departments: true,
          warehouses: true,
          drugs: true,
          stockCards: true,
          requisitions: true,
          purchaseOrders: true,
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          role: true,
          status: true,
          lastLoginAt: true,
        },
        take: 5,
        orderBy: { lastLoginAt: 'desc' },
      },
      departments: {
        select: {
          id: true,
          name: true,
          type: true,
          isActive: true,
        },
        take: 5,
        where: { isActive: true },
      },
      warehouses: {
        select: {
          id: true,
          name: true,
          type: true,
          isActive: true,
        },
        take: 5,
        where: { isActive: true },
      },
    },
  });
}

// ===================================
// API HANDLERS
// ===================================

// GET /api/admin/hospitals/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: hospitalId } = params;

    // ตรวจสอบการเข้าสู่ระบบ
    const user = await getUserSession();
    
    // ตรวจสอบสิทธิ์
    if (!checkHospitalPermission(user, 'READ', hospitalId)) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึงข้อมูลโรงพยาบาลนี้' },
        { status: 403 }
      );
    }

    // ดึงข้อมูลโรงพยาบาล
    const hospital = await getHospitalWithDetails(hospitalId);

    if (!hospital) {
      return NextResponse.json(
        { error: 'ไม่พบโรงพยาบาลที่ระบุ' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hospital,
    });

  } catch (error: any) {
    console.error('Hospital GET [id] error:', error);
    
    if (error.message.includes('ไม่พบ') || error.message.includes('ไม่มี')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโรงพยาบาล' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/hospitals/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: hospitalId } = params;

    // ตรวจสอบการเข้าสู่ระบบ
    const user = await getUserSession();
    
    // ตรวจสอบสิทธิ์
    if (!checkHospitalPermission(user, 'UPDATE', hospitalId)) {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์แก้ไขข้อมูลโรงพยาบาลนี้' },
        { status: 403 }
      );
    }

    // ตรวจสอบว่าโรงพยาบาลมีอยู่จริง
    const existingHospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
    });

    if (!existingHospital) {
      return NextResponse.json(
        { error: 'ไม่พบโรงพยาบาลที่ระบุ' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateHospitalSchema.parse(body);

    // ตรวจสอบว่ารหัสโรงพยาบาลซ้ำหรือไม่ (หากมีการแก้ไข)
    if (validatedData.hospitalCode && validatedData.hospitalCode !== existingHospital.hospitalCode) {
      const duplicateHospital = await prisma.hospital.findUnique({
        where: { hospitalCode: validatedData.hospitalCode },
      });

      if (duplicateHospital) {
        return NextResponse.json(
          { error: 'รหัสโรงพยาบาลนี้มีอยู่แล้ว' },
          { status: 400 }
        );
      }
    }

    // Update โรงพยาบาล
    const updatedHospital = await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        ...validatedData,
        lastActivityAt: new Date(),
      },
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            warehouses: true,
          },
        },
      },
    });

    // Log การแก้ไข
    await prisma.auditLog.create({
      data: {
        hospitalId: hospitalId,
        userId: user.id,
        action: 'UPDATE',
        entityType: 'Hospital',
        entityId: hospitalId,
        description: `แก้ไขข้อมูลโรงพยาบาล: ${updatedHospital.name}`,
        oldValues: {
          name: existingHospital.name,
          hospitalCode: existingHospital.hospitalCode,
          status: existingHospital.status,
        },
        newValues: validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'แก้ไขข้อมูลโรงพยาบาลสำเร็จ',
      data: updatedHospital,
    });

  } catch (error: any) {
    console.error('Hospital PUT error:', error);

    // Fixed: Use ZodError properly
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'รหัสโรงพยาบาลนี้มีอยู่แล้ว' },
        { status: 400 }
      );
    }

    if (error.message.includes('ไม่พบ') || error.message.includes('ไม่มี')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลโรงพยาบาล' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/hospitals/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: hospitalId } = params;

    // ตรวจสอบการเข้าสู่ระบบ
    const user = await getUserSession();
    
    // ตรวจสอบสิทธิ์ - เฉพาะ DEVELOPER เท่านั้นที่ลบโรงพยาบาลได้
    if (user.role !== 'DEVELOPER') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์ลบโรงพยาบาล' },
        { status: 403 }
      );
    }

    // ตรวจสอบว่าโรงพยาบาลมีอยู่จริง
    const existingHospital = await prisma.hospital.findUnique({
      where: { id: hospitalId },
      include: {
        _count: {
          select: {
            users: true,
            departments: true,
            warehouses: true,
            drugs: true,
            stockCards: true,
            requisitions: true,
          },
        },
      },
    });

    if (!existingHospital) {
      return NextResponse.json(
        { error: 'ไม่พบโรงพยาบาลที่ระบุ' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่ามีข้อมูลที่เกี่ยวข้องหรือไม่
    const hasRelatedData = (
      existingHospital._count.users > 0 ||
      existingHospital._count.departments > 0 ||
      existingHospital._count.warehouses > 0 ||
      existingHospital._count.drugs > 0 ||
      existingHospital._count.stockCards > 0 ||
      existingHospital._count.requisitions > 0
    );

    if (hasRelatedData) {
      // Soft delete - เปลี่ยนสถานะเป็น INACTIVE แทนการลบจริง
      const deletedHospital = await prisma.hospital.update({
        where: { id: hospitalId },
        data: {
          status: 'INACTIVE',
          lastActivityAt: new Date(),
        },
      });

      // Log การ soft delete
      await prisma.auditLog.create({
        data: {
          hospitalId: hospitalId,
          userId: user.id,
          action: 'DELETE',
          entityType: 'Hospital',
          entityId: hospitalId,
          description: `ปิดการใช้งานโรงพยาบาล: ${existingHospital.name} (Soft Delete)`,
          oldValues: {
            status: existingHospital.status,
          },
          newValues: {
            status: 'INACTIVE',
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'ปิดการใช้งานโรงพยาบาลสำเร็จ (ไม่สามารถลบได้เนื่องจากมีข้อมูลที่เกี่ยวข้อง)',
        data: deletedHospital,
      });
    } else {
      // Hard delete - ลบจริงเนื่องจากไม่มีข้อมูลที่เกี่ยวข้อง
      await prisma.hospital.delete({
        where: { id: hospitalId },
      });

      // Log การ hard delete
      await prisma.auditLog.create({
        data: {
          hospitalId: hospitalId,
          userId: user.id,
          action: 'DELETE',
          entityType: 'Hospital',
          entityId: hospitalId,
          description: `ลบโรงพยาบาล: ${existingHospital.name} (Hard Delete)`,
          oldValues: existingHospital,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'ลบโรงพยาบาลสำเร็จ',
      });
    }

  } catch (error: any) {
    console.error('Hospital DELETE error:', error);

    if (error.message.includes('ไม่พบ') || error.message.includes('ไม่มี')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'ไม่สามารถลบโรงพยาบาลได้เนื่องจากมีข้อมูลที่เกี่ยวข้อง' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบโรงพยาบาล' },
      { status: 500 }
    );
  }
}