import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IKursusDashboard, ApiResponse } from '@/@types/kursus.types'

const KursusDashboardService = {
    async getSummary(): Promise<ApiResponse<IKursusDashboard>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKursusDashboard>>({
            url: API_ENDPOINTS.KURSUS.DASHBOARD.BASE,
            method: 'GET',
        })
    },
}

export default KursusDashboardService
