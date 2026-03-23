// ─── API Response Wrapper (reused pattern) ────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    timestamp: string
}

export interface IPaginationMeta {
    total: number
    page: number
    limit: number
    totalPages?: number
}

export interface ApiPaginatedResponse<T> {
    success: boolean
    message: string
    data: T[]
    meta: IPaginationMeta
    timestamp: string
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface IKaryawanQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
}

// ─── Karyawan ─────────────────────────────────────────────────────────────────

export type StatusKepegawaian = 'TETAP' | 'KONTRAK' | 'PROBASI' | 'MAGANG'

export interface IKaryawan {
    id_karyawan: string
    id_perusahaan: string
    nik: string | null
    nama: string
    email: string | null
    telepon: string | null
    tanggal_lahir: string | null       // "YYYY-MM-DD"
    jenis_kelamin: 1 | 2 | null        // 1 = Laki-laki, 2 = Perempuan
    alamat: string | null
    foto_url: string | null
    tanggal_masuk: string | null       // "YYYY-MM-DD"
    tanggal_keluar: string | null      // "YYYY-MM-DD"
    status_kepegawaian: StatusKepegawaian | null
    aktif: number                      // 1 = aktif, 0 = nonaktif
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateKaryawan {
    nik?: string
    nama: string
    email?: string
    telepon?: string
    tanggal_lahir?: string
    jenis_kelamin?: 1 | 2
    alamat?: string
    foto_url?: string
    tanggal_masuk?: string
    tanggal_keluar?: string
    status_kepegawaian?: StatusKepegawaian
}

export type IUpdateKaryawan = Partial<ICreateKaryawan> & { aktif?: 0 | 1 }

// ─── Import Excel Result ───────────────────────────────────────────────────────

export interface IImportKaryawanResult {
    berhasil: number
    gagal: number
    errors: string[]
}
