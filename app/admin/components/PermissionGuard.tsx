// app/admin/components/PermissionGuard.tsx
'use client';

import { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ArrowLeft, Home, Lock } from 'lucide-react';
import { mockCurrentUser } from '@/lib/mock-data';
import Link from 'next/link';

interface PermissionGuardProps {
  children: ReactNode;
  requiredHierarchy?: string[];
  requiredPermission?: keyof typeof mockCurrentUser.permissions;
  fallbackMessage?: string;
  allowedRoles?: string[];
}

export default function PermissionGuard({ 
  children, 
  requiredHierarchy,
  requiredPermission,
  fallbackMessage,
  allowedRoles = ['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD']
}: PermissionGuardProps) {
  
  // ตรวจสอบสิทธิ์เข้าถึง Admin Panel พื้นฐาน
  const hasBasicAdminAccess = allowedRoles.includes(mockCurrentUser.hierarchy);
  
  if (!hasBasicAdminAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
            <p className="text-gray-600 mb-6">
              คุณไม่มีสิทธิ์ในการเข้าถึง Admin Panel
              <br />
              <span className="text-sm">ต้องการระดับ: {allowedRoles.join(', ')}</span>
            </p>
            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  กลับไปหน้าหลัก
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับหน้าก่อน
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ตรวจสอบ hierarchy level
  if (requiredHierarchy && !requiredHierarchy.includes(mockCurrentUser.hierarchy)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <Alert className="bg-red-50 border-red-200 mb-6">
              <Shield className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">การเข้าถึงถูกจำกัด</AlertTitle>
              <AlertDescription className="text-red-700 mt-2">
                {fallbackMessage || (
                  <>
                    คุณไม่มีสิทธิ์เข้าถึงหน้านี้ ต้องการระดับ{' '}
                    {requiredHierarchy.map((h, i) => (
                      <span key={h}>
                        <strong>{h}</strong>
                        {i < requiredHierarchy.length - 1 && ' หรือ '}
                      </span>
                    ))}
                  </>
                )}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับหน้าก่อน
              </Button>
              <Link href="/admin">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  กลับ Admin Panel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ตรวจสอบ specific permission
  if (requiredPermission && !mockCurrentUser.permissions[requiredPermission]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <Alert className="bg-yellow-50 border-yellow-200 mb-6">
              <Shield className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-800">ไม่มีสิทธิ์การใช้งาน</AlertTitle>
              <AlertDescription className="text-yellow-700 mt-2">
                {fallbackMessage || `คุณไม่มีสิทธิ์ในการ ${requiredPermission} กรุณาติดต่อผู้ดูแลระบบ`}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับหน้าก่อน
              </Button>
              <Link href="/admin">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  กลับ Admin Panel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}