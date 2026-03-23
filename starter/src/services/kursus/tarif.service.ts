import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ITarif,
    ICreateTarif,
    IUpdateTarif,
    IKursusQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const TarifService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<ITarif>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.TARIF.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.TARIF.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<ITarif>>({
            url,
            method: 'GET',
        })
    },

    async getByProgram(idProgram: string): Promise<ApiResponse<ITarif[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITarif[]>>({
            url: API_ENDPOINTS.KURSUS.TARIF.BY_PROGRAM(idProgram),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<ITarif>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITarif>>({
            url: API_ENDPOINTS.KURSUS.TARIF.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateTarif): Promise<ApiResponse<ITarif>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITarif>, ICreateTarif>({
            url: API_ENDPOINTS.KURSUS.TARIF.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateTarif): Promise<ApiResponse<ITarif>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITarif>, IUpdateTarif>({
            url: API_ENDPOINTS.KURSUS.TARIF.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.TARIF.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default TarifService
