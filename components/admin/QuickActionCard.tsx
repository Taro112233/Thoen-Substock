// components/admin/QuickActionCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  badge?: string;
  disabled?: boolean;
}

export function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href, 
  color, 
  badge,
  disabled = false 
}: QuickActionCardProps) {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
    green: 'border-green-200 hover:border-green-300 hover:bg-green-50',
    purple: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50',
    orange: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  const CardWrapper = disabled ? 'div' : Link;
  const cardProps = disabled ? {} : { href };

  return (
    <CardWrapper {...cardProps}>
      <Card className={`
        transition-all duration-200 
        ${disabled ? 'opacity-50 cursor-not-allowed' : `cursor-pointer ${colorClasses[color]}`}
      `}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <div className={iconColorClasses[color]}>
                {icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate">{title}</h3>
                {badge && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
}