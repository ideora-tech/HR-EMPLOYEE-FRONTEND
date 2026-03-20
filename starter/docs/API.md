# HR Employee — API Documentation

> Base URL: `http://localhost:3000`
> Content-Type: `application/json`
> Autentikasi: Bearer Token (JWT) di header `Authorization`

---

## Format Response Standar

Semua endpoint mengembalikan envelope yang sama:

```json
{
  "success": true,
  "message": "Pesan sukses dari server",
  "data": { ... },
  "timestamp": "2026-03-20T10:00:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Pesan error dari server",
  "errors": ["detail error jika ada"],
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

Registrasi perusahaan baru + akun owner.
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
| `email` | string | ✅ | Email untuk login (harus valid) |
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

**Request Body:**
```json
{
  "email": "owner@dummy.com",
  "password": "password123"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `email` | string | ✅ | Email pengguna |
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

> **Catatan:** `access_token` expired dalam **1 hari**. `refresh_token` dipakai untuk memperbarui token tanpa login ulang.

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

Logout dan invalidasi refresh token.
**Perlu token.**

**Response `200`:**
```json
{
  "message": "Logout berhasil",
  "data": null
}
```

---

## Paket Langganan

> **Header wajib:** `Authorization: Bearer <access_token>`

### GET `/paket`

Ambil semua paket langganan.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar paket",
  "data": [
    {
      "id_paket": "550e8400-e29b-41d4-a716-446655440000",
      "kode_paket": "FREE",
      "nama": "Free",
      "maks_karyawan": 10,
      "harga": 0,
      "aktif": 1,
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null
    },
    {
      "id_paket": "550e8400-e29b-41d4-a716-446655440001",
      "kode_paket": "STARTER",
      "nama": "Starter",
      "maks_karyawan": 50,
      "harga": 199000,
      "aktif": 1,
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null
    }
  ]
}
```

---

### GET `/paket/:id`

Ambil detail paket berdasarkan UUID.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil detail paket",
  "data": {
    "id_paket": "550e8400-e29b-41d4-a716-446655440001",
    "kode_paket": "STARTER",
    "nama": "Starter",
    "maks_karyawan": 50,
    "harga": 199000,
    "aktif": 1,
    "dibuat_pada": "2026-01-01T00:00:00.000Z",
    "diubah_pada": null
  }
}
```

---

### POST `/paket`

Tambah paket langganan baru.

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
| `kode_paket` | string | ✅ | Huruf besar, angka, underscore saja. Contoh: `ENTERPRISE_PLUS` |
| `nama` | string | ✅ | Nama tampil paket |
| `maks_karyawan` | number | ✅ | Min 1 |
| `harga` | number | ✅ | Harga per bulan (Rupiah). 0 = gratis |
| `aktif` | number | ❌ | `1` atau `0`. Default: `1` |

**Response `201`:**
```json
{
  "message": "Paket berhasil dibuat",
  "data": {
    "id_paket": "550e8400-e29b-41d4-a716-446655440009",
    "kode_paket": "ENTERPRISE_PLUS",
    "nama": "Enterprise Plus",
    "maks_karyawan": 999999,
    "harga": 2499000,
    "aktif": 1,
    "dibuat_pada": "2026-03-20T10:00:00.000Z",
    "diubah_pada": null
  }
}
```

---

### PUT `/paket/:id` — PATCH `/paket/:id`

Update paket. Semua field opsional pada PATCH.

**Request Body:**
```json
{
  "nama": "Enterprise Plus v2",
  "harga": 2999000,
  "maks_karyawan": 9999,
  "aktif": 1,
  "kode_paket": "ENTERPRISE_PLUS_V2"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kode_paket` | string | ❌ | Huruf besar, angka, underscore |
| `nama` | string | ❌ | |
| `maks_karyawan` | number | ❌ | Min 1 |
| `harga` | number | ❌ | Min 0 |
| `aktif` | number | ❌ | `1` atau `0` |

**Response `200`:** sama seperti GET detail.

---

### DELETE `/paket/:id`

Soft delete paket (data tidak benar-benar dihapus).

**Response `200`:**
```json
{
  "message": "Paket berhasil dihapus",
  "data": null
}
```

---

## Modul

> **Header wajib:** `Authorization: Bearer <access_token>`
> Modul = master data SaaS (DASHBOARD, EMPLOYEES, PAYROLL, dst.)

### GET `/modul`

Ambil semua modul, diurutkan berdasarkan `urutan`.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil daftar modul",
  "data": [
    {
      "id_modul": "550e8400-e29b-41d4-a716-446655440000",
      "kode_modul": "DASHBOARD",
      "nama": "Dashboard",
      "deskripsi": "Ringkasan dan statistik perusahaan",
      "icon": "layout-dashboard",
      "urutan": 1,
      "aktif": 1,
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null
    }
  ]
}
```

---

### GET `/modul/:id`

Ambil detail modul berdasarkan UUID.

**Response `200`:** sama seperti satu item di atas.

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
| `icon` | string | ❌ | Nama icon (Tabler/Lucide). Max 100 karakter |
| `urutan` | number | ❌ | Urutan tampil di sidebar. Min 0 |

**Response `201`:** data modul yang baru dibuat.

---

### PUT `/modul/:id` — PATCH `/modul/:id`

Update modul. Semua field opsional pada PATCH.

**Request Body:**
```json
{
  "kode_modul": "RECRUITMENT_V2",
  "nama": "Rekrutmen & Onboarding",
  "deskripsi": "Manajemen rekrutmen dan onboarding karyawan",
  "icon": "user-check",
  "urutan": 10,
  "aktif": 1
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `kode_modul` | string | ❌ | Huruf besar, angka, underscore |
| `nama` | string | ❌ | |
| `deskripsi` | string | ❌ | |
| `icon` | string | ❌ | |
| `urutan` | number | ❌ | Min 0 |
| `aktif` | number | ❌ | `1` atau `0` |

**Response `200`:** data modul yang diupdate.

---

### DELETE `/modul/:id`

Soft delete modul.

**Response `200`:**
```json
{
  "message": "Modul berhasil dihapus",
  "data": null
}
```

---

## Akses Modul Tier

> **Header wajib:** `Authorization: Bearer <access_token>`
> Konfigurasi modul apa yang tersedia di tiap paket. Admin bisa **tambah**, **update**, dan **hapus** modul dari paket.

### POST `/akses-modul-tier`

Tambah modul ke paket tertentu.

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
| `kode_modul` | string | ✅ | Huruf besar, angka, underscore. Harus sudah ada di tabel `modul` |
| `paket` | string | ✅ | Huruf besar, angka, underscore. Harus sudah ada di tabel `paket_langganan` |
| `aktif` | number | ❌ | `1` atau `0`. Default: `1` |
| `batasan` | object \| null | ❌ | Batasan fitur. `null` = tidak ada batasan |

**Response `201`:**
```json
{
  "message": "Modul 'RECRUITMENT' berhasil ditambahkan ke paket 'PROFESSIONAL'",
  "data": {
    "id_akses_modul": "550e8400-e29b-41d4-a716-446655440099",
    "kode_modul": "RECRUITMENT",
    "paket": "PROFESSIONAL",
    "aktif": 1,
    "batasan": null,
    "dibuat_pada": "2026-03-20T10:00:00.000Z",
    "diubah_pada": null
  }
}
```

> **409 Conflict** jika kombinasi `kode_modul` + `paket` sudah terdaftar.

---

### DELETE `/akses-modul-tier/:id`

Hapus modul dari paket (soft delete berdasarkan UUID).

**Response `200`:**
```json
{
  "message": "Modul berhasil dihapus dari paket",
  "data": null
}
```

---

### GET `/akses-modul-tier`

Ambil semua konfigurasi paket × modul.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil konfigurasi akses modul",
  "data": [
    {
      "id_akses_modul": "550e8400-e29b-41d4-a716-446655440000",
      "kode_modul": "DASHBOARD",
      "paket": "FREE",
      "aktif": 1,
      "batasan": { "tampilan": 1 },
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null
    },
    {
      "id_akses_modul": "550e8400-e29b-41d4-a716-446655440001",
      "kode_modul": "EMPLOYEES",
      "paket": "FREE",
      "aktif": 1,
      "batasan": { "maks_karyawan": 10 },
      "dibuat_pada": "2026-01-01T00:00:00.000Z",
      "diubah_pada": null
    }
  ]
}
```

> **`batasan`** berisi objek JSON dengan angka sebagai nilai. `null` berarti tidak ada batasan.

---

### GET `/akses-modul-tier/paket/:paket`

Filter by paket tertentu.

**Contoh:** `GET /akses-modul-tier/paket/STARTER`

**Response `200`:** array konfigurasi modul untuk paket STARTER.

---

### GET `/akses-modul-tier/:id`

Detail konfigurasi berdasarkan UUID.

**Response `200`:** satu item konfigurasi.

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

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `aktif` | number | ❌ | `1` = modul aktif untuk paket ini, `0` = nonaktif |
| `batasan` | object \| null | ❌ | Batasan fitur. `null` = tanpa batasan |

**Response `200`:** data konfigurasi setelah diupdate.

---

### PATCH `/akses-modul-tier/paket/:paket/modul/:kode_modul`

Update berdasarkan kode paket + kode modul (lebih mudah dari frontend).

**Contoh:** `PATCH /akses-modul-tier/paket/STARTER/modul/PAYROLL`

**Request Body:** sama seperti PATCH by ID.

**Response `200`:**
```json
{
  "message": "Konfigurasi akses modul berhasil diupdate",
  "data": {
    "id_akses_modul": "550e8400-e29b-41d4-a716-446655440005",
    "kode_modul": "PAYROLL",
    "paket": "STARTER",
    "aktif": 1,
    "batasan": { "maks_tunjangan": 3 },
    "dibuat_pada": "2026-01-01T00:00:00.000Z",
    "diubah_pada": "2026-03-20T10:00:00.000Z"
  }
}
```

---

## Menu

> **Header wajib:** `Authorization: Bearer <access_token>`

### GET `/menu/me`

Ambil menu yang boleh diakses oleh user yang sedang login.
Filter berdasarkan paket perusahaan + peran user.
Dikembalikan dalam bentuk **tree (parent → children)**.

**Response `200`:**
```json
{
  "message": "Berhasil mengambil menu user",
  "data": [
    {
      "id_menu": "550e8400-e29b-41d4-a716-446655440000",
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
      "id_menu": "550e8400-e29b-41d4-a716-446655440001",
      "nama": "Karyawan",
      "icon": "users",
      "path": "/employees",
      "kode_modul": "EMPLOYEES",
      "parent_id": null,
      "urutan": 2,
      "aktif": 1,
      "children": [
        {
          "id_menu": "550e8400-e29b-41d4-a716-446655440010",
          "nama": "Daftar Karyawan",
          "icon": "list",
          "path": "/employees/list",
          "kode_modul": "EMPLOYEES",
          "parent_id": "550e8400-e29b-41d4-a716-446655440001",
          "urutan": 1,
          "aktif": 1,
          "children": []
        }
      ]
    }
  ]
}
```

> **Catatan:** `children` hanya ada pada `GET /menu/me`. Endpoint lain mengembalikan flat list.

---

### GET `/menu`

Ambil semua menu (flat list, termasuk nonaktif).

**Response `200`:** array flat tanpa `children`.

---

### GET `/menu/:id`

Ambil detail satu menu berdasarkan UUID.

**Response `200`:** satu item menu (flat, tanpa `children`).

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
| `icon` | string | ❌ | Nama icon. Max 100 karakter |
| `path` | string | ❌ | Path URL. Max 255 karakter |
| `kode_modul` | string | ❌ | Kode modul terkait. `null` = menu global (selalu tampil) |
| `parent_id` | string (UUID) | ❌ | UUID menu parent. `null` = root menu |
| `urutan` | number | ❌ | Urutan tampil. Min 0 |

**Response `201`:** data menu yang baru dibuat (flat).

---

### PUT `/menu/:id` — PATCH `/menu/:id`

Update menu. Semua field opsional.

**Request Body:**
```json
{
  "nama": "Rekrutmen & Onboarding",
  "icon": "user-check",
  "path": "/recruitment",
  "kode_modul": "RECRUITMENT",
  "parent_id": null,
  "urutan": 10,
  "aktif": 1
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nama` | string | ❌ | |
| `icon` | string | ❌ | |
| `path` | string | ❌ | |
| `kode_modul` | string | ❌ | |
| `parent_id` | string (UUID) | ❌ | |
| `urutan` | number | ❌ | Min 0 |
| `aktif` | number | ❌ | `1` atau `0` |

**Response `200`:** data menu setelah diupdate.

---

### DELETE `/menu/:id`

Soft delete menu.

**Response `200`:**
```json
{
  "message": "Menu berhasil dihapus",
  "data": null
}
```

---

## Module Access

> **Header wajib:** `Authorization: Bearer <access_token>`

### GET `/module-access/me`

Ambil daftar modul yang aktif untuk paket perusahaan user yang sedang login.

**Response `200`:**
```json
{
  "message": "Akses modul berhasil diambil",
  "data": [
    {
      "kode_modul": "DASHBOARD",
      "aktif": true,
      "batasan": null
    },
    {
      "kode_modul": "EMPLOYEES",
      "aktif": true,
      "batasan": { "maks_karyawan": 10 }
    },
    {
      "kode_modul": "ATTENDANCE",
      "aktif": false,
      "batasan": null
    }
  ]
}
```

> `aktif: false` berarti modul tidak tersedia untuk paket perusahaan. Frontend bisa gunakan ini untuk menyembunyikan fitur dan menampilkan prompt upgrade.

---

## Catatan Umum untuk Frontend

### Cara Pakai Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Isi JWT Payload (decode dari access_token)

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

| Field | Keterangan |
|-------|------------|
| `sub` | UUID pengguna |
| `role` | `OWNER` / `HR_ADMIN` / `FINANCE` / `EMPLOYEE` |
| `paket` | `FREE` / `STARTER` / `PROFESSIONAL` / `ENTERPRISE` |

### Alur Login yang Direkomendasikan

```
1. POST /auth/login → simpan access_token & refresh_token
2. Setiap request → kirim access_token di header Authorization
3. Jika respons 401 → call POST /auth/refresh dengan refresh_token
4. Jika refresh gagal → redirect ke halaman login
5. POST /auth/logout → hapus token dari storage
```

### Field `aktif` di Semua Response

Selalu bertipe `number` (`1` = aktif, `0` = nonaktif), **bukan boolean** — karena MySQL menyimpan TINYINT.

```ts
// ✅ Cara handle yang benar
const isAktif = data.aktif === 1

// ❌ Salah
const isAktif = data.aktif === true
```

### Throttle Limit

| Window | Maks Request |
|--------|-------------|
| Per detik | 10 |
| Per menit | 100 |

Jika melebihi limit, server mengembalikan `429 Too Many Requests`.
