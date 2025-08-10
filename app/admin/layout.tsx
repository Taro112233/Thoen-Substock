// app/admin/layout.tsx (ปรับปรุง)
import { ReactNode } from 'react';
import PermissionGuard from './components/PermissionGuard';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <PermissionGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Toast Container - จะแสดงที่นี่ */}
        <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2">
          {/* Toast messages will be rendered here */}
        </div>
      </div>
    </PermissionGuard>
  );
}