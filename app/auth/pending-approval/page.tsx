// app/auth/pending-approval/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, RefreshCw, LogOut, User, Phone, Mail, Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-utils";
import { translateUserStatus, translateUserRole } from "@/lib/auth-utils";

interface UserInfo {
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  status: string;
  hospital: {
    name: string;
  };
  department?: {
    name: string;
  };
  createdAt: string;
}

export default function PendingApprovalPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // โหลดข้อมูลผู้ใช้เมื่อเข้าหน้า
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          
          // ถ้าสถานะเป็น ACTIVE แล้ว redirect ไป dashboard
          if (data.status === "ACTIVE") {
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    fetchUserInfo();
  }, [router]);

  // ตรวจสอบสถานะการอนุมัติ
  const checkApprovalStatus = async () => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/check-approval");
      const result = await response.json();

      if (response.ok) {
        if (result.isApproved) {
          // ได้รับการอนุมัติแล้ว ไป dashboard
          router.push("/dashboard");
        } else {
          // ยังไม่ได้รับการอนุมัติ
          setError("ยังไม่ได้รับการอนุมัติจากผู้ดูแลระบบ");
        }
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการตรวจสอบสถานะ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsChecking(false);
    }
  };

  // ออกจากระบบ
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">รอการอนุมัติ</CardTitle>
          <p className="text-muted-foreground">
            บัญชีของคุณรอการอนุมัติจากผู้ดูแลระบบ
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* ข้อมูลผู้ใช้ */}
          {userInfo && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">ข้อมูลผู้ใช้</h3>
                
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{userInfo.name}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{userInfo.email}</span>
                </div>
                
                {userInfo.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{userInfo.phoneNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {userInfo.hospital.name}
                    {userInfo.department && ` - ${userInfo.department.name}`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-500">บทบาท:</span>
                  <Badge variant="secondary">
                    {translateUserRole(userInfo.role)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">สถานะ:</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    {translateUserStatus(userInfo.status)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* คำแนะนำ */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-blue-800 mb-2">
              ขั้นตอนต่อไป
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• ผู้ดูแลระบบจะตรวจสอบข้อมูลของคุณ</li>
              <li>• การอนุมัติอาจใช้เวลา 1-3 วันทำการ</li>
              <li>• คุณจะได้รับอีเมลแจ้งเตือนเมื่อได้รับการอนุมัติ</li>
              <li>• สามารถตรวจสอบสถานะได้ด้วยการคลิกปุ่มด้านล่าง</li>
            </ul>
          </div>

          {/* การดำเนินการ */}
          <div className="space-y-3">
            <Button 
              onClick={checkApprovalStatus} 
              disabled={isChecking}
              className="w-full"
              variant="default"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  ตรวจสอบสถานะ
                </>
              )}
            </Button>

            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>

          {/* ข้อมูลติดต่อ */}
          <div className="text-center text-sm text-gray-500">
            <p>หากมีปัญหาหรือข้อสงสัย</p>
            <p>กรุณาติดต่อผู้ดูแลระบบของหน่วยงาน</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}