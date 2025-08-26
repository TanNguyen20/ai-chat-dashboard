"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
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
import { DataTableToolbar } from "./data-table-toolbar"
import type { Student } from "./columns"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

function DraggableTableHeader({ header, table }: { header: any; table: any }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: header.column.id,
  })

  const style = {
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const isSelectColumn = header.column.id === "select"
  const isExpandColumn = header.column.id === "expand"

  if (isSelectColumn || isExpandColumn) {
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

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((column) => (typeof column.id === "string" ? column.id : (column as any).accessorKey)),
  )

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onColumnOrderChange: setColumnOrder,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      columnOrder,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="w-full space-y-4">
      <DataTableToolbar table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />

      <div className="rounded-md border bg-background">
        <div className="relative overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/50">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Table className="relative">
                <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b">
                      <SortableContext
                        items={headerGroup.headers
                          .filter((header) => header.column.id !== "select" && header.column.id !== "expand")
                          .map((header) => header.column.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        {headerGroup.headers.map((header) => (
                          <DraggableTableHeader key={header.id} header={header} table={table} />
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
                            <TableCell key={cell.id} className="px-2 py-3 sm:px-4 whitespace-nowrap text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                        {row.getIsExpanded() && (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="p-0">
                              <ExpandedRowContent row={row as Row<Student>} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
