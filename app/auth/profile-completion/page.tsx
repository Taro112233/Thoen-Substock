// app/auth/profile-completion/page.tsx - Fixed: Remove circular JSON stringify
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
import { Loader2, AlertCircle, CheckCircle2, User, Building2, Phone, IdCard, Briefcase, UserCheck } from "lucide-react";

interface Department {
  id: string;
  name: string;
  departmentCode: string;
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

  const watchedValues = watch();
  const selectedDepartmentId = watch("departmentId");

  // Safe JSON stringify function that handles circular references
  const safeStringify = (obj: any) => {
    try {
      // Create a clean object with only the values we want to display
      const cleanObj = {
        firstName: obj.firstName || '',
        lastName: obj.lastName || '',
        phoneNumber: obj.phoneNumber || '',
        employeeId: obj.employeeId || '',
        position: obj.position || '',
        departmentId: obj.departmentId || ''
      };
      return JSON.stringify(cleanObj, null, 2);
    } catch (error) {
      return 'Unable to display form values (circular reference)';
    }
  };

  // Check if userId exists and get user info
  useEffect(() => {
    if (!userId) {
      router.push("/auth/login");
      return;
    }
    
    // Get user's hospital ID to load correct departments
    const getUserInfo = async () => {
      try {
        // Using seed data hospital ID for demonstration
        const mockHospitalId = "9cecf759-70d4-4fe3-9906-328dedff264d";
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
        } else {
          console.error('❌ Failed to load departments:', response.status);
          setDepartments([]);
        }
      } catch (error) {
        console.error("❌ Department fetch error:", error);
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [userHospitalId]);

  const onSubmit = async (data: ProfileCompletionInput) => {
    if (!userId) {
      setError("ไม่พบรหัสผู้ใช้");
      return;
    }

    console.log('🚀 Submitting profile completion:', { userId, ...data });

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
        setSuccess(result.message || "สมัครสมาชิกสำเร็จ! รอการอนุมัติจากผู้บริหาร");
        
        // Redirect to appropriate page after success
        setTimeout(() => {
          if (result.needsApproval) {
            router.push("/auth/pending-approval");
          } else {
            router.push("/auth/login?message=registration-completed");
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
    await trigger("departmentId");
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
          {/* Step Indicator */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="text-sm text-green-600 font-medium">ข้อมูลพื้นฐาน</span>
            </div>
            <div className="w-8 h-px bg-blue-600"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-blue-600">ข้อมูลส่วนตัว</span>
            </div>
          </div>

          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            กรอกข้อมูลส่วนตัว
          </CardTitle>
          <CardDescription>
            กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วนเพื่อเสร็จสิ้นการสมัครสมาชิก
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  ชื่อ <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="กรอกชื่อ"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  นามสกุล <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="กรอกนามสกุล"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  เบอร์โทรศัพท์ <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0812345678"
                  maxLength={10}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700 flex items-center">
                  <IdCard className="w-4 h-4 mr-2 text-gray-500" />
                  รหัสพนักงาน <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="รหัสพนักงาน"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  {...register("employeeId")}
                />
                {errors.employeeId && (
                  <p className="text-sm text-red-600">{errors.employeeId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium text-gray-700 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                  ตำแหน่ง <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="position"
                  type="text"
                  placeholder="เช่น เภสัชกร, พยาบาล, เจ้าหน้าที่"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  {...register("position")}
                />
                {errors.position && (
                  <p className="text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                  แผนก <span className="text-gray-500 text-xs">(ไม่บังคับ)</span>
                </Label>
                <Select 
                  onValueChange={handleDepartmentSelect}
                  disabled={isLoading || departments.length === 0}
                >
                  <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder={
                      departments.length === 0 
                        ? "ไม่มีข้อมูลแผนก" 
                        : "เลือกแผนก (ไม่บังคับ)"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{department.name}</span>
                          <span className="text-xs text-gray-500">
                            รหัส: {department.departmentCode}
                            {department.type && ` | ประเภท: ${department.type}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-red-600">{errors.departmentId.message}</p>
                )}
              </div>
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    ข้อมูลที่ต้องการ
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>ข้อมูลส่วนตัวจะใช้สำหรับการติดต่อและการบริหารจัดการบัญชี</li>
                      <li>รหัสพนักงานจะใช้เพื่อการตรวจสอบตัวตนและการออกรายงาน</li>
                      <li>ตำแหน่งงานจะใช้เพื่อกำหนดสิทธิ์การเข้าถึงระบบ</li>
                      <li>บัญชีจะรออนุมัติจากผู้บริหารก่อนเปิดใช้งาน</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  กำลังสมัครสมาชิก...
                </div>
              ) : (
                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  <span>สมัครสมาชิก</span>
                </div>
              )}
            </Button>
          </form>

          {/* Development Debug Info - Fixed to avoid circular JSON */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-gray-500">Debug Info</summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-1">
                <div>✅ Form Valid: {isValid ? 'Yes' : 'No'}</div>
                <div>🆔 User ID: {userId || 'Missing'}</div>
                <div>🏥 Hospital ID: {userHospitalId || 'Loading...'}</div>
                <div>🏢 Departments: {departments.length}</div>
                <div>📝 Form Values: <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-auto max-h-32">{safeStringify(watchedValues)}</pre></div>
                <div>❌ Errors: {Object.keys(errors).length > 0 ? (
                  <pre className="mt-1 p-2 bg-red-50 rounded border text-xs overflow-auto max-h-32">
                    {Object.entries(errors).map(([key, error]) => `${key}: ${error?.message}`).join('\n')}
                  </pre>
                ) : 'None'}</div>
                <div>🔄 Loading States: Departments={loadingDepartments}, Submit={isLoading}</div>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}