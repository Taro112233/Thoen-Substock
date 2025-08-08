"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Package, Users, TrendingUp, AlertTriangle,
  Plus, Filter, MoreVertical, Eye, Edit, Trash2, 
  Clock, CheckCircle, XCircle, RefreshCw, Bell,
  Calendar, MapPin, User, Building2, Activity,
  BarChart3, PieChart, LineChart, ArrowUp, ArrowDown,
  FileText, Download, Upload, Printer, Share2,
  Pill, Beaker, Thermometer, Shield, Zap,
  ChevronRight, ChevronDown, ChevronUp, Home
} from 'lucide-react';

// Type Definitions
interface StockItem {
  id: number;
  name: string;
  brand: string;
  stock: number;
  min: number;
  max: number;
  location: string;
  expiry: string;
  status: 'normal' | 'low' | 'critical';
}

interface Requisition {
  id: string;
  department: string;
  requester: string;
  items: number;
  total: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'cancelled';
  priority: 'normal' | 'high' | 'urgent';
  date: string;
}

interface WarehouseData {
  name: string;
  capacity: number;
  used: number;
  value: number;
  temp: string;
}

const PharmacySystemMockup = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [notifications, setNotifications] = useState(8);

  // Mock Data with proper typing
  const stockData: StockItem[] = [
    { id: 1, name: 'Paracetamol 500mg', brand: 'Tylenol', stock: 1250, min: 500, max: 2000, location: 'A1-B2', expiry: '2025-12-15', status: 'normal' },
    { id: 2, name: 'Amoxicillin 250mg', brand: 'Amoxil', stock: 180, min: 200, max: 800, location: 'A2-C1', expiry: '2025-08-20', status: 'low' },
    { id: 3, name: 'Metformin 500mg', brand: 'Glucophage', stock: 45, min: 100, max: 500, location: 'B1-A3', expiry: '2025-10-30', status: 'critical' },
    { id: 4, name: 'Insulin Rapid', brand: 'NovoRapid', stock: 95, min: 50, max: 150, location: 'COLD-1', expiry: '2025-09-15', status: 'normal' },
  ];

  const requisitions: Requisition[] = [
    { id: '54122', department: 'Sub-stock OPD', requester: 'จพ.ขวัญใจ ร่าเริง', items: 5, total: 2340, status: 'pending', priority: 'normal', date: '2025-08-08 14:30' },
    { id: '54121', department: 'Sub-stock OPD', requester: 'จพ.ขวัญใจ ร่าเริง', items: 8, total: 5670, status: 'approved', priority: 'urgent', date: '2025-08-08 13:15' },
    { id: 'ฉ54120', department: 'Sub-stock OPD', requester: 'ภก.โฟนโฟน เข้มแข็ง', items: 12, total: 8920, status: 'processing', priority: 'high', date: '2025-08-08 12:45' },
    { id: '54120', department: 'Sub-stock OPD', requester: 'จพ.ขวัญใจ ร่าเริง', items: 3, total: 1240, status: 'completed', priority: 'normal', date: '2025-08-08 11:20' },
  ];

  const warehouseData: WarehouseData[] = [
    { name: 'ยาเม็ด', capacity: 10000, used: 7500, value: 667000, temp: '20-25°C' },
    { name: 'ยาน้ำ', capacity: 1000, used: 850, value: 330000, temp: '20-25°C' },
    { name: 'ยาฉีด', capacity: 500, used: 320, value: 212000, temp: '2-8°C' },
    { name: 'High Alert Drug', capacity: 200, used: 95, value: 125000, temp: '20-25°C' },
  ];

  const NavigationTabs = () => (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
            { id: 'requisition', name: 'ระบบเบิกยา', icon: ShoppingCart },
            { id: 'inventory', name: 'คลังยา', icon: Package },
            { id: 'tracking', name: 'ติดตามสถานะ', icon: Activity },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sub-stock OPD</h1>
            <p className="text-blue-100 mt-1">โรงพยาบาลเถิน</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">วันที่ 8 สิงหาคม 2568</p>
              <p className="font-semibold">14:30 น.</p>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">รายการยาทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">250</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUp className="w-3 h-3 mr-1" />
                +5.2% จากเดือนที่แล้ว
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">มูลค่าสต็อก</p>
              <p className="text-2xl font-bold text-gray-900">1.23M</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <ArrowDown className="w-3 h-3 mr-1" />
                -2.1% จากเดือนที่แล้ว
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">สต็อกต่ำ</p>
              <p className="text-2xl font-bold text-red-600">23</p>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                ต้องสั่งซื้อ 18 รายการ
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ใบเบิกรอ</p>
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                รอการอนุมัติ 8 ใบ
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">สถานะคลังยา</h3>
          </div>
          <div className="p-6 space-y-4">
            {warehouseData.map((warehouse, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{warehouse.name}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>ความจุ: {warehouse.used.toLocaleString()}/{warehouse.capacity.toLocaleString()}</span>
                    <span>อุณหภูมิ: {warehouse.temp}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        warehouse.used / warehouse.capacity > 0.8 ? 'bg-red-500' :
                        warehouse.used / warehouse.capacity > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(warehouse.used / warehouse.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">฿{(warehouse.value / 1000).toFixed(1)}K</p>
                  <p className="text-sm text-gray-600">{Math.round((warehouse.used / warehouse.capacity) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">สต็อกวิกฤต</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stockData.filter(item => item.status === 'critical' || item.status === 'low').map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.brand} - {item.location}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.stock} หน่วย
                    </span>
                    <p className="text-xs text-gray-500 mt-1">ขั้นต่ำ: {item.min}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RequisitionView = () => {
    const [newRequisition, setNewRequisition] = useState({
      department: '',
      priority: 'normal',
      items: [{ drugId: '', quantity: '', notes: '' }]
    });

    const addItem = () => {
      setNewRequisition({
        ...newRequisition,
        items: [...newRequisition.items, { drugId: '', quantity: '', notes: '' }]
      });
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ระบบเบิกยา</h2>
            <p className="text-gray-600">สร้างและจัดการใบเบิกยาระหว่างแผนก</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            <span>สร้างใบเบิกใหม่</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">เบิกด่วน</h3>
                <p className="text-green-100 text-sm">สำหรับกรณีฉุกเฉิน</p>
              </div>
              <Zap className="w-8 h-8" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">เบิกตามรอบ</h3>
                <p className="text-blue-100 text-sm">เบิกประจำวัน/สัปดาห์</p>
              </div>
              <Calendar className="w-8 h-8" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">คืนยา</h3>
                <p className="text-purple-100 text-sm">คืนยาเหลือใช้</p>
              </div>
              <RefreshCw className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* New Requisition Form */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">สร้างใบเบิกยาใหม่</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">แผนกที่เบิก</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">เลือกแผนก</option>
                  <option value="icu">ICU</option>
                  <option value="er">ER</option>
                  <option value="ward1">หอผู้ป่วยชาย</option>
                  <option value="ward2">หอผู้ป่วยหญิง</option>
                  <option value="pediatric">กุมารเวชกรรม</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ระดับความสำคัญ</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="normal">ปกติ</option>
                  <option value="high">สูง</option>
                  <option value="urgent">ด่วน</option>
                  <option value="emergency">ฉุกเฉิน</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทการเบิก</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="regular">เบิกปกติ</option>
                  <option value="emergency">เบิกฉุกเฉิน</option>
                  <option value="scheduled">เบิกตามรอบ</option>
                  <option value="return">คืนยา</option>
                </select>
              </div>
            </div>

            {/* Drug Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">รายการยาที่ต้องการเบิก</h4>
                <button 
                  onClick={addItem}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มรายการ</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {newRequisition.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อยา</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option value="">เลือกยา</option>
                        <option value="paracetamol">Paracetamol 500mg</option>
                        <option value="amoxicillin">Amoxicillin 250mg</option>
                        <option value="metformin">Metformin 500mg</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">จำนวน</label>
                      <input 
                        type="number" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        <option value="tablet">เม็ด</option>
                        <option value="bottle">ขวด</option>
                        <option value="box">กล่อง</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        placeholder="ระบุหมายเหตุ"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                ยกเลิก
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                บันทึกเป็นแบบร่าง
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                ส่งใบเบิก
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InventoryView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">คลังยา</h2>
          <p className="text-gray-600">จัดการสต็อกยาและการเคลื่อนไหว</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>นำเข้ายา</span>
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>รายงาน</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="ค้นหายา..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option value="">ทุกคลัง</option>
            <option value="main">เภสัชกรรมกลาง</option>
            <option value="icu">คลัง ICU</option>
            <option value="cold">ห้องเย็น</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option value="">ทุกสถานะ</option>
            <option value="normal">ปกติ</option>
            <option value="low">ต่ำ</option>
            <option value="critical">วิกฤต</option>
          </select>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200">
            <Filter className="w-4 h-4" />
            <span>ตัวกรอง</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">สต็อกยาปัจจุบัน</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">ชื่อยา</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">แบรนด์</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">สต็อก</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">ตำแหน่ง</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">วันหมดอายุ</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">สถานะ</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockData.map((item: StockItem) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">รหัส: MED-{item.id.toString().padStart(4, '0')}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{item.brand}</td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{item.stock.toLocaleString()} หน่วย</p>
                      <p className="text-sm text-gray-500">ขั้นต่ำ: {item.min} / ขั้นสูง: {item.max}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.location}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{item.expiry}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'normal' ? 'bg-green-100 text-green-800' :
                      item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'normal' ? 'ปกติ' : item.status === 'low' ? 'ต่ำ' : 'วิกฤต'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const TrackingView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ติดตามสถานะใบเบิก</h2>
          <p className="text-gray-600">ตรวจสอบสถานะและความคืบหน้าการเบิกยา</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">รอการอนุมัติ</p>
              <p className="text-2xl font-bold text-orange-600">8</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">กำลังจัดเตรียม</p>
              <p className="text-2xl font-bold text-blue-600">5</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">เสร็จสิ้นแล้ว</p>
              <p className="text-2xl font-bold text-green-600">24</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ยกเลิก/ปฏิเสธ</p>
              <p className="text-2xl font-bold text-red-600">2</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Requisitions List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">รายการใบเบิกทั้งหมด</h3>
            <div className="flex space-x-2">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">ทุกสถานะ</option>
                <option value="pending">รอการอนุมัติ</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="processing">กำลังจัดเตรียม</option>
                <option value="completed">เสร็จสิ้น</option>
              </select>
              <input 
                type="text" 
                placeholder="ค้นหาใบเบิก..." 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
              />
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {requisitions.map((req: Requisition) => (
            <div key={req.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRequisition(req)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <h4 className="font-semibold text-gray-900">{req.id}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      req.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      req.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                      req.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {req.status === 'pending' ? 'รอการอนุมัติ' :
                       req.status === 'approved' ? 'อนุมัติแล้ว' :
                       req.status === 'processing' ? 'กำลังจัดเตรียม' :
                       req.status === 'completed' ? 'เสร็จสิ้น' : 'ยกเลิก'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      req.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      req.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.priority === 'urgent' ? 'ด่วนมาก' :
                       req.priority === 'high' ? 'ด่วน' : 'ปกติ'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Building2 className="w-4 h-4" />
                      <span>{req.department}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{req.requester}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Package className="w-4 h-4" />
                      <span>{req.items} รายการ</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{req.date}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">฿{req.total.toLocaleString()}</p>
                  <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed View Modal */}
      {selectedRequisition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">รายละเอียดใบเบิก {selectedRequisition.id}</h3>
                <button 
                  onClick={() => setSelectedRequisition(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Workflow Timeline */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">ความคืบหน้า</h4>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {[
                      { step: 'สร้างใบเบิก', completed: true, date: '08/08 12:45' },
                      { step: 'รอการอนุมัติ', completed: selectedRequisition.status !== 'pending', date: selectedRequisition.status === 'pending' ? '' : '08/08 13:30' },
                      { step: 'จัดเตรียมยา', completed: ['processing', 'completed'].includes(selectedRequisition.status), date: selectedRequisition.status === 'processing' ? '08/08 14:15' : '' },
                      { step: 'ส่งมอบ', completed: selectedRequisition.status === 'completed', date: selectedRequisition.status === 'completed' ? '08/08 15:00' : '' },
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {item.completed ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-2">{item.step}</p>
                        {item.date && <p className="text-xs text-gray-500">{item.date}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-300 -z-10"></div>
                </div>
              </div>

              {/* Requisition Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">ข้อมูลผู้เบิก</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">แผนก:</span>
                      <span className="font-medium">{selectedRequisition.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ผู้เบิก:</span>
                      <span className="font-medium">{selectedRequisition.requester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">วันที่เบิก:</span>
                      <span className="font-medium">{selectedRequisition.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ความสำคัญ:</span>
                      <span className={`font-medium ${
                        selectedRequisition.priority === 'urgent' ? 'text-red-600' :
                        selectedRequisition.priority === 'high' ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        {selectedRequisition.priority === 'urgent' ? 'ด่วนมาก' :
                         selectedRequisition.priority === 'high' ? 'ด่วน' : 'ปกติ'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">สรุปการเบิก</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">จำนวนรายการ:</span>
                      <span className="font-medium">{selectedRequisition.items} รายการ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">มูลค่ารวม:</span>
                      <span className="font-medium">฿{selectedRequisition.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">สถานะ:</span>
                      <span className={`font-medium ${
                        selectedRequisition.status === 'completed' ? 'text-green-600' :
                        selectedRequisition.status === 'processing' ? 'text-blue-600' :
                        selectedRequisition.status === 'approved' ? 'text-purple-600' :
                        'text-orange-600'
                      }`}>
                        {selectedRequisition.status === 'pending' ? 'รอการอนุมัติ' :
                         selectedRequisition.status === 'approved' ? 'อนุมัติแล้ว' :
                         selectedRequisition.status === 'processing' ? 'กำลังจัดเตรียม' :
                         'เสร็จสิ้น'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Drug Items */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">รายการยาที่เบิก</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ชื่อยา</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">จำนวนที่เบิก</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">จำนวนที่จ่าย</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ราคาต่อหน่วย</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">รวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 px-4 text-sm">Paracetamol 500mg</td>
                        <td className="py-3 px-4 text-sm">100 เม็ด</td>
                        <td className="py-3 px-4 text-sm">100 เม็ด</td>
                        <td className="py-3 px-4 text-sm">฿2.50</td>
                        <td className="py-3 px-4 text-sm font-medium">฿250</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm">Amoxicillin 250mg</td>
                        <td className="py-3 px-4 text-sm">50 เม็ด</td>
                        <td className="py-3 px-4 text-sm">45 เม็ด</td>
                        <td className="py-3 px-4 text-sm">฿8.75</td>
                        <td className="py-3 px-4 text-sm font-medium">฿393.75</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-sm">Insulin Rapid</td>
                        <td className="py-3 px-4 text-sm">5 หน่วย</td>
                        <td className="py-3 px-4 text-sm">5 หน่วย</td>
                        <td className="py-3 px-4 text-sm">฿340.00</td>
                        <td className="py-3 px-4 text-sm font-medium">฿1,700</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  พิมพ์ใบเบิก
                </button>
                {selectedRequisition.status === 'pending' && (
                  <>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      ปฏิเสธ
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      อนุมัติ
                    </button>
                  </>
                )}
                {selectedRequisition.status === 'approved' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    เริ่มจัดเตรียม
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationTabs />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'requisition' && <RequisitionView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'tracking' && <TrackingView />}
      </div>
    </div>
  );
};

export default PharmacySystemMockup;