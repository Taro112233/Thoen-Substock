// hooks/useStockCard.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  StockCard, 
  UpdateStockCardRequest, 
  UseStockCardProps, 
  UseStockCardReturn,
  ApiError 
} from '@/types/stock-card';

export function useStockCard({ warehouseId, stockCardId }: UseStockCardProps): UseStockCardReturn {
  const [stockCard, setStockCard] = useState<StockCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันดึงข้อมูลสต็อกการ์ด
  const fetchStockCard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/warehouses/${warehouseId}/stock-cards/${stockCardId}`);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถดึงข้อมูลได้');
      }

      const data = await response.json();
      setStockCard(data.stockCard);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      setError(errorMessage);
      console.error('Error fetching stock card:', err);
    } finally {
      setLoading(false);
    }
  }, [warehouseId, stockCardId]);

  // ฟังก์ชันอัปเดตข้อมูลสต็อกการ์ด
  const updateStockCard = useCallback(async (data: UpdateStockCardRequest) => {
    try {
      const response = await fetch(`/api/dashboard/warehouses/${warehouseId}/stock-cards/${stockCardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถอัปเดตข้อมูลได้');
      }

      const result = await response.json();
      
      // อัปเดต state ด้วยข้อมูลใหม่
      if (stockCard) {
        setStockCard(prev => prev ? {
          ...prev,
          currentStock: result.stockCard.currentStock,
          reorderPoint: result.stockCard.reorderPoint,
          availableStock: result.stockCard.availableStock,
          totalValue: result.stockCard.totalValue,
          lowStockAlert: result.stockCard.lowStockAlert,
          updatedAt: result.stockCard.lastUpdated,
          notes: data.notes || prev.notes,
        } : null);
      }

      toast.success('อัปเดตข้อมูลสำเร็จ', {
        description: `ปรับปรุงข้อมูลสต็อกการ์ด ${result.stockCard.drug.name} เรียบร้อยแล้ว`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดต';
      toast.error('ไม่สามารถอัปเดตข้อมูลได้', {
        description: errorMessage,
      });
      throw err;
    }
  }, [warehouseId, stockCardId, stockCard]);

  // ฟังก์ชันรีเฟรชข้อมูล
  const refreshStockCard = useCallback(async () => {
    await fetchStockCard();
  }, [fetchStockCard]);

  // ดึงข้อมูลครั้งแรกเมื่อ component mount
  useEffect(() => {
    if (warehouseId && stockCardId) {
      fetchStockCard();
    }
  }, [warehouseId, stockCardId, fetchStockCard]);

  return {
    stockCard,
    loading,
    error,
    updateStockCard,
    refreshStockCard,
  };
}