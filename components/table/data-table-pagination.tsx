"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const total = (table.options.meta as { total?: number } | undefined)?.total ?? table.getFilteredRowModel().rows.length

  const pageCount = table.getPageCount()
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min(total, (pageIndex + 1) * pageSize)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    const halfVisible = Math.floor(maxVisible / 2)

    if (pageCount <= maxVisible) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i)
      }
    } else {
      if (pageIndex <= halfVisible) {
        for (let i = 0; i < maxVisible; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(pageCount - 1)
      } else if (pageIndex >= pageCount - halfVisible - 1) {
        pages.push(0)
        pages.push("ellipsis")
        for (let i = pageCount - maxVisible; i < pageCount; i++) {
          pages.push(i)
        }
      } else {
        pages.push(0)
        pages.push("ellipsis")
        for (let i = pageIndex - halfVisible; i <= pageIndex + halfVisible; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(pageCount - 1)
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col">
      {/* Rows per page selector and info */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {from}-{to} of {total}
          </span>
          <span className="hidden sm:inline">{table.getFilteredSelectedRowModel().rows.length} selected</span>
        </div>

        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              const next = Number(value)
              if (pageIndex !== 0) table.setPageIndex(0)
              table.setPageSize(next)
            }}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50, 100].map((ps) => (
                <SelectItem key={ps} value={`${ps}`}>
                  {ps}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Pagination className="justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="hidden lg:inline-flex"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
        </div>

        <PaginationContent>
          {getPageNumbers().map((page, idx) => (
            <PaginationItem key={idx}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => table.setPageIndex(page as number)}
                  isActive={pageIndex === page}
                  className="cursor-pointer"
                >
                  {(page as number) + 1}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
        </PaginationContent>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <span className="sr-only">Go to next page</span>
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="hidden lg:inline-flex"
          >
            <span className="sr-only">Go to last page</span>
            Last
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </Pagination>

      {/* Page indicator */}
      <div className="text-center text-sm font-medium text-muted-foreground">
        Page {pageCount ? pageIndex + 1 : 0} of {pageCount}
      </div>
    </div>
  )
}
