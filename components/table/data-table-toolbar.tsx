"use client"

import * as React from "react"
import type { Table, Column } from "@tanstack/react-table"
import { Cross2Icon } from "@radix-ui/react-icons"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

// Reusable facet types so parent can pass them in
export type FacetOption = { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }
export type FacetDef = {
  /** UI column id (snake_case), e.g. "gioi_tinh" */
  id: string
  /** Button label, e.g. "Giới tính" */
  title: string
  /** Optional: pre-supplied options from parent; if omitted we'll try to derive from table */
  options?: FacetOption[]
  /** Optional: "single" or "multi" (default) */
  mode?: "single" | "multi"
  /** Optional: limit when auto-deriving from table */
  limit?: number
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  globalFilter: string
  setGlobalFilter: (value: string) => void

  /** NEW: optional parent-provided facets */
  facets?: FacetDef[]
}

export function DataTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  facets,
}: DataTableToolbarProps<TData>) {
  // Debounced global search
  const [input, setInput] = React.useState(globalFilter)
  React.useEffect(() => setInput(globalFilter), [globalFilter])
  React.useEffect(() => {
    const t = setTimeout(() => setGlobalFilter(input), 400)
    return () => clearTimeout(t)
  }, [input, setGlobalFilter])

  const isFiltered = table.getState().columnFilters.length > 0 || (globalFilter?.length ?? 0) > 0

  const col = (id: string) => table.getColumn(id) as Column<TData, unknown> | undefined
  const deriveOptions = (
    c?: Column<TData, unknown>,
    limit = 30,
    fallback?: FacetOption[],
  ): FacetOption[] => {
    if (!c) return fallback ?? []
    const facetsMap: Map<unknown, number> | undefined = (c as any).getFacetedUniqueValues?.()
    if (!facetsMap || facetsMap.size === 0) return fallback ?? []
    const arr = Array.from(facetsMap.entries())
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
      .slice(0, limit)
      .map(([value]) => ({ label: String(value), value: String(value) }))
    return arr.length ? arr : fallback ?? []
  }

  // If parent didn't pass facets, keep a sensible default set
  const defaultFacets: FacetDef[] = [
    {
      id: "gioi_tinh",
      title: "Giới tính",
      options: [
        { label: "Nam", value: "Nam" },
        { label: "Nữ", value: "Nữ" },
      ],
      mode: "multi",
      limit: 5,
    },
    { id: "co_so", title: "Cơ sở", mode: "multi", limit: 30 },
    {
      id: "bac_dao_tao",
      title: "Bậc đào tạo",
      options: [
        { label: "Đại học", value: "Đại học" },
        { label: "Thạc sĩ", value: "Thạc sĩ" },
        { label: "Tiến sĩ", value: "Tiến sĩ" },
      ],
      mode: "multi",
      limit: 10,
    },
    {
      id: "loai_hinh_dao_tao",
      title: "Loại hình đào tạo",
      options: [
        { label: "Chính quy", value: "Chính quy" },
        { label: "Liên thông", value: "Liên thông" },
        { label: "Từ xa", value: "Từ xa" },
      ],
      mode: "multi",
      limit: 10,
    },
    { id: "khoa", title: "Khoa", mode: "multi", limit: 30 },
    { id: "nganh", title: "Ngành", mode: "multi", limit: 30 },
  ]

  const activeFacets = facets && facets.length ? facets : defaultFacets

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          {/* Global search */}
          <div className="relative">
            <SearchIconDecoration />
            <Input
              placeholder="Tìm theo họ tên…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-8 max-w-sm"
            />
            {input && (
              <Button
                variant="ghost"
                onClick={() => setInput("")}
                className="absolute right-0 top-0 h-full px-3 py-0 hover:bg-transparent"
              >
                <XIcon />
              </Button>
            )}
          </div>

          {/* Facets (parent-provided or derived) */}
          {activeFacets.map((f) => {
            const column = col(f.id)
            const options = f.options?.length
              ? f.options
              : deriveOptions(column, f.limit ?? 30)
            if (!options.length) return null
            return (
              <DataTableFacetedFilter
                key={f.id}
                title={f.title}
                column={column}
                options={options}
                mode={f.mode ?? "multi"}
              />
            )
          })}

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => {
                table.resetColumnFilters()
                setInput("")
                setGlobalFilter("")
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <DataTableViewOptions table={table} />
      </div>

      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between rounded-md border p-4 bg-muted/50">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Export Selected
            </Button>
            <Button variant="outline" size="sm">
              Delete Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchIconDecoration() {
  return <svg className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none">
    <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}
function XIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}
