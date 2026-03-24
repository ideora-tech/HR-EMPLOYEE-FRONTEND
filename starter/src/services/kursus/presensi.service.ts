import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IPresensi,
    IPresensiJadwalEntry,
    IPresensiWithDetail,
    ICreatePresensi,
    ICreateBatchPresensi,
    IUpdatePresensi,
    IPresensiQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const PresensiService = {
    async getAll(query?: IPresensiQuery): Promise<ApiPaginatedResponse<IPresensi>> {
        const params = new URLSearchParams()
        if (query?.id_jadwal) params.append('id_jadwal', query.id_jadwal)
        if (query?.bulan) params.append('bulan', query.bulan)
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.PRESENSI.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.PRESENSI.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IPresensi>>({
            url,
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IPresensiWithDetail>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPresensiWithDetail>>({
            url: API_ENDPOINTS.KURSUS.PRESENSI.BY_ID(id),
            method: 'GET',
        })
    },

    async getByJadwal(id_jadwal: string): Promise<ApiResponse<IPresensiJadwalEntry[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPresensiJadwalEntry[]>>({
            url: API_ENDPOINTS.KURSUS.PRESENSI.BY_JADWAL(id_jadwal),
            method: 'GET',
        })
    },

    async create(payload: ICreatePresensi): Promise<ApiResponse<IPresensi>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPresensi>, ICreatePresensi>({
            url: API_ENDPOINTS.KURSUS.PRESENSI.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async batch(payload: ICreateBatchPresensi): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>, ICreateBatchPresensi>({
            url: API_ENDPOINTS.KURSUS.PRESENSI.BATCH,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdatePresensi): Promise<ApiResponse<IPresensi>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPresensi>, IUpdatePresensi>({
            url: API_ENDPOINTS.KURSUS.PRESENSI.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.PRESENSI.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default PresensiService
