// components/layout/ConditionalHeader.tsx
'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from '@/app/components/AdminHeader';

export default function ConditionalHeader() {
  const pathname = usePathname();

  // กำหนดเส้นทางที่ไม่ต้องการแสดง header
  const hideHeaderPaths = [
    '/auth',
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/setup-hospital',
    '/auth/setup-admin',
    '/maintenance',
    '/404',
    '/500',
  ];

  // ตรวจสอบว่าอยู่ในหน้าที่ต้องซ่อน header หรือไม่
  const shouldHideHeader = hideHeaderPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // ถ้าต้องซ่อน header ก็ไม่แสดงอะไร
  if (shouldHideHeader) {
    return null;
  }

  // แสดง header ตามปกติ
  return <AdminHeader />;
}