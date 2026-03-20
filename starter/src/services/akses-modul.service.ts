import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IAksesModulTier,
    IAksesModulUpdate,
    ApiResponse,
} from '@/@types/akses-modul.types'

const AksesModulService = {
    async getAll(): Promise<ApiResponse<IAksesModulTier[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IAksesModulTier[]>>({
            url: API_ENDPOINTS.AKSES_MODUL_TIER.BASE,
            method: 'GET',
        })
    },

    async getByPaket(paket: string): Promise<ApiResponse<IAksesModulTier[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IAksesModulTier[]>>({
            url: API_ENDPOINTS.AKSES_MODUL_TIER.BY_PAKET(paket),
            method: 'GET',
        })
    },

    async updateByPaketModul(
        paket: string,
        kode_modul: string,
        payload: IAksesModulUpdate,
    ): Promise<ApiResponse<IAksesModulTier>> {
        return ApiService.fetchDataWithAxios<
            ApiResponse<IAksesModulTier>,
            IAksesModulUpdate
        >({
            url: API_ENDPOINTS.AKSES_MODUL_TIER.BY_PAKET_MODUL(
                paket,
                kode_modul,
            ),
            method: 'PATCH',
            data: payload,
        })
    },
}

export default AksesModulService
