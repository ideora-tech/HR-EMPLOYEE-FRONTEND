import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IDepartemen, ICreateDepartemen, IUpdateDepartemen, IOrganisasiQuery } from '@/@types/organisasi.types'
import type { ApiResponse, ApiPaginatedResponse } from '@/@types/kursus.types'

const DepartemenService = {
    async getAll(query?: IOrganisasiQuery): Promise<ApiPaginatedResponse<IDepartemen>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))
        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.ORGANISASI.DEPARTEMEN.BASE}?${qs}`
            : API_ENDPOINTS.ORGANISASI.DEPARTEMEN.BASE
        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IDepartemen>>({ url, method: 'GET' })
    },

    async getById(id: string): Promise<ApiResponse<IDepartemen>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDepartemen>>({
            url: API_ENDPOINTS.ORGANISASI.DEPARTEMEN.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateDepartemen): Promise<ApiResponse<IDepartemen>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDepartemen>, ICreateDepartemen>({
            url: API_ENDPOINTS.ORGANISASI.DEPARTEMEN.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateDepartemen): Promise<ApiResponse<IDepartemen>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDepartemen>, IUpdateDepartemen>({
            url: API_ENDPOINTS.ORGANISASI.DEPARTEMEN.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.ORGANISASI.DEPARTEMEN.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default DepartemenService
