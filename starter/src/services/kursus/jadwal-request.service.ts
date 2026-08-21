import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IJadwalRequestPublic,
    IJadwalRequestQuery,
    IApproveJadwalRequest,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const JadwalRequestService = {
    async getAll(query?: IJadwalRequestQuery): Promise<ApiPaginatedResponse<IJadwalRequestPublic>> {
        const params = new URLSearchParams()
        if (query?.status !== undefined) params.append('status', String(query.status))
        if (query?.dari) params.append('dari', query.dari)
        if (query?.sampai) params.append('sampai', query.sampai)
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.JADWAL_REQUEST_ADMIN.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.JADWAL_REQUEST_ADMIN.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IJadwalRequestPublic>>({
            url,
            method: 'GET',
        })
    },

    async handleApproval(
        id: string,
        payload: IApproveJadwalRequest,
    ): Promise<ApiResponse<IJadwalRequestPublic>> {
        return ApiService.fetchDataWithAxios<
            ApiResponse<IJadwalRequestPublic>,
            IApproveJadwalRequest
        >({
            url: API_ENDPOINTS.KURSUS.JADWAL_REQUEST_ADMIN.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },
}

export default JadwalRequestService
