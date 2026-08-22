import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IPresensi,
    IAbsensiCoachPublic,
    IAbsensiCoachQuery,
    IPresensiQuery,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const MonitoringService = {
    async getPresensiSiswa(
        query: Pick<IPresensiQuery, 'tanggal' | 'bulan' | 'dari' | 'sampai' | 'page' | 'limit'>,
    ): Promise<ApiPaginatedResponse<IPresensi>> {
        const params = new URLSearchParams()
        if (query.tanggal) params.append('tanggal', query.tanggal)
        if (query.bulan) params.append('bulan', query.bulan)
        if (query.dari) params.append('dari', query.dari)
        if (query.sampai) params.append('sampai', query.sampai)
        if (query.page) params.append('page', String(query.page))
        if (query.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.PRESENSI.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.PRESENSI.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IPresensi>>({
            url,
            method: 'GET',
        })
    },

    async getAbsensiCoach(
        query: Pick<IAbsensiCoachQuery, 'tanggal' | 'bulan' | 'dari' | 'sampai' | 'page' | 'limit'>,
    ): Promise<ApiPaginatedResponse<IAbsensiCoachPublic>> {
        const params = new URLSearchParams()
        if (query.tanggal) params.append('tanggal', query.tanggal)
        if (query.bulan) params.append('bulan', query.bulan)
        if (query.dari) params.append('dari', query.dari)
        if (query.sampai) params.append('sampai', query.sampai)
        if (query.page) params.append('page', String(query.page))
        if (query.limit) params.append('limit', String(query.limit))

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

export default MonitoringService
