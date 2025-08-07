// app/admin/hospitals/components/HospitalList.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  Bed,
  Phone,
  Globe,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Hospital {
  id: string;
  name: string;
  province: string;
  beds: number;
  status: 'active' | 'inactive';
  phone?: string;
  website?: string;
  address?: string;
}

interface HospitalListProps {
  hospitals: Hospital[];
  onEdit: (hospital: Hospital) => void;
  onDelete: (hospitalId: string) => void;
  onView: (hospital: Hospital) => void;
}

export default function HospitalList({ 
  hospitals, 
  onEdit, 
  onDelete, 
  onView 
}: HospitalListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
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
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="space-y-2 flex-1">
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
                        {hospital.phone && (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {hospital.phone}
                          </span>
                        )}
                        {hospital.website && (
                          <span className="flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            {hospital.website}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {hospital.address && (
                      <p className="text-sm text-gray-600">{hospital.address}</p>
                    )}
                    
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(hospital)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(hospital)}>
                        ดูรายละเอียด
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(hospital)}>
                        แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(hospital.id)}
                        className="text-red-600"
                      >
                        ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบโรงพยาบาล</h3>
            <p className="text-gray-600">ไม่พบโรงพยาบาลที่ตรงกับการค้นหา</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}