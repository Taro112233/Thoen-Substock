// app/admin/hospitals/components/HospitalPageHeader.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Users, Building, Package, RefreshCw } from 'lucide-react';

interface HospitalPageHeaderProps {
  totalCount: number;
  onCreateClick: () => void;
  onRefreshClick?: () => void;
  isLoading?: boolean;
}

export function HospitalPageHeader({ 
  totalCount, 
  onCreateClick, 
  onRefreshClick,
  isLoading = false 
}: HospitalPageHeaderProps) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                จัดการข้อมูลโรงพยาบาล
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                เพิ่ม แก้ไข และจัดการข้อมูลโรงพยาบาลในระบบ Multi-tenant SaaS
              </CardDescription>
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant="outline" className="bg-white/60">
                  <Building className="h-3 w-3 mr-1" />
                  {isLoading ? '...' : totalCount} โรงพยาบาล
                </Badge>
                <Badge variant="outline" className="bg-white/60">
                  <Package className="h-3 w-3 mr-1" />
                  SaaS Platform
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {onRefreshClick && (
              <Button 
                onClick={onRefreshClick}
                disabled={isLoading}
                variant="outline"
                size="lg"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                รีเฟรช
              </Button>
            )}
            
            <Button 
              onClick={onCreateClick}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all duration-200"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มโรงพยาบาล
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}