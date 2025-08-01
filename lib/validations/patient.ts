// lib/validations/patient.ts
// Zod validation schemas for patient data and calculations

import { z } from 'zod';

// Patient input validation
export const PatientInputSchema = z.object({
  ageYears: z
    .number()
    .min(0, 'อายุต้องมากกว่า 0')
    .max(18, 'ระบบนี้สำหรับเด็กอายุไม่เกิน 18 ปี')
    .refine((age) => age > 0, 'กรุณากรอกอายุ'),
  
  ageMonths: z
    .number()
    .min(0, 'เดือนต้องมากกว่าหรือเท่ากับ 0')
    .max(11, 'เดือนต้องไม่เกิน 11')
    .optional()
    .default(0),
    
  weight: z
    .number()
    .min(1, 'น้ำหนักต้องมากกว่า 1 kg')
    .max(150, 'น้ำหนักต้องไม่เกิน 150 kg')
    .optional(),
    
  gender: z
    .enum(['male', 'female'])
    .optional()
}).refine((data) => {
  // If age < 10 years, months can be specified
  if (data.ageYears < 10 && data.ageMonths && data.ageMonths > 0) {
    return true;
  }
  // For age >= 10, months should be 0 or undefined
  if (data.ageYears >= 10 && data.ageMonths && data.ageMonths > 0) {
    return false;
  }
  return true;
}, {
  message: 'เด็กอายุ 10 ปีขึ้นไปไม่ต้องระบุเดือน',
  path: ['ageMonths']
});

// Drug concentration validation
export const ConcentrationSchema = z.object({
  mg: z
    .number()
    .min(0.1, 'ขนาดยาต้องมากกว่า 0.1 mg')
    .max(10000, 'ขนาดยาต้องไม่เกิน 10,000 mg'),
    
  ml: z
    .number()
    .min(0.1, 'ปริมาตรต้องมากกว่า 0.1 mL')
    .max(1000, 'ปริมาตรต้องไม่เกิน 1,000 mL'),
    
  label: z
    .string()
    .min(1, 'ต้องมีป้ายกำกับ')
});

// Calculation input validation
export const CalculationInputSchema = z.object({
  patient: PatientInputSchema,
  
  drugId: z
    .string()
    .min(1, 'กรุณาเลือกยา'),
    
  concentration: ConcentrationSchema,
  
  frequency: z
    .enum(['OD', 'BID', 'TID', 'QID', 'q4-6h', 'q6-8h', 'q8h', 'q12h', 'PRN'])
    .refine((freq) => freq !== undefined, 'กรุณาเลือกความถี่การให้ยา')
});

// API request validation schemas
export const DrugSearchRequestSchema = z.object({
  query: z
    .string()
    .min(1, 'กรุณากรอกคำค้นหา')
    .max(100, 'คำค้นหาต้องไม่เกิน 100 ตัวอักษร')
    .optional(),
    
  category: z
    .string()
    .optional(),
    
  limit: z
    .number()
    .min(1)
    .max(50)
    .default(20)
});

export const CalculationRequestSchema = z.object({
  patientData: z.object({
    ageYears: z.number().min(0).max(18),
    ageMonths: z.number().min(0).max(11).optional().default(0),
    weight: z.number().min(1).max(150).optional(),
    gender: z.enum(['male', 'female']).optional()
  }),
  
  drugId: z.string().min(1),
  
  concentration: z.object({
    mg: z.number().min(0.1).max(10000),
    ml: z.number().min(0.1).max(1000),
    label: z.string().min(1)
  }),
  
  frequency: z.enum(['OD', 'BID', 'TID', 'QID', 'q4-6h', 'q6-8h', 'q8h', 'q12h', 'PRN'])
});

// Helper function to calculate total age in years
export const calculateTotalAge = (ageYears: number, ageMonths: number = 0): number => {
  return ageYears + (ageMonths / 12);
};

// Helper function to validate weight for age
export const validateWeightForAge = (ageYears: number, weight: number): {
  isValid: boolean;
  warning?: string;
  expectedRange: { min: number; max: number };
} => {
  // Simple weight-for-age estimation (rough guidelines)
  const expectedWeight = ageYears < 2 
    ? (ageYears * 4 + 8)  // Infants/toddlers
    : (ageYears * 2 + 8); // Children
    
  const tolerance = 0.3; // 30% tolerance
  const minExpected = expectedWeight * (1 - tolerance);
  const maxExpected = expectedWeight * (1 + tolerance);
  
  let warning: string | undefined;
  
  if (weight < minExpected) {
    warning = `น้ำหนักต่ำกว่าเกณฑ์ปกติ (คาดหวัง ${minExpected.toFixed(1)}-${maxExpected.toFixed(1)} kg)`;
  } else if (weight > maxExpected) {
    warning = `น้ำหนักสูงกว่าเกณฑ์ปกติ (คาดหวัง ${minExpected.toFixed(1)}-${maxExpected.toFixed(1)} kg)`;
  }
  
  return {
    isValid: weight >= minExpected && weight <= maxExpected,
    warning,
    expectedRange: { 
      min: Math.round(minExpected * 10) / 10, 
      max: Math.round(maxExpected * 10) / 10 
    }
  };
};

// Type exports from schemas
export type PatientInput = z.infer<typeof PatientInputSchema>;
export type DrugConcentration = z.infer<typeof ConcentrationSchema>;
export type CalculationInput = z.infer<typeof CalculationInputSchema>;
export type DrugSearchRequest = z.infer<typeof DrugSearchRequestSchema>;
export type CalculationRequest = z.infer<typeof CalculationRequestSchema>;