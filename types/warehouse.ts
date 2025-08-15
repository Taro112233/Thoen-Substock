// types/warehouse.ts
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

export interface Transaction {
  id: string;
  transactionType: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  createdAt: string;
  drug: {
    name: string;
    hospitalDrugCode: string;
  } | null;
  performer: {
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  reference?: string | null;
  description?: string | null;
}

export interface RequisitionSummary {
  incoming: number;
  outgoing: number;
  pending: number;
  completed: number;
}

export interface PendingReceiving {
  id: string;
  purchaseOrderNumber: string;
  supplierName: string;
  expectedDate: string;
  status: string;
  priority: string;
  totalItems: number;
  totalEstimatedValue: number;
  deliveryNote?: string | null;
  items: Array<{
    id: string;
    drug: {
      hospitalDrugCode: string;
      name: string;
      strength: string | null;
      unit: string;
    };
    orderedQuantity: number;
    receivedQuantity: number;
    remainingQuantity: number;
    unitPrice: number;
    totalPrice: number;
    batchNumber?: string | null;
    expiryDate?: string | null;
    manufacturer?: string | null;
    notes?: string | null;
  }>;
}
export interface PendingRequisition {
  id: string;
  requisitionNumber: string;
  fromDepartment: {
    id: string;
    name: string;
    code: string;
  };
  requestDate: string;
  priority: string;
  status: string;
  totalItems: number;
  totalEstimatedValue: number;
  requester: {
    firstName: string;
    lastName: string;
    role: string;
  };
  items: Array<{
    id: string;
    drug: {
      hospitalDrugCode: string;
      name: string;
      strength: string | null;
      unit: string;
    };
    requestedQuantity: number;
    availableStock: number;
    estimatedCost: number;
    notes?: string | null;
  }>;
}

export interface WarehouseDetail {
  id: string;
  name: string;
  warehouseCode: string;
  type: string;
  location: string;
  address?: string | null;
  isActive: boolean;
  isMaintenance: boolean;
  area?: number | null;
  capacity?: number | null;
  hasTemperatureControl: boolean;
  minTemperature?: number | null;
  maxTemperature?: number | null;
  hasHumidityControl: boolean;
  minHumidity?: number | null;
  maxHumidity?: number | null;
  securityLevel: string;
  accessControl: boolean;
  cctv: boolean;
  alarm: boolean;
  lastStockCount?: string | null;
  totalValue: number;
  totalItems: number;
  description?: string | null;
  notes?: string | null;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phoneNumber?: string | null;
    position?: string | null;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  stockCards: StockItem[];
  recentTransactions: Transaction[];
  pendingRequisitions: PendingRequisition[];
  pendingReceivings: PendingReceiving[];
  requisitionSummary: RequisitionSummary;
  statistics: {
    totalDrugs: number;
    totalStock: number;
    stockValue: number;
    lowStockItems: number;
    expiringItems: number;
    outOfStockItems: number;
    overstockItems: number;
    recentActivity: number;
    pendingRequisitions: number;
    turnoverRate: number;
    accuracyRate: number;
    utilizationRate: number;
    avgDailyUsage: number;
    daysOfStock: number;
  };
  stockByCategory: Array<{
    category: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  expiryAnalysis: Array<{
    range: string;
    count: number;
    value: number;
  }>;
  _counts: {
    stockCards: number;
    stockTransactions: number;
  };
}