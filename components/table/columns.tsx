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
  hoTen: string | null
  gioiTinh: string | null
  ngayVaoTruong: string | null
  lopHoc: string | null
  coSo: string | null
  bacDaoTao: string | null
  loaiHinhDaoTao: string | null
  khoa: string | null
  nganh: string | null
  chuyenNganh: string | null
  khoaHoc: string | null
  noiCap: string | null
  ngaySinh: string | null
  soCmnd: string | null
  doiTuong: string | null
  ngayVaoDoan: string | null
  dienThoai: string | null
  diaChiLienHe: string | null
  noiSinh: string | null
  hoKhauThuongTru: string | null
  emailDnc: string | null
  matKhauEmailDnc: string | null
  maHoSo: string | null
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
    accessorKey: "hoTen",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Full name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{(row.getValue("hoTen") as string) || "N/A"}</div>,
  },
  {
    accessorKey: "gioiTinh",
    header: "Sex",
    cell: ({ row }) => {
      const gender = row.getValue("gioiTinh") as string
      return (
        <Badge variant={gender === "Nam" ? "default" : gender === "Nữ" ? "secondary" : "outline"}>
          {gender || "N/A"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "lopHoc",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Grade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono">{(row.getValue("lopHoc") as string) || "N/A"}</div>,
  },
  {
    accessorKey: "khoa",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Faculty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{(row.getValue("khoa") as string) || "N/A"}</div>,
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
    cell: ({ row }) => <div className="max-w-[200px] truncate">{(row.getValue("nganh") as string) || "N/A"}</div>,
  },
  {
    accessorKey: "coSo",
    header: "Cơ sở",
    enableSorting: false,
    cell: ({ row }) => <div>{(row.getValue("coSo") as string) || "N/A"}</div>,
  },
  {
    accessorKey: "loaiHinhDaoTao",
    header: "Loại hình đào tạo",
    enableSorting: false,
    cell: ({ row }) => <div>{(row.getValue("loaiHinhDaoTao") as string) || "N/A"}</div>,
  },
  {
    accessorKey: "bacDaoTao",
    header: "Education Level",
    cell: ({ row }) => {
      const level = row.getValue("bacDaoTao") as string
      return (
        <Badge variant={level === "Đại học" ? "default" : level === "Thạc sĩ" ? "secondary" : "outline"}>
          {level || "N/A"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "khoaHoc",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Academic Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono">{(row.getValue("khoaHoc") as string) || "N/A"}</div>,
  },
  {
    accessorKey: "ngayVaoTruong",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Ngày Vào Trường
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-mono text-sm">{(row.getValue("ngayVaoTruong") as string) || "N/A"}</div>,
  },
  {
    accessorKey: "emailDnc",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="lowercase text-sm">{(row.getValue("emailDnc") as string) || "N/A"}</div>,
  },
  {
    accessorKey: "dienThoai",
    header: "Phone number",
    cell: ({ row }) => <div className="font-mono text-sm">{(row.getValue("dienThoai") as string) || "N/A"}</div>,
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
