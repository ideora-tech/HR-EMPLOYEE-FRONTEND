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

    /** Unduh rekap kehadiran siswa (Excel) untuk rentang tanggal tertentu */
    async downloadRekapSiswa(query: { dari: string; sampai: string }): Promise<void> {
        const params = new URLSearchParams()
        params.append('dari', query.dari)
        params.append('sampai', query.sampai)

        const res = await ApiService.fetchDataWithAxios<Blob>({
            url: `${API_ENDPOINTS.KURSUS.PRESENSI.REKAP_XLSX}?${params.toString()}`,
            method: 'GET',
            responseType: 'blob',
        })
        const url = URL.createObjectURL(res)
        const a = document.createElement('a')
        a.href = url
        a.download = `rekap-siswa-${query.dari}_${query.sampai}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
    },

    /** Unduh rekap absensi coach (Excel) untuk rentang tanggal tertentu */
    async downloadRekapCoach(query: { dari: string; sampai: string }): Promise<void> {
        const params = new URLSearchParams()
        params.append('dari', query.dari)
        params.append('sampai', query.sampai)

        const res = await ApiService.fetchDataWithAxios<Blob>({
            url: `${API_ENDPOINTS.KURSUS.ABSENSI_COACH_ADMIN.REKAP_XLSX}?${params.toString()}`,
            method: 'GET',
            responseType: 'blob',
        })
        const url = URL.createObjectURL(res)
        const a = document.createElement('a')
        a.href = url
        a.download = `rekap-coach-${query.dari}_${query.sampai}.xlsx`
        a.click()
        URL.revokeObjectURL(url)
    },
}

export default MonitoringService
