// lib/validations/auth.ts - อัปเดต validation schema
import { z } from "zod";

// Registration Schema - รองรับ fields ที่จำเป็น
export const registerSchema = z.object({
  email: z
    .string()
    .email("กรุณากรอกอีเมลให้ถูกต้อง")
    .min(1, "กรุณากรอกอีเมล"),
  
  username: z
    .string()
    .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(20, "ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร")
    .regex(/^[a-zA-Z0-9_]+$/, "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _"),
  
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "รหัสผ่านต้องมีตัวอักษรเล็ก ใหญ่ และตัวเลข"),
  
  confirmPassword: z.string(),
  
  hospitalId: z
    .string()
    .min(1, "กรุณาเลือกโรงพยาบาล"),
  
  // Optional fields for enhanced registration
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  employeeId: z.string().optional(),
  position: z.string().optional(),
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

// Profile Completion Schema
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
    .optional()
    .or(z.literal("")),
  
  employeeId: z
    .string()
    .min(1, "กรุณากรอกรหัสพนักงาน")
    .max(20, "รหัสพนักงานต้องไม่เกิน 20 ตัวอักษร"),
  
  position: z
    .string()
    .min(1, "กรุณากรอกตำแหน่ง")
    .max(100, "ตำแหน่งต้องไม่เกิน 100 ตัวอักษร"),
  
  departmentId: z
    .string()
    .optional(),
});

// Password Reset Schema
export const passwordResetSchema = z.object({
  email: z
    .string()
    .email("กรุณากรอกอีเมลให้ถูกต้อง")
    .min(1, "กรุณากรอกอีเมล"),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
  
  newPassword: z
    .string()
    .min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "รหัสผ่านต้องมีตัวอักษรเล็ก ใหญ่ และตัวเลข"),
  
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "รหัสผ่านใหม่ไม่ตรงกัน",
  path: ["confirmNewPassword"],
});

// Type exports สำหรับ TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileCompletionInput = z.infer<typeof profileCompletionSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;