// prisma/seeds/robust-bulk-drugs.seed.ts - Enhanced with Package Pricing
// เพิ่มการคำนวณและเก็บราคาระดับ package

import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';

interface BulkDrugInput {
  hospitalDrugCode: string;
  name: string;
  genericName: string;
  dosageForm: string;
  strength?: string | null;
  unit?: string | null;
  currentStock: number;
  packageSize: number;
  pricePerBox: number;
  expiryDate: string;
  category: "MODERN" | "HERBAL" | "HIGH_ALERT" | "REFER";
  requiresPrescription: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  brandName?: string;
  indication?: string;
  notes?: string;
}

// 🆕 Helper Functions สำหรับ Package Management
function getPackageUnit(dosageForm: string, unit: string | null): string {
  const packageUnits: Record<string, string> = {
    "TAB": "tablets",
    "CAP": "capsules", 
    "INJ": "vials",
    "AMP": "ampoules",
    "BAG": "bags",
    "LVP": "bags",
    "POW": "sachets",
    "SAC": "sachets",
    "CRE": "tubes",
    "OIN": "tubes",
    "GEL": "tubes",
    "SYR": "bottles",
    "LIQ": "bottles",
    "SOL": "bottles",
    "SUSP": "bottles",
    "DROPS": "bottles",
    "SPRAY": "bottles"
  };
  
  return packageUnits[dosageForm] || "units";
}

function calculatePackagePricing(pricePerBox: number, packageSize: number) {
  const unitCost = pricePerBox / packageSize;  // ต้นทุนต่อหน่วย
  const packageCost = pricePerBox;             // ต้นทุนต่อแพ็ค (เท่ากับ pricePerBox)
  
  return {
    unitCost,      // ราคาต่อหน่วย
    packageCost    // ราคาต่อแพ็ค
  };
}

export async function seedBulkRealDrugs(
  prisma: PrismaClient, 
  hospitals: any[], 
  masterData: any,
  warehouses?: Record<string, any[]>
) {
  console.log("💊 Creating Enhanced Bulk Drug Data with Package Pricing...");
  console.log("🏪 All drugs stored in คลังยาหลัก (MAIN warehouse)");
  console.log("📦 Enhanced with package-level pricing calculations");

  const hospital = hospitals[0]; // โรงพยาบาลเถิน
  const BATCH_SIZE = 25;
  let totalProcessed = 0;
  let totalValue = 0;
  let totalPackages = 0;

  // Find or create main warehouse
  let mainWarehouse;
  
  if (warehouses && warehouses[hospital.id]) {
    mainWarehouse = warehouses[hospital.id].find(w => w.warehouseCode === "MAIN");
    console.log("🏪 Found คลังยาหลัก from parameter");
  }
  
  if (!mainWarehouse) {
    mainWarehouse = await prisma.warehouse.findFirst({
      where: {
        hospitalId: hospital.id,
        warehouseCode: "MAIN"
      }
    });
    console.log("🏪 Found คลังยาหลัก from database");
  }

  if (!mainWarehouse) {
    console.log("🏪 Creating คลังยาหลัก...");
    try {
      mainWarehouse = await prisma.warehouse.create({
        data: {
          name: "คลังยาหลัก",
          warehouseCode: "MAIN",
          type: "CENTRAL",
          location: "ชั้น 1 อาคารเภสัชกรรม",
          description: "คลังยาหลักของโรงพยาบาลเถิน",
          capacity: 5000,
          isActive: true,
          hospitalId: hospital.id,
        }
      });
      console.log("✅ Created คลังยาหลัก successfully");
    } catch (error) {
      console.error("❌ Failed to create คลังยาหลัก:", error);
      throw new Error("❌ Cannot create main warehouse for drug processing");
    }
  }

  console.log(`🏪 Using warehouse: ${mainWarehouse.name} (${mainWarehouse.warehouseCode})`);

  // Load and process drug data
  let bulkDrugs: BulkDrugInput[] = [];
  
  try {
    bulkDrugs = await loadAndCleanDrugsFromCSV();
    console.log(`📊 Loaded and cleaned ${bulkDrugs.length} drugs from CSV file`);
  } catch (csvError) {
    console.log("📝 CSV file not found, using sample data");
    bulkDrugs = getSampleDrugs();
    console.log(`📊 Using ${bulkDrugs.length} sample drugs`);
  }

  // Validation with improved null handling
  console.log("🔍 Validating and fixing drug data...");
  const { cleanedDrugs, fixedCount } = smartFixDrugData(bulkDrugs);
  console.log(`✅ Data validated successfully (${fixedCount} items auto-fixed)`);

  // Batch processing
  console.log(`📦 Total drugs to process: ${cleanedDrugs.length}`);
  
  const drugBatches: BulkDrugInput[][] = [];
  for (let i = 0; i < cleanedDrugs.length; i += BATCH_SIZE) {
    drugBatches.push(cleanedDrugs.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`🔄 Processing in ${drugBatches.length} batches of ${BATCH_SIZE} drugs each`);

  for (const [batchIndex, batch] of drugBatches.entries()) {
    console.log(`\n🚀 Processing batch ${batchIndex + 1}/${drugBatches.length}...`);
    
    try {
      await prisma.$transaction(async (tx) => {
        for (const drugData of batch) {
          // Calculate package pricing
          const { unitCost, packageCost } = calculatePackagePricing(
            drugData.pricePerBox, 
            drugData.packageSize
          );

          // Create Drug with proper null handling และ packageSize
          const drug = await tx.drug.upsert({
            where: {
              hospitalId_hospitalDrugCode: {
                hospitalId: hospital.id,
                hospitalDrugCode: drugData.hospitalDrugCode
              }
            },
            update: {},
            create: {
              hospitalId: hospital.id,
              hospitalDrugCode: drugData.hospitalDrugCode,
              name: drugData.name,
              genericName: drugData.genericName,
              brandName: drugData.brandName || drugData.name,
              dosageForm: drugData.dosageForm,
              
              // 🔧 แก้ไข: ใช้ empty string แทน null ตาม schema
              strength: drugData.strength || "",
              unit: drugData.unit || "",
              
              // 🆕 เพิ่มข้อมูล packaging (ถ้า schema รองรับ)
              packageSize: drugData.packageSize,
              packageUnit: getPackageUnit(drugData.dosageForm, drugData.unit || null),
              
              notes: drugData.notes || generateNotes(drugData),
              isActive: true,
              requiresPrescription: drugData.requiresPrescription,
              isControlled: false,
              isNarcotic: false,
              isHighAlert: drugData.category === "HIGH_ALERT",
              isDangerous: drugData.riskLevel === "HIGH" || drugData.riskLevel === "CRITICAL",
            }
          });

          // 🆕 Create Enhanced Stock Card พร้อม package pricing
          const currentStock = drugData.currentStock;
          const packageSize = drugData.packageSize;
          const pricePerBox = drugData.pricePerBox;
          
          const stockCard = await tx.stockCard.upsert({
            where: {
              hospitalId_drugId_warehouseId: {
                hospitalId: hospital.id,
                drugId: drug.id,
                warehouseId: mainWarehouse.id
              }
            },
            update: {},
            create: {
              cardNumber: `SC-MAIN-${drugData.hospitalDrugCode}`,
              hospitalId: hospital.id,
              warehouseId: mainWarehouse.id,
              drugId: drug.id,
              
              // จำนวนสต็อก (ในหน่วย package/box)
              currentStock,
              reservedStock: 0,
              availableStock: currentStock,
              minStock: Math.max(Math.floor(currentStock * 0.2), 5),
              maxStock: Math.max(currentStock * 3, 50),
              reorderPoint: Math.max(Math.floor(currentStock * 0.3), 3),
              
              // 🆕 ข้อมูล Package
              packageSize: packageSize,
              packageUnit: getPackageUnit(drugData.dosageForm, drugData.unit || null),
              
              // 🆕 ราคาต่อหน่วย
              averageCost: unitCost,
              lastCost: unitCost,
              
              // 🆕 ราคาต่อแพ็ค
              packageCost: packageCost,
              lastPackageCost: packageCost,
              pricePerBox: drugData.pricePerBox, // 🆕 เก็บราคาต่อกล่องตรงๆ
              
              // มูลค่ารวม (คำนวณจากจำนวน package × ราคาต่อ package)
              totalValue: currentStock * packageCost,
              
              // การใช้งาน
              monthlyUsage: Math.floor(currentStock * packageSize * 0.1), // 10% ต่อเดือน (หน่วย)
              monthlyPackageUsage: Math.floor(currentStock * 0.1), // 10% ต่อเดือน (แพ็ค)
              
              isActive: true,
              
              // 🆕 เพิ่มหมายเหตุเกี่ยวกับ package
              notes: `${packageSize} ${getPackageUnit(drugData.dosageForm, drugData.unit || null)} per package | ฿${packageCost.toFixed(2)}/package | ฿${unitCost.toFixed(2)}/unit`
            }
          });

          // 🔧 Create Stock Batch with enhanced data
          await tx.stockBatch.upsert({
            where: {
              id: `${drug.id}-${drugData.expiryDate.replace(/-/g, '')}`
            },
            update: {},
            create: {
              hospitalId: hospital.id,
              stockCardId: stockCard.id,
              batchNumber: `BATCH-${drugData.hospitalDrugCode}-${drugData.expiryDate.replace(/-/g, '')}`,
              expiryDate: new Date(drugData.expiryDate),
              
              // คำนวณจำนวนเป็นหน่วยย่อย (total units)
              initialQty: currentStock * packageSize,
              currentQty: currentStock * packageSize,
              reservedQty: 0,
              availableQty: currentStock * packageSize,
              
              supplierId: null,
              purchaseOrderId: null,
              invoiceNo: null,
              receivedDate: new Date(),
              firstUsedDate: null,
              status: "ACTIVE",
              qcStatus: "PASSED",
              qcDate: new Date(),
              
              // 🆝 เพิ่มข้อมูล package ใน QC notes
              qcNotes: `Import Data - ${currentStock} packages × ${packageSize} units = ${currentStock * packageSize} total units | Cost: ฿${packageCost.toFixed(2)}/package`,
              
              storageLocation: getStorageLocationSafe(drugData.dosageForm),
              storageCondition: getStorageConditionSafe(drugData.category, drugData.dosageForm),
            }
          });

          totalProcessed++;
          totalValue += (currentStock * packageCost);
          totalPackages += currentStock;
        }
      }, {
        timeout: 30000
      });

      console.log(`  ✅ Batch ${batchIndex + 1} completed (${batch.length} drugs)`);
      console.log(`  📊 Progress: ${totalProcessed}/${cleanedDrugs.length} drugs processed`);
      console.log(`  📦 Packages processed: ${totalPackages.toLocaleString()}`);
      console.log(`  🏪 Warehouse: คลังยาหลัก`);
      
      if (batchIndex < drugBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`❌ Error in batch ${batchIndex + 1}:`, error);
      throw error;
    }
  }

  // Summary statistics
  const categoriesCount = {
    MODERN: cleanedDrugs.filter(d => d.category === "MODERN").length,
    HERBAL: cleanedDrugs.filter(d => d.category === "HERBAL").length,
    HIGH_ALERT: cleanedDrugs.filter(d => d.category === "HIGH_ALERT").length,
    REFER: cleanedDrugs.filter(d => d.category === "REFER").length,
  };

  const strengthStats = {
    withStrength: cleanedDrugs.filter(d => d.strength && d.strength !== "").length,
    withoutStrength: cleanedDrugs.filter(d => !d.strength || d.strength === "").length,
  };

  const pricingStats = {
    averagePackagePrice: totalValue / totalPackages,
    totalPackages: totalPackages,
    averagePackageSize: cleanedDrugs.reduce((sum, d) => sum + d.packageSize, 0) / cleanedDrugs.length,
    priceRange: {
      min: Math.min(...cleanedDrugs.map(d => d.pricePerBox)),
      max: Math.max(...cleanedDrugs.map(d => d.pricePerBox))
    }
  };

  console.log(`\n🎉 Enhanced bulk drug seeding completed successfully!`);
  console.log(`📊 Final Statistics:`);
  console.log(`  ✅ Total drugs processed: ${totalProcessed}`);
  console.log(`  📦 Total packages in inventory: ${totalPackages.toLocaleString()}`);
  console.log(`  💰 Total inventory value: ${totalValue.toLocaleString()} บาท`);
  console.log(`  💰 Average package price: ${pricingStats.averagePackagePrice.toFixed(2)} บาท`);
  console.log(`  📦 Average package size: ${pricingStats.averagePackageSize.toFixed(1)} units`);
  console.log(`  💰 Price range: ${pricingStats.priceRange.min}-${pricingStats.priceRange.max} บาท`);
  console.log(`  🏪 Warehouse: ${mainWarehouse.name} (All drugs stored here)`);
  console.log(`  📋 Drug Categories:`);
  Object.entries(categoriesCount).forEach(([category, count]) => {
    console.log(`    - ${category}: ${count} drugs`);
  });
  console.log(`  🔧 Strength & Unit Statistics:`);
  console.log(`    - With strength/unit: ${strengthStats.withStrength} drugs`);
  console.log(`    - Without strength/unit (empty): ${strengthStats.withoutStrength} drugs`);
  
  return { 
    totalProcessed: totalProcessed || 0, 
    totalValue: totalValue || 0,
    totalPackages: totalPackages || 0,
    categoriesCount: categoriesCount || {},
    warehouseUsed: mainWarehouse.name,
    strengthStats,
    pricingStats,
    success: true
  };
}

// Helper functions (เหมือนเดิม แต่เพิ่ม package info)
function generateNotes(drugData: BulkDrugInput): string {
  const parts = [];
  
  if (drugData.strength && drugData.unit) {
    parts.push(`${drugData.strength} ${drugData.unit}`);
  }
  
  parts.push(drugData.dosageForm.toLowerCase());
  
  // เพิ่มข้อมูล package size
  if (drugData.packageSize) {
    const packageUnit = getPackageUnit(drugData.dosageForm, drugData.unit || null);
    parts.push(`(${drugData.packageSize} ${packageUnit}/package, ฿${drugData.pricePerBox}/package)`);
  }
  
  return parts.join(' ') || `${drugData.dosageForm} form`;
}

function smartFixDrugData(drugs: BulkDrugInput[]): { cleanedDrugs: BulkDrugInput[], fixedCount: number } {
  let fixedCount = 0;
  const cleanedDrugs = drugs.map((drug, index) => {
    const fixed = { ...drug };
    let wasFixed = false;

    // Fix empty required fields
    if (!fixed.hospitalDrugCode) {
      fixed.hospitalDrugCode = `AUTO_${index + 1}`;
      wasFixed = true;
    }
    
    if (!fixed.name) {
      fixed.name = fixed.genericName || `Drug ${index + 1}`;
      wasFixed = true;
    }
    
    if (!fixed.genericName) {
      fixed.genericName = fixed.name || `Generic ${index + 1}`;
      wasFixed = true;
    }

    // Fix numeric fields
    if (fixed.currentStock <= 0) {
      fixed.currentStock = 1;
      wasFixed = true;
    }
    
    if (fixed.packageSize <= 0) {
      fixed.packageSize = 100;
      wasFixed = true;
    }
    
    if (fixed.pricePerBox <= 0) {
      fixed.pricePerBox = 100;
      wasFixed = true;
    }

    // Handle strength and unit - set to null if empty
    if (!fixed.strength || fixed.strength.trim() === '' || fixed.strength === '0') {
      fixed.strength = null;
      wasFixed = true;
    }
    
    if (!fixed.unit || fixed.unit.trim() === '') {
      fixed.unit = null;
      wasFixed = true;
    }

    if (wasFixed) {
      fixedCount++;
      console.log(`🔧 Auto-fixed row ${index + 1}: ${fixed.name}`);
    }

    return fixed;
  });

  return { cleanedDrugs, fixedCount };
}

async function loadAndCleanDrugsFromCSV(): Promise<BulkDrugInput[]> {
  const csvPaths = [
    path.join(process.cwd(), 'data', 'bulk-drugs.csv'),
    path.join(process.cwd(), 'prisma', 'data', 'bulk-drugs.csv'),
    path.join(process.cwd(), 'bulk-drugs.csv'),
  ];

  let csvContent = '';
  for (const csvPath of csvPaths) {
    try {
      if (fs.existsSync(csvPath)) {
        csvContent = fs.readFileSync(csvPath, 'utf8');
        console.log(`📁 Found CSV file at: ${csvPath}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!csvContent) {
    throw new Error('CSV file not found');
  }

  // Parse CSV
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  console.log(`📋 CSV Headers: ${headers.join(', ')}`);
  console.log(`📄 CSV has ${lines.length - 1} data rows`);

  const drugs: BulkDrugInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length < headers.length) {
      console.warn(`⚠️  Row ${i + 1} has only ${values.length} values, padding with empty strings`);
      while (values.length < headers.length) {
        values.push('');
      }
    }

    const drugData: any = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      drugData[header] = convertValueWithDefaults(header, value);
    });

    // Build drug object with null handling for strength/unit
    const drug: BulkDrugInput = {
      hospitalDrugCode: drugData.hospitalDrugCode || `AUTO_${i}`,
      name: drugData.name || drugData.genericName || `Drug ${i}`,
      genericName: drugData.genericName || drugData.name || `Generic ${i}`,
      dosageForm: drugData.dosageForm || drugData.form || 'TAB',
      strength: drugData.strength && drugData.strength !== '0' ? String(drugData.strength) : null,
      unit: drugData.unit && drugData.unit !== '' ? drugData.unit : null,
      currentStock: Number(drugData.currentStock || drugData.stock || 1),
      packageSize: Number(drugData.packageSize || drugData.package || 100),
      pricePerBox: Number(drugData.pricePerBox || drugData.price || 100),
      expiryDate: standardizeDate(drugData.expiryDate || drugData.expiry || '2028-12-31'),
      category: standardizeCategory(drugData.category || 'MODERN'),
      requiresPrescription: convertBoolean(drugData.requiresPrescription),
      riskLevel: standardizeRiskLevel(drugData.riskLevel || 'LOW'),
      brandName: drugData.brandName || drugData.name,
      indication: drugData.indication || '',
      notes: drugData.notes || '',
    };

    drugs.push(drug);
  }

  console.log(`✅ Successfully parsed ${drugs.length} drugs from CSV`);
  return drugs;
}

function getSampleDrugs(): BulkDrugInput[] {
  return [
    {
      hospitalDrugCode: "TH001",
      name: "Paracetamol",
      genericName: "Paracetamol",
      dosageForm: "TAB",
      strength: "500",
      unit: "mg",
      currentStock: 100,
      packageSize: 100,
      pricePerBox: 120.00,
      expiryDate: "2028-05-10",
      category: "MODERN",
      requiresPrescription: false,
      riskLevel: "LOW",
    },
    {
      hospitalDrugCode: "TH002",
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      dosageForm: "CAP",
      strength: "250",
      unit: "mg",
      currentStock: 50,
      packageSize: 100,
      pricePerBox: 200.00,
      expiryDate: "2027-08-31",
      category: "MODERN",
      requiresPrescription: true,
      riskLevel: "MEDIUM",
    },
    {
      hospitalDrugCode: "TH003",
      name: "ยาชงขิง",
      genericName: "ยาชงขิง",
      dosageForm: "POW",
      strength: null,
      unit: null,
      currentStock: 30,
      packageSize: 50,
      pricePerBox: 80.00,
      expiryDate: "2028-02-02",
      category: "HERBAL",
      requiresPrescription: false,
      riskLevel: "LOW",
    },
    {
      hospitalDrugCode: "TH004",
      name: "Normal Saline",
      genericName: "Sodium Chloride",
      dosageForm: "BAG",
      strength: null,
      unit: null,
      currentStock: 20,
      packageSize: 20,
      pricePerBox: 400.00,
      expiryDate: "2026-12-31",
      category: "MODERN",
      requiresPrescription: true,
      riskLevel: "LOW",
    },
    {
      hospitalDrugCode: "TH005",
      name: "Insulin Human",
      genericName: "Insulin Human",
      dosageForm: "INJ",
      strength: "100",
      unit: "IU/ml",
      currentStock: 10,
      packageSize: 5,
      pricePerBox: 800.00,
      expiryDate: "2025-06-30",
      category: "HIGH_ALERT",
      requiresPrescription: true,
      riskLevel: "CRITICAL",
    }
  ];
}

// Helper utility functions
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, ''));
}

function convertValueWithDefaults(header: string, value: string): any {
  if (!value || value.trim() === '') {
    return getDefaultValue(header);
  }

  if (['currentStock', 'packageSize', 'pricePerBox'].includes(header)) {
    const cleanNumber = value.replace(/,/g, '');
    const num = parseFloat(cleanNumber);
    return isNaN(num) ? getDefaultValue(header) : num;
  }
  
  if (['requiresPrescription'].includes(header)) {
    return convertBoolean(value);
  }
  
  return value;
}

function getDefaultValue(header: string): any {
  const defaults: Record<string, any> = {
    hospitalDrugCode: '',
    name: '',
    genericName: '',
    dosageForm: 'TAB',
    strength: null,
    unit: null,
    currentStock: 1,
    packageSize: 100,
    pricePerBox: 100,
    expiryDate: '2028-12-31',
    category: 'MODERN',
    requiresPrescription: true,
    riskLevel: 'LOW',
    brandName: '',
    indication: '',
    notes: '',
  };
  
  return defaults[header] || '';
}

function standardizeDate(dateStr: string): string {
  if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
    const [year, month, day] = dateStr.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return '2028-12-31';
}

function standardizeCategory(category: string): "MODERN" | "HERBAL" | "HIGH_ALERT" | "REFER" {
  const upper = category.toUpperCase();
  if (['HERBAL', 'HIGH_ALERT', 'REFER'].includes(upper)) {
    return upper as any;
  }
  return 'MODERN';
}

function standardizeRiskLevel(risk: string): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const upper = risk.toUpperCase();
  if (['MEDIUM', 'HIGH', 'CRITICAL'].includes(upper)) {
    return upper as any;
  }
  return 'LOW';
}

function convertBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return ['true', 'yes', '1', 'y', 'ใช่', 'จริง'].includes(lower);
  }
  return true;
}

function getStorageLocationSafe(dosageForm: string): string {
  const locations: Record<string, string> = {
    "TAB": "A001", "CAP": "A001",
    "INJ": "B001", "BAG": "B001", "LVP": "B001",
    "POW": "C001", "SAC": "C001",
    "CRE": "D001", "OIN": "D001", "GEL": "D001",
    "SYR": "E001", "LIQ": "E001", "SOL": "E001",
  };
  
  return locations[dosageForm] ?? "A001";
}

function getStorageConditionSafe(category: string, dosageForm: string): string {
  if (category === "REFER" || dosageForm === "BAG") return "REFRIGERATED";
  if (dosageForm === "INJ") return "CONTROLLED_ROOM";
  if (category === "HERBAL") return "DRY_PLACE";
  return "ROOM_TEMPERATURE";
}