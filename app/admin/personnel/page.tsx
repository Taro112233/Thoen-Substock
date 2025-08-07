// app/admin/personnel/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  ChevronRight,
  Users,
  Lock,
  Unlock,
  Crown
} from 'lucide-react';
import { mockPersonnelTypes } from '@/lib/mock-data';

export default function PersonnelManagementPage() {
  const [personnelTypes, setPersonnelTypes] = useState(mockPersonnelTypes);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>จัดการประเภทบุคลากร</CardTitle>
                <CardDescription>กำหนดประเภท ลำดับชั้น และสิทธิ์การใช้งานของบุคลากร</CardDescription>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มประเภท
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Hierarchy Visualization */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 text-lg">ลำดับชั้นการบังคับบัญชา (Hierarchy)</h4>
          <div className="flex items-center justify-center space-x-3 overflow-x-auto py-4">
            <div className="flex flex-col items-center">
              <div className="p-3 bg-purple-500 text-white rounded-full mb-2">
                <Crown className="h-6 w-6" />
              </div>
              <Badge className="bg-purple-500 text-white">Developer</Badge>
              <p className="text-xs text-gray-600 mt-1">สิทธิ์สูงสุด</p>
            </div>
            
            <ChevronRight className="h-6 w-6 text-gray-400" />
            
            <div className="flex flex-col items-center">
              <div className="p-3 bg-blue-500 text-white rounded-full mb-2">
                <Shield className="h-6 w-6" />
              </div>
              <Badge className="bg-blue-500 text-white">ผู้อำนวยการ</Badge>
              <p className="text-xs text-gray-600 mt-1">1 คน</p>
            </div>
            
            <ChevronRight className="h-6 w-6 text-gray-400" />
            
            <div className="flex flex-col items-center">
              <div className="p-3 bg-green-500 text-white rounded-full mb-2">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-green-500 text-white">หัวหน้ากลุ่มงาน</Badge>
              <p className="text-xs text-gray-600 mt-1">8 คน</p>
            </div>
            
            <ChevronRight className="h-6 w-6 text-gray-400" />
            
            <div className="flex flex-col items-center">
              <div className="p-3 bg-gray-500 text-white rounded-full mb-2">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-gray-500 text-white">พนักงาน</Badge>
              <p className="text-xs text-gray-600 mt-1">145 คน</p>
            </div>
            
            <ChevronRight className="h-6 w-6 text-gray-400" />
            
            <div className="flex flex-col items-center">
              <div className="p-3 bg-yellow-500 text-white rounded-full mb-2">
                <Users className="h-6 w-6" />
              </div>
              <Badge className="bg-yellow-500 text-white">นักศึกษา</Badge>
              <p className="text-xs text-gray-600 mt-1">32 คน</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
          </div>
        </CardContent>
      </Card>

      {/* Personnel Type List */}
      <div className="grid gap-4">
        {filteredTypes.map((type) => (
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
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{type.count}</p>
                    <p className="text-sm text-gray-600">ผู้ใช้งาน</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      แก้ไข
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}