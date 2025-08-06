// app/auth/login/page.tsx
import LoginForm from "@/app/auth/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | ระบบจัดการสต็อกยา",
  description: "เข้าสู่ระบบจัดการสต็อกยาโรงพยาบาล",
};

export default function LoginPage() {
  return <LoginForm />;
}