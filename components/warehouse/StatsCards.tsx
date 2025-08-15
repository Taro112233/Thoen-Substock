// components/warehouse/StatsCards.tsx
"use client";

import { motion } from "framer-motion";
import { DollarSign, Package, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WarehouseDetail } from "@/types/warehouse";
import { formatCurrency } from "@/utils/warehouse-helpers";

interface StatsCardsProps {
  warehouse: WarehouseDetail;
}

export default function StatsCards({ warehouse }: StatsCardsProps) {
  const stats = [
    {
      title: "มูลค่าสต็อกรวม",
      value: formatCurrency(warehouse.statistics.stockValue),
      subtitle: `${warehouse.statistics.totalDrugs} รายการยา`,
      icon: DollarSign,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "จำนวนสต็อกรวม",
      value: warehouse.statistics.totalStock.toLocaleString(),
      subtitle: "หน่วย",
      icon: Package,
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "สต็อกต่ำ",
      value: warehouse.statistics.lowStockItems.toString(),
      subtitle: "รายการ",
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      title: "ใกล้หมดอายุ",
      value: warehouse.statistics.expiringItems.toString(),
      subtitle: "รายการ",
      icon: Clock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.subtitle}
                </p>
              </div>
              <div className={`p-3 ${stat.iconBg} rounded-full`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}