// app/admin/personnel-types/components/PersonnelTypeList.tsx
// Personnel Types - List Component (FIXED REF VERSION)
// แก้ไข ref type mismatch ในส่วน indeterminate checkbox

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Edit, 
  Trash2,
  Eye,
  Users,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PersonnelType, HIERARCHY_COLORS, HIERARCHY_ICONS, PERMISSION_LABELS } from '../types/personnel-type';

interface PersonnelTypeListProps {
  personnelTypes: PersonnelType[];
  loading: boolean;
  selectedItems: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  onEdit: (personnelType: PersonnelType) => void;
  onView: (personnelType: PersonnelType) => void;
  onDelete: (personnelType: PersonnelType) => void;
}

export function PersonnelTypeList({
  personnelTypes,
  loading,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onEdit,
  onView,
  onDelete
}: PersonnelTypeListProps) {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  
  // FIXED: Custom hook to handle indeterminate checkbox
  const useIndeterminateCheckbox = (checked: boolean, indeterminate: boolean) => {
    const checkboxRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
      if (checkboxRef.current) {
        // Find the actual input element inside the checkbox component
        const input = checkboxRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (input) {
          input.indeterminate = indeterminate;
        }
      }
    }, [indeterminate]);
    
    return checkboxRef;
  };

  const toggleDescription = (id: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDescriptions(newExpanded);
  };

  const getPermissionBadge = (permission: string, value: boolean) => {
    if (!value) return null;
    
    const config = PERMISSION_LABELS[permission];
    if (!config) return null;

    return (
      <TooltipProvider key={permission}>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`text-xs ${config.color}`}>
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getActivePermissions = (personnelType: PersonnelType) => {
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-20" />
                      <div className="h-6 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-16" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (personnelTypes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบประเภทบุคลากร</h3>
          <p className="text-gray-600">ไม่พบประเภทบุคลากรที่ตรงกับเงื่อนไขที่ระบุ</p>
        </CardContent>
      </Card>
    );
  }

  const allSelected = personnelTypes.length > 0 && selectedItems.length === personnelTypes.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < personnelTypes.length;

  // FIXED: Use the custom hook for indeterminate checkbox
  const selectAllCheckboxRef = useIndeterminateCheckbox(allSelected, someSelected);

  return (
    <div className="space-y-4">
      {/* Select All Header */}
      <Card className="bg-gray-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* FIXED: Proper ref handling */}
              <Checkbox
                ref={selectAllCheckboxRef}
                checked={allSelected}
                onCheckedChange={onSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedItems.length > 0 
                  ? `เลือกแล้ว ${selectedItems.length} จาก ${personnelTypes.length} รายการ`
                  : `เลือกทั้งหมด (${personnelTypes.length} รายการ)`
                }
              </span>
            </div>
            
            {selectedItems.length > 0 && (
              <Badge variant="secondary">
                {selectedItems.length} รายการ
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personnel Types List */}
      <div className="space-y-4">
        {personnelTypes.map((type) => (
          <Card 
            key={type.id} 
            className={`hover:shadow-xl transition-all duration-300 overflow-hidden ${
              selectedItems.includes(type.id) 
                ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' 
                : ''
            }`}
          >
            <div className={`h-1 bg-gradient-to-r ${HIERARCHY_COLORS[type.hierarchy]}`} />
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                {/* Left Side - Main Info */}
                <div className="flex items-start space-x-4 flex-1">
                  {/* Checkbox */}
                  <div className="flex items-center mt-1">
                    <Checkbox
                      checked={selectedItems.includes(type.id)}
                      onCheckedChange={(checked) => onSelectItem(type.id, !!checked)}
                    />
                  </div>

                  {/* Hierarchy Icon */}
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-2">{HIERARCHY_ICONS[type.hierarchy]}</div>
                    <Badge variant="outline" className="text-xs">
                      ระดับ {type.levelOrder}
                    </Badge>
                  </div>
                  
                  {/* Personnel Type Details */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-full">
                          {type.typeCode}
                        </span>
                        <h3 className="text-xl font-bold">{type.typeName}</h3>
                        {type.typeNameEn && (
                          <span className="text-sm text-gray-500">({type.typeNameEn})</span>
                        )}
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${HIERARCHY_COLORS[type.hierarchy]}`} />
                        
                        {/* Status Indicators */}
                        <div className="flex items-center space-x-2">
                          {type.isActive ? (
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
                          
                          {type.isSystemDefault && (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              <Crown className="h-3 w-3 mr-1" />
                              ระบบ
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Hierarchy: {type.hierarchy}</span>
                        <span>•</span>
                        <span>โรงพยาบาล: {type.hospital.name}</span>
                        <span>•</span>
                        <span>สร้างโดย: {type.creator.name}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {type.description && (
                      <div>
                        <p className="text-sm text-gray-600">
                          {expandedDescriptions.has(type.id) 
                            ? type.description
                            : `${type.description.slice(0, 100)}${type.description.length > 100 ? '...' : ''}`
                          }
                          {type.description.length > 100 && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto ml-1 text-blue-600"
                              onClick={() => toggleDescription(type.id)}
                            >
                              {expandedDescriptions.has(type.id) ? 'ย่อ' : 'ดูเพิ่มเติม'}
                            </Button>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {/* Permissions */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">สิทธิ์การเข้าถึง:</p>
                      <div className="flex flex-wrap gap-2">
                        {getActivePermissions(type).map((permission) => 
                          getPermissionBadge(permission, true)
                        )}
                        {getActivePermissions(type).length === 0 && (
                          <Badge variant="outline" className="text-gray-500">
                            ไม่มีสิทธิ์พิเศษ
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Responsibilities */}
                    {type.responsibilities && type.responsibilities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">หน้าที่ความรับผิดชอบ:</p>
                        <div className="flex flex-wrap gap-1">
                          {type.responsibilities.slice(0, 3).map((responsibility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {responsibility}
                            </Badge>
                          ))}
                          {type.responsibilities.length > 3 && (
                            <Badge variant="outline" className="text-xs text-blue-600">
                              +{type.responsibilities.length - 3} อื่นๆ
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    {(type.maxSubordinates || type.defaultDepartmentType) && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {type.maxSubordinates && (
                            <p className="text-gray-600">
                              ลูกน้องสูงสุด: <span className="font-semibold">{type.maxSubordinates} คน</span>
                            </p>
                          )}
                          {type.defaultDepartmentType && (
                            <p className="text-gray-600">
                              แผนกเริ่มต้น: <span className="font-semibold">{type.defaultDepartmentType}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Side - Actions */}
                <div className="flex flex-col items-end space-y-3">
                  {/* User Count */}
                  <div className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="cursor-help">
                            <p className="text-3xl font-bold text-purple-600">{type._count.users}</p>
                            <p className="text-sm text-gray-600">ผู้ใช้งาน</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>จำนวนผู้ใช้ที่มีประเภทบุคลากรนี้</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onView(type)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      ดู
                    </Button>
                    
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
                          <Eye className="h-4 w-4 mr-2" />
                          ดูรายละเอียด
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(type)}>
                          <Edit className="h-4 w-4 mr-2" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          ดูผู้ใช้งาน
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(type)}
                          className="text-red-600"
                          disabled={type.isSystemDefault}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Warning for System Default */}
                  {type.isSystemDefault && (
                    <div className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>ประเภทเริ่มต้นของระบบ<br />ไม่สามารถลบได้</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}