// components/stock/EditStockDialog.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign, Save, X, Calculator } from 'lucide-react';
import { EditingState, StockItem } from '@/types/stock';
import { formatCurrency, formatPackageInfo } from '@/utils/stock-helpers';

interface EditStockDialogProps {
  isOpen: boolean;
  editingItem: EditingState | null;
  stockCards: StockItem[];
  isUpdating: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (item: EditingState) => void;
}

export function EditStockDialog({
  isOpen,
  editingItem,
  stockCards,
  isUpdating,
  onClose,
  onSave,
  onUpdate
}: EditStockDialogProps) {
  const currentItem = editingItem 
    ? stockCards.find(item => item.id === editingItem.stockCardId)
    : null;

  if (!editingItem || !currentItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลสต็อก</DialogTitle>
          <DialogDescription>
            ปรับปรุงสต็อกปัจจุบัน จุดสั่งซื้อ และราคาต่อกล่อง สำหรับ {currentItem.drug.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* ข้อมูลยา */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm font-medium">{currentItem.drug.name}</div>
            <div className="text-xs text-muted-foreground">
              รหัส: {currentItem.drug.hospitalDrugCode}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              📦 {formatPackageInfo(currentItem)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* สต็อกปัจจุบัน */}
            <div className="space-y-2">
              <label className="text-sm font-medium">สต็อกปัจจุบัน (packages)</label>
              <Input
                type="number"
                min="0"
                value={editingItem.currentStock}
                onChange={(e) => onUpdate({
                  ...editingItem,
                  currentStock: parseInt(e.target.value) || 0
                })}
                className="text-right"
              />
            </div>

            {/* จุดสั่งซื้อ */}
            <div className="space-y-2">
              <label className="text-sm font-medium">จุดสั่งซื้อ</label>
              <Input
                type="number"
                min="0"
                value={editingItem.reorderPoint}
                onChange={(e) => onUpdate({
                  ...editingItem,
                  reorderPoint: parseInt(e.target.value) || 0
                })}
                className="text-right"
              />
            </div>
          </div>

          {/* ราคาต่อกล่อง */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ราคาต่อกล่อง/แพ็ค (บาท)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={editingItem.pricePerBox}
              onChange={(e) => onUpdate({
                ...editingItem,
                pricePerBox: parseFloat(e.target.value) || 0
              })}
              className="text-right"
              placeholder="ใส่ราคาต่อกล่อง"
            />
          </div>

          {/* แสดงการเปลี่ยนแปลง */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <div className="font-medium text-blue-900 mb-2">สรุปการเปลี่ยนแปลง:</div>
            <div className="space-y-1 text-blue-800">
              <div>สต็อก: {currentItem.currentStock} → {editingItem.currentStock} packages</div>
              <div>จุดสั่งซื้อ: {currentItem.reorderPoint} → {editingItem.reorderPoint}</div>
              <div>ราคาต่อกล่อง: {formatCurrency(currentItem.pricePerBox)} → {formatCurrency(editingItem.pricePerBox)}</div>
            </div>
          </div>

          {/* การคำนวณมูลค่า */}
          <div className="bg-green-50 p-3 rounded-lg text-sm">
            <div className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              การคำนวณมูลค่าใหม่:
            </div>
            <div className="space-y-1 text-green-800">
              <div>มูลค่ารวม: {editingItem.currentStock} × {formatCurrency(editingItem.pricePerBox)} = {formatCurrency(editingItem.currentStock * editingItem.pricePerBox)}</div>
              <div>ราคาต่อหน่วย: {formatCurrency(editingItem.pricePerBox)} ÷ {currentItem.packageSize} = {formatCurrency(editingItem.pricePerBox / currentItem.packageSize)}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isUpdating}
          >
            <X className="h-4 w-4 mr-2" />
            ยกเลิก
          </Button>
          <Button 
            onClick={onSave}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                บันทึก
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}