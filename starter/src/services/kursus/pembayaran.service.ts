import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    IPembayaran,
    ICreatePembayaran,
    IPembayaranQuery,
    IPembayaranMeta,
    ApiResponse,
} from '@/@types/kursus.types'

export interface IPembayaranPaginatedResponse {
    success: boolean
    message: string
    data: IPembayaran[]
    meta: IPembayaranMeta
    timestamp: string
}

const PembayaranService = {
    async getAll(query?: IPembayaranQuery): Promise<IPembayaranPaginatedResponse> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))
        if (query?.tanggal_mulai) params.append('tanggal_mulai', query.tanggal_mulai)
        if (query?.tanggal_selesai) params.append('tanggal_selesai', query.tanggal_selesai)
        if (query?.metode) params.append('metode', query.metode)
        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.PEMBAYARAN.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.PEMBAYARAN.BASE
        return ApiService.fetchDataWithAxios<IPembayaranPaginatedResponse>({
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
        // bukti_bayar is a File object — not serialisable as JSON and uploaded separately via uploadBukti()
        const body: Record<string, unknown> = {
            id_tagihan: payload.id_tagihan,
            jumlah: payload.jumlah,
            tanggal_bayar: payload.tanggal_bayar,
            metode: payload.metode,
        }
        if (payload.kembalian !== undefined) body.kembalian = payload.kembalian
        if (payload.nominal_diterima !== undefined) body.nominal_diterima = payload.nominal_diterima
        if (payload.referensi !== undefined) body.referensi = payload.referensi
        if (payload.deskripsi !== undefined) body.deskripsi = payload.deskripsi
        if (payload.aktif !== undefined) body.aktif = payload.aktif
        return ApiService.fetchDataWithAxios<ApiResponse<IPembayaran>>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.BASE,
            method: 'POST',
            data: body,
        })
    },

    async update(id: string, payload: Partial<Pick<ICreatePembayaran, 'jumlah' | 'tanggal_bayar' | 'metode' | 'referensi' | 'deskripsi' | 'aktif'>>): Promise<ApiResponse<IPembayaran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPembayaran>>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.BY_ID(id),
            method: 'DELETE',
        })
    },

    async uploadBukti(id: string, file: File): Promise<ApiResponse<IPembayaran>> {
        const formData = new FormData()
        formData.append('bukti_bayar', file)
        return ApiService.fetchDataWithAxios<ApiResponse<IPembayaran>, FormData>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.BUKTI_BAYAR(id),
            method: 'POST',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    async cetak(id: string): Promise<void> {
        const res = await ApiService.fetchDataWithAxios<ApiResponse<{ url: string; filename: string }>>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.CETAK(id),
            method: 'GET',
        })
        window.open(`/api/proxy${res.data.url}`, '_blank')
    },

    async konfirmasi(id: string): Promise<ApiResponse<IPembayaran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPembayaran>>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.KONFIRMASI(id),
            method: 'PATCH',
        })
    },

    async tolak(id: string, catatanTolak: string): Promise<ApiResponse<IPembayaran>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IPembayaran>>({
            url: API_ENDPOINTS.KURSUS.PEMBAYARAN.TOLAK(id),
            method: 'PATCH',
            data: { catatan_tolak: catatanTolak },
        })
    },
}

export default PembayaranService
