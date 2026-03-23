# Dokumentasi Modul Kursus — Frontend (Next.js)

> Panduan ini mencerminkan **implementasi aktual** modul Kursus Dansa per 2026-03-23.
> Berisi types, service, endpoint, komponen, dan catatan perilaku penting.

---

## 1. Types — `src/@types/kursus.types.ts`

```typescript
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
    week_start?: string   // "YYYY-MM-DD" — filter jadwal yang overlap dengan range
    week_end?: string     // "YYYY-MM-DD"
}

// ─── Siswa ────────────────────────────────────────────────────────────────────

export interface ISiswa {
    id_siswa: string
    nama: string
    email: string | null
    telepon: string | null
    tanggal_lahir: string | null   // "YYYY-MM-DD"
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
    tanggal_lahir?: string
    alamat?: string
    jenis_kelamin?: 1 | 2
    foto_url?: string
}

export type IUpdateSiswa = Partial<ICreateSiswa> & { aktif?: 0 | 1 }

// ─── Tingkat Program ──────────────────────────────────────────────────────────

export interface ITingkatProgram {
    id_tingkat: string
    kode: string
    nama: string
    urutan: number
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateTingkatProgram {
    kode: string
    nama: string
    urutan?: number
}

export type IUpdateTingkatProgram = Partial<ICreateTingkatProgram> & { aktif?: 0 | 1 }

// ─── Program Pengajaran ───────────────────────────────────────────────────────

export interface IProgramPengajaran {
    id_program: string
    kode_program: string
    nama: string
    deskripsi: string | null
    tingkat: string | null
    durasi_menit: number
    aktif: number
    dibuat_pada: string
    diubah_pada: string | null
}

export interface ICreateProgramPengajaran {
    kode_program: string
    nama: string
    deskripsi?: string
    tingkat?: string
    durasi_menit?: number
}

export type IUpdateProgramPengajaran = Partial<ICreateProgramPengajaran> & { aktif?: 0 | 1 }

// ─── Tarif ────────────────────────────────────────────────────────────────────

export interface ITarif {
    id_tarif: string
    id_program: string
    nama: string
    jenis: 'PER_SESI' | 'PAKET'
    jumlah_pertemuan: number | null
    harga: string                    // DECIMAL dari MySQL → string, pakai parseFloat()
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
// ⚠️ PENTING: Backend mengembalikan datetime dengan SPASI sebagai separator
//    contoh: "2026-03-23 08:00:00" — BUKAN "2026-03-23T08:00:00"
//    Selalu gunakan .replace(' ', 'T') sebelum new Date()

export interface IJadwalKelas {
    id_jadwal: string
    id_program: string
    nama: string
    instruktur: string | null
    lokasi: string | null
    kuota: number
    aktif: number
    tanggal_mulai: string   // "YYYY-MM-DD HH:MM:SS" — jam mulai tertanam di sini
    tanggal_selesai: string // "YYYY-MM-DD HH:MM:SS" — jam selesai tertanam di sini
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IKuotaJadwal {
    kuota: number
    terisi: number
    sisa: number
}

// ⚠️ CREATE dan UPDATE pakai format BERBEDA

export interface ICreateJadwalKelas {
    id_program: string
    nama: string
    tanggal_mulai: string   // "YYYY-MM-DD" — tanggal saja
    tanggal_selesai: string // "YYYY-MM-DD" — tanggal saja
    jam_mulai: string       // "HH:MM" — dikirim terpisah saat CREATE
    jam_selesai: string     // "HH:MM" — dikirim terpisah saat CREATE
    instruktur?: string
    lokasi?: string
    kuota?: number
}

export interface IUpdateJadwalKelas {
    id_program?: string
    nama?: string
    tanggal_mulai?: string   // "YYYY-MM-DD HH:MM:00" — combined datetime saat UPDATE
    tanggal_selesai?: string // "YYYY-MM-DD HH:MM:00" — combined datetime saat UPDATE
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
    tanggal_daftar: string   // "YYYY-MM-DD"
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

## 2. API Endpoint Constants — `src/constants/api.constant.ts`

```typescript
KURSUS: {
    TINGKAT: {
        BASE: `${PROXY}/kursus/tingkat-program`,
        BY_ID: (id: string) => `${PROXY}/kursus/tingkat-program/${id}`,
    },
    SISWA: {
        BASE: `${PROXY}/kursus/siswa`,
        BY_ID: (id: string) => `${PROXY}/kursus/siswa/${id}`,
        IMPORT: `${PROXY}/kursus/siswa/upload/excel`,
        TEMPLATE: `${PROXY}/kursus/siswa/template/excel`,
    },
    PROGRAM: {
        BASE: `${PROXY}/kursus/program-pengajaran`,
        BY_ID: (id: string) => `${PROXY}/kursus/program-pengajaran/${id}`,
    },
    TARIF: {
        BASE: `${PROXY}/kursus/tarif`,
        BY_ID: (id: string) => `${PROXY}/kursus/tarif/${id}`,
        BY_PROGRAM: (idProgram: string) => `${PROXY}/kursus/tarif/program/${idProgram}`,
    },
    JADWAL: {
        BASE: `${PROXY}/kursus/jadwal-kelas`,
        BY_ID: (id: string) => `${PROXY}/kursus/jadwal-kelas/${id}`,
        KUOTA: (id: string) => `${PROXY}/kursus/jadwal-kelas/${id}/kuota`,
        EXPORT: (weekStart: string, weekEnd: string) =>
            `${PROXY}/kursus/jadwal-kelas/export?week_start=${weekStart}&week_end=${weekEnd}`,
    },
    DAFTAR: {
        BASE: `${PROXY}/kursus/daftar-kelas`,
        BY_ID: (id: string) => `${PROXY}/kursus/daftar-kelas/${id}`,
        BY_SISWA: (idSiswa: string) => `${PROXY}/kursus/daftar-kelas/siswa/${idSiswa}`,
        BY_JADWAL: (idJadwal: string) => `${PROXY}/kursus/daftar-kelas/jadwal/${idJadwal}`,
    },
},
```

---

## 3. Services — `src/services/kursus/`

### Method yang tersedia per service

| Service | File | Methods |
|---------|------|---------|
| Siswa | `siswa.service.ts` | `getAll`, `getById`, `create`, `update`, `remove`, `importExcel(file)`, `downloadTemplate()` |
| Program Pengajaran | `program-pengajaran.service.ts` | `getAll`, `getById`, `create`, `update`, `remove` |
| Tarif | `tarif.service.ts` | `getAll`, `getByProgram(idProgram)`, `getById`, `create`, `update`, `remove` |
| Jadwal Kelas | `jadwal-kelas.service.ts` | `getAll(query)`, `getKuota(id)`, `getById`, `create`, `update`, `remove` |
| Daftar Kelas | `daftar-kelas.service.ts` | `getAll`, `getBySiswa(id)`, `getByJadwal(id)`, `getById`, `create`, `update`, `remove` |

### Catatan penting service

```typescript
// Jadwal — getAll mendukung filter range tanggal (overlap logic di backend)
JadwalKelasService.getAll({
    week_start: '2026-03-23',  // Backend: WHERE tanggal_mulai <= week_end
    week_end: '2026-03-29',    //         AND tanggal_selesai >= week_start
    limit: 500,
})

// Siswa — importExcel kirim multipart/form-data
SiswaService.importExcel(file: File)
// field: "file", response: { berhasil, gagal, errors[] }

// Siswa — downloadTemplate trigger download langsung (no return)
SiswaService.downloadTemplate()
// → GET /kursus/siswa/template/excel → file Template_Import_Siswa.xlsx
```

---

## 4. Halaman — `src/app/(protected-pages)/kursus/`

```
kursus/
├── siswa/
│   ├── page.tsx                  ← List + Import Excel + Download Template + Delete
│   ├── tambah/
│   │   └── page.tsx              ← Form tambah siswa
│   └── [id]/
│       └── edit/
│           └── page.tsx          ← Form edit siswa
│
├── tingkat-program/
│   └── page.tsx                  ← List master tingkat (CRUD inline modal)
│
├── program-pengajaran/
│   ├── page.tsx                  ← List program + CRUD
│   ├── tambah/
│   │   └── page.tsx
│   └── [id]/
│       └── edit/
│           └── page.tsx
│
├── tarif/
│   └── page.tsx                  ← List tarif (filter per program)
│
├── jadwal-kelas/
│   └── page.tsx                  ← Kalender view + Drawer siswa (NO tabel)
│
└── daftar-kelas/
    ├── page.tsx
    ├── tambah/
    │   └── page.tsx
    └── [id]/
        └── edit/
            └── page.tsx
```

---

## 5. Komponen — `src/components/kursus/`

### `jadwal/JadwalKalender.tsx`

Kalender jadwal per instruktur. **Self-fetching** — mengambil data sendiri berdasarkan range tanggal.

```typescript
interface JadwalKalenderProps {
    refreshToken?: number           // increment untuk trigger re-fetch dari parent
    onView: (item: IJadwalKelas) => void   // klik card → buka drawer detail
    onEdit: (item: IJadwalKelas) => void   // klik ikon edit → buka form edit
    onDelete: (item: IJadwalKelas) => void // klik ikon hapus → confirm dialog
}
```

**Perilaku penting:**
- Navigasi dengan `DatePickerRange` + tombol prev/next + "Hari Ini"
- Fetch otomatis saat `rangeStart`/`rangeEnd` berubah atau `refreshToken` naik
- Group by instruktur → tiap baris 1 instruktur
- Jadwal ditampilkan di **semua hari yang dicakup** range tanggal_mulai–tanggal_selesai
- `diffDays` dihitung dari **tanggal saja** (tanpa jam) agar jam tidak mempengaruhi hitungan
- Klik card → `onView`, tombol edit/hapus di dalam card pakai `e.stopPropagation()`
- Ada tombol "Unduh Excel" (kirim ke endpoint EXPORT)
- Ada search instruktur (filter lokal, tidak re-fetch)

**Helper functions di dalam file:**
```typescript
hariFromISO(iso: string): number   // "YYYY-MM-DD HH:MM:SS" → hari 1-7
timeFromISO(iso: string): string   // "YYYY-MM-DD HH:MM:SS" → "HH:MM"
// ⚠️ Backend pakai spasi, bukan T — helper handle keduanya
```

---

### `jadwal/JadwalForm.tsx`

Dialog create/edit jadwal kelas.

```typescript
interface JadwalFormProps {
    open: boolean
    editData?: IJadwalKelas | null
    programList?: IProgramPengajaran[]
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateJadwalKelas | IUpdateJadwalKelas) => void
}
```

**Perbedaan CREATE vs UPDATE payload:**
```typescript
// CREATE → field terpisah
{ tanggal_mulai: "2026-03-23", tanggal_selesai: "2026-03-30", jam_mulai: "08:00", jam_selesai: "17:00" }

// UPDATE (PATCH) → combined datetime, TANPA jam_mulai/jam_selesai
{ tanggal_mulai: "2026-03-23 08:00:00", tanggal_selesai: "2026-03-30 17:00:00" }
```

**Helper functions di dalam file:**
```typescript
isoToDate(iso)   // "YYYY-MM-DD HH:MM:SS" → Date (bagian tanggal saja)
isoToTime(iso)   // "YYYY-MM-DD HH:MM:SS" → "HH:MM"
dateToYMD(d)     // Date → "YYYY-MM-DD"
toDateTime(d, t) // Date + "HH:MM" → "YYYY-MM-DD HH:MM:00" (untuk PATCH)
```

- Instruktur diambil dari `KaryawanService.getAll({ limit: 200, aktif: 1 })` saat dialog buka
- Tanggal Selesai auto-fill dari Tanggal Mulai jika belum diisi
- `minDate` pada DatePicker Selesai = tanggal mulai yang dipilih
- Status aktif/nonaktif hanya muncul saat mode edit

---

### `jadwal/JadwalDetailDrawer.tsx`

Drawer (slide dari kanan) untuk manajemen siswa dalam satu jadwal.

```typescript
interface JadwalDetailDrawerProps {
    open: boolean
    jadwal: IJadwalKelas | null
    onClose: () => void
    onRefresh?: () => void   // dipanggil setelah enroll/hapus siswa berhasil
}
```

**Sections dalam drawer:**
1. **Header info** — nama jadwal, jam, tanggal range, instruktur, lokasi
2. **Kuota bar** — progress bar terisi/total, label "Penuh" jika kuota habis
3. **List siswa terdaftar** — dari `DaftarSiswaService.getByJadwal(id_jadwal)`
4. **Tombol "Daftarkan Siswa"** → buka `Dialog` enroll (disabled jika kuota penuh)

**Sub-modal Enroll Siswa:**
- Search siswa dengan debounce 400ms → `SiswaService.getAll({ search, limit: 20, aktif: 1 })`
- Pilih siswa dari hasil pencarian → tampil badge konfirmasi
- Pilih tarif (opsional) dari `TarifService.getByProgram(id_program)`
- Input tanggal daftar (DatePicker, default = hari ini)
- Submit → `DaftarSiswaService.create({ id_siswa, id_jadwal, tanggal_daftar, id_tarif? })`

**Sub-modal Edit Status:**
- Select status: Aktif (1) / Selesai (2) / Berhenti (3)
- Input catatan opsional
- Submit → `DaftarSiswaService.update(id_daftar, { status, catatan? })`

**Auto-close:** `onRequestClose={onClose}` — menutup saat klik backdrop

---

### `siswa/SiswaImportModal.tsx`

Dialog import siswa dari file Excel.

```typescript
interface SiswaImportModalProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void   // dipanggil setelah import berhasil → trigger fetchData()
}
```

**Flow:**
1. Drag & drop atau pilih file `.xlsx` (validasi tipe file dengan `beforeUpload`)
2. Klik "Import" → `SiswaService.importExcel(file)` → POST ke `/kursus/siswa/upload/excel`
3. Setelah berhasil → tampil hasil: jumlah berhasil, gagal, dan list error per baris
4. Tombol "Import Lagi" untuk reset form, "Selesai" untuk tutup

**Kolom template Excel yang didukung backend:**
| Kolom | Keterangan |
|-------|-----------|
| `nama` | Wajib |
| `email` | Opsional |
| `telepon` | Opsional |
| `tanggal_lahir` | Format YYYY-MM-DD |
| `jenis_kelamin` | 1 = Laki-laki, 2 = Perempuan |
| `alamat` | Opsional |

---

## 6. Halaman `/kursus/siswa` — Fitur di Header

```tsx
// 3 tombol di header card:
<Button icon={<HiOutlineDownload />} onClick={handleDownloadTemplate}>Template Excel</Button>
<Button icon={<HiOutlineUpload />} onClick={() => setImportOpen(true)}>Import Excel</Button>
<Button variant="solid" icon={<HiPlusCircle />} onClick={() => router.push('/kursus/siswa/tambah')}>Tambah Siswa</Button>
```

---

## 7. Catatan Penting

| # | Catatan |
|---|---------|
| 1 | Backend mengembalikan datetime dengan **spasi** sebagai separator: `"2026-03-23 08:00:00"` — selalu `iso.replace(' ', 'T')` sebelum `new Date()` |
| 2 | `CREATE` jadwal kirim field terpisah (`jam_mulai`, `jam_selesai`) — `UPDATE` jadwal kirim combined (`tanggal_mulai: "YYYY-MM-DD HH:MM:00"`) tanpa jam |
| 3 | `diffDays` di kalender dihitung dari **tanggal saja** (bukan datetime) agar jam tidak menyebabkan jadwal bocor ke hari berikutnya |
| 4 | Backend filter jadwal dengan overlap: `WHERE tanggal_mulai <= week_end AND tanggal_selesai >= week_start` |
| 5 | `harga` pada `ITarif` adalah **string** (MySQL DECIMAL) — selalu `parseFloat(tarif.harga)` sebelum dihitung/ditampilkan |
| 6 | `aktif` pada semua entitas adalah **number** (`0` atau `1`), bukan boolean |
| 7 | Format Rupiah: gunakan `formatRupiah()` dari `@/utils/formatNumber` — jangan `toLocaleString('id-ID')` (hydration error) |
| 8 | Untuk upload multipart: `ApiService.fetchDataWithAxios<Response, FormData>({ data: formData })` |
| 9 | `JadwalKalender` adalah **self-fetching** — parent tidak perlu pass data, cukup `refreshToken` |
| 10 | `JadwalDetailDrawer` load data (kuota + daftar siswa + tarif) saat pertama kali `open && jadwal` |

---

**Last Updated:** 2026-03-23
