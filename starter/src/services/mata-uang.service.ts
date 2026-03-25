import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ApiResponse, IMataUang } from '@/@types/perusahaan.types'

const MataUangService = {
    async getAll(semua?: 0 | 1): Promise<ApiResponse<IMataUang[]>> {
        const qs = semua === 1 ? '?semua=1' : ''
        return ApiService.fetchDataWithAxios<ApiResponse<IMataUang[]>>({
            url: `${API_ENDPOINTS.MASTER_DATA.MATA_UANG.BASE}${qs}`,
            method: 'GET',
        })
    },
}

export default MataUangService
