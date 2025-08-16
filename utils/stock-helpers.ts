// utils/stock-helpers.ts
import { StockItem } from '@/types/stock';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export const calculateTotalUnits = (item: StockItem) => {
  return item.currentStock * item.packageSize;
};

export const formatPackageInfo = (item: StockItem) => {
  return `${item.packageSize} ${item.packageUnit || 'units'}/package`;
};

export const calculatePackageStats = (stockCards: StockItem[]) => {
  const totalPackages = stockCards.reduce((sum, item) => sum + item.currentStock, 0);
  const totalUnits = stockCards.reduce((sum, item) => {
    return sum + (item.currentStock * item.packageSize);
  }, 0);
  const avgPackagePrice = stockCards.length > 0 
    ? stockCards.reduce((sum, item) => sum + item.pricePerBox, 0) / stockCards.length
    : 0;
  
  return { totalPackages, totalUnits, avgPackagePrice };
};

export const exportStockToCSV = (stockCards: StockItem[], warehouseName: string) => {
  const csvContent = [
    ['รหัสยา', 'ชื่อยา', 'รูปแบบ', 'ความแรง', 'หน่วย', 'จุดสั่งซื้อ', 'สต็อกปัจจุบัน', 'Package Size', 'ราคาต่อกล่อง', 'มูลค่ารวม', 'สถานะ'],
    ...stockCards.map(item => [
      item.drug.hospitalDrugCode,
      item.drug.name,
      item.drug.dosageForm,
      item.drug.strength,
      item.drug.unit,
      item.reorderPoint.toString(),
      item.currentStock.toString(),
      item.packageSize.toString(),
      item.pricePerBox.toString(),
      item.totalValue.toString(),
      item.lowStockAlert ? 'สต็อกต่ำ' : item.currentStock === 0 ? 'หมด' : 'ปกติ'
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `stock-report-${warehouseName}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};