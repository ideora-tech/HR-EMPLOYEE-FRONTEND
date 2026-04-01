import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IBiaya,
    ICreateBiaya,
    IUpdateBiaya,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const BiayaService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<IBiaya>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.BIAYA.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.BIAYA.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IBiaya>>({
            url,
            method: 'GET',
        })
    },

    async getByKelas(idKelas: string): Promise<ApiResponse<IBiaya[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IBiaya[]>>({
            url: API_ENDPOINTS.KURSUS.BIAYA.BY_KELAS(idKelas),
            method: 'GET',
        })
    },

    async getByPaket(idPaket: string): Promise<ApiResponse<IBiaya[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IBiaya[]>>({
            url: API_ENDPOINTS.KURSUS.BIAYA.BY_PAKET(idPaket),
            method: 'GET',
        })
    },

    async getByKategoriUmur(idKategori: string): Promise<ApiResponse<IBiaya[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IBiaya[]>>({
            url: API_ENDPOINTS.KURSUS.BIAYA.BY_KATEGORI_UMUR(idKategori),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IBiaya>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IBiaya>>({
            url: API_ENDPOINTS.KURSUS.BIAYA.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateBiaya): Promise<ApiResponse<IBiaya>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IBiaya>, ICreateBiaya>({
            url: API_ENDPOINTS.KURSUS.BIAYA.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateBiaya): Promise<ApiResponse<IBiaya>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IBiaya>, IUpdateBiaya>({
            url: API_ENDPOINTS.KURSUS.BIAYA.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.BIAYA.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default BiayaService
