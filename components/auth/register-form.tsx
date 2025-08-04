// components/auth/register-form.tsx - Updated Registration Form
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
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface Hospital {
  id: string;
  name: string;
  code: string;
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
    formState: { errors, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  // Load hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("/api/hospitals");
        if (response.ok) {
          const data = await response.json();
          setHospitals(data.hospitals || []);
        }
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
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
      console.log('🔍 [DEBUG] Submitting registration data:', {
        ...data,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('🔍 [DEBUG] Registration response:', result);

      if (response.ok) {
        setSuccess(result.message);
        
        // Redirect based on next step
        setTimeout(() => {
          if (result.nextStep === "profile-completion") {
            router.push(`/auth/profile-completion?userId=${result.userId}`);
          } else {
            router.push("/auth/login?message=registration-success");
          }
        }, 2000);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        
        // แสดง validation errors ถ้ามี
        if (result.details) {
          console.log('🔍 [DEBUG] Validation errors:', result.details);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedHospitalId = watch("hospitalId");
  const password = watch("password");

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          สมัครสมาชิก
        </CardTitle>
        <CardDescription className="text-center">
          สร้างบัญชีใหม่สำหรับระบบจัดการสต็อกยา
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hospital Selection */}
          <div className="space-y-2">
            <Label htmlFor="hospitalId">โรงพยาบาล *</Label>
            <Select
              onValueChange={(value) => setValue("hospitalId", value)}
              disabled={loadingHospitals}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    loadingHospitals 
                      ? "กำลังโหลด..." 
                      : "เลือกโรงพยาบาล"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name} ({hospital.code})
                  </SelectItem>
                ))}
                {hospitals.length === 0 && !loadingHospitals && (
                  <SelectItem value="demo" disabled>
                    ไม่พบโรงพยาบาลในระบบ
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.hospitalId && (
              <p className="text-sm text-red-600">{errors.hospitalId.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@hospital.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้ *</Label>
            <Input
              id="username"
              type="text"
              placeholder="ชื่อผู้ใช้สำหรับเข้าสู่ระบบ"
              {...register("username")}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
            {password && (
              <div className="text-xs text-gray-600">
                <ul className="space-y-1">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>
                    • อย่างน้อย 8 ตัวอักษร
                  </li>
                  <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                    • มีตัวอักษรเล็ก (a-z)
                  </li>
                  <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                    • มีตัวอักษรใหญ่ (A-Z)
                  </li>
                  <li className={/\d/.test(password) ? "text-green-600" : ""}>
                    • มีตัวเลข (0-9)
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid || !selectedHospitalId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังสมัครสมาชิก...
              </>
            ) : (
              "สมัครสมาชิก"
            )}
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">มีบัญชีอยู่แล้ว? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push("/auth/login")}
            >
              เข้าสู่ระบบ
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}