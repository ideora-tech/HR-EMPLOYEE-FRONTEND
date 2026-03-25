import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IMenu,
    IMenuCreate,
    IMenuUpdate,
    IMenuQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/menu.types'

const MenuService = {
    async getAll(query?: IMenuQuery): Promise<ApiPaginatedResponse<IMenu>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const queryString = params.toString()
        const url = queryString
            ? `${API_ENDPOINTS.MENU.BASE}?${queryString}`
            : API_ENDPOINTS.MENU.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IMenu>>({
            url,
            method: 'GET',
        })
    },

    async getMe(): Promise<ApiResponse<IMenu[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IMenu[]>>({
            url: API_ENDPOINTS.MENU.ME,
            method: 'GET',
        })
    },

    async getById(id_menu: string): Promise<ApiResponse<IMenu>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IMenu>>({
            url: API_ENDPOINTS.MENU.BY_ID(id_menu),
            method: 'GET',
        })
    },

    async create(payload: IMenuCreate): Promise<ApiResponse<IMenu>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IMenu>, IMenuCreate>({
            url: API_ENDPOINTS.MENU.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id_menu: string, payload: IMenuUpdate): Promise<ApiResponse<IMenu>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IMenu>, IMenuUpdate>({
            url: API_ENDPOINTS.MENU.BY_ID(id_menu),
            method: 'PUT',
            data: payload,
        })
    },

    async remove(id_menu: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.MENU.BY_ID(id_menu),
            method: 'DELETE',
        })
    },

    // ─── Modul-Menu assignment (many-to-many) ───────────────────────────────────

    async getByModul(kode_modul: string): Promise<ApiResponse<IMenu[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IMenu[]>>({
            url: API_ENDPOINTS.MODUL.MENU_LIST(kode_modul),
            method: 'GET',
        })
    },

    async assignToModul(
        kode_modul: string,
        id_menu: string,
    ): Promise<ApiResponse<unknown>> {
        return ApiService.fetchDataWithAxios<ApiResponse<unknown>>({
            url: API_ENDPOINTS.MODUL.MENU_ITEM(kode_modul, id_menu),
            method: 'PATCH',
        })
    },

    async unassignFromModul(
        kode_modul: string,
        id_menu: string,
    ): Promise<ApiResponse<unknown>> {
        return ApiService.fetchDataWithAxios<ApiResponse<unknown>>({
            url: API_ENDPOINTS.MODUL.MENU_ITEM(kode_modul, id_menu),
            method: 'DELETE',
        })
    },
}

export default MenuService
