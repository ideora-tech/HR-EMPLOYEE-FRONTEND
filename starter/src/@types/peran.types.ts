// ─── Peran Types ──────────────────────────────────────────────────────────────

export interface IPeran {
    id_peran: string
    /** Perusahaan pemilik peran; null = peran platform (mis. SUPERADMIN) */
    company_id: string | null
    kode_peran: string
    nama_peran: string
    aktif: number             // MySQL int: 0 | 1
    is_sistem: number         // 1 = Owner: bawaan, memegang semua izin paket, tidak bisa diubah/dihapus
    jumlah_pengguna?: number
    kode_izin?: string[]
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IPeranCreate {
    kode_peran: string
    nama_peran: string
    aktif?: number
    kode_izin?: string[]
}

/** Kode peran tidak bisa diubah setelah dibuat. */
export interface IPeranUpdate {
    nama_peran?: string
    aktif?: number
    kode_izin?: string[]
}

/** Satu baris katalog izin (GET /izin). Kode: `<menu>.<aksi>`. */
export interface IItemIzin {
    kode: string
    nama: string
    grup: string
    urutan: number
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

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

export interface IPeranQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
}
