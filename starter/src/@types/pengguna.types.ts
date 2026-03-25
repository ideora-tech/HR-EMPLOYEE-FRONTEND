export interface IPengguna {
    id_pengguna: string
    id_perusahaan: string
    nama_pengguna: string
    email: string
    peran: string
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IPenggunaCreate {
    nama_pengguna: string
    kata_sandi: string
    peran: string
    aktif?: number
}

export interface IPenggunaUpdate {
    nama_pengguna?: string
    kata_sandi?: string
    peran?: string
    aktif?: number
}

export interface IPenggunaQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export interface ApiPaginatedResponse<T> {
    success: boolean
    message: string
    data: T[]
    meta?: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}
