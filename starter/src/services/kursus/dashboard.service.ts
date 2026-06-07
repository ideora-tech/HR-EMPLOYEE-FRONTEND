import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IKursusDashboard,
    IKursusDashboardKeuangan,
    IKursusDashboardSiswa,
    IKursusDashboardOperasional,
    ApiResponse,
} from '@/@types/kursus.types'

const KursusDashboardService = {
    async getSummary(): Promise<ApiResponse<IKursusDashboard>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKursusDashboard>>({
            url: API_ENDPOINTS.KURSUS.DASHBOARD.SUMMARY,
            method: 'GET',
        })
    },
    async getKeuangan(): Promise<ApiResponse<IKursusDashboardKeuangan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKursusDashboardKeuangan>>({
            url: API_ENDPOINTS.KURSUS.DASHBOARD.KEUANGAN,
            method: 'GET',
        })
    },
    async getSiswa(): Promise<ApiResponse<IKursusDashboardSiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKursusDashboardSiswa>>({
            url: API_ENDPOINTS.KURSUS.DASHBOARD.SISWA,
            method: 'GET',
        })
    },
    async getOperasional(): Promise<ApiResponse<IKursusDashboardOperasional>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKursusDashboardOperasional>>({
            url: API_ENDPOINTS.KURSUS.DASHBOARD.OPERASIONAL,
            method: 'GET',
        })
    },
}

export default KursusDashboardService
