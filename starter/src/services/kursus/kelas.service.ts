import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IKelas,
    ICreateKelas,
    IUpdateKelas,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const KelasService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<IKelas>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.KELAS.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.KELAS.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IKelas>>({
            url,
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IKelas>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKelas>>({
            url: API_ENDPOINTS.KURSUS.KELAS.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateKelas): Promise<ApiResponse<IKelas>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKelas>, ICreateKelas>({
            url: API_ENDPOINTS.KURSUS.KELAS.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateKelas): Promise<ApiResponse<IKelas>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKelas>, IUpdateKelas>({
            url: API_ENDPOINTS.KURSUS.KELAS.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.KELAS.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default KelasService
