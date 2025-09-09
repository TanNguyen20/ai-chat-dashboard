"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type Student = {
  mssv: string
  ho_ten: string | null
  gioi_tinh: string | null
  ngay_vao_truong: string | null
  lop_hoc: string | null
  co_so: string | null
  bac_dao_tao: string | null
  loai_hinh_dao_tao: string | null
  khoa: string | null
  nganh: string | null
  chuyen_nganh: string | null
  khoa_hoc: string | null
  noi_cap: string | null
  ngay_sinh: string | null
  so_cmnd: string | null
  doi_tuong: string | null
  ngay_vao_doan: string | null
  dien_thoai: string | null
  dia_chi_lien_he: string | null
  noi_sinh: string | null
  ho_khau_thuong_tru: string | null
  email_dnc: string | null
  mat_khau_email_dnc: string | null
  ma_ho_so: string | null
}

export const columns: ColumnDef<Student>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
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
  {
    accessorKey: "mssv",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("mssv")}</div>,
  },
  {
    accessorKey: "ho_ten",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Full name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("ho_ten") || "N/A"}</div>,
  },
  {
    accessorKey: "gioi_tinh",
    header: "Sex",
    cell: ({ row }) => {
      const gender = row.getValue("gioi_tinh") as string
      return (
        <Badge variant={gender === "Nam" ? "default" : gender === "Nữ" ? "secondary" : "outline"}>
          {gender || "N/A"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "lop_hoc",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Grade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono">{row.getValue("lop_hoc") || "N/A"}</div>,
  },
  {
    accessorKey: "khoa",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Khoa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("khoa") || "N/A"}</div>,
  },
  {
    accessorKey: "nganh",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Major
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("nganh") || "N/A"}</div>,
  },
  {
    accessorKey: "bac_dao_tao",
    header: "Bậc Đào Tạo",
    cell: ({ row }) => {
      const level = row.getValue("bac_dao_tao") as string
      return (
        <Badge variant={level === "Đại học" ? "default" : level === "Thạc sĩ" ? "secondary" : "outline"}>
          {level || "N/A"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "khoa_hoc",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Khóa Học
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono">{row.getValue("khoa_hoc") || "N/A"}</div>,
  },
  {
    accessorKey: "ngay_vao_truong",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Ngày Vào Trường
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("ngay_vao_truong") || "N/A"}</div>,
  },
  {
    accessorKey: "email_dnc",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase text-sm">{row.getValue("email_dnc") || "N/A"}</div>,
  },
  {
    accessorKey: "dien_thoai",
    header: "Phone number",
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("dien_thoai") || "N/A"}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const student = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.mssv)}>Copy MSSV</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View detail
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
