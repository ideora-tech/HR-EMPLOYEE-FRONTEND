// ─── Query Params ─────────────────────────────────────────────────────────────
export interface IOrganisasiQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
    id_departemen?: string
}

// ─── Departemen ───────────────────────────────────────────────────────────────
export interface IDepartemen {
    id_departemen: string
    id_departemen_induk: string | null
    kode_departemen: string
    nama_departemen: string
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    departemen_induk: { id_departemen: string; nama_departemen: string } | null
}

export interface ICreateDepartemen {
    kode_departemen: string
    nama_departemen: string
    deskripsi?: string
    id_departemen_induk?: string
}

export type IUpdateDepartemen = Partial<ICreateDepartemen> & { aktif?: 0 | 1 }

// ─── Jabatan ──────────────────────────────────────────────────────────────────
export interface IJabatan {
    id_jabatan: string
    id_departemen: string | null
    kode_jabatan: string
    nama_jabatan: string
    level: number | null
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    departemen: { id_departemen: string; nama_departemen: string } | null
}

export interface ICreateJabatan {
    id_departemen?: string
    kode_jabatan: string
    nama_jabatan: string
    level?: number
    deskripsi?: string
}

export type IUpdateJabatan = Partial<ICreateJabatan> & { aktif?: 0 | 1 }

// ─── Lokasi Kantor ────────────────────────────────────────────────────────────
export interface ILokasiKantor {
    id_lokasi: string
    kode_lokasi: string
    nama_lokasi: string
    alamat: string | null
    kota: string | null
    provinsi: string | null
    kode_pos: string | null
    telepon: string | null
    radius?: number | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateLokasiKantor {
    kode_lokasi: string
    nama_lokasi: string
    alamat?: string
    kota?: string
    provinsi?: string
    kode_pos?: string
    telepon?: string
}

export type IUpdateLokasiKantor = Partial<ICreateLokasiKantor> & { aktif?: 0 | 1 }

// ─── Org Chart (Struktur Organisasi) ─────────────────────────────────────────
export interface IOrgChartKaryawan {
    id_karyawan: string
    id_jabatan: string | null
    nik: string
    nama_karyawan: string
    foto_url: string | null
    status_kepegawaian: string
}

export interface IOrgChartJabatan {
    id_jabatan: string
    kode_jabatan: string
    nama_jabatan: string
    level: number | null
    karyawan: IOrgChartKaryawan[]
}

export interface IOrgChartDepartemen {
    id_departemen: string
    id_departemen_induk: string | null
    kode_departemen: string
    nama_departemen: string
    jabatan: IOrgChartJabatan[]
    sub_departemen: IOrgChartDepartemen[]
}

export interface IOrgChartStruktur {
    departemen: IOrgChartDepartemen[]
    karyawan_tanpa_departemen: IOrgChartKaryawan[]
    total_karyawan: number
    total_departemen: number
}
