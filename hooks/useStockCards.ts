// hooks/useStockCards.ts - Hook สำหรับจัดการหลายสต็อกการ์ด

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StockItem, StockFilter, UpdateStockCardRequest } from '@/types/stock-card';
import { toast } from 'sonner';

interface UseStockCardsProps {
  warehouseId: string;
  initialStockCards?: StockItem[];
}

interface UseStockCardsReturn {
  stockCards: StockItem[];
  filteredStockCards: StockItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  stockFilter: StockFilter;
  setStockFilter: (filter: StockFilter) => void;
  loading: boolean;
  error: string | null;
  refreshStockCards: () => Promise<void>;
  updateStockCard: (stockCardId: string, data: UpdateStockCardRequest) => Promise<void>;
  statistics: {
    total: number;
    low: number;
    out: number;
    normal: number;
  };
}

export function useStockCards({ warehouseId, initialStockCards = [] }: UseStockCardsProps): UseStockCardsReturn {
  const [stockCards, setStockCards] = useState<StockItem[]>(initialStockCards);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // คำนวณสถิติ
  const statistics = useMemo(() => {
    return {
      total: stockCards.length,
      low: stockCards.filter(item => item.lowStockAlert).length,
      out: stockCards.filter(item => item.currentStock === 0).length,
      normal: stockCards.filter(item => !item.lowStockAlert && item.currentStock > 0).length,
    };
  }, [stockCards]);

  // ฟิลเตอร์ข้อมูล
  const filteredStockCards = useMemo(() => {
    return stockCards.filter((item) => {
      const matchesSearch = 
        item.drug.hospitalDrugCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.drug.genericName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.drug.brandName?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter = 
        stockFilter === 'all' ||
        (stockFilter === 'low' && item.lowStockAlert) ||
        (stockFilter === 'out' && item.currentStock === 0) ||
        (stockFilter === 'normal' && !item.lowStockAlert && item.currentStock > 0);

      return matchesSearch && matchesFilter;
    });
  }, [stockCards, searchTerm, stockFilter]);

  // ฟังก์ชันดึงข้อมูลสต็อกการ์ดทั้งหมด
  const fetchStockCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/warehouses/${warehouseId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถดึงข้อมูลได้');
      }

      const data = await response.json();
      setStockCards(data.warehouse.stockCards || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      setError(errorMessage);
      console.error('Error fetching stock cards:', err);
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  // ฟังก์ชันอัปเดตสต็อกการ์ดเฉพาะ
  const updateStockCard = useCallback(async (stockCardId: string, data: UpdateStockCardRequest) => {
    try {
      const response = await fetch(`/api/dashboard/warehouses/${warehouseId}/stock-cards/${stockCardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ไม่สามารถอัปเดตข้อมูลได้');
      }

      const result = await response.json();

      // อัปเดต state
      setStockCards(prev => 
        prev.map(item => 
          item.id === stockCardId 
            ? {
                ...item,
                currentStock: result.stockCard.currentStock,
                reorderPoint: result.stockCard.reorderPoint,
                availableStock: result.stockCard.availableStock,
                totalValue: result.stockCard.totalValue,
                lowStockAlert: result.stockCard.lowStockAlert,
                lastUpdated: result.stockCard.lastUpdated,
                notes: data.notes || item.notes,
              }
            : item
        )
      );

      toast.success('อัปเดตข้อมูลสำเร็จ', {
        description: `ปรับปรุงข้อมูลสต็อกการ์ด ${result.stockCard.drug.name} เรียบร้อยแล้ว`
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดต';
      toast.error('ไม่สามารถอัปเดตข้อมูลได้', {
        description: errorMessage,
      });
      throw err;
    }
  }, [warehouseId]);

  // ฟังก์ชันรีเฟรชข้อมูล
  const refreshStockCards = useCallback(async () => {
    await fetchStockCards();
  }, [fetchStockCards]);

  // อัปเดตข้อมูลเมื่อมีการเปลี่ยนแปลง initialStockCards
  useEffect(() => {
    if (initialStockCards.length > 0) {
      setStockCards(initialStockCards);
    }
  }, [initialStockCards]);

  return {
    stockCards,
    filteredStockCards,
    searchTerm,
    setSearchTerm,
    stockFilter,
    setStockFilter,
    loading,
    error,
    refreshStockCards,
    updateStockCard,
    statistics,
  };
}