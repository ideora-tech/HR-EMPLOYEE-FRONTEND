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

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar karyawan",
  "data": [
    {
      "id_karyawan": "uuid",
      "id_perusahaan": "uuid",
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
      "status_kepegawaian": "TETAP",
      "aktif": 1,
      "dibuat_pada": "2026-03-23T10:00:00.000Z",
      "diubah_pada": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

---

### GET `/karyawan/:id`

Detail satu karyawan berdasarkan UUID.

**Response `200`:** sama seperti satu item di atas.
**Response `404`:** `Karyawan dengan ID '...' tidak ditemukan`

---

### POST `/karyawan`

Tambah karyawan baru. Hanya untuk company user.

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
  "status_kepegawaian": "KONTRAK"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nik` | string | ❌ | Nomor induk karyawan — unik per perusahaan |
| `nama` | string | ✅ | Nama lengkap |
| `email` | string | ❌ | Format email valid |
| `telepon` | string | ❌ | Maks 20 karakter |
| `tanggal_lahir` | string | ❌ | Format `YYYY-MM-DD` |
| `jenis_kelamin` | 1 \| 2 | ❌ | 1 = Laki-laki, 2 = Perempuan |
| `alamat` | string | ❌ | |
| `foto_url` | string | ❌ | URL foto karyawan |
| `tanggal_masuk` | string | ❌ | Format `YYYY-MM-DD` |
| `tanggal_keluar` | string | ❌ | Format `YYYY-MM-DD` |
| `status_kepegawaian` | string | ❌ | `TETAP` / `KONTRAK` / `PROBASI` / `MAGANG` |

**Response `201`:** data karyawan yang baru dibuat.
**Response `409`:** `NIK '...' sudah digunakan`
**Response `403`:** jika SUPERADMIN mencoba create (hanya company user)

---

### PATCH `/karyawan/:id`

Update sebagian data karyawan. Semua field opsional, plus `aktif`.

**Request Body:** sama seperti POST tapi semua opsional, tambah field:

| Field | Tipe | Keterangan |
|-------|------|------------|
| `aktif` | 0 \| 1 | Nonaktifkan / aktifkan karyawan |

**Response `200`:** data karyawan setelah diupdate.
**Response `404`:** karyawan tidak ditemukan.
**Response `409`:** NIK baru sudah dipakai karyawan lain.

---

### DELETE `/karyawan/:id`

Soft delete karyawan (set `dihapus_pada`, `aktif = 0`).

**Response `200`:**
```json
{ "message": "Karyawan berhasil dihapus", "data": null }
```

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

# Kursus Dansa — API Documentation

> Semua endpoint prefix `/kursus` dan membutuhkan `Authorization: Bearer <JWT>`.
> **DATETIME** dikembalikan sebagai string `"YYYY-MM-DD HH:MM:SS"` (bukan ISO UTC) — tidak perlu konversi timezone.

---

## Daftar Modul Kursus

- [Siswa](#kursus-siswa)
- [Tingkat Program](#kursus-tingkat-program)
- [Program Pengajaran](#kursus-program-pengajaran)
- [Tarif](#kursus-tarif)
- [Jadwal Kelas](#kursus-jadwal-kelas)
- [Daftar Kelas](#kursus-daftar-kelas)
- [Presensi](#kursus-presensi)

---

## Kursus — Siswa

### GET `/kursus/siswa`

List siswa dengan pagination.

**Query Params:**
| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `page` | number | 1 | |
| `limit` | number | 10 | |
| `search` | string | - | Cari di nama / email / telepon |
| `aktif` | 0\|1 | - | Filter status |

**Response `200`:**
```json
{
  "message": "Berhasil mengambil data siswa",
  "data": [
    {
      "id_siswa": "uuid",
      "nama": "Andi Wijaya",
      "email": "andi@email.com",
      "telepon": "081234567890",
      "tanggal_lahir": "2000-01-15",
      "alamat": "Jl. Sudirman No. 1",
      "jenis_kelamin": 1,
      "foto_url": null,
      "aktif": 1,
      "dibuat_pada": "2026-03-23 08:00:00",
      "diubah_pada": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

---

### GET `/kursus/siswa/template/excel`

Download template Excel untuk import bulk siswa.

**Response:** File `.xlsx`

**Kolom template:**
| Kolom | Wajib | Keterangan |
|-------|-------|------------|
| `nama*` | ✅ | |
| `email` | ❌ | |
| `telepon` | ❌ | |
| `tanggal_lahir (YYYY-MM-DD)` | ❌ | Format `2000-01-15` |
| `jenis_kelamin (1=L / 2=P)` | ❌ | `1` atau `2` |
| `alamat` | ❌ | |

---

### GET `/kursus/siswa/:id`

**Response `404`:** jika tidak ditemukan.

---

### POST `/kursus/siswa`

**Request Body:**
```json
{
  "nama": "Andi Wijaya",
  "email": "andi@email.com",
  "telepon": "081234567890",
  "tanggal_lahir": "2000-01-15",
  "alamat": "Jl. Sudirman No. 1",
  "jenis_kelamin": 1
}
```

| Field | Wajib | Keterangan |
|-------|-------|------------|
| `nama` | ✅ | |
| `email` | ❌ | |
| `telepon` | ❌ | |
| `tanggal_lahir` | ❌ | Format `YYYY-MM-DD` |
| `jenis_kelamin` | ❌ | `1`=Laki-laki, `2`=Perempuan |
| `alamat` | ❌ | |
| `foto_url` | ❌ | |

---

### POST `/kursus/siswa/upload/excel`

Import bulk siswa dari file Excel.

**Request:** `multipart/form-data`, field `file` = file `.xlsx`

**Response `201`:**
```json
{
  "message": "Import selesai: 10 berhasil, 1 gagal",
  "data": {
    "berhasil": 10,
    "gagal": 1,
    "errors": ["Baris 5: kolom nama wajib diisi"]
  }
}
```

---

### PATCH `/kursus/siswa/:id`

Semua field opsional, sama dengan POST.

---

### DELETE `/kursus/siswa/:id`

Soft delete.

---

## Kursus — Tingkat Program

Master data tingkat (PEMULA, MENENGAH, MAHIR, dll).

### GET `/kursus/tingkat-program`

**Query:** `page`, `limit`, `search`, `aktif`

**Response `data[]`:**
```json
{
  "id_tingkat": "uuid",
  "kode": "PEMULA",
  "nama": "Pemula",
  "urutan": 1,
  "deskripsi": null,
  "aktif": 1,
  "dibuat_pada": "2026-03-23 08:00:00",
  "diubah_pada": null
}
```

### GET `/kursus/tingkat-program/:id`

### POST `/kursus/tingkat-program`

```json
{ "kode": "PEMULA", "nama": "Pemula", "urutan": 1, "deskripsi": "Level awal" }
```

### PATCH `/kursus/tingkat-program/:id`

### DELETE `/kursus/tingkat-program/:id`

---

## Kursus — Program Pengajaran

### GET `/kursus/program-pengajaran`

**Query:** `page`, `limit`, `search` (nama / kode_program), `aktif`

**Response `data[]`:**
```json
{
  "id_program": "uuid",
  "kode_program": "TARI_BALI_01",
  "nama": "Tari Bali Dasar",
  "deskripsi": "Program untuk pemula",
  "tingkat": "PEMULA",
  "durasi_menit": 60,
  "aktif": 1,
  "dibuat_pada": "2026-03-23 08:00:00",
  "diubah_pada": null
}
```

### GET `/kursus/program-pengajaran/:id`

### POST `/kursus/program-pengajaran`

```json
{
  "kode_program": "TARI_BALI_01",
  "nama": "Tari Bali Dasar",
  "deskripsi": "Program untuk pemula",
  "tingkat": "PEMULA",
  "durasi_menit": 60
}
```

**Response `409`:** jika `kode_program` sudah digunakan.

### PATCH `/kursus/program-pengajaran/:id`

**Response `409`:** jika `kode_program` baru sudah dipakai program lain.

### DELETE `/kursus/program-pengajaran/:id`

---

## Kursus — Tarif

### GET `/kursus/tarif`

**Query:** `page`, `limit`, `search` (nama), `aktif`

**Response `data[]`:**
```json
{
  "id_tarif": "uuid",
  "id_program": "uuid",
  "nama": "Paket 10 Sesi",
  "jenis": "PAKET",
  "jumlah_pertemuan": 10,
  "harga": "500000.00",
  "aktif": 1,
  "dibuat_pada": "2026-03-23 08:00:00",
  "diubah_pada": null
}
```

> ⚠️ `harga` adalah **string** (MySQL DECIMAL) — gunakan `parseFloat(tarif.harga)` untuk kalkulasi.

---

### GET `/kursus/tarif/program/:id_program`

List tarif berdasarkan program. Gunakan untuk dropdown saat daftar kelas.

**Response:** `data: ITarif[]` (array, tanpa pagination)

---

### GET `/kursus/tarif/:id`

### POST `/kursus/tarif`

```json
{
  "id_program": "uuid-program",
  "nama": "Paket 10 Sesi",
  "jenis": "PAKET",
  "harga": 500000,
  "jumlah_pertemuan": 10
}
```

| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_program` | ✅ | |
| `nama` | ✅ | |
| `jenis` | ✅ | `"PER_SESI"` atau `"PAKET"` |
| `harga` | ✅ | number |
| `jumlah_pertemuan` | ❌ | Wajib diisi jika `jenis = "PAKET"` |

### PATCH `/kursus/tarif/:id`
### DELETE `/kursus/tarif/:id`

---

## Kursus — Jadwal Kelas

> **Penting:** Setiap row = 1 sesi per hari.
> POST create menghasilkan **N row** (satu per hari dalam range tanggal).

### GET `/kursus/jadwal-kelas`

**Query:**
| Param | Tipe | Keterangan |
|-------|------|------------|
| `page`, `limit` | number | Pagination |
| `search` | string | Cari di nama / instruktur / lokasi |
| `aktif` | 0\|1 | Filter aktif |
| `week_start` | `YYYY-MM-DD` | Tampilkan sesi mulai tanggal ini |
| `week_end` | `YYYY-MM-DD` | Tampilkan sesi sampai tanggal ini |

**Contoh filter satu minggu:**
```
GET /kursus/jadwal-kelas?week_start=2026-03-23&week_end=2026-03-29
```

**Response `data[]`:**
```json
{
  "id_jadwal": "uuid",
  "id_program": "uuid",
  "nama": "Kelas Tari Bali Pagi",
  "tanggal_mulai": "2026-03-23 08:00:00",
  "tanggal_selesai": "2026-03-23 17:00:00",
  "instruktur": "Budi Santoso",
  "lokasi": "Studio A",
  "kuota": 10,
  "aktif": 1,
  "dibuat_pada": "2026-03-23 12:00:00",
  "diubah_pada": null
}
```

---

### GET `/kursus/jadwal-kelas/:id/kuota`

Info kuota satu sesi.

**Response `200`:**
```json
{ "message": "...", "data": { "kuota": 10, "terisi": 6, "sisa": 4 } }
```

---

### GET `/kursus/jadwal-kelas/:id`

---

### POST `/kursus/jadwal-kelas`

Generate N jadwal sekaligus (1 row per hari dalam range).

**Request Body:**
```json
{
  "id_program": "uuid-program",
  "nama": "Kelas Tari Bali Pagi",
  "tanggal_mulai": "2026-03-23",
  "tanggal_selesai": "2026-03-30",
  "jam_mulai": "08:00",
  "jam_selesai": "17:00",
  "instruktur": "Budi Santoso",
  "lokasi": "Studio A",
  "kuota": 10
}
```

| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_program` | ✅ | |
| `nama` | ✅ | |
| `tanggal_mulai` | ✅ | `YYYY-MM-DD` — tanggal mulai range |
| `tanggal_selesai` | ✅ | `YYYY-MM-DD` — tanggal selesai range |
| `jam_mulai` | ✅ | `HH:MM` (contoh: `"08:00"`) |
| `jam_selesai` | ✅ | `HH:MM` — sama untuk semua hari dalam range |
| `instruktur` | ❌ | |
| `lokasi` | ❌ | |
| `kuota` | ❌ | Default `10` |

**Response `201`:** `data: IJadwalKelas[]` — array semua sesi yang dibuat.

> POST range `2026-03-23` s/d `2026-03-30` → 8 row, masing-masing tanggal berbeda, jam sama.
> **Response `409`:** jika instruktur memiliki jadwal yang overlap pada salah satu hari dalam range.

---

### PATCH `/kursus/jadwal-kelas/:id`

Update 1 sesi jadwal.

**Request Body:**
```json
{
  "nama": "Kelas Tari Bali Sore",
  "tanggal_mulai": "2026-03-23T14:00:00",
  "tanggal_selesai": "2026-03-23T17:00:00",
  "instruktur": "Sari Dewi",
  "kuota": 15,
  "aktif": 1
}
```

> `tanggal_mulai`/`tanggal_selesai` di PATCH menggunakan format ISO datetime (dengan `T`), berbeda dari POST.

---

### DELETE `/kursus/jadwal-kelas/:id`

**Response `400`:** jika masih ada siswa aktif (status=1) yang terdaftar di sesi ini.

---

## Kursus — Daftar Kelas

### GET `/kursus/daftar-kelas`

List semua pendaftaran (JOIN siswa + jadwal + program + tarif).

**Query:** `page`, `limit`, `search` (nama / email siswa), `aktif`

**Response `data[]`:**
```json
{
  "id_daftar": "uuid",
  "tanggal_daftar": "2026-03-23",
  "status": 1,
  "catatan": null,
  "aktif": 1,
  "dibuat_pada": "2026-03-23 12:00:00",
  "diubah_pada": null,
  "siswa": {
    "id_siswa": "uuid",
    "nama": "Andi Wijaya",
    "email": "andi@email.com",
    "telepon": "081234567890"
  },
  "jadwal": {
    "id_jadwal": "uuid",
    "id_program": "uuid",
    "nama": "Kelas Tari Bali Pagi",
    "tanggal_mulai": "2026-03-23 08:00:00",
    "tanggal_selesai": "2026-03-23 17:00:00",
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

> `status`: `1`=Aktif, `2`=Selesai, `3`=Berhenti
> `tarif` bisa `null` jika tidak dipilih saat daftar.

---

### GET `/kursus/daftar-kelas/siswa/:id_siswa`

Semua pendaftaran milik satu siswa.

**Response:** `data: IDaftarKelas[]`

---

### GET `/kursus/daftar-kelas/jadwal/:id_jadwal`

Semua siswa yang terdaftar di satu sesi jadwal.

**Response:** `data: IDaftarKelas[]`

---

### GET `/kursus/daftar-kelas/:id`

---

### POST `/kursus/daftar-kelas`

Daftarkan 1 siswa ke 1 sesi jadwal.

**Request Body:**
```json
{
  "id_siswa": "uuid-siswa",
  "id_jadwal": "uuid-jadwal",
  "tanggal_daftar": "2026-03-23",
  "id_tarif": "uuid-tarif",
  "status": 1,
  "catatan": "Catatan tambahan"
}
```

| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_siswa` | ✅ | |
| `id_jadwal` | ✅ | |
| `tanggal_daftar` | ✅ | Format `YYYY-MM-DD` |
| `id_tarif` | ❌ | |
| `status` | ❌ | Default `1` |
| `catatan` | ❌ | |

**Response `400`:** Kuota kelas penuh.
**Response `409`:** Siswa sudah terdaftar di jadwal ini (dan statusnya bukan Berhenti).

---

### POST `/kursus/daftar-kelas/batch`

Daftarkan 1 siswa ke banyak sesi jadwal sekaligus.

**Request Body:**
```json
{
  "id_siswa": "uuid-siswa",
  "id_jadwal": ["uuid-jadwal-1", "uuid-jadwal-2", "uuid-jadwal-3"],
  "tanggal_daftar": "2026-03-23",
  "id_tarif": "uuid-tarif",
  "status": 1,
  "catatan": "Daftar kelas reguler"
}
```

**Response `201`:** `data: IDaftarKelas[]`

> Validasi dilakukan per jadwal. Jika salah satu jadwal penuh / duplikat, seluruh batch gagal.

---

### PATCH `/kursus/daftar-kelas/:id`

**Request Body:**
```json
{
  "status": 2,
  "catatan": "Siswa sudah menyelesaikan kursus",
  "id_tarif": "uuid-tarif-baru",
  "aktif": 0
}
```

---

### DELETE `/kursus/daftar-kelas/:id`

---

## Kursus — Presensi

> Presensi mencatat kehadiran siswa per sesi.
> Satu `daftar_kelas` (enrollment di satu sesi) = maksimal **1 presensi** (UNIQUE per `id_daftar`).
> `sesi_terpakai` = total presensi dengan `status = 1 (HADIR)`.

### GET `/kursus/presensi`

List presensi dengan pagination.

**Query:** `page`, `limit`, `search` (nama siswa)

**Response `data[]`:**
```json
{
  "id_presensi": "uuid",
  "status": 1,
  "catatan": null,
  "aktif": 1,
  "dibuat_pada": "2026-03-23 12:00:00",
  "diubah_pada": null,
  "daftar": { "id_daftar": "uuid" },
  "siswa": {
    "id_siswa": "uuid",
    "nama": "Andi Wijaya",
    "email": "andi@email.com",
    "telepon": "081234567890"
  },
  "jadwal": {
    "id_jadwal": "uuid",
    "nama": "Kelas Tari Bali Pagi",
    "tanggal_mulai": "2026-03-23 08:00:00",
    "tanggal_selesai": "2026-03-23 17:00:00"
  }
}
```

> `status`: `1`=HADIR, `2`=TIDAK_HADIR, `3`=SAKIT, `4`=IZIN

---

### GET `/kursus/presensi/jadwal/:id_jadwal`

Absen list semua siswa di satu sesi. Siswa yang belum diabsen muncul dengan `presensi: null`.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil absen jadwal",
  "data": [
    {
      "id_daftar": "uuid",
      "siswa": { "id_siswa": "uuid", "nama": "Andi Wijaya", "email": "andi@email.com", "telepon": null },
      "presensi": { "id_presensi": "uuid", "status": 1, "catatan": null }
    },
    {
      "id_daftar": "uuid",
      "siswa": { "id_siswa": "uuid", "nama": "Budi Santoso", "email": null, "telepon": "08222" },
      "presensi": null
    }
  ]
}
```

---

### GET `/kursus/presensi/siswa/:id_siswa`

Riwayat presensi satu siswa + total sesi yang dihadiri.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil presensi siswa",
  "data": [ ...IPresensi[] ],
  "sesi_terpakai": 6
}
```

> `sesi_terpakai` = COUNT presensi dengan `status = 1 (HADIR)` untuk siswa ini.

---

### GET `/kursus/presensi/daftar/:id_daftar`

Presensi untuk satu pendaftaran.

**Response:** `data: IPresensi | null` (null jika belum diabsen)

---

### GET `/kursus/presensi/:id`

---

### POST `/kursus/presensi/batch`

Absen massal semua siswa di satu sesi (upsert).

**Request Body:**
```json
{
  "id_jadwal": "uuid-jadwal",
  "items": [
    { "id_daftar": "uuid-daftar-1", "status": 1, "catatan": null },
    { "id_daftar": "uuid-daftar-2", "status": 3, "catatan": "Sakit demam" },
    { "id_daftar": "uuid-daftar-3", "status": 4, "catatan": "Izin pernikahan" }
  ]
}
```

| Field | Wajib | Keterangan |
|-------|-------|------------|
| `id_jadwal` | ✅ | Sesi yang akan diabsen |
| `items` | ✅ | Min 1 item |
| `items[].id_daftar` | ✅ | UUID enrollment yang terdaftar di `id_jadwal` ini |
| `items[].status` | ✅ | `1`\|`2`\|`3`\|`4` |
| `items[].catatan` | ❌ | |

**Response `201`:** `data: IPresensi[]`

> Jika presensi sudah ada → **update**. Jika belum ada → **create**. (Upsert)
> Gunakan sebagai tombol **"Simpan Absen"** di halaman absen per sesi.
> **Response `400`:** jika ada `id_daftar` yang bukan milik `id_jadwal` tersebut.

---

### POST `/kursus/presensi`

Catat presensi satu siswa.

**Request Body:**
```json
{
  "id_daftar": "uuid-daftar",
  "status": 1,
  "catatan": null
}
```

**Response `409`:** Presensi untuk `id_daftar` ini sudah ada. Gunakan PATCH untuk mengubah.

---

### PATCH `/kursus/presensi/:id`

Koreksi status/catatan presensi.

**Request Body:**
```json
{ "status": 2, "catatan": "Koreksi — tidak hadir" }
```

---

### DELETE `/kursus/presensi/:id`

Soft delete.

---

---

## 8. Tagihan

> Prefix: `/kursus/tagihan` | Auth: Bearer Token

### GET `/kursus/tagihan`

List tagihan dengan pagination.

**Query:** `page`, `limit`, `search` (nama siswa), `aktif`

**Response 200:**
```json
{
  "message": "Berhasil mengambil data tagihan",
  "data": [
    {
      "id_tagihan": "uuid",
      "jenis": "BULANAN",
      "periode": "2026-03",
      "jumlah_sesi": 8,
      "total_harga": 480000,
      "total_bayar": 240000,
      "status": 2,
      "catatan": null,
      "aktif": 1,
      "dibuat_pada": "2026-03-24T10:00:00.000Z",
      "diubah_pada": null,
      "siswa": { "id_siswa": "uuid", "nama": "Budi Santoso", "email": "budi@email.com", "telepon": "081234567890" }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

---

### GET `/kursus/tagihan/siswa/:id_siswa`

Semua tagihan milik satu siswa.

**Response 200:**
```json
{
  "message": "Berhasil mengambil tagihan siswa",
  "data": [ { ...TagihanResponseDto } ]
}
```

---

### GET `/kursus/tagihan/:id`

Detail tagihan by ID.

**Response 200:**
```json
{
  "message": "Berhasil mengambil detail tagihan",
  "data": { ...TagihanResponseDto }
}
```

---

### POST `/kursus/tagihan/generate-bulanan`

Generate tagihan otomatis dari presensi **PER_SESI + HADIR** dalam satu periode bulan. Mengelompokkan per (siswa, tarif).

**Request Body:**
```json
{ "periode": "2026-03" }
```

**Response 201:**
```json
{
  "message": "4 tagihan berhasil di-generate untuk periode 2026-03",
  "data": [ { ...TagihanResponseDto } ],
  "count": 4
}
```

---

### POST `/kursus/tagihan`

Buat tagihan manual.

**Request Body:**
```json
{
  "id_siswa": "uuid-siswa",
  "jenis": "PAKET",
  "periode": "2026-03",
  "jumlah_sesi": 8,
  "total_harga": 480000,
  "catatan": "Paket 8x sesi bulan Maret"
}
```

**Response 201:**
```json
{
  "message": "Tagihan berhasil dibuat",
  "data": { ...TagihanResponseDto }
}
```

---

### PATCH `/kursus/tagihan/:id`

Update tagihan (koreksi status, total, catatan).

**Request Body (semua opsional):**
```json
{
  "jenis": "LAINNYA",
  "periode": "2026-03",
  "jumlah_sesi": 10,
  "total_harga": 600000,
  "status": 4,
  "catatan": "Dibatalkan — siswa berhenti"
}
```

**Response 200:** `{ "message": "Tagihan berhasil diupdate", "data": { ...TagihanResponseDto } }`

---

### DELETE `/kursus/tagihan/:id`

Soft delete tagihan.

---

## 9. Pembayaran

> Prefix: `/kursus/pembayaran` | Auth: Bearer Token

Setiap pembayaran yang dicatat atau dihapus **otomatis me-recalculate** `total_bayar` dan `status` pada tagihan terkait.

### GET `/kursus/pembayaran`

List pembayaran dengan pagination.

**Query:** `page`, `limit`, `search` (nama siswa via JOIN tagihan→siswa)

**Response 200:**
```json
{
  "message": "Berhasil mengambil data pembayaran",
  "data": [
    {
      "id_pembayaran": "uuid",
      "id_tagihan": "uuid",
      "jumlah": 240000,
      "tanggal_bayar": "2026-03-24",
      "metode": "TRANSFER",
      "referensi": "TRF-20260324-001",
      "catatan": "DP pertama",
      "dibuat_pada": "2026-03-24T10:00:00.000Z",
      "diubah_pada": null,
      "tagihan": {
        "id_tagihan": "uuid",
        "jenis": "BULANAN",
        "periode": "2026-03",
        "total_harga": 480000,
        "total_bayar": 240000,
        "status": 2
      }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 10, "totalPages": 1 }
}
```

---

### GET `/kursus/pembayaran/tagihan/:id_tagihan`

Semua pembayaran untuk satu tagihan (riwayat cicilan).

**Response 200:**
```json
{
  "message": "Berhasil mengambil pembayaran tagihan",
  "data": [ { ...PembayaranResponseDto } ]
}
```

---

### GET `/kursus/pembayaran/:id`

Detail pembayaran by ID.

---

### POST `/kursus/pembayaran`

Catat pembayaran baru. Otomatis update `total_bayar` dan `status` pada tagihan.

**Request Body:**
```json
{
  "id_tagihan": "uuid-tagihan",
  "jumlah": 240000,
  "tanggal_bayar": "2026-03-24",
  "metode": "TRANSFER",
  "referensi": "TRF-20260324-001",
  "catatan": "DP pertama"
}
```

**Logika status tagihan setelah pembayaran:**

| Kondisi | Status Tagihan |
|---------|---------------|
| `total_bayar = 0` | `1` = MENUNGGU |
| `0 < total_bayar < total_harga` | `2` = SEBAGIAN |
| `total_bayar >= total_harga` | `3` = LUNAS |
| Manual set | `4` = DIBATALKAN (via PATCH tagihan) |

**Response 201:**
```json
{
  "message": "Pembayaran berhasil dicatat",
  "data": { ...PembayaranResponseDto }
}
```

---

### DELETE `/kursus/pembayaran/:id`

Soft delete pembayaran. Otomatis recalculate `total_bayar` dan `status` tagihan.

---

## Error Reference — Kursus

| HTTP | Penyebab |
|:----:|---------|
| `400` | Kuota kelas penuh / Jadwal masih ada siswa aktif (saat hapus) / `id_daftar` bukan milik jadwal ini |
| `409` | Kode program duplikat / Siswa sudah terdaftar di jadwal / Instruktur jadwal overlap / Presensi sudah ada |
| `404` | UUID tidak ditemukan atau sudah dihapus |

## Enum — Kursus

| Modul | Field | Nilai |
|-------|-------|-------|
| Siswa | `jenis_kelamin` | `1`=Laki-laki, `2`=Perempuan |
| Program | `tingkat` | `"PEMULA"` / `"MENENGAH"` / `"MAHIR"` |
| Tarif | `jenis` | `"PER_SESI"` / `"PAKET"` |
| Daftar Kelas | `status` | `1`=Aktif, `2`=Selesai, `3`=Berhenti |
| Presensi | `status` | `1`=HADIR, `2`=TIDAK_HADIR, `3`=SAKIT, `4`=IZIN |
| Tagihan | `jenis` | `"PAKET"` / `"BULANAN"` / `"LAINNYA"` |
| Tagihan | `status` | `1`=MENUNGGU, `2`=SEBAGIAN, `3`=LUNAS, `4`=DIBATALKAN |
| Pembayaran | `metode` | `"TUNAI"` / `"TRANSFER"` / `"QRIS"` |
| Presensi | `status` | `1`=HADIR, `2`=TIDAK_HADIR, `3`=SAKIT, `4`=IZIN |
