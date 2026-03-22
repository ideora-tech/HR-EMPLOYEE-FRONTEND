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
// PROGRAM PENGAJARAN
// ============================================================
export interface IProgramPengajaran {
  id_program: string
  kode_program: string            // format: A-Z0-9_ (contoh: "TARI_BALI_01")
  nama: string
  deskripsi: string | null
  tingkat: 'PEMULA' | 'MENENGAH' | 'MAHIR' | null
  durasi_menit: number            // default: 60
  aktif: number
  dibuat_pada: string
  diubah_pada: string | null
}

export interface ICreateProgramPengajaran {
  kode_program: string
  nama: string
  deskripsi?: string
  tingkat?: 'PEMULA' | 'MENENGAH' | 'MAHIR'
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
```

---

## 2. API Endpoint Constants — tambahkan ke `src/constants/api.constant.ts`

```typescript
// Tambahkan di dalam object API_ENDPOINTS yang sudah ada:

kursus: {
  // Siswa
  siswa: {
    list:   '/kursus/siswa',
    detail: (id: string) => `/kursus/siswa/${id}`,
    create: '/kursus/siswa',
    update: (id: string) => `/kursus/siswa/${id}`,
    delete: (id: string) => `/kursus/siswa/${id}`,
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
},
```

---

## 4. Services — `src/services/kursus/`

### `siswa.service.ts`

```typescript
import apiClient from '@/services/api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ISiswa, ICreateSiswa, IUpdateSiswa } from '@/@types/kursus.types'
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

  remove: (id: string) =>
    apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.kursus.jadwal.delete(id)
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

└── daftar-kelas/
    ├── page.tsx                  ← List semua pendaftaran (enriched)
    ├── create/
    │   └── page.tsx              ← Form daftarkan siswa (pilih siswa, jadwal, tarif)
    └── [id]/
        └── page.tsx              ← Detail pendaftaran + update status
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

---

**Document Version:** 1.0
**Last Updated:** 2026-03-22
**Owner:** @ideora-tech
