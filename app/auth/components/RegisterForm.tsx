// app/auth/components/RegisterForm.tsx - Clean Version
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, User, Building2 } from "lucide-react";

interface Hospital {
  id: string;
  name: string;
  code: string;
  nameEn?: string;
  type?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      hospitalId: "",
    },
  });

  const selectedHospitalId = watch("hospitalId");

  // Load hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("/api/hospitals");
        
        if (response.ok) {
          const data = await response.json();
          const hospitalsArray = Array.isArray(data) ? data : data.hospitals || [];
          setHospitals(hospitalsArray);
          
          if (hospitalsArray.length === 0) {
            setError("ไม่พบข้อมูลโรงพยาบาลที่สามารถใช้งานได้");
          }
        } else {
          setError("ไม่สามารถโหลดรายการโรงพยาบาลได้");
        }
      } catch (error) {
        console.error("Hospital fetch error:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลโรงพยาบาล");
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, []);

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message || "สมัครสมาชิกสำเร็จ!");
        
        // Redirect after success
        setTimeout(() => {
          if (result.nextStep === "profile-completion") {
            router.push(`/auth/profile-completion?userId=${result.userId}`);
          } else {
            router.push("/auth/login?message=registration-success");
          }
        }, 2000);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle hospital selection
  const handleHospitalSelect = async (value: string) => {
    setValue("hospitalId", value);
    await trigger("hospitalId");
  };

  // Calculate if form can be submitted
  const canSubmit = !isLoading && 
                   !loadingHospitals && 
                   hospitals.length > 0 && 
                   isValid && 
                   selectedHospitalId;

  // Loading state
  if (loadingHospitals) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
                <span className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            สมัครสมาชิก
          </CardTitle>
          <CardDescription className="text-gray-600">
            สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Hospital Selection */}
            <div className="space-y-2">
              <Label htmlFor="hospitalId" className="text-sm font-medium text-gray-700">
                หน่วยงาน *
              </Label>
              <Select
                onValueChange={handleHospitalSelect}
                disabled={isLoading}
                value={selectedHospitalId}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="เลือกหน่วยงาน" />
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
                <p className="text-sm text-red-500 mt-1">{errors.hospitalId.message}</p>
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
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                อีเมล *
              </Label>
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="กรอกอีเมล"
                disabled={isLoading}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
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
                  className="pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="new-password"
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
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน *
              </Label>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่าน"
                  disabled={isLoading}
                  className="pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={!canSubmit}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push("/auth/login")}
                disabled={isLoading}
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                มีบัญชีแล้ว? เข้าสู่ระบบ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}