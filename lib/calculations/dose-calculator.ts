// lib/calculations/dose-calculator.ts
// Core pediatric dose calculation engine

import { type Drug, type DosingRule, type DrugConcentration, type FrequencyKey, getTimesPerDay } from '@/lib/constants/drugs';

export interface PatientData {
  ageYears: number;
  weight?: number;
  gender?: 'male' | 'female';
}

export interface CalculationInput {
  patient: PatientData;
  drug: Drug;
  concentration: DrugConcentration;
  frequency: FrequencyKey;
}

export interface CalculationResult {
  doseInMg: number;
  volumeInMl: number;
  frequency: FrequencyKey;
  frequencyLabel: string;
  timesPerDay: number;
  rule: DosingRule;
  drug: Drug;
  concentration: DrugConcentration;
  warnings: string[];
  calculations: {
    step1: string; // Age/weight → dose calculation
    step2: string; // mg → mL conversion
    step3: string; // Daily → per dose conversion (if applicable)
  };
}

/**
 * Find the most appropriate dosing rule for a patient
 * Priority: age-based with higher priority > age-based > weight-based
 */
export function findApplicableRule(drug: Drug, patient: PatientData): DosingRule | null {
  const { ageYears, weight } = patient;
  
  const applicableRules = drug.dosingRules.filter(rule => {
    // Check age bounds
    if (ageYears < rule.ageMinYears || ageYears > rule.ageMaxYears) {
      return false;
    }
    
    // For weight-based rules, require weight
    if (rule.type === 'weight_based' && !weight) {
      return false;
    }
    
    return true;
  });
  
  if (applicableRules.length === 0) return null;
  
  // Sort by priority (higher first), then by type preference (age-based first)
  const sortedRules = applicableRules.sort((a, b) => {
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    // If same priority, prefer age-based over weight-based
    if (a.type === 'age_based' && b.type === 'weight_based') return -1;
    if (a.type === 'weight_based' && b.type === 'age_based') return 1;
    
    return 0;
  });
  
  return sortedRules[0];
}

/**
 * Calculate pediatric dose based on rule and patient data
 */
export function calculateDose(input: CalculationInput): CalculationResult {
  const { patient, drug, concentration, frequency } = input;
  const rule = findApplicableRule(drug, patient);
  
  if (!rule) {
    throw new Error(`No applicable dosing rule found for ${drug.genericName} (age: ${patient.ageYears}y, weight: ${patient.weight}kg)`);
  }
  
  let doseInMg = 0;
  const calculationSteps = {
    step1: '',
    step2: '',
    step3: ''
  };
  
  const timesPerDay = getTimesPerDay(frequency);
  
  if (rule.type === 'weight_based') {
    if (!patient.weight) {
      throw new Error('Weight is required for weight-based dosing');
    }
    
    const avgDose = rule.maxDose ? (rule.minDose! + rule.maxDose) / 2 : rule.minDose!;
    
    if (rule.unit === 'mg/kg/dose') {
      doseInMg = avgDose * patient.weight;
      calculationSteps.step1 = `${avgDose} mg/kg/dose × ${patient.weight} kg = ${doseInMg} mg/dose`;
    } else if (rule.unit === 'mg/kg/day') {
      const dailyDose = avgDose * patient.weight;
      doseInMg = dailyDose / timesPerDay;
      calculationSteps.step1 = `${avgDose} mg/kg/day × ${patient.weight} kg = ${dailyDose} mg/day`;
      calculationSteps.step3 = `${dailyDose} mg/day ÷ ${timesPerDay} ครั้ง/วัน = ${doseInMg} mg/dose`;
    }
  } else if (rule.type === 'age_based') {
    if (rule.unit === 'mg/dose') {
      doseInMg = rule.maxDose || rule.dose!;
      calculationSteps.step1 = `${rule.ageDisplay}: ${doseInMg} mg/dose`;
    } else if (rule.unit === 'mg/day') {
      const ageDailyDose = rule.maxDose || rule.dose!;
      doseInMg = ageDailyDose / timesPerDay;
      calculationSteps.step1 = `${rule.ageDisplay}: ${ageDailyDose} mg/day`;
      calculationSteps.step3 = `${ageDailyDose} mg/day ÷ ${timesPerDay} ครั้ง/วัน = ${doseInMg} mg/dose`;
    }
  }
  
  // Round to 2 decimal places
  doseInMg = Math.round(doseInMg * 100) / 100;
  
  // Calculate volume in mL
  const mgPerMl = concentration.mg / concentration.ml;
  const volumeInMl = Math.round((doseInMg / mgPerMl) * 100) / 100;
  
  calculationSteps.step2 = `${doseInMg} mg ÷ (${concentration.mg} mg/${concentration.ml} mL) = ${volumeInMl} mL/dose`;
  
  // Generate warnings
  const warnings = generateWarnings(patient, rule, doseInMg, volumeInMl);
  
  return {
    doseInMg,
    volumeInMl,
    frequency,
    frequencyLabel: getFrequencyLabel(frequency),
    timesPerDay,
    rule,
    drug,
    concentration,
    warnings,
    calculations: calculationSteps
  };
}

/**
 * Generate safety warnings based on calculation
 */
function generateWarnings(patient: PatientData, rule: DosingRule, doseInMg: number, volumeInMl: number): string[] {
  const warnings: string[] = [];
  
  // Weight validation warnings
  if (patient.weight && patient.ageYears) {
    const expectedWeight = patient.ageYears < 2 
      ? (patient.ageYears * 4 + 8) 
      : (patient.ageYears * 2 + 8);
    
    const tolerance = 0.3; // 30%
    
    if (patient.weight < expectedWeight * (1 - tolerance)) {
      warnings.push('น้ำหนักต่ำกว่าเกณฑ์ปกติ - ตรวจสอบความเหมาะสม');
    } else if (patient.weight > expectedWeight * (1 + tolerance)) {
      warnings.push('น้ำหนักสูงกว่าเกณฑ์ปกติ - ตรวจสอบความเหมาะสม');
    }
  }
  
  // Volume warnings for practical measurement
  if (volumeInMl < 0.5) {
    warnings.push('ปริมาตรน้อยมาก - ใช้หลอดฉีดยาแบบแม่นยำ');
  } else if (volumeInMl > 20) {
    warnings.push('ปริมาตรมากเกินไป - ตรวจสอบการคำนวณ');
  }
  
  // Age-specific warnings
  if (patient.ageYears < 0.5) {
    warnings.push('เด็กอายุน้อยมาก - ปรึกษาแพทย์ก่อนให้ยา');
  }
  
  // Drug-specific warnings
  if (rule.type === 'weight_based' && !patient.weight) {
    warnings.push('ต้องการน้ำหนักสำหรับการคำนวณที่แม่นยำ');
  }
  
  return warnings;
}

/**
 * Get frequency label in Thai
 */
function getFrequencyLabel(frequency: FrequencyKey): string {
  const labels: Record<FrequencyKey, string> = {
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
  return labels[frequency];
}

/**
 * Validate patient data
 */
export function validatePatientData(patient: Partial<PatientData>): PatientData {
  if (!patient.ageYears || patient.ageYears <= 0) {
    throw new Error('อายุจำเป็นต้องมีค่ามากกว่า 0');
  }
  
  if (patient.ageYears > 18) {
    throw new Error('ระบบนี้สำหรับเด็กอายุไม่เกิน 18 ปี');
  }
  
  if (patient.weight && patient.weight <= 0) {
    throw new Error('น้ำหนักจำเป็นต้องมีค่ามากกว่า 0');
  }
  
  return patient as PatientData;
}

/**
 * Get practical measurement guidance
 */
export function getMeasurementGuidance(volumeInMl: number): string {
  if (volumeInMl <= 1) {
    return "ใช้หลอดฉีดยาสำหรับเด็ก (oral syringe) สำหรับการวัดที่แม่นยำ";
  } else if (volumeInMl <= 5) {
    return `วัดด้วยช้อนยา หรือหลอดฉีดยา ประมาณ ${volumeInMl} mL`;
  } else if (volumeInMl <= 15) {
    return `วัดด้วยช้อนยาขนาดใหญ่ หรือถ้วยยา ประมาณ ${volumeInMl} mL`;
  } else {
    return `ปริมาตรมาก (${volumeInMl} mL) - แบ่งให้หลายครั้งหรือตรวจสอบการคำนวณ`;
  }
}