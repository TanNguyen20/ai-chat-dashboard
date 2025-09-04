"use client"

import * as React from "react"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { MixerHorizontalIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

function getColumnLabel<TData>(table: Table<TData>, columnId: string) {
  const col = table.getColumn(columnId)
  const header = col?.columnDef?.header
  if (typeof header === "string") return header
  if (typeof col?.id === "string") return col.id
  return "Column"
}

export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const keyBase =
    typeof window !== "undefined"
      ? `${window.location.pathname}::columns:${table.getAllLeafColumns().map((c) => c.id).join(",")}`
      : "datatable::columns"
  const storageKey = `dt:visibility:${keyBase}`

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    try {
      const saved: Record<string, boolean> = JSON.parse(raw)
      for (const [id, visible] of Object.entries(saved)) {
        const col = table.getColumn(id)
        if (col && col.getCanHide()) col.toggleVisibility(!!visible)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const vis = table.getState().columnVisibility
    localStorage.setItem(storageKey, JSON.stringify(vis))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, JSON.stringify(table.getState().columnVisibility)])

  const allHidable = table.getAllLeafColumns().filter((c) => c.getCanHide())
  const hiddenCount = allHidable.filter((c) => !c.getIsVisible()).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 bg-transparent">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
          {hiddenCount > 0 && (
            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">{hiddenCount} hidden</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 pb-2 flex gap-2">
          <Button
            variant="outline"
            size="default"
            className="h-7"
            onClick={() => allHidable.forEach((c) => c.toggleVisibility(true))}
          >
            Show all
          </Button>
          <Button
            variant="outline"
            size="default"
            className="h-7"
            onClick={() => allHidable.forEach((c) => c.toggleVisibility(false))}
          >
            Hide all
          </Button>
          <Button
            variant="ghost"
            size="default"
            className="h-7"
            onClick={() => {
              table.resetColumnVisibility()
              if (typeof window !== "undefined") localStorage.removeItem(storageKey)
            }}
          >
            Reset
          </Button>
        </div>

        <DropdownMenuSeparator />

        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {getColumnLabel(table, column.id)}
            </DropdownMenuCheckboxItem>
          ))}

        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { /* add custom bulk action here if needed */ }}>
              Actions for selected rows…
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
