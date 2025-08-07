// app/admin/components/PermissionGuard.tsx
'use client';

import { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { mockCurrentUser } from '@/lib/mock-data';

interface PermissionGuardProps {
  children: ReactNode;
  requiredHierarchy?: string[];
  requiredPermission?: string;
}

export default function PermissionGuard({ 
  children, 
  requiredHierarchy,
  requiredPermission 
}: PermissionGuardProps) {
  
  // Check hierarchy level
  if (requiredHierarchy && !requiredHierarchy.includes(mockCurrentUser.hierarchy)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert className="bg-red-50 border-red-200">
            <Shield className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800">การเข้าถึงถูกจำกัด</AlertTitle>
            <AlertDescription className="text-red-700 mt-2">
              คุณไม่มีสิทธิ์เข้าถึงหน้านี้ ต้องการระดับ{' '}
              {requiredHierarchy.map((h, i) => (
                <span key={h}>
                  <strong>{h}</strong>
                  {i < requiredHierarchy.length - 1 && ' หรือ '}
                </span>
              ))}
            </AlertDescription>
          </Alert>
          <Button className="mt-4 w-full" variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับหน้าก่อน
          </Button>
        </div>
      </div>
    );
  }

  // Check specific permission
  if (requiredPermission && !mockCurrentUser.permissions[requiredPermission as keyof typeof mockCurrentUser.permissions]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert className="bg-yellow-50 border-yellow-200">
            <Shield className="h-5 w-5 text-yellow-600" />
            <AlertTitle className="text-yellow-800">ไม่มีสิทธิ์การใช้งาน</AlertTitle>
            <AlertDescription className="text-yellow-700 mt-2">
              คุณไม่มีสิทธิ์ในการ {requiredPermission} กรุณาติดต่อผู้ดูแลระบบ
            </AlertDescription>
          </Alert>
          <Button className="mt-4 w-full" variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับหน้าก่อน
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}