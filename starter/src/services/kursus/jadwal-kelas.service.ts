import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IJadwalKelas,
    IKuotaJadwal,
    ICreateJadwalKelas,
    IUpdateJadwalKelas,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const JadwalKelasService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<IJadwalKelas>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))
        if (query?.week_start) params.append('week_start', query.week_start)
        if (query?.week_end) params.append('week_end', query.week_end)

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.JADWAL.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.JADWAL.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IJadwalKelas>>({
            url,
            method: 'GET',
        })
    },

    async getKuota(id: string): Promise<ApiResponse<IKuotaJadwal>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKuotaJadwal>>({
            url: API_ENDPOINTS.KURSUS.JADWAL.KUOTA(id),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IJadwalKelas>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IJadwalKelas>>({
            url: API_ENDPOINTS.KURSUS.JADWAL.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateJadwalKelas): Promise<ApiResponse<IJadwalKelas>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IJadwalKelas>, ICreateJadwalKelas>({
            url: API_ENDPOINTS.KURSUS.JADWAL.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateJadwalKelas): Promise<ApiResponse<IJadwalKelas>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IJadwalKelas>, IUpdateJadwalKelas>({
            url: API_ENDPOINTS.KURSUS.JADWAL.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.JADWAL.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default JadwalKelasService
