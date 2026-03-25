import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import appConfig from '@/configs/app.config'
import type {
    IKaryawan,
    ICreateKaryawan,
    IUpdateKaryawan,
    IKaryawanQuery,
    IImportKaryawanResult,
    ILokasiKaryawan,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/karyawan.types'

const KaryawanService = {
    async getAll(
        query?: IKaryawanQuery,
    ): Promise<ApiPaginatedResponse<IKaryawan>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined)
            params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KARYAWAN.BASE}?${qs}`
            : API_ENDPOINTS.KARYAWAN.BASE

        return ApiService.fetchDataWithAxios<
            ApiPaginatedResponse<IKaryawan>
        >({ url, method: 'GET' })
    },

    async getById(id: string): Promise<ApiResponse<IKaryawan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKaryawan>>({
            url: API_ENDPOINTS.KARYAWAN.BY_ID(id),
            method: 'GET',
        })
    },

    async create(
        payload: ICreateKaryawan,
    ): Promise<ApiResponse<IKaryawan>> {
        return ApiService.fetchDataWithAxios<
            ApiResponse<IKaryawan>,
            ICreateKaryawan
        >({
            url: API_ENDPOINTS.KARYAWAN.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(
        id: string,
        payload: IUpdateKaryawan,
    ): Promise<ApiResponse<IKaryawan>> {
        return ApiService.fetchDataWithAxios<
            ApiResponse<IKaryawan>,
            IUpdateKaryawan
        >({
            url: API_ENDPOINTS.KARYAWAN.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KARYAWAN.BY_ID(id),
            method: 'DELETE',
        })
    },

    async getLokasi(id: string): Promise<ApiResponse<ILokasiKaryawan[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ILokasiKaryawan[]>>({
            url: API_ENDPOINTS.KARYAWAN.LOKASI(id),
            method: 'GET',
        })
    },

    async setLokasi(
        id: string,
        lokasi_ids: string[],
    ): Promise<ApiResponse<ILokasiKaryawan[]>> {
        return ApiService.fetchDataWithAxios<
            ApiResponse<ILokasiKaryawan[]>,
            { lokasi_ids: string[] }
        >({
            url: API_ENDPOINTS.KARYAWAN.LOKASI(id),
            method: 'PUT',
            data: { lokasi_ids },
        })
    },

    /** Download template Excel kosong untuk import bulk */
    async downloadTemplate(): Promise<void> {
        const res = await fetch(
            `${appConfig.apiPrefix}${API_ENDPOINTS.KARYAWAN.TEMPLATE_EXCEL}`,
        )
        if (!res.ok) throw new Error('Gagal mengunduh template')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'template-karyawan.xlsx'
        a.click()
        URL.revokeObjectURL(url)
    },

    /** Import karyawan dari file Excel */
    async uploadExcel(
        file: File,
    ): Promise<ApiResponse<IImportKaryawanResult>> {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(
            `${appConfig.apiPrefix}${API_ENDPOINTS.KARYAWAN.UPLOAD_EXCEL}`,
            {
                method: 'POST',
                body: formData,
            },
        )
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err?.message ?? 'Gagal mengimpor file')
        }
        return res.json()
    },

    async uploadFoto(id: string, file: File): Promise<ApiResponse<IKaryawan>> {
        const formData = new FormData()
        formData.append('foto', file)

        const res = await fetch(
            `${appConfig.apiPrefix}${API_ENDPOINTS.KARYAWAN.FOTO(id)}`,
            {
                method: 'POST',
                body: formData,
            },
        )
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err?.message ?? 'Gagal mengunggah foto karyawan')
        }
        return res.json()
    },
}

export default KaryawanService
