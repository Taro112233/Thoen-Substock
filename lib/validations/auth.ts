// lib/validations/auth.ts
import { z } from "zod";

// Schema สำหรับการสมัครสมาชิก (Step 1)
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
    .max(20, "ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร")
    .regex(/^[a-zA-Z0-9_]+$/, "ชื่อผู้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _"),
  
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .min(1, "กรุณากรอกอีเมล"),
  
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข"),
  
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

// Schema สำหรับข้อมูลส่วนตัว (Step 2)
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "กรุณากรอกชื่อ")
    .max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร"),
  
  lastName: z
    .string()
    .min(1, "กรุณากรอกนามสกุล")
    .max(50, "นามสกุลต้องไม่เกิน 50 ตัวอักษร"),
  
  position: z
    .string()
    .min(1, "กรุณาเลือกตำแหน่ง"),
  
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก")
    .min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  
  hospitalId: z
    .string()
    .min(1, "กรุณาเลือกหน่วยงาน"),
  
  departmentId: z
    .string()
    .optional(),
});

// Schema สำหรับการเข้าสู่ระบบ
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "กรุณากรอกชื่อผู้ใช้"),
  
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน"),
  
  hospitalId: z
    .string()
    .min(1, "กรุณาเลือกหน่วยงาน"),
});

// Types
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;