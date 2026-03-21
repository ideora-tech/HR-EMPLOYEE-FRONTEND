import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IzinPeranMenuItem,
    AksiType,
    ApiResponse,
} from '@/@types/izin-peran.types'

const IzinPeranService = {
    async getByPeran(kode_peran: string): Promise<ApiResponse<IzinPeranMenuItem[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IzinPeranMenuItem[]>>({
            url: API_ENDPOINTS.IZIN_PERAN.BY_PERAN(kode_peran),
            method: 'GET',
        })
    },

    async setAksi(
        kode_peran: string,
        id_menu: string,
        aksi: AksiType[],
    ): Promise<ApiResponse<IzinPeranMenuItem>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IzinPeranMenuItem>>({
            url: API_ENDPOINTS.IZIN_PERAN.BY_PERAN_MENU(kode_peran, id_menu),
            method: 'PUT',
            data: { aksi },
        })
    },

    async bulkSetAksi(
        kode_peran: string,
        items: { id_menu: string; aksi: AksiType[] }[],
    ): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.IZIN_PERAN.BULK(kode_peran),
            method: 'PUT',
            data: { items },
        })
    },

    async removeAksi(
        kode_peran: string,
        id_menu: string,
    ): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.IZIN_PERAN.BY_PERAN_MENU(kode_peran, id_menu),
            method: 'DELETE',
        })
    },
}

export default IzinPeranService
