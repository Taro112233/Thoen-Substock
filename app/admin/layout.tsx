// app/admin/layout.tsx
'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/lib/client-auth';
import { Sidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, error } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (error) {
    return <ErrorMessage message={error} className="min-h-screen" />;
  }

  if (!user) {
    window.location.href = '/auth/login';
    return null;
  }

  // ตรวจสอบสิทธิ์เข้าถึง Admin Panel
  const hasAdminAccess = ['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'].includes(user.role);
  
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600 mb-4">คุณไม่มีสิทธิ์ในการเข้าถึง Admin Panel</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            กลับไปหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
        userName={user.name}
      />

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        "lg:ml-64" // Desktop: always show sidebar
      )}>
        {/* Header */}
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

        {/* Breadcrumb */}
        <AdminBreadcrumb />

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}