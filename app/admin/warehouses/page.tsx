// app/admin/warehouses/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Home,
  Activity,
  AlertTriangle,
  Snowflake
} from 'lucide-react';
import { mockWarehouses } from '@/lib/mock-data';

export default function WarehouseManagementPage() {
  const [warehouses, setWarehouses] = useState(mockWarehouses);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>จัดการหน่วยงาน (Warehouse)</CardTitle>
                <CardDescription>จัดการคลังยาและหน่วยงานต่างๆ ภายในโรงพยาบาล</CardDescription>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มหน่วยงาน
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ทั้งหมด</p>
                <p className="text-2xl font-bold">{warehouses.length}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">แผนกหลัก</p>
                <p className="text-2xl font-bold">
                  {warehouses.filter(w => w.type === 'department').length}
                </p>
              </div>
              <Home className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">หน่วยพิเศษ</p>
                <p className="text-2xl font-bold">
                  {warehouses.filter(w => ['special', 'critical'].includes(w.type)).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ฉุกเฉิน</p>
                <p className="text-2xl font-bold">
                  {warehouses.filter(w => w.type === 'emergency').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

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
          </div>
        </CardContent>
      </Card>

      {/* Warehouse Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWarehouses.map((warehouse) => (
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
                  <p className="text-sm text-gray-600 mt-1">
                    ประเภท: {warehouse.type === 'department' ? 'แผนกทั่วไป' : 
                             warehouse.type === 'emergency' ? 'หน่วยฉุกเฉิน' :
                             warehouse.type === 'critical' ? 'หน่วยวิกฤต' :
                             warehouse.type === 'special' ? 'หน่วยพิเศษ' :
                             warehouse.type === 'main' ? 'คลังหลัก' : warehouse.type}
                  </p>
                </div>
                
                <div className="flex items-center justify-end space-x-2 pt-2">
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