// app/auth/components/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, LogIn, User, Building2 } from "lucide-react";

interface Hospital {
  id: string;
  name: string;
}

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // โหลดข้อมูลโรงพยาบาล
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("/api/hospitals");
        if (response.ok) {
          const data = await response.json();
          setHospitals(data);
        }
      } catch (err) {
        console.error("Failed to fetch hospitals:", err);
      }
    };

    fetchHospitals();
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // ตรวจสอบสถานะและ redirect ตามความเหมาะสม
        if (result.needsProfileCompletion) {
          router.push("/auth/register/profile");
        } else if (result.needsApproval) {
          router.push("/auth/pending-approval");
        } else {
          router.push(callbackUrl);
        }
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                ยินดีต้อนรับกลับสู่ระบบจัดการสต็อกยา
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert variant="error" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                ชื่อผู้ใช้
              </Label>
              <div className="relative">
                <Input
                  {...register("username")}
                  id="username"
                  placeholder="กรอกชื่อผู้ใช้"
                  disabled={isLoading}
                  autoComplete="username"
                  className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                รหัสผ่าน
              </Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่าน"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="pr-10 h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalId" className="text-sm font-medium text-gray-700">
                หน่วยงาน
              </Label>
              <div className="relative">
                <Select onValueChange={(value) => setValue("hospitalId", value)} disabled={isLoading}>
                  <SelectTrigger className="h-11 pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="เลือกหน่วยงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.hospitalId && (
                <p className="text-sm text-red-500 mt-1">{errors.hospitalId.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                เข้าสู่ระบบ
              </Button>
            </div>

            <div className="text-center pt-4">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/auth/register")}
                disabled={isLoading}
                className="text-gray-600 hover:text-green-600 font-medium"
              >
                ยังไม่มีบัญชี? สมัครสมาชิก
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}