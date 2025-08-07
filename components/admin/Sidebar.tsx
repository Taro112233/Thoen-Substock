// components/admin/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Warehouse, 
  Users, 
  Pill, 
  UserCheck, 
  Settings, 
  Shield,
  ChevronDown,
  ChevronRight,
  Database,
  Thermometer,
  Package,
  Tags,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  userName: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
  roles: string[];
  description?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'hospitals',
    title: 'โรงพยาบาล',
    icon: <Building2 className="w-5 h-5" />,
    href: '/admin/hospitals',
    roles: ['DEVELOPER'],
    description: 'จัดการข้อมูลโรงพยาบาลในระบบ'
  },
  {
    id: 'warehouses',
    title: 'หน่วยงาน (Warehouse)',
    icon: <Warehouse className="w-5 h-5" />,
    href: '/admin/warehouses',
    roles: ['DEVELOPER', 'DIRECTOR'],
    description: 'จัดการคลังยาและหน่วยงาน'
  },
  {
    id: 'departments',
    title: 'กลุ่มงาน (Department)',
    icon: <Users className="w-5 h-5" />,
    href: '/admin/departments',
    roles: ['DEVELOPER', 'DIRECTOR'],
    description: 'จัดการแผนกและกลุ่มงานต่างๆ'
  },
  {
    id: 'personnel',
    title: 'ประเภทบุคลากร',
    icon: <UserCheck className="w-5 h-5" />,
    href: '/admin/personnel-types',
    roles: ['DEVELOPER', 'DIRECTOR'],
    description: 'จัดการประเภทและตำแหน่งบุคลากร'
  },
  {
    id: 'drugs',
    title: 'ยา',
    icon: <Pill className="w-5 h-5" />,
    roles: ['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'],
    children: [
      {
        id: 'drug-forms',
        title: 'รูปแบบยา',
        icon: <Package className="w-4 h-4" />,
        href: '/admin/drugs/forms',
        roles: ['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'],
        description: 'เม็ด, แคปซูล, ยาฉีด, ยาน้ำ'
      },
      {
        id: 'drug-groups',
        title: 'กลุ่มยา',
        icon: <Tags className="w-4 h-4" />,
        href: '/admin/drugs/groups',
        roles: ['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'],
        description: 'Antibiotic, Analgesic, ฯลฯ'
      },
      {
        id: 'drug-types',
        title: 'ประเภทยา',
        icon: <Shield className="w-4 h-4" />,
        href: '/admin/drugs/types',
        roles: ['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'],
        description: 'High Alert, ยาเสพติด, ยาควบคุม'
      },
      {
        id: 'drug-storage',
        title: 'การเก็บรักษา',
        icon: <Thermometer className="w-4 h-4" />,
        href: '/admin/drugs/storage',
        roles: ['DEVELOPER', 'DIRECTOR', 'GROUP_HEAD'],
        description: 'อุณหภูมิห้อง, ตู้เย็น, แช่แข็ง'
      }
    ]
  },
  {
    id: 'system',
    title: 'ระบบ',
    icon: <Settings className="w-5 h-5" />,
    roles: ['DEVELOPER'],
    children: [
      {
        id: 'database',
        title: 'ฐานข้อมูล',
        icon: <Database className="w-4 h-4" />,
        href: '/admin/system/database',
        roles: ['DEVELOPER'],
        description: 'จัดการฐานข้อมูลและ Schema'
      }
    ]
  }
];

export function Sidebar({ isOpen, onClose, userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['drugs']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const hasAccess = (roles: string[]) => {
    return roles.includes(userRole);
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!hasAccess(item.roles)) return null;

    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href);

    if (item.children) {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              level > 0 ? "ml-4" : "",
              active || isExpanded
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.id} href={item.href!}>
        <div
          className={cn(
            "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-1",
            level > 0 ? "ml-4" : "",
            active
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          {item.icon}
          <span>{item.title}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:inset-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
          <div>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            <p className="text-xs text-blue-100">{userName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden text-white hover:bg-blue-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4 border-b border-gray-200">
          <Badge variant="outline" className="text-xs">
            {userRole === 'DEVELOPER' && '🔧 Developer'}
            {userRole === 'DIRECTOR' && '👨‍💼 Director'}
            {userRole === 'GROUP_HEAD' && '👩‍⚕️ Group Head'}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Hospital Pharmacy System
            <br />
            Admin Panel v2.0
          </p>
        </div>
      </div>
    </>
  );
}