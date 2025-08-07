// app/admin/departments/components/DepartmentList.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Edit, 
  Trash2,
  UserCheck,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Department {
  id: string;
  name: string;
  code: string;
  staffCount: number;
  head: string;
  hospitalId: string;
  description?: string;
  budget?: number;
  phone?: string;
  location?: string;
}

interface DepartmentListProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (departmentId: string) => void;
  onView: (department: Department) => void;
}

export default function DepartmentList({ 
  departments, 
  onEdit, 
  onDelete, 
  onView 
}: DepartmentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDepartmentIcon = (code: string) => {
    switch(code) {
      case 'MED': return '👨‍⚕️';
      case 'NUR': return '👩‍⚕️';
      case 'PHAR': return '💊';
      case 'LAB': return '🔬';
      case 'RAD': return '📡';
      case 'ADMIN': return '🏢';
      case 'IT': return '💻';
      case 'FIN': return '💰';
      default: return '🏥';
    }
  };

  const getDepartmentColor = (code: string) => {
    switch(code) {
      case 'MED': return 'from-blue-500 to-indigo-500';
      case 'NUR': return 'from-pink-500 to-rose-500';
      case 'PHAR': return 'from-green-500 to-emerald-500';
      case 'LAB': return 'from-purple-500 to-violet-500';
      case 'RAD': return 'from-orange-500 to-amber-500';
      case 'ADMIN': return 'from-gray-500 to-slate-500';
      case 'IT': return 'from-cyan-500 to-blue-500';
      case 'FIN': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหากลุ่มงาน หรือหัวหน้ากลุ่ม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="py-2 px-4">
              พบ {filteredDepartments.length} กลุ่มงาน
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Department List */}
      <div className="grid gap-4">
        {filteredDepartments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${getDepartmentColor(dept.code)}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-4xl">{getDepartmentIcon(dept.code)}</div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full">
                        {dept.code}
                      </span>
                      <h3 className="text-xl font-bold">{dept.name}</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <UserCheck className="h-4 w-4" />
                        <span>หัวหน้า: <span className="font-semibold text-gray-800">{dept.head}</span></span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>บุคลากร: <span className="font-semibold text-gray-800">{dept.staffCount} คน</span></span>
                      </div>
                      
                      {dept.phone && (
                        <div className="flex items-center space-x-1">
                          <span>📞</span>
                          <span>โทร: <span className="font-semibold text-gray-800">{dept.phone}</span></span>
                        </div>
                      )}
                      
                      {dept.location && (
                        <div className="flex items-center space-x-1">
                          <span>📍</span>
                          <span>ที่ตั้ง: <span className="font-semibold text-gray-800">{dept.location}</span></span>
                        </div>
                      )}
                    </div>

                    {dept.description && (
                      <p className="text-sm text-gray-600 mt-2">{dept.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        Active
                      </Badge>
                      {dept.budget && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          งบประมาณ: {dept.budget.toLocaleString()} บาท
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">ID: {dept.id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{dept.staffCount}</div>
                    <div className="text-sm text-gray-500">คน</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(dept)}
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
                        <DropdownMenuItem onClick={() => onView(dept)}>
                          ดูรายละเอียด
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(dept)}>
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          จัดการบุคลากร
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(dept.id)}
                          className="text-red-600"
                        >
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    ดูรายละเอียด
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDepartments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบกลุ่มงาน</h3>
            <p className="text-gray-600">ไม่พบกลุ่มงานที่ตรงกับการค้นหา</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}