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
    sum_total_harga?: number
    sum_total_bayar?: number
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
// Table: kursus_kelas | PK: id_kelas (UUID) | FK: id_paket (opsional)

export interface IKelas {
    id_kelas: string               // UUID
    id_paket: string | null        // FK opsional ke kursus_paket
    nama_kelas: string
    nama_paket: string | null      // auto-resolve dari id_paket
    deskripsi: string | null
    aktif: number                  // 1 = aktif, 0 = nonaktif
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateKelas {
    nama_kelas: string
    id_paket?: string              // UUID paket — nama_paket auto-resolve
    deskripsi?: string
    aktif?: 0 | 1
}

export type IUpdateKelas = Partial<ICreateKelas>

// ─── Paket ────────────────────────────────────────────────────────────────────
// Table: kursus_paket | PK: id_paket (UUID)

export interface IPaket {
    id_paket: string               // UUID
    nama_paket: string
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreatePaket {
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
    id_paket: string | null        // opsional — bisa null jika tidak terikat paket
    nama_kelas?: string            // joined
    nama_paket?: string            // joined
    nama_kategori_umur: string     // contoh: "3-6 Tahun", "7-12 Tahun"
    sesi_pertemuan: number | null  // jumlah sesi pertemuan
    durasi: number | null          // durasi dalam bulan
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateKategoriUmur {
    id_kelas: string
    id_paket?: string              // opsional
    nama_kategori_umur: string
    sesi_pertemuan?: number
    durasi?: number
    deskripsi?: string
    aktif?: 0 | 1
}

export type IUpdateKategoriUmur = Partial<ICreateKategoriUmur>

// ─── Biaya ────────────────────────────────────────────────────────────────────
// Table: kursus_biaya | PK: id_biaya (UUID) | FK: id_kategori_umur, id_paket, id_kelas

export type JenisBiaya = 'PENDAFTARAN' | 'KELAS' | 'LAINNYA'

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
    periode?: string                // contoh: "2026-04"
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
    periode?: string
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

export interface IJadwalKelasQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
    tanggal?: string      // YYYY-MM-DD — filter jadwal aktif pada tanggal ini
    week_start?: string   // YYYY-MM-DD — filter jadwal mulai dari tanggal ini
    week_end?: string     // YYYY-MM-DD — filter jadwal sampai tanggal ini
}

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
    kuota: number
    kuota_terpakai: number
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
    kuota: number
    deskripsi?: string
    aktif?: 0 | 1
}

export type IUpdateJadwalKelas = Partial<ICreateJadwalKelas>

// ─── Siswa ────────────────────────────────────────────────────────────────────

// Kelas yang sedang/sudah diikuti siswa (nested di dalam ISiswa)
export interface ISiswaKelasItem {
    id_catat: string
    id_kelas: string
    nama_kelas: string
    id_jadwal_kelas: string | null
    total_sesi: number | null      // target total sesi
    total_sesi_hadir: number
    total_sesi_tidak_hadir: number
    aktif: number
    status: 0 | 1                  // 1=berjalan, 0=selesai/sesi habis
    is_trial: number               // 0=reguler, 1=trial
    mulai_kelas: string | null
    hari: string | null
    jam_mulai: string | null
    jam_selesai: string | null
    nama_karyawan: string | null
}

export interface ISiswa {
    id_siswa: string
    nama_siswa: string
    nama_panggilan: string | null
    email: string | null
    telepon: string | null
    tanggal_lahir: string | null   // "YYYY-MM-DD"
    alamat: string | null
    jenis_kelamin: number | null   // 1 = Laki-laki, 2 = Perempuan
    foto_url: string | null
    pendidikan: string | null
    sekolah_pekerjaan: string | null
    instagram: string | null
    kontak_utama_nama: string | null
    kontak_utama_relasi: string | null
    aktif: number
    status_pendaftaran?: number
    dibuat_pada: string
    diubah_pada: string | null
    kelas?: ISiswaKelasItem[]      // diisi saat GET /kursus/siswa
}

// Monitoring per-siswa (computed client-side)
export interface ISiswaMonitoringKelasItem {
    id_catat: string
    id_kelas: string
    nama_kelas: string
    total_sesi: number | null
    sesi_hadir: number
    sesi_tidak_hadir: number
    sesi_tersisa: number | null    // total_sesi - (hadir + tidak_hadir)
    status: 0 | 1
}

export interface ISiswaMonitoringEntry {
    id_siswa: string
    nama_siswa: string
    email: string | null
    telepon: string | null
    kelas: ISiswaMonitoringKelasItem[]
}

export interface ISiswaMonitoring {
    berhenti: ISiswaMonitoringEntry[]    // kelas status=0
    akan_habis: ISiswaMonitoringEntry[]  // sesi_tersisa <= threshold
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
    nama_panggilan?: string
    email?: string
    telepon?: string
    tanggal_lahir?: string         // "YYYY-MM-DD"
    alamat?: string
    jenis_kelamin?: 1 | 2
    foto_url?: string
    pendidikan?: string
    sekolah_pekerjaan?: string
    instagram?: string
    kontak_utama_nama?: string
    kontak_utama_relasi?: string
}

export type IUpdateSiswa = Partial<ICreateSiswa> & { aktif?: 0 | 1; status_pendaftaran?: number }

// Pendaftaran one-shot: siswa + tagihan sekaligus
export interface IDaftarSiswaItem {
    id_biaya: string
    id_jadwal_kelas?: string
    periode?: string               // "YYYY-MM"
}

export interface IDaftarSiswa {
    nama_siswa: string
    nama_panggilan?: string
    email?: string
    telepon?: string
    tanggal_lahir?: string         // "YYYY-MM-DD"
    alamat?: string
    jenis_kelamin?: 1 | 2
    foto_url?: string
    pendidikan?: string
    sekolah_pekerjaan?: string
    instagram?: string
    kontak_utama_nama?: string
    kontak_utama_relasi?: string
    tagihan?: IDaftarSiswaItem[]
    id_diskon?: string
    kode_diskon?: string
    is_trial?: number
    id_jadwal_kelas_trial?: string
}

export interface IDaftarSiswaResponse {
    siswa: ISiswa
    tagihan: ITagihan | null
    diskon_diterapkan: boolean
    total_sebelum_diskon: number
    total_setelah_diskon: number
}

// ─── Tagihan ──────────────────────────────────────────────────────────────────
// Table: kursus_tagihan | PK: id_tagihan (UUID)
// Status: 1=MENUNGGU, 2=SEBAGIAN, 3=LUNAS, 4=DIBATALKAN

export interface ITagihanDetailItem {
    id_detail: string
    id_tagihan: string
    id_biaya: string
    nama_biaya: string
    id_kelas: string | null
    nama_kelas: string | null
    id_paket: string | null
    nama_paket: string | null
    id_kategori_umur: string | null
    nama_kategori_umur: string | null
    id_jadwal_kelas: string | null
    hari_jadwal: string | null
    jam_jadwal: string | null
    nama_instruktur: string | null
    periode: string | null
    harga_dasar: number
    harga_akhir: number
}

export interface IAddDetailTagihan {
    id_biaya: string
    id_jadwal_kelas?: string
    periode?: string
    harga_akhir?: number
}

export interface ITagihan {
    id_tagihan: string
    nomor_kwitansi: string | null
    id_siswa: string
    nama_siswa: string
    nama_tagihan: string | null
    periode_bulan: number | null
    periode_label: string | null
    id_biaya: string
    nama_biaya: string | null
    id_kategori_umur: string
    nama_kategori_umur: string
    id_paket: string
    nama_paket: string
    id_kelas: string
    nama_kelas: string
    id_jadwal_kelas: string | null
    hari_jadwal: string | null
    jam_jadwal: string | null
    nama_instruktur: string | null
    periode: string | null
    id_diskon: string | null
    nama_diskon: string | null
    persen_diskon: number | null
    nominal_harga: number
    nominal_diskon: number | null
    total_harga: number
    total_bayar: number
    status: 1 | 2 | 3 | 4
    deskripsi: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    detail?: ITagihanDetailItem[]
}

export interface ICreateTagihan {
    id_siswa: string
    id_biaya: string
    id_jadwal_kelas?: string        // opsional — asosiasi jadwal dengan tagihan
    periode?: string                // "YYYY-MM"
    total_harga?: number            // opsional — override harga biaya
    deskripsi?: string
    aktif?: 0 | 1
}

export interface ICreateTagihanBulkItem {
    id_biaya: string
    id_jadwal_kelas?: string
    periode?: string
}

export interface ICreateTagihanBulk {
    id_siswa: string
    items: ICreateTagihanBulkItem[]
    id_diskon?: string
    kode_diskon?: string
}

export interface IUpdateTagihan {
    periode?: string | null
    total_harga?: number
    status?: 1 | 2 | 3 | 4
    deskripsi?: string | null
    aktif?: number
    id_diskon?: string | null
    kode_diskon?: string | null
}

export interface ITagihanQuery {
    search?: string
    aktif?: number
    status?: number
    page?: number
    limit?: number
}

// ─── Pembayaran ───────────────────────────────────────────────────────────────
// Table: kursus_pembayaran | PK: id_pembayaran (UUID)
// Metode: "TUNAI" | "TRANSFER" | "QRIS"

export interface IPembayaran {
    id_pembayaran: string
    id_tagihan: string
    id_siswa: string | null
    nama_siswa: string | null
    jumlah: number
    tanggal_bayar: string
    metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
    referensi: string | null
    deskripsi: string | null
    bukti_bayar: string | null
    status_konfirmasi: 0 | 1 | 2   // 0=PENDING, 1=DIKONFIRMASI, 2=DITOLAK
    dikonfirmasi_oleh: string | null
    dikonfirmasi_at: string | null
    catatan_tolak: string | null
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
    kembalian?: number
    tanggal_bayar: string          // "YYYY-MM-DD"
    metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
    referensi?: string | null
    deskripsi?: string | null
    bukti_bayar?: File | null
    aktif?: 0 | 1
}

export interface IPembayaranQuery {
    search?: string
    page?: number
    limit?: number
    tanggal_mulai?: string
    tanggal_selesai?: string
    metode?: 'TUNAI' | 'TRANSFER' | 'QRIS'
}

export interface IPembayaranMeta {
    page: number
    limit: number
    total: number
    totalPages: number
    total_jumlah: number
}

// ─── Presensi ─────────────────────────────────────────────────────────────────
// Status: 1=HADIR, 2=TIDAK_HADIR, 3=SAKIT, 4=IZIN

export interface IPresensiJadwalSub {
    id_jadwal_kelas: string
    nama_kelas: string
    hari: string
    jam_mulai: string              // "HH:MM"
    jam_selesai: string            // "HH:MM"
    tanggal_mulai?: string         // ISO datetime (opsional — tidak selalu ada di response)
    tanggal_selesai?: string       // ISO datetime (opsional)
}

export interface IPresensiSiswaSub {
    id_siswa: string
    nama_siswa: string
    email: string | null
    telepon: string | null
}

export interface IPresensiJadwalEntry {
    siswa: IPresensiSiswaSub
    presensi: {
        id_presensi: string
        status: 1 | 2 | 3 | 4
        catatan: string | null
        waktu_mulai_kelas: string
    } | null
    is_pengganti: boolean
    id_siswa_sesi_pengganti?: string
}

export interface IPresensi {
    id_presensi: string
    id_jadwal_kelas: string
    id_siswa: string
    tanggal: string                // "YYYY-MM-DD" — tanggal sesi presensi
    nama_siswa: string
    status: 1 | 2 | 3 | 4
    waktu_mulai_kelas: string      // ISO datetime
    catatan: string | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
    jadwal: IPresensiJadwalSub
    siswa: IPresensiSiswaSub
}

export type IPresensiWithDetail = IPresensi

/** Response dari GET /kursus/presensi/siswa/:id_siswa */
export interface IPresensiSiswaResponse {
    success: boolean
    message: string
    data: IPresensi[]
    sesi_terpakai: number
    timestamp: string
}

/** @deprecated gunakan IPresensiSiswaResponse */
export type IPresensiSiswaRiwayat = IPresensiSiswaResponse

export interface ICreatePresensi {
    id_jadwal: string              // id_jadwal_kelas
    id_siswa: string
    status: 1 | 2 | 3 | 4
    tanggal?: string               // YYYY-MM-DD, opsional — default hari ini (WIB)
    catatan?: string | null
}

export interface ICreateBatchPresensiItem {
    id_siswa: string
    status: 1 | 2 | 3 | 4
    catatan?: string | null
    id_siswa_sesi_pengganti?: string
}

export interface ICreateBatchPresensi {
    id_jadwal: string              // id_jadwal_kelas
    tanggal?: string               // YYYY-MM-DD, opsional — default hari ini (WIB)
    items: ICreateBatchPresensiItem[]
}

export interface IUpdatePresensi {
    status?: 1 | 2 | 3 | 4
    catatan?: string | null
}

// ─── Program Pengajaran ───────────────────────────────────────────────────────

export interface IProgramPengajaran {
    id_program: string
    kode_program: string
    nama_program: string
    deskripsi: string | null
    tingkat: 'PEMULA' | 'MENENGAH' | 'MAHIR' | null
    durasi_menit: number | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateProgramPengajaran {
    kode_program: string
    nama_program: string
    deskripsi?: string
    tingkat?: 'PEMULA' | 'MENENGAH' | 'MAHIR'
    durasi_menit?: number
}

export type IUpdateProgramPengajaran = Partial<ICreateProgramPengajaran> & { aktif?: 0 | 1 }

// ─── Tarif ────────────────────────────────────────────────────────────────────

export type JenisTarif = 'PER_SESI' | 'PAKET'

export interface ITarif {
    id_tarif: string
    id_program: string
    nama_program?: string
    kode_program?: string
    nama_tarif: string
    jenis_tarif: JenisTarif
    harga: string | number
    jumlah_pertemuan: number | null
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateTarif {
    id_program: string
    nama_tarif: string
    jenis_tarif: JenisTarif
    harga: number
    jumlah_pertemuan?: number
}

export type IUpdateTarif = Partial<ICreateTarif> & { aktif?: 0 | 1 }

// ─── Tingkat Program ─────────────────────────────────────────────────────────
// Table: kursus_tingkat_program | PK: id_tingkat (UUID)

export interface ITingkatProgram {
    id_tingkat: string
    kode_tingkat: string
    nama_tingkat: string
    urutan: number | null
    aktif: 0 | 1
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateTingkatProgram {
    kode_tingkat: string
    nama_tingkat: string
    urutan?: number
    aktif?: 0 | 1
}

export type IUpdateTingkatProgram = Partial<ICreateTingkatProgram>


export interface IPresensiQuery {
    search?: string
    bulan?: string                 // "YYYY-MM"
    tanggal?: string               // "YYYY-MM-DD"
    id_jadwal_kelas?: string
    id_siswa?: string
    page?: number
    limit?: number
}

// ─── Catat Kelas Siswa ───────────────────────────────────────────────────────
// Table: kursus_catat_kelas_siswa | PK: id_catat (UUID)
// Auto-managed — diperbarui otomatis setiap ada perubahan presensi

export interface ICatatKelasSiswa {
    id_catat: string               // UUID
    id_siswa: string
    nama_siswa: string
    id_kelas: string
    nama_kelas: string
    id_jadwal_kelas: string
    is_trial: number               // 0=reguler, 1=trial
    total_sesi: number | null      // target total sesi (dari sesi_pertemuan kategori umur)
    total_sesi_hadir: number       // status=1 (HADIR)
    total_sesi_tidak_hadir: number // status IN (2,3,4)
    status: 0 | 1                  // 1=berjalan, 0=selesai
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateCatatKelasSiswa {
    id_siswa: string
    id_jadwal_kelas: string
    total_sesi?: number
    is_trial?: number
}

export interface IConvertTrialPayload {
    id_jadwal_kelas: string
    id_biaya?: string
    total_sesi?: number | null
}

export interface IUpdateCatatKelasSiswa {
    total_sesi?: number | null
    status?: 0 | 1
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
    kuota: number | null
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
    kelas_aktif: number
    kelas_hari_ini: number
    pendapatan_bulan_ini: number
    tagihan_belum_lunas: number
    pendapatan_6_bulan: IKursusDashboardPendapatan[]
    siswa_per_kelas: IKursusDashboardSiswaKelas[]
    jadwal_hari_ini: IKursusDashboardJadwal[]
    pembayaran_terbaru: IKursusDashboardPembayaran[]
}

// ── Dashboard Keuangan ────────────────────────────────────────────────────────

export interface IKursusDashboardKeuangan {
    tagihan_lunas: number
    tagihan_sebagian: number
    tagihan_menunggu: number
    pembayaran_pending_konfirmasi: number
    nominal_lunas: number
    nominal_sebagian_sisa: number
    nominal_menunggu: number
    revenue_12_bulan: IKursusDashboardPendapatan[]
    metode_pembayaran: { metode: string; jumlah: number }[]
    pending_konfirmasi: {
        id_pembayaran: string
        nama_siswa: string
        jumlah: number
        metode: string
        tanggal_bayar: string
    }[]
}

// ── Dashboard Siswa ───────────────────────────────────────────────────────────

export interface IKursusDashboardSiswa {
    siswa_baru_bulan_ini: number
    siswa_aktif: number
    siswa_selesai: number
    siswa_dengan_tunggakan: number
    nominal_total_tunggakan: number
    per_kelas: IKursusDashboardSiswaKelas[]
    per_status: { status_pendaftaran: number; jumlah: number }[]
    tunggakan_list: {
        id_siswa: string
        nama_siswa: string
        nama_kelas: string
        nominal: number
        status_tagihan: number
    }[]
    reminder_sesi: {
        id_siswa: string
        nama_siswa: string
        nama_kelas: string
        jadwal_label: string
        sesi_tersisa: number
    }[]
}

// ── Dashboard Operasional ─────────────────────────────────────────────────────

export interface IKursusDashboardJadwalOperasional {
    id_jadwal_kelas: string
    nama_kelas: string
    nama_karyawan: string | null
    jam_mulai: string
    jam_selesai: string
    kuota: number
    kuota_terpakai: number
}

export interface IKursusDashboardOperasional {
    jadwal_hari_ini: IKursusDashboardJadwalOperasional[]
    kehadiran_minggu_ini: {
        hari: string
        hadir: number
        tidak_hadir: number
        sakit: number
        izin: number
    }[]
    kehadiran_summary: {
        pct_hadir: number
        pct_tidak_hadir: number
        pct_sakit: number
        pct_izin: number
        total_sesi: number
    }
    kelas_kehadiran_rendah: {
        nama_kelas: string
        nama_karyawan: string | null
        jadwal_label: string
        pct_hadir: number
    }[]
}

// ── Coach ────────────────────────────────────────────────────────────────────

export interface ICoachPublic {
    id_coach: string
    id_karyawan: string
    nama_karyawan: string
    telepon: string | null
    tarif_per_sesi: number | null
    no_rekening: string | null
    nama_bank: string | null
    bio: string | null
    foto_url: string | null
    spesialisasi: string | null
    aktif: number
    dibuat_pada: string | null
    diubah_pada: string | null
}

export interface ICreateCoach {
    id_karyawan: string
    password: string
    tarif_per_sesi?: number
    no_rekening?: string
    nama_bank?: string
    bio?: string
    foto_url?: string
    spesialisasi?: string
}

export interface IUpdateCoach {
    tarif_per_sesi?: number
    no_rekening?: string
    nama_bank?: string
    bio?: string
    foto_url?: string
    spesialisasi?: string
    aktif?: 0 | 1
}

export interface ICoachQuery {
    page?: number
    limit?: number
    search?: string
    aktif?: 0 | 1
}

// ── JadwalRequest ─────────────────────────────────────────────────────────────

export interface IJadwalRequestCoachSub {
    id_coach: string
    nama_karyawan: string
    telepon: string | null
    spesialisasi: string | null
}

export interface IJadwalRequestJadwalSub {
    id_jadwal_kelas: string
    nama_kelas: string
    hari: string
    jam_mulai: string
    jam_selesai: string
}

export interface IJadwalRequestPublic {
    id_request: string
    id_jadwal_kelas: string
    id_coach: string
    status: 1 | 2 | 3
    catatan_coach: string | null
    catatan_admin: string | null
    ditangani_oleh: string | null
    ditangani_pada: string | null
    aktif: number
    dibuat_pada: string | null
    diubah_pada: string | null
    coach: IJadwalRequestCoachSub
    jadwal: IJadwalRequestJadwalSub
}

export interface ICreateJadwalRequest {
    id_jadwal_kelas: string
    catatan_coach?: string
}

export interface IApproveJadwalRequest {
    status: 2 | 3
    catatan_admin?: string
}

export interface IJadwalRequestQuery {
    page?: number
    limit?: number
    status?: 1 | 2 | 3
}

// ── AbsensiCoach ──────────────────────────────────────────────────────────────

export interface IAbsensiCoachCoachSub {
    id_coach: string
    nama_karyawan: string
}

export interface IAbsensiCoachJadwalSub {
    id_jadwal_kelas: string
    nama_kelas: string
    hari: string
}

export interface IAbsensiCoachPublic {
    id_absensi: string
    id_jadwal_kelas: string
    id_coach: string
    tanggal: string
    waktu_checkin: string | null
    waktu_checkout: string | null
    status: 1 | 2 | 3
    catatan: string | null
    aktif: number
    dibuat_pada: string | null
    diubah_pada: string | null
    coach: IAbsensiCoachCoachSub
    jadwal: IAbsensiCoachJadwalSub
}

export interface ICheckinAbsensiCoach {
    id_jadwal_kelas: string
    tanggal: string
}

export interface IAbsensiCoachQuery {
    page?: number
    limit?: number
    id_coach?: string
}

// ── Reminder Perpanjangan Kursus ──────────────────────────────────────────────

export interface IReminderItem {
    id_catat: string
    id_siswa: string
    nama_siswa: string
    telepon: string | null
    id_kelas: string
    nama_kelas: string
    total_sesi: number
    total_sesi_hadir: number
    total_sesi_tidak_hadir: number
    sesi_tersisa: number
    status_reminder: 0 | 1
    reminder_dihubungi_pada: string | null
    reminder_dihubungi_oleh: string | null
    kategori: 'sesi_habis' | 'akan_habis'
}

// ─── Libur Jadwal ────────────────────────────────────────────────────────────

export interface ILiburJadwal {
    id_libur: string
    tanggal: string                 // YYYY-MM-DD
    keterangan: string
    aktif: number
    dibuat_pada: string | null
    diubah_pada: string | null
}

export interface IKelasTerdampak {
    id_jadwal_kelas: string
    nama_kelas: string | null
    nama_karyawan: string | null
    jam_mulai: string | null
    jam_selesai: string | null
    id_cancel: string
    id_sesi_pengganti: string | null
    tanggal_pengganti: string | null
    status_pengganti: number | null  // 1=MENUNGGU, 2=DIKONFIRMASI, 3=DIBATALKAN
}

export interface ILiburJadwalDetail extends ILiburJadwal {
    kelas_terdampak: IKelasTerdampak[]
}

export interface ICreateLiburJadwal {
    tanggal: string
    keterangan: string
}

// ─── Cancel Kelas ────────────────────────────────────────────────────────────

export interface ICancelKelas {
    id_cancel: string
    id_jadwal_kelas: string
    id_libur: string | null
    tanggal: string                 // YYYY-MM-DD
    keterangan: string | null
    status: 1 | 2                  // 1=DIBATALKAN, 2=ADA_PENGGANTI
    aktif: number
    nama_kelas: string | null
    nama_karyawan: string | null
    jam_mulai: string | null
    jam_selesai: string | null
    dibuat_pada: string | null
    diubah_pada: string | null
}

export interface ISesiPengganti {
    id_sesi_pengganti: string
    id_cancel: string
    id_jadwal_kelas: string
    tanggal: string
    jam_mulai: string | null
    jam_selesai: string | null
    keterangan: string | null
    status: 1 | 2 | 3              // 1=MENUNGGU, 2=DIKONFIRMASI, 3=DIBATALKAN
    nama_kelas: string | null
    nama_karyawan: string | null
    dibuat_pada: string | null
    diubah_pada: string | null
}

export interface ISiswaTerdampak {
    id_siswa: string
    nama_siswa: string
    telepon: string | null
}

// ─── Siswa Sesi Pengganti (Individual Student Makeup) ────────────────────

export interface ISiswaSesiPengganti {
    id_siswa_sesi_pengganti: string
    id_presensi_asal: string
    id_siswa: string
    id_jadwal_kelas_asal: string
    id_jadwal_kelas_tujuan: string
    tanggal_pengganti: string       // YYYY-MM-DD
    status: 1 | 2 | 3 | 4          // 1=DIJADWALKAN, 2=HADIR, 3=TIDAK_HADIR, 4=DIBATALKAN
    keterangan: string | null
    aktif: number
    nama_siswa: string | null
    nama_kelas_asal: string | null
    nama_kelas_tujuan: string | null
    jam_mulai_tujuan: string | null
    jam_selesai_tujuan: string | null
    nama_karyawan_tujuan: string | null
    dibuat_pada: string | null
    diubah_pada: string | null
}

export interface ICreateSiswaSesiPengganti {
    id_presensi_asal: string
    id_jadwal_kelas_tujuan: string
    tanggal_pengganti: string       // YYYY-MM-DD
    keterangan?: string
}

export interface ICancelKelasDetail extends ICancelKelas {
    sesi_pengganti: ISesiPengganti | null
    siswa_terdampak: ISiswaTerdampak[]
}

export interface ICreateCancelKelas {
    id_jadwal_kelas: string
    tanggal: string
    keterangan?: string
}

export interface IKonfirmasiPengganti {
    tanggal?: string
    jam_mulai?: string
    jam_selesai?: string
    keterangan?: string
}

// ─── Kalender ────────────────────────────────────────────────────────────────

export interface IJadwalKalenderResponse {
    jadwal: IJadwalKelas[]
    libur: ILiburJadwal[]
    cancel: ICancelKelas[]
    sesi_pengganti: ISesiPengganti[]
}
