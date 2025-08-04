// lib/validations/auth.ts - Updated Profile Completion Schema
import { z } from "zod";

// Registration Schema
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(20, "ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร")
    .regex(/^[a-zA-Z0-9_]+$/, "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _"),
  
  email: z
    .string()
    .email("กรุณากรอกอีเมลให้ถูกต้อง")
    .min(1, "กรุณากรอกอีเมล"),
  
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "รหัสผ่านต้องมีตัวอักษรเล็ก ใหญ่ และตัวเลข"),
  
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  
  hospitalId: z
    .string()
    .min(1, "กรุณาเลือกโรงพยาบาล"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

// Login Schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "กรุณากรอกชื่อผู้ใช้หรืออีเมล"),
  
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน"),
  
  hospitalId: z
    .string()
    .min(1, "กรุณาเลือกโรงพยาบาล"),
  
  rememberMe: z.boolean().optional().default(false),
});

// Profile Completion Schema - Fixed Department ID validation
export const profileCompletionSchema = z.object({
  firstName: z
    .string()
    .min(1, "กรุณากรอกชื่อ")
    .max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร"),
  
  lastName: z
    .string()
    .min(1, "กรุณากรอกนามสกุล")
    .max(50, "นามสกุลต้องไม่เกิน 50 ตัวอักษร"),
  
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก")
    .min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  
  employeeId: z
    .string()
    .min(1, "กรุณากรอกรหัสพนักงาน")
    .max(20, "รหัสพนักงานต้องไม่เกิน 20 ตัวอักษร"),
  
  position: z
    .string()
    .min(1, "กรุณากรอกตำแหน่ง")
    .max(100, "ตำแหน่งต้องไม่เกิน 100 ตัวอักษร"),
  
  // Department is optional - allow empty string
  departmentId: z
    .string()
    .optional()
    .or(z.literal("")), // Allow empty string for optional field
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;

// Legacy support
export type RegisterFormData = RegisterInput;
export type LoginFormData = LoginInput;