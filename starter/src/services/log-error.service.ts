import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ApiPaginatedResponse, ApiResponse } from '@/@types/kursus.types'
import type { ILogError, ILogErrorQuery } from '@/@types/log-error.types'

const LogErrorService = {
    getAll: (query: ILogErrorQuery = {}) => {
        const params = new URLSearchParams()
        if (query.page) params.set('page', String(query.page))
        if (query.limit) params.set('limit', String(query.limit))
        if (query.search) params.set('search', query.search)
        if (query.level) params.set('level', query.level)
        if (query.kode_status) params.set('kode_status', String(query.kode_status))
        const qs = params.toString()
        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<ILogError>>({
            url: `${API_ENDPOINTS.LOG_ERROR.BASE}${qs ? `?${qs}` : ''}`,
            method: 'get',
        })
    },

    getById: (id: string) =>
        ApiService.fetchDataWithAxios<ApiResponse<ILogError>>({
            url: API_ENDPOINTS.LOG_ERROR.BY_ID(id),
            method: 'get',
        }),
}

export default LogErrorService
