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
    kode: string
    nama: string
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    departemen_induk: { id_departemen: string; nama: string } | null
}

export interface ICreateDepartemen {
    kode: string
    nama: string
    deskripsi?: string
    id_departemen_induk?: string
}

export type IUpdateDepartemen = Partial<ICreateDepartemen> & { aktif?: 0 | 1 }

// ─── Jabatan ──────────────────────────────────────────────────────────────────
export interface IJabatan {
    id_jabatan: string
    id_departemen: string | null
    kode: string
    nama: string
    level: number | null
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    departemen: { id_departemen: string; nama: string } | null
}

export interface ICreateJabatan {
    id_departemen?: string
    kode: string
    nama: string
    level?: number
    deskripsi?: string
}

export type IUpdateJabatan = Partial<ICreateJabatan> & { aktif?: 0 | 1 }

// ─── Lokasi Kantor ────────────────────────────────────────────────────────────
export interface ILokasiKantor {
    id_lokasi: string
    kode: string
    nama: string
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
    kode: string
    nama: string
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
    nama: string
    foto_url: string | null
    status_kepegawaian: string
}

export interface IOrgChartJabatan {
    id_jabatan: string
    kode: string
    nama: string
    level: number | null
    karyawan: IOrgChartKaryawan[]
}

export interface IOrgChartDepartemen {
    id_departemen: string
    id_departemen_induk: string | null
    kode: string
    nama: string
    jabatan: IOrgChartJabatan[]
    sub_departemen: IOrgChartDepartemen[]
}

export interface IOrgChartStruktur {
    departemen: IOrgChartDepartemen[]
    karyawan_tanpa_departemen: IOrgChartKaryawan[]
    total_karyawan: number
    total_departemen: number
}
