import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ITagihan,
    ICreateTagihan,
    IUpdateTagihan,
    ITagihanQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const TagihanService = {
    async getAll(query?: ITagihanQuery): Promise<ApiPaginatedResponse<ITagihan>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))
        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.TAGIHAN.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.TAGIHAN.BASE
        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<ITagihan>>({
            url,
            method: 'GET',
        })
    },

    async getBySiswa(idSiswa: string): Promise<ApiResponse<ITagihan[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITagihan[]>>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BY_SISWA(idSiswa),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<ITagihan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITagihan>>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateTagihan): Promise<ApiResponse<ITagihan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITagihan>, ICreateTagihan>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateTagihan): Promise<ApiResponse<ITagihan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITagihan>, IUpdateTagihan>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default TagihanService
