// ===== 3. app/auth/profile-completion/page.tsx - Updated to use real API =====
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { profileCompletionSchema, type ProfileCompletionInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, CheckCircle2, User, Building2, Phone, IdCard, Briefcase } from "lucide-react";

interface Department {
  id: string;
  name: string;
  departmentCode: string; // Fixed field name
  type?: string;
}

export default function ProfileCompletionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [userHospitalId, setUserHospitalId] = useState<string | null>(null);

  const form = useForm<ProfileCompletionInput>({
    resolver: zodResolver(profileCompletionSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      employeeId: "",
      position: "",
      departmentId: "",
    },
  });

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors, isValid } } = form;

  // Watch form values for debugging
  const watchedValues = watch();
  const selectedDepartmentId = watch("departmentId");

  // Check if userId exists and get user info
  useEffect(() => {
    if (!userId) {
      router.push("/auth/login");
      return;
    }
    
    // Get user's hospital ID to load correct departments
    const getUserInfo = async () => {
      try {
        // This would be a real API call to get user info
        // For now, we'll use the seed data hospital ID
        const mockHospitalId = "9cecf759-70d4-4fe3-9906-328dedff264d"; // Demo hospital
        setUserHospitalId(mockHospitalId);
      } catch (error) {
        console.error("Failed to get user info:", error);
      }
    };
    
    getUserInfo();
  }, [userId, router]);

  // Load departments when we have hospital ID
  useEffect(() => {
    if (!userHospitalId) return;
    
    const fetchDepartments = async () => {
      try {
        console.log('🔄 Loading departments for hospital:', userHospitalId);
        
        const response = await fetch(`/api/departments?hospitalId=${userHospitalId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Departments response:', data);
          
          setDepartments(data);
          console.log('✅ Departments loaded:', data.length);
        } else {
          console.error('❌ Failed to load departments:', response.status);
          // Don't set error - just use empty array
          setDepartments([]);
        }
      } catch (error) {
        console.error("❌ Department fetch error:", error);
        // Don't set error - just use empty array
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [userHospitalId]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Profile Form Debug:', {
      values: watchedValues,
      errors: Object.keys(errors),
      isValid,
      departmentsCount: departments.length,
      isLoading,
      loadingDepartments,
      userId,
      userHospitalId,
    });
  }, [watchedValues, errors, isValid, departments.length, isLoading, loadingDepartments, userId, userHospitalId]);

  const onSubmit = async (data: ProfileCompletionInput) => {
    if (!userId) {
      setError("ไม่พบรหัสผู้ใช้");
      return;
    }

    console.log('🚀 Submitting profile completion:', {
      userId,
      ...data,
    });

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/profile-completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      const result = await response.json();
      console.log('📥 Profile completion response:', result);

      if (response.ok) {
        setSuccess(result.message || "บันทึกข้อมูลส่วนตัวสำเร็จ!");
        
        // Redirect after success
        setTimeout(() => {
          if (result.needsApproval) {
            router.push("/auth/pending-approval");
          } else {
            router.push("/auth/login?message=profile-completed");
          }
        }, 3000);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        
        if (result.details) {
          console.log('🔍 Validation errors:', result.details);
        }
      }
    } catch (error) {
      console.error("❌ Profile completion error:", error);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle department selection properly
  const handleDepartmentSelect = async (value: string) => {
    console.log('🏢 Department selected:', value);
    setValue("departmentId", value);
    await trigger("departmentId"); // Trigger validation
  };

  // Calculate if form can be submitted
  const canSubmit = !isLoading && 
                   !loadingDepartments && 
                   isValid &&
                   userId;

  // Show loading while departments are loading
  if (loadingDepartments) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render if no userId
  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            กรอกข้อมูลส่วนตัว
          </CardTitle>
          <CardDescription>
            กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วนเพื่อดำเนินการขออนุมัติเข้าใช้งานระบบ
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Debug Info in Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-gray-50 rounded text-xs space-y-1">
              <div>✅ Form Valid: {isValid ? 'Yes' : 'No'}</div>
              <div>🏢 Departments: {departments.length}</div>
              <div>🔗 Department Selected: {selectedDepartmentId || 'None'}</div>
              <div>👤 User ID: {userId || 'Missing'}</div>
              <div>🏥 Hospital ID: {userHospitalId || 'Loading...'}</div>
              <div>🚀 Can Submit: {canSubmit ? 'Yes' : 'No'}</div>
              {Object.keys(errors).length > 0 && (
                <div className="text-red-600">❌ Errors: {Object.keys(errors).join(', ')}</div>
              )}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">ข้อมูลส่วนตัว</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="ชื่อจริง"
                    {...register("firstName")}
                    disabled={isLoading}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="นามสกุล"
                    {...register("lastName")}
                    disabled={isLoading}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์ *</Label>
                <div className="relative">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="0812345678"
                    {...register("phoneNumber")}
                    disabled={isLoading}
                    className={errors.phoneNumber ? "border-red-500 pl-10" : "pl-10"}
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            {/* Work Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">ข้อมูลการทำงาน</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee ID */}
                <div className="space-y-2">
                  <Label htmlFor="employeeId">รหัสพนักงาน *</Label>
                  <div className="relative">
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="EMP001"
                      {...register("employeeId")}
                      disabled={isLoading}
                      className={errors.employeeId ? "border-red-500 pl-10" : "pl-10"}
                    />
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.employeeId && (
                    <p className="text-sm text-red-600">{errors.employeeId.message}</p>
                  )}
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position">ตำแหน่ง *</Label>
                  <Input
                    id="position"
                    type="text"
                    placeholder="เภสัชกร, พยาบาล, เจ้าหน้าที่"
                    {...register("position")}
                    disabled={isLoading}
                    className={errors.position ? "border-red-500" : ""}
                  />
                  {errors.position && (
                    <p className="text-sm text-red-600">{errors.position.message}</p>
                  )}
                </div>
              </div>

              {/* Department - Now loads real data */}
              <div className="space-y-2">
                <Label htmlFor="departmentId">แผนกที่สังกัด (ไม่บังคับ)</Label>
                <div className="relative">
                  <Select
                    onValueChange={handleDepartmentSelect}
                    disabled={isLoading}
                    value={selectedDepartmentId}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder={
                        departments.length === 0 
                          ? "ไม่มีแผนกในระบบ (ไม่บังคับ)" 
                          : "เลือกแผนก (ไม่บังคับ)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length > 0 ? (
                        departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{department.name}</span>
                              <span className="text-xs text-gray-500">{department.departmentCode}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          ไม่มีแผนกในระบบ
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.departmentId && (
                  <p className="text-sm text-red-600">{errors.departmentId.message}</p>
                )}
                <p className="text-sm text-gray-600">
                  หมายเหตุ: ไม่จำเป็นต้องเลือกแผนกสำหรับเภสัชกรรมกลาง
                </p>
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-blue-900">
                    ขั้นตอนต่อไป
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• ข้อมูลของคุณจะถูกส่งไปยังผู้ดูแลระบบเพื่อพิจารณาอนุมัติ</li>
                    <li>• คุณจะได้รับอีเมลแจ้งผลการอนุมัติภายใน 1-2 วันทำการ</li>
                    <li>• หลังได้รับการอนุมัติแล้ว จึงจะสามารถเข้าใช้งานระบบได้</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
                disabled={!canSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังบันทึกข้อมูล...
                  </>
                ) : (
                  "บันทึกข้อมูลและส่งขออนุมัติ"
                )}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/auth/login")}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-blue-600"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}