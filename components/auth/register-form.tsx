// app/auth/components/RegisterForm.tsx - Fixed Version
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
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, User, Mail, Building2 } from "lucide-react";

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
    trigger,
    formState: { errors, isValid, isSubmitting },
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

  // Watch form values to debug
  const watchedValues = watch();
  const selectedHospitalId = watch("hospitalId");

  // Load hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        console.log('🔄 [DEBUG] Loading hospitals...');
        const response = await fetch("/api/hospitals");
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ [DEBUG] Hospitals loaded:', data);
          
          // Handle different response structures
          const hospitalsArray = Array.isArray(data) ? data : data.hospitals || [];
          setHospitals(hospitalsArray);
        } else {
          console.error('❌ [DEBUG] Failed to load hospitals:', response.status);
          setError("ไม่สามารถโหลดรายการโรงพยาบาลได้");
        }
      } catch (error) {
        console.error("❌ [DEBUG] Hospital fetch error:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลโรงพยาบาล");
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, []);

  // Debug form state
  useEffect(() => {
    console.log('🔍 [DEBUG] Form state:', {
      values: watchedValues,
      errors: errors,
      isValid: isValid,
      isSubmitting: isSubmitting,
      hospitalsLoaded: hospitals.length,
    });
  }, [watchedValues, errors, isValid, isSubmitting, hospitals.length]);

  const onSubmit = async (data: RegisterInput) => {
    console.log('🚀 [DEBUG] Form submitted with data:', {
      ...data,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });

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
      console.log('📥 [DEBUG] Registration response:', result);

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
        
        if (result.details) {
          console.log('🔍 [DEBUG] Validation errors:', result.details);
        }
      }
    } catch (err) {
      console.error('❌ [DEBUG] Registration error:', err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle hospital selection with proper form control
  const handleHospitalSelect = (value: string) => {
    console.log('🏥 [DEBUG] Hospital selected:', value);
    setValue("hospitalId", value);
    trigger("hospitalId"); // Trigger validation
  };

  // Check if form can be submitted
  const canSubmit = !isLoading && !loadingHospitals && hospitals.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">สมัครสมาชิก</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-2">
                สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Debug Info in Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-gray-50 rounded text-xs text-gray-600">
              <div>Form Valid: {isValid ? '✅' : '❌'}</div>
              <div>Hospitals: {hospitals.length}</div>
              <div>Loading: {loadingHospitals ? '⏳' : '✅'}</div>
              <div>Can Submit: {canSubmit ? '✅' : '❌'}</div>
              {Object.keys(errors).length > 0 && (
                <div>Errors: {Object.keys(errors).join(', ')}</div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <Alert variant="error" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Hospital Selection */}
            <div className="space-y-2">
              <Label htmlFor="hospitalId" className="text-sm font-medium text-gray-700">
                เลือกโรงพยาบาล *
              </Label>
              <Select
                onValueChange={handleHospitalSelect}
                disabled={loadingHospitals || isLoading}
                value={selectedHospitalId}
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder={loadingHospitals ? "กำลังโหลด..." : "เลือกโรงพยาบาล"} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{hospital.name}</span>
                        <span className="text-xs text-gray-500">{hospital.code}</span>
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
              <div className="relative">
                <Input
                  {...register("username")}
                  id="username"
                  placeholder="กรอกชื่อผู้ใช้"
                  disabled={isLoading}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                อีเมล *
              </Label>
              <div className="relative">
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="กรอกอีเมล"
                  disabled={isLoading}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
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
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!canSubmit || isSubmitting}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loadingHospitals ? "กำลังโหลดข้อมูล..." : "สมัครสมาชิก"}
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