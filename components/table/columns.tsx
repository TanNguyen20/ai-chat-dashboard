"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { StudentColumnDTO } from "@/services/student"
import { FPTColumnDTO } from "@/services/fpt"

export type AnyColumnDTO = StudentColumnDTO | FPTColumnDTO;

// Map column types to cell UI
function renderCell(type: string, value: any) {
  if (!value) return "N/A"

  switch (type) {
    case "enum":
      return (
        <Badge variant="secondary">{value}</Badge>
      )
    case "date":
      return <span className="font-mono text-sm">{value}</span>
    case "id":
      return <span className="font-mono font-medium">{value}</span>
    case "phone":
      return <a href={`tel:${value}`}>{value}</a>
    case "email":
      return <a href={`mailto:${value}`}>{value}</a>
    case "array":
      return (value as string[]).join(", ")
    default:
      return <span>{value}</span>
  }
}

export function buildDynamicColumns<T extends Record<string, any>>(
  schema: AnyColumnDTO[],
  columnCopy: keyof T
): ColumnDef<T>[] {
  const dynamicCols: ColumnDef<T>[] = schema.map((col) => ({
    accessorKey: col.id,
    enableSorting: col.sortable,
    header: ({ column }) =>
      col.sortable ? (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {col.label}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        col.label
      ),
    cell: ({ row }) => renderCell(col.type, row.getValue(col.id)),
  }));

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      id: "expand",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => row.toggleExpanded()} className="p-0 w-8 h-8">
          {row.getIsExpanded() ? "−" : "+"}
        </Button>
      ),
      enableSorting: false,
      enableHiding: false,
    },

    ...dynamicCols,

    {
      id: "actions",
      cell: ({ row }) => {
        const line = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Action</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(line[columnCopy]))}>
                <Copy className="mr-2 h-4 w-4" /> Copy ID
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View detail</DropdownMenuItem>
              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>

              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableHiding: false,
    },
  ];
}
