// app/dashboard/warehouses/[id]/components/stock/StockManagementTab.tsx
import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { StockTable } from './StockTable';
import { StockEditModal } from './StockEditModal';
import { StockSummaryCards } from './StockSummaryCards';
import { StockItem, StockSummary } from './types';
import { StockService } from '@/lib/services/stockService';

interface Props {
  warehouseId: string;
}

export const StockManagementTab = ({ warehouseId }: Props) => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stock data
  useEffect(() => {
    loadStockData();
  }, [warehouseId]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getWarehouseStock(warehouseId);
      setStockItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary
  const summary: StockSummary = {
    totalItems: stockItems.length,
    normalStock: stockItems.filter(item => !item.lowStockAlert && item.currentStock > 0).length,
    lowStock: stockItems.filter(item => item.lowStockAlert && item.currentStock > 0).length,
    outOfStock: stockItems.filter(item => item.currentStock === 0).length,
    totalValue: stockItems.reduce((sum, item) => sum + item.totalValue, 0)
  };

  // Handle edit
  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Handle successful update
  const handleUpdateSuccess = (updatedItem: StockItem) => {
    setStockItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={loadStockData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">รายการสต็อกยา</h2>
            <p className="text-sm text-gray-500">
              จัดการข้อมูลสต็อกยาในคลัง • ทั้งหมด {stockItems.length} รายการ
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6">
          <StockSummaryCards summary={summary} />
        </div>

        {/* Stock Table */}
        <StockTable 
          items={stockItems} 
          onEdit={handleEdit} 
        />
      </div>

      {/* Edit Modal */}
      <StockEditModal
        item={editingItem}
        warehouseId={warehouseId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
};