import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IPaket,
    ICreatePaket,
    IUpdatePaket,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const PaketService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<IPaket>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.PAKET.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.PAKET.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IPaket>>({
            url,
            method: 'GET',
        })
    },

    /** Dropdown: daftar paket dalam satu kelas (tanpa pagination) */
    async getByKelas(idKelas: string): Promise<ApiResponse<IPaket[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPaket[]>>({
            url: API_ENDPOINTS.KURSUS.PAKET.BY_KELAS(idKelas),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IPaket>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPaket>>({
            url: API_ENDPOINTS.KURSUS.PAKET.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreatePaket): Promise<ApiResponse<IPaket>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPaket>, ICreatePaket>({
            url: API_ENDPOINTS.KURSUS.PAKET.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdatePaket): Promise<ApiResponse<IPaket>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPaket>, IUpdatePaket>({
            url: API_ENDPOINTS.KURSUS.PAKET.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.PAKET.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default PaketService
