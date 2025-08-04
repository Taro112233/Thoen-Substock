// app/auth/pending-approval/page.tsx
import { redirect } from "next/navigation";
import PendingApprovalCard from "@/app/auth/components/PendingApprovalCard";
import { getCurrentUser } from "@/lib/auth-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "รอการอนุมัติ | ระบบจัดการสต็อกยา",
  description: "บัญชีของคุณรอการอนุมัติจากผู้ดูแลระบบ",
};

export default async function PendingApprovalPage() {
  // Temporarily disable auth checks for testing
  // const user = await getCurrentUser();
  
  // if (!user) {
  //   redirect("/auth/login");
  // }
  
  // if (!user.isProfileComplete) {
  //   redirect("/auth/register/profile");
  // }
  
  // if (user.status === "ACTIVE") {
  //   redirect("/dashboard");
  // }

  return <PendingApprovalCard />;
}