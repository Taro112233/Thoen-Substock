// app/auth/components/RegisterForm.tsx - Updated with new step flow
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
import { Loader2, AlertCircle, CheckCircle2, Building2, User, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Hospital {
  id: string;
  name: string;
  licenseNumber?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  const form = useForm<RegisterInput>({
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

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors, isValid } } = form;

  const selectedHospitalId = watch("hospitalId");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  // Load hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("/api/hospitals");
        
        if (response.ok) {
          const data = await response.json();
          const hospitalsArray: Hospital[] = Array.isArray(data) ? data : data.hospitals || [];
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
        setSuccess("ข้อมูลเบื้องต้นบันทึกสำเร็จ กำลังไปยังขั้นตอนถัดไป...");
        
        // Always redirect to profile completion page
        setTimeout(() => {
          router.push(`/auth/profile-completion?userId=${result.userId}`);
        }, 1500);
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
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">กำลังโหลด...</h3>
                  <p className="text-sm text-gray-600">กำลังเตรียมข้อมูลโรงพยาบาล</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md mx-auto">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-6">
            {/* Step Indicator */}
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="text-sm font-medium text-blue-600">ข้อมูลพื้นฐาน</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="text-sm text-gray-500">ข้อมูลส่วนตัว</span>
              </div>
            </div>

            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              สมัครสมาชิก
            </CardTitle>
            <CardDescription className="text-gray-600">
              ระบบจัดการสต็อกยาโรงพยาบาล
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Alerts */}
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Hospital Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                  หน่วยงาน <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select 
                  onValueChange={handleHospitalSelect}
                  disabled={isLoading || hospitals.length === 0}
                >
                  <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="เลือกหน่วยงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{hospital.name}</span>
                          {hospital.licenseNumber && (
                            <span className="text-xs text-gray-500">
                              เลขที่อนุญาต: {hospital.licenseNumber}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hospitalId && (
                  <p className="text-sm text-red-600 mt-1">{errors.hospitalId.message}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  ชื่อผู้ใช้ <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="ชื่อผู้ใช้ (3-20 ตัวอักษร)"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  อีเมล <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="อีเมลของคุณ"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  รหัสผ่าน <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  ยืนยันรหัสผ่าน <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="ยืนยันรหัสผ่าน"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!canSubmit}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังดำเนินการ...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>ต่อไป</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                มีบัญชีอยู่แล้ว?{" "}
                <Link 
                  href="/auth/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}