import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ICatatKelasSiswa,
    ICreateCatatKelasSiswa,
    IUpdateCatatKelasSiswa,
    IConvertTrialPayload,
    ApiResponse,
} from '@/@types/kursus.types'

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

    async getByJadwal(id_jadwal_kelas: string): Promise<ApiResponse<ICatatKelasSiswa[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ICatatKelasSiswa[]>>({
            url: API_ENDPOINTS.KURSUS.CATAT_KELAS_SISWA.BY_JADWAL(id_jadwal_kelas),
            method: 'GET',
        })
    },

    async create(payload: ICreateCatatKelasSiswa): Promise<ApiResponse<ICatatKelasSiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ICatatKelasSiswa>, ICreateCatatKelasSiswa>({
            url: API_ENDPOINTS.KURSUS.CATAT_KELAS_SISWA.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateCatatKelasSiswa): Promise<ApiResponse<ICatatKelasSiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ICatatKelasSiswa>, IUpdateCatatKelasSiswa>({
            url: API_ENDPOINTS.KURSUS.CATAT_KELAS_SISWA.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.CATAT_KELAS_SISWA.BY_ID(id),
            method: 'DELETE',
        })
    },

    async convertTrial(id: string, payload: IConvertTrialPayload): Promise<ApiResponse<ICatatKelasSiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ICatatKelasSiswa>, IConvertTrialPayload>({
            url: API_ENDPOINTS.KURSUS.CATAT_KELAS_SISWA.CONVERT(id),
            method: 'POST',
            data: payload,
        })
    },
}

export default CatatKelasSiswaService
