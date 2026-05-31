import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ApiResponse,
    ApiPaginatedResponse,
    ISiswaSesiPengganti,
    ICreateSiswaSesiPengganti,
} from '@/@types/kursus.types'

const SiswaSesiPenggantiService = {
    async getAll(params?: {
        id_siswa?: string
        id_jadwal_kelas_asal?: string
        status?: number
        bulan?: string
        page?: number
        limit?: number
    }): Promise<ApiPaginatedResponse<ISiswaSesiPengganti>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.SISWA_SESI_PENGGANTI.BASE,
            method: 'GET',
            params,
        })
    },

    async create(payload: ICreateSiswaSesiPengganti): Promise<ApiResponse<ISiswaSesiPengganti>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.SISWA_SESI_PENGGANTI.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.SISWA_SESI_PENGGANTI.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default SiswaSesiPenggantiService
