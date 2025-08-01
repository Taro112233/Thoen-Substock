// app/api/calculations/route.ts
// API endpoint for dose calculations

import { NextRequest, NextResponse } from 'next/server';
import { CalculationRequestSchema, calculateTotalAge } from '@/lib/validations/patient';
import { calculateDose, type CalculationInput, validatePatientData } from '@/lib/calculations/dose-calculator';
import { getDrugById } from '@/lib/constants/drugs';
import { getMeasurementGuidance } from '@/lib/calculations/dose-calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedRequest = CalculationRequestSchema.parse(body);
    
    const { patientData, drugId, concentration, frequency } = validatedRequest;
    
    // Get drug from database
    const drug = getDrugById(drugId);
    if (!drug) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ไม่พบยาที่ระบุในระบบ' 
        },
        { status: 404 }
      );
    }
    
    // Calculate total age in years
    const totalAgeYears = calculateTotalAge(
      patientData.ageYears, 
      patientData.ageMonths || 0
    );
    
    // Prepare patient data
    const patient = validatePatientData({
      ageYears: totalAgeYears,
      weight: patientData.weight,
      gender: patientData.gender
    });
    
    // Prepare calculation input
    const calculationInput: CalculationInput = {
      patient,
      drug,
      concentration,
      frequency
    };
    
    // Perform calculation
    const result = calculateDose(calculationInput);
    
    // Add practical guidance
    const measurementGuidance = getMeasurementGuidance(result.volumeInMl);
    
    // Format response
    const response = {
      success: true,
      data: {
        // Patient information
        patient: {
          ageYears: patientData.ageYears,
          ageMonths: patientData.ageMonths || 0,
          totalAgeYears: Math.round(totalAgeYears * 100) / 100,
          weight: patientData.weight,
          gender: patientData.gender
        },
        
        // Drug information
        drug: {
          id: result.drug.id,
          name: result.drug.genericName,
          category: result.drug.category,
          brandNames: result.drug.brandNames
        },
        
        // Dosing rule used
        rule: {
          id: result.rule.id,
          type: result.rule.type,
          ageDisplay: result.rule.ageDisplay,
          dosageInfo: result.rule.minDose && result.rule.maxDose 
            ? `${result.rule.minDose}-${result.rule.maxDose} ${result.rule.unit}`
            : result.rule.dose 
            ? `${result.rule.dose} ${result.rule.unit}`
            : `${result.rule.minDose} ${result.rule.unit}`
        },
        
        // Calculation results
        calculation: {
          doseInMg: result.doseInMg,
          volumeInMl: result.volumeInMl,
          frequency: result.frequency,
          frequencyLabel: result.frequencyLabel,
          timesPerDay: result.timesPerDay,
          concentration: {
            ...result.concentration,
            mgPerMl: result.concentration.mg / result.concentration.ml
          }
        },
        
        // Step-by-step calculation
        steps: result.calculations,
        
        // Warnings and guidance
        warnings: result.warnings,
        measurementGuidance,
        
        // Additional information
        metadata: {
          calculatedAt: new Date().toISOString(),
          ruleUsed: result.rule.type,
          hasWarnings: result.warnings.length > 0,
          // Safe dose ranges for reference
          dailyDoseRange: {
            mg: result.doseInMg * result.timesPerDay,
            mL: result.volumeInMl * result.timesPerDay
          }
        }
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('POST /api/calculations error:', error);
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
          details: error.issues || error.message
        },
        { status: 400 }
      );
    }
    
    // Handle calculation errors
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'การคำนวณไม่สำเร็จ',
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

// GET endpoint for calculation history (future implementation)
export async function GET() {
  try {
    // TODO: Implement calculation history retrieval
    // This would require authentication and database storage
    
    return NextResponse.json({
      success: true,
      message: 'ประวัติการคำนวณจะพร้อมใช้งานในเร็วๆ นี้',
      data: {
        calculations: [],
        total: 0
      }
    });
    
  } catch (error) {
    console.error('GET /api/calculations error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'เกิดข้อผิดพลาดในการดึงประวัติ' 
      },
      { status: 500 }
    );
  }
}