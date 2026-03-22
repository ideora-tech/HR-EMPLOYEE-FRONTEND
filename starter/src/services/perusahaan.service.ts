import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IPerusahaan,
    IPerusahaanOverview,
    IPerusahaanCreate,
    IPerusahaanUpdate,
    IPerusahaanQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/perusahaan.types'

const PerusahaanService = {
    async getAll(query?: IPerusahaanQuery): Promise<ApiPaginatedResponse<IPerusahaan>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const queryString = params.toString()
        const url = queryString
            ? `${API_ENDPOINTS.PERUSAHAAN.BASE}?${queryString}`
            : API_ENDPOINTS.PERUSAHAAN.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IPerusahaan>>({
            url,
            method: 'GET',
        })
    },

    async getOverview(id: string): Promise<ApiResponse<IPerusahaanOverview>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPerusahaanOverview>>({
            url: API_ENDPOINTS.PERUSAHAAN.OVERVIEW(id),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IPerusahaan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPerusahaan>>({
            url: API_ENDPOINTS.PERUSAHAAN.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: IPerusahaanCreate): Promise<ApiResponse<IPerusahaan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPerusahaan>, IPerusahaanCreate>({
            url: API_ENDPOINTS.PERUSAHAAN.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IPerusahaanUpdate): Promise<ApiResponse<IPerusahaan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPerusahaan>, IPerusahaanUpdate>({
            url: API_ENDPOINTS.PERUSAHAAN.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.PERUSAHAAN.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default PerusahaanService
