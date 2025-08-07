// app/auth/components/ProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  position: string;
  phoneNumber: string;
  hospitalId: string;
  departmentId?: string;
}

interface PositionOption {
  value: string;
  label: string;
}

const positionOptions: PositionOption[] = [
  { value: "doctor", label: "แพทย์" },
  { value: "nurse", label: "พยาบาล" },
  { value: "pharmacist", label: "เภสัชกร" },
  { value: "staff", label: "เจ้าหน้าที่" }
];

const profileSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  position: z.string().min(1, "กรุณาเลือกตำแหน่ง"),
  phoneNumber: z.string().length(10, "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"),
  hospitalId: z.string().min(1, "กรุณาเลือกหน่วยงาน"),
  departmentId: z.string().optional(),
});
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCheck, Phone, Building2, Users } from "lucide-react";

interface Hospital {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  hospitalId: string;
}

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const watchHospitalId = watch("hospitalId");

  // โหลดข้อมูลโรงพยาบาล
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("/api/hospitals");
        if (response.ok) {
          const data = await response.json();
          setHospitals(data);
        }
      } catch (err) {
        console.error("Failed to fetch hospitals:", err);
      }
    };

    fetchHospitals();
  }, []);

  // โหลดข้อมูลแผนกเมื่อเลือกโรงพยาบาล
  useEffect(() => {
    if (watchHospitalId) {
      const fetchDepartments = async () => {
        try {
          const response = await fetch(`/api/departments?hospitalId=${watchHospitalId}`);
          if (response.ok) {
            const data = await response.json();
            setDepartments(data);
          }
        } catch (err) {
          console.error("Failed to fetch departments:", err);
        }
      };

      fetchDepartments();
    } else {
      setDepartments([]);
    }
  }, [watchHospitalId]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // บันทึกข้อมูลสำเร็จ ไปหน้ารอการอนุมัติ
        router.push("/auth/pending-approval");
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <Card className="w-full max-w-lg mx-auto shadow-2xl border-0">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">ข้อมูลส่วนตัว</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                กรอกข้อมูลส่วนตัวเพื่อเสร็จสิ้นการสมัครสมาชิก
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert variant="error" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  ชื่อ
                </Label>
                <Input
                  {...register("firstName")}
                  id="firstName"
                  placeholder="กรอกชื่อ"
                  disabled={isLoading}
                  className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  นามสกุล
                </Label>
                <Input
                  {...register("lastName")}
                  id="lastName"
                  placeholder="กรอกนามสกุล"
                  disabled={isLoading}
                  className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                ตำแหน่ง
              </Label>
              <Select onValueChange={(value) => setValue("position", value)} disabled={isLoading}>
                <SelectTrigger className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue placeholder="เลือกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((option: PositionOption) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && (
                <p className="text-sm text-red-500 mt-1">{errors.position.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์
              </Label>
              <div className="relative">
                <Input
                  {...register("phoneNumber")}
                  id="phoneNumber"
                  placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
                  disabled={isLoading}
                  className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalId" className="text-sm font-medium text-gray-700">
                หน่วยงาน
              </Label>
              <div className="relative">
                <Select onValueChange={(value) => setValue("hospitalId", value)} disabled={isLoading}>
                  <SelectTrigger className="h-11 pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="เลือกหน่วยงาน" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.hospitalId && (
                <p className="text-sm text-red-500 mt-1">{errors.hospitalId.message}</p>
              )}
            </div>

            {departments.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="departmentId" className="text-sm font-medium text-gray-700">
                  แผนก (ไม่บังคับ)
                </Label>
                <div className="relative">
                  <Select onValueChange={(value) => setValue("departmentId", value)} disabled={isLoading}>
                    <SelectTrigger className="h-11 pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="เลือกแผนก" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                เสร็จสิ้น
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}