// app/api/drugs/[id]/route.ts
// API endpoint for individual drug details

import { NextRequest, NextResponse } from 'next/server';
import { getDrugById } from '@/lib/constants/drugs';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'กรุณาระบุรหัสยา' 
        },
        { status: 400 }
      );
    }

    const drug = getDrugById(id);

    if (!drug) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ไม่พบยาที่ระบุ' 
        },
        { status: 404 }
      );
    }

    // Format detailed drug information
    const response = {
      success: true,
      data: {
        id: drug.id,
        genericName: drug.genericName,
        brandNames: drug.brandNames,
        category: drug.category,
        dosingRules: drug.dosingRules.map(rule => ({
          id: rule.id,
          type: rule.type,
          minDose: rule.minDose,
          maxDose: rule.maxDose,
          dose: rule.dose,
          unit: rule.unit,
          frequencies: rule.frequencies,
          ageMinYears: rule.ageMinYears,
          ageMaxYears: rule.ageMaxYears,
          ageDisplay: rule.ageDisplay,
          priority: rule.priority || 0,
          concentrations: rule.concentrations,
          // Add calculated information
          dosageRange: rule.minDose && rule.maxDose 
            ? `${rule.minDose}-${rule.maxDose} ${rule.unit}`
            : rule.dose 
            ? `${rule.dose} ${rule.unit}`
            : `${rule.minDose} ${rule.unit}`,
          frequencyLabels: rule.frequencies.map(freq => {
            const labels: Record<string, string> = {
              'OD': 'วันละ 1 ครั้ง',
              'BID': 'วันละ 2 ครั้ง',
              'TID': 'วันละ 3 ครั้ง',
              'QID': 'วันละ 4 ครั้ง',
              'q4-6h': 'ทุก 4-6 ชั่วโมง',
              'q6-8h': 'ทุก 6-8 ชั่วโมง',
              'q8h': 'ทุก 8 ชั่วโมง',
              'q12h': 'ทุก 12 ชั่วโมง',
              'PRN': 'เมื่อจำเป็น'
            };
            return {
              code: freq,
              label: labels[freq] || freq
            };
          })
        })),
        // Summary information
        summary: {
          totalRules: drug.dosingRules.length,
          ageBasedRules: drug.dosingRules.filter(r => r.type === 'age_based').length,
          weightBasedRules: drug.dosingRules.filter(r => r.type === 'weight_based').length,
          availableConcentrations: [
            ...new Set(
              drug.dosingRules
                .flatMap(rule => rule.concentrations)
                .map(conc => conc.label)
            )
          ],
          ageRanges: [
            ...new Set(
              drug.dosingRules
                .filter(rule => rule.ageDisplay)
                .map(rule => rule.ageDisplay)
            )
          ].filter(Boolean),
          frequencies: [
            ...new Set(
              drug.dosingRules.flatMap(rule => rule.frequencies)
            )
          ]
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error(`GET /api/drugs/${params.id} error:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูลยา',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}