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
    week_start?: string
    week_end?: string
}

// ─── Siswa ────────────────────────────────────────────────────────────────────

export interface ISiswa {
    id_siswa: string
    nama: string
    email: string | null
    telepon: string | null
    tanggal_lahir: string | null   // ISO date string: "2000-01-15"
    alamat: string | null
    jenis_kelamin: number | null   // 1 = Laki-laki, 2 = Perempuan
    foto_url: string | null
    aktif: number                  // 1 = aktif, 0 = nonaktif
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateSiswa {
    nama: string
    email?: string
    telepon?: string
    tanggal_lahir?: string         // "YYYY-MM-DD"
    alamat?: string
    jenis_kelamin?: 1 | 2
    foto_url?: string
}

export type IUpdateSiswa = Partial<ICreateSiswa> & { aktif?: 0 | 1 }

export interface ISiswaMonitoringKelas {
    id_daftar: string
    id_jadwal: string
    nama_jadwal: string
    tanggal_selesai: string
    status_daftar: number
    hari_tersisa: number | null
}

export interface ISiswaMonitoringEntry {
    id_siswa: string
    nama: string
    email: string | null
    telepon: string | null
    kelas: ISiswaMonitoringKelas[]
}

export interface ISiswaMonitoring {
    berhenti: ISiswaMonitoringEntry[]
    akan_expired: ISiswaMonitoringEntry[]
}

// ─── Tingkat Program ──────────────────────────────────────────────────────────

export interface ITingkatProgram {
    id_tingkat: string
    kode: string                   // contoh: "PEMULA", "MENENGAH", "MAHIR"
    nama: string                   // contoh: "Pemula", "Menengah", "Mahir"
    urutan: number
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateTingkatProgram {
    kode: string                   // format: A-Z0-9_
    nama: string
    urutan?: number
}

export type IUpdateTingkatProgram = Partial<ICreateTingkatProgram> & { aktif?: 0 | 1 }

// ─── Program Pengajaran ───────────────────────────────────────────────────────

export interface IProgramPengajaran {
    id_program: string
    kode_program: string           // format: A-Z0-9_ (contoh: "TARI_BALI_01")
    nama: string
    deskripsi: string | null
    tingkat: string | null         // kode dari master data tingkat_program
    durasi_menit: number           // default: 60
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateProgramPengajaran {
    kode_program: string
    nama: string
    deskripsi?: string
    tingkat?: string               // kode dari GET /kursus/tingkat-program
    durasi_menit?: number
}

export type IUpdateProgramPengajaran = Partial<ICreateProgramPengajaran> & { aktif?: 0 | 1 }

// ─── Tarif ────────────────────────────────────────────────────────────────────

export interface ITarif {
    id_tarif: string
    id_program: string
    nama: string
    jenis: 'PER_SESI' | 'PAKET'
    jumlah_pertemuan: number | null  // hanya untuk jenis PAKET
    harga: string                    // DECIMAL dari MySQL → string, parse dengan parseFloat()
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateTarif {
    id_program: string
    nama: string
    jenis: 'PER_SESI' | 'PAKET'
    harga: number
    jumlah_pertemuan?: number
}

export type IUpdateTarif = Partial<ICreateTarif> & { aktif?: 0 | 1 }

// ─── Jadwal Kelas ─────────────────────────────────────────────────────────────

export interface IJadwalKelas {
    id_jadwal: string
    id_program: string
    nama: string
    instruktur: string | null
    lokasi: string | null
    kuota: number
    aktif: number
    tanggal_mulai: string   // ISO datetime "YYYY-MM-DDTHH:MM:00" (jam mulai tertanam)
    tanggal_selesai: string // ISO datetime "YYYY-MM-DDTHH:MM:00" (jam selesai tertanam)
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IKuotaJadwal {
    kuota: number
    terisi: number
    sisa: number
}

export interface ICreateJadwalKelas {
    id_program: string
    nama: string
    tanggal_mulai: string   // "YYYY-MM-DD"
    tanggal_selesai: string // "YYYY-MM-DD"
    jam_mulai: string       // "HH:MM"
    jam_selesai: string     // "HH:MM"
    instruktur?: string
    lokasi?: string
    kuota?: number
}

export interface IUpdateJadwalKelas {
    id_program?: string
    nama?: string
    tanggal_mulai?: string   // "YYYY-MM-DD HH:MM:SS" (combined datetime)
    tanggal_selesai?: string // "YYYY-MM-DD HH:MM:SS" (combined datetime)
    instruktur?: string
    lokasi?: string
    kuota?: number
    aktif?: 0 | 1
}

// ─── Daftar Kelas ─────────────────────────────────────────────────────────────

export interface IDaftarKelas {
    id_daftar: string
    tanggal_daftar: string
    status: 1 | 2 | 3               // 1=Aktif, 2=Selesai, 3=Berhenti
    catatan: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    siswa: {
        id_siswa: string
        nama: string
        email: string | null
        telepon: string | null
    }
    jadwal: {
        id_jadwal: string
        nama: string
        hari: number
        jam_mulai: string
        jam_selesai: string
        instruktur: string | null
        lokasi: string | null
        program: {
            id_program: string
            nama: string
            kode_program: string
        }
    }
    tarif: {
        id_tarif: string
        nama: string
        jenis: 'PER_SESI' | 'PAKET'
        harga: string
    } | null
}

export interface ICreateDaftarKelas {
    id_siswa: string
    id_jadwal: string
    tanggal_daftar: string          // "YYYY-MM-DD"
    id_tarif?: string
    status?: 1 | 2 | 3
    catatan?: string
}

export interface IUpdateDaftarKelas {
    status?: 1 | 2 | 3
    catatan?: string
    id_tarif?: string
    aktif?: 0 | 1
}

// ─── Presensi ─────────────────────────────────────────────────────────────────
// Keterangan: 1=Hadir, 2=Izin, 3=Sakit, 4=Alpha

export interface IPresensi {
    id_presensi: string
    status: 1 | 2 | 3 | 4
    catatan: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    daftar?: { id_daftar: string }
    siswa?: {
        id_siswa: string
        nama: string
        email?: string | null
        telepon?: string | null
    }
    jadwal: {
        id_jadwal: string
        nama: string
        tanggal_mulai: string     // "YYYY-MM-DD HH:MM:SS"
        tanggal_selesai: string   // "YYYY-MM-DD HH:MM:SS"
        // fields below may not be returned by the API (legacy compat)
        hari?: number
        jam_mulai?: string
        jam_selesai?: string
        instruktur?: string | null
        program?: { id_program: string; nama: string }
    }
}

/** Entry dari GET /kursus/presensi/jadwal/:id_jadwal */
export interface IPresensiJadwalEntry {
    id_daftar: string
    siswa: {
        id_siswa: string
        nama: string
        email: string | null
        telepon: string | null
    }
    presensi: {
        id_presensi: string
        status: 1 | 2 | 3 | 4
        catatan: string | null
    } | null
}

export interface IPresensiDetail {
    id_detail: string
    id_presensi: string
    keterangan: 1 | 2 | 3 | 4    // 1=Hadir, 2=Izin, 3=Sakit, 4=Alpha
    catatan: string | null
    siswa: {
        id_siswa: string
        nama: string
        telepon: string | null
    }
    daftar: {
        id_daftar: string
        tanggal_daftar: string
    }
}

export interface IPresensiWithDetail extends IPresensi {
    detail: IPresensiDetail[]
}

export interface ICreatePresensi {
    id_daftar: string
    status: 1 | 2 | 3 | 4
    catatan?: string | null
}

export interface ICreateBatchPresensi {
    id_jadwal: string
    items: Array<{ id_daftar: string; status: 1 | 2 | 3 | 4; catatan?: string | null }>
}

export type IUpdatePresensi = { catatan?: string }

export interface IPresensiQuery {
    id_jadwal?: string
    bulan?: string                // "YYYY-MM"
    page?: number
    limit?: number
}

// ─── Tagihan ──────────────────────────────────────────────────────────────────
// status: 1=MENUNGGU, 2=SEBAGIAN, 3=LUNAS, 4=DIBATALKAN
// jenis: "PAKET" | "BULANAN" | "LAINNYA"

export interface ITagihan {
    id_tagihan: string
    jenis: 'PAKET' | 'BULANAN' | 'LAINNYA'
    periode: string | null          // "YYYY-MM"
    jumlah_sesi: number | null
    total_harga: number
    total_bayar: number
    status: 1 | 2 | 3 | 4
    catatan: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    siswa: {
        id_siswa: string
        nama: string
        email: string | null
        telepon: string | null
    }
}

export interface ICreateTagihan {
    id_siswa: string
    jenis: 'PAKET' | 'BULANAN' | 'LAINNYA'
    periode?: string | null
    jumlah_sesi?: number | null
    total_harga: number
    catatan?: string | null
}

export interface IUpdateTagihan {
    jenis?: 'PAKET' | 'BULANAN' | 'LAINNYA'
    periode?: string | null
    jumlah_sesi?: number | null
    total_harga?: number
    status?: 1 | 2 | 3 | 4
    catatan?: string | null
    aktif?: number
}

export interface ITagihanQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
}

// ─── Pembayaran ───────────────────────────────────────────────────────────────
// metode: "TUNAI" | "TRANSFER" | "QRIS"

export interface IPembayaran {
    id_pembayaran: string
    id_tagihan: string
    jumlah: number
    tanggal_bayar: string           // "YYYY-MM-DD"
    metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
    referensi: string | null
    catatan: string | null
    dibuat_pada: string
    diubah_pada: string | null
    tagihan: {
        id_tagihan: string
        jenis: 'PAKET' | 'BULANAN' | 'LAINNYA'
        periode: string | null
        total_harga: number
        total_bayar: number
        status: 1 | 2 | 3 | 4
    }
}

export interface ICreatePembayaran {
    id_tagihan: string
    jumlah: number
    tanggal_bayar: string           // "YYYY-MM-DD"
    metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
    referensi?: string | null
    catatan?: string | null
}

export interface IPembayaranQuery {
    search?: string
    page?: number
    limit?: number
}

