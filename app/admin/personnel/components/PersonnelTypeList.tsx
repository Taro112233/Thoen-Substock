// app/admin/personnel/components/PersonnelTypeList.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Search, 
  Edit, 
  Trash2,
  Users,
  Crown,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PersonnelType {
  id: string;
  code: string;
  name: string;
  hierarchy: 'DEVELOPER' | 'DIRECTOR' | 'GROUP_HEAD' | 'STAFF' | 'STUDENT';
  level: number;
  permissions: string[];
  count: number;
  hospitalId: string;
  description?: string;
  salary?: number;
}

interface PersonnelTypeListProps {
  personnelTypes: PersonnelType[];
  onEdit: (personnelType: PersonnelType) => void;
  onDelete: (personnelTypeId: string) => void;
  onView: (personnelType: PersonnelType) => void;
}

export default function PersonnelTypeList({ 
  personnelTypes, 
  onEdit, 
  onDelete, 
  onView 
}: PersonnelTypeListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTypes = personnelTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHierarchyColor = (level: number) => {
    const colors = ['', '', 'from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-gray-500 to-gray-600', 'from-yellow-500 to-yellow-600'];
    return colors[level] || 'from-gray-400 to-gray-500';
  };

  const getHierarchyIcon = (hierarchy: string) => {
    switch(hierarchy) {
      case 'DEVELOPER': return '👨‍💻';
      case 'DIRECTOR': return '👔';
      case 'GROUP_HEAD': return '👥';
      case 'STAFF': return '👤';
      case 'STUDENT': return '🎓';
      default: return '👤';
    }
  };

  const getPermissionBadge = (permission: string) => {
    const permissionLabels: Record<string, { label: string; color: string }> = {
      'warehouses': { label: 'จัดการคลัง', color: 'bg-blue-100 text-blue-700' },
      'departments': { label: 'จัดการแผนก', color: 'bg-green-100 text-green-700' },
      'personnel': { label: 'จัดการบุคลากร', color: 'bg-purple-100 text-purple-700' },
      'drugs': { label: 'จัดการยา', color: 'bg-orange-100 text-orange-700' },
      'reports': { label: 'ดูรายงาน', color: 'bg-gray-100 text-gray-700' },
      'view': { label: 'ดูอย่างเดียว', color: 'bg-gray-100 text-gray-600' },
      'request': { label: 'เบิกจ่าย', color: 'bg-indigo-100 text-indigo-700' }
    };
    
    const config = permissionLabels[permission] || { label: permission, color: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Sort by hierarchy level
  const sortedTypes = filteredTypes.sort((a, b) => a.level - b.level);

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาประเภทบุคลากร..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="py-2 px-4">
              ทั้งหมด {filteredTypes.length} ประเภท
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Personnel Type List */}
      <div className="grid gap-4">
        {sortedTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${getHierarchyColor(type.level)}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-2">{getHierarchyIcon(type.hierarchy)}</div>
                    <Badge variant="outline" className="text-xs">
                      ระดับ {type.level}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-full">
                          {type.code}
                        </span>
                        <h3 className="text-xl font-bold">{type.name}</h3>
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getHierarchyColor(type.level)}`} />
                      </div>
                      <p className="text-sm text-gray-600">Hierarchy: {type.hierarchy}</p>
                    </div>

                    {type.description && (
                      <p className="text-sm text-gray-600">{type.description}</p>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">สิทธิ์การเข้าถึง:</p>
                      <div className="flex flex-wrap gap-2">
                        {type.permissions.map((perm) => (
                          <div key={perm}>
                            {getPermissionBadge(perm)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {type.salary && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                          เงินเดือนเริ่มต้น: <span className="font-semibold">{type.salary.toLocaleString()} บาท</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{type.count}</p>
                    <p className="text-sm text-gray-600">ผู้ใช้งาน</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(type)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      แก้ไข
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(type)}>
                          ดูรายละเอียด
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(type)}>
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          จัดการสิทธิ์
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(type.id)}
                          className="text-red-600"
                        >
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTypes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบประเภทบุคลากร</h3>
            <p className="text-gray-600">ไม่พบประเภทบุคลากรที่ตรงกับการค้นหา</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}