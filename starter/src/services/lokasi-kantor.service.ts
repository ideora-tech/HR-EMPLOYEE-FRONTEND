import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ILokasiKantor, ICreateLokasiKantor, IUpdateLokasiKantor, IOrganisasiQuery } from '@/@types/organisasi.types'
import type { ApiResponse, ApiPaginatedResponse } from '@/@types/kursus.types'

const LokasiKantorService = {
    async getAll(query?: IOrganisasiQuery): Promise<ApiPaginatedResponse<ILokasiKantor>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))
        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.ORGANISASI.LOKASI_KANTOR.BASE}?${qs}`
            : API_ENDPOINTS.ORGANISASI.LOKASI_KANTOR.BASE
        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<ILokasiKantor>>({ url, method: 'GET' })
    },

    async getById(id: string): Promise<ApiResponse<ILokasiKantor>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ILokasiKantor>>({
            url: API_ENDPOINTS.ORGANISASI.LOKASI_KANTOR.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateLokasiKantor): Promise<ApiResponse<ILokasiKantor>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ILokasiKantor>, ICreateLokasiKantor>({
            url: API_ENDPOINTS.ORGANISASI.LOKASI_KANTOR.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateLokasiKantor): Promise<ApiResponse<ILokasiKantor>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ILokasiKantor>, IUpdateLokasiKantor>({
            url: API_ENDPOINTS.ORGANISASI.LOKASI_KANTOR.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.ORGANISASI.LOKASI_KANTOR.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default LokasiKantorService
