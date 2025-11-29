import { BASE_URL } from "@/const/api"
import { StudentType } from "@/const/common"
import AxiosClient from "./apiConfig"

// ----- DTOs matching Spring JSON (camelCase) -----
export type StudentResponseDTO = {
  mssv: string
  hoTen?: string
  gioiTinh?: string
  ngayVaoTruong?: string
  lopHoc?: string
  coSo?: string
  bacDaoTao?: string
  loaiHinhDaoTao?: string
  khoa?: string
  nganh?: string
  chuyenNganh?: string | null
  khoaHoc?: string
  noiCap?: string
  ngaySinh?: string
  soCmnd?: string
  doiTuong?: string
  ngayVaoDoan?: string | null
  dienThoai?: string
  diaChiLienHe?: string
  noiSinh?: string
  hoKhauThuongTru?: string
  emailDnc?: string
  matKhauEmailDnc?: string | null
  maHoSo?: string
}

export type StudentRequest = Omit<StudentResponseDTO, "mssv"> & { mssv: string }

// Page<T> from Spring Data
export type PageRes<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export type FacetsRes = {
  coSo?: string[]
  khoa?: string[]
  nganh?: string[]
  gioiTinh?: string[]
  bacDaoTao?: string[]
  loaiHinhDaoTao?: string[]
}

type PagedQuery = {
  page?: number
  size?: number
  sort?: string[]
  gioiTinh?: string[]
  coSo?: string[]
  bacDaoTao?: string[]
  loaiHinhDaoTao?: string[]
  khoa?: string[]
  nganh?: string[]
}

export type StudentColumnDTO = {
  id: string
  label: string
  type: "text" | "enum" | "date"
  sortable: boolean
}

const api = AxiosClient.getInstance(`${BASE_URL.CRAWLED_DATA_SERVICE}/students`)

export class StudentService {
  static async getStudents(params: PagedQuery): Promise<PageRes<StudentResponseDTO>> {
    // AxiosClient should serialize arrays as repeat (?sort=a&sort=b). If not, add qs in AxiosClient.
    const res = await api.get<PageRes<StudentResponseDTO>>("", { params })
    return res
  }

  static async searchStudents(name: string, params: PagedQuery): Promise<PageRes<StudentResponseDTO>> {
    const res = await api.get<PageRes<StudentResponseDTO>>("/search", { params: { name, ...params } })
    return res
  }

  static async getStudent(mssv: string): Promise<StudentResponseDTO> {
    const res = await api.get<StudentResponseDTO>(`/${mssv}`)
    return res
  }

  static async createStudent(body: StudentRequest): Promise<void> {
    await api.post<void>("", body)
  }

  static async updateStudent(mssv: string, body: Partial<StudentRequest>): Promise<void> {
    await api.put<void>(`/${mssv}`, body)
  }

  static async deleteStudent(mssv: string): Promise<void> {
    await api.delete<void>(`/${mssv}`)
  }

  static async getFacets(studentType: StudentType): Promise<FacetsRes> {
    const res = await api.get<FacetsRes>("/facets", { params: { studentType } })
    return res
  }

  static async getColumns(studentType: StudentType): Promise<StudentColumnDTO[]> {
  const res = await api.get<StudentColumnDTO[]>("/columns", {
    params: { studentType },
  })
  return res
}
}
