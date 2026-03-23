import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IProgramPengajaran,
    ICreateProgramPengajaran,
    IUpdateProgramPengajaran,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const ProgramPengajaranService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<IProgramPengajaran>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.PROGRAM.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.PROGRAM.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IProgramPengajaran>>({
            url,
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IProgramPengajaran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IProgramPengajaran>>({
            url: API_ENDPOINTS.KURSUS.PROGRAM.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateProgramPengajaran): Promise<ApiResponse<IProgramPengajaran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IProgramPengajaran>, ICreateProgramPengajaran>({
            url: API_ENDPOINTS.KURSUS.PROGRAM.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateProgramPengajaran): Promise<ApiResponse<IProgramPengajaran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IProgramPengajaran>, IUpdateProgramPengajaran>({
            url: API_ENDPOINTS.KURSUS.PROGRAM.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.PROGRAM.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default ProgramPengajaranService
