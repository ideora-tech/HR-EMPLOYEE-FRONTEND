import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IPeran,
    IPeranCreate,
    IPeranUpdate,
    IPeranQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/peran.types'

const PeranService = {
    async getAll(query?: IPeranQuery): Promise<ApiPaginatedResponse<IPeran>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const queryString = params.toString()
        const url = queryString
            ? `${API_ENDPOINTS.PERAN.BASE}?${queryString}`
            : API_ENDPOINTS.PERAN.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IPeran>>({
            url,
            method: 'GET',
        })
    },

    async getById(id_peran: string): Promise<ApiResponse<IPeran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPeran>>({
            url: API_ENDPOINTS.PERAN.BY_ID(id_peran),
            method: 'GET',
        })
    },

    async create(payload: IPeranCreate): Promise<ApiResponse<IPeran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPeran>, IPeranCreate>({
            url: API_ENDPOINTS.PERAN.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id_peran: string, payload: IPeranUpdate): Promise<ApiResponse<IPeran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPeran>, IPeranUpdate>({
            url: API_ENDPOINTS.PERAN.BY_ID(id_peran),
            method: 'PUT',
            data: payload,
        })
    },

    async remove(id_peran: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.PERAN.BY_ID(id_peran),
            method: 'DELETE',
        })
    },
}

export default PeranService
