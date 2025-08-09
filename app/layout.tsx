// app/layout.tsx (Root Layout)
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/client-auth';
import ConditionalHeader from '@/components/layout/ConditionalHeader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hospital Pharmacy Stock Management System V2.0',
  description: 'ระบบจัดการสต็อกยาโรงพยาบาลแบบ Multi-tenant SaaS Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ConditionalHeader />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}