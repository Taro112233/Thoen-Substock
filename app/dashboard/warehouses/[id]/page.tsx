// app/dashboard/warehouses/[id]/page.tsx - Refactored Version
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Import types and components
import { WarehouseDetail } from "@/types/warehouse";
import { mockPendingRequisitions, mockRecentTransactions, mockPendingReceivings } from "@/data/warehouse-mock";
import WarehouseHeader from "@/components/warehouse/WarehouseHeader";
import StatsCards from "@/components/warehouse/StatsCards";
import StockTab from "@/components/warehouse/tabs/StockTab";
import RequisitionsTab from "@/components/warehouse/tabs/RequisitionsTab";
import ReceivingsTab from "@/components/warehouse/tabs/ReceivingsTab";
import TransactionsTab from "@/components/warehouse/tabs/TransactionsTab";

export default function WarehouseDetailDashboard() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [warehouse, setWarehouse] = useState<WarehouseDetail | null>(null);
  const [selectedTab, setSelectedTab] = useState("stock");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchWarehouseDetail(params.id as string);
    }
  }, [params.id]);

  const fetchWarehouseDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/dashboard/warehouses/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch warehouse data`);
      }
      
      const data = await response.json();
      console.log('📦 [WAREHOUSE DETAIL] Data received:', data);
      
      // Validate data structure และใส่ default values
      const validatedData: WarehouseDetail = {
        ...data,
        stockCards: Array.isArray(data.stockCards) ? data.stockCards : [],
        recentTransactions: Array.isArray(data.recentTransactions) ? data.recentTransactions : [],
        pendingRequisitions: Array.isArray(data.pendingRequisitions) ? data.pendingRequisitions : [],
        pendingReceivings: Array.isArray(data.pendingReceivings) ? data.pendingReceivings : [],
        stockByCategory: Array.isArray(data.stockByCategory) ? data.stockByCategory : [],
        expiryAnalysis: Array.isArray(data.expiryAnalysis) ? data.expiryAnalysis : [],
        requisitionSummary: data.requisitionSummary || {
          incoming: 0,
          outgoing: 0,
          pending: 0,
          completed: 0
        },
        statistics: data.statistics || {
          totalDrugs: 0,
          totalStock: 0,
          stockValue: 0,
          lowStockItems: 0,
          expiringItems: 0,
          outOfStockItems: 0,
          overstockItems: 0,
          recentActivity: 0,
          pendingRequisitions: 0,
          turnoverRate: 0,
          accuracyRate: 0,
          utilizationRate: 0,
          avgDailyUsage: 0,
          daysOfStock: 0
        },
        _counts: data._counts || { stockCards: 0, stockTransactions: 0 }
      };
      
      // เพิ่ม mock data สำหรับ pending requisitions
      if (!validatedData.pendingRequisitions || validatedData.pendingRequisitions.length === 0) {
        validatedData.pendingRequisitions = mockPendingRequisitions;
      }
      
      // เพิ่ม mock data สำหรับ recent transactions
      if (!validatedData.recentTransactions || validatedData.recentTransactions.length === 0) {
        validatedData.recentTransactions = mockRecentTransactions;
      }
      
      setWarehouse(validatedData);
    } catch (err) {
      console.error('❌ [WAREHOUSE DETAIL] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (params.id) {
      fetchWarehouseDetail(params.id as string);
    }
  };

  // Loading Component
  const LoadingComponent = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );

  // Error Component
  const ErrorComponent = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            กลับ
          </Button>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          <AlertDescription>
            {error || 'ไม่พบข้อมูลคลัง'}
          </AlertDescription>
        </Alert>
        
        <div className="mt-4">
          <Button onClick={handleRefresh} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            ลองใหม่
          </Button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return <LoadingComponent />;
  }

  // Error state
  if (error || !warehouse) {
    return <ErrorComponent />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <WarehouseHeader warehouse={warehouse} onRefresh={handleRefresh} />

        {/* Key Statistics Cards */}
        <StatsCards warehouse={warehouse} />

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="stock">สต็อก</TabsTrigger>
              <TabsTrigger value="requisitions">รายการยารอเบิก</TabsTrigger>
              <TabsTrigger value="receivings">รายการยารอรับเข้า</TabsTrigger>
              <TabsTrigger value="transactions">การเคลื่อนไหว</TabsTrigger>
            </TabsList>

            {/* Stock Tab */}
            <TabsContent value="stock" className="space-y-6">
              <StockTab warehouse={warehouse} />
            </TabsContent>

            {/* Requisitions Tab */}
            <TabsContent value="requisitions" className="space-y-6">
              <RequisitionsTab warehouse={warehouse} />
            </TabsContent>

            {/* Receivings Tab */}
            <TabsContent value="receivings" className="space-y-6">
              <ReceivingsTab warehouse={warehouse} />
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <TransactionsTab warehouse={warehouse} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}