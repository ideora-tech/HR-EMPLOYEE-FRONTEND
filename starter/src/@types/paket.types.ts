// ─── Paket Types ─────────────────────────────────────────────────────────────

export type KodePaket = string

export interface IPaket {
    id_paket: string
    kode_paket: KodePaket
    nama_paket: string
    harga: number
    maks_karyawan: number
    aktif: number             // MySQL int: 0 | 1
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IPaketCreate {
    kode_paket: KodePaket
    nama_paket: string
    harga: number
    maks_karyawan: number
    aktif: number
}

export type IPaketUpdate = Partial<IPaketCreate>

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

export interface IPaketQuery {
    search?: string
    kode_paket?: KodePaket
    nama_paket?: string
    aktif?: number
    page?: number
    limit?: number
}
