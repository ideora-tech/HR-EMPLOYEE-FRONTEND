import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type {
    ISiswa,
    ISiswaTunggakan,
    ISiswaMonitoring,
    ISiswaMonitoringEntry,
    ISiswaMonitoringKelasItem,
    ICreateSiswa,
    IUpdateSiswa,
    IDaftarSiswa,
    IDaftarSiswaResponse,
    IKursusQuery,
    IImportResult,
    ApiResponse,
    ApiPaginatedResponse,
} from '@/@types/kursus.types'

const SiswaService = {
    async getAll(query?: IKursusQuery): Promise<ApiPaginatedResponse<ISiswa>> {
        const params = new URLSearchParams()
        if (query?.search) params.append('search', query.search)
        if (query?.aktif !== undefined) params.append('aktif', String(query.aktif))
        if (query?.page) params.append('page', String(query.page))
        if (query?.limit) params.append('limit', String(query.limit))

        const qs = params.toString()
        const url = qs
            ? `${API_ENDPOINTS.KURSUS.SISWA.BASE}?${qs}`
            : API_ENDPOINTS.KURSUS.SISWA.BASE

        return ApiService.fetchDataWithAxios<ApiPaginatedResponse<ISiswa>>({
            url,
            method: 'GET',
        })
    },

    async getTunggakan(): Promise<ApiResponse<ISiswaTunggakan[]>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ISiswaTunggakan[]>>({
            url: API_ENDPOINTS.KURSUS.SISWA.TUNGGAKAN,
            method: 'GET',
        })
    },

    async getById(id: string): Promise<ApiResponse<ISiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ISiswa>>({
            url: API_ENDPOINTS.KURSUS.SISWA.BY_ID(id),
            method: 'GET',
        })
    },

    async create(payload: ICreateSiswa): Promise<ApiResponse<ISiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ISiswa>, ICreateSiswa>({
            url: API_ENDPOINTS.KURSUS.SISWA.BASE,
            method: 'POST',
            data: payload,
        })
    },

    async update(id: string, payload: IUpdateSiswa): Promise<ApiResponse<ISiswa>> {
        return ApiService.fetchDataWithAxios<ApiResponse<ISiswa>, IUpdateSiswa>({
            url: API_ENDPOINTS.KURSUS.SISWA.BY_ID(id),
            method: 'PATCH',
            data: payload,
        })
    },

    async remove(id: string): Promise<ApiResponse<null>> {
        return ApiService.fetchDataWithAxios<ApiResponse<null>>({
            url: API_ENDPOINTS.KURSUS.SISWA.BY_ID(id),
            method: 'DELETE',
        })
    },

    async importExcel(file: File): Promise<ApiResponse<IImportResult>> {
        const formData = new FormData()
        formData.append('file', file)
        return ApiService.fetchDataWithAxios<ApiResponse<IImportResult>, FormData>({
            url: API_ENDPOINTS.KURSUS.SISWA.IMPORT,
            method: 'POST',
            data: formData,
        })
    },

    async daftar(payload: IDaftarSiswa): Promise<ApiResponse<IDaftarSiswaResponse>> {
        return ApiService.fetchDataWithAxios<ApiResponse<IDaftarSiswaResponse>, IDaftarSiswa>({
            url: API_ENDPOINTS.KURSUS.SISWA.DAFTAR,
            method: 'POST',
            data: payload,
        })
    },

    async downloadTemplate(): Promise<void> {
        const res = await ApiService.fetchDataWithAxios<Blob>({
            url: API_ENDPOINTS.KURSUS.SISWA.TEMPLATE,
            method: 'GET',
            responseType: 'blob',
        })
        const url = URL.createObjectURL(res)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Template_Import_Siswa.xlsx'
        a.click()
        URL.revokeObjectURL(url)
    },

    /**
     * Monitoring siswa: hitung berhenti (status=0) & akan habis (sesi_tersisa <= threshold)
     * Diproses client-side dari GET /kursus/siswa yang sudah include kelas[].
     */
    async getMonitoring(sessionThreshold = 5): Promise<ISiswaMonitoring> {
        const params = new URLSearchParams()
        params.append('limit', '500')
        params.append('aktif', '1')

        const res = await ApiService.fetchDataWithAxios<ApiPaginatedResponse<ISiswa>>({
            url: `${API_ENDPOINTS.KURSUS.SISWA.BASE}?${params.toString()}`,
            method: 'GET',
        })

        const berhenti: ISiswaMonitoringEntry[] = []
        const akan_habis: ISiswaMonitoringEntry[] = []

        for (const siswa of res.data ?? []) {
            const kelasList = siswa.kelas ?? []

            const kelasBerhenti = kelasList
                .filter((k) => k.aktif === 1 && k.status === 0)
                .map(
                    (k): ISiswaMonitoringKelasItem => ({
                        id_catat: k.id_catat,
                        id_kelas: k.id_kelas,
                        nama_kelas: k.nama_kelas,
                        total_sesi: k.total_sesi,
                        sesi_hadir: k.total_sesi_hadir,
                        sesi_tidak_hadir: k.total_sesi_tidak_hadir,
                        sesi_tersisa:
                            k.total_sesi !== null
                                ? Math.max(0, k.total_sesi - k.total_sesi_hadir - k.total_sesi_tidak_hadir)
                                : null,
                        status: k.status,
                    }),
                )

            const kelasAkanHabis = kelasList
                .filter((k) => {
                    if (k.aktif !== 1 || k.status !== 1 || k.total_sesi === null) return false
                    const tersisa = k.total_sesi - k.total_sesi_hadir - k.total_sesi_tidak_hadir
                    return tersisa <= sessionThreshold
                })
                .map(
                    (k): ISiswaMonitoringKelasItem => ({
                        id_catat: k.id_catat,
                        id_kelas: k.id_kelas,
                        nama_kelas: k.nama_kelas,
                        total_sesi: k.total_sesi,
                        sesi_hadir: k.total_sesi_hadir,
                        sesi_tidak_hadir: k.total_sesi_tidak_hadir,
                        sesi_tersisa: Math.max(
                            0,
                            k.total_sesi! - k.total_sesi_hadir - k.total_sesi_tidak_hadir,
                        ),
                        status: k.status,
                    }),
                )

            const entry: Omit<ISiswaMonitoringEntry, 'kelas'> = {
                id_siswa: siswa.id_siswa,
                nama_siswa: siswa.nama_siswa,
                email: siswa.email,
                telepon: siswa.telepon,
            }

            if (kelasBerhenti.length > 0) {
                berhenti.push({ ...entry, kelas: kelasBerhenti })
            }
            if (kelasAkanHabis.length > 0) {
                akan_habis.push({ ...entry, kelas: kelasAkanHabis })
            }
        }

        return { berhenti, akan_habis }
    },
}

export default SiswaService
