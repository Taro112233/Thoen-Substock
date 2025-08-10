// app/admin/hospitals/components/HospitalSearchFilter.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RefreshCw, Filter } from 'lucide-react';

// Import shared constants
import { hospitalTypes, hospitalStatuses } from '../types/hospital';

interface HospitalSearchFilterProps {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export function HospitalSearchFilter({
  searchTerm,
  statusFilter,
  typeFilter,
  totalCount,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onClearFilters,
  isLoading = false
}: HospitalSearchFilterProps) {
  const hasFilters = searchTerm || statusFilter || typeFilter;

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        {/* Search and Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาโรงพยาบาล, รหัส, หรือจังหวัด..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-purple-300 focus:ring-purple-300"
              disabled={isLoading}
            />
          </div>

          {/* Status Filter */}
          <Select 
            value={statusFilter} 
            onValueChange={onStatusFilterChange}
            disabled={isLoading}
          >
            <SelectTrigger className="border-gray-200 focus:border-purple-300">
              <SelectValue placeholder="สถานะทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">สถานะทั้งหมด</SelectItem>
              {hospitalStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    <span>{status.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select 
            value={typeFilter} 
            onValueChange={onTypeFilterChange}
            disabled={isLoading}
          >
            <SelectTrigger className="border-gray-200 focus:border-purple-300">
              <SelectValue placeholder="ประเภททั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ประเภททั้งหมด</SelectItem>
              {hospitalTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results and Actions Row */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="py-2 px-4 bg-gray-50">
              <Filter className="h-3 w-3 mr-1" />
              ทั้งหมด {totalCount} แห่ง
            </Badge>
            
            {hasFilters && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearFilters}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                ล้างฟิลเตอร์
              </Button>
            )}
          </div>
          
          {/* Active Filters Display */}
          {hasFilters && (
            <div className="flex items-center space-x-2">
              {searchTerm && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  ค้นหา: {searchTerm}
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  สถานะ: {hospitalStatuses.find(s => s.value === statusFilter)?.label}
                </Badge>
              )}
              {typeFilter && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ประเภท: {hospitalTypes.find(t => t.value === typeFilter)?.label}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}