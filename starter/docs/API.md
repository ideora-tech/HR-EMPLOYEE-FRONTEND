# HR Employee — API Documentation

> Base URL: `http://localhost:3000`
> Content-Type: `application/json`
> Autentikasi: Bearer Token (JWT) di header `Authorization`

---

## Format Response Standar

```json
{
  "message": "Pesan sukses dari server",
  "data": { ... }
}
```

Endpoint list menambahkan `meta`:
```json
{
  "message": "...",
  "data": [...],
  "meta": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Pesan error dari server",
  "timestamp": "2026-03-20T10:00:00.000Z",
  "path": "/auth/login"
}
```

| Status Code | Keterangan |
|-------------|------------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request — validasi gagal |
| `401` | Unauthorized — token tidak valid / expired |
| `403` | Forbidden — tidak punya izin |
| `404` | Not Found |
| `409` | Conflict — data sudah ada |
| `429` | Too Many Requests — throttle limit |
| `500` | Internal Server Error |

---

## Auth

### POST `/auth/register`

Registrasi perusahaan baru + akun owner. Otomatis membuat langganan FREE.
**Tidak perlu token.**

**Request Body:**
```json
{
  "name": "Budi Santoso",
  "email": "budi@perusahaan.com",
  "password": "Password123!",
  "company_name": "PT Maju Bersama"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `name` | string | ✅ | Nama lengkap pemilik akun |
| `email` | string | ✅ | Email untuk login |
| `password` | string | ✅ | Min 8 karakter |
| `company_name` | string | ✅ | Nama perusahaan |

**Response `201`:**
```json
{
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Budi Santoso",
      "email": "budi@perusahaan.com",
      "role": "OWNER",
      "company_id": "660e8400-e29b-41d4-a716-446655440001"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

### POST `/auth/login`

Login dan dapatkan token.
**Tidak perlu token.**

> Field `email` bisa diisi dengan **email** atau **username**.

**Request Body:**
```json
{
  "email": "owner@dummy.com",
  "password": "password123"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `email` | string | ✅ | Email atau username pengguna |
| `password` | string | ✅ | Min 6 karakter |

**Response `200`:**
```json
{
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Owner Dummy",
      "email": "owner@dummy.com",
      "role": "OWNER",
      "company_id": "660e8400-e29b-41d4-a716-446655440001",
      "harus_ganti_password": 0
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

> `access_token` expired sesuai konfigurasi `JWT_EXPIRES_IN`. `refresh_token` untuk memperbarui tanpa login ulang.

> ⚠️ **Jika `harus_ganti_password === 1`**: Frontend WAJIB redirect ke halaman ganti password sebelum user bisa akses halaman manapun. Nilai ini di-set `1` otomatis saat akun karyawan dibuat. Setelah password diganti via `PATCH /pengguna/:id`, flag otomatis reset ke `0`.

---

### POST `/auth/refresh`

Perbarui `access_token` menggunakan `refresh_token`.
**Tidak perlu token.**

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200`:**
```json
{
  "message": "Token diperbarui",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/auth/logout`

Logout dan invalidasi semua refresh token user.
**Perlu token.**

**Response `200`:**
```json
{ "message": "Logout berhasil", "data": null }
```

---

## Pengguna

> **Auth:** Bearer Token wajib di semua endpoint
> SUPERADMIN melihat semua user lintas perusahaan. User biasa hanya melihat user di perusahaannya sendiri.

### GET `/pengguna`

Daftar pengguna dengan pagination & pencarian.

**Query Params:**

| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `search` | string | — | Cari nama, email, atau username |
| `page` | number | 1 | Halaman |
| `limit` | number | 10 | Jumlah per halaman |
| `aktif` | 0\|1 | — | Filter status aktif |

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar pengguna",
  "data": [
    {
      "id_pengguna": "550e8400-e29b-41d4-a716-446655440000",
      "id_perusahaan": "660e8400-e29b-41d4-a716-446655440001",
      "id_karyawan": "770e8400-e29b-41d4-a716-446655440002",
      "username": "budi.santoso",
      "nama": "Budi Santoso",
      "email": "budi@perusahaan.com",
      "peran": "HR_ADMIN",
      "aktif": 1,
      "harus_ganti_password": 0,
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

---

### GET `/pengguna/:id`

Detail pengguna berdasarkan UUID.

**Response `200`:** satu item pengguna seperti di atas.

---

### POST `/pengguna`

Tambah pengguna baru di perusahaan caller.

**Request Body:**
```json
{
  "nama": "Andi Wijaya",
  "email": "andi@perusahaan.com",
  "kata_sandi": "Password123!",
  "peran": "HR_ADMIN",
  "username": "andi.wijaya",
  "id_karyawan": "770e8400-e29b-41d4-a716-446655440002"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nama` | string | ✅ | Nama lengkap |
| `email` | string | ✅ | Email unik |
| `kata_sandi` | string | ✅ | Password plain, akan di-hash |
| `peran` | string | ✅ | Kode peran, contoh: `HR_ADMIN` |
| `username` | string | ❌ | Username unik untuk login |
| `id_karyawan` | string (UUID) | ❌ | Link ke data karyawan. `null` = pengguna tanpa data karyawan |

**Response `201`:** data pengguna baru.

---

### PUT `/pengguna/:id` — PATCH `/pengguna/:id`

Update pengguna. Semua field opsional pada PATCH.

**Request Body:**
```json
{
  "nama": "Andi W.",
  "email": "andi.baru@perusahaan.com",
  "kata_sandi": "NewPass123!",
  "peran": "FINANCE",
  "username": "andi.w",
  "aktif": 1,
  "id_karyawan": "770e8400-e29b-41d4-a716-446655440002"
}
```

| Field | Tipe | Keterangan |
|-------|------|------------|
| `nama` | string | |
| `email` | string | |
| `kata_sandi` | string | Jika diisi, `harus_ganti_password` otomatis di-reset ke `0` |
| `peran` | string | |
| `username` | string | |
| `aktif` | 0\|1 | |
| `id_karyawan` | string\|null | Link/unlink ke karyawan. Kirim `null` untuk unlink |

**Response `200`:** data pengguna setelah diupdate.

---

### DELETE `/pengguna/:id`

Soft delete pengguna.

**Response `200`:**
```json
{ "message": "Pengguna berhasil dihapus", "data": null }
```

---

## Perusahaan

> **Auth:** Bearer Token wajib di semua endpoint
> SUPERADMIN: akses penuh ke semua perusahaan.
> User biasa: hanya bisa lihat & edit perusahaannya sendiri.

### GET `/perusahaan`

Daftar perusahaan. SUPERADMIN melihat semua, user biasa hanya perusahaannya.

**Query Params:** `search`, `page`, `limit`, `aktif` (0|1)

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar perusahaan",
  "data": [
    {
      "id_perusahaan": "660e8400-e29b-41d4-a716-446655440001",
      "nama": "PT Maju Bersama",
      "email": "info@majubersama.com",
      "telepon": "021-12345678",
      "alamat": "Jl. Sudirman No. 1, Jakarta",
      "website": "https://www.majubersama.com",
      "npwp": "82.756.019.3-541.291",
      "zona_waktu": "Asia/Jakarta",
      "format_tanggal": "DD/MM/YYYY",
      "mata_uang": "IDR",
      "hari_kerja_per_bulan": 22,
      "url_logo": "https://cdn.example.com/logo.png",
      "aktif": 1,
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null,
      "total_pengguna": 12,
      "langganan": {
        "id_langganan": "uuid-...",
        "paket": "STARTER",
        "maks_karyawan": 50,
        "aktif": 1,
        "dibuat_pada": "2026-01-01T00:00:00.000Z"
      }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

---

### GET `/perusahaan/:id`

Detail perusahaan. User biasa hanya bisa akses ID perusahaannya sendiri (`403` jika bukan miliknya).

**Response `200`:** satu item perusahaan seperti di atas.

---

### GET `/perusahaan/:id/overview`

Overview lengkap satu perusahaan: profil + langganan aktif + modul yang diakses + total pengguna.
Cocok untuk halaman monitoring SUPERADMIN.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil overview perusahaan",
  "data": {
    "id_perusahaan": "660e8400-e29b-41d4-a716-446655440001",
    "nama": "PT Maju Bersama",
    "email": "info@majubersama.com",
    "telepon": "021-12345678",
    "alamat": "Jl. Sudirman No. 1, Jakarta",
    "website": "https://www.majubersama.com",
    "npwp": "82.756.019.3-541.291",
    "zona_waktu": "Asia/Jakarta",
    "format_tanggal": "DD/MM/YYYY",
    "mata_uang": "IDR",
    "hari_kerja_per_bulan": 22,
    "url_logo": null,
    "aktif": 1,
    "dibuat_pada": "2026-01-01T00:00:00.000Z",
    "diubah_pada": null,
    "total_pengguna": 12,
    "langganan": {
      "id_langganan": "uuid-...",
      "paket": "STARTER",
      "maks_karyawan": 50,
      "aktif": 1,
      "dibuat_pada": "2026-01-01T00:00:00.000Z"
    },
    "modul": [
      { "kode_modul": "DASHBOARD", "nama": "Dashboard", "batasan": null },
      { "kode_modul": "EMPLOYEES", "nama": "Karyawan", "batasan": { "maks_karyawan": 50 } },
      { "kode_modul": "ATTENDANCE", "nama": "Absensi", "batasan": null }
    ]
  }
}
```

---

### POST `/perusahaan`

Tambah perusahaan baru. **SUPERADMIN only.**

**Request Body:**
```json
{
  "nama": "PT Maju Bersama",
  "email": "info@majubersama.com",
  "telepon": "021-12345678",
  "alamat": "Jl. Sudirman No. 1, Jakarta",
  "website": "https://www.majubersama.com",
  "npwp": "82.756.019.3-541.291",
  "zona_waktu": "Asia/Jakarta",
  "format_tanggal": "DD/MM/YYYY",
  "mata_uang": "IDR",
  "hari_kerja_per_bulan": 22,
  "url_logo": "https://cdn.example.com/logo.png"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nama` | string | ✅ | Max 100 karakter |
| `email` | string | ❌ | Email perusahaan |
| `telepon` | string | ❌ | Max 20 karakter |
| `alamat` | string | ❌ | Max 255 karakter |
| `website` | string | ❌ | URL website perusahaan |
| `npwp` | string | ❌ | NPWP perusahaan, max 30 karakter |
| `zona_waktu` | string | ❌ | Default: `Asia/Jakarta` |
| `format_tanggal` | string | ❌ | `DD/MM/YYYY` / `MM/DD/YYYY` / `YYYY-MM-DD`. Default: `DD/MM/YYYY` |
| `mata_uang` | string | ❌ | Kode ISO 4217 (IDR, USD, dll). Default: `IDR` |
| `hari_kerja_per_bulan` | number | ❌ | 1–31. Default: `22`. Untuk perhitungan gaji harian |
| `url_logo` | string | ❌ | URL logo, max 255 karakter |

**Response `201`:** data perusahaan yang baru dibuat.

---

### PATCH `/perusahaan/:id`

Update perusahaan.
- **SUPERADMIN:** semua field termasuk `aktif`
- **OWNER:** hanya profil (nama, email, telepon, alamat, website, npwp, zona_waktu, format_tanggal, mata_uang, hari_kerja_per_bulan, url_logo)

**Request Body** (semua opsional):
```json
{
  "nama": "PT Maju Sejahtera",
  "email": "info@baru.com",
  "telepon": "021-99999999",
  "alamat": "Jl. Thamrin No. 5",
  "website": "https://www.majusejahtera.com",
  "npwp": "82.756.019.3-541.291",
  "zona_waktu": "Asia/Makassar",
  "format_tanggal": "DD/MM/YYYY",
  "mata_uang": "IDR",
  "hari_kerja_per_bulan": 20,
  "url_logo": "https://cdn.example.com/logo-baru.png",
  "aktif": 0
}
```

**Response `200`:** data perusahaan setelah diupdate.

---

### DELETE `/perusahaan/:id`

Soft delete perusahaan. **SUPERADMIN only.**

**Response `200`:**
```json
{ "message": "Perusahaan berhasil dihapus", "data": null }
```

---

## Peran

> **Auth:** Bearer Token wajib di semua endpoint
> SUPERADMIN: kelola peran global (`company_id = null`).
> Company user (OWNER): kelola peran custom perusahaannya. Tidak bisa ubah/hapus peran global.

### GET `/peran`

Daftar peran dengan pagination & search.

**Query Params:**

| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `search` | string | — | Cari berdasarkan `kode_peran` atau `nama_peran` |
| `page` | number | 1 | Halaman |
| `limit` | number | 10 | Jumlah per halaman |
| `aktif` | 0\|1 | — | Filter status aktif |
| `is_platform` | 0\|1 | — | Filter peran platform (SUPERADMIN only) |

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar peran",
  "data": [
    {
      "id_peran": "550e8400-e29b-41d4-a716-446655440000",
      "company_id": null,
      "kode_peran": "HR_ADMIN",
      "nama_peran": "HR Manager / Admin",
      "aktif": 1,
      "is_platform": 0,
      "is_global": true,
      "dibuat_pada": "2026-03-20T10:00:00.000Z",
      "diubah_pada": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 4, "totalPages": 1 }
}
```

| Field | Keterangan |
|-------|------------|
| `company_id` | `null` = peran global, UUID = peran custom milik perusahaan |
| `is_platform` | `1` = peran sistem platform (misal SUPERADMIN) |
| `is_global` | `true` jika `company_id = null` |

---

### GET `/peran/:id`

Detail peran berdasarkan UUID.

**Response `200`:** satu item peran seperti di atas.

---

### POST `/peran`

Tambah peran baru.

> SUPERADMIN membuat peran **global**. Company user membuat peran **custom** perusahaannya.

**Request Body:**
```json
{
  "kode_peran": "SUPERVISOR",
  "nama_peran": "Supervisor Lapangan"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kode_peran` | string | ✅ | Huruf besar + underscore, max 50 karakter |
| `nama_peran` | string | ✅ | Nama tampilan, max 100 karakter |
| `aktif` | number | ❌ | Default `1` |

**Response `201`:** data peran yang baru dibuat.

---

### PUT `/peran/:id` — PATCH `/peran/:id`

Update peran. Company user tidak bisa edit peran global (`403`).

**Request Body:**
```json
{
  "nama_peran": "Supervisor Senior",
  "aktif": 1
}
```

**Response `200`:** data peran setelah diupdate.

---

### DELETE `/peran/:id`

Soft delete peran. Company user tidak bisa hapus peran global (`403`).

**Response `200`:**
```json
{ "message": "Peran berhasil dihapus", "data": null }
```

---

## Izin Peran

> Mengatur **menu apa saja** yang bisa diakses oleh sebuah peran, beserta **aksi** yang diperbolehkan.
>
> **Auth:** Bearer Token wajib di semua endpoint
>
> SUPERADMIN menulis ke izin **global** (`company_id = null`).
> Company user menulis ke izin **override** perusahaannya — menimpa izin global.
> Menu yang tampil untuk company user dibatasi sesuai **paket** langganannya.

### Konsep Aksi

| Aksi | Keterangan |
|------|------------|
| `VIEW` | Menu muncul di sidebar, user bisa melihat halaman |
| `CREATE` | Boleh tambah data |
| `UPDATE` | Boleh edit data |
| `DELETE` | Boleh hapus data |

---

### GET `/izin-peran`

Daftar semua row izin peran (raw) dengan pagination.

**Query Params:** `search`, `page`, `limit`

**Response `200`:**
```json
{
  "message": "Berhasil mengambil data izin peran",
  "data": [
    {
      "id_izin": "uuid-...",
      "company_id": null,
      "kode_peran": "HR_ADMIN",
      "id_menu": "uuid-...",
      "aksi": "VIEW",
      "diizinkan": 1,
      "dibuat_pada": "2026-03-20T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 24, "totalPages": 3 }
}
```

---

### GET `/izin-peran/peran/:kode`

Ambil **semua menu aktif** beserta aksi yang diizinkan untuk satu peran.
Cocok untuk render matrix checklist di frontend — semua menu dikembalikan, `aksi: []` jika belum dikonfigurasi.

**Contoh:** `GET /izin-peran/peran/HR_ADMIN`

**Response `200`:**
```json
{
  "message": "Berhasil mengambil izin untuk peran 'HR_ADMIN'",
  "data": [
    {
      "id_menu": "uuid-...",
      "path": "/dashboard",
      "nama_menu": "Dashboard",
      "kode_modul": "DASHBOARD",
      "aksi": ["VIEW"]
    },
    {
      "id_menu": "uuid-...",
      "path": "/payroll",
      "nama_menu": "Payroll",
      "kode_modul": "PAYROLL",
      "aksi": ["VIEW", "CREATE", "UPDATE"]
    },
    {
      "id_menu": "uuid-...",
      "path": "/reports/leave",
      "nama_menu": "Laporan Cuti",
      "kode_modul": "REPORTS",
      "aksi": []
    }
  ]
}
```

---

### PUT `/izin-peran/peran/:kode/menu/:id_menu`

Set aksi untuk satu peran pada satu menu (**upsert/replace per menu**).

**Contoh:** `PUT /izin-peran/peran/HR_ADMIN/menu/uuid-payroll`

**Request Body:**
```json
{
  "aksi": ["VIEW", "CREATE", "UPDATE"]
}
```

| Field | Tipe | Nilai valid |
|-------|------|-------------|
| `aksi` | string[] | `VIEW`, `CREATE`, `UPDATE`, `DELETE` |

> Kirim `"aksi": []` untuk menghapus semua izin pada menu tersebut.

**Response `200`:**
```json
{
  "message": "Izin untuk peran 'HR_ADMIN' pada menu berhasil diperbarui",
  "data": {
    "id_menu": "uuid-payroll",
    "path": "/payroll",
    "nama_menu": "Payroll",
    "kode_modul": "PAYROLL",
    "aksi": ["VIEW", "CREATE", "UPDATE"]
  }
}
```

---

### PUT `/izin-peran/peran/:kode/bulk`

Set izin **banyak menu sekaligus** dalam satu request. Cocok untuk fitur **select all** di frontend.

**Contoh:** `PUT /izin-peran/peran/HR_ADMIN/bulk`

**Request Body:**
```json
{
  "items": [
    { "id_menu": "uuid-menu-1", "aksi": ["VIEW", "CREATE", "UPDATE", "DELETE"] },
    { "id_menu": "uuid-menu-2", "aksi": ["VIEW"] },
    { "id_menu": "uuid-menu-3", "aksi": [] }
  ]
}
```

| Field | Tipe | Keterangan |
|-------|------|------------|
| `items` | array | Array pasangan menu + aksi |
| `items[].id_menu` | string (UUID) | UUID menu |
| `items[].aksi` | string[] | Aksi yang diizinkan. `[]` = hapus semua izin menu ini |

**Response `200`:** Seluruh daftar izin peran setelah diupdate (format sama dengan `GET /izin-peran/peran/:kode`).

---

### DELETE `/izin-peran/peran/:kode/menu/:id_menu`

Hapus semua izin untuk satu peran pada satu menu.

**Contoh:** `DELETE /izin-peran/peran/HR_ADMIN/menu/uuid-payroll`

**Response `200`:**
```json
{ "message": "Semua izin untuk peran 'HR_ADMIN' pada menu berhasil dihapus", "data": null }
```

---

### Alur Frontend Matrix Izin Peran

```
1. Load matrix   → GET /izin-peran/peran/HR_ADMIN
                   Semua menu tampil, aksi[] menunjukkan centang awal

2. Select all    → PUT /izin-peran/peran/HR_ADMIN/bulk
                   items: semua menu dengan aksi: ["VIEW","CREATE","UPDATE","DELETE"]

3. User centang  → PUT /izin-peran/peran/HR_ADMIN/menu/:id_menu
   per menu        body: { aksi: ["VIEW", "CREATE"] }
                   Kirim SEMUA aksi yang aktif (bukan toggle per-aksi)

4. Hapus semua   → DELETE /izin-peran/peran/HR_ADMIN/menu/:id_menu
   aksi di menu    atau PUT dengan body: { aksi: [] }
```

---

## Paket Langganan

> **Auth:** Bearer Token wajib di semua endpoint

### GET `/paket`

Daftar paket langganan.

**Query Params:** `search`, `page`, `limit`, `aktif` (0|1)

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar paket",
  "data": [
    {
      "id_paket": "uuid-...",
      "kode_paket": "FREE",
      "nama_paket": "Free",
      "maks_karyawan": 10,
      "harga": 0,
      "aktif": 1,
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

---

### GET `/paket/:id`

Detail paket berdasarkan UUID.

---

### POST `/paket`

Tambah paket baru.

**Request Body:**
```json
{
  "kode_paket": "ENTERPRISE_PLUS",
  "nama_paket": "Enterprise Plus",
  "maks_karyawan": 999999,
  "harga": 2499000,
  "aktif": 1
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kode_paket` | string | ✅ | Huruf besar, angka, underscore |
| `nama_paket` | string | ✅ | Nama tampil paket |
| `maks_karyawan` | number | ✅ | Min 1 |
| `harga` | number | ✅ | Harga per bulan (Rupiah). 0 = gratis |
| `aktif` | number | ❌ | Default `1` |

**Response `201`:** data paket yang baru dibuat.

---

### PUT `/paket/:id` — PATCH `/paket/:id`

Update paket. Semua field opsional pada PATCH.

**Response `200`:** data paket setelah diupdate.

---

### DELETE `/paket/:id`

Soft delete paket.

**Response `200`:**
```json
{ "message": "Paket berhasil dihapus", "data": null }
```

---

## Menu

> **Auth:** Bearer Token wajib di semua endpoint

### GET `/menu/me`

Ambil menu yang boleh diakses oleh user yang sedang login.
Filter berdasarkan paket perusahaan + peran user. Dikembalikan dalam bentuk **tree**.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil menu user",
  "data": [
    {
      "id_menu": "uuid-...",
      "nama_menu": "Dashboard",
      "icon": "layout-dashboard",
      "path": "/dashboard",
      "kode_modul": "DASHBOARD",
      "parent_id": null,
      "urutan": 1,
      "aktif": 1,
      "children": []
    },
    {
      "id_menu": "uuid-...",
      "nama_menu": "Karyawan",
      "icon": "users",
      "path": "/employees",
      "kode_modul": "EMPLOYEES",
      "parent_id": null,
      "urutan": 2,
      "aktif": 1,
      "children": [
        {
          "id_menu": "uuid-...",
          "nama_menu": "Daftar Karyawan",
          "path": "/employees/list",
          "kode_modul": "EMPLOYEES",
          "parent_id": "uuid-parent",
          "urutan": 1,
          "aktif": 1,
          "children": []
        }
      ]
    }
  ]
}
```

> `children` hanya ada pada `GET /menu/me`. Endpoint lain mengembalikan flat list.

---

### GET `/menu`

Daftar semua menu (flat list).

**Query Params:** `search`, `page`, `limit`, `aktif` (0|1)

---

### GET `/menu/:id`

Detail satu menu berdasarkan UUID.

---

### POST `/menu`

Tambah menu baru.

**Request Body:**
```json
{
  "nama_menu": "Rekrutmen",
  "icon": "briefcase",
  "path": "/recruitment",
  "kode_modul": "RECRUITMENT",
  "parent_id": null,
  "urutan": 10
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nama_menu` | string | ✅ | Max 100 karakter |
| `icon` | string | ❌ | Nama icon (Tabler/Lucide) |
| `path` | string | ❌ | Path URL |
| `kode_modul` | string | ❌ | Kode modul terkait. `null` = menu global |
| `parent_id` | string (UUID) | ❌ | UUID menu parent. `null` = root |
| `urutan` | number | ❌ | Urutan tampil. Min 0 |

**Response `201`:** data menu yang baru dibuat.

---

### PUT `/menu/:id` — PATCH `/menu/:id`

Update menu. Semua field opsional.

**Response `200`:** data menu setelah diupdate.

---

### DELETE `/menu/:id`

Soft delete menu.

**Response `200`:**
```json
{ "message": "Menu berhasil dihapus", "data": null }
```

---

## Modul

> **Auth:** Bearer Token wajib di semua endpoint
> Modul = master data fitur SaaS (DASHBOARD, EMPLOYEES, PAYROLL, dst.)

### GET `/modul`

Daftar semua modul, diurutkan berdasarkan `urutan`.

**Query Params:** `search`, `page`, `limit`, `aktif` (0|1)

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar modul",
  "data": [
    {
      "id_modul": "uuid-...",
      "kode_modul": "DASHBOARD",
      "nama_modul": "Dashboard",
      "deskripsi": "Ringkasan dan statistik perusahaan",
      "icon": "layout-dashboard",
      "urutan": 1,
      "aktif": 1,
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

---

### GET `/modul/:id`

Detail modul berdasarkan UUID.

---

### POST `/modul`

Tambah modul baru.

**Request Body:**
```json
{
  "kode_modul": "RECRUITMENT",
  "nama_modul": "Rekrutmen",
  "deskripsi": "Manajemen proses rekrutmen karyawan baru",
  "icon": "briefcase",
  "urutan": 10
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kode_modul` | string | ✅ | Huruf besar, angka, underscore. Max 50 karakter |
| `nama_modul` | string | ✅ | Max 100 karakter |
| `deskripsi` | string | ❌ | Max 255 karakter |
| `icon` | string | ❌ | Nama icon. Max 100 karakter |
| `urutan` | number | ❌ | Urutan tampil. Min 0 |

**Response `201`:** data modul yang baru dibuat.

---

### PUT `/modul/:id` — PATCH `/modul/:id`

Update modul. Semua field opsional.

**Response `200`:** data modul setelah diupdate.

---

### DELETE `/modul/:id`

Soft delete modul.

**Response `200`:**
```json
{ "message": "Modul berhasil dihapus", "data": null }
```

---

### GET `/modul/:kode/menu`

Ambil semua menu yang tergabung dalam satu modul.

**Contoh:** `GET /modul/ATTENDANCE/menu`

---

### PUT `/modul/:kode/menu`

Set menu untuk satu modul sekaligus — replace all (cocok untuk bulk save).

**Request Body:**
```json
{
  "menu_ids": ["uuid-menu-1", "uuid-menu-2", "uuid-menu-3"]
}
```

---

### PATCH `/modul/:kode/menu/:id_menu`

Assign satu menu ke modul (per-checkbox check).

---

### DELETE `/modul/:kode/menu/:id_menu`

Lepas satu menu dari modul (per-checkbox uncheck).

---

## Akses Modul Tier

> **Auth:** Bearer Token wajib di semua endpoint
> Konfigurasi modul mana saja yang aktif untuk tiap paket langganan.

### GET `/akses-modul-tier`

Daftar semua konfigurasi paket × modul.

**Query Params:** `search`, `page`, `limit`

**Response `200`:**
```json
{
  "message": "Berhasil mengambil konfigurasi akses modul",
  "data": [
    {
      "id_akses_modul": "uuid-...",
      "kode_modul": "DASHBOARD",
      "paket": "FREE",
      "aktif": 1,
      "batasan": { "maks_karyawan": 10 },
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 }
}
```

> `batasan` berisi objek JSON. `null` = tidak ada batasan.

---

### GET `/akses-modul-tier/:id`

Detail konfigurasi berdasarkan UUID.

---

### GET `/akses-modul-tier/paket/:paket`

Filter by paket. **Contoh:** `GET /akses-modul-tier/paket/STARTER`

---

### POST `/akses-modul-tier`

Tambah modul ke paket.

**Request Body:**
```json
{
  "kode_modul": "RECRUITMENT",
  "paket": "PROFESSIONAL",
  "aktif": 1,
  "batasan": null
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kode_modul` | string | ✅ | Harus ada di tabel `modul` |
| `paket` | string | ✅ | Harus ada di tabel `paket_langganan` |
| `aktif` | number | ❌ | Default `1` |
| `batasan` | object\|null | ❌ | Batasan fitur. `null` = tanpa batasan |

> **`409`** jika kombinasi `kode_modul` + `paket` sudah terdaftar.

**Response `201`:** data konfigurasi yang baru dibuat.

---

### PATCH `/akses-modul-tier/:id`

Update konfigurasi berdasarkan UUID.

**Request Body:**
```json
{
  "aktif": 1,
  "batasan": { "maks_karyawan": 25 }
}
```

**Response `200`:** data konfigurasi setelah diupdate.

---

### PATCH `/akses-modul-tier/paket/:paket/modul/:kode_modul`

Update berdasarkan kode paket + kode modul (lebih mudah dari frontend).

**Contoh:** `PATCH /akses-modul-tier/paket/STARTER/modul/PAYROLL`

**Request Body:** sama seperti PATCH by ID.

---

### DELETE `/akses-modul-tier/:id`

Soft delete — hapus modul dari paket.

**Response `200`:**
```json
{ "message": "Modul berhasil dihapus dari paket", "data": null }
```

---

## Module Access

> **Auth:** Bearer Token wajib

### GET `/module-access/me`

Ambil daftar modul yang aktif untuk paket perusahaan user yang sedang login.

**Response `200`:**
```json
{
  "message": "Akses modul berhasil diambil",
  "data": [
    { "kode_modul": "DASHBOARD", "aktif": true, "batasan": null },
    { "kode_modul": "EMPLOYEES", "aktif": true, "batasan": { "maks_karyawan": 10 } },
    { "kode_modul": "ATTENDANCE", "aktif": false, "batasan": null }
  ]
}
```

> `aktif: false` = modul tidak tersedia untuk paket perusahaan. Gunakan untuk sembunyikan fitur & tampilkan prompt upgrade.

---

## Catatan Umum untuk Frontend

### Cara Pakai Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Isi JWT Payload (decode dari access_token)

**User biasa (Company user):**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "owner@dummy.com",
  "role": "OWNER",
  "company_id": "660e8400-e29b-41d4-a716-446655440001",
  "paket": "FREE",
  "iat": 1710000000,
  "exp": 1710086400
}
```

**SUPERADMIN (platform-level):**
```json
{
  "sub": "uuid-superadmin",
  "email": "superadmin@platform.com",
  "role": "SUPERADMIN",
  "company_id": null,
  "paket": null,
  "iat": 1710000000,
  "exp": 1710086400
}
```

| Field | Keterangan |
|-------|------------|
| `sub` | UUID pengguna |
| `role` | `SUPERADMIN` / `OWNER` / `HR_ADMIN` / `FINANCE` / `EMPLOYEE` |
| `company_id` | UUID perusahaan. `null` untuk SUPERADMIN |
| `paket` | `FREE` / `STARTER` / `PROFESSIONAL` / `ENTERPRISE`. `null` untuk SUPERADMIN |

### Alur Login yang Direkomendasikan

```
1. POST /auth/login → simpan access_token & refresh_token
2. Cek data.user.harus_ganti_password
   - Jika === 1 → redirect ke halaman ganti password (PATCH /pengguna/:id dengan kata_sandi baru)
   - Jika === 0 → lanjut normal
3. Setiap request  → kirim access_token di header Authorization
4. Jika 401        → call POST /auth/refresh dengan refresh_token
5. Jika refresh gagal → redirect ke halaman login
6. POST /auth/logout → hapus token dari storage
```

> Halaman ganti password wajib di-protect: user yang tidak punya flag ini tidak boleh mengakses halaman tersebut secara langsung. Setelah ganti password berhasil, redirect ke dashboard.

### Field `aktif` di Semua Response

Selalu bertipe `number` (`1` = aktif, `0` = nonaktif), **bukan boolean** — karena MySQL menyimpan TINYINT.

```ts
// ✅ Benar
const isAktif = data.aktif === 1

// ❌ Salah
const isAktif = data.aktif === true
```

### Throttle Limit

| Window | Maks Request |
|--------|-------------|
| Per detik | 50 |
| Per menit | 300 |

> **Tips bulk:** Gunakan endpoint bulk (`PUT /izin-peran/peran/:kode/bulk`, `PUT /modul/:kode/menu`) daripada loop per-item untuk menghindari `429`.

---

## Karyawan

> Semua endpoint butuh `Authorization: Bearer <token>`.
> **Company user** hanya bisa akses karyawan milik perusahaannya sendiri.
> **SUPERADMIN** bisa lihat semua karyawan lintas perusahaan.

### GET `/karyawan`

Daftar karyawan dengan pagination & search.

**Query Params:**

| Param | Tipe | Keterangan |
|-------|------|------------|
| `page` | number | Halaman (default: 1) |
| `limit` | number | Jumlah per halaman (default: 10) |
| `search` | string | Cari di nama, NIK, email, telepon |
| `aktif` | 0 \| 1 | Filter status aktif |
| `status_kepegawaian` | string | Filter: `TETAP` / `KONTRAK` / `PROBASI` / `MAGANG` |

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar karyawan",
  "data": [
    {
      "id_karyawan": "uuid",
      "id_perusahaan": "uuid",
      "id_jabatan": "uuid",
      "id_departemen": "uuid",
      "id_lokasi_kantor": null,
      "nik": "EMP-001",
      "nama": "Budi Santoso",
      "email": "budi@perusahaan.com",
      "telepon": "081234567890",
      "tanggal_lahir": "1990-05-20",
      "jenis_kelamin": 1,
      "alamat": "Jl. Sudirman No. 1",
      "foto_url": null,
      "tanggal_masuk": "2022-01-01",
      "tanggal_keluar": null,
      "tanggal_mulai_kontrak": "2022-01-01",
      "tanggal_akhir_kontrak": "2023-01-01",
      "gaji_pokok": 5000000,
      "nama_bank": "BCA",
      "no_rekening": "1234567890",
      "nama_pemilik_rekening": "Budi Santoso",
      "npwp": "12.345.678.9-012.000",
      "status_pajak": "K/1",
      "no_bpjs_kesehatan": "0001234567890",
      "no_bpjs_ketenagakerjaan": "12345678901",
      "status_kepegawaian": "TETAP",
      "aktif": 1,
      "dibuat_pada": "2026-03-23T10:00:00.000Z",
      "diubah_pada": null,
      "jabatan": { "id_jabatan": "uuid", "nama_jabatan": "Staff HRD", "level": 4 },
      "departemen": { "id_departemen": "uuid", "nama_departemen": "Human Resources" },
      "lokasi_kantor": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

> **Catatan:** Field `jabatan`, `departemen`, `lokasi_kantor` adalah nested object atau `null` jika belum di-assign.

---

### GET `/karyawan/:id`

Detail satu karyawan. Response sama seperti satu item di atas.

**Response `404`:** `Karyawan dengan ID '...' tidak ditemukan`

---

### POST `/karyawan`

Tambah karyawan baru. Hanya untuk company user.

> **Auto-create akun pengguna:** Setiap karyawan baru otomatis dibuatkan akun `pengguna` dengan role `EMPLOYEE` dan password default `Karyawan@123`. Flag `harus_ganti_password = 1` di-set otomatis — karyawan **wajib ganti password** saat login pertama.

**Request Body:**
```json
{
  "nik": "EMP-002",
  "nama": "Siti Rahayu",
  "email": "siti@perusahaan.com",
  "telepon": "081298765432",
  "tanggal_lahir": "1995-08-10",
  "jenis_kelamin": 2,
  "alamat": "Jl. Thamrin No. 5, Jakarta",
  "tanggal_masuk": "2023-03-01",
  "status_kepegawaian": "KONTRAK",
  "id_jabatan": "uuid-jabatan",
  "id_departemen": "uuid-departemen",
  "tanggal_mulai_kontrak": "2023-03-01",
  "tanggal_akhir_kontrak": "2024-03-01",
  "gaji_pokok": 4500000,
  "nama_bank": "Mandiri",
  "no_rekening": "1234567890",
  "nama_pemilik_rekening": "Siti Rahayu",
  "npwp": "12.345.678.9-012.000",
  "status_pajak": "TK/0",
  "no_bpjs_kesehatan": "0001234567890",
  "no_bpjs_ketenagakerjaan": "12345678901"
}
```

**Field Reference:**

*Data Pribadi:*
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `nik` | ❌ | Nomor induk karyawan — unik per perusahaan |
| `nama` | ✅ | Nama lengkap |
| `email` | ❌ | Format email valid |
| `telepon` | ❌ | Maks 20 karakter |
| `tanggal_lahir` | ❌ | Format `YYYY-MM-DD` |
| `jenis_kelamin` | ❌ | `1`=Laki-laki, `2`=Perempuan |
| `alamat` | ❌ | |
| `foto_url` | ❌ | URL foto |

*Informasi Pekerjaan:*
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_jabatan` | ❌ | UUID jabatan |
| `id_departemen` | ❌ | UUID departemen |
| `tanggal_masuk` | ❌ | Tanggal bergabung `YYYY-MM-DD` |
| `tanggal_keluar` | ❌ | Tanggal keluar `YYYY-MM-DD` |
| `status_kepegawaian` | ❌ | `TETAP` / `KONTRAK` / `PROBASI` / `MAGANG` |
| `tanggal_mulai_kontrak` | ❌ | `YYYY-MM-DD` |
| `tanggal_akhir_kontrak` | ❌ | `YYYY-MM-DD` |
| `gaji_pokok` | ❌ | Nominal Rupiah (integer) |

*Informasi Bank:*
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `nama_bank` | ❌ | Contoh: BCA, Mandiri, BNI |
| `no_rekening` | ❌ | Nomor rekening |
| `nama_pemilik_rekening` | ❌ | Nama sesuai buku tabungan |

*Informasi Pajak & BPJS:*
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `npwp` | ❌ | Format `12.345.678.9-012.000` |
| `status_pajak` | ❌ | PTKP: `TK/0`, `TK/1`, `TK/2`, `TK/3`, `K/0`, `K/1`, `K/2`, `K/3`, `K/I/0`, `K/I/1`, `K/I/2`, `K/I/3` |
| `no_bpjs_kesehatan` | ❌ | Nomor BPJS Kesehatan (13 digit) |
| `no_bpjs_ketenagakerjaan` | ❌ | Nomor BPJS Ketenagakerjaan |

**Response `201`:**
```json
{
  "message": "Karyawan berhasil ditambahkan. Akun pengguna dibuat otomatis, karyawan wajib ganti password saat login pertama.",
  "data": {
    "karyawan": {
      "id_karyawan": "uuid",
      "id_perusahaan": "uuid",
      "nik": "EMP-002",
      "nama": "Siti Rahayu",
      "email": "siti@perusahaan.com",
      "status_kepegawaian": "KONTRAK",
      "aktif": 1,
      "jabatan": null,
      "departemen": null,
      "lokasi_kantor": null
    },
    "pengguna": {
      "id_pengguna": "uuid",
      "id_perusahaan": "uuid",
      "id_karyawan": "uuid",
      "username": "siti.rahayu",
      "nama": "Siti Rahayu",
      "email": "siti@perusahaan.com",
      "peran": "EMPLOYEE",
      "aktif": 1,
      "harus_ganti_password": 1
    },
    "default_password": "Karyawan@123"
  }
}
```

> ⚠️ **Simpan & bagikan `default_password`** ke karyawan. Password ini juga ditampilkan kesini untuk kemudahan HR. Di DB sudah tersimpan dalam bentuk hash (bcrypt).

**Response `409`:** `NIK '...' sudah digunakan` / `Email '...' sudah digunakan oleh pengguna lain`
**Response `403`:** jika SUPERADMIN mencoba create

---

### PATCH `/karyawan/:id`

Update sebagian data karyawan. Semua field dari POST bersifat opsional, plus:

| Field | Tipe | Keterangan |
|-------|------|------------|
| `aktif` | 0 \| 1 | Nonaktifkan / aktifkan karyawan |
| `id_jabatan` | string \| null | Set null untuk hapus jabatan |
| `id_departemen` | string \| null | Set null untuk hapus departemen |

**Response `200`:** data karyawan setelah diupdate.

---

### DELETE `/karyawan/:id`

Soft delete karyawan (set `dihapus_pada`, `aktif = 0`).

**Response `200`:**
```json
{ "message": "Karyawan berhasil dihapus", "data": null }
```

---

### GET `/karyawan/:id/lokasi`

Daftar lokasi kantor yang di-assign ke karyawan (untuk geofencing absensi).

**Response `200`:**
```json
{
  "message": "Berhasil mengambil lokasi karyawan",
  "data": [
    {
      "id_lokasi": "uuid",
      "kode_lokasi": "KP-JKT",
      "nama_lokasi": "Kantor Pusat Jakarta",
      "alamat_lokasi": "Jl. Sudirman No. 1, Jakarta Pusat",
      "kota": "Jakarta",
      "provinsi": "DKI Jakarta",
      "kode_pos": "10110",
      "telepon": "021-12345678",
      "radius": 100,
      "aktif": 1,
      "dibuat_pada": "2026-03-24T08:00:00.000Z",
      "diubah_pada": null
    }
  ]
}
```

---

### PUT `/karyawan/:id/lokasi`

Set lokasi kantor karyawan (**replace-all** — semua lokasi lama diganti). Kirim array kosong `[]` untuk hapus semua assignment.

**Request Body:**
```json
{
  "lokasi_ids": ["uuid-lokasi-1", "uuid-lokasi-2"]
}
```

| Field | Wajib | Keterangan |
|-------|-------|------------|
| `lokasi_ids` | ✅ | Array UUID lokasi kantor. Boleh kosong `[]` |

**Response `200`:** list lokasi yang sudah di-assign (sama seperti GET /lokasi di atas).

---

### Enum & Konstanta Karyawan

| Field | Nilai |
|-------|-------|
| `jenis_kelamin` | `1`=Laki-laki, `2`=Perempuan |
| `status_kepegawaian` | `TETAP` / `KONTRAK` / `PROBASI` / `MAGANG` |
| `status_pajak` (PTKP) | `TK/0`, `TK/1`, `TK/2`, `TK/3` (tidak kawin) · `K/0`, `K/1`, `K/2`, `K/3` (kawin) · `K/I/0`, `K/I/1`, `K/I/2`, `K/I/3` (kawin istri bekerja) |

---

### GET `/karyawan/template/excel`

Download file Excel template kosong untuk keperluan import bulk.

**Response:** File `.xlsx` (`Content-Disposition: attachment; filename="template-karyawan.xlsx"`)

**Kolom template:**

| Kolom | Wajib | Keterangan |
|-------|-------|------------|
| `nik` | ❌ | Nomor induk karyawan |
| `nama*` | ✅ | Nama lengkap |
| `email` | ❌ | |
| `telepon` | ❌ | |
| `tanggal_lahir (YYYY-MM-DD)` | ❌ | |
| `jenis_kelamin (1=L / 2=P)` | ❌ | |
| `tanggal_masuk (YYYY-MM-DD)` | ❌ | |
| `status_kepegawaian (TETAP/KONTRAK/PROBASI/MAGANG)` | ❌ | |
| `alamat` | ❌ | |

---

### POST `/karyawan/upload/excel`

Import karyawan secara bulk dari file Excel. Hanya untuk company user.

**Request:** `multipart/form-data`, field `file` berisi file `.xlsx`.

**Proses:**
1. Baca semua baris dari Excel
2. Ambil semua NIK existing dari DB — **1x query**
3. Validasi setiap baris di memory (nama wajib, NIK duplikat)
4. Batch insert semua baris valid — **1 query per 100 baris**

**Response `200`:**
```json
{
  "message": "Import selesai: 48 berhasil, 2 gagal",
  "data": {
    "berhasil": 48,
    "gagal": 2,
    "errors": [
      "Baris 3: kolom \"nama\" wajib diisi",
      "Baris 7: NIK 'EMP-005' sudah digunakan"
    ]
  }
}
```

**Response `400`:** jika file kosong / tidak ada data.
**Response `403`:** jika SUPERADMIN mencoba upload.

---

---

## Offboarding (Karyawan Exit)

> Prefix: `/karyawan-exit` | Auth: Bearer Token
> Mencatat data karyawan yang keluar dari perusahaan — resign, terminasi, pensiun, dll.

### GET `/karyawan-exit`

Daftar data exit karyawan dengan pagination.

**Query params:**

| Param | Tipe | Keterangan |
|-------|------|------------|
| `page` | number | Default: 1 |
| `limit` | number | Default: 10 |
| `search` | string | Cari nama / NIK karyawan |
| `jenis_exit` | string | Filter berdasarkan jenis exit |

**Response `200`:**
```json
{
  "message": "Berhasil mengambil data exit karyawan",
  "data": [
    {
      "id_exit": "uuid",
      "jenis_exit": "RESIGN",
      "tanggal_pengajuan": "2026-03-25",
      "hari_kerja_terakhir": "2026-04-01",
      "tanggal_efektif_keluar": "2026-04-01",
      "alasan": "Mendapat tawaran kerja lebih baik",
      "catatan_internal": null,
      "dapat_direkrut_kembali": 1,
      "catatan_rehire": null,
      "dibuat_pada": "2026-03-25T08:00:00.000Z",
      "diubah_pada": null,
      "karyawan": {
        "id_karyawan": "uuid",
        "nik": "EMP-001",
        "nama": "Budi Santoso",
        "email": "budi@perusahaan.com",
        "telepon": "081234567890"
      }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### GET `/karyawan-exit/karyawan/:id_karyawan`

Semua riwayat exit satu karyawan (tanpa pagination).

> Deklarasi route ini **sebelum** `/:id` di controller.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil riwayat exit karyawan",
  "data": [ ...array sama seperti di atas... ]
}
```

**Response `404`:** jika karyawan tidak ditemukan.

---

### GET `/karyawan-exit/:id`

Detail satu record exit by ID.

**Response `404`:** `Data exit dengan ID '...' tidak ditemukan`

---

### POST `/karyawan-exit`

Input data exit karyawan baru.

**Request Body:**

| Field | Wajib | Tipe | Keterangan |
|-------|-------|------|------------|
| `id_karyawan` | ✅ | UUID | Karyawan yang keluar |
| `jenis_exit` | ✅ | string | Lihat enum di bawah |
| `tanggal_pengajuan` | ✅ | YYYY-MM-DD | Tanggal pengajuan exit |
| `hari_kerja_terakhir` | ✅ | YYYY-MM-DD | Hari kerja terakhir |
| `tanggal_efektif_keluar` | ✅ | YYYY-MM-DD | Tanggal resmi keluar dari perusahaan |
| `alasan` | ❌ | string | Alasan exit |
| `catatan_internal` | ❌ | string | Catatan internal (tidak ditampilkan ke karyawan) |
| `dapat_direkrut_kembali` | ❌ | 0 \| 1 | Default: `1` (ya) |
| `catatan_rehire` | ❌ | string | Catatan terkait eligibilitas rehire |

**Contoh Request:**
```json
{
  "id_karyawan": "uuid-karyawan",
  "jenis_exit": "RESIGN",
  "tanggal_pengajuan": "2026-03-25",
  "hari_kerja_terakhir": "2026-04-01",
  "tanggal_efektif_keluar": "2026-04-01",
  "alasan": "Mendapat tawaran kerja lebih baik",
  "catatan_internal": "Karyawan berprestasi, rekomendasikan untuk rehire",
  "dapat_direkrut_kembali": 1,
  "catatan_rehire": "Eligible untuk posisi teknis"
}
```

**Response `201`:** data exit lengkap dengan nested karyawan.

**Response `404`:** jika `id_karyawan` tidak ditemukan.

---

### PATCH `/karyawan-exit/:id`

Update sebagian data exit. Semua field opsional (sama seperti POST, kecuali `id_karyawan` tidak bisa diubah).

**Response `200`:** data exit setelah diupdate.

---

### DELETE `/karyawan-exit/:id`

Soft delete record exit.

**Response `200`:**
```json
{ "message": "Data exit karyawan berhasil dihapus", "data": null }
```

---

### Enum Jenis Exit

| Nilai | Label di Form |
|-------|--------------|
| `RESIGN` | Resign (Pengunduran Diri) |
| `TERMINASI` | Terminasi (PHK) |
| `PENSIUN` | Pensiun |
| `KONTRAK_BERAKHIR` | Kontrak Berakhir |
| `KESEPAKATAN_BERSAMA` | Kesepakatan Bersama |
| `MENINGGAL_DUNIA` | Meninggal Dunia |

---

---

# Kursus Dansa � API Documentation

> Semua endpoint prefix `/kursus` dan membutuhkan `Authorization: Bearer <JWT>`.
> **DATETIME** dikembalikan sebagai string `"YYYY-MM-DD HH:MM:SS"` (bukan ISO UTC) � tidak perlu konversi timezone.
> **UUID** PKs digunakan di semua tabel kursus.

---

## Daftar Modul Kursus

- [Kelas](#kursus-kelas)
- [Paket](#kursus-paket)
- [Kategori Umur](#kursus-kategori-umur)
- [Biaya](#kursus-biaya)
- [Diskon](#kursus-diskon)
- [Jadwal Kelas](#kursus-jadwal-kelas)
- [Siswa](#kursus-siswa)
- [Tagihan](#kursus-tagihan)
- [Pembayaran](#kursus-pembayaran)
- [Dashboard](#kursus-dashboard)

---

## Kursus � Kelas

> Table: `kursus_kelas` | PK: `id_kelas` (UUID)

### `GET /kursus/kelas`

Daftar kelas dengan pagination.

**Query Params:** `page`, `limit`, `search`

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar kelas",
  "data": [
    {
      "id_kelas": "uuid",
      "nama_kelas": "Ballet",
      "deskripsi": "Kelas Ballet untuk pemula",
      "aktif": 1,
      "dibuat_pada": "2026-03-01T00:00:00.000Z",
      "diubah_pada": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

### `POST /kursus/kelas`

**Request Body:**
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `nama_kelas` | ? | String, unik |
| `deskripsi` | ? | Teks bebas |
| `aktif` | ? | Default `1` |

---

## Kursus � Paket

> Table: `kursus_paket` | PK: `id_paket` (UUID) | FK: `id_kelas`

Paket tiap kelas (misal: Reguler, Intensif, Private).

### `GET /kursus/paket`

Daftar paket dengan pagination.

### `GET /kursus/paket/kelas/:id_kelas`

Daftar paket dalam satu kelas � **tanpa pagination** (untuk dropdown).

### `GET /kursus/paket/:id`

Detail satu paket.

### `POST /kursus/paket`

**Request Body:**
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_kelas` | ? | UUID kelas |
| `nama_paket` | ? | String maks 50 karakter |
| `deskripsi` | ? | Teks bebas |
| `aktif` | ? | Default `1` |

---

## Kursus � Kategori Umur

> Table: `kursus_kategori_umur` | PK: `id_kategori_umur` (UUID) | FK: `id_paket`, `id_kelas`

Segmentasi usia per paket (misal: 3-6 tahun, 7-12 tahun, Dewasa).

### `GET /kursus/kategori-umur`

Daftar kategori umur dengan pagination.

### `GET /kursus/kategori-umur/kelas/:id_kelas`

Dropdown kategori umur berdasarkan kelas.

### `GET /kursus/kategori-umur/paket/:id_paket`

Dropdown kategori umur berdasarkan paket.

### `POST /kursus/kategori-umur`

**Request Body:**
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_kelas` | ? | UUID kelas |
| `id_paket` | ? | UUID paket |
| `nama_kategori_umur` | ? | Contoh: "3-6 Tahun" |
| `durasi` | ? | Durasi dalam bulan |
| `deskripsi` | ? | Teks bebas |
| `aktif` | ? | Default `1` |

---

## Kursus � Biaya

> Table: `kursus_biaya` | PK: `id_biaya` (UUID) | FK: `id_kategori_umur`, `id_paket`, `id_kelas`

Daftar biaya/harga per kategori umur.

### `GET /kursus/biaya`

Daftar biaya dengan pagination.

### `GET /kursus/biaya/kelas/:id_kelas`

Dropdown biaya berdasarkan kelas.

### `GET /kursus/biaya/paket/:id_paket`

Dropdown biaya berdasarkan paket.

### `GET /kursus/biaya/kategori-umur/:id_kategori_umur`

Dropdown biaya berdasarkan kategori umur.

### `POST /kursus/biaya`

**Request Body:**
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_kelas` | ✅ | UUID kelas |
| `id_paket` | ? | UUID paket |
| `id_kategori_umur` | ? | UUID kategori umur |
| `jenis_biaya` | ✅ | Enum: `PENDAFTARAN`, `BULANAN`, `LAINNYA` |
| `nama_biaya` | ✅ | Contoh: "Biaya Bulanan" |
| `harga_biaya` | ? | Integer (rupiah) |
| `deskripsi` | ? | Teks bebas |
| `aktif` | ? | Default `1` |

---

## Kursus � Diskon

> Table: `kursus_diskon` | PK: `id_diskon` (UUID)

### `GET /kursus/diskon`

Daftar diskon dengan pagination.

### `GET /kursus/diskon/aktif`

Daftar diskon yang **berlaku sekarang** (tanpa pagination).

### `POST /kursus/diskon`

**Request Body:**
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `kode_diskon` | ? | String maks 20, unik |
| `nama_diskon` | ? | String |
| `persentase` | ? | Decimal 0-100 |
| `harga` | ? | Integer (diskon nominal) |
| `berlaku_mulai` | ? | Date YYYY-MM-DD |
| `berlaku_sampai` | ? | Date YYYY-MM-DD |
| `deskripsi` | ? | Teks bebas |
| `aktif` | ? | Default `1` |

---

## Kursus � Jadwal Kelas

> Table: `kursus_jadwal_kelas` | PK: `id_jadwal_kelas` (UUID)

### `GET /kursus/jadwal-kelas`

Daftar jadwal kelas dengan pagination.

**Query Params:** `page`, `limit`, `search`

**Response `200`:**
```json
{
  "data": [
    {
      "id_jadwal_kelas": "uuid",
      "id_kelas": "uuid",
      "nama_kelas": "Ballet",
      "id_karyawan": "uuid",
      "nama_karyawan": "Sari Dewi",
      "id_kategori_umur": "uuid",
      "nama_kategori_umur": "3-6 Tahun",
      "hari": "Senin",
      "jam_mulai": "09:00",
      "jam_selesai": "10:00",
      "tanggal_mulai": "2026-04-01",
      "tanggal_selesai": "2026-06-30",
      "sesi_pertemuan": 24,
      "deskripsi": null,
      "aktif": 1
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

### `GET /kursus/jadwal-kelas/kelas/:id_kelas`

Dropdown jadwal berdasarkan kelas.

### `POST /kursus/jadwal-kelas`

**Request Body:**
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_kelas` | ? | UUID kelas |
| `id_karyawan` | ? | UUID instruktur |
| `id_kategori_umur` | ? | UUID kategori umur |
| `hari` | ? | Senin/Selasa/dst |
| `jam_mulai` | ? | Format HH:MM |
| `jam_selesai` | ? | Format HH:MM |
| `tanggal_mulai` | ? | DATETIME |
| `tanggal_selesai` | ? | DATETIME |
| `sesi_pertemuan` | ? | Integer |
| `deskripsi` | ? | Teks bebas |
| `aktif` | ? | Default `1` |

---

## Kursus � Siswa

> Table: `siswa` | PK: `id_siswa` (UUID)

### `GET /kursus/siswa`

Daftar siswa dengan pagination & search.

**Response `200`:**
```json
{
  "data": [
    {
      "id_siswa": "uuid",
      "nama_siswa": "Andi Wijaya",
      "email": "andi@email.com",
      "telepon": "081234567890",
      "tanggal_lahir": "2000-01-15",
      "alamat": "Jl. Sudirman No. 1",
      "jenis_kelamin": 1,
      "foto_url": null,
      "aktif": 1,
      "dibuat_pada": "2026-03-01T00:00:00.000Z",
      "diubah_pada": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

### `GET /kursus/siswa/tunggakan`

Daftar siswa yang memiliki tagihan belum lunas (status MENUNGGU atau SEBAGIAN).

**Response `200`:**
```json
{
  "message": "Berhasil mengambil data tunggakan siswa",
  "data": [
    {
      "id_siswa": "uuid",
      "nama_siswa": "Andi Wijaya",
      "email": "andi@email.com",
      "telepon": "081234567890",
      "jumlah_tagihan_belum_lunas": 2,
      "total_tunggakan": 1500000
    }
  ]
}
```

### `GET /kursus/siswa/template/excel`

Download template Excel untuk import siswa (response: binary `.xlsx`).

### `POST /kursus/siswa/upload/excel`

Upload file Excel untuk import data siswa secara bulk.

**Content-Type:** `multipart/form-data`

**Form Field:** `file` (binary .xlsx)

### `POST /kursus/siswa`

**Request Body:**
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `nama_siswa` | ? | |
| `email` | ? | |
| `telepon` | ? | |
| `tanggal_lahir` | ? | YYYY-MM-DD |
| `alamat` | ? | |
| `jenis_kelamin` | ? | `1`=Laki-laki, `2`=Perempuan |
| `foto_url` | ? | URL foto |

---

## Kursus � Tagihan

> Table: `kursus_tagihan` | PK: `id_tagihan` (UUID)
> Status: `1`=MENUNGGU, `2`=SEBAGIAN, `3`=LUNAS, `4`=DIBATALKAN

### `GET /kursus/tagihan`

Daftar tagihan dengan pagination.

### `GET /kursus/tagihan/siswa/:id_siswa`

Semua tagihan satu siswa (tanpa pagination).

### `GET /kursus/tagihan/:id`

Detail satu tagihan.

**Response `200`:**
```json
{
  "data": {
    "id_tagihan": "uuid",
    "id_siswa": "uuid",
    "nama_siswa": "Andi Wijaya",
    "id_biaya": "uuid",
    "nama_biaya": "Biaya Bulanan",
    "id_kategori_umur": "uuid",
    "nama_kategori_umur": "3-6 Tahun",
    "id_paket": "uuid",
    "nama_paket": "Reguler",
    "id_kelas": "uuid",
    "nama_kelas": "Ballet",
    "periode": "2026-04",
    "sesi_pertemuan": 8,
    "total_harga": 750000,
    "total_bayar": 0,
    "status": 1,
    "deskripsi": null,
    "aktif": 1
  }
}
```

### `POST /kursus/tagihan`

**Request Body:**
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_siswa` | ? | UUID siswa |
| `id_biaya` | ? | UUID biaya |
| `id_kategori_umur` | ? | UUID kategori umur |
| `id_paket` | ? | UUID paket |
| `id_kelas` | ? | UUID kelas |
| `periode` | ? | Format YYYY-MM |
| `sesi_pertemuan` | ? | Integer |
| `total_harga` | ? | Decimal |
| `deskripsi` | ? | Teks bebas |

---

## Kursus � Pembayaran

> Table: `kursus_pembayaran` | PK: `id_pembayaran` (UUID)
> Metode: `TUNAI` / `TRANSFER` / `QRIS`

### `GET /kursus/pembayaran`

Daftar pembayaran dengan pagination.

### `GET /kursus/pembayaran/tagihan/:id_tagihan`

Semua pembayaran untuk satu tagihan.

### `POST /kursus/pembayaran`

Setelah berhasil membuat pembayaran, sistem otomatis *recalculate* status tagihan.

**Request Body:**
| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_tagihan` | ? | UUID tagihan |
| `jumlah` | ? | Decimal |
| `tanggal_bayar` | ? | YYYY-MM-DD |
| `metode` | ? | TUNAI / TRANSFER / QRIS |
| `referensi` | ? | No. referensi / nota |
| `deskripsi` | ? | Keterangan tambahan |
| `aktif` | ? | Default `1` |

### `DELETE /kursus/pembayaran/:id`

Soft delete pembayaran. Status tagihan otomatis di-recalculate.

---

## Kursus � Dashboard

> Endpoint: `GET /kursus/dashboard`

Ringkasan statistik kursus.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil ringkasan dashboard",
  "data": {
    "siswa_aktif": 120,
    "kelas_hari_ini": 5,
    "pendapatan_bulan_ini": 18000000,
    "tagihan_belum_lunas": 12,
    "pendapatan_6_bulan": [
      { "bulan": "2025-11", "total": 14000000 },
      { "bulan": "2025-12", "total": 16000000 }
    ],
    "siswa_per_kelas": [
      { "nama_kelas": "Ballet", "jumlah": 45 },
      { "nama_kelas": "Hip Hop", "jumlah": 30 }
    ],
    "jadwal_hari_ini": [
      {
        "id_jadwal_kelas": "uuid",
        "id_kelas": "uuid",
        "nama_kelas": "Ballet",
        "nama_karyawan": "Sari Dewi",
        "hari": "Senin",
        "jam_mulai": "09:00",
        "jam_selesai": "10:00",
        "sesi_pertemuan": 24
      }
    ],
    "pembayaran_terbaru": [
      {
        "id_pembayaran": "uuid",
        "nama_siswa": "Andi Wijaya",
        "jumlah": 750000,
        "metode": "TRANSFER",
        "tanggal_bayar": "2026-04-01"
      }
    ]
  }
}
```