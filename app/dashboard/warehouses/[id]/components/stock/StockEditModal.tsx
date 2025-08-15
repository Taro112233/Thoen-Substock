// app/dashboard/warehouses/[id]/components/stock/StockEditModal.tsx
import { useState } from 'react';
import { 
  Edit, 
  Save, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { StockItem, StockEditForm } from './types';
import { StockService } from '@/lib/services/stockService';
import React from 'react';

interface Props {
  item: StockItem | null;
  warehouseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedItem: StockItem) => void;
}

export const StockEditModal = ({ 
  item, 
  warehouseId, 
  isOpen, 
  onClose, 
  onSuccess 
}: Props) => {
  const [form, setForm] = useState<StockEditForm>({
    reorderPoint: '',
    currentStock: '',
    adjustmentReason: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when item changes
  React.useEffect(() => {
    if (item) {
      setForm({
        reorderPoint: item.reorderPoint.toString(),
        currentStock: item.currentStock.toString(),
        adjustmentReason: '',
        notes: ''
      });
    }
  }, [item]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!item) return;

    setIsSubmitting(true);
    try {
      const originalStock = item.currentStock;
      const newStock = parseInt(form.currentStock);
      const stockDifference = newStock - originalStock;

      // Update stock card
      const updatedItem = await StockService.updateStockCard(
        warehouseId,
        item.id,
        {
          reorderPoint: parseInt(form.reorderPoint),
          currentStock: newStock
        }
      );

      // Create transaction log if stock changed
      if (stockDifference !== 0) {
        await StockService.createStockTransaction(warehouseId, {
          stockCardId: item.id,
          drugId: item.drug.id,
          transactionType: stockDifference > 0 ? 'ADJUST_INCREASE' : 'ADJUST_DECREASE',
          quantity: Math.abs(stockDifference),
          stockBefore: originalStock,
          stockAfter: newStock,
          unitCost: item.averageCost,
          totalCost: Math.abs(stockDifference) * item.averageCost,
          reason: form.adjustmentReason,
          notes: form.notes,
          referenceDocument: `MANUAL-ADJ-${Date.now()}`
        });
      }

      onSuccess(updatedItem);
      onClose();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !item) return null;

  const stockDifference = form.currentStock ? 
    parseInt(form.currentStock) - item.currentStock : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            <h3 className="text-lg font-semibold">แก้ไขข้อมูลสต็อก</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            แก้ไขข้อมูลสต็อกยา - การเปลี่ยนแปลงจะถูกบันทึกเป็น log
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Drug Info (Read-only) */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>รหัสยา:</strong> {item.drug.hospitalDrugCode}</div>
                <div><strong>ชื่อยา:</strong> {item.drug.name}</div>
                <div className="col-span-2">
                  <strong>รูปแบบ:</strong> {item.drug.dosageForm} {item.drug.strength} {item.drug.unit}
                </div>
              </div>
            </div>

            {/* Current Values Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-500">มูลค่าต่อหน่วย</div>
                <div className="font-mono font-medium">
                  {formatCurrency(item.averageCost)}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-gray-500">มูลค่ารวมปัจจุบัน</div>
                <div className="font-mono font-medium">
                  {formatCurrency(item.totalValue)}
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">จุดสั่งซื้อ *</label>
                  <input
                    type="number"
                    value={form.reorderPoint}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      reorderPoint: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">สต็อกปัจจุบัน *</label>
                  <input
                    type="number"
                    value={form.currentStock}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      currentStock: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Stock Adjustment Warning */}
              {stockDifference !== 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <div className="flex items-center gap-2">
                    {stockDifference > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">เพิ่มสต็อก: +{stockDifference} หน่วย</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm">ลดสต็อก: {stockDifference} หน่วย</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">เหตุผลในการปรับปรุง *</label>
                <input
                  value={form.adjustmentReason}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    adjustmentReason: e.target.value
                  }))}
                  placeholder="ระบุเหตุผล เช่น การนับสต็อก, การรับเข้า, การแก้ไข"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">หมายเหตุเพิ่มเติม</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.reorderPoint || !form.currentStock || !form.adjustmentReason || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </div>
    </div>
  );
};