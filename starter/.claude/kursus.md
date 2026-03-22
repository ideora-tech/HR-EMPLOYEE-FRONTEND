# Dokumentasi Modul Kursus Dansa

> File ini adalah referensi teknis untuk 5 modul kursus dansa yang terpisah dari sistem HR/Payroll.
> Semua endpoint menggunakan prefix `/kursus` dan membutuhkan JWT Bearer Token.

---

## 1. Dependency Chain

```
siswa              ← tidak ada deps
program-pengajaran ← tidak ada deps
tarif              ← depends on program-pengajaran
jadwal-kelas       ← depends on program-pengajaran
daftar-kelas       ← depends on siswa + jadwal-kelas + tarif
```

---

## 2. Database Schema

### Tabel `siswa`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id_siswa` | VARCHAR(36) PK | UUID |
| `nama` | VARCHAR(100) NOT NULL | |
| `email` | VARCHAR(100) NULL | |
| `telepon` | VARCHAR(20) NULL | |
| `tanggal_lahir` | DATE NULL | |
| `alamat` | TEXT NULL | |
| `jenis_kelamin` | TINYINT NULL | 1=L, 2=P |
| `foto_url` | VARCHAR(255) NULL | |
| `aktif` + 6 audit cols | | `dibuat_pada`, `dibuat_oleh`, `diubah_pada`, `diubah_oleh`, `dihapus_pada`, `dihapus_oleh` |

### Tabel `program_pengajaran`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id_program` | VARCHAR(36) PK | UUID |
| `kode_program` | VARCHAR(50) UNIQUE | Conflict 409 jika duplikat |
| `nama` | VARCHAR(100) NOT NULL | |
| `deskripsi` | TEXT NULL | |
| `tingkat` | VARCHAR(20) NULL | `PEMULA` / `MENENGAH` / `MAHIR` |
| `durasi_menit` | INT DEFAULT 60 | |
| `aktif` + 6 audit cols | | |

### Tabel `tarif`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id_tarif` | VARCHAR(36) PK | UUID |
| `id_program` | VARCHAR(36) FK | → `program_pengajaran.id_program` |
| `nama` | VARCHAR(100) NOT NULL | contoh: "Per Sesi", "Paket 8x" |
| `jenis` | VARCHAR(20) NOT NULL | `PER_SESI` / `PAKET` |
| `jumlah_pertemuan` | INT NULL | Hanya untuk jenis `PAKET` |
| `harga` | DECIMAL(12,2) NOT NULL | |
| `aktif` + 6 audit cols | | |

### Tabel `jadwal_kelas`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id_jadwal` | VARCHAR(36) PK | UUID |
| `id_program` | VARCHAR(36) FK | → `program_pengajaran.id_program` |
| `nama` | VARCHAR(100) NOT NULL | |
| `hari` | TINYINT NOT NULL | 1=Senin ... 7=Minggu |
| `jam_mulai` | VARCHAR(5) NOT NULL | Format `HH:MM` |
| `jam_selesai` | VARCHAR(5) NOT NULL | Format `HH:MM` |
| `instruktur` | VARCHAR(100) NULL | |
| `lokasi` | VARCHAR(100) NULL | |
| `kuota` | INT DEFAULT 10 | Maks siswa aktif per kelas |
| `aktif` + 6 audit cols | | |

### Tabel `daftar_kelas`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id_daftar` | VARCHAR(36) PK | UUID |
| `id_siswa` | VARCHAR(36) FK | → `siswa.id_siswa` |
| `id_jadwal` | VARCHAR(36) FK | → `jadwal_kelas.id_jadwal` |
| `id_tarif` | VARCHAR(36) FK NULL | → `tarif.id_tarif` |
| `tanggal_daftar` | DATE NOT NULL | |
| `status` | TINYINT DEFAULT 1 | 1=AKTIF, 2=SELESAI, 3=BERHENTI |
| `catatan` | TEXT NULL | |
| `aktif` + 6 audit cols | | |

---

## 3. SQL DDL

```sql
-- ============================================================
-- TABEL: siswa
-- ============================================================
CREATE TABLE siswa (
  id_siswa       VARCHAR(36)    NOT NULL,
  nama           VARCHAR(100)   NOT NULL,
  email          VARCHAR(100)   NULL,
  telepon        VARCHAR(20)    NULL,
  tanggal_lahir  DATE           NULL,
  alamat         TEXT           NULL,
  jenis_kelamin  TINYINT(1)     NULL COMMENT '1=L, 2=P',
  foto_url       VARCHAR(255)   NULL,
  aktif          TINYINT(1)     NOT NULL DEFAULT 1,
  dibuat_pada    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dibuat_oleh    VARCHAR(36)    NULL,
  diubah_pada    DATETIME       NULL,
  diubah_oleh    VARCHAR(36)    NULL,
  dihapus_pada   DATETIME       NULL,
  dihapus_oleh   VARCHAR(36)    NULL,
  PRIMARY KEY (id_siswa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL: program_pengajaran
-- ============================================================
CREATE TABLE program_pengajaran (
  id_program     VARCHAR(36)    NOT NULL,
  kode_program   VARCHAR(50)    NOT NULL,
  nama           VARCHAR(100)   NOT NULL,
  deskripsi      TEXT           NULL,
  tingkat        VARCHAR(20)    NULL COMMENT 'PEMULA/MENENGAH/MAHIR',
  durasi_menit   INT            NOT NULL DEFAULT 60,
  aktif          TINYINT(1)     NOT NULL DEFAULT 1,
  dibuat_pada    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dibuat_oleh    VARCHAR(36)    NULL,
  diubah_pada    DATETIME       NULL,
  diubah_oleh    VARCHAR(36)    NULL,
  dihapus_pada   DATETIME       NULL,
  dihapus_oleh   VARCHAR(36)    NULL,
  PRIMARY KEY (id_program),
  UNIQUE KEY uq_kode_program (kode_program)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL: tarif
-- ============================================================
CREATE TABLE tarif (
  id_tarif           VARCHAR(36)     NOT NULL,
  id_program         VARCHAR(36)     NOT NULL,
  nama               VARCHAR(100)    NOT NULL,
  jenis              VARCHAR(20)     NOT NULL COMMENT 'PER_SESI/PAKET',
  jumlah_pertemuan   INT             NULL,
  harga              DECIMAL(12,2)   NOT NULL,
  aktif              TINYINT(1)      NOT NULL DEFAULT 1,
  dibuat_pada        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dibuat_oleh        VARCHAR(36)     NULL,
  diubah_pada        DATETIME        NULL,
  diubah_oleh        VARCHAR(36)     NULL,
  dihapus_pada       DATETIME        NULL,
  dihapus_oleh       VARCHAR(36)     NULL,
  PRIMARY KEY (id_tarif),
  FOREIGN KEY (id_program) REFERENCES program_pengajaran(id_program)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL: jadwal_kelas
-- ============================================================
CREATE TABLE jadwal_kelas (
  id_jadwal    VARCHAR(36)   NOT NULL,
  id_program   VARCHAR(36)   NOT NULL,
  nama         VARCHAR(100)  NOT NULL,
  hari         TINYINT       NOT NULL COMMENT '1=Senin s/d 7=Minggu',
  jam_mulai    VARCHAR(5)    NOT NULL COMMENT 'HH:MM',
  jam_selesai  VARCHAR(5)    NOT NULL COMMENT 'HH:MM',
  instruktur   VARCHAR(100)  NULL,
  lokasi       VARCHAR(100)  NULL,
  kuota        INT           NOT NULL DEFAULT 10,
  aktif        TINYINT(1)    NOT NULL DEFAULT 1,
  dibuat_pada  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dibuat_oleh  VARCHAR(36)   NULL,
  diubah_pada  DATETIME      NULL,
  diubah_oleh  VARCHAR(36)   NULL,
  dihapus_pada DATETIME      NULL,
  dihapus_oleh VARCHAR(36)   NULL,
  PRIMARY KEY (id_jadwal),
  FOREIGN KEY (id_program) REFERENCES program_pengajaran(id_program)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL: daftar_kelas
-- ============================================================
CREATE TABLE daftar_kelas (
  id_daftar       VARCHAR(36)  NOT NULL,
  id_siswa        VARCHAR(36)  NOT NULL,
  id_jadwal       VARCHAR(36)  NOT NULL,
  id_tarif        VARCHAR(36)  NULL,
  tanggal_daftar  DATE         NOT NULL,
  status          TINYINT      NOT NULL DEFAULT 1 COMMENT '1=AKTIF,2=SELESAI,3=BERHENTI',
  catatan         TEXT         NULL,
  aktif           TINYINT(1)   NOT NULL DEFAULT 1,
  dibuat_pada     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dibuat_oleh     VARCHAR(36)  NULL,
  diubah_pada     DATETIME     NULL,
  diubah_oleh     VARCHAR(36)  NULL,
  dihapus_pada    DATETIME     NULL,
  dihapus_oleh    VARCHAR(36)  NULL,
  PRIMARY KEY (id_daftar),
  FOREIGN KEY (id_siswa)  REFERENCES siswa(id_siswa),
  FOREIGN KEY (id_jadwal) REFERENCES jadwal_kelas(id_jadwal),
  FOREIGN KEY (id_tarif)  REFERENCES tarif(id_tarif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. API Endpoints

> Semua endpoint membutuhkan: `Authorization: Bearer <JWT>`
> Base prefix: `/kursus`

### 4.1 Siswa — `GET|POST|PATCH|DELETE /kursus/siswa`

| Method | Path | Deskripsi | Status sukses |
|--------|------|-----------|:-------------:|
| `GET` | `/kursus/siswa` | List siswa (pagination + search nama/email/telepon, filter aktif) | 200 |
| `GET` | `/kursus/siswa/:id` | Detail siswa by UUID | 200 |
| `POST` | `/kursus/siswa` | Tambah siswa baru | 201 |
| `PATCH` | `/kursus/siswa/:id` | Update data siswa | 200 |
| `DELETE` | `/kursus/siswa/:id` | Soft delete siswa | 200 |

**Query params GET list:** `page`, `limit`, `search`, `aktif`

**Body POST/PATCH:**
```json
{
  "nama": "Andi Wijaya",              // required (POST)
  "email": "andi@email.com",          // optional
  "telepon": "081234567890",          // optional
  "tanggal_lahir": "2000-01-15",      // optional, ISO date string
  "alamat": "Jl. Sudirman No. 1",    // optional
  "jenis_kelamin": 1,                  // optional, 1=L 2=P
  "foto_url": "https://...",          // optional
  "aktif": 1                          // optional (PATCH only), 0 atau 1
}
```

---

### 4.2 Program Pengajaran — `GET|POST|PATCH|DELETE /kursus/program-pengajaran`

| Method | Path | Deskripsi | Status sukses |
|--------|------|-----------|:-------------:|
| `GET` | `/kursus/program-pengajaran` | List program (search nama/kode_program) | 200 |
| `GET` | `/kursus/program-pengajaran/:id` | Detail program by UUID | 200 |
| `POST` | `/kursus/program-pengajaran` | Tambah program (409 jika kode duplikat) | 201 |
| `PATCH` | `/kursus/program-pengajaran/:id` | Update program | 200 |
| `DELETE` | `/kursus/program-pengajaran/:id` | Soft delete program | 200 |

**Body POST/PATCH:**
```json
{
  "kode_program": "TARI_BALI_01",    // required (POST), format: A-Z0-9_
  "nama": "Tari Bali Dasar",         // required (POST)
  "deskripsi": "Program untuk pemula", // optional
  "tingkat": "PEMULA",               // optional: PEMULA | MENENGAH | MAHIR
  "durasi_menit": 60,                 // optional, default: 60
  "aktif": 1                          // optional (PATCH only)
}
```

> **409 Conflict:** Jika `kode_program` sudah digunakan oleh program lain.

---

### 4.3 Tarif — `GET|POST|PATCH|DELETE /kursus/tarif`

| Method | Path | Deskripsi | Status sukses |
|--------|------|-----------|:-------------:|
| `GET` | `/kursus/tarif` | List tarif (search nama, filter aktif) | 200 |
| `GET` | `/kursus/tarif/program/:id_program` | List tarif berdasarkan program | 200 |
| `GET` | `/kursus/tarif/:id` | Detail tarif by UUID | 200 |
| `POST` | `/kursus/tarif` | Tambah tarif (validasi id_program exist) | 201 |
| `PATCH` | `/kursus/tarif/:id` | Update tarif | 200 |
| `DELETE` | `/kursus/tarif/:id` | Soft delete tarif | 200 |

> **Catatan route:** `/program/:id_program` dideklarasikan sebelum `/:id` agar tidak tertangkap sebagai UUID.

**Body POST/PATCH:**
```json
{
  "id_program": "uuid-program",       // required (POST)
  "nama": "Paket 10 Sesi",           // required (POST)
  "jenis": "PAKET",                   // required (POST): PER_SESI | PAKET
  "harga": 500000,                    // required (POST)
  "jumlah_pertemuan": 10,             // optional, hanya relevan jika jenis=PAKET
  "aktif": 1                          // optional (PATCH only)
}
```

---

### 4.4 Jadwal Kelas — `GET|POST|PATCH|DELETE /kursus/jadwal-kelas`

| Method | Path | Deskripsi | Status sukses |
|--------|------|-----------|:-------------:|
| `GET` | `/kursus/jadwal-kelas` | List jadwal (search nama/instruktur/lokasi, filter aktif) | 200 |
| `GET` | `/kursus/jadwal-kelas/:id/kuota` | Info kuota: `{ kuota, terisi, sisa }` | 200 |
| `GET` | `/kursus/jadwal-kelas/:id` | Detail jadwal by UUID | 200 |
| `POST` | `/kursus/jadwal-kelas` | Tambah jadwal (validasi id_program exist) | 201 |
| `PATCH` | `/kursus/jadwal-kelas/:id` | Update jadwal | 200 |
| `DELETE` | `/kursus/jadwal-kelas/:id` | Soft delete jadwal | 200 |

> **Catatan route:** `/:id/kuota` dideklarasikan sebelum `/:id` biasa.

**Body POST/PATCH:**
```json
{
  "id_program": "uuid-program",       // required (POST)
  "nama": "Kelas Tari Bali Senin Pagi", // required (POST)
  "hari": 1,                           // required (POST): 1=Senin s/d 7=Minggu
  "jam_mulai": "08:00",               // required (POST), format HH:MM
  "jam_selesai": "10:00",             // required (POST), format HH:MM
  "instruktur": "Budi Santoso",       // optional
  "lokasi": "Studio A",               // optional
  "kuota": 10,                        // optional, default: 10
  "aktif": 1                          // optional (PATCH only)
}
```

**Response kuota:**
```json
{
  "message": "Berhasil mengambil informasi kuota",
  "data": {
    "kuota": 10,
    "terisi": 7,
    "sisa": 3
  }
}
```

---

### 4.5 Daftar Kelas — `GET|POST|PATCH|DELETE /kursus/daftar-kelas`

| Method | Path | Deskripsi | Status sukses |
|--------|------|-----------|:-------------:|
| `GET` | `/kursus/daftar-kelas` | List semua pendaftaran (pagination, search) | 200 |
| `GET` | `/kursus/daftar-kelas/siswa/:id_siswa` | Semua pendaftaran milik siswa tertentu | 200 |
| `GET` | `/kursus/daftar-kelas/jadwal/:id_jadwal` | Semua pendaftaran di jadwal tertentu | 200 |
| `GET` | `/kursus/daftar-kelas/:id` | Detail pendaftaran by UUID | 200 |
| `POST` | `/kursus/daftar-kelas` | Daftarkan siswa ke kelas (cek kuota) | 201 |
| `PATCH` | `/kursus/daftar-kelas/:id` | Update status / catatan / tarif | 200 |
| `DELETE` | `/kursus/daftar-kelas/:id` | Soft delete pendaftaran | 200 |

> **Catatan route:** `/siswa/:id_siswa` dan `/jadwal/:id_jadwal` dideklarasikan sebelum `/:id`.

**Body POST:**
```json
{
  "id_siswa": "uuid-siswa",           // required
  "id_jadwal": "uuid-jadwal",         // required
  "tanggal_daftar": "2025-01-15",    // required, ISO date
  "id_tarif": "uuid-tarif",           // optional
  "status": 1,                        // optional: 1=Aktif (default), 2=Selesai, 3=Berhenti
  "catatan": "Catatan tambahan"       // optional
}
```

**Body PATCH:**
```json
{
  "status": 2,                        // optional: 1=Aktif, 2=Selesai, 3=Berhenti
  "catatan": "Siswa sudah menyelesaikan kursus",
  "id_tarif": "uuid-tarif-baru",      // optional, ganti paket tarif
  "aktif": 0                          // optional
}
```

---

## 5. Business Logic Penting

### 5.1 Cek Kuota saat Daftar Kelas

```
POST /kursus/daftar-kelas
  1. Cek siswa exist          → 404 NotFoundException jika tidak ditemukan
  2. Cek jadwal exist         → 404 NotFoundException jika tidak ditemukan
  3. Count daftar_kelas WHERE id_jadwal = ? AND aktif = 1 AND status = 1
  4. Jika count >= jadwal.kuota → 400 BadRequestException('Kuota kelas penuh')
  5. Jika id_tarif dikirim    → Cek tarif exist → 404 jika tidak ditemukan
  6. Insert daftar_kelas
```

### 5.2 Conflict Check kode_program

```
POST /kursus/program-pengajaran
  - Cek findByKode(kode_program) di database
  - Jika sudah ada → 409 ConflictException('Kode program sudah digunakan')

PATCH /kursus/program-pengajaran/:id
  - Jika dto.kode_program ada DAN berbeda dari existing.kode_program
  - Cek apakah kode sudah dipakai program lain
  - Jika sudah → 409 ConflictException
```

### 5.3 Validasi FK saat Create Tarif / Jadwal Kelas

```
POST /kursus/tarif
  - Cek id_program exist via ProgramPengajaranService.findById()
  - 404 jika tidak ditemukan

POST /kursus/jadwal-kelas
  - Cek id_program exist via ProgramPengajaranService.findById()
  - 404 jika tidak ditemukan

PATCH /kursus/tarif/:id atau PATCH /kursus/jadwal-kelas/:id
  - Jika dto.id_program dikirim → cek exist
  - 404 jika tidak ditemukan
```

---

## 6. Response Schema

### Siswa
```json
{
  "id_siswa": "uuid",
  "nama": "Andi Wijaya",
  "email": "andi@email.com",
  "telepon": "081234567890",
  "tanggal_lahir": "2000-01-15",
  "alamat": "Jl. Sudirman No. 1",
  "jenis_kelamin": 1,
  "foto_url": "https://...",
  "aktif": 1,
  "dibuat_pada": "2025-01-01T00:00:00.000Z",
  "diubah_pada": null
}
```

### Program Pengajaran
```json
{
  "id_program": "uuid",
  "kode_program": "TARI_BALI_01",
  "nama": "Tari Bali Dasar",
  "deskripsi": "Program untuk pemula",
  "tingkat": "PEMULA",
  "durasi_menit": 60,
  "aktif": 1,
  "dibuat_pada": "2025-01-01T00:00:00.000Z",
  "diubah_pada": null
}
```

### Tarif
```json
{
  "id_tarif": "uuid",
  "id_program": "uuid",
  "nama": "Paket 10 Sesi",
  "jenis": "PAKET",
  "jumlah_pertemuan": 10,
  "harga": "500000.00",
  "aktif": 1,
  "dibuat_pada": "2025-01-01T00:00:00.000Z",
  "diubah_pada": null
}
```

### Jadwal Kelas
```json
{
  "id_jadwal": "uuid",
  "id_program": "uuid",
  "nama": "Kelas Tari Bali Senin Pagi",
  "hari": 1,
  "jam_mulai": "08:00",
  "jam_selesai": "10:00",
  "instruktur": "Budi Santoso",
  "lokasi": "Studio A",
  "kuota": 10,
  "aktif": 1,
  "dibuat_pada": "2025-01-01T00:00:00.000Z",
  "diubah_pada": null
}
```

### Daftar Kelas (enriched)
```json
{
  "id_daftar": "uuid",
  "tanggal_daftar": "2025-01-15",
  "status": 1,
  "catatan": null,
  "aktif": 1,
  "dibuat_pada": "2025-01-01T00:00:00.000Z",
  "diubah_pada": null,
  "siswa": {
    "id_siswa": "uuid",
    "nama": "Andi Wijaya",
    "email": "andi@email.com",
    "telepon": "081234567890"
  },
  "jadwal": {
    "id_jadwal": "uuid",
    "nama": "Kelas Tari Bali Senin Pagi",
    "hari": 1,
    "jam_mulai": "08:00",
    "jam_selesai": "10:00",
    "instruktur": "Budi Santoso",
    "lokasi": "Studio A",
    "program": {
      "id_program": "uuid",
      "nama": "Tari Bali Dasar",
      "kode_program": "TARI_BALI_01"
    }
  },
  "tarif": {
    "id_tarif": "uuid",
    "nama": "Paket 10 Sesi",
    "jenis": "PAKET",
    "harga": "500000.00"
  }
}
```

---

## 7. Struktur File

```
src/modules/
├── siswa/
│   ├── interfaces/
│   │   ├── siswa.interface.ts
│   │   └── siswa-repository.interface.ts
│   ├── dto/
│   │   ├── create-siswa.dto.ts
│   │   ├── update-siswa.dto.ts
│   │   └── siswa-response.dto.ts
│   ├── siswa.repository.ts
│   ├── siswa.service.ts
│   ├── siswa.module.ts
│   └── siswa.controller.ts
│
├── program-pengajaran/
│   ├── interfaces/
│   │   ├── program-pengajaran.interface.ts
│   │   └── program-pengajaran-repository.interface.ts
│   ├── dto/
│   │   ├── create-program-pengajaran.dto.ts
│   │   ├── update-program-pengajaran.dto.ts
│   │   └── program-pengajaran-response.dto.ts
│   ├── program-pengajaran.repository.ts
│   ├── program-pengajaran.service.ts
│   ├── program-pengajaran.module.ts
│   └── program-pengajaran.controller.ts
│
├── tarif/
│   ├── interfaces/
│   │   ├── tarif.interface.ts
│   │   └── tarif-repository.interface.ts
│   ├── dto/
│   │   ├── create-tarif.dto.ts
│   │   ├── update-tarif.dto.ts
│   │   └── tarif-response.dto.ts
│   ├── tarif.repository.ts
│   ├── tarif.service.ts
│   ├── tarif.module.ts
│   └── tarif.controller.ts
│
├── jadwal-kelas/
│   ├── interfaces/
│   │   ├── jadwal-kelas.interface.ts
│   │   └── jadwal-kelas-repository.interface.ts
│   ├── dto/
│   │   ├── create-jadwal-kelas.dto.ts
│   │   ├── update-jadwal-kelas.dto.ts
│   │   └── jadwal-kelas-response.dto.ts
│   ├── jadwal-kelas.repository.ts
│   ├── jadwal-kelas.service.ts
│   ├── jadwal-kelas.module.ts
│   └── jadwal-kelas.controller.ts
│
└── daftar-kelas/
    ├── interfaces/
    │   ├── daftar-kelas.interface.ts
    │   └── daftar-kelas-repository.interface.ts
    ├── dto/
    │   ├── create-daftar-kelas.dto.ts
    │   ├── update-daftar-kelas.dto.ts
    │   └── daftar-kelas-response.dto.ts
    ├── daftar-kelas.repository.ts
    ├── daftar-kelas.service.ts
    ├── daftar-kelas.module.ts
    └── daftar-kelas.controller.ts
```

---

## 8. Enum / Konstanta

| Entitas | Field | Nilai |
|---------|-------|-------|
| Siswa | `jenis_kelamin` | `1` = Laki-laki, `2` = Perempuan |
| Program Pengajaran | `tingkat` | `PEMULA`, `MENENGAH`, `MAHIR` |
| Tarif | `jenis` | `PER_SESI`, `PAKET` |
| Jadwal Kelas | `hari` | `1`=Senin, `2`=Selasa, `3`=Rabu, `4`=Kamis, `5`=Jumat, `6`=Sabtu, `7`=Minggu |
| Daftar Kelas | `status` | `1`=Aktif, `2`=Selesai, `3`=Berhenti |
| Semua | `aktif` | `1`=Aktif, `0`=Nonaktif |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-22
**Owner:** @ideora-tech
