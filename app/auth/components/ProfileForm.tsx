// app/auth/components/ProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileFormData } from "@/lib/validations/auth";
import { positionOptions } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
  const [selectedHospital, setSelectedHospital] = useState<string>("");
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
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">ข้อมูลส่วนตัว</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          กรอกข้อมูลส่วนตัวเพื่อเสร็จสิ้นการสมัครสมาชิก
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">ชื่อ</Label>
              <Input
                {...register("firstName")}
                id="firstName"
                placeholder="กรอกชื่อ"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">นามสกุล</Label>
              <Input
                {...register("lastName")}
                id="lastName"
                placeholder="กรอกนามสกุล"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">ตำแหน่ง</Label>
            <Select onValueChange={(value) => setValue("position", value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกตำแหน่ง" />
              </SelectTrigger>
              <SelectContent>
                {positionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
            <Input
              {...register("phoneNumber")}
              id="phoneNumber"
              placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
              disabled={isLoading}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalId">หน่วยงาน</Label>
            <Select onValueChange={(value) => setValue("hospitalId", value)} disabled={isLoading}>
              <SelectTrigger>
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
            {errors.hospitalId && (
              <p className="text-sm text-red-500">{errors.hospitalId.message}</p>
            )}
          </div>

          {departments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="departmentId">แผนก (ไม่บังคับ)</Label>
              <Select onValueChange={(value) => setValue("departmentId", value)} disabled={isLoading}>
                <SelectTrigger>
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
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            เสร็จสิ้น
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}