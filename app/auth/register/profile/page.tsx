// app/auth/register/profile/page.tsx
import { redirect } from "next/navigation";
import ProfileForm from "@/app/auth/components/ProfileForm";
import { getCurrentUser } from "@/lib/auth-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ข้อมูลส่วนตัว | ระบบจัดการสต็อกยา",
  description: "กรอกข้อมูลส่วนตัวเพื่อเสร็จสิ้นการสมัครสมาชิก",
};

export default async function ProfilePage() {
  // Temporarily disable auth checks for testing
  // const user = await getCurrentUser();
  
  // if (!user) {
  //   redirect("/auth/login");
  // }
  
  // if (user.isProfileComplete) {
  //   if (user.status === "PENDING") {
  //     redirect("/auth/pending-approval");
  //   } else if (user.status === "ACTIVE") {
  //     redirect("/dashboard");
  //   }
  // }

  return <ProfileForm />;
}