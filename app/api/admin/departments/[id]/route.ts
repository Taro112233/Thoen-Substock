// app/api/admin/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Validation schema for updates
const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'ชื่อแผนกจำเป็น').optional(),
  nameEn: z.string().optional(),
  departmentCode: z.string().min(1, 'รหัสแผนกจำเป็น').max(10, 'รหัสแผนกต้องไม่เกิน 10 ตัวอักษร').optional(),
  type: z.enum([
    'PHARMACY', 'EMERGENCY', 'ICU', 'SURGERY', 'MEDICINE', 'PEDIATRICS', 
    'OBSTETRICS', 'ORTHOPEDICS', 'CARDIOLOGY', 'NEUROLOGY', 'ONCOLOGY',
    'PSYCHIATRY', 'RADIOLOGY', 'LABORATORY', 'OUTPATIENT', 'INPATIENT',
    'ADMINISTRATION', 'OTHER'
  ]).optional(),
  parentDepartmentId: z.string().uuid().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  allowRequisition: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  maxRequisitionValue: z.number().positive().optional(),
  budgetLimit: z.number().positive().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET - รายละเอียดแผนกเฉพาะ
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    const { hospitalId } = authResult;
    const departmentId = params.id;

    // Get department with all related data
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        hospitalId: hospitalId,
      },
      include: {
        parentDepartment: {
          select: { 
            id: true, 
            name: true, 
            departmentCode: true,
            type: true 
          }
        },
        childDepartments: {
          select: { 
            id: true, 
            name: true, 
            departmentCode: true,
            type: true,
            isActive: true 
          },
          where: { isActive: true }
        },
        headOfDepartment: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            email: true,
            phoneNumber: true,
            position: true 
          }
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            position: true,
            status: true,
            createdAt: true
          },
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        },
        requisitions: {
          select: {
            id: true,
            requisitionNumber: true,
            status: true,
            estimatedValue: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            users: true,
            requisitions: true,
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json({ 
        error: 'ไม่พบแผนกที่ระบุ' 
      }, { status: 404 });
    }

    // Calculate additional statistics
    const [recentActivity, budgetUsage] = await Promise.all([
      // Recent activity - Skip if AuditLog table doesn't exist
      Promise.resolve([]),
      
      // Budget usage statistics
      prisma.requisition.aggregate({
        where: {
          requestingDepartmentId: departmentId,
          status: { in: ['APPROVED', 'COMPLETED'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // This month
          }
        },
        _sum: {
          estimatedValue: true
        }
      })
    ]);

    // Calculate budget utilization
    const monthlySpending = budgetUsage._sum.estimatedValue?.toNumber() || 0;
    const budgetUtilization = department.budgetLimit ? 
      (monthlySpending / department.budgetLimit.toNumber()) * 100 : 0;

    return NextResponse.json({
      department: {
        ...department,
        budgetUtilization,
        monthlySpending,
        userCount: department._count.users,
        requisitionCount: department._count.requisitions,
      },
      recentActivity,
      stats: {
        totalUsers: department._count.users,
        totalRequisitions: department._count.requisitions,
        monthlySpending,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      }
    });

  } catch (error) {
    console.error('[DEPARTMENT_GET]', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนก' 
    }, { status: 500 });
  }
}

// PUT - อัพเดตข้อมูลแผนก
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    const { user, hospitalId } = authResult;
    const departmentId = params.id;
    const body = await request.json();
    const validatedData = updateDepartmentSchema.parse(body);

    // Check if department exists and belongs to the hospital
    const existingDepartment = await prisma.department.findFirst({
      where: {
        id: departmentId,
        hospitalId: hospitalId,
      }
    });

    if (!existingDepartment) {
      return NextResponse.json({ 
        error: 'ไม่พบแผนกที่ระบุ' 
      }, { status: 404 });
    }

    // Check if department code is unique (if being updated)
    if (validatedData.departmentCode && validatedData.departmentCode !== existingDepartment.departmentCode) {
      const duplicateCode = await prisma.department.findFirst({
        where: {
          hospitalId: hospitalId,
          departmentCode: validatedData.departmentCode,
          id: { not: departmentId }
        }
      });

      if (duplicateCode) {
        return NextResponse.json({ 
          error: 'รหัสแผนกนี้มีอยู่แล้วในโรงพยาบาล' 
        }, { status: 409 });
      }
    }

    // Validate parent department if provided
    if (validatedData.parentDepartmentId) {
      // Check if parent department exists
      const parentDept = await prisma.department.findFirst({
        where: {
          id: validatedData.parentDepartmentId,
          hospitalId: hospitalId,
        }
      });

      if (!parentDept) {
        return NextResponse.json({ 
          error: 'ไม่พบแผนกแม่ที่ระบุ' 
        }, { status: 400 });
      }

      // Prevent circular reference
      if (validatedData.parentDepartmentId === departmentId) {
        return NextResponse.json({ 
          error: 'ไม่สามารถกำหนดแผนกนี้เป็นแผนกแม่ของตัวเองได้' 
        }, { status: 400 });
      }

      // Check for circular dependency
      const checkCircular = async (parentId: string, targetId: string): Promise<boolean> => {
        const parent = await prisma.department.findFirst({
          where: { id: parentId },
          select: { parentDepartmentId: true }
        });
        
        if (!parent?.parentDepartmentId) return false;
        if (parent.parentDepartmentId === targetId) return true;
        
        return checkCircular(parent.parentDepartmentId, targetId);
      };

      if (await checkCircular(validatedData.parentDepartmentId, departmentId)) {
        return NextResponse.json({ 
          error: 'ไม่สามารถสร้างการอ้างอิงแบบวงจรได้' 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      maxRequisitionValue: validatedData.maxRequisitionValue ? 
        new Decimal(validatedData.maxRequisitionValue) : undefined,
      budgetLimit: validatedData.budgetLimit ? 
        new Decimal(validatedData.budgetLimit) : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: updateData,
      include: {
        parentDepartment: {
          select: { id: true, name: true, departmentCode: true }
        },
        childDepartments: {
          select: { id: true, name: true, departmentCode: true }
        },
        headOfDepartment: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
      }
    });

    // Skip audit log creation if table doesn't exist
    try {
      await prisma.auditLog.create({
        data: {
          hospitalId: hospitalId,
          userId: user.userId,
          action: 'UPDATE',
          entityType: 'DEPARTMENT',
          entityId: departmentId,
          description: `Updated department: ${updatedDepartment.name}`,
          newValues: validatedData,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
    } catch (auditError) {
      console.log('Audit log skipped:', (auditError as Error).message);
    }

    return NextResponse.json({ 
      message: 'อัพเดตข้อมูลแผนกสำเร็จ',
      department: updatedDepartment 
    });

  } catch (error) {
    console.error('[DEPARTMENT_PUT]', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'ข้อมูลไม่ถูกต้อง', 
        details: error.issues 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการอัพเดตแผนก' 
    }, { status: 500 });
  }
}

// DELETE - ลบแผนก
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    const { user, hospitalId } = authResult;
    const departmentId = params.id;

    // Check if department exists and belongs to the hospital
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        hospitalId: hospitalId,
      },
      include: {
        _count: {
          select: {
            users: true,
            requisitions: true,
            childDepartments: true,
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json({ 
        error: 'ไม่พบแผนกที่ระบุ' 
      }, { status: 404 });
    }

    // Check if department has dependencies
    const hasDependencies = 
      department._count.users > 0 || 
      department._count.requisitions > 0 || 
      department._count.childDepartments > 0;

    if (hasDependencies) {
      return NextResponse.json({ 
        error: 'ไม่สามารถลบแผนกที่มีผู้ใช้งาน, ใบเบิกยา หรือแผนกย่อยได้',
        details: {
          users: department._count.users,
          requisitions: department._count.requisitions,
          childDepartments: department._count.childDepartments,
        }
      }, { status: 409 });
    }

    // Soft delete by setting isActive to false instead of actual deletion
    const deletedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: { 
        isActive: false,
        // Add deletion timestamp to name to prevent unique constraint issues
        departmentCode: `${department.departmentCode}_DELETED_${Date.now()}`
      }
    });

    // Skip audit log creation if table doesn't exist
    try {
      await prisma.auditLog.create({
        data: {
          hospitalId: hospitalId,
          userId: user.userId,
          action: 'DELETE',
          entityType: 'DEPARTMENT',
          entityId: departmentId,
          description: `Deleted department: ${department.name}`,
          oldValues: {
            departmentName: department.name,
            departmentCode: department.departmentCode,
            deletionMethod: 'soft_delete',
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
    } catch (auditError) {
      console.log('Audit log skipped:', (auditError as Error).message);
    }

    return NextResponse.json({ 
      message: 'ลบแผนกสำเร็จแล้ว',
      department: deletedDepartment 
    });

  } catch (error) {
    console.error('[DEPARTMENT_DELETE]', error);
    return NextResponse.json({ 
      error: 'เกิดข้อผิดพลาดในการลบแผนก' 
    }, { status: 500 });
  }
}