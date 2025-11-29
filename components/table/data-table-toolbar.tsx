"use client"

import type { Table, Column } from "@tanstack/react-table"
import { Cross2Icon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"
import { extractHeaderTitle } from "@/utils/commons"

// Reusable facet types so parent can pass them in
export type FacetOption = { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }
export type FacetDef = {
  id: string
  title: string
  options?: FacetOption[]
  mode?: "single" | "multi"
  limit?: number
}

interface DataTableToolbarProps<TData> {
  readonly table: Table<TData>
  readonly globalFilter: string
  readonly setGlobalFilter: (value: string) => void
  readonly facets?: FacetDef[]
}

export function DataTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  facets,
}: DataTableToolbarProps<TData>) {
  // Debounced global search
  const [input, setInput] = useState(globalFilter)
  const tableColumns = table.getAllLeafColumns().map(c => c.id)
  const activeFacets = (facets ?? []).filter(f => tableColumns.includes(f.id))

  useEffect(() => setInput(globalFilter), [globalFilter])

  useEffect(() => {
    const t = setTimeout(() => setGlobalFilter(input), 400)
    return () => clearTimeout(t)
  }, [input, setGlobalFilter])

  const isFiltered = table.getState().columnFilters.length > 0 || (globalFilter?.length ?? 0) > 0

  const col = (id: string) => table.getColumn(id)
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

  return (
    <div className="">
      <div className="flex items-center justify-between md:flex-row flex-col">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          {/* Global search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search data"
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
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {activeFacets.map((f) => {
            const column = col(f.id)
            const options = f.options?.length
              ? f.options
              : deriveOptions(column, f.limit ?? 30)

            if (!options.length) return null

            return (
              <DataTableFacetedFilter
                key={f.id}
                title={extractHeaderTitle(column)}
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
        <div className="flex items-center justify-between rounded-md border py-2 px-4 bg-muted/50 mt-2">
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