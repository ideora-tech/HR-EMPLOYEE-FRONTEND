// ─── Modul Types ──────────────────────────────────────────────────────────────

export interface IModul {
    id_modul: string
    kode_modul: string
    nama_modul: string
    deskripsi: string | null
    urutan: number
    aktif: number             // MySQL int: 0 | 1
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IModulCreate {
    kode_modul: string
    nama_modul: string
    deskripsi?: string | null
    urutan: number
    aktif: number
}

export type IModulUpdate = Partial<IModulCreate>

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

export interface IModulQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
}
