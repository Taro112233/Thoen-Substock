// lib/auth-utils.ts
import { auth } from "@/app/utils/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ดึงข้อมูล session ปัจจุบัน
export async function getCurrentSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

// ดึงข้อมูลผู้ใช้ปัจจุบัน
export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session?.user) return null;
  
  // ดึงข้อมูลผู้ใช้เพิ่มเติมจาก database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      hospital: true,
      department: true,
    },
  });
  
  return user;
}

// ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

// ตรวจสอบสถานะผู้ใช้และ redirect ตามความเหมาะสม
export async function checkUserStatusAndRedirect() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  // ถ้าข้อมูลส่วนตัวยังไม่สมบูรณ์
  if (!user.isProfileComplete) {
    redirect("/auth/register/profile");
  }
  
  // ถ้าสถานะยังรอการอนุมัติ
  if (user.status === "PENDING") {
    redirect("/auth/pending-approval");
  }
  
  // ถ้าบัญชีถูกระงับ
  if (user.status === "SUSPENDED" || user.status === "INACTIVE") {
    redirect("/auth/suspended");
  }
  
  return user;
}

// ตรวจสอบสิทธิ์ตามบทบาท
export function hasRole(user: any, roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return allowedRoles.includes(user.role);
}

// ตรวจสอบว่าเป็น admin หรือไม่
export function isAdmin(user: any) {
  return hasRole(user, ["HOSPITAL_ADMIN", "PHARMACY_MANAGER"]);
}

// ตรวจสอบสิทธิ์ในการอนุมัติผู้ใช้
export function canApproveUsers(user: any) {
  return hasRole(user, [
    "HOSPITAL_ADMIN", 
    "PHARMACY_MANAGER", 
    "SENIOR_PHARMACIST"
  ]);
}

// สร้าง role options สำหรับ form
export const roleOptions = [
  { value: "PHARMACY_MANAGER", label: "ผู้จัดการเภสัชกรรม" },
  { value: "SENIOR_PHARMACIST", label: "เภสัชกรอาวุโส" },
  { value: "STAFF_PHARMACIST", label: "เภสัชกรประจำ" },
  { value: "DEPARTMENT_HEAD", label: "หัวหน้าแผนก" },
  { value: "STAFF_NURSE", label: "พยาบาลประจำ" },
  { value: "PHARMACY_TECHNICIAN", label: "เทคนิคเภสัชกรรม" },
];

// สร้าง position options สำหรับ profile form
export const positionOptions = [
  { value: "PHARMACIST", label: "เภสัชกร" },
  { value: "NURSE", label: "พยาบาล" },
  { value: "TECHNICIAN", label: "เทคนิค" },
  { value: "MANAGER", label: "ผู้จัดการ" },
  { value: "HEAD", label: "หัวหน้าแผนก" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ" },
];

// Helper สำหรับแปลงสถานะเป็นภาษาไทย
export function translateUserStatus(status: string) {
  const statusMap: Record<string, string> = {
    PENDING: "รอการอนุมัติ",
    ACTIVE: "ใช้งานได้",
    INACTIVE: "ปิดการใช้งานชั่วคราว",
    SUSPENDED: "ระงับการใช้งาน",
    DELETED: "ลบแล้ว",
  };
  
  return statusMap[status] || status;
}

// Helper สำหรับแปลงบทบาทเป็นภาษาไทย
export function translateUserRole(role: string) {
  const roleMap: Record<string, string> = {
    HOSPITAL_ADMIN: "ผู้ดูแลระบบโรงพยาบาล",
    PHARMACY_MANAGER: "ผู้จัดการเภสัชกรรม",
    SENIOR_PHARMACIST: "เภสัชกรอาวุโส",
    STAFF_PHARMACIST: "เภสัชกรประจำ",
    DEPARTMENT_HEAD: "หัวหน้าแผนก",
    STAFF_NURSE: "พยาบาลประจำ",
    PHARMACY_TECHNICIAN: "เทคนิคเภสัชกรรม",
  };
  
  return roleMap[role] || role;
}