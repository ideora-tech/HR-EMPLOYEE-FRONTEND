import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IAbsensiCoachPublic,
    IAbsensiCoachQuery,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const AbsensiCoachService = {
    async getAll(query?: IAbsensiCoachQuery): Promise<ApiPaginatedResponse<IAbsensiCoachPublic>> {
        const params = new URLSearchParams()
        if (query?.id_coach) params.append('id_coach', query.id_coach)
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.ABSENSI_COACH_ADMIN.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.ABSENSI_COACH_ADMIN.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IAbsensiCoachPublic>>({
            url,
            method: 'GET',
        })
    },
}

export default AbsensiCoachService
