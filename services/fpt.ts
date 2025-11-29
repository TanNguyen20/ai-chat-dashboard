import { BASE_URL } from "@/const/api"
import AxiosClient from "./apiConfig"
import { FPTType } from "@/const/common"

export type FPTDto = {
    id: string,
    odataType: string,
    displayName: string,
    givenName: string,
    surname: string,
    jobTitle: string,
    mail: string,
    mobilePhone: string,
    userPrincipalName: string,
    officeLocation: string,
    preferredLanguage: string,
    businessPhones: Array<string>
}

export type FPTRequest = Omit<FPTDto, "name"> & { name: string }

export type PageRes<T> = {
    content: T[]
    number: number
    size: number
    totalElements: number
    totalPages: number
}

export type FPTFacetsRes = {
    odataType?: string[]
    jobTitle?: string[]
    officeLocation?: string[]
    preferredLanguage?: string[]
}

interface PagedQuery extends FPTFacetsRes{
    page?: number
    size?: number
    sort?: string[]
}

export type FPTColumnDTO = {
  id: string
  label: string
  type: "text" | "enum" | "date" | "array" | "email" | "phone"
  sortable: boolean
}

export interface FPTResponseDTO {
  id: string;
  odataType: string;
  displayName: string;
  givenName: string | null;
  surname: string | null;
  jobTitle: string | null;
  mail: string | null;
  mobilePhone: string | null;
  userPrincipalName: string | null;
  officeLocation: string | null;
  preferredLanguage: string | null;
  businessPhones: string[];
}

const api = AxiosClient.getInstance(`${BASE_URL.CRAWLED_DATA_SERVICE}/fpt`)

export class FPTService {
    static async getEmployees(params: PagedQuery): Promise<PageRes<FPTDto>> {
        // AxiosClient should serialize arrays as repeat (?sort=a&sort=b). If not, add qs in AxiosClient.
        const res = await api.get<PageRes<FPTDto>>("", { params })
        return res
    }

    static async searchEmployees(name: string, params: PagedQuery): Promise<PageRes<FPTDto>> {
        const res = await api.get<PageRes<FPTDto>>("/search", { params: { name, ...params } })
        return res
    }

    static async getEmployee(id: string): Promise<FPTDto> {
        const res = await api.get<FPTDto>(`/${id}`)
        return res
    }

    static async createEmployee(body: FPTRequest): Promise<void> {
        await api.post<void>("", body)
    }

    static async updateEmployee(id: string, body: Partial<FPTRequest>): Promise<void> {
        await api.put<void>(`/${id}`, body)
    }

    static async deleteEmployee(id: string): Promise<void> {
        await api.delete<void>(`/${id}`)
    }

    static async getFacets(fptType: FPTType): Promise<FPTFacetsRes> {
        const res = await api.get<FPTFacetsRes>("/facets", { params: { fptType } })
        return res
    }

    static async getColumns(fptType: FPTType = "FPT"): Promise<FPTColumnDTO[]> {
        const res = await api.get<FPTColumnDTO[]>("/columns", {params: { fptType }})
        return res
    }
}
