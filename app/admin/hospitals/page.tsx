// app/admin/hospitals/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  Bed,
  Phone,
  Globe
} from 'lucide-react';
import { mockHospitals } from '@/lib/mock-data';

export default function HospitalManagementPage() {
  const [hospitals, setHospitals] = useState(mockHospitals);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>จัดการข้อมูลโรงพยาบาล</CardTitle>
                <CardDescription>เพิ่ม แก้ไข และจัดการข้อมูลโรงพยาบาลในระบบ</CardDescription>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มโรงพยาบาล
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาโรงพยาบาล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="py-2 px-4">
              ทั้งหมด {filteredHospitals.length} แห่ง
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Hospital List */}
      <div className="grid gap-4">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-xl font-semibold">{hospital.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          จังหวัด{hospital.province}
                        </span>
                        <span className="flex items-center">
                          <Bed className="h-3 w-3 mr-1" />
                          {hospital.beds} เตียง
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-2">
                      <Badge 
                        variant={hospital.status === 'active' ? 'default' : 'secondary'}
                        className={hospital.status === 'active' ? 'bg-green-500' : ''}
                      >
                        {hospital.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </Badge>
                      <span className="text-xs text-gray-500">ID: {hospital.id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
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