// prisma/seeds/robust-bulk-drugs.seed.ts - รองรับข้อมูลว่าง
import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';

interface BulkDrugInput {
  hospitalDrugCode: string;
  name: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  unit: string;
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

export async function seedBulkRealDrugs(
  prisma: PrismaClient, 
  hospitals: any[], 
  masterData: any
) {
  console.log("💊 Creating Bulk Real Drug Data for โรงพยาบาลลำปาง...");
  console.log("🛠️ Enhanced with Smart Default Handler");

  const hospital1 = hospitals[0];
  const BATCH_SIZE = 25;
  let totalProcessed = 0;
  let totalValue = 0;

  // Find main warehouse first
  const mainWarehouse = await prisma.warehouse.findFirst({
    where: {
      hospitalId: hospital1.id,
      warehouseCode: "MAIN"
    }
  });

  if (!mainWarehouse) {
    throw new Error("❌ Main warehouse not found for hospital");
  }

  // ================================
  // LOAD AND PROCESS CSV DATA
  // ================================
  let bulkDrugs: BulkDrugInput[] = [];
  
  try {
    bulkDrugs = await loadAndCleanDrugsFromCSV();
    console.log(`📊 Loaded and cleaned ${bulkDrugs.length} drugs from CSV file`);
  } catch (csvError) {
    console.log("📝 CSV file not found or invalid, using hardcoded sample data");
    bulkDrugs = getHardcodedDrugs();
    console.log(`📊 Using ${bulkDrugs.length} hardcoded sample drugs`);
  }

  // ================================
  // VALIDATION WITH SMART FIXES
  // ================================
  console.log("🔍 Validating and fixing drug data...");
  const { cleanedDrugs, fixedCount } = smartFixDrugData(bulkDrugs);
  console.log(`✅ Data validated successfully (${fixedCount} items auto-fixed)`);

  // ================================
  // BATCH PROCESSING
  // ================================
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
          // Create Drug (ลบฟิลด์ที่ไม่มีใน schema)
          const drug = await tx.drug.upsert({
            where: {
              hospitalId_hospitalDrugCode: {
                hospitalId: hospital1.id,
                hospitalDrugCode: drugData.hospitalDrugCode
              }
            },
            update: {},
            create: {
              hospitalId: hospital1.id,
              hospitalDrugCode: drugData.hospitalDrugCode,
              name: drugData.name,
              genericName: drugData.genericName,
              brandName: drugData.brandName || drugData.name,
              dosageForm: drugData.dosageForm,
              strength: drugData.strength,
              unit: drugData.unit,
              notes: drugData.notes || `${drugData.strength} ${drugData.unit} ${drugData.dosageForm.toLowerCase()}`,
              isActive: true,
              requiresPrescription: drugData.requiresPrescription,
              isControlled: false,
              isNarcotic: false,
              isHighAlert: drugData.category === "HIGH_ALERT",
              isDangerous: drugData.riskLevel === "HIGH" || drugData.riskLevel === "CRITICAL",
              // ลบ isRefer ออก - ไม่มีใน schema
            }
          });

          // Create Stock Card
          const currentStock = drugData.currentStock;
          const packageSize = drugData.packageSize;
          const pricePerBox = drugData.pricePerBox;
          
          const stockCard = await tx.stockCard.upsert({
            where: {
              id: `${hospital1.id}-${mainWarehouse.id}-${drug.id}`
            },
            update: {},
            create: {
              cardNumber: `SC-BULK-${drugData.hospitalDrugCode}`,
              hospitalId: hospital1.id,
              warehouseId: mainWarehouse.id,
              drugId: drug.id,
              currentStock,
              reservedStock: 0,
              availableStock: currentStock,
              minStock: Math.max(Math.floor(currentStock * 0.2), 5),
              maxStock: Math.max(currentStock * 3, 50),
              reorderPoint: Math.max(Math.floor(currentStock * 0.3), 3),
              averageCost: pricePerBox / packageSize,
              totalValue: currentStock * pricePerBox,
              isActive: true,
            }
          });

          // Create Stock Batch
          await tx.stockBatch.upsert({
            where: {
              id: `${drug.id}-${drugData.expiryDate.replace(/-/g, '')}`
            },
            update: {},
            create: {
              hospitalId: hospital1.id,
              stockCardId: stockCard.id,
              batchNumber: `BATCH-${drugData.hospitalDrugCode}-${drugData.expiryDate.replace(/-/g, '')}`,
              expiryDate: new Date(drugData.expiryDate),
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
              qcNotes: `CSV Import - Package size: ${packageSize} units`,
              storageLocation: getStorageLocationSafe(drugData.dosageForm),
              storageCondition: getStorageConditionSafe(drugData.category, drugData.dosageForm),
            }
          });

          totalProcessed++;
          totalValue += (currentStock * pricePerBox);
        }
      }, {
        timeout: 30000
      });

      console.log(`  ✅ Batch ${batchIndex + 1} completed (${batch.length} drugs)`);
      console.log(`  📊 Progress: ${totalProcessed}/${cleanedDrugs.length} drugs processed`);
      
      if (batchIndex < drugBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`❌ Error in batch ${batchIndex + 1}:`, error);
      throw error;
    }
  }

  // ================================
  // SUMMARY STATISTICS
  // ================================
  const categoriesCount = {
    MODERN: cleanedDrugs.filter(d => d.category === "MODERN").length,
    HERBAL: cleanedDrugs.filter(d => d.category === "HERBAL").length,
    HIGH_ALERT: cleanedDrugs.filter(d => d.category === "HIGH_ALERT").length,
    REFER: cleanedDrugs.filter(d => d.category === "REFER").length,
  };

  console.log(`\n🎉 Bulk drug seeding completed successfully!`);
  console.log(`📊 Final Statistics:`);
  console.log(`  ✅ Total drugs processed: ${totalProcessed}`);
  console.log(`  💰 Total inventory value: ${totalValue.toLocaleString()} บาท`);
  console.log(`  🛠️ Auto-fixed fields: ${fixedCount}`);
  console.log(`  📋 Drug Categories:`);
  Object.entries(categoriesCount).forEach(([category, count]) => {
    console.log(`    - ${category}: ${count} drugs`);
  });
  
  // Return data ในรูปแบบที่ merge script คาดหวัง
  return { 
    totalProcessed: totalProcessed || 0, 
    totalValue: totalValue || 0, 
    categoriesCount: categoriesCount || {},
    success: true
  };
}

// ================================
// ENHANCED CSV LOADER
// ================================

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
      // Pad with empty strings
      while (values.length < headers.length) {
        values.push('');
      }
    }

    const drugData: any = {};
    headers.forEach((header, index) => {
      const value = values[index] || ''; // Default to empty string
      drugData[header] = convertValueWithDefaults(header, value);
    });

    // Build drug object with smart defaults
    const drug: BulkDrugInput = {
      hospitalDrugCode: drugData.hospitalDrugCode || `AUTO_${i}`,
      name: drugData.name || drugData.genericName || `Drug ${i}`,
      genericName: drugData.genericName || drugData.name || `Generic ${i}`,
      dosageForm: drugData.dosageForm || drugData.form || 'TAB',
      strength: String(drugData.strength || '0'),
      unit: drugData.unit || 'mg',
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

// ================================
// SMART DATA FIXING
// ================================

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

    // Fix strength and unit based on dosage form
    if (!fixed.strength || fixed.strength === '0') {
      fixed.strength = getDefaultStrength(fixed.dosageForm);
      wasFixed = true;
    }
    
    if (!fixed.unit) {
      fixed.unit = getDefaultUnit(fixed.dosageForm);
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

// ================================
// HELPER FUNCTIONS
// ================================

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
  return result.map(val => val.replace(/^"|"$/g, '')); // Remove surrounding quotes
}

function convertValueWithDefaults(header: string, value: string): any {
  // Handle empty values
  if (!value || value.trim() === '') {
    return getDefaultValue(header);
  }

  // Convert numeric fields
  if (['currentStock', 'packageSize', 'pricePerBox', 'strength'].includes(header)) {
    // Remove commas from numbers like "20,865.00"
    const cleanNumber = value.replace(/,/g, '');
    const num = parseFloat(cleanNumber);
    return isNaN(num) ? getDefaultValue(header) : num;
  }
  
  // Convert boolean fields
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
    strength: '500',
    unit: 'mg',
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

function getDefaultStrength(dosageForm: string): string {
  const strengthMap: Record<string, string> = {
    'TAB': '500', 'CAP': '250', 'INJ': '1', 'SYR': '120',
    'CRE': '10', 'OIN': '5', 'POW': '1', 'BAG': '500',
  };
  return strengthMap[dosageForm] || '100';
}

function getDefaultUnit(dosageForm: string): string {
  const unitMap: Record<string, string> = {
    'TAB': 'mg', 'CAP': 'mg', 'INJ': 'ml', 'SYR': 'ml',
    'CRE': 'g', 'OIN': 'g', 'POW': 'g', 'BAG': 'ml',
  };
  return unitMap[dosageForm] || 'mg';
}

function standardizeDate(dateStr: string): string {
  // Handle various date formats and convert to YYYY-MM-DD
  if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
    // Already in YYYY-MM-DD format, just standardize
    const [year, month, day] = dateStr.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Handle other formats...
  return '2028-12-31'; // Default far future date
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
  return true; // Default to true for prescription required
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

// Fallback hardcoded data
function getHardcodedDrugs(): BulkDrugInput[] {
  return [
    {
      hospitalDrugCode: "1670056",
      name: "Ursodeoxycholic acid",
      genericName: "Ursodeoxycholic acid", 
      dosageForm: "TAB",
      strength: "250",
      unit: "mg",
      currentStock: 2,
      packageSize: 100,
      pricePerBox: 650.00,
      expiryDate: "2028-05-10",
      category: "MODERN",
      requiresPrescription: true,
      riskLevel: "MEDIUM",
    },
    {
      hospitalDrugCode: "1670065",
      name: "Alteplase(Actilyse)",
      genericName: "Alteplase",
      dosageForm: "INJ",
      strength: "50",
      unit: "ml",
      currentStock: 2,
      packageSize: 1,
      pricePerBox: 20865.00,
      expiryDate: "2026-08-31",
      category: "HIGH_ALERT",
      requiresPrescription: true,
      riskLevel: "CRITICAL",
    },
    {
      hospitalDrugCode: "2012010",
      name: "ยาชงขิง",
      genericName: "ยาชงขิง",
      dosageForm: "POW",
      strength: "20",
      unit: "g",
      currentStock: 43,
      packageSize: 100,
      pricePerBox: 65.00,
      expiryDate: "2028-02-02",
      category: "HERBAL",
      requiresPrescription: false,
      riskLevel: "LOW",
    }
  ];
}