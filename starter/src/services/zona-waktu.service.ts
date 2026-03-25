import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ApiResponse, IZonaWaktu } from '@/@types/perusahaan.types'

const ZonaWaktuService = {
    async getAll(semua?: 0 | 1): Promise<ApiResponse<IZonaWaktu[]>> {
        const qs = semua === 1 ? '?semua=1' : ''
        return ApiService.fetchDataWithAxios<ApiResponse<IZonaWaktu[]>>({
            url: `${API_ENDPOINTS.MASTER_DATA.ZONA_WAKTU.BASE}${qs}`,
            method: 'GET',
        })
    },
}

export default ZonaWaktuService
