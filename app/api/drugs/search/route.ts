// app/api/drugs/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateUserAuth } from '@/lib/auth-middleware';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DRUG SEARCH API] Searching drugs');
    
    const authResult = await validateUserAuth(request);
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    
    const searchQuery = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // สร้าง where conditions
    const whereConditions: any = {
      hospitalId: user.hospitalId,
      isActive: true
    };

    // ค้นหาตามคำค้นหา
    if (searchQuery.trim().length > 0) {
      const searchTerm = searchQuery.trim();
      whereConditions.OR = [
        { hospitalDrugCode: { contains: searchTerm, mode: 'insensitive' } },
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { genericName: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // ดึงข้อมูลยา
    const drugs = await prisma.drug.findMany({
      where: whereConditions,
      select: {
        id: true,
        hospitalDrugCode: true,
        name: true,
        genericName: true,
        dosageForm: true,
        strength: true,
        unit: true,
        isControlled: true,
        isDangerous: true,
        isHighAlert: true,
        unitCost: true
      },
      orderBy: [
        { name: 'asc' },
        { hospitalDrugCode: 'asc' }
      ],
      take: limit
    });

    // แปลงข้อมูลเพื่อให้ใช้งานง่าย
    const processedDrugs = drugs.map(drug => ({
      id: drug.id,
      hospitalDrugCode: drug.hospitalDrugCode,
      name: drug.name,
      genericName: drug.genericName,
      dosageForm: drug.dosageForm,
      strength: drug.strength,
      unit: drug.unit,
      isControlled: drug.isControlled,
      isDangerous: drug.isDangerous,
      isHighAlert: drug.isHighAlert,
      unitCost: drug.unitCost,
      displayName: `${drug.name} ${drug.strength} (${drug.dosageForm})`,
      searchText: `${drug.hospitalDrugCode} ${drug.name} ${drug.genericName || ''} ${drug.strength} ${drug.dosageForm}`.toLowerCase()
    }));

    console.log(`✅ [DRUG SEARCH API] Found ${drugs.length} drugs`);

    return NextResponse.json({
      success: true,
      data: processedDrugs,
      total: drugs.length,
      query: searchQuery
    });

  } catch (error) {
    console.error('❌ [DRUG SEARCH API] Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการค้นหายา' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}