import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IDiskon,
    ICreateDiskon,
    IUpdateDiskon,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const DiskonService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<IDiskon>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.DISKON.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.DISKON.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IDiskon>>({
            url,
            method: 'GET',
        })
    },

    async getAktif(): Promise<ApiResponse<IDiskon[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDiskon[]>>({
            url: API_ENDPOINTS.KURSUS.DISKON.AKTIF,
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IDiskon>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDiskon>>({
            url: API_ENDPOINTS.KURSUS.DISKON.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateDiskon): Promise<ApiResponse<IDiskon>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDiskon>, ICreateDiskon>({
            url: API_ENDPOINTS.KURSUS.DISKON.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateDiskon): Promise<ApiResponse<IDiskon>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDiskon>, IUpdateDiskon>({
            url: API_ENDPOINTS.KURSUS.DISKON.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.DISKON.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default DiskonService
