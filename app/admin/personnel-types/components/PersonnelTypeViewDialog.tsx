// app/admin/personnel-types/components/PersonnelTypeViewDialog.tsx
// Personnel Types - View Dialog Component
// Dialog สำหรับดูรายละเอียดประเภทบุคลากร

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Edit, 
  Trash2,
  Users,
  Building2,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Crown,
  Info
} from 'lucide-react';
import { PERMISSION_LABELS, HIERARCHY_COLORS, HIERARCHY_ICONS, type PersonnelType } from '../types/personnel-type';

interface PersonnelTypeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnelType: PersonnelType | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function PersonnelTypeViewDialog({
  open,
  onOpenChange,
  personnelType,
  onEdit,
  onDelete
}: PersonnelTypeViewDialogProps) {
  if (!personnelType) return null;

  const getActivePermissions = () => {
    const permissions = [];
    if (personnelType.canManageHospitals) permissions.push('canManageHospitals');
    if (personnelType.canManageWarehouses) permissions.push('canManageWarehouses');
    if (personnelType.canManageDepartments) permissions.push('canManageDepartments');
    if (personnelType.canManagePersonnel) permissions.push('canManagePersonnel');
    if (personnelType.canManageDrugs) permissions.push('canManageDrugs');
    if (personnelType.canManageMasterData) permissions.push('canManageMasterData');
    if (personnelType.canViewReports) permissions.push('canViewReports');
    if (personnelType.canApproveUsers) permissions.push('canApproveUsers');
    return permissions;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{HIERARCHY_ICONS[personnelType.hierarchy]}</div>
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <span>{personnelType.typeName}</span>
                {personnelType.typeNameEn && (
                  <span className="text-sm text-gray-500">({personnelType.typeNameEn})</span>
                )}
              </DialogTitle>
              <DialogDescription>
                รายละเอียดประเภทบุคลากร: {personnelType.typeCode}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Status & Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <span>ข้อมูลพื้นฐาน</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">รหัสประเภท</p>
                    <Badge variant="outline" className="font-mono">
                      {personnelType.typeCode}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ระดับลำดับชั้น</p>
                    <Badge className={`bg-gradient-to-r ${HIERARCHY_COLORS[personnelType.hierarchy]} text-white`}>
                      {personnelType.hierarchy}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ลำดับระดับ</p>
                    <Badge variant="outline">
                      ระดับ {personnelType.levelOrder}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">สถานะ</p>
                    {personnelType.isActive ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        ใช้งาน
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        ไม่ใช้งาน
                      </Badge>
                    )}
                  </div>
                </div>

                {personnelType.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">คำอธิบาย</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                      {personnelType.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  {personnelType.isSystemDefault && (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      <Crown className="h-3 w-3 mr-1" />
                      ประเภทเริ่มต้นของระบบ
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>สิทธิ์การเข้าถึง</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(PERMISSION_LABELS).map(([key, config]) => {
                    const hasPermission = personnelType[key as keyof PersonnelType] as boolean;
                    return (
                      <div key={key} className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        hasPermission ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        {hasPermission ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <div>
                          <p className={`font-medium ${hasPermission ? 'text-green-800' : 'text-gray-600'}`}>
                            {config.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            {personnelType.responsibilities && personnelType.responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>หน้าที่ความรับผิดชอบ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {personnelType.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{responsibility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Settings */}
            {(personnelType.maxSubordinates || personnelType.defaultDepartmentType) && (
              <Card>
                <CardHeader>
                  <CardTitle>การตั้งค่าเพิ่มเติม</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {personnelType.maxSubordinates && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">จำนวนลูกน้องสูงสุด</span>
                      <Badge variant="outline">{personnelType.maxSubordinates} คน</Badge>
                    </div>
                  )}
                  {personnelType.defaultDepartmentType && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">ประเภทแผนกเริ่มต้น</span>
                      <Badge variant="outline">{personnelType.defaultDepartmentType}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>สถิติการใช้งาน</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{personnelType._count.users}</p>
                    <p className="text-sm text-gray-600">ผู้ใช้งาน</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold text-gray-700">{personnelType.hospital.name}</p>
                    <p className="text-sm text-gray-600">โรงพยาบาล</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-lg font-semibold text-purple-700">{personnelType.creator.name}</p>
                    <p className="text-sm text-gray-600">ผู้สร้าง</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  <span>ข้อมูลระบบ</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">โรงพยาบาล</p>
                    <p className="font-medium">{personnelType.hospital.name} ({personnelType.hospital.hospitalCode})</p>
                  </div>
                  <div>
                    <p className="text-gray-600">สถานะโรงพยาบาล</p>
                    <Badge variant={personnelType.hospital.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {personnelType.hospital.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">ผู้สร้าง</p>
                    <p className="font-medium">{personnelType.creator.name} ({personnelType.creator.role})</p>
                  </div>
                  <div>
                    <p className="text-gray-600">วันที่สร้าง</p>
                    <p className="font-medium">{new Date(personnelType.createdAt).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
          <Button 
            variant="outline" 
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            แก้ไข
          </Button>
          <Button 
            variant="outline" 
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
            disabled={personnelType.isSystemDefault}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            ลบ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}