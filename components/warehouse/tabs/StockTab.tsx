// components/warehouse/tabs/StockTab.tsx - Main Component (Simplified)
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Import types
import { StockItem, StockFilter, EditingState, StockTabProps } from '@/types/stock';

// Import components
import { StockFilters } from '@/components/stock/StockFilters';
import { StockTable } from '@/components/stock/StockTable';
import { EditStockDialog } from '@/components/stock/EditStockDialog';

// Import utilities
import { exportStockToCSV } from '@/utils/stock-helpers';

export default function StockTab({ warehouse }: StockTabProps) {
  // ===================================
  // STATE MANAGEMENT
  // ===================================
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<EditingState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [stockCards, setStockCards] = useState<StockItem[]>(warehouse.stockCards || []);

  // ===================================
  // COMPUTED VALUES
  // ===================================
  
  // Filter stock cards based on search and filter
  const filteredStockCards = stockCards.filter((item) => {
    const matchesSearch = 
      item.drug.hospitalDrugCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.drug.genericName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.drug.brandName?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = 
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.lowStockAlert) ||
      (stockFilter === 'out' && item.currentStock === 0) ||
      (stockFilter === 'normal' && !item.lowStockAlert && item.currentStock > 0) ||
      (stockFilter === 'highvalue' && item.pricePerBox > 500);

    return matchesSearch && matchesFilter;
  });

  // ===================================
  // EVENT HANDLERS
  // ===================================
  
  const handleEditStart = (item: StockItem) => {
    setEditingItem({
      stockCardId: item.id,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      pricePerBox: item.pricePerBox
    });
    setIsDialogOpen(true);
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEditUpdate = (updatedItem: EditingState) => {
    setEditingItem(updatedItem);
  };

  const handleEditSave = async () => {
    if (!editingItem) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/dashboard/warehouses/${warehouse.id}/stock-cards/${editingItem.stockCardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentStock: editingItem.currentStock,
          reorderPoint: editingItem.reorderPoint,
          pricePerBox: editingItem.pricePerBox,
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถอัปเดตข้อมูลได้');
      }

      const updatedStockCard = await response.json();

      // Update local state
      setStockCards(prev => 
        prev.map(item => 
          item.id === editingItem.stockCardId 
            ? {
                ...item,
                currentStock: editingItem.currentStock,
                reorderPoint: editingItem.reorderPoint,
                pricePerBox: editingItem.pricePerBox,
                availableStock: editingItem.currentStock - item.reservedStock,
                totalValue: editingItem.currentStock * editingItem.pricePerBox,
                lowStockAlert: editingItem.currentStock <= editingItem.reorderPoint,
                lastUpdated: new Date().toISOString()
              }
            : item
        )
      );

      toast('อัปเดตข้อมูลสต็อกสำเร็จ', {
        description: `ปรับปรุงข้อมูลสต็อกการ์ด ${updatedStockCard.drug?.name} เรียบร้อยแล้ว`,
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
        },
      });

      setEditingItem(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating stock card:', error);
      toast('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถอัปเดตข้อมูลสต็อกได้ กรุณาลองใหม่อีกครั้ง',
        style: {
          background: '#ef4444',
          color: 'white',
          border: '1px solid #dc2626',
        },
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = () => {
    exportStockToCSV(filteredStockCards, warehouse.name);
  };

  // ===================================
  // RENDER
  // ===================================
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <StockFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
              stockCards={stockCards}
              onExport={handleExport}
              warehouseName={warehouse.name}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Results Summary */}
          <div className="text-sm text-muted-foreground">
            แสดง {filteredStockCards.length} รายการ จากทั้งหมด {stockCards.length} รายการ
          </div>
        </CardContent>
      </Card>

      {/* Stock Table Card */}
      <Card>
        <CardContent className="p-0">
          <StockTable
            stockCards={filteredStockCards}
            onEditStart={handleEditStart}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditStockDialog
        isOpen={isDialogOpen}
        editingItem={editingItem}
        stockCards={stockCards}
        isUpdating={isUpdating}
        onClose={handleEditCancel}
        onSave={handleEditSave}
        onUpdate={handleEditUpdate}
      />
    </div>
  );
}