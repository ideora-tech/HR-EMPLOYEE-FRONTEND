export interface IPeranPengguna {
    id_peran: string
    kode_peran: string
    nama_peran: string
    is_sistem: number   // 1 = Owner
}

export interface IPengguna {
    id_pengguna: string
    id_perusahaan: string
    /** Username untuk login (dibuat otomatis dari nama saat akun dibuat) */
    username: string | null
    nama_pengguna: string
    email: string
    /** Karyawan yang terhubung — syarat login aplikasi coach memakai akun ini */
    id_karyawan: string | null
    nama_karyawan?: string | null
    /** Kode peran utama (kompatibilitas); daftar lengkap di peran_list */
    peran: string
    peran_list?: IPeranPengguna[]
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IPenggunaCreate {
    nama_pengguna: string
    /** Username login; kosong = dibuat otomatis dari nama */
    username?: string
    kata_sandi: string
    /** Satu pengguna boleh banyak peran */
    id_peran?: string[]
    /** Hanya untuk membuat akun SUPERADMIN */
    peran?: string
    aktif?: number
    id_karyawan?: string | null
}

export interface IPenggunaUpdate {
    nama_pengguna?: string
    username?: string
    kata_sandi?: string
    /** Mengganti seluruh peran pengguna */
    id_peran?: string[]
    aktif?: number
    /** null = lepaskan hubungan ke karyawan */
    id_karyawan?: string | null
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
