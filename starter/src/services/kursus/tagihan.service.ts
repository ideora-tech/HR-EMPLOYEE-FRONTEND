import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ITagihan,
    ICreateTagihan,
    IUpdateTagihan,
    ITagihanQuery,
    IAddDetailTagihan,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const normalizeTagihan = (t: ITagihan): ITagihan => ({
    ...t,
    total_harga: Number(t.total_harga),
    total_bayar: Number(t.total_bayar),
    nominal_diskon: t.nominal_diskon != null ? Number(t.nominal_diskon) : null,
    persen_diskon: t.persen_diskon != null ? Number(t.persen_diskon) : null,
    detail: t.detail?.map((d) => ({ ...d, harga_akhir: Number(d.harga_akhir) })),
})

const TagihanService = {
    async getAll(query?: ITagihanQuery): Promise<ApiPaginatedResponse<ITagihan>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))
        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.TAGIHAN.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.TAGIHAN.BASE
        const res = await ApiService.fetchDataWithAxios<ApiPaginatedResponse<ITagihan>>({ url, method: 'GET' })
        return { ...res, data: res.data.map(normalizeTagihan) }
    },

    async getBySiswa(idSiswa: string): Promise<ApiResponse<ITagihan[]>> {
        const res = await ApiService.fetchDataWithAxios<ApiResponse<ITagihan[]>>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BY_SISWA(idSiswa),
            method: 'GET',
        })
        return { ...res, data: res.data.map(normalizeTagihan) }
    },

    async getById(id: string): Promise<ApiResponse<ITagihan>> {
        const res = await ApiService.fetchDataWithAxios<ApiResponse<ITagihan>>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BY_ID(id),
            method: 'GET',
        })
        return { ...res, data: normalizeTagihan(res.data) }
    },

    async create(payload: ICreateTagihan): Promise<ApiResponse<ITagihan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITagihan>, ICreateTagihan>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateTagihan): Promise<ApiResponse<ITagihan>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ITagihan>, IUpdateTagihan>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BY_ID(id),
            method: 'DELETE',
        })
    },

    async addDetail(id: string, payload: IAddDetailTagihan): Promise<ApiResponse<ITagihan>> {
        const res = await ApiService.fetchDataWithAxios<ApiResponse<ITagihan>, IAddDetailTagihan>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.ADD_DETAIL(id),
            method: 'POST',
            data: payload,
        })
        return { ...res, data: normalizeTagihan(res.data) }
    },

    async applyDiskon(id: string, payload: Pick<IUpdateTagihan, 'id_diskon' | 'kode_diskon'>): Promise<ApiResponse<ITagihan>> {
        const res = await ApiService.fetchDataWithAxios<ApiResponse<ITagihan>, typeof payload>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
        return { ...res, data: normalizeTagihan(res.data) }
    },

    async removeDetail(id: string, idDetail: string): Promise<ApiResponse<ITagihan>> {
        const res = await ApiService.fetchDataWithAxios<ApiResponse<ITagihan>>({
            url: API_ENDPOINTS.KURSUS.TAGIHAN.REMOVE_DETAIL(id, idDetail),
            method: 'DELETE',
        })
        return { ...res, data: normalizeTagihan(res.data) }
    },
}

export default TagihanService
