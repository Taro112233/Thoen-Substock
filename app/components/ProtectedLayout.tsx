// app/components/ProtectedLayout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { checkUserStatusAndRedirect } from "@/lib/auth-utils";

interface ProtectedLayoutProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export default async function ProtectedLayout({ 
  children, 
  requiredRoles 
}: ProtectedLayoutProps) {
  // ตรวจสอบสถานะผู้ใช้และ redirect หากจำเป็น
  const user = await checkUserStatusAndRedirect();
  
  // ตรวจสอบสิทธิ์หากมีการกำหนด required roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      redirect("/unauthorized");
    }
  }
  
  return <>{children}</>;
}