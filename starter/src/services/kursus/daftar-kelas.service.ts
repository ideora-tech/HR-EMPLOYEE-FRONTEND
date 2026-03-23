import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IDaftarKelas,
    ICreateDaftarKelas,
    IUpdateDaftarKelas,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const DaftarSiswaService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<IDaftarKelas>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.DAFTAR.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.DAFTAR.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IDaftarKelas>>({
            url,
            method: 'GET',
        })
    },

    async getBySiswa(idSiswa: string): Promise<ApiResponse<IDaftarKelas[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDaftarKelas[]>>({
            url: API_ENDPOINTS.KURSUS.DAFTAR.BY_SISWA(idSiswa),
            method: 'GET',
        })
    },

    async getByJadwal(idJadwal: string): Promise<ApiResponse<IDaftarKelas[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDaftarKelas[]>>({
            url: API_ENDPOINTS.KURSUS.DAFTAR.BY_JADWAL(idJadwal),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IDaftarKelas>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDaftarKelas>>({
            url: API_ENDPOINTS.KURSUS.DAFTAR.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateDaftarKelas): Promise<ApiResponse<IDaftarKelas>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDaftarKelas>, ICreateDaftarKelas>({
            url: API_ENDPOINTS.KURSUS.DAFTAR.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateDaftarKelas): Promise<ApiResponse<IDaftarKelas>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDaftarKelas>, IUpdateDaftarKelas>({
            url: API_ENDPOINTS.KURSUS.DAFTAR.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.DAFTAR.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default DaftarSiswaService
