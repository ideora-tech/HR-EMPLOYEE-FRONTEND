import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ApiResponse,
    ApiPaginatedResponse,
    ILiburJadwal,
    ILiburJadwalDetail,
    ICreateLiburJadwal,
} from '@/@types/kursus.types'

const LiburJadwalService = {
    async getAll(params?: { page?: number; limit?: number }): Promise<ApiPaginatedResponse<ILiburJadwal>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.LIBUR_JADWAL.BASE,
            method: 'GET',
            params,
        })
    },

    async getById(id: string): Promise<ApiResponse<ILiburJadwalDetail>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.LIBUR_JADWAL.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateLiburJadwal): Promise<ApiResponse<ILiburJadwalDetail>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.LIBUR_JADWAL.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios({
            url: API_ENDPOINTS.KURSUS.LIBUR_JADWAL.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default LiburJadwalService
