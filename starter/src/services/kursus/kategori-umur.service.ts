import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IKategoriUmur,
    ICreateKategoriUmur,
    IUpdateKategoriUmur,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const KategoriUmurService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<IKategoriUmur>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.KATEGORI_UMUR.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.KATEGORI_UMUR.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IKategoriUmur>>({
            url,
            method: 'GET',
        })
    },

    /** Dropdown berdasarkan kelas */
    async getByKelas(idKelas: string): Promise<ApiResponse<IKategoriUmur[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKategoriUmur[]>>({
            url: API_ENDPOINTS.KURSUS.KATEGORI_UMUR.BY_KELAS(idKelas),
            method: 'GET',
        })
    },

    /** Dropdown berdasarkan paket */
    async getByPaket(idPaket: string): Promise<ApiResponse<IKategoriUmur[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKategoriUmur[]>>({
            url: API_ENDPOINTS.KURSUS.KATEGORI_UMUR.BY_PAKET(idPaket),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IKategoriUmur>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKategoriUmur>>({
            url: API_ENDPOINTS.KURSUS.KATEGORI_UMUR.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateKategoriUmur): Promise<ApiResponse<IKategoriUmur>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKategoriUmur>, ICreateKategoriUmur>({
            url: API_ENDPOINTS.KURSUS.KATEGORI_UMUR.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateKategoriUmur): Promise<ApiResponse<IKategoriUmur>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKategoriUmur>, IUpdateKategoriUmur>({
            url: API_ENDPOINTS.KURSUS.KATEGORI_UMUR.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.KATEGORI_UMUR.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default KategoriUmurService
