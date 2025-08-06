// app/auth/components/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, AlertCircle, Building2, ShieldCheck } from "lucide-react";

interface Hospital {
  id: string;
  name: string;
  code: string;
  nameEn?: string;
  type?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      hospitalId: "",
      rememberMe: false,
    },
  });

  // Load hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("/api/hospitals");
        
        if (response.ok) {
          const data = await response.json();
          const hospitalsArray = Array.isArray(data) ? data : data.hospitals || [];
          setHospitals(hospitalsArray);
        } else {
          console.error("Failed to fetch hospitals");
          setHospitals([]);
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        setHospitals([]);
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, []);

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        router.push(result.redirectUrl || "/dashboard");
      } else {
        setError(result.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = !isLoading && !loadingHospitals;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            เข้าสู่ระบบ
          </CardTitle>
          <CardDescription className="text-gray-600">
            ระบบจัดการสต็อกยาโรงพยาบาล
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8 space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Hospital Selection - First Field */}
            <div className="space-y-2">
              <Label htmlFor="hospitalId" className="text-sm font-medium text-gray-700">
                หน่วยงาน *
              </Label>
              <Select 
                onValueChange={(value) => setValue("hospitalId", value)} 
                disabled={isLoading || loadingHospitals}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue 
                      placeholder={loadingHospitals ? "กำลังโหลด..." : "เลือกหน่วยงาน"} 
                    />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{hospital.name}</span>
                        {hospital.nameEn && (
                          <span className="text-sm text-gray-500">{hospital.nameEn}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hospitalId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.hospitalId.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                ชื่อผู้ใช้ *
              </Label>
              <Input
                {...register("username")}
                id="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                disabled={isLoading}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                รหัสผ่าน *
              </Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่าน"
                  disabled={isLoading}
                  className="pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                {...register("rememberMe")}
                id="rememberMe"
                disabled={isLoading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                จดจำการเข้าสู่ระบบ
              </Label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={!canSubmit}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/auth/register")}
                disabled={isLoading}
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                ยังไม่มีบัญชี? สมัครสมาชิก
              </Button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/auth/forgot-password")} 
                disabled={isLoading}
                className="text-gray-500 hover:text-blue-500 font-medium text-sm"
              >
                ลืมรหัสผ่าน?
              </Button>
            </div>
          </form>


        </CardContent>
      </Card>
    </div>
  );
}