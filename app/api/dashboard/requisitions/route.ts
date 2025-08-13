// app/api/dashboard/requisitions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const viewType = searchParams.get('viewType'); // 'incoming' or 'outgoing'

    if (!warehouseId || !viewType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Build where clause based on view type - ใช้ฟิลด์ที่มีจริงใน schema
    const whereClause = {
      hospitalId: session.user.hospitalId,
      ...(viewType === 'incoming' 
        ? { fulfillmentWarehouseId: warehouseId }  // เปลี่ยนจาก targetWarehouseId
        : { requestingDepartmentId: warehouseId }   // หรือใช้ department แทน sourceWarehouse
      )
    };

    const requisitions = await prisma.requisition.findMany({
      where: whereClause,
      include: {
        fulfillmentWarehouse: {  // เปลี่ยนจาก targetWarehouse
          select: {
            id: true,
            name: true,
            warehouseCode: true
          }
        },
        requestingDepartment: {  // เปลี่ยนจาก sourceWarehouse
          select: {
            id: true,
            name: true,
            departmentCode: true
          }
        },
        requester: {  // เปลี่ยนจาก requestedBy
          select: {
            firstName: true,
            lastName: true,
            position: true
          }
        },
        approver: {  // เปลี่ยนจาก approvedBy
          select: {
            firstName: true,
            lastName: true
          }
        },
        items: {
          select: {
            id: true,
            requestedQty: true,
            approvedQty: true,
            fulfilledQty: true,  // เปลี่ยนจาก receivedQty
            status: true,
            requestNotes: true,  // เปลี่ยนจาก notes เป็น requestNotes
            drug: {
              select: {
                hospitalDrugCode: true,
                name: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform data to include computed fields
    const transformedRequisitions = requisitions.map(req => ({
      ...req,
      totalItems: req.items.length,
      completedItems: req.items.filter(item => 
        item.fulfilledQty >= (item.approvedQty || 0)  // จัดการ null
      ).length,
      items: req.items.map(item => ({
        id: item.id,
        drugCode: item.drug.hospitalDrugCode,
        drugName: item.drug.name,
        requestedQuantity: item.requestedQty,
        approvedQuantity: item.approvedQty,
        receivedQuantity: item.fulfilledQty,  // mapping ให้ตรงกับ frontend
        unit: item.drug.unit,
        status: item.status,
        notes: item.requestNotes  // เปลี่ยนเป็น requestNotes
      }))
    }));

    return NextResponse.json(transformedRequisitions);

  } catch (error) {
    console.error('Error loading requisitions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new requisition
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Generate requisition number
    const count = await prisma.requisition.count({
      where: { hospitalId: session.user.hospitalId }
    });
    
    let prefix = '';
    if (data.type === 'EMERGENCY') prefix = 'ฉ';
    else if (data.type === 'SCHEDULED') prefix = 'น';
    else if (data.type === 'RETURN') prefix = 'ค';
    
    const requisitionNumber = `${prefix}${String(count + 1).padStart(6, '0')}`;

    const requisition = await prisma.requisition.create({
      data: {
        requisitionNumber,
        type: data.type || 'REGULAR',
        priority: data.priority || 'NORMAL',
        status: 'SUBMITTED',
        fulfillmentWarehouseId: data.fulfillmentWarehouseId || data.destinationWarehouseId,  // ใช้ฟิลด์ที่ถูกต้อง
        requestingDepartmentId: data.requestingDepartmentId || data.departmentId,  // ใช้ department แทน
        hospitalId: session.user.hospitalId,
        requesterId: session.user.id,  // เปลี่ยนจาก requestedById
        requestedDate: new Date(),
        requiredDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : new Date(),  // เปลี่ยน field name
        requestNotes: data.notes,  // เปลี่ยนเป็น requestNotes
        items: {
          create: data.items.map((item: any) => ({
            drugId: item.drugId,
            requestedQty: item.requestedQuantity,
            approvedQty: item.requestedQuantity,
            fulfilledQty: 0,  // เปลี่ยนจาก receivedQty
            unitCost: item.unitPrice || 0,  // เปลี่ยนจาก unitPrice
            totalCost: (item.requestedQuantity * (item.unitPrice || 0)),  // เปลี่ยนจาก totalPrice
            status: 'PENDING',
            requestNotes: item.notes,  // เปลี่ยนจาก notes
          }))
        }
      },
      include: {
        items: {
          include: {
            drug: true
          }
        }
      }
    });

    // Create workflow entry
    await prisma.requisitionWorkflow.create({
      data: {
        requisitionId: requisition.id,
        action: 'CREATE',
        userId: session.user.id,  // เปลี่ยนจาก performedById
        processedAt: new Date(),  // เปลี่ยนจาก performedDate
        fromStatus: 'DRAFT',
        toStatus: 'SUBMITTED',
        comments: 'ใบเบิกถูกสร้างและส่งเข้าระบบ'  // เปลี่ยนจาก notes
      }
    });

    return NextResponse.json(requisition);
  } catch (error) {
    console.error('Error creating requisition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}