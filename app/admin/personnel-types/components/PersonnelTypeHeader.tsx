// COMPONENT: PersonnelTypeHeader.tsx  
// ===================================

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Plus, 
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  Trash2,
  CheckSquare,
  XSquare,
  FileDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PersonnelTypeHeaderProps {
  totalCount: number;
  selectedCount: number;
  statistics: any;
  onRefresh: () => void;
  onCreate: () => void;
  onImport: () => void;
  onShowStats: () => void;
  onBulkDelete: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkExport: () => void;
  hasSelection: boolean;
}

export function PersonnelTypeHeader({
  totalCount,
  selectedCount,
  statistics,
  onRefresh,
  onCreate,
  onImport,
  onShowStats,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  onBulkExport,
  hasSelection
}: PersonnelTypeHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>จัดการประเภทบุคลากร</CardTitle>
              <CardDescription>
                กำหนดประเภท ลำดับชั้น และสิทธิ์การใช้งานของบุคลากร
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Statistics Badge */}
            <div className="hidden md:flex items-center space-x-2">
              <Badge variant="outline" className="py-2 px-4">
                ทั้งหมด {totalCount} ประเภท
              </Badge>
              {statistics && (
                <Badge variant="outline" className="py-2 px-4 text-green-600">
                  ใช้งาน {statistics.totalActive} ประเภท
                </Badge>
              )}
              {selectedCount > 0 && (
                <Badge className="py-2 px-4 bg-blue-600">
                  เลือกแล้ว {selectedCount} รายการ
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Bulk Actions - แสดงเมื่อมีการเลือก */}
              {hasSelection && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      การกระทำ ({selectedCount})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onBulkActivate}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      เปิดใช้งาน
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onBulkDeactivate}>
                      <XSquare className="h-4 w-4 mr-2" />
                      ปิดใช้งาน
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onBulkExport}>
                      <FileDown className="h-4 w-4 mr-2" />
                      ส่งออกข้อมูล
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onBulkDelete} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      ลบรายการ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Utility Actions */}
              <Button variant="outline" size="sm" onClick={onShowStats}>
                <BarChart3 className="h-4 w-4 mr-2" />
                สถิติ
              </Button>

              <Button variant="outline" size="sm" onClick={onImport}>
                <Upload className="h-4 w-4 mr-2" />
                นำเข้า
              </Button>

              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                รีเฟรช
              </Button>

              <Button 
                className="bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                onClick={onCreate}
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มประเภท
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Statistics */}
        <div className="md:hidden flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="py-1 px-3">
            ทั้งหมด {totalCount}
          </Badge>
          {statistics && (
            <Badge variant="outline" className="py-1 px-3 text-green-600">
              ใช้งาน {statistics.totalActive}
            </Badge>
          )}
          {selectedCount > 0 && (
            <Badge className="py-1 px-3 bg-blue-600">
              เลือก {selectedCount}
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}