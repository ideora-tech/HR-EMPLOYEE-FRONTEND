import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IPaket,
    IPaketCreate,
    IPaketUpdate,
    IPaketQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/paket.types'

const PaketService = {
    async getAll(query?: IPaketQuery): Promise<ApiPaginatedResponse<IPaket>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.kode_paket) params.append('kode_paket', query.kode_paket)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const queryString = params.toString()
        const url = queryString
            ? `${API_ENDPOINTS.PAKET.BASE}?${queryString}`
            : API_ENDPOINTS.PAKET.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IPaket>>({
            url,
            method: 'GET',
        })
    },

    async getById(id_paket: string): Promise<ApiResponse<IPaket>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPaket>>({
            url: API_ENDPOINTS.PAKET.BY_ID(id_paket),
            method: 'GET',
        })
    },

    async create(payload: IPaketCreate): Promise<ApiResponse<IPaket>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPaket>, IPaketCreate>({
            url: API_ENDPOINTS.PAKET.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id_paket: string, payload: IPaketUpdate): Promise<ApiResponse<IPaket>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPaket>, IPaketUpdate>({
            url: API_ENDPOINTS.PAKET.BY_ID(id_paket),
            method: 'PUT',
            data: payload,
        })
    },

    async remove(id_paket: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.PAKET.BY_ID(id_paket),
            method: 'DELETE',
        })
    },
}

export default PaketService
