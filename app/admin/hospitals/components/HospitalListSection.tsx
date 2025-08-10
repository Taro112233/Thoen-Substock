// app/admin/hospitals/components/HospitalListSection.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin,
  Bed,
  Phone,
  Mail,
  Globe,
  Users,
  Building,
  Package,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Import shared types
import { Hospital, hospitalTypes, hospitalStatuses } from '../types/hospital';

interface HospitalListSectionProps {
  hospitals: Hospital[];
  isLoading: boolean;
  onView: (hospital: Hospital) => void;
  onEdit: (hospital: Hospital) => void;
  onDelete: (hospital: Hospital) => void;
}

export function HospitalListSection({
  hospitals,
  isLoading,
  onView,
  onEdit,
  onDelete
}: HospitalListSectionProps) {
  const getStatusBadge = (status: Hospital['status']) => {
    const statusConfig = hospitalStatuses.find(s => s.value === status);
    return (
      <Badge 
        variant="secondary" 
        className={`${statusConfig?.color} text-white`}
      >
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getTypeLabel = (type: Hospital['type']) => {
    const typeConfig = hospitalTypes.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูลโรงพยาบาล...</p>
        </div>
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Building2 className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                ไม่พบข้อมูลโรงพยาบาล
              </h3>
              <p className="text-gray-600">
                ลองเปลี่ยนเงื่อนไขการค้นหาหรือเพิ่มโรงพยาบาลใหม่
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {hospitals.map((hospital) => (
        <Card 
          key={hospital.id} 
          className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-purple-300 group"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Hospital Icon */}
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
                
                <div className="space-y-3 flex-1">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {hospital.name}
                    </h3>
                    {hospital.nameEn && (
                      <p className="text-sm text-gray-600 mt-1">{hospital.nameEn}</p>
                    )}
                    
                    {/* Quick Info */}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {hospital.hospitalCode}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        จ.{hospital.province}
                      </span>
                      {hospital.bedCount && (
                        <span className="flex items-center">
                          <Bed className="h-3 w-3 mr-1" />
                          {hospital.bedCount} เตียง
                        </span>
                      )}
                      {hospital.employeeCount && (
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {hospital.employeeCount} คน
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(hospital.status)}
                    <Badge variant="outline" className="bg-gray-50">
                      {getTypeLabel(hospital.type)}
                    </Badge>
                    {hospital.isTrialAccount && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Trial
                      </Badge>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    {hospital.phone && (
                      <span className="flex items-center hover:text-purple-600 transition-colors">
                        <Phone className="h-3 w-3 mr-1" />
                        {hospital.phone}
                      </span>
                    )}
                    {hospital.email && (
                      <span className="flex items-center hover:text-purple-600 transition-colors">
                        <Mail className="h-3 w-3 mr-1" />
                        {hospital.email}
                      </span>
                    )}
                    {hospital.website && (
                      <span className="flex items-center hover:text-purple-600 transition-colors">
                        <Globe className="h-3 w-3 mr-1" />
                        {hospital.website}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  {hospital._count && (
                    <div className="flex items-center space-x-6 text-sm">
                      <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        <Users className="h-3 w-3 mr-1" />
                        {hospital._count.users} ผู้ใช้
                      </span>
                      <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Building className="h-3 w-3 mr-1" />
                        {hospital._count.departments} แผนก
                      </span>
                      <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                        <Package className="h-3 w-3 mr-1" />
                        {hospital._count.warehouses} คลัง
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => onView(hospital)}
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    ดูรายละเอียด
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onEdit(hospital)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    แก้ไข
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(hospital)}
                    className="text-red-600 cursor-pointer focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    ลบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}