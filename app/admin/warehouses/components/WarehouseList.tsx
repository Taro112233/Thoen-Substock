// app/admin/warehouses/components/WarehouseList.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Search, 
  Edit, 
  Trash2,
  Home,
  Activity,
  AlertTriangle,
  Snowflake,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: 'main' | 'department' | 'emergency' | 'critical' | 'special';
  status: 'active' | 'inactive';
  hospitalId: string;
  description?: string;
  capacity?: number;
  currentStock?: number;
}

interface WarehouseListProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouseId: string) => void;
  onView: (warehouse: Warehouse) => void;
}

export default function WarehouseList({ 
  warehouses, 
  onEdit, 
  onDelete, 
  onView 
}: WarehouseListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'emergency': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <Activity className="h-5 w-5" />;
      case 'special': return <Snowflake className="h-5 w-5" />;
      case 'main': return <Home className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'emergency': return 'bg-red-100 text-red-700';
      case 'critical': return 'bg-orange-100 text-orange-700';
      case 'special': return 'bg-purple-100 text-purple-700';
      case 'main': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeName = (type: string) => {
    switch(type) {
      case 'main': return 'คลังหลัก';
      case 'department': return 'แผนกทั่วไป';
      case 'emergency': return 'หน่วยฉุกเฉิน';
      case 'critical': return 'หน่วยวิกฤต';
      case 'special': return 'หน่วยพิเศษ';
      default: return type;
    }
  };

  const groupedWarehouses = filteredWarehouses.reduce((acc, warehouse) => {
    if (!acc[warehouse.type]) {
      acc[warehouse.type] = [];
    }
    acc[warehouse.type].push(warehouse);
    return acc;
  }, {} as Record<string, Warehouse[]>);

  const typeOrder = ['main', 'department', 'emergency', 'critical', 'special'];

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหาหน่วยงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="py-2 px-4">
              ทั้งหมด {filteredWarehouses.length} หน่วย
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Warehouse Groups */}
      {typeOrder.map(type => {
        const warehousesOfType = groupedWarehouses[type];
        if (!warehousesOfType || warehousesOfType.length === 0) return null;

        return (
          <div key={type} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getTypeColor(type)}`}>
                {getTypeIcon(type)}
              </div>
              <h3 className="text-lg font-semibold">{getTypeName(type)}</h3>
              <Badge variant="outline">{warehousesOfType.length} หน่วย</Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehousesOfType.map((warehouse) => (
                <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${getTypeColor(warehouse.type)}`}>
                            {getTypeIcon(warehouse.type)}
                          </div>
                          <div>
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {warehouse.code}
                            </span>
                          </div>
                        </div>
                        <Badge variant={warehouse.status === 'active' ? 'default' : 'secondary'}>
                          {warehouse.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-lg">{warehouse.name}</h4>
                        {warehouse.description && (
                          <p className="text-sm text-gray-600 mt-1">{warehouse.description}</p>
                        )}
                      </div>

                      {/* Capacity Info */}
                      {warehouse.capacity && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>ความจุ:</span>
                            <span className="font-medium">{warehouse.capacity} รายการ</span>
                          </div>
                          {warehouse.currentStock !== undefined && (
                            <div className="flex justify-between text-sm mt-1">
                              <span>ปัจจุบัน:</span>
                              <span className="font-medium">{warehouse.currentStock} รายการ</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">ID: {warehouse.id}</span>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onEdit(warehouse)}
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
                              <DropdownMenuItem onClick={() => onView(warehouse)}>
                                ดูรายละเอียด
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(warehouse)}>
                                แก้ไข
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDelete(warehouse.id)}
                                className="text-red-600"
                              >
                                ลบ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {filteredWarehouses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบหน่วยงาน</h3>
            <p className="text-gray-600">ไม่พบหน่วยงานที่ตรงกับการค้นหา</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}