// app/admin/personnel-types/components/PersonnelTypePagination.tsx
// Personnel Types - Pagination Component
// Component สำหรับการแบ่งหน้าข้อมูล

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Info
} from 'lucide-react';
import type { PaginationInfo } from '../types/personnel-type';

interface PersonnelTypePaginationProps {
  pagination: PaginationInfo;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export function PersonnelTypePagination({
  pagination,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: PersonnelTypePaginationProps) {
  const { currentPage, totalPages, totalCount, hasNextPage, hasPrevPage } = pagination;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((item, index, array) => array.indexOf(item) === index);
  };

  const visiblePages = totalPages > 0 ? getVisiblePages() : [];

  // Calculate range info
  const startItem = totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          {/* Items per page selector */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm whitespace-nowrap">แสดงต่อหน้า:</Label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Info className="h-4 w-4" />
            <span>
              แสดง {startItem}-{endItem} จาก {totalCount.toLocaleString()} รายการ
              {totalPages > 0 && ` (หน้า ${currentPage} จาก ${totalPages})`}
            </span>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center space-x-1">
            {/* First page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!hasPrevPage}
              className="hidden sm:flex"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">ก่อนหน้า</span>
            </Button>

            {/* Page numbers */}
            <div className="hidden md:flex items-center space-x-1">
              {visiblePages.map((page, index) => (
                <div key={index}>
                  {page === '...' ? (
                    <span className="px-3 py-2 text-gray-400">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page as number)}
                      className={
                        currentPage === page 
                          ? "bg-purple-600 hover:bg-purple-700" 
                          : ""
                      }
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Current page indicator (mobile) */}
            <div className="md:hidden flex items-center px-3 py-2 text-sm bg-gray-100 rounded">
              {currentPage} / {totalPages}
            </div>

            {/* Next page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              <span className="hidden sm:inline mr-1">ถัดไป</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={!hasNextPage}
              className="hidden sm:flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick page navigation (mobile) */}
        <div className="md:hidden mt-4">
          <div className="flex justify-center">
            <Select
              value={currentPage.toString()}
              onValueChange={(value) => onPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <SelectItem key={page} value={page.toString()}>
                    หน้า {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* No data message */}
        {totalCount === 0 && (
          <div className="text-center py-8 text-gray-500">
            ไม่พบข้อมูลที่ตรงกับเงื่อนไขที่ระบุ
          </div>
        )}
      </CardContent>
    </Card>
  );
}