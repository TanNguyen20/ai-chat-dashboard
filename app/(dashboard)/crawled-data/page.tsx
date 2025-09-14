"use client"

import * as React from "react"
import type { ColumnFiltersState, SortingState, PaginationState } from "@tanstack/react-table"
import { DataTable } from "@/components/table/data-table"
import { columns, type Student as UiStudent } from "@/components/table/columns"
import { StudentService, type StudentDto, type PageRes } from "@/services/student"
import type { FacetDef } from "@/components/table/data-table-toolbar"

// Sorting -> Spring's "sort" param, column ids are already camelCase
function toSpringSort(sorting: SortingState): string[] {
  return sorting.map((s) => `${s.id},${s.desc ? "desc" : "asc"}`).filter(Boolean)
}

export default function StudentsPage() {
  const [rows, setRows] = React.useState<UiStudent[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [facets, setFacets] = React.useState<FacetDef[]>([
    { id: "gioiTinh", title: "Sex", options: [{ label: "Nam", value: "Nam" }, { label: "Nữ", value: "Nữ" }] },
    { id: "coSo", title: "Cơ sở" },
    { id: "bacDaoTao", title: "Education Level", options: [{ label: "Đại học", value: "Đại học" }, { label: "Thạc sĩ", value: "Thạc sĩ" }, { label: "Tiến sĩ", value: "Tiến sĩ" }] },
    { id: "loaiHinhDaoTao", title: "Loại hình đào tạo", options: [{ label: "Chính quy", value: "Chính quy" }, { label: "Liên thông", value: "Liên thông" }, { label: "Từ xa", value: "Từ xa" }] },
    { id: "khoa", title: "Faculty" },
    { id: "nganh", title: "Major" },
  ])

  // Optional: hydrate dynamic facet options from BE (camelCase keys)
  React.useEffect(() => {
    StudentService.getFacets()
      .then((f) => {
        setFacets((prev) =>
          prev.map((x) => {
            if (x.id === "coSo" && f.coSo?.length) return { ...x, options: f.coSo.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "khoa" && f.khoa?.length) return { ...x, options: f.khoa.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "nganh" && f.nganh?.length) return { ...x, options: f.nganh.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "gioiTinh" && f.gioiTinh?.length) return { ...x, options: f.gioiTinh.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "bacDaoTao" && f.bacDaoTao?.length) return { ...x, options: f.bacDaoTao.map((v: string) => ({ label: v, value: v })) }
            if (x.id === "loaiHinhDaoTao" && f.loaiHinhDaoTao?.length) return { ...x, options: f.loaiHinhDaoTao.map((v: string) => ({ label: v, value: v })) }
            return x
          }),
        )
      })
      .catch(() => {})
  }, [])

  const handleFetch = React.useCallback(async (args: {
    pagination: PaginationState
    sorting: SortingState
    globalFilter: string
    columnFilters: ColumnFiltersState
  }) => {
    const { pagination, sorting, globalFilter, columnFilters } = args
    const { pageIndex, pageSize } = pagination

    const params: any = { page: pageIndex, size: pageSize }
    const sorts = toSpringSort(sorting)
    if (sorts.length) params.sort = sorts

    // Facet filters: ids already match BE param names (camelCase)
    columnFilters.forEach((f) => {
      const id = f.id as string
      const vals = Array.isArray(f.value) ? (f.value as string[]) : []
      if (vals.length) params[id] = vals
    })

    setLoading(true)
    try {
      const pageRes: PageRes<StudentDto> = globalFilter?.trim()
        ? await StudentService.searchStudents(globalFilter.trim(), params)
        : await StudentService.getStudents(params)
      // BE DTO already matches UI type (camelCase)
      setRows(pageRes.content as UiStudent[])
      setTotal(pageRes.totalElements)
    } finally {
      setLoading(false)
    }
  }, [])

  // initial load
  React.useEffect(() => {
    handleFetch({ pagination: { pageIndex: 0, pageSize: 10 }, sorting: [], globalFilter: "", columnFilters: [] })
  }, [handleFetch])

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4">
      <h1 className="text-3xl font-bold">Crawled Data</h1>
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
