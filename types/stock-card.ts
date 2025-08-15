// types/stock-card.ts

export interface Drug {
  id: string;
  hospitalDrugCode: string;
  name: string;
  genericName?: string;
  brandName?: string;
  strength: string;
  dosageForm: string;
  unit: string;
  category?: string;
  subcategory?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  type: string;
  location?: string;
}

export interface StockBatch {
  id: string;
  batchNumber: string;
  expiryDate: string;
  manufacturingDate?: string;
  currentQty: number;
  reservedQty: number;
  availableQty: number;
  status: 'ACTIVE' | 'EXPIRED' | 'QUARANTINED' | 'DISPOSED';
  daysUntilExpiry?: number;
}

export interface StockTransaction {
  id: string;
  transactionType: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdAt: string;
  performer?: {
    name: string;
    role: string;
  };
}

export interface StockCardStatistics {
  totalBatches: number;
  nearExpiryBatches: number;
  averageCostPerUnit: number;
  stockTurnover: number;
  daysOfStock: number;
}

export interface StockCard {
  id: string;
  cardNumber: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  reorderQty: number;
  maxStock?: number;
  minStock?: number;
  averageCost: number;
  lastCost: number;
  totalValue: number;
  lastIssueDate?: string;
  lastReceiveDate?: string;
  monthlyUsage: number;
  isActive: boolean;
  isControlled: boolean;
  isNarcotic: boolean;
  lowStockAlert: boolean;
  expiryAlert: boolean;
  overStockAlert: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  drug: Drug;
  warehouse: Warehouse;
  batches: StockBatch[];
  recentTransactions: StockTransaction[];
  statistics: StockCardStatistics;
}

export interface StockItem {
  id: string;
  drug: Drug;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  maxStock?: number;
  averageCost: number;
  totalValue: number;
  lowStockAlert: boolean;
  lastUpdated: string;
  notes?: string;
}

export interface UpdateStockCardRequest {
  currentStock: number;
  reorderPoint: number;
  notes?: string;
}

export interface UpdateStockCardResponse {
  message: string;
  stockCard: {
    id: string;
    currentStock: number;
    reorderPoint: number;
    availableStock: number;
    totalValue: number;
    lowStockAlert: boolean;
    lastUpdated: string;
    drug: Drug;
  };
  changes: {
    stockDifference: number;
    reorderPointChange: number;
    valueChange: number;
  };
}

export interface StockCardDetailResponse {
  stockCard: StockCard;
}

// Stock Status Types
export type StockStatus = 'normal' | 'low' | 'out' | 'overstock';

export interface StockStatusInfo {
  status: StockStatus;
  badge: {
    variant: 'default' | 'destructive' | 'secondary' | 'outline';
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

// Filter Types
export type StockFilter = 'all' | 'low' | 'out' | 'normal';

export interface FilterOption {
  key: StockFilter;
  label: string;
  count: number;
}

// Edit State Types
export interface EditingState {
  stockCardId: string;
  currentStock: number;
  reorderPoint: number;
}

// API Response Types
export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiSuccess<T = any> {
  message: string;
  data?: T;
}

// Hook Types
export interface UseStockCardProps {
  warehouseId: string;
  stockCardId: string;
}

export interface UseStockCardReturn {
  stockCard: StockCard | null;
  loading: boolean;
  error: string | null;
  updateStockCard: (data: UpdateStockCardRequest) => Promise<void>;
  refreshStockCard: () => Promise<void>;
}

// Table Column Types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Export utility types
export type StockCardKeys = keyof StockCard;
export type DrugKeys = keyof Drug;
export type StockItemKeys = keyof StockItem;