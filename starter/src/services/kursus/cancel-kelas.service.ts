import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ApiResponse,
    ApiPaginatedResponse,
    ICancelKelas,
    ICancelKelasDetail,
    ISesiPengganti,
    ICreateCancelKelas,
    IKonfirmasiPengganti,
} from '@/@types/kursus.types'

const CancelKelasService = {
    async getAll(params?: { page?: number; limit?: number; tanggal?: string }): Promise<ApiPaginatedResponse<ICancelKelas>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.CANCEL_KELAS.BASE,
            method: 'GET',
            params,
        })
    },

    async getById(id: string): Promise<ApiResponse<ICancelKelasDetail>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.CANCEL_KELAS.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateCancelKelas): Promise<ApiResponse<ICancelKelasDetail>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.CANCEL_KELAS.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.CANCEL_KELAS.BY_ID(id),
            method: 'DELETE',
        })
    },

    async konfirmasiPengganti(id: string, payload: IKonfirmasiPengganti): Promise<ApiResponse<ISesiPengganti>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.CANCEL_KELAS.KONFIRMASI_PENGGANTI(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async batalPengganti(id: string): Promise<ApiResponse<ISesiPengganti>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.CANCEL_KELAS.BATAL_PENGGANTI(id),
            method: 'PATCH',
        })
    },
}

export default CancelKelasService
