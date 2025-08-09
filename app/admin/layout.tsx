// app/admin/layout.tsx
import { ReactNode } from 'react';
import AdminHeader from '../components/AdminHeader';
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
      </div>
    </PermissionGuard>
  );
}