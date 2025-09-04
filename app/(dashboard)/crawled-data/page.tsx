"use client"

import * as React from "react"
import type { ColumnFiltersState, SortingState, PaginationState } from "@tanstack/react-table"
import { DataTable } from "@/components/table/data-table"
import { columns, type Student as UiStudent } from "@/components/table/columns"
import { StudentService, type StudentDto, type PageRes } from "@/services/student"
import type { FacetDef } from "@/components/table/data-table-toolbar"

// map camelCase DTO -> snake_case UI type
function dtoToUi(s: StudentDto): UiStudent {
  return {
    mssv: s.mssv,
    ho_ten: s.hoTen ?? "",
    gioi_tinh: s.gioiTinh ?? "",
    ngay_vao_truong: s.ngayVaoTruong ?? "",
    lop_hoc: s.lopHoc ?? "",
    co_so: s.coSo ?? "",
    bac_dao_tao: s.bacDaoTao ?? "",
    loai_hinh_dao_tao: s.loaiHinhDaoTao ?? "",
    khoa: s.khoa ?? "",
    nganh: s.nganh ?? "",
    chuyen_nganh: s.chuyenNganh ?? null,
    khoa_hoc: s.khoaHoc ?? "",
    noi_cap: s.noiCap ?? "",
    ngay_sinh: s.ngaySinh ?? "",
    so_cmnd: s.soCmnd ?? "",
    doi_tuong: s.doiTuong ?? "",
    ngay_vao_doan: s.ngayVaoDoan ?? null,
    dien_thoai: s.dienThoai ?? "",
    dia_chi_lien_he: s.diaChiLienHe ?? "",
    noi_sinh: s.noiSinh ?? "",
    ho_khau_thuong_tru: s.hoKhauThuongTru ?? "",
    email_dnc: s.emailDnc ?? "",
    mat_khau_email_dnc: s.matKhauEmailDnc ?? null,
    ma_ho_so: s.maHoSo ?? "",
  }
}

const SORT_MAP: Record<string, string> = {
  mssv: "mssv",
  ho_ten: "hoTen",
  gioi_tinh: "gioiTinh",
  ngay_vao_truong: "ngayVaoTruong",
  lop_hoc: "lopHoc",
  co_so: "coSo",
  bac_dao_tao: "bacDaoTao",
  loai_hinh_dao_tao: "loaiHinhDaoTao",
  khoa: "khoa",
  nganh: "nganh",
  chuyen_nganh: "chuyenNganh",
  khoa_hoc: "khoaHoc",
  noi_cap: "noiCap",
  ngay_sinh: "ngaySinh",
  so_cmnd: "soCmnd",
  doi_tuong: "doiTuong",
  ngay_vao_doan: "ngayVaoDoan",
  dien_thoai: "dienThoai",
  dia_chi_lien_he: "diaChiLienHe",
  noi_sinh: "noiSinh",
  ho_khau_thuong_tru: "hoKhauThuongTru",
  email_dnc: "emailDnc",
  mat_khau_email_dnc: "matKhauEmailDnc",
  ma_ho_so: "maHoSo",
}
function toSpringSort(sorting: SortingState): string[] {
  return sorting.map((s) => `${SORT_MAP[s.id] || s.id},${s.desc ? "desc" : "asc"}`).filter(Boolean)
}

export default function StudentsPage() {
  const [rows, setRows] = React.useState<UiStudent[]>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [facets, setFacets] = React.useState<FacetDef[]>([
    { id: "gioi_tinh", title: "Giới tính", options: [{ label: "Nam", value: "Nam" }, { label: "Nữ", value: "Nữ" }] },
    { id: "co_so", title: "Cơ sở" },
    { id: "bac_dao_tao", title: "Bậc đào tạo", options: [{ label: "Đại học", value: "Đại học" }, { label: "Thạc sĩ", value: "Thạc sĩ" }, { label: "Tiến sĩ", value: "Tiến sĩ" }] },
    { id: "loai_hinh_dao_tao", title: "Loại hình đào tạo", options: [{ label: "Chính quy", value: "Chính quy" }, { label: "Liên thông", value: "Liên thông" }, { label: "Từ xa", value: "Từ xa" }] },
    { id: "khoa", title: "Khoa" },
    { id: "nganh", title: "Ngành" },
  ])

  // Optional: hydrate dynamic facet options from BE
  React.useEffect(() => {
    StudentService.getFacets()
      .then((f) => {
        setFacets((prev) =>
          prev.map((x) => {
            if (x.id === "co_so" && f.coSo?.length) return { ...x, options: f.coSo.map((v) => ({ label: v, value: v })) }
            if (x.id === "khoa" && f.khoa?.length) return { ...x, options: f.khoa.map((v) => ({ label: v, value: v })) }
            if (x.id === "nganh" && f.nganh?.length) return { ...x, options: f.nganh.map((v) => ({ label: v, value: v })) }
            if (x.id === "gioi_tinh" && f.gioiTinh?.length) return { ...x, options: f.gioiTinh.map((v) => ({ label: v, value: v })) }
            if (x.id === "bac_dao_tao" && f.bacDaoTao?.length) return { ...x, options: f.bacDaoTao.map((v) => ({ label: v, value: v })) }
            if (x.id === "loai_hinh_dao_tao" && f.loaiHinhDaoTao?.length) return { ...x, options: f.loaiHinhDaoTao.map((v) => ({ label: v, value: v })) }
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

    // Map UI facet ids -> BE param names (camelCase)
    const map: Record<string, string> = {
      gioi_tinh: "gioiTinh",
      co_so: "coSo",
      bac_dao_tao: "bacDaoTao",
      loai_hinh_dao_tao: "loaiHinhDaoTao",
      khoa: "khoa",
      nganh: "nganh",
    }
    columnFilters.forEach((f) => {
      const k = map[f.id as string]
      if (!k) return
      const vals = Array.isArray(f.value) ? (f.value as string[]) : []
      if (vals.length) params[k] = vals
    })

    setLoading(true)
    try {
      const pageRes: PageRes<StudentDto> = globalFilter?.trim()
        ? await StudentService.searchStudents(globalFilter.trim(), params)
        : await StudentService.getStudents(params)
      setRows(pageRes.content.map(dtoToUi))
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
