// app/admin/components/HierarchyBadge.tsx
import { Badge } from '@/components/ui/badge';

interface HierarchyBadgeProps {
  hierarchy: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function HierarchyBadge({ 
  hierarchy, 
  size = 'md', 
  showIcon = true 
}: HierarchyBadgeProps) {
  
  const getHierarchyConfig = (hierarchy: string) => {
    const configs: Record<string, { 
      label: string; 
      color: string; 
      icon: string; 
      textColor: string; 
    }> = {
      DEVELOPER: { 
        label: 'นักพัฒนาระบบ', 
        color: 'bg-purple-500', 
        icon: '👨‍💻',
        textColor: 'text-white'
      },
      DIRECTOR: { 
        label: 'ผู้อำนวยการ', 
        color: 'bg-blue-500', 
        icon: '👔',
        textColor: 'text-white'
      },
      GROUP_HEAD: { 
        label: 'หัวหน้ากลุ่มงาน', 
        color: 'bg-green-500', 
        icon: '👥',
        textColor: 'text-white'
      },
      STAFF: { 
        label: 'พนักงาน', 
        color: 'bg-gray-500', 
        icon: '👤',
        textColor: 'text-white'
      },
      STUDENT: { 
        label: 'นักศึกษา', 
        color: 'bg-yellow-500', 
        icon: '🎓',
        textColor: 'text-white'
      }
    };
    
    return configs[hierarchy] || {
      label: hierarchy,
      color: 'bg-gray-400',
      icon: '👤',
      textColor: 'text-white'
    };
  };
  
  const getSizeClasses = (size: string) => {
    switch(size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-base px-4 py-2';
      default: return 'text-sm px-3 py-1.5';
    }
  };
  
  const config = getHierarchyConfig(hierarchy);
  
  return (
    <Badge 
      className={`
        ${config.color} 
        ${config.textColor} 
        ${getSizeClasses(size)}
        font-medium
        border-0
        hover:opacity-90
        transition-opacity
      `}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  );
}