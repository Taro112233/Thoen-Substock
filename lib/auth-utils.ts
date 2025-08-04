// lib/auth-utils.ts - ปิดชั่วคราวเพื่อทดสอบ UI
import { redirect } from "next/navigation";

// Mock functions for testing UI
export async function getCurrentSession() {
  return null;
}

export async function getCurrentUser() {
  return null;
}

export async function requireAuth() {
  redirect("/auth/login");
}

export async function checkUserStatusAndRedirect() {
  redirect("/auth/login");
}

export function hasRole(user: any, roles: string | string[]) {
  return false;
}

export function isAdmin(user: any) {
  return false;
}

export function canApproveUsers(user: any) {
  return false;
}

// Position options สำหรับ form
export const positionOptions = [
  { value: "PHARMACIST", label: "เภสัชกร" },
  { value: "NURSE", label: "พยาบาล" },
  { value: "TECHNICIAN", label: "เทคนิค" },
  { value: "MANAGER", label: "ผู้จัดการ" },
  { value: "HEAD", label: "หัวหน้าแผนก" },
  { value: "ADMIN", label: "ผู้ดูแลระบบ" },
];

// Role options สำหรับ form
export const roleOptions = [
  { value: "PHARMACY_MANAGER", label: "ผู้จัดการเภสัชกรรม" },
  { value: "SENIOR_PHARMACIST", label: "เภสัชกรอาวุโส" },
  { value: "STAFF_PHARMACIST", label: "เภสัชกรประจำ" },
  { value: "DEPARTMENT_HEAD", label: "หัวหน้าแผนก" },
  { value: "STAFF_NURSE", label: "พยาบาลประจำ" },
  { value: "PHARMACY_TECHNICIAN", label: "เทคนิคเภสัชกรรม" },
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