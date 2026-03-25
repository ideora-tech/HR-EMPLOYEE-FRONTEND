# Dokumentasi API Kursus — Panduan Frontend (Next.js)

> Panduan ini khusus untuk frontend developer.
> Berisi types, service, konstanta, dan contoh konsumsi API modul Kursus Dansa.

---

## 1. Types — `src/@types/kursus.types.ts`

```typescript
// ============================================================
// SISWA
// ============================================================
export interface ISiswa {
  id_siswa: string
  nama: string
  email: string | null
  telepon: string | null
  tanggal_lahir: string | null   // ISO date string: "2000-01-15"
  alamat: string | null
  jenis_kelamin: number | null   // 1 = Laki-laki, 2 = Perempuan
  foto_url: string | null
  aktif: number                   // 1 = aktif, 0 = nonaktif
  dibuat_pada: string
  diubah_pada: string | null
}

export interface ICreateSiswa {
  nama: string
  email?: string
  telepon?: string
  tanggal_lahir?: string          // "YYYY-MM-DD"
  alamat?: string
  jenis_kelamin?: 1 | 2
  foto_url?: string
}

export type IUpdateSiswa = Partial<ICreateSiswa> & { aktif?: 0 | 1 }

// ============================================================
// TINGKAT PROGRAM (master data)
// ============================================================
export interface ITingkatProgram {
  id_tingkat: string
  kode: string                    // contoh: "PEMULA", "MENENGAH", "MAHIR"
  nama: string                    // contoh: "Pemula", "Menengah", "Mahir"
  urutan: number
  aktif: number
  dibuat_pada: string
  diubah_pada: string | null
}

export interface ICreateTingkatProgram {
  kode: string                    // format: A-Z0-9_
  nama: string
  urutan?: number
}

export type IUpdateTingkatProgram = Partial<ICreateTingkatProgram> & { aktif?: 0 | 1 }

// ============================================================
// PROGRAM PENGAJARAN
// ============================================================
export interface IProgramPengajaran {
  id_program: string
  kode_program: string            // format: A-Z0-9_ (contoh: "TARI_BALI_01")
  nama: string
  deskripsi: string | null
  tingkat: string | null          // kode dari master data tingkat_program
  durasi_menit: number            // default: 60
  aktif: number
  dibuat_pada: string
  diubah_pada: string | null
}

export interface ICreateProgramPengajaran {
  kode_program: string
  nama: string
  deskripsi?: string
  tingkat?: string                // kode dari GET /kursus/tingkat-program
  durasi_menit?: number
}

export type IUpdateProgramPengajaran = Partial<ICreateProgramPengajaran> & { aktif?: 0 | 1 }

// ============================================================
// TARIF
// ============================================================
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

// ============================================================
// JADWAL KELAS
// ============================================================
export interface IJadwalKelas {
  id_jadwal: string
  id_program: string
  nama: string
  tanggal_mulai: string    // "2026-03-23 08:00:00" — string langsung dari DB (dateStrings: true)
  tanggal_selesai: string  // "2026-03-23 17:00:00"
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

// POST /kursus/jadwal-kelas — generate N row (1 per hari dalam range)
export interface ICreateJadwalKelas {
  id_program: string
  nama: string
  tanggal_mulai: string   // "YYYY-MM-DD" — date range dari
  tanggal_selesai: string // "YYYY-MM-DD" — date range sampai
  jam_mulai: string       // "HH:MM" — jam yang sama untuk semua hari
  jam_selesai: string     // "HH:MM"
  instruktur?: string
  lokasi?: string
  kuota?: number
}

// PATCH /kursus/jadwal-kelas/:id — update 1 sesi
export interface IUpdateJadwalKelas {
  nama?: string
  tanggal_mulai?: string    // "YYYY-MM-DDThh:mm:ss" — ISO datetime untuk update 1 sesi
  tanggal_selesai?: string  // "YYYY-MM-DDThh:mm:ss"
  instruktur?: string | null
  lokasi?: string | null
  kuota?: number
  id_program?: string
  aktif?: 0 | 1
}

// ============================================================
// DAFTAR KELAS (enriched response)
// ============================================================
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
    id_program: string             // ← tersedia langsung
    nama: string
    tanggal_mulai: string          // "2026-03-23 08:00:00"
    tanggal_selesai: string        // "2026-03-23 17:00:00"
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

// POST /kursus/daftar-kelas/batch — assign ke banyak jadwal sekaligus
export interface ICreateBatchDaftarKelas {
  id_siswa: string
  id_jadwal: string[]             // array UUID jadwal
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

// ============================================================
// PRESENSI
// ============================================================
export interface IPresensi {
  id_presensi: string
  status: 1 | 2 | 3 | 4           // 1=HADIR, 2=TIDAK_HADIR, 3=SAKIT, 4=IZIN
  catatan: string | null
  aktif: number
  dibuat_pada: string
  diubah_pada: string | null
  daftar: {
    id_daftar: string
  }
  siswa: {
    id_siswa: string
    nama: string
    email: string | null
    telepon: string | null
  }
  jadwal: {
    id_jadwal: string
    nama: string
    tanggal_mulai: string
    tanggal_selesai: string
  }
}

// Response GET /kursus/presensi/jadwal/:id_jadwal
// Menampilkan semua siswa di sesi itu — presensi null jika belum diabsen
export interface IPresensiJadwalItem {
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

export interface ICreatePresensi {
  id_jadwal: string   // UUID jadwal — backend resolve id_daftar sendiri
  id_siswa: string    // UUID siswa
  status: 1 | 2 | 3 | 4
  catatan?: string
}

export interface ICreateBatchPresensi {
  id_jadwal: string
  items: Array<{
    id_daftar: string  // dari response GET /presensi/jadwal/:id_jadwal
    status: 1 | 2 | 3 | 4
    catatan?: string
  }>
}

export type IUpdatePresensi = Partial<Pick<ICreatePresensi, 'status' | 'catatan'>>

// ===== TAGIHAN =====
export interface ITagihan {
  id_tagihan: string
  jenis: 'PAKET' | 'BULANAN' | 'LAINNYA'
  periode: string | null    // YYYY-MM, isi untuk jenis BULANAN
  jumlah_sesi: number | null
  total_harga: number
  total_bayar: number       // auto-calculated dari SUM(pembayaran.jumlah)
  status: 1 | 2 | 3 | 4   // 1=MENUNGGU, 2=SEBAGIAN, 3=LUNAS, 4=DIBATALKAN
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
  periode?: string          // YYYY-MM — wajib isi jika jenis = BULANAN
  jumlah_sesi?: number
  total_harga: number
  catatan?: string
}

export type IUpdateTagihan = Partial<
  Pick<ICreateTagihan, 'jenis' | 'periode' | 'jumlah_sesi' | 'total_harga' | 'catatan'> &
  { status: 1 | 2 | 3 | 4 }
>

// ===== PEMBAYARAN =====
export interface IPembayaran {
  id_pembayaran: string
  id_tagihan: string
  jumlah: number
  tanggal_bayar: string     // YYYY-MM-DD (MySQL DATE → string, dateStrings: true)
  metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
  referensi: string | null  // no. ref transfer / QRIS
  catatan: string | null
  dibuat_pada: string
  diubah_pada: string | null
  tagihan: {
    id_tagihan: string
    jenis: string
    periode: string | null
    total_harga: number
    total_bayar: number
    status: number
  }
}

export interface ICreatePembayaran {
  id_tagihan: string
  jumlah: number            // boleh DP / cicilan, tidak harus lunas sekaligus
  tanggal_bayar: string     // YYYY-MM-DD
  metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
  referensi?: string
  catatan?: string
}

// ===== MONITORING SISWA =====
export interface ISiswaMonitoringKelas {
  id_daftar: string
  id_jadwal: string
  nama_jadwal: string
  tanggal_selesai: string
  status_daftar: number     // 1=Aktif, 3=Berhenti
  hari_tersisa: number | null   // null untuk siswa berhenti
}

export interface ISiswaMonitoringItem {
  id_siswa: string
  nama: string
  email: string | null
  telepon: string | null
  kelas: ISiswaMonitoringKelas[]
}

export interface ISiswaMonitoring {
  berhenti: ISiswaMonitoringItem[]
  akan_expired: ISiswaMonitoringItem[]
}

// ===== DASHBOARD =====
export interface IPendapatanBulan {
  bulan: string    // YYYY-MM
  total: number
}

export interface ISiswaPerProgram {
  nama_program: string
  jumlah: number
}

export interface IJadwalHariIni {
  id_jadwal: string
  nama: string
  instruktur: string | null
  jam_mulai: string    // HH:MM
  jam_selesai: string  // HH:MM
  kuota: number
  terisi: number
}

export interface IPembayaranTerbaru {
  id_pembayaran: string
  nama_siswa: string
  jumlah: number
  metode: string
  tanggal_bayar: string
}

export interface IDashboardSummary {
  siswa_aktif: number
  kelas_hari_ini: number
  pendapatan_bulan_ini: number
  tagihan_belum_lunas: number
  siswa_akan_expired: number
  siswa_berhenti: number
  pendapatan_6_bulan: IPendapatanBulan[]
  siswa_per_program: ISiswaPerProgram[]
  jadwal_hari_ini: IJadwalHariIni[]
  pembayaran_terbaru: IPembayaranTerbaru[]
}
```

---

## 2. API Endpoint Constants — tambahkan ke `src/constants/api.constant.ts`

```typescript
// Tambahkan di dalam object API_ENDPOINTS yang sudah ada:

kursus: {
  // Siswa
  siswa: {
    list:       '/kursus/siswa',
    monitoring: '/kursus/siswa/monitoring',
    template:   '/kursus/siswa/template/excel',
    upload:     '/kursus/siswa/upload/excel',
    detail:     (id: string) => `/kursus/siswa/${id}`,
    create:     '/kursus/siswa',
    update:     (id: string) => `/kursus/siswa/${id}`,
    delete:     (id: string) => `/kursus/siswa/${id}`,
  },
  // Program Pengajaran
  program: {
    list:   '/kursus/program-pengajaran',
    detail: (id: string) => `/kursus/program-pengajaran/${id}`,
    create: '/kursus/program-pengajaran',
    update: (id: string) => `/kursus/program-pengajaran/${id}`,
    delete: (id: string) => `/kursus/program-pengajaran/${id}`,
  },
  // Tarif
  tarif: {
    list:       '/kursus/tarif',
    byProgram:  (idProgram: string) => `/kursus/tarif/program/${idProgram}`,
    detail:     (id: string) => `/kursus/tarif/${id}`,
    create:     '/kursus/tarif',
    update:     (id: string) => `/kursus/tarif/${id}`,
    delete:     (id: string) => `/kursus/tarif/${id}`,
  },
  // Jadwal Kelas
  jadwal: {
    list:   '/kursus/jadwal-kelas',
    export: '/kursus/jadwal-kelas/export/excel',
    kuota:  (id: string) => `/kursus/jadwal-kelas/${id}/kuota`,
    detail: (id: string) => `/kursus/jadwal-kelas/${id}`,
    create: '/kursus/jadwal-kelas',
    update: (id: string) => `/kursus/jadwal-kelas/${id}`,
    delete: (id: string) => `/kursus/jadwal-kelas/${id}`,
  },
  // Daftar Kelas
  daftar: {
    list:      '/kursus/daftar-kelas',
    bySiswa:   (idSiswa: string) => `/kursus/daftar-kelas/siswa/${idSiswa}`,
    byJadwal:  (idJadwal: string) => `/kursus/daftar-kelas/jadwal/${idJadwal}`,
    detail:    (id: string) => `/kursus/daftar-kelas/${id}`,
    create:    '/kursus/daftar-kelas',
    update:    (id: string) => `/kursus/daftar-kelas/${id}`,
    delete:    (id: string) => `/kursus/daftar-kelas/${id}`,
  },
  // Presensi
  presensi: {
    list:        '/kursus/presensi',
    byJadwal:    (idJadwal: string) => `/kursus/presensi/jadwal/${idJadwal}`,
    bySiswa:     (idSiswa: string) => `/kursus/presensi/siswa/${idSiswa}`,
    byDaftar:    (idDaftar: string) => `/kursus/presensi/daftar/${idDaftar}`,
    detail:      (id: string) => `/kursus/presensi/${id}`,
    create:      '/kursus/presensi',
    batch:       '/kursus/presensi/batch',
    update:      (id: string) => `/kursus/presensi/${id}`,
    delete:      (id: string) => `/kursus/presensi/${id}`,
  },
  // Tagihan
  tagihan: {
    list:            '/kursus/tagihan',
    bySiswa:         (idSiswa: string) => `/kursus/tagihan/siswa/${idSiswa}`,
    detail:          (id: string) => `/kursus/tagihan/${id}`,
    create:          '/kursus/tagihan',
    generateBulanan: '/kursus/tagihan/generate-bulanan',
    update:          (id: string) => `/kursus/tagihan/${id}`,
    delete:          (id: string) => `/kursus/tagihan/${id}`,
  },
  // Pembayaran
  pembayaran: {
    list:       '/kursus/pembayaran',
    byTagihan:  (idTagihan: string) => `/kursus/pembayaran/tagihan/${idTagihan}`,
    detail:     (id: string) => `/kursus/pembayaran/${id}`,
    create:     '/kursus/pembayaran',
    delete:     (id: string) => `/kursus/pembayaran/${id}`,
  },
  // Dashboard
  dashboard: {
    summary: '/kursus/dashboard/summary',
  },
},
```

---

## 3. Route Constants — tambahkan ke `src/constants/route.constant.ts`

```typescript
// Tambahkan di dalam object ROUTES yang sudah ada:

// Kursus
kursus: {
  siswa:          '/kursus/siswa',
  siswaCreate:    '/kursus/siswa/create',
  siswaDetail:    (id: string) => `/kursus/siswa/${id}`,

  program:        '/kursus/program-pengajaran',
  programCreate:  '/kursus/program-pengajaran/create',
  programDetail:  (id: string) => `/kursus/program-pengajaran/${id}`,

  tarif:          '/kursus/tarif',
  tarifCreate:    '/kursus/tarif/create',
  tarifDetail:    (id: string) => `/kursus/tarif/${id}`,

  jadwal:         '/kursus/jadwal-kelas',
  jadwalCreate:   '/kursus/jadwal-kelas/create',
  jadwalDetail:   (id: string) => `/kursus/jadwal-kelas/${id}`,

  daftar:         '/kursus/daftar-kelas',
  daftarCreate:   '/kursus/daftar-kelas/create',
  daftarDetail:   (id: string) => `/kursus/daftar-kelas/${id}`,

  presensi:       '/kursus/presensi',

  tagihan:        '/kursus/tagihan',
  tagihanCreate:  '/kursus/tagihan/create',
  tagihanDetail:  (id: string) => `/kursus/tagihan/${id}`,

  pembayaran:     '/kursus/pembayaran',

  dashboard:      '/kursus/dashboard',
},
```

---

## 4. Services — `src/services/kursus/`

### `siswa.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ISiswa, ICreateSiswa, IUpdateSiswa, ISiswaMonitoring } from '@/@types/kursus.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export interface SiswaListParams {
  page?: number
  limit?: number
  search?: string        // cari di nama, email, telepon
  aktif?: 0 | 1
}

export const siswaService = {
  getAll: (params?: SiswaListParams) =>
    apiClient.get<ApiResponse<PaginatedResult<ISiswa>>>(
      API_ENDPOINTS.kursus.siswa.list, { params }
    ),

  getMonitoring: (expiringDays = 30) =>
    apiClient.get<ApiResponse<ISiswaMonitoring>>(
      API_ENDPOINTS.kursus.siswa.monitoring, { params: { expiring_days: expiringDays } }
    ),

  downloadTemplate: () =>
    apiClient.get(API_ENDPOINTS.kursus.siswa.template, { responseType: 'blob' }),

  uploadExcel: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ApiResponse<{ berhasil: number; gagal: number; errors: string[] }>>(
      API_ENDPOINTS.kursus.siswa.upload, form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  },

  getById: (id: string) =>
    apiClient.get<ApiResponse<ISiswa>>(
      API_ENDPOINTS.kursus.siswa.detail(id)
    ),

  create: (data: ICreateSiswa) =>
    apiClient.post<ApiResponse<ISiswa>>(
      API_ENDPOINTS.kursus.siswa.create, data
    ),

  update: (id: string, data: IUpdateSiswa) =>
    apiClient.patch<ApiResponse<ISiswa>>(
      API_ENDPOINTS.kursus.siswa.update(id), data
    ),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.kursus.siswa.delete(id)
    ),
}
```

### `program-pengajaran.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IProgramPengajaran, ICreateProgramPengajaran, IUpdateProgramPengajaran } from '@/@types/kursus.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export interface ProgramListParams {
  page?: number
  limit?: number
  search?: string        // cari di nama, kode_program
  aktif?: 0 | 1
}

export const programPengajaranService = {
  getAll: (params?: ProgramListParams) =>
    apiClient.get<ApiResponse<PaginatedResult<IProgramPengajaran>>>(
      API_ENDPOINTS.kursus.program.list, { params }
    ),

  getById: (id: string) =>
    apiClient.get<ApiResponse<IProgramPengajaran>>(
      API_ENDPOINTS.kursus.program.detail(id)
    ),

  create: (data: ICreateProgramPengajaran) =>
    apiClient.post<ApiResponse<IProgramPengajaran>>(
      API_ENDPOINTS.kursus.program.create, data
    ),
  // ⚠️ 409 ConflictException jika kode_program sudah digunakan

  update: (id: string, data: IUpdateProgramPengajaran) =>
    apiClient.patch<ApiResponse<IProgramPengajaran>>(
      API_ENDPOINTS.kursus.program.update(id), data
    ),
  // ⚠️ 409 ConflictException jika kode_program baru sudah dipakai program lain

  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.kursus.program.delete(id)
    ),
}
```

### `tarif.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ITarif, ICreateTarif, IUpdateTarif } from '@/@types/kursus.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export interface TarifListParams {
  page?: number
  limit?: number
  search?: string        // cari di nama tarif
  aktif?: 0 | 1
}

export const tarifService = {
  getAll: (params?: TarifListParams) =>
    apiClient.get<ApiResponse<PaginatedResult<ITarif>>>(
      API_ENDPOINTS.kursus.tarif.list, { params }
    ),

  getByProgram: (idProgram: string) =>
    apiClient.get<ApiResponse<ITarif[]>>(
      API_ENDPOINTS.kursus.tarif.byProgram(idProgram)
    ),
  // Gunakan ini untuk dropdown pilih tarif saat daftar kelas

  getById: (id: string) =>
    apiClient.get<ApiResponse<ITarif>>(
      API_ENDPOINTS.kursus.tarif.detail(id)
    ),

  create: (data: ICreateTarif) =>
    apiClient.post<ApiResponse<ITarif>>(
      API_ENDPOINTS.kursus.tarif.create, data
    ),

  update: (id: string, data: IUpdateTarif) =>
    apiClient.patch<ApiResponse<ITarif>>(
      API_ENDPOINTS.kursus.tarif.update(id), data
    ),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.kursus.tarif.delete(id)
    ),
}
```

### `jadwal-kelas.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IJadwalKelas, IKuotaJadwal, ICreateJadwalKelas, IUpdateJadwalKelas } from '@/@types/kursus.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export interface JadwalListParams {
  page?: number
  limit?: number
  search?: string        // cari di nama, instruktur, lokasi
  aktif?: 0 | 1
}

export const jadwalKelasService = {
  getAll: (params?: JadwalListParams) =>
    apiClient.get<ApiResponse<PaginatedResult<IJadwalKelas>>>(
      API_ENDPOINTS.kursus.jadwal.list, { params }
    ),

  getKuota: (id: string) =>
    apiClient.get<ApiResponse<IKuotaJadwal>>(
      API_ENDPOINTS.kursus.jadwal.kuota(id)
    ),
  // Gunakan untuk tampilkan sisa slot sebelum daftar

  getById: (id: string) =>
    apiClient.get<ApiResponse<IJadwalKelas>>(
      API_ENDPOINTS.kursus.jadwal.detail(id)
    ),

  create: (data: ICreateJadwalKelas) =>
    apiClient.post<ApiResponse<IJadwalKelas>>(
      API_ENDPOINTS.kursus.jadwal.create, data
    ),

  update: (id: string, data: IUpdateJadwalKelas) =>
    apiClient.patch<ApiResponse<IJadwalKelas>>(
      API_ENDPOINTS.kursus.jadwal.update(id), data
    ),

  exportExcel: (bulan?: string) =>
    // bulan format: "YYYY-MM", default bulan ini
    apiClient.get(API_ENDPOINTS.kursus.jadwal.export, {
      params: bulan ? { bulan } : {},
      responseType: 'blob',
    }),
  // Contoh penggunaan:
  // const res = await jadwalKelasService.exportExcel('2026-03')
  // const url = URL.createObjectURL(new Blob([res.data]))
  // const a = document.createElement('a'); a.href = url; a.download = 'jadwal-2026-03.xlsx'; a.click()

  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.kursus.jadwal.delete(id)
    ),
}
```

### `dashboard.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IDashboardSummary } from '@/@types/kursus.types'
import type { ApiResponse } from '@/@types/api.types'

export const dashboardKursusService = {
  getSummary: () =>
    apiClient.get<ApiResponse<IDashboardSummary>>(
      API_ENDPOINTS.kursus.dashboard.summary
    ),
}
```

### `daftar-kelas.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IDaftarKelas, ICreateDaftarKelas, IUpdateDaftarKelas } from '@/@types/kursus.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export interface DaftarListParams {
  page?: number
  limit?: number
  search?: string
  aktif?: 0 | 1
}

export const daftarKelasService = {
  getAll: (params?: DaftarListParams) =>
    apiClient.get<ApiResponse<PaginatedResult<IDaftarKelas>>>(
      API_ENDPOINTS.kursus.daftar.list, { params }
    ),

  getBySiswa: (idSiswa: string) =>
    apiClient.get<ApiResponse<IDaftarKelas[]>>(
      API_ENDPOINTS.kursus.daftar.bySiswa(idSiswa)
    ),
  // Gunakan di halaman detail siswa — riwayat kelas yang diikuti

  getByJadwal: (idJadwal: string) =>
    apiClient.get<ApiResponse<IDaftarKelas[]>>(
      API_ENDPOINTS.kursus.daftar.byJadwal(idJadwal)
    ),
  // Gunakan di halaman detail jadwal — siapa saja peserta kelas ini

  getById: (id: string) =>
    apiClient.get<ApiResponse<IDaftarKelas>>(
      API_ENDPOINTS.kursus.daftar.detail(id)
    ),

  create: (data: ICreateDaftarKelas) =>
    apiClient.post<ApiResponse<IDaftarKelas>>(
      API_ENDPOINTS.kursus.daftar.create, data
    ),
  // ⚠️ 400 BadRequestException jika kuota kelas sudah penuh

  update: (id: string, data: IUpdateDaftarKelas) =>
    apiClient.patch<ApiResponse<IDaftarKelas>>(
      API_ENDPOINTS.kursus.daftar.update(id), data
    ),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.kursus.daftar.delete(id)
    ),
}
```

### `presensi.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IPresensi, IPresensiJadwalItem, ICreatePresensi, ICreateBatchPresensi, IUpdatePresensi } from '@/@types/kursus.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export interface PresensiListParams {
  page?: number
  limit?: number
  search?: string       // cari nama siswa
  bulan?: string        // YYYY-MM — filter berdasarkan bulan sesi
  aktif?: 0 | 1
}

export const presensiService = {
  getAll: (params?: PresensiListParams) =>
    apiClient.get<ApiResponse<PaginatedResult<IPresensi>>>(
      API_ENDPOINTS.kursus.presensi.list, { params }
    ),

  getByJadwal: (idJadwal: string) =>
    apiClient.get<ApiResponse<IPresensiJadwalItem[]>>(
      API_ENDPOINTS.kursus.presensi.byJadwal(idJadwal)
    ),
  // Gunakan untuk render absen list (admin klik sesi di kalender)
  // Returns: semua siswa terdaftar + presensi null jika belum diisi

  getBySiswa: (idSiswa: string) =>
    apiClient.get<ApiResponse<{ data: IPresensi[]; sesi_terpakai: number }>>(
      API_ENDPOINTS.kursus.presensi.bySiswa(idSiswa)
    ),
  // sesi_terpakai = COUNT status=1 (HADIR) — untuk paket sesi

  getById: (id: string) =>
    apiClient.get<ApiResponse<IPresensi>>(
      API_ENDPOINTS.kursus.presensi.detail(id)
    ),

  create: (data: ICreatePresensi) =>
    apiClient.post<ApiResponse<IPresensi>>(
      API_ENDPOINTS.kursus.presensi.create, data
    ),
  // Body: { id_jadwal, id_siswa, status, catatan? }
  // ⚠️ 409 jika presensi sudah ada — gunakan PATCH atau batch

  batch: (data: ICreateBatchPresensi) =>
    apiClient.post<ApiResponse<IPresensi[]>>(
      API_ENDPOINTS.kursus.presensi.batch, data
    ),
  // Body: { id_jadwal, items: [{ id_daftar, status }] }
  // Upsert — aman dipanggil berkali-kali untuk sesi yang sama

  update: (id: string, data: IUpdatePresensi) =>
    apiClient.patch<ApiResponse<IPresensi>>(
      API_ENDPOINTS.kursus.presensi.update(id), data
    ),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.kursus.presensi.delete(id)
    ),
}
```

### `tagihan.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ITagihan, ICreateTagihan, IUpdateTagihan } from '@/@types/kursus.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export interface TagihanListParams {
  page?: number
  limit?: number
  search?: string       // cari nama siswa
  aktif?: 0 | 1
}

export const tagihanService = {
  getAll: (params?: TagihanListParams) =>
    apiClient.get<ApiResponse<PaginatedResult<ITagihan>>>(
      API_ENDPOINTS.kursus.tagihan.list, { params }
    ),

  getBySiswa: (idSiswa: string) =>
    apiClient.get<ApiResponse<ITagihan[]>>(
      API_ENDPOINTS.kursus.tagihan.bySiswa(idSiswa)
    ),
  // Gunakan di halaman detail siswa — tampilkan riwayat tagihan

  getById: (id: string) =>
    apiClient.get<ApiResponse<ITagihan>>(
      API_ENDPOINTS.kursus.tagihan.detail(id)
    ),

  create: (data: ICreateTagihan) =>
    apiClient.post<ApiResponse<ITagihan>>(
      API_ENDPOINTS.kursus.tagihan.create, data
    ),

  generateBulanan: (periode: string) =>
    apiClient.post<ApiResponse<ITagihan[]> & { count: number }>(
      API_ENDPOINTS.kursus.tagihan.generateBulanan, { periode }
    ),
  // Otomatis buat tagihan dari presensi HADIR (tarif PER_SESI) di bulan tsb
  // Panggil setiap awal bulan oleh admin

  update: (id: string, data: IUpdateTagihan) =>
    apiClient.patch<ApiResponse<ITagihan>>(
      API_ENDPOINTS.kursus.tagihan.update(id), data
    ),
  // Untuk koreksi manual atau set status DIBATALKAN (status: 4)

  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.kursus.tagihan.delete(id)
    ),
}
```

### `pembayaran.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IPembayaran, ICreatePembayaran } from '@/@types/kursus.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export interface PembayaranListParams {
  page?: number
  limit?: number
  search?: string       // cari nama siswa
  aktif?: 0 | 1
}

export const pembayaranService = {
  getAll: (params?: PembayaranListParams) =>
    apiClient.get<ApiResponse<PaginatedResult<IPembayaran>>>(
      API_ENDPOINTS.kursus.pembayaran.list, { params }
    ),

  getByTagihan: (idTagihan: string) =>
    apiClient.get<ApiResponse<IPembayaran[]>>(
      API_ENDPOINTS.kursus.pembayaran.byTagihan(idTagihan)
    ),
  // Gunakan di halaman detail tagihan — tampilkan riwayat pembayaran

  getById: (id: string) =>
    apiClient.get<ApiResponse<IPembayaran>>(
      API_ENDPOINTS.kursus.pembayaran.detail(id)
    ),

  create: (data: ICreatePembayaran) =>
    apiClient.post<ApiResponse<IPembayaran>>(
      API_ENDPOINTS.kursus.pembayaran.create, data
    ),
  // ⚠️ Setelah create, tagihan.total_bayar dan tagihan.status otomatis ter-update
  // Fetch ulang tagihan setelah create pembayaran untuk tampilkan status terbaru

  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.kursus.pembayaran.delete(id)
    ),
  // ⚠️ Setelah delete, tagihan.total_bayar dan tagihan.status ikut recalculate
}
```

---

## 5. Contoh Penggunaan di Komponen

### List Siswa dengan Pagination

```tsx
'use client'
import { useEffect, useState } from 'react'
import { siswaService } from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/error.util'
import type { ISiswa } from '@/@types/kursus.types'

export function SiswaTable() {
  const [data, setData] = useState<ISiswa[]>([])
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = (page = 1) => {
    setLoading(true)
    siswaService.getAll({ page, limit: meta.limit, search })
      .then(res => {
        setData(res.data.data.data)
        setMeta(res.data.data.meta)
      })
      .catch(err => setError(parseApiError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [search])

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Cari nama, email, telepon..."
      />
      {/* render tabel siswa */}
      {/* render pagination dengan meta.page, meta.totalPages */}
    </div>
  )
}
```

### Daftar Siswa ke Kelas (dengan cek kuota)

```tsx
'use client'
import { useState } from 'react'
import { jadwalKelasService } from '@/services/kursus/jadwal-kelas.service'
import { daftarKelasService } from '@/services/kursus/daftar-kelas.service'
import { parseApiError } from '@/utils/error.util'
import type { ICreateDaftarKelas } from '@/@types/kursus.types'

export function DaftarKelasForm({ idJadwal }: { idJadwal: string }) {
  const [kuota, setKuota] = useState<{ kuota: number; terisi: number; sisa: number } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Cek kuota sebelum render form
  const checkKuota = async () => {
    try {
      const res = await jadwalKelasService.getKuota(idJadwal)
      setKuota(res.data.data)
    } catch (err) {
      setError(parseApiError(err))
    }
  }

  const handleSubmit = async (formData: ICreateDaftarKelas) => {
    setLoading(true)
    setError('')
    try {
      await daftarKelasService.create(formData)
      // redirect atau refresh
    } catch (err) {
      // ⚠️ Backend akan throw 400 jika kuota penuh
      setError(parseApiError(err))  // "Kuota kelas penuh"
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {kuota && (
        <p>Kuota: {kuota.sisa} tempat tersisa dari {kuota.kuota}</p>
      )}
      {kuota?.sisa === 0 && (
        <p className="text-red-500">Kelas sudah penuh!</p>
      )}
      {/* form input: id_siswa, id_jadwal, tanggal_daftar, id_tarif, catatan */}
    </div>
  )
}
```

### Absen List dari Kalender

```tsx
'use client'
import { useEffect, useState } from 'react'
import { presensiService } from '@/services/kursus/presensi.service'
import { parseApiError } from '@/utils/error.util'
import type { IPresensiJadwalItem, ICreateBatchPresensi } from '@/@types/kursus.types'

export function AbsenList({ idJadwal }: { idJadwal: string }) {
  const [items, setItems] = useState<IPresensiJadwalItem[]>([])
  const [statuses, setStatuses] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    presensiService.getByJadwal(idJadwal)
      .then(res => {
        const data = res.data.data
        setItems(data)
        // Pre-fill status dari presensi yang sudah ada
        const init: Record<string, number> = {}
        data.forEach(item => {
          init[item.id_daftar] = item.presensi?.status ?? 1
        })
        setStatuses(init)
      })
      .catch(err => console.error(parseApiError(err)))
      .finally(() => setLoading(false))
  }, [idJadwal])

  const handleSave = async () => {
    setSaving(true)
    const payload: ICreateBatchPresensi = {
      id_jadwal: idJadwal,
      items: items.map(item => ({
        id_daftar: item.id_daftar,
        status: statuses[item.id_daftar] ?? 1,
      })),
    }
    try {
      await presensiService.batch(payload)
      // tampilkan toast sukses
    } catch (err) {
      console.error(parseApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {items.map(item => (
        <div key={item.id_daftar} className="flex justify-between items-center py-2">
          <span>{item.siswa.nama}</span>
          <select
            value={statuses[item.id_daftar] ?? 1}
            onChange={e => setStatuses(prev => ({ ...prev, [item.id_daftar]: Number(e.target.value) }))}
          >
            <option value={1}>Hadir</option>
            <option value={2}>Tidak Hadir</option>
            <option value={3}>Sakit</option>
            <option value={4}>Izin</option>
          </select>
        </div>
      ))}
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan Absen'}
      </button>
    </div>
  )
}
```

### Detail Tagihan + Catat Pembayaran

```tsx
'use client'
import { useEffect, useState } from 'react'
import { tagihanService } from '@/services/kursus/tagihan.service'
import { pembayaranService } from '@/services/kursus/pembayaran.service'
import { parseApiError } from '@/utils/error.util'
import { formatStatusTagihan, formatRupiah } from '@/utils/format.util'
import type { ITagihan, IPembayaran, ICreatePembayaran } from '@/@types/kursus.types'

export function TagihanDetail({ idTagihan }: { idTagihan: string }) {
  const [tagihan, setTagihan] = useState<ITagihan | null>(null)
  const [pembayaranList, setPembayaranList] = useState<IPembayaran[]>([])

  const refresh = async () => {
    const [t, p] = await Promise.all([
      tagihanService.getById(idTagihan),
      pembayaranService.getByTagihan(idTagihan),
    ])
    setTagihan(t.data.data)
    setPembayaranList(p.data.data)
  }

  useEffect(() => { refresh() }, [idTagihan])

  const handleBayar = async (form: ICreatePembayaran) => {
    try {
      await pembayaranService.create(form)
      await refresh()  // ⚠️ Fetch ulang — total_bayar & status otomatis berubah
    } catch (err) {
      console.error(parseApiError(err))
    }
  }

  if (!tagihan) return null

  const sisa = tagihan.total_harga - tagihan.total_bayar

  return (
    <div>
      <p>Status: <span>{formatStatusTagihan(tagihan.status)}</span></p>
      <p>Total: {formatRupiah(tagihan.total_harga)}</p>
      <p>Sudah dibayar: {formatRupiah(tagihan.total_bayar)}</p>
      <p>Sisa: {formatRupiah(sisa)}</p>

      <h3>Riwayat Pembayaran</h3>
      {pembayaranList.map(p => (
        <div key={p.id_pembayaran}>
          {p.tanggal_bayar} — {formatRupiah(p.jumlah)} via {p.metode}
        </div>
      ))}

      {tagihan.status !== 3 && tagihan.status !== 4 && (
        <button onClick={() => handleBayar({
          id_tagihan: idTagihan,
          jumlah: sisa,
          tanggal_bayar: new Date().toISOString().slice(0, 10),
          metode: 'TRANSFER',
        })}>
          Lunasi Sekarang
        </button>
      )}
    </div>
  )
}
```

### Dropdown Tarif berdasarkan Program

```tsx
'use client'
import { useEffect, useState } from 'react'
import { tarifService } from '@/services/kursus/tarif.service'
import type { ITarif } from '@/@types/kursus.types'

export function TarifSelect({ idProgram, value, onChange }: {
  idProgram: string
  value: string
  onChange: (id: string) => void
}) {
  const [options, setOptions] = useState<ITarif[]>([])

  useEffect(() => {
    if (!idProgram) return
    tarifService.getByProgram(idProgram)
      .then(res => setOptions(res.data.data))
  }, [idProgram])

  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">-- Pilih Tarif --</option>
      {options.map(t => (
        <option key={t.id_tarif} value={t.id_tarif}>
          {t.nama} — Rp {parseFloat(t.harga).toLocaleString('id-ID')}
        </option>
      ))}
    </select>
  )
}
```

---

## 6. Error Handling — Kasus Khusus Kursus

| Endpoint | HTTP Status | Pesan | Penyebab |
|----------|:-----------:|-------|---------|
| `POST /kursus/daftar-kelas` | 400 | `Kuota kelas penuh` | Siswa aktif di jadwal >= kuota |
| `POST /kursus/program-pengajaran` | 409 | `Kode program sudah digunakan` | `kode_program` duplikat |
| `PATCH /kursus/program-pengajaran/:id` | 409 | `Kode program sudah digunakan` | `kode_program` baru milik program lain |
| `POST /kursus/tarif` | 404 | `Program pengajaran dengan ID '...' tidak ditemukan` | `id_program` tidak valid |
| `POST /kursus/jadwal-kelas` | 404 | `Program pengajaran dengan ID '...' tidak ditemukan` | `id_program` tidak valid |
| `POST /kursus/presensi` | 404 | `Siswa tidak terdaftar di jadwal ini` | Siswa belum di-daftarkan ke jadwal |
| `POST /kursus/presensi` | 409 | `Presensi siswa ini di jadwal ini sudah ada` | Gunakan PATCH atau batch |
| Semua `GET /:id` | 404 | `[Entitas] dengan ID '...' tidak ditemukan` | UUID salah atau sudah dihapus |

```typescript
// Tangani error spesifik di komponen:
try {
  await daftarKelasService.create(formData)
} catch (err) {
  if (err instanceof AxiosError) {
    const status = err.response?.status
    const message = err.response?.data?.message

    if (status === 400 && message === 'Kuota kelas penuh') {
      setError('Maaf, kelas ini sudah penuh. Pilih jadwal lain.')
      return
    }
    if (status === 409) {
      setError('Kode program sudah digunakan, coba kode lain.')
      return
    }
  }
  setError(parseApiError(err))  // fallback generic
}
```

---

## 7. Helper — Format Data Kursus

Tambahkan ke `src/utils/format.util.ts`:

```typescript
// Konversi angka hari ke nama hari Indonesia
export const formatHari = (hari: number): string => {
  const map: Record<number, string> = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis',
    5: 'Jumat', 6: 'Sabtu', 7: 'Minggu',
  }
  return map[hari] ?? '-'
}

// Format status daftar kelas
export const formatStatusDaftar = (status: number): string => {
  const map: Record<number, string> = {
    1: 'Aktif', 2: 'Selesai', 3: 'Berhenti',
  }
  return map[status] ?? '-'
}

// Format jenis kelamin
export const formatJenisKelamin = (jk: number | null): string => {
  if (jk === 1) return 'Laki-laki'
  if (jk === 2) return 'Perempuan'
  return '-'
}

// Format harga tarif (harga dari backend adalah string DECIMAL)
export const formatHarga = (harga: string | number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })
    .format(typeof harga === 'string' ? parseFloat(harga) : harga)

// Warna badge status daftar kelas (untuk Tailwind)
export const statusDaftarColor = (status: number): string => {
  if (status === 1) return 'bg-green-100 text-green-700'   // Aktif
  if (status === 2) return 'bg-blue-100 text-blue-700'     // Selesai
  if (status === 3) return 'bg-red-100 text-red-700'       // Berhenti
  return 'bg-gray-100 text-gray-700'
}

// Format status presensi
export const formatStatusPresensi = (status: number): string => {
  const map: Record<number, string> = {
    1: 'Hadir', 2: 'Tidak Hadir', 3: 'Sakit', 4: 'Izin',
  }
  return map[status] ?? '-'
}

export const statusPresensiColor = (status: number): string => {
  if (status === 1) return 'bg-green-100 text-green-700'   // Hadir
  if (status === 2) return 'bg-red-100 text-red-700'       // Tidak Hadir
  if (status === 3) return 'bg-yellow-100 text-yellow-700' // Sakit
  if (status === 4) return 'bg-blue-100 text-blue-700'     // Izin
  return 'bg-gray-100 text-gray-700'
}

// Format status tagihan
export const formatStatusTagihan = (status: number): string => {
  const map: Record<number, string> = {
    1: 'Menunggu', 2: 'Sebagian', 3: 'Lunas', 4: 'Dibatalkan',
  }
  return map[status] ?? '-'
}

export const statusTagihanColor = (status: number): string => {
  if (status === 1) return 'bg-yellow-100 text-yellow-700' // Menunggu
  if (status === 2) return 'bg-blue-100 text-blue-700'     // Sebagian
  if (status === 3) return 'bg-green-100 text-green-700'   // Lunas
  if (status === 4) return 'bg-red-100 text-red-700'       // Dibatalkan
  return 'bg-gray-100 text-gray-700'
}

// Format metode pembayaran
export const formatMetodePembayaran = (metode: string): string => {
  const map: Record<string, string> = {
    TUNAI: 'Tunai', TRANSFER: 'Transfer Bank', QRIS: 'QRIS',
  }
  return map[metode] ?? metode
}

// Format rupiah (untuk angka, bukan string DECIMAL)
export const formatRupiah = (nominal: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(nominal)
```

---

## 8. Struktur Halaman yang Disarankan

```
src/app/(protected-pages)/kursus/
├── siswa/
│   ├── page.tsx                  ← List siswa (tabel + search + pagination)
│   ├── create/
│   │   └── page.tsx              ← Form tambah siswa
│   └── [id]/
│       └── page.tsx              ← Detail siswa + riwayat kelas yang diikuti

├── program-pengajaran/
│   ├── page.tsx                  ← List program (tabel + search)
│   ├── create/
│   │   └── page.tsx              ← Form tambah program
│   └── [id]/
│       └── page.tsx              ← Detail + tarif + jadwal terkait program

├── tarif/
│   ├── page.tsx                  ← List tarif (tabel, bisa filter per program)
│   ├── create/
│   │   └── page.tsx              ← Form tambah tarif (pilih program dulu)
│   └── [id]/
│       └── page.tsx              ← Detail tarif

├── jadwal-kelas/
│   ├── page.tsx                  ← List jadwal (tabel + search instruktur/lokasi)
│   ├── create/
│   │   └── page.tsx              ← Form tambah jadwal (pilih program)
│   └── [id]/
│       └── page.tsx              ← Detail jadwal + info kuota + peserta

├── daftar-kelas/
│   ├── page.tsx                  ← List semua pendaftaran (enriched)
│   ├── create/
│   │   └── page.tsx              ← Form daftarkan siswa (pilih siswa, jadwal, tarif)
│   └── [id]/
│       └── page.tsx              ← Detail pendaftaran + update status

├── presensi/
│   └── page.tsx                  ← Kalender absensi — klik tanggal → absen list

├── tagihan/
│   ├── page.tsx                  ← List tagihan (tabel + search + filter status)
│   ├── create/
│   │   └── page.tsx              ← Form buat tagihan manual
│   └── [id]/
│       └── page.tsx              ← Detail tagihan + riwayat pembayaran + form bayar

├── pembayaran/
│   └── page.tsx                  ← List semua pembayaran (history global)

└── dashboard/
    └── page.tsx                  ← KPI cards + chart pendapatan + chart per-program
                                     + jadwal hari ini + pembayaran terbaru + alert monitoring
```

---

## 9. Catatan Penting untuk Frontend

| # | Catatan |
|---|---------|
| 1 | `harga` pada `ITarif` adalah **string** (MySQL DECIMAL) — selalu `parseFloat(tarif.harga)` sebelum dihitung/ditampilkan |
| 2 | `aktif` pada semua entitas adalah **number** (`0` atau `1`), bukan boolean |
| 3 | `jenis_kelamin`, `hari`, `status` adalah **number** — gunakan helper `formatHari()`, `formatStatusDaftar()`, `formatJenisKelamin()` untuk tampilan |
| 4 | Cek kuota (`GET /jadwal-kelas/:id/kuota`) sebelum tampilkan form daftar kelas untuk UX yang lebih baik |
| 5 | `GET /kursus/tarif/program/:id_program` berguna untuk dropdown pilih tarif di form daftar kelas |
| 6 | Response `daftar-kelas` sudah enriched (nested siswa + jadwal + program + tarif) — tidak perlu request terpisah |
| 7 | `tanggal_lahir` dan `tanggal_daftar` dikirim sebagai **string** format `"YYYY-MM-DD"` |
| 8 | `total_bayar` pada tagihan adalah **auto-calculated** — jangan kirim field ini, akan salah |
| 9 | Setelah `POST /pembayaran` atau `DELETE /pembayaran/:id`, **fetch ulang tagihan** untuk tampilkan `status` dan `total_bayar` terbaru |
| 10 | `tanggal_bayar` pembayaran adalah **string** `"YYYY-MM-DD"` — bukan Date object |
| 11 | Absen batch pakai `id_daftar` (dari `GET /presensi/jadwal/:id_jadwal`), bukan `id_siswa` |
| 12 | `presensiService.getBySiswa()` return `{ data, sesi_terpakai }` — `sesi_terpakai` hitung sesi HADIR saja (untuk cek kuota paket) |
| 13 | Export jadwal Excel (`jadwalKelasService.exportExcel(bulan)`) return `responseType: 'blob'` — buat `URL.createObjectURL` untuk trigger download |
| 14 | `GET /kursus/siswa/monitoring?expiring_days=N` — `berhenti` = siswa stop kelas, `akan_expired` = siswa aktif mendekati akhir jadwal |
| 15 | `GET /kursus/dashboard/summary` mencakup semua data dashboard dalam 1 request — gunakan saat mount halaman dashboard |
| 16 | `pendapatan_bulan_ini` di dashboard = SUM dari tabel `pembayaran`, bukan dari `tagihan.total_harga` |

---

**Document Version:** 1.2
**Last Updated:** 2026-03-24
**Owner:** @ideora-tech
