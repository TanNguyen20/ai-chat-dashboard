"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Maximize2, Minimize2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar, type FacetDef } from "./data-table-toolbar"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]

  // server mode
  server?: boolean
  total?: number
  loading?: boolean
  onServerStateChange?: (state: {
    pagination: PaginationState
    sorting: SortingState
    globalFilter: string
    columnFilters: ColumnFiltersState
  }) => void

  // facet definitions
  facets?: FacetDef[]

  // optional expanded row renderer
  renderRowExpansion?: (row: Row<TData>) => React.ReactNode
}

function DraggableTableHeader({ header }: { header: any }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: header.column.id,
  })

  const style = {
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const isSelectOrExpand = ["select", "expand"].includes(header.column.id)

  if (isSelectOrExpand) {
    return (
      <TableHead key={header.id} className="whitespace-nowrap">
        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
      </TableHead>
    )
  }

  return (
    <TableHead
      ref={setNodeRef}
      key={header.id}
      className="whitespace-nowrap relative group px-2 py-3 sm:px-4 font-medium text-xs sm:text-sm"
      style={style}
      {...attributes}
    >
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 truncate">
          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
        </div>
      </div>
    </TableHead>
  )
}

export function DataTable<TData, TValue>({
  columns,
  data,
  server = false,
  total,
  loading = false,
  onServerStateChange,
  facets,
  renderRowExpansion,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((column) => (typeof column.id === "string" ? column.id : (column as any).accessorKey)),
  )
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  React.useEffect(() => {
    if (!server) return
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [server, sorting, globalFilter, columnFilters])

  React.useEffect(() => {
    if (!server || !onServerStateChange) return
    onServerStateChange({ pagination, sorting, globalFilter, columnFilters })
  }, [server, pagination, sorting, globalFilter, columnFilters])

  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isFullscreen])

  const pageCount = React.useMemo(() => {
    if (!server || total == null) return undefined
    return Math.max(1, Math.ceil(total / pagination.pageSize))
  }, [server, total, pagination.pageSize])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnOrder,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: "includesString",
    manualPagination: server,
    manualSorting: server,
    manualFiltering: server,
    pageCount,
    meta: { total },
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder((order) => {
        const oldIndex = order.indexOf(active.id as string)
        const newIndex = order.indexOf(over.id as string)
        return arrayMove(order, oldIndex, newIndex)
      })
    }
  }

  const renderRows = (rows: Row<TData>[]) =>
    rows.map((row) => (
      <React.Fragment key={row.id}>
        <TableRow
          data-state={row.getIsSelected() && "selected"}
          className={`hover:bg-muted/50 transition-colors ${row.getIsExpanded() ? "border-b-0" : ""}`}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              className="px-2 py-3 sm:px-4 whitespace-nowrap text-sm overflow-hidden text-ellipsis"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>

        {row.getIsExpanded() && renderRowExpansion && (
          <TableRow>
            <TableCell colSpan={table.getVisibleLeafColumns().length} className="p-0">
              {renderRowExpansion(row)}
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    ))

  return (
    <div className="min-w-0 space-y-4 w-full relative">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <DataTableToolbar table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} facets={facets} />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(true)}
          className="gap-2"
          title="Enter fullscreen mode (ESC to exit)"
        >
          <Maximize2 className="h-4 w-4" />
          <span className="hidden sm:inline">Fullscreen</span>
        </Button>
      </div>

      <div className="rounded-md border bg-background w-full">
        {loading && (
          <div className="absolute inset-0 z-20 bg-background/70 backdrop-blur-sm flex items-center justify-center text-sm text-muted-foreground">
            Loading data…
          </div>
        )}
        <div className="overflow-auto relative max-h-[calc(100vh-20rem)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/50 w-full">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="border-b">
                    <SortableContext
                      items={hg.headers.filter((h) => !["select", "expand"].includes(h.column.id)).map((h) => h.column.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {hg.headers.map((header) => (
                        <DraggableTableHeader key={header.id} header={header} />
                      ))}
                    </SortableContext>
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>{renderRows(table.getRowModel().rows)}</TableBody>
            </Table>
          </DndContext>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
