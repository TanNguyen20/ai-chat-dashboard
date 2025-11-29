"use client"

import { DataTable } from "@/components/table/data-table"
import { buildDynamicColumns } from "@/components/table/columns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentService, type StudentColumnDTO, StudentResponseDTO } from "@/services/student"
import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table"

import type { FacetDef } from "@/components/table/data-table-toolbar"
import { FPT_TYPE_LIST, STUDENT_TYPE_LIST, type CrawledDataType } from "@/const/common"
import { FPTColumnDTO, FPTDto, FPTResponseDTO, FPTService } from "@/services/fpt"
import { isFPTType } from "@/utils/commons"
import { ExpandedFPTRow } from "./ExpandedFPTRow"
import { ExpandedStudentRow } from "./ExpandedStudentRow"
import { useCallback, useEffect, useState } from "react"

function toSpringSort(sorting: SortingState): string[] {
  return sorting.map((s) => `${s.id},${s.desc ? "desc" : "asc"}`)
}

const handleSearch= (globalFilter: string, params: any, crawledDataType: CrawledDataType) => {
  if (isFPTType(crawledDataType)) {
    return FPTService.searchEmployees(globalFilter, params)
  }
  return StudentService.searchStudents(globalFilter, params)
}

const handleGet = (params: any, crawledDataType: CrawledDataType) => {
  if (isFPTType(crawledDataType)) {
    return FPTService.getEmployees(params)
  }
  return StudentService.getStudents(params)
}

export default function StudentsPage() {
  const [crawledDataType, setCrawledDataType] = useState<CrawledDataType>("DNC")
  const [columns, setColumns] = useState<any[]>([])
  const [rows, setRows] = useState<Array<FPTDto | StudentResponseDTO>>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [facets, setFacets] = useState<FacetDef[]>([])

  useEffect(() => {
    ; (async () => {
      if (isFPTType(crawledDataType)) {
        const schema: FPTColumnDTO[] = await FPTService.getColumns(crawledDataType)
        setColumns(buildDynamicColumns<FPTResponseDTO>(schema, "id"))

        const f = await FPTService.getFacets(crawledDataType)
        setFacets(
          (Object.keys(f) as (keyof typeof f)[]).map((key) => ({
            id: key,
            title: key,
            options: f[key]?.map((v: string) => ({ label: v, value: v })) || [],
          }))
        )
      }
      else {
        const schema: StudentColumnDTO[] = await StudentService.getColumns(crawledDataType)
        setColumns(buildDynamicColumns<StudentResponseDTO>(schema, "mssv"))

        const f = await StudentService.getFacets(crawledDataType)
        setFacets(
          (Object.keys(f) as (keyof typeof f)[]).map((key) => ({
            id: key,
            title: key,
            options: f[key]?.map((v: string) => ({ label: v, value: v })) || [],
          }))
        )
      }
    })()
  }, [crawledDataType])

  // 2) Fetch table data
  const handleFetch = useCallback(async (args: {
    pagination: PaginationState
    sorting: SortingState
    globalFilter: string
    columnFilters: ColumnFiltersState
  }) => {
    const { pagination, sorting, globalFilter, columnFilters } = args
    const params: any =  { page: pagination.pageIndex, size: pagination.pageSize }

    if (isFPTType(crawledDataType)) {
      params.fptType = crawledDataType
    }
    else {
      params.studentType = crawledDataType
    }

    const sorts = toSpringSort(sorting)
    if (sorts.length) params.sort = sorts

    columnFilters.forEach((f) => {
      if (Array.isArray(f.value) && f.value.length) params[f.id] = f.value
    })

    setLoading(true)
    try {
      const pageRes = globalFilter
        ? await handleSearch(globalFilter, params, crawledDataType)
        : await handleGet(params, crawledDataType)

      setRows(pageRes.content)
      setTotal(pageRes.totalElements)
    } finally {
      setLoading(false)
    }
  }, [crawledDataType])

  useEffect(() => {
    handleFetch({ pagination: { pageIndex: 0, pageSize: 10 }, sorting: [], globalFilter: "", columnFilters: [] })
  }, [columns])

  return (
    <div className="absolute right-4 left-4 top-20 bottom-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Crawled Data</h1> 

        <div className="flex items-center gap-2 text-sm">
          <span>Table name</span>
          <Select value={crawledDataType} onValueChange={(v: CrawledDataType) => setCrawledDataType(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select table" />
            </SelectTrigger>
            <SelectContent>
              {[...FPT_TYPE_LIST, ...STUDENT_TYPE_LIST].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
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
        renderRowExpansion={(row) => {
          if (isFPTType(crawledDataType)) {
            return <ExpandedFPTRow user={row.original as FPTResponseDTO} />
          }
          else {
            return <ExpandedStudentRow student={row.original as StudentResponseDTO} />
          }
        }}
      />
    </div>
  )
}
