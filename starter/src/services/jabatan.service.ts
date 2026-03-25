import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IJabatan, ICreateJabatan, IUpdateJabatan, IOrganisasiQuery } from '@/@types/organisasi.types'
import type { ApiResponse, ApiPaginatedResponse } from '@/@types/kursus.types'

const JabatanService = {
    async getAll(query?: IOrganisasiQuery): Promise<ApiPaginatedResponse<IJabatan>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))
        if (query?.id_departemen) params.append('id_departemen', query.id_departemen)
        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.ORGANISASI.JABATAN.BASE}?${qs}`
            : API_ENDPOINTS.ORGANISASI.JABATAN.BASE
        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IJabatan>>({ url, method: 'GET' })
    },

    async getByDepartemen(idDepartemen: string): Promise<ApiResponse<IJabatan[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IJabatan[]>>({
            url: API_ENDPOINTS.ORGANISASI.JABATAN.BY_DEPARTEMEN(idDepartemen),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IJabatan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IJabatan>>({
            url: API_ENDPOINTS.ORGANISASI.JABATAN.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateJabatan): Promise<ApiResponse<IJabatan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IJabatan>, ICreateJabatan>({
            url: API_ENDPOINTS.ORGANISASI.JABATAN.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateJabatan): Promise<ApiResponse<IJabatan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IJabatan>, IUpdateJabatan>({
            url: API_ENDPOINTS.ORGANISASI.JABATAN.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.ORGANISASI.JABATAN.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default JabatanService
