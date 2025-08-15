import { StockItem, StockTransactionPayload } from "@/app/dashboard/warehouses/[id]/components/stock/types";

// lib/services/stockService.ts
export class StockService {
  static async getWarehouseStock(warehouseId: string): Promise<StockItem[]> {
    const response = await fetch(`/api/dashboard/warehouses/${warehouseId}/stock`);
    if (!response.ok) throw new Error('Failed to fetch stock data');
    return response.json();
  }

  static async updateStockCard(
    warehouseId: string, 
    stockCardId: string, 
    data: Partial<StockItem>
  ): Promise<StockItem> {
    const response = await fetch(
      `/api/dashboard/warehouses/${warehouseId}/stock-cards/${stockCardId}`, 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );
    if (!response.ok) throw new Error('Failed to update stock card');
    return response.json();
  }

  static async createStockTransaction(
    warehouseId: string, 
    transaction: StockTransactionPayload
  ): Promise<void> {
    const response = await fetch(
      `/api/dashboard/warehouses/${warehouseId}/stock-transactions`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      }
    );
    if (!response.ok) throw new Error('Failed to create stock transaction');
  }
}