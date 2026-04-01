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

// ─── Import Result ────────────────────────────────────────────────────────────

export interface IImportResult {
    berhasil: number
    gagal: number
    errors: string[]
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface IKursusQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
}

// ─── Kelas ────────────────────────────────────────────────────────────────────
// Table: kursus_kelas | PK: id_kelas (UUID)

export interface IKelas {
    id_kelas: string               // UUID
    nama_kelas: string
    deskripsi: string | null
    aktif: number                  // 1 = aktif, 0 = nonaktif
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateKelas {
    nama_kelas: string
    deskripsi?: string
    aktif?: 0 | 1
}

export type IUpdateKelas = Partial<ICreateKelas>

// ─── Paket ────────────────────────────────────────────────────────────────────
// Table: kursus_paket | PK: id_paket (UUID) | FK: id_kelas

export interface IPaket {
    id_paket: string               // UUID
    id_kelas: string
    nama_kelas?: string            // joined dari kelas
    nama_paket: string
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreatePaket {
    id_kelas: string
    nama_paket: string
    deskripsi?: string
    aktif?: 0 | 1
}

export type IUpdatePaket = Partial<ICreatePaket>

// ─── Kategori Umur ────────────────────────────────────────────────────────────
// Table: kursus_kategori_umur | PK: id_kategori_umur (UUID) | FK: id_paket, id_kelas

export interface IKategoriUmur {
    id_kategori_umur: string       // UUID
    id_kelas: string
    id_paket: string
    nama_kelas?: string            // joined
    nama_paket?: string            // joined
    nama_kategori_umur: string     // contoh: "3-6 Tahun", "7-12 Tahun"
    durasi: number | null          // durasi dalam bulan
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateKategoriUmur {
    id_kelas: string
    id_paket: string
    nama_kategori_umur: string
    durasi?: number
    deskripsi?: string
    aktif?: 0 | 1
}

export type IUpdateKategoriUmur = Partial<ICreateKategoriUmur>

// ─── Biaya ────────────────────────────────────────────────────────────────────
// Table: kursus_biaya | PK: id_biaya (UUID) | FK: id_kategori_umur, id_paket, id_kelas

export type JenisBiaya = 'PENDAFTARAN' | 'BULANAN' | 'LAINNYA'

export interface IBiaya {
    id_biaya: string               // UUID
    id_kelas: string
    id_paket: string
    id_kategori_umur: string
    nama_kelas?: string            // joined
    nama_paket?: string            // joined
    nama_kategori_umur?: string    // joined
    jenis_biaya: JenisBiaya
    nama_biaya: string             // contoh: "Biaya Bulanan"
    harga_biaya: number            // integer rupiah
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateBiaya {
    id_kelas?: string
    id_paket?: string
    id_kategori_umur?: string
    jenis_biaya: JenisBiaya
    nama_biaya: string
    harga_biaya: number
    deskripsi?: string
    aktif?: 0 | 1
}

export type IUpdateBiaya = Partial<ICreateBiaya>

// ─── Diskon ───────────────────────────────────────────────────────────────────
// Table: kursus_diskon | PK: id_diskon (UUID)

export interface IDiskon {
    id_diskon: string              // UUID
    kode_diskon: string            // unik, maks 20 karakter
    nama_diskon: string
    persentase: number | null      // 0-100, decimal
    harga: number | null           // diskon nominal (rupiah)
    berlaku_mulai: string | null   // "YYYY-MM-DD"
    berlaku_sampai: string | null  // "YYYY-MM-DD"
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateDiskon {
    kode_diskon: string
    nama_diskon: string
    persentase?: number
    harga?: number
    berlaku_mulai?: string
    berlaku_sampai?: string
    deskripsi?: string
    aktif?: 0 | 1
}

export type IUpdateDiskon = Partial<ICreateDiskon>

// ─── Jadwal Kelas ─────────────────────────────────────────────────────────────
// Table: kursus_jadwal_kelas | PK: id_jadwal_kelas (UUID)

export interface IJadwalKelas {
    id_jadwal_kelas: string        // UUID
    id_kelas: string
    nama_kelas: string
    id_karyawan: string
    nama_karyawan: string
    id_kategori_umur: string
    nama_kategori_umur: string
    hari: string                   // "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu"
    jam_mulai: string              // "HH:MM"
    jam_selesai: string            // "HH:MM"
    tanggal_mulai: string          // "YYYY-MM-DD"
    tanggal_selesai: string        // "YYYY-MM-DD"
    sesi_pertemuan: number
    deskripsi: string | null
    aktif: number
    dibuat_pada?: string
    diubah_pada?: string | null
}

export interface ICreateJadwalKelas {
    id_kelas: string
    id_karyawan: string
    id_kategori_umur: string
    hari: string
    jam_mulai: string              // "HH:MM"
    jam_selesai: string            // "HH:MM"
    tanggal_mulai: string          // "YYYY-MM-DD" atau DATETIME
    tanggal_selesai: string        // "YYYY-MM-DD" atau DATETIME
    sesi_pertemuan: number
    deskripsi?: string
    aktif?: 0 | 1
}

export type IUpdateJadwalKelas = Partial<ICreateJadwalKelas>

// ─── Siswa ────────────────────────────────────────────────────────────────────

export interface ISiswa {
    id_siswa: string
    nama_siswa: string
    email: string | null
    telepon: string | null
    tanggal_lahir: string | null   // "YYYY-MM-DD"
    alamat: string | null
    jenis_kelamin: number | null   // 1 = Laki-laki, 2 = Perempuan
    foto_url: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ISiswaTunggakan {
    id_siswa: string
    nama_siswa: string
    email: string | null
    telepon: string | null
    jumlah_tagihan_belum_lunas: number
    total_tunggakan: number
}

export interface ICreateSiswa {
    nama_siswa: string
    email?: string
    telepon?: string
    tanggal_lahir?: string         // "YYYY-MM-DD"
    alamat?: string
    jenis_kelamin?: 1 | 2
    foto_url?: string
}

export type IUpdateSiswa = Partial<ICreateSiswa> & { aktif?: 0 | 1 }

// ─── Tagihan ──────────────────────────────────────────────────────────────────
// Table: kursus_tagihan | PK: id_tagihan (UUID)
// Status: 1=MENUNGGU, 2=SEBAGIAN, 3=LUNAS, 4=DIBATALKAN

export interface ITagihan {
    id_tagihan: string
    id_siswa: string
    nama_siswa: string
    id_biaya: string
    nama_biaya: string
    id_kategori_umur: string
    nama_kategori_umur: string
    id_paket: string
    nama_paket: string
    id_kelas: string
    nama_kelas: string
    periode: string | null         // "YYYY-MM"
    sesi_pertemuan: number | null
    total_harga: number
    total_bayar: number
    status: 1 | 2 | 3 | 4
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateTagihan {
    id_siswa: string
    id_biaya: string
    id_kategori_umur: string
    id_paket: string
    id_kelas: string
    periode?: string               // "YYYY-MM"
    sesi_pertemuan?: number
    total_harga: number
    deskripsi?: string
}

export interface IUpdateTagihan {
    periode?: string | null
    sesi_pertemuan?: number | null
    total_harga?: number
    status?: 1 | 2 | 3 | 4
    deskripsi?: string | null
    aktif?: number
}

export interface ITagihanQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
}

// ─── Pembayaran ───────────────────────────────────────────────────────────────
// Table: kursus_pembayaran | PK: id_pembayaran (UUID)
// Metode: "TUNAI" | "TRANSFER" | "QRIS"

export interface IPembayaran {
    id_pembayaran: string
    id_tagihan: string
    jumlah: number
    tanggal_bayar: string          // "YYYY-MM-DD"
    metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
    referensi: string | null
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    tagihan?: {
        id_tagihan: string
        nama_siswa: string
        total_harga: number
        total_bayar: number
        status: 1 | 2 | 3 | 4
    }
}

export interface ICreatePembayaran {
    id_tagihan: string
    jumlah: number
    tanggal_bayar: string          // "YYYY-MM-DD"
    metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
    referensi?: string | null
    deskripsi?: string | null
    aktif?: 0 | 1
}

export interface IPembayaranQuery {
    search?: string
    page?: number
    limit?: number
}

// ─── Dashboard Kursus ─────────────────────────────────────────────────────────

export interface IKursusDashboardPendapatan {
    bulan: string
    total: number
}

export interface IKursusDashboardSiswaKelas {
    nama_kelas: string
    jumlah: number
}

export interface IKursusDashboardJadwal {
    id_jadwal_kelas: string
    id_kelas: string
    nama_kelas: string
    nama_karyawan: string
    hari: string
    jam_mulai: string
    jam_selesai: string
    sesi_pertemuan: number
}

export interface IKursusDashboardPembayaran {
    id_pembayaran: string
    nama_siswa: string
    jumlah: number
    metode: string
    tanggal_bayar: string
}

export interface IKursusDashboard {
    siswa_aktif: number
    kelas_hari_ini: number
    pendapatan_bulan_ini: number
    tagihan_belum_lunas: number
    pendapatan_6_bulan: IKursusDashboardPendapatan[]
    siswa_per_kelas: IKursusDashboardSiswaKelas[]
    jadwal_hari_ini: IKursusDashboardJadwal[]
    pembayaran_terbaru: IKursusDashboardPembayaran[]
}

