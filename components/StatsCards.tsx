// components/StatsCards.tsx
"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RequisitionStats } from "@/types/requisitions";
import { formatNumber } from "@/utils/requisitions";

interface StatItem {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
  bgColor: string;
  status: string;
}

interface StatsCardsProps {
  stats: RequisitionStats | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const getTrendIcon = (change: number) => {
  if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
  return <div className="h-4 w-4" />;
};

export default function StatsCards({ stats, activeTab, onTabChange }: StatsCardsProps) {
  if (!stats) return null;

  const quickStats: StatItem[] = [
    {
      title: "กำลังเบิก",
      value: formatNumber(stats.requesting),
      change: stats.trends.requestingChange,
      icon: "Send",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      status: "requesting"
    },
    {
      title: "เตรียมจัดส่ง",
      value: formatNumber(stats.preparing),
      change: stats.trends.preparingChange,
      icon: "PackageCheck",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      status: "preparing"
    },
    {
      title: "กำลังจัดส่ง",
      value: formatNumber(stats.shipping),
      change: stats.trends.shippingChange,
      icon: "Truck",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      status: "shipping"
    },
    {
      title: "สำเร็จ",
      value: formatNumber(stats.completed),
      change: stats.trends.completedChange,
      icon: "CheckCircle",
      color: "text-green-600",
      bgColor: "bg-green-100",
      status: "completed"
    },
    {
      title: "ยกเลิก",
      value: formatNumber(stats.cancelled),
      change: 0,
      icon: "Ban",
      color: "text-red-600",
      bgColor: "bg-red-100",
      status: "cancelled"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {quickStats.map((stat, index) => {
        const isActive = activeTab === stat.status;
        return (
          <Card 
            key={index} 
            className={cn(
              "hover:shadow-lg transition-all cursor-pointer",
              isActive && "ring-2 ring-blue-500 shadow-lg bg-blue-50"
            )}
            onClick={() => onTabChange(stat.status)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bgColor)}>
                  <div className={cn("h-5 w-5", stat.color)}>
                    {/* Icon placeholder - you'll need to import actual icons */}
                    <div className="w-full h-full bg-current rounded opacity-80" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {stat.title}
                </p>
                {stat.change !== 0 && (
                  <div className="flex items-center text-xs">
                    {getTrendIcon(stat.change)}
                    <span className={cn(
                      "ml-1",
                      stat.change > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="text-gray-500 ml-1">
                      จากเมื่อก่อน
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}