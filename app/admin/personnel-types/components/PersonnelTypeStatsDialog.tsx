// app/admin/personnel-types/components/PersonnelTypeStatsDialog.tsx
// ===================================

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3,
  Users,
  Shield,
  Building2,
  Crown,
  TrendingUp,
  PieChart,
  Activity,
  Loader2
} from 'lucide-react';
import { HIERARCHY_COLORS, PERMISSION_LABELS } from '../types/personnel-type';

interface PersonnelTypeStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StatisticsData {
  overview: {
    totalTypes: number;
    activeTypes: number;
    totalUsers: number;
    systemDefaultTypes: number;
  };
  statistics: {
    byHierarchy: Array<{
      hierarchy: string;
      count: number;
      averageLevelOrder: number;
      userCount: number;
    }>;
  };
  analytics: {
    levelDistribution: Array<{
      levelOrder: number;
      count: number;
    }>;
    hierarchyPermissions: Record<string, {
      total: number;
      permissions: Record<string, number>;
    }>;
    commonResponsibilities: Array<{
      responsibility: string;
      count: number;
      hierarchies: string[];
    }>;
  };
  recentActivity: Array<{
    id: string;
    typeName: string;
    typeCode: string;
    hierarchy: string;
    createdAt: string;
    creator: {
      name: string;
      role: string;
    };
  }>;
}

export function PersonnelTypeStatsDialog({
  open,
  onOpenChange
}: PersonnelTypeStatsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (open) {
      fetchStatistics();
    }
  }, [open, timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/personnel-types/statistics?timeRange=${timeRange}&groupBy=hierarchy`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHierarchyColor = (hierarchy: string) => {
    return HIERARCHY_COLORS[hierarchy as keyof typeof HIERARCHY_COLORS] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">กำลังโหลดสถิติ...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>สถิติประเภทบุคลากร</span>
          </DialogTitle>
          <DialogDescription>
            ภาพรวมและสถิติการใช้งานประเภทบุคลากร
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-4">
          {stats && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{stats.overview.totalTypes}</p>
                    <p className="text-sm text-gray-600">ประเภททั้งหมด</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{stats.overview.activeTypes}</p>
                    <p className="text-sm text-gray-600">ใช้งานแล้ว</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{stats.overview.totalUsers}</p>
                    <p className="text-sm text-gray-600">ผู้ใช้งาน</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Crown className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-600">{stats.overview.systemDefaultTypes}</p>
                    <p className="text-sm text-gray-600">ประเภทระบบ</p>
                  </CardContent>
                </Card>
              </div>

              {/* Hierarchy Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <span>การกระจายตามระดับลำดับชั้น</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.statistics.byHierarchy?.map((item) => (
                      <div key={item.hierarchy} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getHierarchyColor(item.hierarchy)}`} />
                          <div>
                            <p className="font-medium">{item.hierarchy}</p>
                            <p className="text-sm text-gray-600">ระดับเฉลี่ย: {item.averageLevelOrder}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{item.count}</p>
                          <p className="text-sm text-gray-600">{item.userCount} ผู้ใช้</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Level Distribution */}
              {stats.analytics?.levelDistribution && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span>การกระจายตามลำดับระดับ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {stats.analytics.levelDistribution.map((level) => (
                        <div key={level.levelOrder} className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-lg font-bold text-blue-600">{level.count}</p>
                          <p className="text-sm text-gray-600">ระดับ {level.levelOrder}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Permissions Analysis */}
              {stats.analytics?.hierarchyPermissions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <span>การวิเคราะห์สิทธิ์ตามระดับ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats.analytics.hierarchyPermissions).map(([hierarchy, data]) => (
                        <div key={hierarchy} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getHierarchyColor(hierarchy)}`} />
                            <h4 className="font-medium">{hierarchy}</h4>
                            <Badge variant="outline">{data.total} ประเภท</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-5">
                            {Object.entries(data.permissions).map(([permission, count]) => {
                              const config = PERMISSION_LABELS[permission];
                              if (!config || count === 0) return null;
                              
                              return (
                                <div key={permission} className="text-xs">
                                  <Badge variant="outline" className={config.color}>
                                    {config.label}: {count}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Common Responsibilities */}
              {stats.analytics?.commonResponsibilities && stats.analytics.commonResponsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <span>หน้าที่ความรับผิดชอบยอดนิยม</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stats.analytics.commonResponsibilities.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.responsibility}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.hierarchies.map((hierarchy) => (
                                <Badge key={hierarchy} variant="outline" className="text-xs">
                                  {hierarchy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              {stats.recentActivity && stats.recentActivity.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      <span>กิจกรรมล่าสุด</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{activity.typeName}</p>
                            <p className="text-sm text-gray-600">
                              {activity.typeCode} • {activity.hierarchy}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-gray-600">
                              สร้างโดย {activity.creator.name}
                            </p>
                            <p className="text-gray-500">
                              {new Date(activity.createdAt).toLocaleDateString('th-TH')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}