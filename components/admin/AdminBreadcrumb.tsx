// components/admin/AdminBreadcrumb.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const pathMap: Record<string, string> = {
  '/admin': 'หน้าหลัก',
  '/admin/hospitals': 'โรงพยาบาล',
  '/admin/warehouses': 'หน่วยงาน',
  '/admin/departments': 'กลุ่มงาน',
  '/admin/personnel-types': 'ประเภทบุคลากร',
  '/admin/drugs': 'ยา',
  '/admin/drugs/forms': 'รูปแบบยา',
  '/admin/drugs/groups': 'กลุ่มยา',
  '/admin/drugs/types': 'ประเภทยา',
  '/admin/drugs/storage': 'การเก็บรักษา',
  '/admin/system': 'ระบบ',
  '/admin/system/database': 'ฐานข้อมูล',
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  
  // สร้าง breadcrumb paths
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = paths.map((_, index) => {
    const path = '/' + paths.slice(0, index + 1).join('/');
    return {
      path,
      title: pathMap[path] || paths[index]
    };
  });

  if (pathname === '/admin') {
    return null; // ไม่แสดง breadcrumb ในหน้าหลัก
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
      <nav className="flex items-center space-x-2 text-sm">
        <Link 
          href="/admin"
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <Home className="w-4 h-4" />
        </Link>
        
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium">{crumb.title}</span>
            ) : (
              <Link 
                href={crumb.path}
                className="text-gray-500 hover:text-gray-700"
              >
                {crumb.title}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}