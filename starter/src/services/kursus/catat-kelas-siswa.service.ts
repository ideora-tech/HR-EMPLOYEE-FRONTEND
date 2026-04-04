import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ICatatKelasSiswa, ApiResponse } from '@/@types/kursus.types'

const CatatKelasSiswaService = {
    async getBySiswa(id_siswa: string): Promise<ApiResponse<ICatatKelasSiswa[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ICatatKelasSiswa[]>>({
            url: API_ENDPOINTS.KURSUS.CATAT_KELAS_SISWA.BY_SISWA(id_siswa),
            method: 'GET',
        })
    },

    async getByKelas(id_kelas: string): Promise<ApiResponse<ICatatKelasSiswa[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ICatatKelasSiswa[]>>({
            url: API_ENDPOINTS.KURSUS.CATAT_KELAS_SISWA.BY_KELAS(id_kelas),
            method: 'GET',
        })
    },
}

export default CatatKelasSiswaService
