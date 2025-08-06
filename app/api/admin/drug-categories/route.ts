// app/api/admin/drug-categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateAdminAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createCategorySchema = z.object({
  categoryCode: z.string().min(1, 'รหัสหมวดหมู่จำเป็น').max(10, 'รหัสหมวดหมู่ต้องไม่เกิน 10 ตัวอักษร'),
  categoryName: z.string().min(1, 'ชื่อหมวดหมู่จำเป็น'),
  description: z.string().optional(),
  parentCategoryId: z.string().uuid().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

const updateCategorySchema = createCategorySchema.partial();

// GET - รายการหมวดหมู่ยาทั้งหมด
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DRUG CATEGORIES API] Starting GET request...');
    
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
    const parentId = searchParams.get('parentId');
    const level = searchParams.get('level');
    const active = searchParams.get('active');
    const hierarchical = searchParams.get('hierarchical') === 'true';

    // Build where clause
    const where: any = {
      hospitalId,
    };

    if (search) {
      where.OR = [
        { categoryCode: { contains: search, mode: 'insensitive' } },
        { categoryName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (parentId === 'null' || parentId === '') {
      where.parentCategoryId = null; // Root categories only
    } else if (parentId) {
      where.parentCategoryId = parentId;
    }

    if (level) {
      where.level = parseInt(level);
    }

    if (active !== null) {
      where.isActive = active === 'true';
    }

    if (hierarchical) {
      // Get all categories and build tree structure
      const allCategories = await prisma.drugCategory.findMany({
        where: {
          hospitalId,
          ...(active !== null ? { isActive: active === 'true' } : {}),
        },
        include: {
          parentCategory: {
            select: {
              id: true,
              categoryName: true,
              categoryCode: true,
            }
          },
          childCategories: {
            select: {
              id: true,
              categoryName: true,
              categoryCode: true,
              level: true,
            },
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: {
              childCategories: true,
              drugs: true,
            }
          }
        },
        orderBy: [
          { level: 'asc' },
          { sortOrder: 'asc' },
          { categoryName: 'asc' },
        ],
      });

      // Build hierarchical structure
      const categoryMap = new Map();
      const rootCategories = [];

      // First pass: create map of all categories
      allCategories.forEach(category => {
        categoryMap.set(category.id, {
          ...category,
          children: [],
          drugCount: category._count.drugs,
          childCount: category._count.childCategories,
        });
      });

      // Second pass: build hierarchy
      allCategories.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.id);
        if (category.parentCategoryId) {
          const parent = categoryMap.get(category.parentCategoryId);
          if (parent) {
            parent.children.push(categoryWithChildren);
          }
        } else {
          rootCategories.push(categoryWithChildren);
        }
      });

      console.log(`✅ [DRUG CATEGORIES API] Built hierarchy: ${rootCategories.length} root categories`);

      return NextResponse.json({
        categories: rootCategories,
        total: allCategories.length,
        structure: 'hierarchical',
      });

    } else {
      // Flat list
      const categories = await prisma.drugCategory.findMany({
        where,
        include: {
          parentCategory: {
            select: {
              id: true,
              categoryName: true,
              categoryCode: true,
            }
          },
          _count: {
            select: {
              childCategories: true,
              drugs: true,
            }
          }
        },
        orderBy: [
          { level: 'asc' },
          { sortOrder: 'asc' },
          { categoryName: 'asc' },
        ],
      });

      const enrichedCategories = categories.map(category => ({
        ...category,
        fullPath: category.parentCategory 
          ? `${category.parentCategory.categoryName} > ${category.categoryName}`
          : category.categoryName,
        drugCount: category._count.drugs,
        childCount: category._count.childCategories,
        hasChildren: category._count.childCategories > 0,
        hasDrugs: category._count.drugs > 0,
      }));

      console.log(`✅ [DRUG CATEGORIES API] Found ${categories.length} categories`);

      return NextResponse.json({
        categories: enrichedCategories,
        total: categories.length,
        structure: 'flat',
      });
    }

  } catch (error) {
    console.error('❌ [DRUG CATEGORIES API] GET Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่ยา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - สร้างหมวดหมู่ยาใหม่
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DRUG CATEGORIES API] Starting POST request...');
    
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
    const validatedData = createCategorySchema.parse(body);

    // Check for duplicate category code
    const existingCategory = await prisma.drugCategory.findFirst({
      where: {
        hospitalId,
        categoryCode: validatedData.categoryCode,
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: `รหัสหมวดหมู่ "${validatedData.categoryCode}" มีอยู่แล้ว` },
        { status: 400 }
      );
    }

    // Calculate level based on parent
    let level = 0;
    let parentCategory = null;

    if (validatedData.parentCategoryId) {
      parentCategory = await prisma.drugCategory.findFirst({
        where: {
          id: validatedData.parentCategoryId,
          hospitalId,
        }
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'ไม่พบหมวดหมู่แม่' },
          { status: 400 }
        );
      }

      level = parentCategory.level + 1;

      // Prevent deep nesting (max 4 levels)
      if (level > 3) {
        return NextResponse.json(
          { error: 'ไม่สามารถสร้างหมวดหมู่ย่อยได้เกิน 4 ระดับ' },
          { status: 400 }
        );
      }
    }

    // Create new category
    const newCategory = await prisma.drugCategory.create({
      data: {
        ...validatedData,
        hospitalId,
        level,
        isActive: true,
      },
      include: {
        parentCategory: {
          select: {
            id: true,
            categoryName: true,
            categoryCode: true,
          }
        }
      }
    });

    console.log('✅ [DRUG CATEGORIES API] Category created:', newCategory.id);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        hospitalId,
        userId: user.userId,
        action: 'CREATE',
        resource: 'DRUG_CATEGORY',
        resourceId: newCategory.id,
        details: {
          categoryCode: newCategory.categoryCode,
          categoryName: newCategory.categoryName,
          level: newCategory.level,
          parentCategoryId: newCategory.parentCategoryId,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    return NextResponse.json({
      category: {
        ...newCategory,
        fullPath: newCategory.parentCategory 
          ? `${newCategory.parentCategory.categoryName} > ${newCategory.categoryName}`
          : newCategory.categoryName,
      },
      message: `สร้างหมวดหมู่ยา "${newCategory.categoryName}" สำเร็จ`,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
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

    console.error('❌ [DRUG CATEGORIES API] POST Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่ยา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}