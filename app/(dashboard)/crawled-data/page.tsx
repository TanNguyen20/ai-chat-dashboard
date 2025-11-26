"use client"

import { columns, type Student as UiStudent } from "@/components/table/columns"
import { DataTable } from "@/components/table/data-table"
import type { FacetDef } from "@/components/table/data-table-toolbar"
import { StudentService, type PageRes, type StudentDto } from "@/services/student"
import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table"
import * as React from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FPT_TYPE_LIST, STUDENT_TYPE_LIST, StudentType } from "@/const/common"

function toSpringSort(sorting: SortingState): string[] {
  return sorting.map((s) => `${s.id},${s.desc ? "desc" : "asc"}`).filter(Boolean)
}

export default function StudentsPage() {
  const [studentType, setStudentType] = React.useState<StudentType>("DNC")
  const [rows, setRows] = React.useState<UiStudent[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [facets, setFacets] = React.useState<FacetDef[]>([
    { id: "gioiTinh", title: "Sex", options: [{ label: "Nam", value: "Nam" }, { label: "Nữ", value: "Nữ" }] },
    { id: "coSo", title: "Campus" },
    { id: "bacDaoTao", title: "Education Level", options: [{ label: "Đại học", value: "Đại học" }, { label: "Thạc sĩ", value: "Thạc sĩ" }, { label: "Tiến sĩ", value: "Tiến sĩ" }] },
    { id: "loaiHinhDaoTao", title: "Type of education", options: [{ label: "Chính quy", value: "Chính quy" }, { label: "Liên thông", value: "Liên thông" }, { label: "Từ xa", value: "Từ xa" }] },
    { id: "khoa", title: "Faculty" },
    { id: "nganh", title: "Major" },
  ])

  React.useEffect(() => {
    ; (async () => {
      try {
        const f = await StudentService.getFacets(studentType)
        setFacets((prev) =>
          prev.map((x) => {
            if (x.id === "coSo" && f.coSo?.length) return { ...x, options: f.coSo.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "khoa" && f.khoa?.length) return { ...x, options: f.khoa.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "nganh" && f.nganh?.length) return { ...x, options: f.nganh.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "gioiTinh" && f.gioiTinh?.length) return { ...x, options: f.gioiTinh.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "bacDaoTao" && f.bacDaoTao?.length) return { ...x, options: f.bacDaoTao.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "loaiHinhDaoTao" && f.loaiHinhDaoTao?.length) return { ...x, options: f.loaiHinhDaoTao.map((v: string) => ({ label: v, value: v })) }
            return x
          })
        )
      } catch { }
    })()
  }, [studentType])

  const handleFetch = React.useCallback(async (args: {
    pagination: PaginationState
    sorting: SortingState
    globalFilter: string
    columnFilters: ColumnFiltersState
  }) => {
    const { pagination, sorting, globalFilter, columnFilters } = args
    const { pageIndex, pageSize } = pagination

    const params: any = { studentType, page: pageIndex, size: pageSize }
    const sorts = toSpringSort(sorting)
    if (sorts.length) params.sort = sorts

    columnFilters.forEach((f) => {
      const id = f.id
      const vals = Array.isArray(f.value) ? (f.value as string[]) : []
      if (vals.length) params[id] = vals
    })

    setLoading(true)
    try {
      const pageRes: PageRes<StudentDto> = globalFilter?.trim()
        ? await StudentService.searchStudents(globalFilter.trim(), params)
        : await StudentService.getStudents(params)
      setRows(pageRes.content as UiStudent[])
      setTotal(pageRes.totalElements)
    } finally {
      setLoading(false)
    }
  }, [studentType])

  React.useEffect(() => {
    handleFetch({ pagination: { pageIndex: 0, pageSize: 10 }, sorting: [], globalFilter: "", columnFilters: [] })
  }, [handleFetch])

  return (
    <div className="absolute right-4 left-4 top-20 bottom-4" style={{ width: "-webkit-fill-available" }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">Crawled Data</h1>
        <div className="flex items-center gap-2 text-sm my-2">
          <span className="font-medium">Table name</span>
          <Select
            value={studentType.toString()}
            onValueChange={(v: StudentType) => setStudentType(v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              {[...FPT_TYPE_LIST, ...STUDENT_TYPE_LIST].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        server
        columns={columns}
        data={rows}
        total={total}
        loading={loading}
        onServerStateChange={handleFetch}
        facets={facets}
      />
    </div>
  )
}
