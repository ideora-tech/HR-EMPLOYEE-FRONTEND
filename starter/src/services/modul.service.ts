import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IModul,
    IModulCreate,
    IModulUpdate,
    IModulQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/modul.types'

const ModulService = {
    async getAll(query?: IModulQuery): Promise<ApiPaginatedResponse<IModul>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const queryString = params.toString()
        const url = queryString
            ? `${API_ENDPOINTS.MODUL.BASE}?${queryString}`
            : API_ENDPOINTS.MODUL.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IModul>>({
            url,
            method: 'GET',
        })
    },

    async getById(id_modul: string): Promise<ApiResponse<IModul>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IModul>>({
            url: API_ENDPOINTS.MODUL.BY_ID(id_modul),
            method: 'GET',
        })
    },

    async create(payload: IModulCreate): Promise<ApiResponse<IModul>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IModul>, IModulCreate>({
            url: API_ENDPOINTS.MODUL.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id_modul: string, payload: IModulUpdate): Promise<ApiResponse<IModul>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IModul>, IModulUpdate>({
            url: API_ENDPOINTS.MODUL.BY_ID(id_modul),
            method: 'PUT',
            data: payload,
        })
    },

    async remove(id_modul: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.MODUL.BY_ID(id_modul),
            method: 'DELETE',
        })
    },
}

export default ModulService
