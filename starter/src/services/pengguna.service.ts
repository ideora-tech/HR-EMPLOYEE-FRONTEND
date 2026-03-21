import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IPengguna,
    IPenggunaCreate,
    IPenggunaUpdate,
    IPenggunaQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/pengguna.types'

const PenggunaService = {
    async getAll(query?: IPenggunaQuery): Promise<ApiPaginatedResponse<IPengguna>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const queryString = params.toString()
        const url = queryString
            ? `${API_ENDPOINTS.PENGGUNA.BASE}?${queryString}`
            : API_ENDPOINTS.PENGGUNA.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IPengguna>>({
            url,
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IPengguna>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPengguna>>({
            url: API_ENDPOINTS.PENGGUNA.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: IPenggunaCreate): Promise<ApiResponse<IPengguna>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPengguna>, IPenggunaCreate>({
            url: API_ENDPOINTS.PENGGUNA.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IPenggunaUpdate): Promise<ApiResponse<IPengguna>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPengguna>, IPenggunaUpdate>({
            url: API_ENDPOINTS.PENGGUNA.BY_ID(id),
            method: 'PUT',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.PENGGUNA.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default PenggunaService
