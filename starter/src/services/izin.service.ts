import ApiService from './ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ApiResponse, IItemIzin } from '@/@types/peran.types'

export interface IIzinPaket {
    kode_paket: string
    kode_izin: string[]
}

const IzinService = {
    /** Katalog izin yang tersedia di paket perusahaan (SUPERADMIN: seluruh katalog). */
    async getKatalog(): Promise<ApiResponse<IItemIzin[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IItemIzin[]>>({
            url: API_ENDPOINTS.IZIN.KATALOG,
            method: 'GET',
        })
    },

    async getIzinPaket(kodePaket: string): Promise<ApiResponse<IIzinPaket>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IIzinPaket>>({
            url: API_ENDPOINTS.IZIN.PAKET(kodePaket),
            method: 'GET',
        })
    },

    async setIzinPaket(kodePaket: string, kodeIzin: string[]): Promise<ApiResponse<IIzinPaket>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IIzinPaket>, { kode_izin: string[] }>({
            url: API_ENDPOINTS.IZIN.PAKET(kodePaket),
            method: 'PUT',
            data: { kode_izin: kodeIzin },
        })
    },
}

export default IzinService
