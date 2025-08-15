// app/dashboard/warehouses/[id]/components/stock/types.ts
export interface StockItem {
  id: string;
  drug: {
    id: string;
    hospitalDrugCode: string;
    name: string;
    genericName: string | null;
    strength: string | null;
    unit: string;
    dosageForm: string;
  };
  currentStock: number;
  reorderPoint: number;
  maxStock: number | null;
  averageCost: number;
  totalValue: number;
  lowStockAlert: boolean;
  lastUpdated?: string;
}

export interface StockEditForm {
  reorderPoint: string;
  currentStock: string;
  adjustmentReason: string;
  notes: string;
}

export interface StockTransactionPayload {
  stockCardId: string;
  drugId: string;
  transactionType: 'ADJUST_INCREASE' | 'ADJUST_DECREASE' | 'UPDATE';
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  unitCost: number;
  totalCost: number;
  reason: string;
  notes?: string;
  referenceDocument: string;
}

export interface StockSummary {
  totalItems: number;
  normalStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}