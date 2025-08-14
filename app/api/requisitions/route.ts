// app/api/requisitions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateUserAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Simple validation schemas - ใช้ field ที่มีจริงใน schema
const createRequisitionSchema = z.object({
  requisitionNumber: z.string().min(1),
  purpose: z.string().min(1),
  type: z.enum(['REGULAR', 'EMERGENCY', 'SCHEDULED', 'RETURN']).default('REGULAR'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  requiredDate: z.string().transform(str => new Date(str)),
  requestingDepartmentId: z.string().min(1),
  fulfillmentWarehouseId: z.string().min(1),
  items: z.array(z.object({
    drugId: z.string().min(1),
    requestedQuantity: z.number().positive(),
    notes: z.string().optional()
  })).min(1),
  notes: z.string().optional(),
  saveAsDraft: z.boolean().default(false)
});

// GET - ดึงรายการใบเบิก
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [REQUISITION API] GET requisitions');
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    
    const requisitions = await prisma.requisition.findMany({
      where: {
        hospitalId: user.hospitalId
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        requestingDepartment: {
          select: {
            id: true,
            name: true
          }
        },
        fulfillmentWarehouse: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        items: {
          include: {
            drug: {
              select: {
                id: true,
                hospitalDrugCode: true,
                name: true,
                dosageForm: true,
                strength: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: {
        requestedDate: 'desc'
      },
      take: 50
    });

    console.log(`✅ [REQUISITION API] Retrieved ${requisitions.length} requisitions`);

    return NextResponse.json({
      success: true,
      data: requisitions
    });

  } catch (error) {
    console.error('❌ [REQUISITION API] GET Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเบิก' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - สร้างใบเบิกใหม่
export async function POST(request: NextRequest) {
  try {
    console.log('📝 [REQUISITION API] POST new requisition');
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    const body = await request.json();
    
    // Validate input
    const validationResult = createRequisitionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const {
      requisitionNumber,
      purpose,
      type,
      priority,
      requiredDate,
      requestingDepartmentId,
      fulfillmentWarehouseId,
      items,
      notes,
      saveAsDraft
    } = validationResult.data;

    // ตรวจสอบหมายเลขใบเบิกซ้ำ
    const existingRequisition = await prisma.requisition.findFirst({
      where: {
        hospitalId: user.hospitalId,
        requisitionNumber
      }
    });

    if (existingRequisition) {
      return NextResponse.json(
        { error: 'หมายเลขใบเบิกนี้มีอยู่แล้ว' },
        { status: 400 }
      );
    }

    // สร้างใบเบิกและรายการยาใน transaction
    const result = await prisma.$transaction(async (tx) => {
      // สร้างใบเบิก - ใช้ field ที่มีจริงใน schema
      const requisition = await tx.requisition.create({
        data: {
          hospitalId: user.hospitalId,
          requisitionNumber,
          type,
          priority,
          status: saveAsDraft ? 'DRAFT' : 'SUBMITTED',
          requestedDate: new Date(),
          requiredDate,
          requesterId: user.userId,
          requestingDepartmentId,
          fulfillmentWarehouseId,
          requesterName: user.name || '',
          requesterPosition: user.role || '',
          notes: notes || purpose, // ใช้ notes field ที่มีจริง
          createdBy: user.userId
        }
      });

      // สร้างรายการยา - ใช้ field ที่มีจริงใน schema
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // หา stockCard สำหรับยานี้
        const stockCard = await tx.stockCard.findFirst({
          where: {
            drugId: item.drugId,
            warehouseId: fulfillmentWarehouseId,
            hospitalId: user.hospitalId
          }
        });

        if (!stockCard) {
          throw new Error(`ไม่พบข้อมูล stock สำหรับยา ${item.drugId} ในคลังที่ระบุ`);
        }

        await tx.requisitionItem.create({
          data: {
            requisitionId: requisition.id,
            drugId: item.drugId,
            stockCardId: stockCard.id,
            requestedQuantity: item.requestedQuantity,
            priority: i + 1,
            notes: item.notes,
            status: 'PENDING'
          }
        });
      }

      return requisition;
    });

    console.log(`✅ [REQUISITION API] Created requisition: ${result.id}`);

    return NextResponse.json({
      success: true,
      message: saveAsDraft ? 'บันทึกฉบับร่างสำเร็จ' : 'ส่งใบเบิกสำเร็จ',
      data: result
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [REQUISITION API] POST Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างใบเบิก' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}