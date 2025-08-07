// components/ui/error-message.tsx
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorMessageProps {
  message: string;
  className?: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorMessage({ 
  message, 
  className, 
  onRetry, 
  retryText = 'ลองใหม่' 
}: ErrorMessageProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
      <p className="text-gray-600 text-center mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  );
}