// app/admin/personnel-types/components/PersonnelTypeSearchFilter.tsx
// Personnel Types - Search & Filter Component
// Component สำหรับค้นหาและกรองข้อมูลประเภทบุคลากร

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { PERSONNEL_HIERARCHIES } from '../types/personnel-type';

interface PersonnelTypeSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  hierarchyFilter: string;
  onHierarchyFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onClearFilters: () => void;
}

export function PersonnelTypeSearchFilter({
  searchTerm,
  onSearchChange,
  hierarchyFilter,
  onHierarchyFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters
}: PersonnelTypeSearchFilterProps) {
  const hasActiveFilters = searchTerm || hierarchyFilter || statusFilter !== '';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาด้วยชื่อประเภท, รหัส, หรือคำอธิบาย..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                ล้างฟิลเตอร์
              </Button>
            )}
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Hierarchy Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">ระดับลำดับชั้น</Label>
              <Select value={hierarchyFilter} onValueChange={onHierarchyFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทั้งหมด</SelectItem>
                  {PERSONNEL_HIERARCHIES.map((hierarchy) => (
                    <SelectItem key={hierarchy.value} value={hierarchy.value}>
                      {hierarchy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">สถานะ</Label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทั้งหมด</SelectItem>
                  <SelectItem value="true">ใช้งาน</SelectItem>
                  <SelectItem value="false">ไม่ใช้งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">เรียงตาม</Label>
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typeName">ชื่อประเภท</SelectItem>
                  <SelectItem value="hierarchy">ลำดับชั้น</SelectItem>
                  <SelectItem value="levelOrder">ระดับ</SelectItem>
                  <SelectItem value="createdAt">วันที่สร้าง</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">ลำดับ</Label>
              <Select value={sortOrder} onValueChange={onSortOrderChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    <div className="flex items-center">
                      <SortAsc className="h-4 w-4 mr-2" />
                      น้อยไปมาก
                    </div>
                  </SelectItem>
                  <SelectItem value="desc">
                    <div className="flex items-center">
                      <SortDesc className="h-4 w-4 mr-2" />
                      มากไปน้อย
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Summary (Mobile) */}
            <div className="lg:hidden col-span-full">
              {hasActiveFilters && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        กำลังใช้ฟิลเตอร์
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onClearFilters}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      ล้าง
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="text-xs bg-white px-2 py-1 rounded border">
                        ค้นหา: {searchTerm}
                      </span>
                    )}
                    {hierarchyFilter && (
                      <span className="text-xs bg-white px-2 py-1 rounded border">
                        ระดับ: {PERSONNEL_HIERARCHIES.find(h => h.value === hierarchyFilter)?.label}
                      </span>
                    )}
                    {statusFilter !== '' && (
                      <span className="text-xs bg-white px-2 py-1 rounded border">
                        สถานะ: {statusFilter === 'true' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}