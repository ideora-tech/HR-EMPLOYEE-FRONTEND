export interface IPeranPengguna {
    id_peran: string
    kode_peran: string
    nama_peran: string
    is_sistem: number   // 1 = Owner
}

export interface IPengguna {
    id_pengguna: string
    id_perusahaan: string
    nama_pengguna: string
    email: string
    /** Kode peran utama (kompatibilitas); daftar lengkap di peran_list */
    peran: string
    peran_list?: IPeranPengguna[]
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IPenggunaCreate {
    nama_pengguna: string
    kata_sandi: string
    /** Satu pengguna boleh banyak peran */
    id_peran?: string[]
    /** Hanya untuk membuat akun SUPERADMIN */
    peran?: string
    aktif?: number
}

export interface IPenggunaUpdate {
    nama_pengguna?: string
    kata_sandi?: string
    /** Mengganti seluruh peran pengguna */
    id_peran?: string[]
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
