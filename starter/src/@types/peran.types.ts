// ─── Peran Types ──────────────────────────────────────────────────────────────

export interface IPeran {
    id_peran: string
    kode_peran: string
    nama_peran: string
    aktif: number             // MySQL int: 0 | 1
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IPeranCreate {
    kode_peran: string
    nama_peran: string
    aktif?: number
}

export type IPeranUpdate = Partial<IPeranCreate>

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
