import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ICoachPublic,
    ICreateCoach,
    IUpdateCoach,
    ICoachQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const CoachService = {
    async getAll(query?: ICoachQuery): Promise<ApiPaginatedResponse<ICoachPublic>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.COACH.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.COACH.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<ICoachPublic>>({
            url,
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<ICoachPublic>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ICoachPublic>>({
            url: API_ENDPOINTS.KURSUS.COACH.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateCoach): Promise<ApiResponse<ICoachPublic>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ICoachPublic>, ICreateCoach>({
            url: API_ENDPOINTS.KURSUS.COACH.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateCoach): Promise<ApiResponse<ICoachPublic>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ICoachPublic>, IUpdateCoach>({
            url: API_ENDPOINTS.KURSUS.COACH.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.COACH.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default CoachService
