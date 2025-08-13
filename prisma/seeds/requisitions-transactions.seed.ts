// prisma/seeds/requisitions-transactions.seed.ts
// ระบบ Seed สำหรับการเบิกจ่ายยาและรายการเคลื่อนไหว (Schema-Perfect Version)
// Requisition & Transaction Management Seed - Perfect Schema Match

import { PrismaClient } from "@prisma/client";

export async function seedRequisitionsAndTransactions(
  prisma: PrismaClient,
  hospitals: any[],
  devUser: any
) {
  console.log("🎯 Creating requisitions and transactions seed data...");

  for (const hospital of hospitals) {
    console.log(`📋 Processing hospital: ${hospital.name}`);

    // 1. ดึงข้อมูลพื้นฐานที่จำเป็น
    const departments = await prisma.department.findMany({
      where: { hospitalId: hospital.id },
      take: 5
    });

    const warehouses = await prisma.warehouse.findMany({
      where: { hospitalId: hospital.id },
      include: { stockCards: { include: { drug: true } } }
    });

    const users = await prisma.user.findMany({
      where: { hospitalId: hospital.id },
      include: { personnelType: true }
    });

    // แยก users ตามบทบาท
    const pharmacyManager = users.find(u => u.role === 'PHARMACY_MANAGER');
    const seniorPharmacist = users.find(u => u.role === 'SENIOR_PHARMACIST');
    const staffPharmacist = users.find(u => u.role === 'STAFF_PHARMACIST');
    const departmentHead = users.find(u => u.role === 'DEPARTMENT_HEAD');
    const staffNurse = users.find(u => u.role === 'STAFF_NURSE');
    const pharmacyTechnician = users.find(u => u.role === 'PHARMACY_TECHNICIAN');

    if (!pharmacyManager || !seniorPharmacist || !staffPharmacist || !departmentHead) {
      console.log(`⚠️  Missing required users for ${hospital.name}, skipping...`);
      continue;
    }

    // 2. สร้างใบเบิกหลากหลายสถานะ
    const requisitionTemplates = [
      {
        type: 'REGULAR',
        priority: 'NORMAL',
        status: 'COMPLETED',
        description: 'การเบิกยาประจำเดือนแผนกอายุรกรรม',
        requester: staffNurse || departmentHead,
        approver: departmentHead,
        fulfiller: staffPharmacist,
        receiver: staffNurse || departmentHead,
        department: departments[0],
        daysAgo: 7
      },
      {
        type: 'EMERGENCY',
        priority: 'URGENT',
        status: 'COMPLETED',
        description: 'การเบิกยาฉุกเฉินแผนกอุบัติเหตุ',
        requester: departmentHead,
        approver: pharmacyManager,
        fulfiller: seniorPharmacist,
        receiver: departmentHead,
        department: departments[1] || departments[0],
        daysAgo: 3
      },
      {
        type: 'REGULAR',
        priority: 'HIGH',
        status: 'APPROVED',
        description: 'การเบิกยาแผนกศัลยกรรม',
        requester: staffNurse || departmentHead,
        approver: departmentHead,
        fulfiller: null, // ยังไม่ได้จ่าย
        receiver: null,
        department: departments[2] || departments[0],
        daysAgo: 1
      },
      {
        type: 'SCHEDULED',
        priority: 'NORMAL',
        status: 'UNDER_REVIEW',
        description: 'การเบิกยาตามตารางแผนกกุมารเวชกรรม',
        requester: departmentHead,
        approver: null, // ยังไม่ได้อนุมัติ
        fulfiller: null,
        receiver: null,
        department: departments[3] || departments[0],
        daysAgo: 0
      },
      {
        type: 'RETURN',
        priority: 'LOW',
        status: 'DRAFT',
        description: 'การส่งคืนยาหมดอายุแผนกสูติกรรม',
        requester: staffNurse || departmentHead,
        approver: null,
        fulfiller: null,
        receiver: null,
        department: departments[4] || departments[0],
        daysAgo: 0
      }
    ];

    for (let i = 0; i < requisitionTemplates.length; i++) {
      const template = requisitionTemplates[i];
      // Fixed: ใช้ warehouse type ที่ถูกต้องตาม WarehouseType enum
      const centralWarehouse = warehouses.find(w => 
        w.type === 'CENTRAL' || w.type === 'DEPARTMENT' || w.type === 'DISPENSING'
      );
      
      if (!centralWarehouse || !template.department) continue;

      // คำนวณวันที่
      const requestedDate = new Date();
      requestedDate.setDate(requestedDate.getDate() - template.daysAgo);
      
      const requiredDate = new Date(requestedDate);
      requiredDate.setDate(requiredDate.getDate() + 2);

      // สร้างใบเบิก - ใช้เฉพาะ fields ที่มีใน schema จริง
      const requisition = await prisma.requisition.create({
        data: {
          // ข้อมูลพื้นฐาน
          hospitalId: hospital.id,
          requestingDepartmentId: template.department.id,
          fulfillmentWarehouseId: centralWarehouse.id,
          requisitionNumber: `REQ-${hospital.hospitalCode}-${Date.now()}-${i + 1}`,
          type: template.type as any,
          status: template.status as any,
          priority: template.priority as any,
          
          // วันที่
          requestedDate,
          requiredDate,
          approvedDate: template.status === 'COMPLETED' || template.status === 'APPROVED' 
            ? new Date(requestedDate.getTime() + 2 * 60 * 60 * 1000) // 2 ชั่วโมงหลัง
            : null,
          fulfilledDate: template.status === 'COMPLETED' 
            ? new Date(requestedDate.getTime() + 4 * 60 * 60 * 1000) // 4 ชั่วโมงหลัง
            : null,

          // ผู้รับผิดชอบ (ใช้เฉพาะ field ที่มี)
          requesterId: template.requester.id,
          approverId: template.approver?.id,
          fulfillerId: template.fulfiller?.id,

          // หมายเหตุ (ใช้เฉพาะ field ที่มีใน schema)
          requestNotes: template.description,
          approvalNotes: template.status === 'COMPLETED' || template.status === 'APPROVED' 
            ? 'อนุมัติตามความเหมาะสม' 
            : null,
          fulfillmentNotes: template.status === 'COMPLETED' 
            ? 'จ่ายยาครบถ้วนตามรายการ' 
            : null,

          // สถานะและการติดตาม
          isUrgent: template.priority === 'URGENT',
          
          // Audit (ใช้เฉพาะ timestamp fields)
          createdAt: requestedDate,
          updatedAt: template.status === 'COMPLETED' 
            ? new Date(requestedDate.getTime() + 5 * 60 * 60 * 1000)
            : requestedDate
        }
      });

      // 3. สร้างรายการยาในใบเบิก
      const availableStockCards = centralWarehouse.stockCards.slice(0, Math.max(2, Math.floor(Math.random() * 5) + 1));
      
      for (let j = 0; j < availableStockCards.length; j++) {
        const stockCard = availableStockCards[j];
        const requestedQty = Math.floor(Math.random() * 20) + 5; // 5-24 หน่วย
        const approvedQty = template.status === 'COMPLETED' || template.status === 'APPROVED' 
          ? Math.max(1, requestedQty - Math.floor(Math.random() * 3)) // อนุมัติไม่เกินที่เบิก
          : null;
        const fulfilledQty = template.status === 'COMPLETED' 
          ? (approvedQty || 0)
          : 0;

        // สร้าง RequisitionItem ด้วย fields ที่ถูกต้อง
        await prisma.requisitionItem.create({
          data: {
            requisitionId: requisition.id,
            drugId: stockCard.drugId || stockCard.drug?.id || '',
            stockCardId: stockCard.id,
            
            // จำนวน (ใช้ field names ที่ถูกต้องตาม schema)
            requestedQty: requestedQty,
            approvedQty: approvedQty,
            fulfilledQty: fulfilledQty,
            
            // ราคา (ใช้ field ที่มีใน schema)
            unitCost: 150.00 + Math.random() * 500,
            totalCost: approvedQty ? (approvedQty * (150.00 + Math.random() * 500)) : 0,
            
            // สถานะ
            status: template.status === 'COMPLETED' ? 'COMPLETED' :
                   template.status === 'APPROVED' ? 'APPROVED' :
                   template.status === 'UNDER_REVIEW' ? 'PENDING' : 'PENDING',
            
            // หมายเหตุ (ใช้ field ที่มีใน schema)
            requestNotes: j === 0 ? `หมายเหตุ: ${template.description}` : null,
            approvalNotes: approvedQty ? 'อนุมัติตามที่เบิก' : null,
            fulfillmentNotes: fulfilledQty > 0 ? 'จ่ายครบถ้วน' : null,
            
            // วันที่
            createdAt: requestedDate,
            updatedAt: template.status === 'COMPLETED' 
              ? new Date(requestedDate.getTime() + 4 * 60 * 60 * 1000)
              : requestedDate
          }
        });

        // 4. สร้าง Stock Transaction หากจ่ายยาแล้ว
        if (template.status === 'COMPLETED' && fulfilledQty > 0) {
          await prisma.stockTransaction.create({
            data: {
              hospitalId: hospital.id,
              stockCardId: stockCard.id,
              drugId: stockCard.drugId || stockCard.drug?.id || '',
              warehouseId: centralWarehouse.id,
              
              // ประเภทธุรกรรม
              transactionType: 'DISPENSE',
              
              // จำนวนและมูลค่า
              quantity: -fulfilledQty, // ลบออกจากสต็อก
              unitCost: Number(stockCard.averageCost) || 100,
              totalCost: (Number(stockCard.averageCost) || 100) * fulfilledQty,
              
              // ยอดคงเหลือ
              stockBefore: (stockCard.currentStock || 100),
              stockAfter: Math.max(0, (stockCard.currentStock || 100) - fulfilledQty),
              
              // เอกสารอ้างอิง
              referenceDocument: requisition.requisitionNumber,
              referenceId: requisition.id,
              
              // ผู้ดำเนินการ
              performedBy: template.fulfiller!.id,
              
              // รายละเอียด
              notes: `จ่ายยาตามใบเบิก ${requisition.requisitionNumber}`,
              
              // วันที่
              createdAt: new Date(requestedDate.getTime() + 4 * 60 * 60 * 1000)
            }
          });

          // 5. สร้าง Workflow History ด้วย field names ที่ถูกต้อง
          const workflowSteps = [
            {
              fromStatus: null as any,
              toStatus: 'DRAFT' as any,
              action: 'CREATE' as any,
              actor: template.requester,
              comments: 'สร้างใบเบิกใหม่',
              timestamp: requestedDate
            },
            {
              fromStatus: 'DRAFT' as any,
              toStatus: 'SUBMITTED' as any,
              action: 'SUBMIT' as any,
              actor: template.requester,
              comments: 'ส่งใบเบิกเพื่อขออนุมัติ',
              timestamp: new Date(requestedDate.getTime() + 30 * 60 * 1000)
            },
            {
              fromStatus: 'SUBMITTED' as any,
              toStatus: 'APPROVED' as any,
              actor: template.approver!,
              action: 'APPROVE' as any,
              comments: 'อนุมัติใบเบิก',
              timestamp: new Date(requestedDate.getTime() + 2 * 60 * 60 * 1000)
            },
            {
              fromStatus: 'APPROVED' as any,
              toStatus: 'COMPLETED' as any,
              actor: template.fulfiller!,
              action: 'FULFILL' as any,
              comments: 'จ่ายยาเสร็จสิ้น',
              timestamp: new Date(requestedDate.getTime() + 4 * 60 * 60 * 1000)
            }
          ];

          for (const step of workflowSteps) {
            await prisma.requisitionWorkflow.create({
              data: {
                requisitionId: requisition.id,
                fromStatus: step.fromStatus,
                toStatus: step.toStatus,
                action: step.action,
                // Fixed: ใช้ userId แทน actionBy ตาม schema
                userId: step.actor.id,
                comments: step.comments,
                processedAt: step.timestamp
              }
            });
          }
        } else if (template.status === 'APPROVED') {
          // สร้าง workflow สำหรับใบเบิกที่อนุมัติแล้ว
          const workflowSteps = [
            {
              fromStatus: null as any,
              toStatus: 'DRAFT' as any,
              action: 'CREATE' as any,
              actor: template.requester,
              comments: 'สร้างใบเบิกใหม่',
              timestamp: requestedDate
            },
            {
              fromStatus: 'DRAFT' as any,
              toStatus: 'SUBMITTED' as any,
              action: 'SUBMIT' as any,
              actor: template.requester,
              comments: 'ส่งใบเบิกเพื่อขออนุมัติ',
              timestamp: new Date(requestedDate.getTime() + 30 * 60 * 1000)
            },
            {
              fromStatus: 'SUBMITTED' as any,
              toStatus: 'APPROVED' as any,
              actor: template.approver!,
              action: 'APPROVE' as any,
              comments: 'อนุมัติใบเบิก รอการจ่ายยา',
              timestamp: new Date(requestedDate.getTime() + 2 * 60 * 60 * 1000)
            }
          ];

          for (const step of workflowSteps) {
            await prisma.requisitionWorkflow.create({
              data: {
                requisitionId: requisition.id,
                fromStatus: step.fromStatus,
                toStatus: step.toStatus,
                action: step.action,
                userId: step.actor.id,
                comments: step.comments,
                processedAt: step.timestamp
              }
            });
          }
        } else if (template.status === 'UNDER_REVIEW') {
          // สร้าง workflow สำหรับใบเบิกที่ส่งแล้ว
          const workflowSteps = [
            {
              fromStatus: null as any,
              toStatus: 'DRAFT' as any,
              action: 'CREATE' as any,
              actor: template.requester,
              comments: 'สร้างใบเบิกใหม่',
              timestamp: requestedDate
            },
            {
              fromStatus: 'DRAFT' as any,
              toStatus: 'SUBMITTED' as any,
              action: 'SUBMIT' as any,
              actor: template.requester,
              comments: 'ส่งใบเบิกเพื่อขออนุมัติ รอการตรวจสอบ',
              timestamp: new Date(requestedDate.getTime() + 30 * 60 * 1000)
            }
          ];

          for (const step of workflowSteps) {
            await prisma.requisitionWorkflow.create({
              data: {
                requisitionId: requisition.id,
                fromStatus: step.fromStatus,
                toStatus: step.toStatus,
                action: step.action,
                userId: step.actor.id,
                comments: step.comments,
                processedAt: step.timestamp
              }
            });
          }
        }
      }

      // 6. อัปเดตสรุปใบเบิก
      const items = await prisma.requisitionItem.findMany({
        where: { requisitionId: requisition.id }
      });

      const totalItems = items.length;
      const totalRequestedQty = items.reduce((sum, item) => sum + item.requestedQty, 0);
      const totalApprovedQty = items.reduce((sum, item) => sum + (item.approvedQty || 0), 0);
      const totalFulfilledQty = items.reduce((sum, item) => sum + item.fulfilledQty, 0);
      const actualValue = items.reduce((sum, item) => sum + Number(item.totalCost || 0), 0);

      await prisma.requisition.update({
        where: { id: requisition.id },
        data: {
          totalItems,
          totalRequestedQty,
          totalApprovedQty,
          totalFulfilledQty,
          estimatedValue: actualValue * 0.9,
          actualValue
        }
      });

      console.log(`  ✅ Created requisition: ${requisition.requisitionNumber} (${template.status})`);
    }

    // 7. สร้าง Template สำหรับการเบิกประจำ
    for (let i = 0; i < 3; i++) {
      const department = departments[i % departments.length];
      const creator = departmentHead;
      
      if (!department || !creator) continue;

      const template = await prisma.requisitionTemplate.create({
        data: {
          hospitalId: hospital.id,
          departmentId: department.id,
          createdBy: creator.id,
          templateName: `เทมเพลตเบิกยาประจำ - ${department.name}`,
          description: `รายการยาที่ใช้บ่อยสำหรับแผนก ${department.name}`,
          type: 'REGULAR',
          priority: 'NORMAL',
          isRecurring: true,
          recurringPattern: 'MONTHLY',
          items: JSON.stringify([
            { drugId: warehouses[0]?.stockCards[0]?.drugId, requestedQty: 10, notes: 'ยาพื้นฐาน' },
            { drugId: warehouses[0]?.stockCards[1]?.drugId, requestedQty: 5, notes: 'ยาฉุกเฉิน' }
          ].filter(item => item.drugId)),
          isActive: true,
          usageCount: Math.floor(Math.random() * 10),
          lastUsedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null
        }
      });

      console.log(`  ✅ Created template: ${template.templateName}`);
    }
  }

  console.log("🎉 Requisitions and transactions seed completed!");
  
  // 8. สร้างสถิติสรุป
  const totalRequisitions = await prisma.requisition.count();
  const completedRequisitions = await prisma.requisition.count({
    where: { status: 'COMPLETED' }
  });
  const totalTransactions = await prisma.stockTransaction.count({
    where: { transactionType: 'DISPENSE' }
  });
  const totalTemplates = await prisma.requisitionTemplate.count();

  console.log(`
📊 REQUISITION SEED SUMMARY (Schema-Perfect):
✅ Total Requisitions Created: ${totalRequisitions}
✅ Completed Requisitions: ${completedRequisitions}
✅ Stock Transactions: ${totalTransactions}
✅ Templates Created: ${totalTemplates}

🔧 Schema Alignment Fixed:
✅ RequisitionWorkflow.userId (not actionBy)
✅ RequisitionWorkflow.comments (not notes)
✅ RequisitionWorkflow.processedAt (not actionAt)
✅ RequisitionItem.drugId added
✅ RequisitionItem field names corrected
✅ Requisition field cleanup completed

🎯 System Ready For Testing:
- Multi-stage requisition workflow
- Real-time stock transactions
- Complete audit trail
- Multi-role user management
- Template-based recurring orders
  `);

  return {
    totalRequisitions,
    completedRequisitions,
    totalTransactions,
    totalTemplates
  };
}