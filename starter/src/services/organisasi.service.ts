import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IOrgChartStruktur } from '@/@types/organisasi.types'
import type { ApiResponse } from '@/@types/kursus.types'

const OrganisasiService = {
    async getStruktur(id_perusahaan?: string): Promise<ApiResponse<IOrgChartStruktur>> {
        const qs = id_perusahaan
            ? `?id_perusahaan=${encodeURIComponent(id_perusahaan)}`
            : ''
        return ApiService.fetchDataWithAxios<ApiResponse<IOrgChartStruktur>>({
            url: `${API_ENDPOINTS.ORGANISASI.STRUKTUR}${qs}`,
            method: 'GET',
        })
    },
}

export default OrganisasiService
