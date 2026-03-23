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

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface IKursusQuery {
    search?: string
    aktif?: number
    page?: number
    limit?: number
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
    hari: 1 | 2 | 3 | 4 | 5 | 6 | 7  // 1=Senin ... 7=Minggu
    jam_mulai: string                   // "HH:MM"
    jam_selesai: string                 // "HH:MM"
    instruktur: string | null
    lokasi: string | null
    kuota: number
    aktif: number
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
    hari: 1 | 2 | 3 | 4 | 5 | 6 | 7
    jam_mulai: string
    jam_selesai: string
    instruktur?: string
    lokasi?: string
    kuota?: number
}

export type IUpdateJadwalKelas = Partial<ICreateJadwalKelas> & { aktif?: 0 | 1 }

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
