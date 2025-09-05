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
import { GripVertical } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar, type FacetDef } from "./data-table-toolbar"
import type { Student } from "./columns"

export interface FacetOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  server?: boolean
  total?: number
  loading?: boolean
  onServerStateChange?: (state: {
    pagination: PaginationState
    sorting: SortingState
    globalFilter: string
    columnFilters: ColumnFiltersState
  }) => void
  facets?: FacetDef[]
}

function DraggableTableHeader({ header }: { header: any }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: header.column.id,
  })

  const baseStyle: React.CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Translate.toString(transform),
    transition,
    width: header.column.getSize(), // allow growth beyond this
    // removed maxWidth so the table can expand to fill available space
  }

  const isSelectColumn = header.column.id === "select"
  const isExpandColumn = header.column.id === "expand"

  if (isSelectColumn || isExpandColumn) {
    return (
      <TableHead key={header.id} style={baseStyle}>
        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
      </TableHead>
    )
  }

  return (
    <TableHead
      ref={setNodeRef}
      key={header.id}
      className="relative group px-2 py-3 sm:px-4 font-medium text-xs sm:text-sm"
      style={baseStyle}
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

function ExpandedRowContent({ row }: { row: Row<Student> }) {
  const student = row.original
  return (
    <div className="p-3 sm:p-4 bg-muted/30 border-t">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-sm font-medium">Thông Tin Liên Hệ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Điện thoại:</span>
              <p className="text-sm break-all">{student.dien_thoai || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Email DNC:</span>
              <p className="text-sm break-all">{student.email_dnc || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Địa chỉ liên hệ:</span>
              <p className="text-sm text-muted-foreground break-words">{student.dia_chi_lien_he || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-sm font-medium">Thông Tin Học Tập</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Cơ sở:</span>
              <p className="text-sm break-words">{student.co_so || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Loại hình đào tạo:</span>
              <p className="text-sm text-muted-foreground">{student.loai_hinh_dao_tao || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Chuyên ngành:</span>
              <p className="text-sm text-muted-foreground break-words">{student.chuyen_nganh || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-sm font-medium">Thông Tin Cá Nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Ngày sinh:</span>
              <p className="text-sm">{student.ngay_sinh || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Nơi sinh:</span>
              <p className="text-sm">{student.noi_sinh || "N/A"}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">CMND:</span>
              <p className="text-sm font-mono">{student.so_cmnd || "N/A"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Giới tính:</span>
              <Badge
                variant={student.gioi_tinh === "Nam" ? "default" : student.gioi_tinh === "Nữ" ? "secondary" : "outline"}
                className="text-xs"
              >
                {student.gioi_tinh || "N/A"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server, pagination.pageIndex, pagination.pageSize, sorting, globalFilter, columnFilters])

  const pageCount = React.useMemo(() => {
    if (!server || total == null) return undefined
    return Math.max(1, Math.ceil(total / pagination.pageSize))
  }, [server, total, pagination.pageSize])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: "includesString",
    onColumnOrderChange: setColumnOrder,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnOrder,
      pagination,
    },
    manualPagination: server,
    manualSorting: server,
    manualFiltering: server,
    pageCount,
    meta: { total },
    initialState: { pagination: { pageSize: 10, pageIndex: 0 } },

    // --- Option B: Column sizing defaults ---
    defaultColumn: { size: 180, minSize: 120 },
    columnResizeMode: "onChange",
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

  return (
    // ensure this container can shrink & fill next to a sidebar
    <div className="w-full min-w-0 space-y-4">
      <DataTableToolbar table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} facets={facets} />

      <div className="rounded-md border bg-background relative w-full">
        {loading && (
          <div className="absolute inset-0 z-20 bg-background/70 backdrop-blur-sm flex items-center justify-center text-sm text-muted-foreground">
            Đang tải dữ liệu…
          </div>
        )}

        {/* single horizontal scroll wrapper */}
        <div className="min-w-0 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/50 w-full">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {/* force table to span container */}
            <Table className="w-full">{/* removed table-fixed for flexible sizing */}
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="border-b">
                    <SortableContext
                      items={hg.headers
                        .filter((h) => h.column.id !== "select" && h.column.id !== "expand")
                        .map((h) => h.column.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {hg.headers.map((header) => (
                        <DraggableTableHeader key={header.id} header={header} />
                      ))}
                    </SortableContext>
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className={`hover:bg-muted/50 transition-colors ${row.getIsExpanded() ? "border-b-0" : ""}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            style={{ width: cell.column.getSize() }} // allow growth; no maxWidth
                            className="px-2 py-3 sm:px-4 text-sm"
                          >
                            <div className="truncate">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                          </TableCell>
                        ))}
                      </TableRow>

                      {row.getIsExpanded() && (
                        <TableRow>
                          {/* span exactly the number of visible columns */}
                          <TableCell colSpan={table.getVisibleLeafColumns().length} className="p-0">
                            <ExpandedRowContent row={row as Row<Student>} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center text-muted-foreground">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
