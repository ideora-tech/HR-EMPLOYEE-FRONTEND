import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IPembayaran,
    ICreatePembayaran,
    IPembayaranQuery,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const PembayaranService = {
    async getAll(query?: IPembayaranQuery): Promise<ApiPaginatedResponse<IPembayaran>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))
        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.PEMBAYARAN.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.PEMBAYARAN.BASE
        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<IPembayaran>>({
            url,
            method: 'GET',
        })
    },

    async getByTagihan(idTagihan: string): Promise<ApiResponse<IPembayaran[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPembayaran[]>>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.BY_TAGIHAN(idTagihan),
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<IPembayaran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPembayaran>>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreatePembayaran): Promise<ApiResponse<IPembayaran>> {
        if (payload.bukti_bayar) {
            const formData = new FormData()
            formData.append('id_tagihan', payload.id_tagihan)
            formData.append('jumlah', String(payload.jumlah))
            formData.append('tanggal_bayar', payload.tanggal_bayar)
            formData.append('metode', payload.metode)
            if (payload.referensi) formData.append('referensi', payload.referensi)
            if (payload.deskripsi) formData.append('deskripsi', payload.deskripsi)
            formData.append('bukti_bayar', payload.bukti_bayar)
            return ApiService.fetchDataWithAxios<ApiResponse<IPembayaran>>({
                url: API_ENDPOINTS.KURSUS.PEMBAYARAN.BASE,
                method: 'POST',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        }
        return ApiService.fetchDataWithAxios<ApiResponse<IPembayaran>, ICreatePembayaran>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.BY_ID(id),
            method: 'DELETE',
        })
    },
}

export default PembayaranService
