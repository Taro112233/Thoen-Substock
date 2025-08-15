// app/dashboard/warehouses/[id]/components/stock/StockTable.tsx
import { Hash, Edit, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { StockItem } from './types';

interface Props {
  items: StockItem[];
  onEdit: (item: StockItem) => void;
}

export const StockTable = ({ items, onEdit }: Props) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStockStatus = (item: StockItem) => {
    if (item.currentStock === 0) {
      return { 
        label: 'หมด', 
        icon: AlertCircle,
        className: 'bg-gray-100 text-gray-800'
      };
    }
    if (item.currentStock <= item.reorderPoint) {
      return { 
        label: 'สต็อกต่ำ', 
        icon: AlertTriangle,
        className: 'bg-red-100 text-red-800'
      };
    }
    return { 
      label: 'ปกติ', 
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800'
    };
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
              รหัสยา
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ชื่อยา
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              จุดสั่งซื้อ
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              สต็อกปัจจุบัน
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              มูลค่ารวม
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              สถานะ
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              การจัดการ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => {
            const status = getStockStatus(item);
            const StatusIcon = status.icon;
            
            return (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    {item.drug.hospitalDrugCode}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <div className="font-medium text-sm">{item.drug.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.drug.dosageForm} {item.drug.strength} {item.drug.unit}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-mono">
                    {item.reorderPoint.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="font-mono font-medium text-sm">
                    {item.currentStock.toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm">
                  {formatCurrency(item.totalValue)}
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onEdit(item)}
                    className="inline-flex items-center justify-center h-8 w-8 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};