// ─── API Response Wrapper (reused pattern) ────────────────────────────────────

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

export interface IKaryawanQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
}

// ─── Karyawan ─────────────────────────────────────────────────────────────────

export type StatusKepegawaian = 'TETAP' | 'KONTRAK' | 'PROBASI' | 'MAGANG'
export type StatusPajak =
    | 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3'
    | 'K/0' | 'K/1' | 'K/2' | 'K/3'
    | 'K/I/0' | 'K/I/1' | 'K/I/2' | 'K/I/3'

export interface IKaryawan {
    id_karyawan: string
    id_perusahaan: string
    id_jabatan: string | null
    id_departemen: string | null
    nik: string | null
    nama_karyawan: string
    email: string | null
    telepon: string | null
    tanggal_lahir: string | null
    jenis_kelamin: 1 | 2 | null
    alamat: string | null
    foto_url: string | null
    tanggal_masuk: string | null
    tanggal_keluar: string | null
    tanggal_mulai_kontrak: string | null
    tanggal_akhir_kontrak: string | null
    gaji_pokok: number | null
    nama_bank: string | null
    no_rekening: string | null
    nama_pemilik_rekening: string | null
    npwp: string | null
    status_pajak: StatusPajak | null
    status_kepegawaian: StatusKepegawaian | null
    no_bpjs_kesehatan: string | null
    no_bpjs_ketenagakerjaan: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    jabatan: { id_jabatan: string; nama_jabatan: string; level: number | null } | null
    departemen: { id_departemen: string; nama_departemen: string } | null
}

export interface ICreateKaryawan {
    nik?: string
    nama_karyawan: string
    email?: string
    telepon?: string
    tanggal_lahir?: string
    jenis_kelamin?: 1 | 2
    alamat?: string
    foto_url?: string
    id_jabatan?: string | null
    id_departemen?: string | null
    tanggal_masuk?: string
    tanggal_keluar?: string
    tanggal_mulai_kontrak?: string
    tanggal_akhir_kontrak?: string
    gaji_pokok?: number
    nama_bank?: string
    no_rekening?: string
    nama_pemilik_rekening?: string
    npwp?: string
    status_pajak?: StatusPajak
    status_kepegawaian?: StatusKepegawaian
    no_bpjs_kesehatan?: string
    no_bpjs_ketenagakerjaan?: string
}

export type IUpdateKaryawan = Partial<ICreateKaryawan> & { aktif?: 0 | 1 }

export interface ILokasiKaryawan {
    id_lokasi: string
    kode_lokasi: string
    nama_lokasi: string
    alamat: string | null
    kota: string | null
    provinsi: string | null
    radius: number | null
    aktif: number
}

// ─── Import Excel Result ───────────────────────────────────────────────────────

export interface IImportKaryawanResult {
    berhasil: number
    gagal: number
    errors: string[]
}
