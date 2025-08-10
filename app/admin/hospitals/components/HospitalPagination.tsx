// app/admin/hospitals/components/HospitalPagination.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface HospitalPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

export function HospitalPagination({
  pagination,
  onPageChange,
  onLimitChange,
  isLoading = false
}: HospitalPaginationProps) {
  const { page, limit, totalPages, totalCount, hasNext, hasPrev } = pagination;
  
  // Calculate range of displayed items
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  // Generate page numbers for display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis for large page counts
      if (page <= 3) {
        // Show first few pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        if (totalPages > 5) pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Show last few pages
        pages.push(1);
        if (totalPages > 5) pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current page
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Card className="shadow-sm">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* Results Info */}
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-700">
              แสดง <span className="font-medium">{startItem}</span> ถึง{' '}
              <span className="font-medium">{endItem}</span> จาก{' '}
              <span className="font-medium">{totalCount}</span> รายการ
            </p>
            
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">แสดง</span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => onLimitChange(Number(value))}
                disabled={isLoading}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">รายการ</span>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-2">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!hasPrev || isLoading}
              className="hidden sm:flex"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrev || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">ก่อนหน้า</span>
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {pageNumbers.map((pageNum, index) => (
                <div key={index}>
                  {pageNum === '...' ? (
                    <span className="px-3 py-2 text-gray-500">...</span>
                  ) : (
                    <Button
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum as number)}
                      disabled={isLoading}
                      className={`w-10 ${
                        pageNum === page 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'hover:bg-purple-50'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNext || isLoading}
            >
              <span className="hidden sm:inline mr-1">ถัดไป</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={!hasNext || isLoading}
              className="hidden sm:flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Page Info */}
        <div className="flex sm:hidden justify-center mt-4">
          <span className="text-sm text-gray-600">
            หน้า {page} จาก {totalPages}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}