// app/auth/components/LoginForm.tsx - Clean Version
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
import { Eye, EyeOff, Loader2, AlertCircle, Building2 } from "lucide-react";

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
          const hospitalsArray = Array.isArray(data) ? data : (data.hospitals || []);
          setHospitals(hospitalsArray);
        } else {
          setError("ไม่สามารถโหลดข้อมูลโรงพยาบาลได้");
        }
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลโรงพยาบาล");
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, []);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Handle successful login
        if (result.needsApproval) {
          router.push("/auth/pending-approval");
        } else if (result.needsProfileCompletion) {
          router.push(`/auth/profile-completion?userId=${result.user?.id}`);
        } else {
          // Successful login, redirect to dashboard
          router.push("/dashboard");
        }
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          เข้าสู่ระบบ
        </CardTitle>
        <CardDescription className="text-center">
          เข้าสู่ระบบจัดการสต็อกยาโรงพยาบาล
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hospital Selection */}
          <div className="space-y-2">
            <Label htmlFor="hospitalId">โรงพยาบาล *</Label>
            <Select
              onValueChange={(value) => {
                setValue("hospitalId", value, { shouldValidate: true, shouldDirty: true });
                trigger("hospitalId");
              }}
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
                {hospitals && hospitals.length > 0 ? (
                  hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name} ({hospital.code})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-hospitals" disabled>
                    {loadingHospitals ? "กำลังโหลด..." : "ไม่พบโรงพยาบาลในระบบ"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.hospitalId && (
              <p className="text-sm text-red-600">{errors.hospitalId.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">ชื่อผู้ใช้หรืออีเมล *</Label>
            <Input
              id="username"
              type="text"
              placeholder="ชื่อผู้ใช้หรืออีเมล"
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
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              {...register("rememberMe")}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              จดจำการเข้าสู่ระบบ
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </Button>

          {/* Register Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">ยังไม่มีบัญชี? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push("/auth/register")}
            >
              สมัครสมาชิก
            </Button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-normal text-sm"
              onClick={() => router.push("/auth/forgot-password")} 
            >
              ลืมรหัสผ่าน?
            </Button>
          </div>
        </form>

        {/* Demo Accounts */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">บัญชีทดสอบ:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>👨‍💼 Admin: admin / admin123</div>
              <div>👩‍⚕️ Pharm: pharm_manager / pharm123</div>
              <div>👩‍⚕️ Nurse: nurse001 / nurse123</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}