// app/admin/drugs/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Pill, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Beaker,
  Package2,
  AlertTriangle,
  Thermometer,
  Grid3x3,
  List
} from 'lucide-react';
import { 
  mockDrugForms, 
  mockDrugGroups, 
  mockDrugTypes, 
  mockStorageConditions 
} from '@/lib/mock-data';

export default function DrugManagementPage() {
  const [activeTab, setActiveTab] = useState('forms');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>จัดการข้อมูลยา</CardTitle>
                <CardDescription>จัดการข้อมูลพื้นฐานของยา รูปแบบ กลุ่ม ประเภท และการเก็บรักษา</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="forms" className="flex items-center space-x-2">
                <Beaker className="h-4 w-4" />
                <span>รูปแบบยา</span>
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center space-x-2">
                <Package2 className="h-4 w-4" />
                <span>กลุ่มยา</span>
              </TabsTrigger>
              <TabsTrigger value="types" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>ประเภทยา</span>
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4" />
                <span>การเก็บรักษา</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="forms" className="mt-6">
              <DrugFormsTab viewMode={viewMode} />
            </TabsContent>

            <TabsContent value="groups" className="mt-6">
              <DrugGroupsTab viewMode={viewMode} />
            </TabsContent>

            <TabsContent value="types" className="mt-6">
              <DrugTypesTab viewMode={viewMode} />
            </TabsContent>

            <TabsContent value="storage" className="mt-6">
              <DrugStorageTab viewMode={viewMode} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Drug Forms Tab Component
function DrugFormsTab({ viewMode }: { viewMode: 'grid' | 'list' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const forms = mockDrugForms;
  
  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">รูปแบบยา (Drug Forms)</h3>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มรูปแบบยา
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="ค้นหารูปแบบยา..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <span className="text-4xl">{form.icon}</span>
                  <div>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {form.code}
                    </span>
                    <h4 className="font-semibold mt-2">{form.name}</h4>
                    <p className="text-sm text-gray-600">{form.nameEn}</p>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {form.count} รายการ
                  </Badge>
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredForms.map((form) => (
            <Card key={form.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{form.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {form.code}
                        </span>
                        <h4 className="font-semibold">{form.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{form.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{form.count} รายการ</Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Drug Groups Tab Component
function DrugGroupsTab({ viewMode }: { viewMode: 'grid' | 'list' }) {
  const groups = mockDrugGroups;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">กลุ่มยา (Drug Groups)</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มกลุ่มยา
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono px-3 py-1.5 rounded-full ${group.color}`}>
                      {group.code}
                    </span>
                    <Badge variant="outline">{group.count} รายการ</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{group.name}</h4>
                    <p className="text-sm text-gray-600">{group.nameEn}</p>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      แก้ไข
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-mono px-3 py-1.5 rounded-full ${group.color}`}>
                      {group.code}
                    </span>
                    <div>
                      <h4 className="font-semibold">{group.name}</h4>
                      <p className="text-sm text-gray-600">{group.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{group.count} รายการ</Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Drug Types Tab Component
function DrugTypesTab({ viewMode }: { viewMode: 'grid' | 'list' }) {
  const types = mockDrugTypes;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ประเภทยา (Drug Types)</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มประเภทยา
        </Button>
      </div>

      <div className="grid gap-3">
        {types.map((type) => (
          <Card key={type.id} className="border-l-4 hover:shadow-lg transition-shadow" 
                style={{ borderLeftColor: type.color.replace('bg-', '#').replace('500', '') }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${type.color}`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {type.code}
                      </span>
                      <h4 className="font-semibold text-lg">{type.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-sm">
                    {type.count} รายการ
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
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

// Drug Storage Tab Component
function DrugStorageTab({ viewMode }: { viewMode: 'grid' | 'list' }) {
  const storageConditions = mockStorageConditions;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">การเก็บรักษายา (Storage Conditions)</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มเงื่อนไข
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {storageConditions.map((condition) => (
          <Card key={condition.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{condition.icon}</span>
                  <Badge variant="secondary">{condition.count} รายการ</Badge>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {condition.code}
                    </span>
                    <h4 className="font-semibold">{condition.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{condition.nameEn}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-gray-600">อุณหภูมิ</p>
                    <p className="font-semibold text-blue-700">{condition.temp}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-gray-600">ความชื้น</p>
                    <p className="font-semibold text-green-700">{condition.humidity}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    แก้ไข
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="h-3 w-3" />
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