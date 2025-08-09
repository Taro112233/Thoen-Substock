// app/auth/components/LoginForm.tsx - Final Fixed Version
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, AlertCircle, Building2, ShieldCheck, CheckCircle } from "lucide-react";

// Define form schema directly in component for better type control
const loginFormSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้หรืออีเมล"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
  hospitalId: z.string().min(1, "กรุณาเลือกโรงพยาบาล"),
  rememberMe: z.boolean(),
}) satisfies z.ZodType<LoginFormData>;

// Form data type - strictly what we expect
type LoginFormData = {
  username: string;
  password: string;
  hospitalId: string;
  rememberMe: boolean;
};

interface Hospital {
  id: string;
  name: string;
  hospitalCode: string;
  status: string;
  type: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      password: "",
      hospitalId: "",
      rememberMe: false,
    },
  });

  // Load hospitals from API
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        console.log('🔍 [HOSPITALS] Fetching hospitals from API...');
        const response = await fetch("/api/hospitals");
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ [HOSPITALS] API Response:', data);
          
          const hospitalsArray = Array.isArray(data) ? data : [];
          
          if (hospitalsArray.length > 0) {
            setHospitals(hospitalsArray);
            console.log('✅ [HOSPITALS] Loaded hospitals:', hospitalsArray.length);
          } else {
            console.warn('⚠️ [HOSPITALS] No hospitals found in API response');
            setHospitals([]);
          }
        } else {
          const errorData = await response.json();
          console.error('❌ [HOSPITALS] API request failed:', response.status, errorData);
          setHospitals([]);
        }
      } catch (error) {
        console.error('❌ [HOSPITALS] Error fetching hospitals:', error);
        setHospitals([]);
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, []);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      setIsRedirecting(false);
      setError(null);

      console.log('🔍 [LOGIN] Submitting login request:', {
        username: data.username,
        hospitalId: data.hospitalId,
        hasPassword: !!data.password,
        rememberMe: data.rememberMe
      });

      // Submit directly to API endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          hospitalId: data.hospitalId,
          rememberMe: data.rememberMe
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ [LOGIN] Login successful, redirecting...');
        setIsRedirecting(true);
        
        // Redirect based on response
        const redirectUrl = result.redirectUrl || "/dashboard";
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000); // Give user time to see success message
        
      } else {
        const errorMessage = result.error || result.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
        console.error('❌ [LOGIN] Login failed:', errorMessage);
        setError(errorMessage);
        setIsSubmitting(false);
      }

    } catch (err) {
      console.error('❌ [LOGIN] Network/unexpected error:', err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      setIsSubmitting(false);
    }
  };

  // Check if form can be submitted
  const canSubmit = isValid && !isSubmitting && !loadingHospitals && !isRedirecting;
  
  // Combined loading states
  const isLoading = isSubmitting || isRedirecting;

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
          {/* Success State */}
          {isRedirecting && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>เข้าสู่ระบบสำเร็จ กำลังนำไปหน้าหลัก...</span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && !isRedirecting && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit((data: LoginFormData) => onSubmit(data))} className="space-y-5">
            {/* Hospital Selection */}
            <div className="space-y-2">
              <Label htmlFor="hospitalId" className="text-sm font-medium text-gray-700">
                หน่วยงาน *
              </Label>
              <Select 
                onValueChange={(value) => {
                  setValue("hospitalId", value);
                  trigger("hospitalId");
                }}
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
                  {hospitals.length === 0 && !loadingHospitals ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      ไม่พบหน่วยงาน กรุณาติดต่อผู้ดูแลระบบ
                    </div>
                  ) : (
                    hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{hospital.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
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
                placeholder="กรอกชื่อผู้ใช้หรืออีเมล"
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
                {isRedirecting ? "กำลังนำไปหน้าหลัก..." : isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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