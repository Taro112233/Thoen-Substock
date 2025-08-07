// app/auth/components/PendingApprovalCard.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  LogOut, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  Calendar,
  AlertCircle
} from "lucide-react";

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

export default function PendingApprovalCard() {
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
          
          // ลบ error หลัง 3 วินาที
          setTimeout(() => setError(null), 3000);
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

  function translateUserRole(role: string): import("react").ReactNode | import("motion/react").MotionValue<number> | import("motion/react").MotionValue<string> {
    throw new Error("Function not implemented.");
  }

  function translateUserStatus(status: string): import("react").ReactNode | import("motion/react").MotionValue<number> | import("motion/react").MotionValue<string> {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <Card className="w-full max-w-lg mx-auto shadow-2xl border-0">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl flex items-center justify-center shadow-lg animate-pulse">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">รอการอนุมัติ</CardTitle>
              <p className="text-gray-600 mt-2">
                บัญชีของคุณรอการอนุมัติจากผู้ดูแลระบบ
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="error" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* ข้อมูลผู้ใช้ */}
          {userInfo && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  ข้อมูลผู้ใช้
                </h3>
                
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">ชื่อ:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{userInfo.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">อีเมล:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{userInfo.email}</span>
                  </div>
                  
                  {userInfo.phoneNumber && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">โทรศัพท์:</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{userInfo.phoneNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">หน่วยงาน:</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {userInfo.hospital.name}
                      {userInfo.department && ` - ${userInfo.department.name}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">บทบาท:</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {translateUserRole(userInfo.role)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">สถานะ:</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                      {translateUserStatus(userInfo.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* คำแนะนำ */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
            <h3 className="font-semibold text-sm text-blue-800 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              ขั้นตอนต่อไป
            </h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                ผู้ดูแลระบบจะตรวจสอบข้อมูลของคุณ
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                การอนุมัติอาจใช้เวลา 1-3 วันทำการ
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                คุณจะได้รับอีเมลแจ้งเตือนเมื่อได้รับการอนุมัติ
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                สามารถตรวจสอบสถานะได้ด้วยการคลิกปุ่มด้านล่าง
              </li>
            </ul>
          </div>

          {/* การดำเนินการ */}
          <div className="space-y-3">
            <Button 
              onClick={checkApprovalStatus} 
              disabled={isChecking}
              className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
              className="w-full h-11 border-gray-200 hover:bg-gray-50 font-medium rounded-lg transition-all duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>

          {/* ข้อมูลติดต่อ */}
          <div className="text-center text-sm text-gray-500 pt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700">หากมีปัญหาหรือข้อสงสัย</p>
              <p className="text-gray-600 mt-1">กรุณาติดต่อผู้ดูแลระบบของหน่วยงาน</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}