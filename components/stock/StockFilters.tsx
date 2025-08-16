// components/stock/StockFilters.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Download } from 'lucide-react';
import { StockItem, StockFilter } from '@/types/stock';

interface StockFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  stockFilter: StockFilter;
  setStockFilter: (filter: StockFilter) => void;
  stockCards: StockItem[];
  onExport: () => void;
  warehouseName: string;
}

export function StockFilters({
  searchTerm,
  setSearchTerm,
  stockFilter,
  setStockFilter,
  stockCards,
  onExport,
  warehouseName
}: StockFiltersProps) {
  const filterOptions = [
    { key: 'all', label: 'ทั้งหมด', count: stockCards.length },
    { key: 'low', label: 'สต็อกต่ำ', count: stockCards.filter(item => item.lowStockAlert).length },
    { key: 'out', label: 'หมดสต็อก', count: stockCards.filter(item => item.currentStock === 0).length },
    { key: 'normal', label: 'ปกติ', count: stockCards.filter(item => !item.lowStockAlert && item.currentStock > 0).length },
    { key: 'highvalue', label: 'มูลค่าสูง', count: stockCards.filter(item => item.pricePerBox > 500).length }
  ];

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">รายการสต็อกยา - {warehouseName}</span>
        <Button onClick={onExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          ส่งออก
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ค้นหาด้วยรหัสยา, ชื่อยา, ชื่อสามัญ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((filter) => (
            <Button
              key={filter.key}
              variant={stockFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStockFilter(filter.key as StockFilter)}
              className="relative"
            >
              {filter.label}
              <Badge variant="secondary" className="ml-2 text-xs">
                {filter.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}