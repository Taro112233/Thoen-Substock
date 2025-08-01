// app/api/drugs/route.ts
// API endpoint for drug database queries

import { NextRequest, NextResponse } from 'next/server';
import { DRUG_DATABASE, getDrugsByCategory, getAllCategories, type DrugCategory } from '@/lib/constants/drugs';
import { DrugSearchRequestSchema } from '@/lib/validations/patient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') as DrugCategory | null;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Validate request parameters
    const validatedParams = DrugSearchRequestSchema.parse({
      query: query || undefined,
      category: category || undefined,
      limit
    });

    let results = [...DRUG_DATABASE];

    // Filter by category if specified
    if (validatedParams.category) {
      results = getDrugsByCategory(validatedParams.category as DrugCategory);
    }

    // Filter by search query if specified
    if (validatedParams.query && validatedParams.query.length > 0) {
      const searchTerm = validatedParams.query.toLowerCase();
      results = results.filter(drug => 
        drug.genericName.toLowerCase().includes(searchTerm) ||
        drug.brandNames.some(brand => brand.toLowerCase().includes(searchTerm)) ||
        drug.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply limit
    results = results.slice(0, validatedParams.limit);

    // Format response
    const response = {
      success: true,
      data: {
        drugs: results.map(drug => ({
          id: drug.id,
          genericName: drug.genericName,
          brandNames: drug.brandNames,
          category: drug.category,
          dosingRulesCount: drug.dosingRules.length,
          availableConcentrations: drug.dosingRules[0]?.concentrations || [],
          ageRanges: drug.dosingRules
            .filter(rule => rule.ageDisplay)
            .map(rule => rule.ageDisplay)
            .filter(Boolean)
        })),
        total: results.length,
        categories: getAllCategories()
      },
      query: validatedParams
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/drugs error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'การค้นหายาไม่สำเร็จ',
          details: error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในระบบ' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedParams = DrugSearchRequestSchema.parse(body);

    // Same logic as GET but with POST body
    let results = [...DRUG_DATABASE];

    if (validatedParams.category) {
      results = getDrugsByCategory(validatedParams.category as DrugCategory);
    }

    if (validatedParams.query && validatedParams.query.length > 0) {
      const searchTerm = validatedParams.query.toLowerCase();
      results = results.filter(drug => 
        drug.genericName.toLowerCase().includes(searchTerm) ||
        drug.brandNames.some(brand => brand.toLowerCase().includes(searchTerm)) ||
        drug.category.toLowerCase().includes(searchTerm)
      );
    }

    results = results.slice(0, validatedParams.limit);

    const response = {
      success: true,
      data: {
        drugs: results.map(drug => ({
          id: drug.id,
          genericName: drug.genericName,
          brandNames: drug.brandNames,
          category: drug.category,
          dosingRulesCount: drug.dosingRules.length,
          availableConcentrations: drug.dosingRules[0]?.concentrations || [],
          ageRanges: drug.dosingRules
            .filter(rule => rule.ageDisplay)
            .map(rule => rule.ageDisplay)
            .filter(Boolean),
          // Include full dosing rules for detailed view
          dosingRules: drug.dosingRules
        })),
        total: results.length,
        categories: getAllCategories()
      },
      query: validatedParams
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('POST /api/drugs error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'การค้นหายาไม่สำเร็จ',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}