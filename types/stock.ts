// types/stock.ts
export interface Drug {
  id: string;
  hospitalDrugCode: string;
  name: string;
  strength: string;
  dosageForm: string;
  unit: string;
  genericName?: string;
  brandName?: string;
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
  // Package pricing fields from StockCard model
  packageSize: number;        // จำนวนหน่วยต่อแพ็ค
  packageUnit?: string;       // หน่วยแพ็ค
  pricePerBox: number;        // ราคาต่อกล่อง/แพ็ค
  packageCost?: number;       // ต้นทุนต่อแพ็ค
  lastPackageCost?: number;   // ต้นทุนแพ็คล่าสุด
  monthlyPackageUsage?: number; // การใช้งานต่อเดือน (แพ็ค)
}

export interface StockTabProps {
  warehouse: {
    id: string;
    name: string;
    stockCards: StockItem[];
  };
}

export interface EditingState {
  stockCardId: string;
  currentStock: number;
  reorderPoint: number;
  pricePerBox: number;
}

export type StockFilter = 'all' | 'low' | 'out' | 'normal' | 'highvalue';