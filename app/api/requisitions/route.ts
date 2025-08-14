// app/api/requisitions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateUserAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Simple validation schemas
const createRequisitionSchema = z.object({
  requisitionNumber: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  type: z.enum(['REGULAR', 'EMERGENCY', 'SCHEDULED', 'RETURN']).default('REGULAR'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  requiredDate: z.string().transform(str => new Date(str)),
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
      take: 50 // จำกัด 50 รายการ
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
      name,
      purpose,
      type,
      priority,
      requiredDate,
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

    // สร้างใบเบิกในฐานข้อมูล (แบบง่าย)
    const requisition = await prisma.requisition.create({
      data: {
        hospitalId: user.hospitalId,
        requisitionNumber,
        name,
        purpose,
        type,
        priority,
        status: saveAsDraft ? 'DRAFT' : 'SUBMITTED',
        requestedDate: new Date(),
        requiredDate,
        requesterId: user.userId,
        requestingDepartmentId: user.hospitalId, // ใช้ hospitalId ชั่วคราว
        fulfillmentWarehouseId,
        notes
      }
    });

    // สร้างรายการยา
    const itemPromises = items.map((item, index) =>
      prisma.requisitionItem.create({
        data: {
          requisitionId: requisition.id,
          drugId: item.drugId,
          requestedQty: item.requestedQuantity,
          approvedQty: 0,
          dispensedQty: 0,
          unit: 'unit', // ค่าเริ่มต้น
          notes: item.notes,
          orderIndex: index + 1
        }
      })
    );

    await Promise.all(itemPromises);

    console.log(`✅ [REQUISITION API] Created requisition: ${requisition.id}`);

    return NextResponse.json({
      success: true,
      message: saveAsDraft ? 'บันทึกฉบับร่างสำเร็จ' : 'ส่งใบเบิกสำเร็จ',
      data: requisition
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