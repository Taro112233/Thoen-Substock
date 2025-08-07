// components/admin/StatCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  progress?: number;
  change?: {
    value: number;
    label: string;
    positive: boolean;
  };
  badge?: string;
  href?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  progress,
  change,
  badge,
  href 
}: StatCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 text-blue-600',
    green: 'border-green-200 bg-green-50 text-green-600',
    purple: 'border-purple-200 bg-purple-50 text-purple-600',
    orange: 'border-orange-200 bg-orange-50 text-orange-600',
    red: 'border-red-200 bg-red-50 text-red-600',
    gray: 'border-gray-200 bg-gray-50 text-gray-600'
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          {badge && (
            <Badge variant="outline" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          
          {progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">ความสมบูรณ์</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {change && (
            <div className="flex items-center space-x-1">
              {change.positive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                change.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.positive ? '+' : ''}{change.value}
              </span>
              <span className="text-xs text-gray-500">{change.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}