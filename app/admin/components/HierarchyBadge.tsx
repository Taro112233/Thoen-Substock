// app/admin/components/HierarchyBadge.tsx
import { Badge } from '@/components/ui/badge';

interface HierarchyBadgeProps {
  hierarchy: string;
}

export default function HierarchyBadge({ hierarchy }: HierarchyBadgeProps) {
  const colors: Record<string, string> = {
    DEVELOPER: 'bg-purple-500',
    DIRECTOR: 'bg-blue-500',
    GROUP_HEAD: 'bg-green-500',
    STAFF: 'bg-gray-500',
    STUDENT: 'bg-yellow-500'
  };
  
  const labels: Record<string, string> = {
    DEVELOPER: 'นักพัฒนา',
    DIRECTOR: 'ผู้อำนวยการ',
    GROUP_HEAD: 'หัวหน้ากลุ่มงาน',
    STAFF: 'พนักงาน',
    STUDENT: 'นักศึกษา'
  };
  
  return (
    <Badge className={`${colors[hierarchy]} text-white`}>
      {labels[hierarchy]}
    </Badge>
  );
}