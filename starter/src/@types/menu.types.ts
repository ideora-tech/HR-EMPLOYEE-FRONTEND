// ─── Menu Types ───────────────────────────────────────────────────────────────
// Sesuai backend IMenuPublic (PUBLIC_COLS): id_menu, nama, icon, path,
// kode_modul, parent_id, urutan, aktif

export interface IMenu {
    id_menu: string
    nama_menu: string
    icon: string | null
    path: string | null
    kode_modul: string | null   // opsional — link ke modul; null = selalu tampil
    parent_id: string | null
    urutan: number
    aktif: number
}

// Sesuai CreateMenuDto (aktif tidak ada di create, backend hardcode aktif=1)
export interface IMenuCreate {
    nama_menu: string
    icon?: string | null
    path?: string | null
    kode_modul?: string | null
    parent_id?: string | null
    urutan?: number
}

// Sesuai UpdateMenuDto (aktif bisa diubah saat update)
export interface IMenuUpdate {
    nama_menu?: string
    icon?: string | null
    path?: string | null
    kode_modul?: string | null
    parent_id?: string | null
    urutan?: number
    aktif?: number
}

export interface IMenuQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
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
