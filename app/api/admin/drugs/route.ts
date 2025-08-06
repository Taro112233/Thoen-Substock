// app/api/admin/drugs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Enhanced validation schema - เพิ่ม name field
const createDrugSchema = z.object({
  // ข้อมูลพื้นฐาน
  hospitalDrugCode: z.string().min(1, 'รหัสยาโรงพยาบาลจำเป็น').max(20, 'รหัสยาต้องไม่เกิน 20 ตัวอักษร'),
  genericName: z.string().min(1, 'ชื่อสามัญจำเป็น'),
  brandName: z.string().optional(),
  name: z.string().min(1, 'ชื่อยาจำเป็น'), // ⭐ เพิ่ม field นี้
  
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
  // drugCategoryId: z.string().uuid().optional(), // ปิดชั่วคราว
  
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
  
  // ข้อมูลคลังและต้นทุน
  standardCost: z.number().min(0, 'ต้นทุนมาตรฐานต้องเป็นจำนวนบวก'),
  currentCost: z.number().min(0, 'ต้นทุนปัจจุบันต้องเป็นจำนวนบวก'),
  reorderPoint: z.number().int().min(0, 'จุดสั่งซื้อใหม่ต้องเป็นจำนวนเต็มบวก'),
  maxStockLevel: z.number().int().min(1, 'สต็อกสูงสุดต้องมากกว่า 0'),
  notes: z.string().optional(),
});

// ===============================
// GET - ดึงรายการยา
// ===============================
export async function GET(request: NextRequest) {
  console.log('🔍 [DRUGS API] Starting GET request...');
  
  try {
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    const { hospitalId } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryParams = {
      search: searchParams.get('search'),
      categoryId: searchParams.get('categoryId'),
      dosageForm: searchParams.get('dosageForm'),
      isControlled: searchParams.get('isControlled'),
      isFormulary: searchParams.get('isFormulary'),
      active: searchParams.get('active'),
      sortBy: searchParams.get('sortBy') || 'genericName',
      sortOrder: searchParams.get('sortOrder') || 'asc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };
    
    console.log('🔍 [DRUGS API] Query params:', queryParams);
    
    // Build where clause
    const where: any = {
      hospitalId,
    };
    
    // Add filters
    if (queryParams.search) {
      where.OR = [
        { genericName: { contains: queryParams.search, mode: 'insensitive' } },
        { brandName: { contains: queryParams.search, mode: 'insensitive' } },
        { hospitalDrugCode: { contains: queryParams.search, mode: 'insensitive' } },
      ];
    }
    
    if (queryParams.categoryId) {
      where.drugCategoryId = queryParams.categoryId;
    }
    
    if (queryParams.dosageForm) {
      where.dosageForm = queryParams.dosageForm;
    }
    
    if (queryParams.isControlled !== null) {
      where.isControlled = queryParams.isControlled === 'true';
    }
    
    if (queryParams.isFormulary !== null) {
      where.isFormulary = queryParams.isFormulary === 'true';
    }
    
    if (queryParams.active !== null) {
      where.isActive = queryParams.active === 'true';
    }
    
    // Calculate pagination
    const skip = (queryParams.page - 1) * queryParams.limit;
    
    // Build orderBy
    const orderBy: any = {};
    orderBy[queryParams.sortBy] = queryParams.sortOrder;
    
    // Execute queries
    const [drugs, totalCount] = await Promise.all([
      prisma.drug.findMany({
        where,
        skip,
        take: queryParams.limit,
        orderBy,
        include: {
          _count: {
            select: {
              stockCards: true,
              stockTransactions: true,
            }
          }
        },
      }),
      prisma.drug.count({ where }),
    ]);
    
    console.log(`✅ [DRUGS API] Found ${drugs.length} drugs (total: ${totalCount})`);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / queryParams.limit);
    const hasNextPage = queryParams.page < totalPages;
    const hasPreviousPage = queryParams.page > 1;
    
    return NextResponse.json({
      success: true,
      data: drugs,
      pagination: {
        currentPage: queryParams.page,
        totalPages,
        totalCount,
        limit: queryParams.limit,
        hasNextPage,
        hasPreviousPage,
      },
      filters: queryParams,
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

// ===============================
// POST - เพิ่มยาใหม่
// ===============================
export async function POST(request: NextRequest) {
  console.log('🔍 [DRUGS API] Starting POST request...');
  
  try {
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    const { hospitalId } = authResult;
    
    // Parse request body
    const body = await request.json();
    console.log('🔍 [DRUGS API] Request body keys:', Object.keys(body));
    
    // Validate input data
    const validatedData = createDrugSchema.parse(body);
    console.log('🔍 [DRUGS API] Validated data:', {
      hospitalDrugCode: validatedData.hospitalDrugCode,
      genericName: validatedData.genericName,
      name: validatedData.name, // ⭐ แสดง name ด้วย
      dosageForm: validatedData.dosageForm
    });
    
    // Check for duplicate hospital drug code
    const existingDrug = await prisma.drug.findFirst({
      where: {
        hospitalId,
        hospitalDrugCode: validatedData.hospitalDrugCode,
      },
    });
    
    if (existingDrug) {
      return NextResponse.json(
        { error: `รหัสยา "${validatedData.hospitalDrugCode}" มีอยู่ในระบบแล้ว` },
        { status: 400 }
      );
    }
    
    // ⭐ สร้าง name อัตโนมัติหากไม่ได้ระบุ
    const drugName = validatedData.name || 
      (validatedData.brandName 
        ? `${validatedData.genericName} (${validatedData.brandName})`
        : validatedData.genericName);
    
    // Generate QR Code data
    const qrData = {
      hospitalId,
      drugCode: validatedData.hospitalDrugCode,
      type: 'DRUG',
      timestamp: new Date().toISOString(),
    };

    // Create new drug
    const newDrug = await prisma.drug.create({
      data: {
        ...validatedData,
        name: drugName, // ⭐ เพิ่ม name ที่สร้างขึ้น
        hospitalId,
        qrCode: JSON.stringify(qrData),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            stockCards: true,
            stockTransactions: true,
          }
        }
      }
    });

    console.log(`✅ [DRUGS API] Created drug: ${newDrug.id} - ${newDrug.name}`);

    return NextResponse.json({
      success: true,
      data: newDrug,
      summary: {
        id: newDrug.id,
        code: newDrug.hospitalDrugCode,
        name: newDrug.name, // ⭐ ใช้ name จริง
        strengthDisplay: `${newDrug.strength} ${newDrug.unitOfMeasure}`,
      },
      message: `สร้างข้อมูลยา "${newDrug.name}" สำเร็จ`,
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