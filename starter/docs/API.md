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
      "company_id": "660e8400-e29b-41d4-a716-446655440001"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

> `access_token` expired sesuai konfigurasi `JWT_EXPIRES_IN`. `refresh_token` untuk memperbarui tanpa login ulang.

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
      "username": "budi.santoso",
      "nama": "Budi Santoso",
      "email": "budi@perusahaan.com",
      "peran": "HR_ADMIN",
      "aktif": 1,
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
  "username": "andi.wijaya"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nama` | string | ✅ | Nama lengkap |
| `email` | string | ✅ | Email unik |
| `kata_sandi` | string | ✅ | Password plain, akan di-hash |
| `peran` | string | ✅ | Kode peran, contoh: `HR_ADMIN` |
| `username` | string | ❌ | Username unik untuk login |

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
  "aktif": 1
}
```

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
  "url_logo": "https://cdn.example.com/logo.png"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nama` | string | ✅ | Max 100 karakter |
| `email` | string | ❌ | Email perusahaan |
| `telepon` | string | ❌ | Max 20 karakter |
| `alamat` | string | ❌ | Max 255 karakter |
| `url_logo` | string | ❌ | URL logo, max 255 karakter |

**Response `201`:** data perusahaan yang baru dibuat.

---

### PATCH `/perusahaan/:id`

Update perusahaan.
- **SUPERADMIN:** semua field termasuk `aktif`
- **OWNER:** hanya profil (nama, email, telepon, alamat, url_logo)

**Request Body** (semua opsional):
```json
{
  "nama": "PT Maju Sejahtera",
  "email": "info@baru.com",
  "telepon": "021-99999999",
  "alamat": "Jl. Thamrin No. 5",
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
| `search` | string | — | Cari berdasarkan `kode_peran` atau `nama` |
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
      "nama": "HR Manager / Admin",
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
  "nama": "Supervisor Lapangan"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kode_peran` | string | ✅ | Huruf besar + underscore, max 50 karakter |
| `nama` | string | ✅ | Nama tampilan, max 100 karakter |
| `aktif` | number | ❌ | Default `1` |

**Response `201`:** data peran yang baru dibuat.

---

### PUT `/peran/:id` — PATCH `/peran/:id`

Update peran. Company user tidak bisa edit peran global (`403`).

**Request Body:**
```json
{
  "nama": "Supervisor Senior",
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
      "nama": "Dashboard",
      "kode_modul": "DASHBOARD",
      "aksi": ["VIEW"]
    },
    {
      "id_menu": "uuid-...",
      "path": "/payroll",
      "nama": "Payroll",
      "kode_modul": "PAYROLL",
      "aksi": ["VIEW", "CREATE", "UPDATE"]
    },
    {
      "id_menu": "uuid-...",
      "path": "/reports/leave",
      "nama": "Laporan Cuti",
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
    "nama": "Payroll",
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
      "nama": "Free",
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
  "nama": "Enterprise Plus",
  "maks_karyawan": 999999,
  "harga": 2499000,
  "aktif": 1
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kode_paket` | string | ✅ | Huruf besar, angka, underscore |
| `nama` | string | ✅ | Nama tampil paket |
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
      "nama": "Dashboard",
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
      "nama": "Karyawan",
      "icon": "users",
      "path": "/employees",
      "kode_modul": "EMPLOYEES",
      "parent_id": null,
      "urutan": 2,
      "aktif": 1,
      "children": [
        {
          "id_menu": "uuid-...",
          "nama": "Daftar Karyawan",
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
  "nama": "Rekrutmen",
  "icon": "briefcase",
  "path": "/recruitment",
  "kode_modul": "RECRUITMENT",
  "parent_id": null,
  "urutan": 10
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nama` | string | ✅ | Max 100 karakter |
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
      "nama": "Dashboard",
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
  "nama": "Rekrutmen",
  "deskripsi": "Manajemen proses rekrutmen karyawan baru",
  "icon": "briefcase",
  "urutan": 10
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kode_modul` | string | ✅ | Huruf besar, angka, underscore. Max 50 karakter |
| `nama` | string | ✅ | Max 100 karakter |
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
2. Setiap request  → kirim access_token di header Authorization
3. Jika 401        → call POST /auth/refresh dengan refresh_token
4. Jika refresh gagal → redirect ke halaman login
5. POST /auth/logout → hapus token dari storage
```

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
