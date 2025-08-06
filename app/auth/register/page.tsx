// app/auth/register/page.tsx - เฉพาะ Register Page เท่านั้น
import RegisterForm from "@/app/auth/components/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "สมัครสมาชิก | ระบบจัดการสต็อกยา",
  description: "สมัครสมาชิกเพื่อเข้าใช้งานระบบจัดการสต็อกยาโรงพยาบาล",
};

export default function RegisterPage() {
  return <RegisterForm />;
}