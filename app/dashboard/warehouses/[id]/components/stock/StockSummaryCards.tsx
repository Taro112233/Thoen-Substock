// app/dashboard/warehouses/[id]/components/stock/StockSummaryCards.tsx
import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { StockSummary } from './types';

interface Props {
  summary: StockSummary;
}

export const StockSummaryCards = ({ summary }: Props) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Package className="h-5 w-5 text-blue-600" />
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {summary.totalItems}
        </div>
        <div className="text-sm text-gray-600">รายการยาทั้งหมด</div>
      </div>
      
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div className="text-2xl font-bold text-green-600">
          {summary.normalStock}
        </div>
        <div className="text-sm text-gray-600">สต็อกปกติ</div>
      </div>
      
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
        </div>
        <div className="text-2xl font-bold text-orange-600">
          {summary.lowStock}
        </div>
        <div className="text-sm text-gray-600">สต็อกต่ำ</div>
      </div>
      
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
        <div className="text-2xl font-bold text-red-600">
          {summary.outOfStock}
        </div>
        <div className="text-sm text-gray-600">หมดสต็อก</div>
      </div>
    </div>
  );
};