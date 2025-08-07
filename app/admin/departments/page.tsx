// app/admin/departments/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  UserCheck,
  Building,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { mockDepartments } from '@/lib/mock-data';

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState(mockDepartments);
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
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>จัดการกลุ่มงาน (Department)</CardTitle>
                <CardDescription>จัดการกลุ่มงานและแผนกต่างๆ ภายในโรงพยาบาล</CardDescription>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มกลุ่มงาน
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">กลุ่มงานทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600">{departments.length}</p>
                <p className="text-xs text-gray-500 mt-1">กลุ่มงาน</p>
              </div>
              <Building className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">บุคลากรทั้งหมด</p>
                <p className="text-3xl font-bold text-green-600">
                  {departments.reduce((sum, dept) => sum + dept.staffCount, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">คน</p>
              </div>
              <Users className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เฉลี่ยต่อกลุ่ม</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(departments.reduce((sum, dept) => sum + dept.staffCount, 0) / departments.length)}
                </p>
                <p className="text-xs text-gray-500 mt-1">คน/กลุ่ม</p>
              </div>
              <UserCheck className="h-10 w-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{getDepartmentIcon(dept.code)}</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full">
                        {dept.code}
                      </span>
                      <h3 className="text-xl font-bold">{dept.name}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <UserCheck className="h-4 w-4" />
                        <span>หัวหน้า: <span className="font-semibold text-gray-800">{dept.head}</span></span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>บุคลากร: <span className="font-semibold text-gray-800">{dept.staffCount} คน</span></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        Active
                      </Badge>
                      <span className="text-xs text-gray-400">ID: {dept.id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      แก้ไข
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
    </div>
  );
}