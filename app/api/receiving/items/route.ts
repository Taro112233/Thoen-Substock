// app/api/receiving/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.hospitalId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      // Get requisition item with full details
      const requisitionItem = await tx.requisitionItem.findUnique({
        where: { id: data.requisitionItemId },
        include: {
          requisition: true,
          drug: true
        }
      });

      if (!requisitionItem) {
        throw new Error('Requisition item not found');
      }

      // Get or create stock card for this drug and warehouse
      let stockCard = await tx.stockCard.findFirst({
        where: {
          drugId: requisitionItem.drugId,
          warehouseId: requisitionItem.requisition.fulfillmentWarehouseId  // เปลี่ยนจาก targetWarehouseId
        }
      });

      if (!stockCard) {
        // Generate unique card number
        const cardCount = await tx.stockCard.count({
          where: { hospitalId: session.user.hospitalId }
        });
        const cardNumber = `SC${String(cardCount + 1).padStart(8, '0')}`;

        stockCard = await tx.stockCard.create({
          data: {
            cardNumber,  // เพิ่ม field ที่จำเป็น
            hospitalId: session.user.hospitalId,
            warehouseId: requisitionItem.requisition.fulfillmentWarehouseId,
            drugId: requisitionItem.drugId,
            currentStock: 0,
            minStock: 10,  // ค่าเริ่มต้น
            maxStock: 1000,  // ค่าเริ่มต้น
            reorderPoint: 20,  // ค่าเริ่มต้น
            reservedStock: 0,
            averageCost: Number(requisitionItem.unitCost) || 0,
            totalValue: 0,
            lowStockAlert: false
          }
        });
      }

      // Create or update stock batch
      let stockBatch = await tx.stockBatch.findFirst({
        where: {
          stockCardId: stockCard.id,
          batchNumber: data.batchNumber,
          expiryDate: new Date(data.expiryDate)
        }
      });

      if (!stockBatch) {
        stockBatch = await tx.stockBatch.create({
          data: {
            hospitalId: session.user.hospitalId,
            stockCardId: stockCard.id,
            batchNumber: data.batchNumber,
            expiryDate: new Date(data.expiryDate),
            manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : null,
            receivedDate: new Date(),
            currentQty: data.quantityReceived,
            initialQty: data.quantityReceived,  // เพิ่ม field ที่จำเป็น
            reservedQty: 0,
            availableQty: data.quantityReceived,  // เพิ่ม field ที่จำเป็น
            supplierId: data.supplierId || null,
            // ลบ supplier field ที่ไม่มีใน schema
          }
        });
      } else {
        // Update existing batch
        stockBatch = await tx.stockBatch.update({
          where: { id: stockBatch.id },
          data: {
            currentQty: { increment: data.quantityReceived },
            availableQty: { increment: data.quantityReceived }
          }
        });
      }

      // Update stock card
      const updatedStockCard = await tx.stockCard.update({
        where: { id: stockCard.id },
        data: {
          currentStock: { increment: data.quantityReceived },
          totalValue: { increment: Number(requisitionItem.unitCost || 0) * data.quantityReceived },
          reservedStock: { 
            decrement: Math.min(data.quantityReceived, 
              (requisitionItem.approvedQty || 0) - requisitionItem.fulfilledQty) 
          }
        }
      });

      // Create stock transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          hospitalId: session.user.hospitalId,
          warehouseId: requisitionItem.requisition.fulfillmentWarehouseId,
          drugId: requisitionItem.drugId,
          stockCardId: stockCard.id,
          batchId: stockBatch.id,
          transactionType: 'RECEIVE',
          quantity: data.quantityReceived,
          stockBefore: stockCard.currentStock,
          stockAfter: stockCard.currentStock + data.quantityReceived,
          unitCost: Number(requisitionItem.unitCost || 0),
          totalCost: Number(requisitionItem.unitCost || 0) * data.quantityReceived,
          performedBy: session.user.id,
          referenceDocument: requisitionItem.requisition.requisitionNumber,
          referenceId: requisitionItem.requisitionId,
          notes: data.notes
        }
      });

      // Update requisition item
      const updatedRequisitionItem = await tx.requisitionItem.update({
        where: { id: data.requisitionItemId },
        data: {
          fulfilledQty: { increment: data.quantityReceived },  // เปลี่ยนจาก receivedQty
          status: (requisitionItem.fulfilledQty + data.quantityReceived) >= (requisitionItem.approvedQty || 0)
            ? 'COMPLETED' 
            : 'PARTIALLY_FILLED'
        }
      });

      // Check if all items are received
      const allItems = await tx.requisitionItem.findMany({
        where: { requisitionId: requisitionItem.requisitionId }
      });

      const allCompleted = allItems.every(item => 
        item.fulfilledQty >= (item.approvedQty || 0)
      );

      if (allCompleted) {
        await tx.requisition.update({
          where: { id: requisitionItem.requisitionId },
          data: {
            status: 'COMPLETED',
            fulfilledDate: new Date()  // เปลี่ยนจาก completedDate
          }
        });

        await tx.requisitionWorkflow.create({
          data: {
            requisitionId: requisitionItem.requisitionId,
            action: 'COMPLETE',
            userId: session.user.id,
            processedAt: new Date(),
            fromStatus: 'PARTIALLY_FILLED',
            toStatus: 'COMPLETED',
            comments: 'รับสินค้าครบทุกรายการ'
          }
        });
      } else {
        const anyReceived = allItems.some(item => item.fulfilledQty > 0);
        if (anyReceived && requisitionItem.requisition.status !== 'PARTIALLY_FILLED') {
          await tx.requisition.update({
            where: { id: requisitionItem.requisitionId },
            data: { status: 'PARTIALLY_FILLED' }
          });

          await tx.requisitionWorkflow.create({
            data: {
              requisitionId: requisitionItem.requisitionId,
              action: 'FULFILL',  // เปลี่ยนจาก RECEIVE
              userId: session.user.id,
              processedAt: new Date(),
              fromStatus: requisitionItem.requisition.status,
              toStatus: 'PARTIALLY_FILLED',
              comments: `รับ ${requisitionItem.drug.name} จำนวน ${data.quantityReceived}`
            }
          });
        }
      }

      // If not fully received and createEmergencyRequisition is true, create emergency requisition
      const remainingQty = (requisitionItem.approvedQty || 0) - 
                          (requisitionItem.fulfilledQty + data.quantityReceived);
      
      if (remainingQty > 0 && data.createEmergencyRequisition) {
        const emergencyRequisition = await tx.requisition.create({
          data: {
            requisitionNumber: `ฉ${requisitionItem.requisition.requisitionNumber}`,
            type: 'EMERGENCY',
            priority: 'HIGH',
            status: 'SUBMITTED',
            fulfillmentWarehouseId: requisitionItem.requisition.fulfillmentWarehouseId,
            requestingDepartmentId: requisitionItem.requisition.requestingDepartmentId,
            hospitalId: session.user.hospitalId,
            requesterId: session.user.id,
            requestedDate: new Date(),
            requiredDate: new Date(),
            requestNotes: `สร้างอัตโนมัติ: ได้รับ ${data.quantityReceived} จาก ${requisitionItem.approvedQty} ${requisitionItem.drug.unit}`,
            items: {
              create: {
                drugId: requisitionItem.drugId,
                requestedQty: remainingQty,
                approvedQty: remainingQty,
                fulfilledQty: 0,
                unitCost: requisitionItem.unitCost,
                totalCost: Number(requisitionItem.unitCost || 0) * remainingQty,
                status: 'PENDING',
                requestNotes: `ได้รับไม่ครบจากใบเบิกเดิม`
              }
            }
          }
        });

        // Create workflow for emergency requisition
        await tx.requisitionWorkflow.create({
          data: {
            requisitionId: emergencyRequisition.id,
            action: 'CREATE',
            userId: session.user.id,
            processedAt: new Date(),
            fromStatus: 'DRAFT',
            toStatus: 'SUBMITTED',
            comments: 'สร้างใบเบิกฉุกเฉินอัตโนมัติเนื่องจากได้รับสินค้าไม่ครบ'
          }
        });
      }

      // Create audit log - แก้ไข enum
      await tx.auditLog.create({
        data: {
          hospitalId: session.user.hospitalId,
          userId: session.user.id,
          action: 'UPDATE',  // ใช้ enum ที่มีอยู่
          entityType: 'RequisitionItem',
          entityId: data.requisitionItemId,
          description: `รับ ${requisitionItem.drug.name} จำนวน ${data.quantityReceived} ${requisitionItem.drug.unit}`,
          newValues: {
            requisitionNumber: requisitionItem.requisition.requisitionNumber,
            drugName: requisitionItem.drug.name,
            quantityReceived: data.quantityReceived,
            batchNumber: data.batchNumber,
            expiryDate: data.expiryDate
          }
        }
      });

      return transaction;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error receiving item:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message ? 400 : 500 }
    );
  }
}