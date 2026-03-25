import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IKaryawanExit,
    ICreateKaryawanExit,
    IUpdateKaryawanExit,
    IKaryawanExitQuery,
} from '@/@types/karyawan-exit.types'
import type { ApiResponse, ApiPaginatedResponse } from '@/@types/karyawan.types'

const KaryawanExitService = {
    async getAll(
        query?: IKaryawanExitQuery,
    ): Promise<ApiPaginatedResponse<IKaryawanExit>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.jenis_exit) params.append('jenis_exit', query.jenis_exit)
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))
        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KARYAWAN_EXIT.BASE}?${qs}`
            : API_ENDPOINTS.KARYAWAN_EXIT.BASE
        return ApiService.fetchDataWithAxios<
            ApiPaginatedResponse<IKaryawanExit>
        >({ url, method: 'GET' })
    },

    async getById(id: string): Promise<ApiResponse<IKaryawanExit>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKaryawanExit>>({
            url: API_ENDPOINTS.KARYAWAN_EXIT.BY_ID(id),
            method: 'GET',
        })
    },

    async getByKaryawan(
        id_karyawan: string,
    ): Promise<ApiResponse<IKaryawanExit[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IKaryawanExit[]>>({
            url: API_ENDPOINTS.KARYAWAN_EXIT.BY_KARYAWAN(id_karyawan),
            method: 'GET',
        })
    },

    async create(
        payload: ICreateKaryawanExit,
    ): Promise<ApiResponse<IKaryawanExit>> {
        return ApiService.fetchDataWithAxios<
            ApiResponse<IKaryawanExit>,
            ICreateKaryawanExit
        >({
            url: API_ENDPOINTS.KARYAWAN_EXIT.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(
        id: string,
        payload: IUpdateKaryawanExit,
    ): Promise<ApiResponse<IKaryawanExit>> {
        return ApiService.fetchDataWithAxios<
            ApiResponse<IKaryawanExit>,
            IUpdateKaryawanExit
        >({
            url: API_ENDPOINTS.KARYAWAN_EXIT.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KARYAWAN_EXIT.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default KaryawanExitService
