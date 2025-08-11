// prisma/seeds/real-drugs.seed.ts - Real Drug Data for Hospital 1 Only
import { PrismaClient } from "@prisma/client";

export async function seedBulkRealDrugs(
  prisma: PrismaClient, 
  hospitals: any[], 
  masterData: any
) {
  console.log("💊 Creating Real Drug Data for โรงพยาบาลลำปาง...");

  const hospital1 = hospitals[0]; // โรงพยาบาลลำปาง only
  
  // Real drug data from the provided table
  const realDrugs = [
    {
      hospitalDrugCode: "1670056",
      name: "Ursodeoxycholic acid",
      genericName: "Ursodeoxycholic acid",
      brandName: "Ursodeoxycholic acid",
      dosageForm: "TAB",
      strength: "250",
      unit: "mg",
      // ลบ description และใช้ notes แทน
      notes: "250 mg tablet",
      hospitalId: hospital1.id,
      // Stock information
      currentStock: 2,
      packageSize: 100,
      pricePerBox: 650.00,
      expiryDate: "2028-05-10", // 10-พ.ค.-28
      totalValue: 1300.00,
      // Additional fields
      isActive: true,
      requiresPrescription: true,
      isControlled: false,
      isNarcotic: false,
      isHighAlert: false,
      isDangerous: true, // ยาอันตราย
    },
    {
      hospitalDrugCode: "1670065",
      name: "Alteplase(Actilyse)",
      genericName: "Alteplase",
      brandName: "Actilyse",
      dosageForm: "INJ",
      strength: "50",
      unit: "ml",
      notes: "50 ml injection",
      hospitalId: hospital1.id,
      // Stock information
      currentStock: 2,
      packageSize: 1,
      pricePerBox: 20865.00,
      expiryDate: "2026-08-31", // 31-ส.ค.-26
      totalValue: 41730.00,
      // Additional fields
      isActive: true,
      requiresPrescription: true,
      isControlled: false,
      isNarcotic: false,
      isHighAlert: true, // High Alert Drug
      isDangerous: false,
    },
    {
      hospitalDrugCode: "1670072",
      name: "clarithromycin",
      genericName: "clarithromycin",
      brandName: "clarithromycin",
      dosageForm: "TAB",
      strength: "500",
      unit: "mg",
      notes: "500 mg tablet",
      hospitalId: hospital1.id,
      // Stock information
      currentStock: 7,
      packageSize: 100,
      pricePerBox: 900.00,
      expiryDate: "2027-04-29", // 29-เม.ย.-27
      totalValue: 6300.00,
      // Additional fields
      isActive: true,
      requiresPrescription: true,
      isControlled: false,
      isNarcotic: false,
      isHighAlert: false,
      isDangerous: true, // ยาอันตราย
    }
  ];

  const createdRealDrugs = [];
  
  for (const drug of realDrugs) {
    // Create the drug first
    const { currentStock, packageSize, pricePerBox, expiryDate, totalValue, ...drugData } = drug;
    
    const createdDrug = await prisma.drug.upsert({
      where: {
        hospitalId_hospitalDrugCode: {
          hospitalId: drug.hospitalId,
          hospitalDrugCode: drug.hospitalDrugCode
        }
      },
      update: {},
      create: drugData
    });
    
    // Find main warehouse for this hospital
    const mainWarehouse = await prisma.warehouse.findFirst({
      where: {
        hospitalId: hospital1.id,
        warehouseCode: "MAIN"
      }
    });

    // Create stock card if warehouse exists
    if (mainWarehouse) {
      const stockCard = await prisma.stockCard.upsert({
        where: {
          id: `${hospital1.id}-${mainWarehouse.id}-${createdDrug.id}`
        },
        update: {},
        create: {
          cardNumber: `SC-REAL-${drug.hospitalDrugCode}`,
          hospitalId: hospital1.id,
          warehouseId: mainWarehouse.id,
          drugId: createdDrug.id,
          currentStock: currentStock,
          reservedStock: 0,
          availableStock: currentStock,
          minStock: Math.floor(currentStock / 2), // Set min stock as half of current
          maxStock: currentStock * 5, // Set max stock as 5x current
          reorderPoint: Math.floor(currentStock * 0.3), // Reorder at 30% of current
          averageCost: pricePerBox / packageSize, // Cost per unit
          totalValue: totalValue,
          isActive: true,
        }
      });

      // Create batch/lot information - แก้ไขตรงนี้
      await prisma.stockBatch.upsert({
        where: {
          id: `${createdDrug.id}-${expiryDate.replace(/-/g, '')}`
        },
        update: {},
        create: {
          hospitalId: hospital1.id, // เพิ่มฟิลด์นี้ตาม schema
          stockCardId: stockCard.id,
          batchNumber: `BATCH-${drug.hospitalDrugCode}-${expiryDate.replace(/-/g, '')}`,
          expiryDate: new Date(expiryDate),
          // ใช้ฟิลด์ที่ถูกต้องตาม schema
          initialQty: currentStock * packageSize, // จำนวนเริ่มต้น
          currentQty: currentStock * packageSize, // จำนวนปัจจุบัน
          reservedQty: 0, // จำนวนที่จอง
          availableQty: currentStock * packageSize, // จำนวนที่พร้อมใช้
          // ข้อมูลการซื้อ
          supplierId: null, // Will be set when supplier system is implemented
          purchaseOrderId: null,
          invoiceNo: null,
          // วันที่สำคัญ
          receivedDate: new Date(), // วันที่รับเข้า (วันนี้)
          firstUsedDate: null,
          // สถานะ
          status: "ACTIVE",
          // การตรวจสอบคุณภาพ
          qcStatus: "PASSED",
          qcDate: new Date(),
          qcNotes: `Package size: ${packageSize} units`,
          // การจัดเก็บ
          storageLocation: "A001", // ตำแหน่งเก็บตัวอย่าง
          storageCondition: "ROOM_TEMPERATURE", // เงื่อนไขการเก็บ
        }
      });
    }

    createdRealDrugs.push(createdDrug);
    console.log(`  ✅ ${createdDrug.name} (${createdDrug.hospitalDrugCode}) - ${currentStock} กล่อง`);
  }

  console.log(`✅ Successfully created ${createdRealDrugs.length} real drugs for โรงพยาบาลลำปาง`);
  console.log(`💰 Total inventory value: ${realDrugs.reduce((sum, drug) => sum + drug.totalValue, 0).toLocaleString()} บาท`);
  
  return createdRealDrugs;
}