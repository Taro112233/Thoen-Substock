// app/api/admin/drugs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas สำหรับ Drug Management
const createDrugSchema = z.object({
  // ข้อมูลพื้นฐาน
  hospitalDrugCode: z.string().min(1, 'รหัสยาโรงพยาบาลจำเป็น').max(20, 'รหัสยาต้องไม่เกิน 20 ตัวอักษร'),
  genericName: z.string().min(1, 'ชื่อสามัญจำเป็น'),
  brandName: z.string().optional(),
  
  // ข้อมูลเภสัชกรรม
  strength: z.string().min(1, 'ความแรงยาจำเป็น'),
  dosageForm: z.enum([
    'TABLET', 'CAPSULE', 'INJECTION', 'SYRUP', 'CREAM', 'OINTMENT',
    'DROPS', 'SPRAY', 'SUPPOSITORY', 'PATCH', 'POWDER', 'SOLUTION', 'OTHER'
  ]),
  unitOfMeasure: z.string().min(1, 'หน่วยวัดจำเป็น'),
  
  // การจำแนกประเภท
  therapeuticClass: z.string().min(1, 'หมวดยาจำเป็น'),
  pharmacologicalClass: z.string().optional(),
  drugCategoryId: z.string().uuid().optional(),
  
  // สถานะและการควบคุม
  isControlled: z.boolean().default(false),
  controlledLevel: z.enum(['NONE', 'CATEGORY_1', 'CATEGORY_2', 'CATEGORY_3', 'CATEGORY_4', 'CATEGORY_5']).default('NONE'),
  isDangerous: z.boolean().default(false),
  isHighAlert: z.boolean().default(false),
  isFormulary: z.boolean().default(true),
  requiresPrescription: z.boolean().default(true),
  
  // การเก็บรักษา
  storageCondition: z.string().default('ปกติ'),
  requiresColdStorage: z.boolean().default(false),
  
  // ข้อมูลทางคลินิก
  indications: z.string().optional(),
  contraindications: z.string().optional(),
  sideEffects: z.string().optional(),
  dosageInstructions: z.string().optional(),
  precautions: z.string().optional(),
  warnings: z.string().optional(),
  
  // ต้นทุนและการจัดหา
  standardCost: z.number().positive().optional(),
  currentCost: z.number().positive().optional(),
  reorderPoint: z.number().int().min(0).default(10),
  maxStockLevel: z.number().int().positive().optional(),
  
  // หมายเหตุ
  notes: z.string().optional(),
});

const updateDrugSchema = createDrugSchema.partial();

// GET - รายการยาทั้งหมด
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DRUGS API] Starting GET request...');
    
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { hospitalId } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const dosageForm = searchParams.get('dosageForm');
    const isControlled = searchParams.get('isControlled');
    const isFormulary = searchParams.get('isFormulary');
    const active = searchParams.get('active');
    const sortBy = searchParams.get('sortBy') || 'genericName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    console.log('🔍 [DRUGS API] Query params:', {
      search, categoryId, dosageForm, isControlled, isFormulary, active,
      sortBy, sortOrder, page, limit
    });

    // Build where clause with hospital isolation
    const where: any = {
      hospitalId,
    };

    // Search functionality
    if (search) {
      where.OR = [
        { hospitalDrugCode: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { brandName: { contains: search, mode: 'insensitive' } },
        { strength: { contains: search, mode: 'insensitive' } },
        { therapeuticClass: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (categoryId) {
      where.drugCategoryId = categoryId;
    }
    
    if (dosageForm) {
      where.dosageForm = dosageForm;
    }
    
    if (isControlled !== null) {
      where.isControlled = isControlled === 'true';
    }
    
    if (isFormulary !== null) {
      where.isFormulary = isFormulary === 'true';
    }
    
    if (active !== null) {
      where.isActive = active === 'true';
    }

    // Dynamic sorting
    const validSortFields = [
      'hospitalDrugCode', 'genericName', 'brandName', 'strength', 
      'dosageForm', 'therapeuticClass', 'createdAt', 'updatedAt'
    ];
    const orderBy: any = {};
    
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.genericName = 'asc'; // default
    }

    // Execute queries
    const [drugs, total] = await Promise.all([
      prisma.drug.findMany({
        where,
        include: {
        //   category: {
        //     select: {
        //       id: true,
        //       categoryName: true,
        //       categoryCode: true,
        //     }
        //   },
          stockCards: {
            select: {
              id: true,
              warehouseId: true,
              warehouse: {
                select: {
                  name: true,
                  type: true,
                }
              },
              currentStock: true,
              reorderPoint: true,
            }
          },
          _count: {
            select: {
              stockCards: true,
              stockTransactions: true,
              requisitionItems: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.drug.count({ where })
    ]);

    console.log(`✅ [DRUGS API] Found ${drugs.length} drugs (total: ${total})`);

    // Calculate summary statistics
    const summary = {
      totalDrugs: total,
      activeDrugs: await prisma.drug.count({
        where: { ...where, isActive: true }
      }),
      controlledDrugs: await prisma.drug.count({
        where: { ...where, isControlled: true }
      }),
      formularyDrugs: await prisma.drug.count({
        where: { ...where, isFormulary: true }
      }),
    };

    // Add computed fields
    const enrichedDrugs = drugs.map(drug => ({
      ...drug,
      fullName: drug.brandName 
        ? `${drug.genericName} (${drug.brandName})` 
        : drug.genericName,
      strengthDisplay: `${drug.strength} ${drug.unitOfMeasure}`,
      totalStock: drug.stockCards.reduce((sum, card) => sum + card.currentStock, 0),
      stockLocations: drug.stockCards.length,
      hasLowStock: drug.stockCards.some(card => card.currentStock <= card.reorderPoint),
      isOutOfStock: drug.stockCards.every(card => card.currentStock === 0),
    }));

    return NextResponse.json({
      drugs: enrichedDrugs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      summary,
    });

  } catch (error) {
    console.error('❌ [DRUGS API] GET Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลยา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - สร้างยาใหม่
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DRUGS API] Starting POST request...');
    
    // Validate admin authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user, hospitalId } = authResult;
    
    // Validate request body
    const body = await request.json();
    console.log('🔍 [DRUGS API] Request body keys:', Object.keys(body));
    
    const validatedData = createDrugSchema.parse(body);
    console.log('🔍 [DRUGS API] Validated data:', {
      hospitalDrugCode: validatedData.hospitalDrugCode,
      genericName: validatedData.genericName,
      dosageForm: validatedData.dosageForm,
    });

    // Check for duplicate hospital drug code
    const existingDrug = await prisma.drug.findFirst({
      where: {
        hospitalId,
        hospitalDrugCode: validatedData.hospitalDrugCode,
      }
    });

    if (existingDrug) {
      return NextResponse.json(
        { error: `รหัสยาโรงพยาบาล "${validatedData.hospitalDrugCode}" มีอยู่แล้ว` },
        { status: 400 }
      );
    }

    // Generate QR Code data (for future QR scanning feature)
    const qrCodeData = JSON.stringify({
      hospitalId,
      drugCode: validatedData.hospitalDrugCode,
      type: 'DRUG',
      timestamp: new Date().toISOString(),
    });

    // Create new drug
    const newDrug = await prisma.drug.create({
      data: {
        ...validatedData,
        hospitalId,
        qrCode: qrCodeData, // Store QR data for future use
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        // category: {
        //   select: {
        //     id: true,
        //     categoryName: true,
        //     categoryCode: true,
        //   }
        // }
      }
    });

    console.log('✅ [DRUGS API] Drug created:', newDrug.id);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        hospitalId,
        userId: user.userId,
        action: 'CREATE',
        resource: 'DRUG',
        resourceId: newDrug.id,
        details: {
          hospitalDrugCode: newDrug.hospitalDrugCode,
          genericName: newDrug.genericName,
          dosageForm: newDrug.dosageForm,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    return NextResponse.json({
      drug: {
        ...newDrug,
        fullName: newDrug.brandName 
          ? `${newDrug.genericName} (${newDrug.brandName})` 
          : newDrug.genericName,
        strengthDisplay: `${newDrug.strength} ${newDrug.unitOfMeasure}`,
      },
      message: `สร้างข้อมูลยา "${newDrug.genericName}" สำเร็จ`,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('❌ [DRUGS API] Validation error:', error.errors);
      return NextResponse.json(
        { 
          error: 'ข้อมูลไม่ถูกต้อง',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }

    console.error('❌ [DRUGS API] POST Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างข้อมูลยา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}