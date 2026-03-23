import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ISiswa,
    ICreateSiswa,
    IUpdateSiswa,
    IKursusQuery,
    IImportResult,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const SiswaService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<ISiswa>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.SISWA.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.SISWA.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<ISiswa>>({
            url,
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<ISiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ISiswa>>({
            url: API_ENDPOINTS.KURSUS.SISWA.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateSiswa): Promise<ApiResponse<ISiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ISiswa>, ICreateSiswa>({
            url: API_ENDPOINTS.KURSUS.SISWA.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateSiswa): Promise<ApiResponse<ISiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ISiswa>, IUpdateSiswa>({
            url: API_ENDPOINTS.KURSUS.SISWA.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.SISWA.BY_ID(id),
            method: 'DELETE',
        })
    },

    async importExcel(file: File): Promise<ApiResponse<IImportResult>> {
        const formData = new FormData()
        formData.append('file', file)
        return ApiService.fetchDataWithAxios<ApiResponse<IImportResult>, FormData>({
            url: API_ENDPOINTS.KURSUS.SISWA.IMPORT,
            method: 'POST',
            data: formData,
        })
    },

    async downloadTemplate(): Promise<void> {
        const res = await fetch(API_ENDPOINTS.KURSUS.SISWA.TEMPLATE)
        if (!res.ok) throw new Error('Gagal mengunduh template')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Template_Import_Siswa.xlsx'
        a.click()
        URL.revokeObjectURL(url)
    },
}

export default SiswaService
