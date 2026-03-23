import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ITingkatProgram,
    ICreateTingkatProgram,
    IUpdateTingkatProgram,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const TingkatProgramService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<ITingkatProgram>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.TINGKAT.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.TINGKAT.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<ITingkatProgram>>({
            url,
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<ITingkatProgram>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITingkatProgram>>({
            url: API_ENDPOINTS.KURSUS.TINGKAT.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateTingkatProgram): Promise<ApiResponse<ITingkatProgram>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITingkatProgram>, ICreateTingkatProgram>({
            url: API_ENDPOINTS.KURSUS.TINGKAT.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateTingkatProgram): Promise<ApiResponse<ITingkatProgram>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITingkatProgram>, IUpdateTingkatProgram>({
            url: API_ENDPOINTS.KURSUS.TINGKAT.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.TINGKAT.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default TingkatProgramService
