// app/auth/profile-completion/page.tsx - Profile Completion Page
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
import { Loader2, AlertCircle, CheckCircle2, User, Building2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  code: string;
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProfileCompletionInput>({
    resolver: zodResolver(profileCompletionSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    // Load departments (mock data for now)
    const fetchDepartments = async () => {
      try {
        // TODO: Replace with actual API call
        const mockDepartments = [
          { id: "1", name: "เภสัชกรรม", code: "PHARM" },
          { id: "2", name: "อายุรกรรม", code: "MED" },
          { id: "3", name: "ศัลยกรรม", code: "SURG" },
          { id: "4", name: "กุมารเวชกรรม", code: "PEDS" },
          { id: "5", name: "สูติ-นรีเวชกรรม", code: "OBGYN" },
          { id: "6", name: "ออร์โธปิดิกส์", code: "ORTHO" },
          { id: "7", name: "จักษุวิทยา", code: "OPTH" },
          { id: "8", name: "หู คอ จมูก", code: "ENT" },
        ];
        
        setDepartments(mockDepartments);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [userId, router]);

  const onSubmit = async (data: ProfileCompletionInput) => {
    if (!userId) return;

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

      if (response.ok) {
        setSuccess("บันทึกข้อมูลส่วนตัวสำเร็จ! กรุณารอการอนุมัติจากผู้ดูแลระบบ");
        
        setTimeout(() => {
          router.push("/auth/login?message=profile-completed");
        }, 3000);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Profile completion error:", error);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return null; // จะ redirect ใน useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
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
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0812345678"
                  {...register("phoneNumber")}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            {/* Work Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">ข้อมูลการทำงาน</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee ID */}
                <div className="space-y-2">
                  <Label htmlFor="employeeId">รหัสพนักงาน *</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="EMP001"
                    {...register("employeeId")}
                    className={errors.employeeId ? "border-red-500" : ""}
                  />
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
                    placeholder="เภสัชกร / พยาบาล / เทคนิค"
                    {...register("position")}
                    className={errors.position ? "border-red-500" : ""}
                  />
                  {errors.position && (
                    <p className="text-sm text-red-600">{errors.position.message}</p>
                  )}
                </div>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="departmentId">แผนกที่สังกัด (ถ้ามี)</Label>
                <Select
                  onValueChange={(value) => setValue("departmentId", value)}
                  disabled={loadingDepartments}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        loadingDepartments 
                          ? "กำลังโหลด..." 
                          : "เลือกแผนก (ไม่จำเป็นสำหรับเภสัชกรรมกลาง)"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name} ({department.code})
                      </SelectItem>
                    ))}
                    {departments.length === 0 && !loadingDepartments && (
                      <SelectItem value="none" disabled>
                        ไม่พบแผนกในระบบ
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-red-600">{errors.departmentId.message}</p>
                )}
                <p className="text-sm text-gray-600">
                  หมายเหตุ: พนักงานเภสัชกรรมกลางไม่จำเป็นต้องเลือกแผนก
                </p>
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
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
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !isValid}
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
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}