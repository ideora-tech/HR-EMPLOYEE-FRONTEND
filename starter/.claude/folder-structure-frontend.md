# Folder Structure — Frontend Next.js (Template Ecme)

Gunakan file ini sebagai acuan standar struktur folder project Next.js berbasis template Ecme.
Claude wajib mengikuti pola ini saat membuat fitur baru — jangan membuat folder/file
di luar pola yang sudah ada kecuali ada alasan yang jelas.

> **Stack**: Next.js 14+ App Router · TypeScript · Template Ecme
> **Arsitektur**: Page (App Router) → Server Action / API Route → Service → Backend API (NestJS)

---

## Struktur Lengkap

```
{project-name}/
├── src/
│   │
│   ├── app/                                    ← Next.js App Router (routing berbasis folder)
│   │   ├── layout.tsx                          ← Root layout (html, body, provider global)
│   │   ├── page.tsx                            ← Halaman root / redirect ke dashboard
│   │   ├── not-found.tsx                       ← Halaman 404
│   │   ├── favicon.ico
│   │   │
│   │   ├── api/                                ← API Route Handler (Next.js)
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts                ← NextAuth handler (jika pakai NextAuth)
│   │   │
│   │   ├── (auth-pages)/                       ── Route Group: Halaman Auth (tidak butuh login)
│   │   │   ├── layout.tsx                      ← Layout khusus auth (centered, no sidebar)
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx                    ← Halaman login
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx                    ← Halaman register
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (public-pages)/                     ── Route Group: Halaman Publik (landing, dll)
│   │   │   ├── layout.tsx
│   │   │   └── ...
│   │   │
│   │   └── (protected-pages)/                  ── Route Group: Halaman yang butuh auth
│   │       ├── layout.tsx                      ← Layout utama (sidebar, header, dll dari Ecme)
│   │       │
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       │
│   │       ├── users/                          ← Fitur: User Management
│   │       │   ├── page.tsx                    ← List users
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx                ← Detail user
│   │       │   └── create/
│   │       │       └── page.tsx                ← Form buat user baru
│   │       │
│   │       ├── [fitur-baru]/                   ← Template untuk fitur baru
│   │       │   ├── page.tsx                    ← List / halaman utama fitur
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx                ← Detail
│   │       │   └── create/
│   │       │       └── page.tsx                ← Form create
│   │       │
│   │       └── settings/
│   │           └── page.tsx
│   │
│   ├── @types/                                 ← TypeScript type & interface global
│   │   ├── index.d.ts                          ← Type global (augment module, dll)
│   │   ├── api.types.ts                        ← ApiResponse<T>, PaginatedResult<T>
│   │   ├── auth.types.ts                       ← User session type, role enum
│   │   └── [feature].types.ts                  ← Type per feature (tambah sesuai kebutuhan)
│   │
│   ├── assets/                                 ← Static assets yang diimport di kode
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/                             ← Komponen UI (dari Ecme + custom)
│   │   ├── ui/                                 ← Komponen atom dari Ecme (Button, Input, Modal, dll)
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Table/
│   │   │   ├── Modal/
│   │   │   └── ...                             ← JANGAN diubah — komponen dari template
│   │   │
│   │   ├── shared/                             ← Komponen reusable buatan sendiri
│   │   │   ├── DataTable/                      ← Tabel dengan pagination, sort, filter
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── DataTablePagination.tsx
│   │   │   │   └── index.ts
│   │   │   ├── PageHeader/                     ← Header halaman standar (title + breadcrumb + action)
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ConfirmDialog/                  ← Dialog konfirmasi hapus/aksi
│   │   │   ├── ExportButton/                   ← Tombol download Excel/PDF
│   │   │   └── FormSection/                    ← Wrapper section dalam form
│   │   │
│   │   └── [feature]/                          ← Komponen khusus satu feature
│   │       └── users/
│   │           ├── UserTable.tsx               ← Tabel list user
│   │           ├── UserForm.tsx                ← Form create/edit user
│   │           ├── UserFilterBar.tsx           ← Filter & search
│   │           └── UserCard.tsx
│   │
│   ├── configs/                                ← Konfigurasi aplikasi
│   │   ├── app.config.ts                       ← Nama app, versi, feature flags
│   │   ├── navigation.config.ts                ← Konfigurasi menu sidebar (dari Ecme)
│   │   └── theme.config.ts                     ← Override theme Ecme
│   │
│   ├── constants/                              ← Nilai konstan
│   │   ├── api.constant.ts                     ← Endpoint URL path konstanta
│   │   ├── route.constant.ts                   ← Route path konstanta ('/users', '/dashboard')
│   │   └── app.constant.ts                     ← Konstanta umum (page size, dll)
│   │
│   ├── i18n/                                   ← Internationalization (jika dipakai)
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── id.json
│   │   └── i18n.config.ts
│   │
│   ├── mock/                                   ← Data mock untuk development & testing
│   │   ├── users.mock.ts
│   │   └── [feature].mock.ts
│   │
│   ├── server/                                 ← Server-side only code (tidak boleh di client!)
│   │   ├── actions/                            ← Server Actions Next.js ('use server')
│   │   │   ├── auth.action.ts                  ← Login, logout, refresh token
│   │   │   ├── users.action.ts                 ← CRUD user via Server Action
│   │   │   └── [feature].action.ts
│   │   └── api/                                ← Helper untuk fetch ke backend NestJS (server-side)
│   │       └── api-client.server.ts            ← Fetch dengan cookie/token server-side
│   │
│   ├── services/                               ← Client-side API call (fetch ke NestJS)
│   │   ├── api-client.ts                       ← Base fetch/axios instance dengan interceptor
│   │   ├── auth.service.ts                     ← Login, logout, refresh — dipanggil dari client
│   │   ├── users.service.ts                    ← GET/POST/PUT/DELETE /users
│   │   └── [feature].service.ts                ← Service per feature
│   │
│   ├── utils/                                  ← Helper / utility functions
│   │   ├── format.util.ts                      ← Format tanggal, angka, currency (Rupiah)
│   │   ├── validator.util.ts                   ← Validasi input
│   │   ├── storage.util.ts                     ← localStorage/sessionStorage helper
│   │   └── error.util.ts                       ← Parse error response dari NestJS
│   │
│   ├── auth.ts                                 ← Konfigurasi auth (NextAuth / custom)
│   └── middleware.ts                           ← Middleware Next.js — redirect berdasarkan auth
│
├── public/                                     ← Static files (tidak di-import, diakses via URL)
│   ├── images/
│   └── fonts/
│
├── .env.local                                  ← Env development lokal (tidak di-commit)
├── .env.example                                ← Template env untuk tim
├── .env.production                             ← Env production
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Pola Per Feature — Cara Menambah Fitur Baru

Setiap kali menambah fitur baru (misal: "laporan", "produk", "karyawan"), ikuti pola ini:

### 1. Tambah route di `src/app/(protected-pages)/`
```
(protected-pages)/
└── laporan/
    ├── page.tsx          ← List laporan
    ├── [id]/
    │   └── page.tsx      ← Detail laporan
    └── create/
        └── page.tsx      ← Form buat laporan
```

### 2. Tambah types di `src/@types/`
```typescript
// src/@types/laporan.types.ts
export interface ILaporan {
  id: number
  judul: string
  periode: string
  status: 'draft' | 'published'
  created_at: string
}

export interface ICreateLaporan {
  judul: string
  periode: string
}
```

### 3. Tambah service di `src/services/`
```typescript
// src/services/laporan.service.ts
import apiClient from './api-client'
import type { ILaporan, ICreateLaporan } from '@/@types/laporan.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export const laporanService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<PaginatedResult<ILaporan>>>('/laporan', { params }),

  getById: (id: number) =>
    apiClient.get<ApiResponse<ILaporan>>(`/laporan/${id}`),

  create: (data: ICreateLaporan) =>
    apiClient.post<ApiResponse<ILaporan>>('/laporan', data),

  update: (id: number, data: Partial<ICreateLaporan>) =>
    apiClient.put<ApiResponse<ILaporan>>(`/laporan/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/laporan/${id}`),
}
```

### 4. Tambah komponen di `src/components/[feature]/`
```
components/
└── laporan/
    ├── LaporanTable.tsx
    ├── LaporanForm.tsx
    └── LaporanFilterBar.tsx
```

### 5. Tambah konstanta route
```typescript
// src/constants/route.constant.ts
export const ROUTES = {
  dashboard: '/dashboard',
  users: '/users',
  laporan: '/laporan',           // ← tambah di sini
  laporanCreate: '/laporan/create',
} as const
```

---

## Detail File Penting

### `src/@types/api.types.ts`
```typescript
// Sesuai format response NestJS backend
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}
```

---

### `src/services/api-client.ts`
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios'
import { getSession, signOut } from 'next-auth/react' // atau custom auth

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach token
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})

// Response interceptor — handle error global
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: '/sign-in' })
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

---

### `src/constants/api.constant.ts`
```typescript
// Semua endpoint path dikonstantakan di sini — bukan hardcode di service
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login:   '/auth/login',
    logout:  '/auth/logout',
    refresh: '/auth/refresh',
    me:      '/auth/me',
  },
  // Users
  users: {
    list:    '/users',
    detail:  (id: number) => `/users/${id}`,
    create:  '/users',
    update:  (id: number) => `/users/${id}`,
    delete:  (id: number) => `/users/${id}`,
  },
  // Export
  export: {
    usersExcel: '/export/users/excel',
    usersPdf:   '/export/users/pdf',
  },
  // [feature]: tambah di sini
} as const
```

---

### `src/constants/route.constant.ts`
```typescript
export const ROUTES = {
  // Auth
  signIn:          '/sign-in',
  signUp:          '/sign-up',
  forgotPassword:  '/forgot-password',

  // Protected
  dashboard:       '/dashboard',
  users:           '/users',
  usersCreate:     '/users/create',
  usersDetail:     (id: number) => `/users/${id}`,

  // Settings
  settings:        '/settings',
} as const
```

---

### `src/middleware.ts`
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './auth'  // atau custom token check

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/forgot-password']
const AUTH_ROUTES = ['/sign-in', '/sign-up']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth() // cek session / token

  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  // Redirect ke login jika belum auth & akses protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Redirect ke dashboard jika sudah auth & akses auth route
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
```

---

### `src/components/shared/PageHeader/PageHeader.tsx`
```tsx
import React from 'react'
import Link from 'next/link'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  breadcrumbs?: Breadcrumb[]
  actions?: React.ReactNode   // tombol di kanan (Create, Export, dll)
}

export function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {breadcrumbs && (
          <nav className="flex gap-2 text-sm text-gray-500 mt-1">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {crumb.href
                  ? <Link href={crumb.href} className="hover:text-primary">{crumb.label}</Link>
                  : <span>{crumb.label}</span>
                }
              </span>
            ))}
          </nav>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
```

---

### `src/utils/format.util.ts`
```typescript
// Format Rupiah
export const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)

// Format tanggal Indonesia
export const formatDate = (dateStr: string, withTime = false): string => {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit', month: 'long', year: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  }
  return date.toLocaleDateString('id-ID', options)
}

// Format angka dengan pemisah ribuan
export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('id-ID').format(num)

// Truncate string
export const truncate = (str: string, maxLen: number): string =>
  str.length > maxLen ? `${str.slice(0, maxLen)}...` : str
```

---

### `src/utils/error.util.ts`
```typescript
import { AxiosError } from 'axios'

// Parse error dari response NestJS { success: false, message: '...' }
export function parseApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join(', ')       // ValidationPipe mengembalikan array pesan
        : String(data.message)
    }
    if (error.response?.status === 401) return 'Sesi habis, silakan login kembali'
    if (error.response?.status === 403) return 'Anda tidak punya akses ke fitur ini'
    if (error.response?.status === 404) return 'Data tidak ditemukan'
    if (error.response?.status === 500) return 'Terjadi kesalahan server, coba lagi'
  }
  return 'Terjadi kesalahan yang tidak diketahui'
}
```

---

---

## Modul HR — Struktur Organisasi (Departemen, Jabatan, Lokasi Kantor)

### Types — `src/@types/organisasi.types.ts`

```typescript
// ============================================================
// DEPARTEMEN
// ============================================================
export interface IDepartemen {
  id_departemen: string
  id_departemen_induk: string | null
  kode: string
  nama: string
  deskripsi: string | null
  aktif: number              // 1 = aktif, 0 = nonaktif
  dibuat_pada: string
  diubah_pada: string | null
  departemen_induk: { id_departemen: string; nama: string } | null
}

export interface IDepartemenTree extends IDepartemen {
  children: IDepartemenTree[]
}

export interface ICreateDepartemen {
  kode: string
  nama: string
  deskripsi?: string
  id_departemen_induk?: string    // UUID departemen induk, opsional
}

export type IUpdateDepartemen = Partial<ICreateDepartemen> & {
  id_departemen_induk?: string | null   // null = jadikan level teratas
  aktif?: 0 | 1
}

// ============================================================
// JABATAN
// ============================================================
export interface IJabatan {
  id_jabatan: string
  id_departemen: string | null
  kode: string
  nama: string
  level: number | null       // 1=Top Management, 2=Middle, 3=Supervisor, 4=Staff
  deskripsi: string | null
  aktif: number
  dibuat_pada: string
  diubah_pada: string | null
  departemen: { id_departemen: string; nama: string } | null
}

export interface ICreateJabatan {
  id_departemen?: string
  kode: string
  nama: string
  level?: 1 | 2 | 3 | 4
  deskripsi?: string
}

export type IUpdateJabatan = Partial<ICreateJabatan> & { aktif?: 0 | 1 }

// ============================================================
// LOKASI KANTOR
// ============================================================
export interface ILokasiKantor {
  id_lokasi: string
  kode: string
  nama: string
  alamat: string | null
  kota: string | null
  provinsi: string | null
  kode_pos: string | null
  telepon: string | null
  aktif: number
  dibuat_pada: string
  diubah_pada: string | null
}

export interface ICreateLokasiKantor {
  kode: string
  nama: string
  alamat?: string
  kota?: string
  provinsi?: string
  kode_pos?: string
  telepon?: string
}

export type IUpdateLokasiKantor = Partial<ICreateLokasiKantor> & { aktif?: 0 | 1 }
```

---

### API Endpoints — `src/constants/api.constant.ts`

Tambahkan ke `API_ENDPOINTS`:

```typescript
organisasi: {
  departemen: {
    list:   '/organisasi/departemen',
    tree:   '/organisasi/departemen/tree',
    detail: (id: string) => `/organisasi/departemen/${id}`,
    create: '/organisasi/departemen',
    update: (id: string) => `/organisasi/departemen/${id}`,
    delete: (id: string) => `/organisasi/departemen/${id}`,
  },
  jabatan: {
    list:          '/organisasi/jabatan',
    byDepartemen:  (idDept: string) => `/organisasi/jabatan/departemen/${idDept}`,
    detail:        (id: string) => `/organisasi/jabatan/${id}`,
    create:        '/organisasi/jabatan',
    update:        (id: string) => `/organisasi/jabatan/${id}`,
    delete:        (id: string) => `/organisasi/jabatan/${id}`,
  },
  lokasiKantor: {
    list:   '/organisasi/lokasi-kantor',
    detail: (id: string) => `/organisasi/lokasi-kantor/${id}`,
    create: '/organisasi/lokasi-kantor',
    update: (id: string) => `/organisasi/lokasi-kantor/${id}`,
    delete: (id: string) => `/organisasi/lokasi-kantor/${id}`,
  },
},
```

---

### Routes — `src/constants/route.constant.ts`

Tambahkan ke `ROUTES`:

```typescript
// Struktur Organisasi
departemen:          '/organisasi/departemen',
departemenCreate:    '/organisasi/departemen/create',
departemenDetail:    (id: string) => `/organisasi/departemen/${id}`,

jabatan:             '/organisasi/jabatan',
jabatanCreate:       '/organisasi/jabatan/create',
jabatanDetail:       (id: string) => `/organisasi/jabatan/${id}`,

lokasiKantor:        '/organisasi/lokasi-kantor',
lokasiKantorCreate:  '/organisasi/lokasi-kantor/create',
lokasiKantorDetail:  (id: string) => `/organisasi/lokasi-kantor/${id}`,
```

---

### Services

**`src/services/departemen.service.ts`**
```typescript
import apiClient from './api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IDepartemen, ICreateDepartemen, IUpdateDepartemen } from '@/@types/organisasi.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export const departemenService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedResult<IDepartemen>>>(API_ENDPOINTS.organisasi.departemen.list, { params }),

  // Untuk komponen tree/sidebar — response nested parent → children
  getTree: () =>
    apiClient.get<ApiResponse<IDepartemenTree[]>>(API_ENDPOINTS.organisasi.departemen.tree),

  getById: (id: string) =>
    apiClient.get<ApiResponse<IDepartemen>>(API_ENDPOINTS.organisasi.departemen.detail(id)),

  create: (data: ICreateDepartemen) =>
    apiClient.post<ApiResponse<IDepartemen>>(API_ENDPOINTS.organisasi.departemen.create, data),

  update: (id: string, data: IUpdateDepartemen) =>
    apiClient.patch<ApiResponse<IDepartemen>>(API_ENDPOINTS.organisasi.departemen.update(id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.organisasi.departemen.delete(id)),
}
```

**`src/services/jabatan.service.ts`**
```typescript
import apiClient from './api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IJabatan, ICreateJabatan, IUpdateJabatan } from '@/@types/organisasi.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export const jabatanService = {
  getAll: (params?: { page?: number; limit?: number; search?: string; id_departemen?: string }) =>
    apiClient.get<ApiResponse<PaginatedResult<IJabatan>>>(API_ENDPOINTS.organisasi.jabatan.list, { params }),

  // Untuk dropdown — tanpa pagination
  getByDepartemen: (idDepartemen: string) =>
    apiClient.get<ApiResponse<IJabatan[]>>(API_ENDPOINTS.organisasi.jabatan.byDepartemen(idDepartemen)),

  getById: (id: string) =>
    apiClient.get<ApiResponse<IJabatan>>(API_ENDPOINTS.organisasi.jabatan.detail(id)),

  create: (data: ICreateJabatan) =>
    apiClient.post<ApiResponse<IJabatan>>(API_ENDPOINTS.organisasi.jabatan.create, data),

  update: (id: string, data: IUpdateJabatan) =>
    apiClient.patch<ApiResponse<IJabatan>>(API_ENDPOINTS.organisasi.jabatan.update(id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.organisasi.jabatan.delete(id)),
}
```

**`src/services/lokasi-kantor.service.ts`**
```typescript
import apiClient from './api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { ILokasiKantor, ICreateLokasiKantor, IUpdateLokasiKantor } from '@/@types/organisasi.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export const lokasiKantorService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<ApiResponse<PaginatedResult<ILokasiKantor>>>(API_ENDPOINTS.organisasi.lokasiKantor.list, { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<ILokasiKantor>>(API_ENDPOINTS.organisasi.lokasiKantor.detail(id)),

  create: (data: ICreateLokasiKantor) =>
    apiClient.post<ApiResponse<ILokasiKantor>>(API_ENDPOINTS.organisasi.lokasiKantor.create, data),

  update: (id: string, data: IUpdateLokasiKantor) =>
    apiClient.patch<ApiResponse<ILokasiKantor>>(API_ENDPOINTS.organisasi.lokasiKantor.update(id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.organisasi.lokasiKantor.delete(id)),
}
```

---

### Struktur Halaman

```
src/app/(protected-pages)/
└── organisasi/
    ├── departemen/
    │   ├── page.tsx          ← List departemen (tabel + search + pagination)
    │   ├── create/
    │   │   └── page.tsx      ← Form tambah departemen
    │   └── [id]/
    │       └── page.tsx      ← Detail / edit departemen
    │
    ├── jabatan/
    │   ├── page.tsx          ← List jabatan (search, filter by departemen)
    │   ├── create/
    │   │   └── page.tsx      ← Form tambah jabatan (termasuk select departemen)
    │   └── [id]/
    │       └── page.tsx      ← Detail / edit jabatan
    │
    └── lokasi-kantor/
        ├── page.tsx          ← List lokasi kantor
        ├── create/
        │   └── page.tsx      ← Form tambah lokasi kantor
        └── [id]/
            └── page.tsx      ← Detail / edit lokasi kantor
```

### Komponen

```
src/components/
├── departemen/
│   ├── DepartemenTable.tsx    ← Tabel list + aksi edit/hapus
│   ├── DepartemenForm.tsx     ← Form create/edit
│   └── DepartemenFilterBar.tsx
│
├── jabatan/
│   ├── JabatanTable.tsx       ← Tampilkan kolom departemen dari nested object
│   ├── JabatanForm.tsx        ← Select departemen via getByDepartemen
│   └── JabatanFilterBar.tsx   ← Filter dropdown departemen
│
└── lokasi-kantor/
    ├── LokasiKantorTable.tsx
    ├── LokasiKantorForm.tsx
    └── LokasiKantorFilterBar.tsx
```

> **Catatan Jabatan**: Field `departemen` di response adalah object `{ id_departemen, nama }` atau `null`.
> Gunakan `jabatan.departemen?.nama ?? '-'` saat render di tabel.
> Untuk form select departemen, panggil `jabatanService.getByDepartemen` tidak perlu — gunakan `departemenService.getAll({ limit: 100 })` untuk mengisi dropdown.

---

## Modul HR — Karyawan

### Types — `src/@types/karyawan.types.ts`

```typescript
import type { IDepartemen } from './organisasi.types'

// ============================================================
// KARYAWAN
// ============================================================
export interface IKaryawan {
  id_karyawan: string
  id_perusahaan: string
  id_jabatan: string | null
  id_departemen: string | null
  id_lokasi_kantor: string | null

  // Data pribadi
  nik: string | null
  nama: string
  email: string | null
  telepon: string | null
  tanggal_lahir: string | null      // "YYYY-MM-DD"
  jenis_kelamin: number | null      // 1=L, 2=P
  alamat: string | null
  foto_url: string | null

  // Informasi pekerjaan
  tanggal_masuk: string | null
  tanggal_keluar: string | null
  tanggal_mulai_kontrak: string | null
  tanggal_akhir_kontrak: string | null
  gaji_pokok: number | null
  status_kepegawaian: string | null  // TETAP | KONTRAK | PROBASI | MAGANG

  // Informasi bank
  nama_bank: string | null
  no_rekening: string | null
  nama_pemilik_rekening: string | null

  // Informasi pajak & BPJS
  npwp: string | null
  status_pajak: string | null        // TK/0, K/1, K/I/0, dll
  no_bpjs_kesehatan: string | null
  no_bpjs_ketenagakerjaan: string | null

  aktif: number
  dibuat_pada: string
  diubah_pada: string | null

  // Nested objects (null jika belum di-assign)
  jabatan: { id_jabatan: string; nama: string; level: number | null } | null
  departemen: { id_departemen: string; nama: string } | null
  lokasi_kantor: { id_lokasi: string; nama: string } | null
}

export interface ICreateKaryawan {
  nik?: string
  nama: string
  email?: string
  telepon?: string
  tanggal_lahir?: string
  jenis_kelamin?: 1 | 2
  alamat?: string
  foto_url?: string
  // Pekerjaan
  id_jabatan?: string
  id_departemen?: string
  tanggal_masuk?: string
  tanggal_keluar?: string
  status_kepegawaian?: 'TETAP' | 'KONTRAK' | 'PROBASI' | 'MAGANG'
  tanggal_mulai_kontrak?: string
  tanggal_akhir_kontrak?: string
  gaji_pokok?: number
  // Bank
  nama_bank?: string
  no_rekening?: string
  nama_pemilik_rekening?: string
  // Pajak & BPJS
  npwp?: string
  status_pajak?: string
  no_bpjs_kesehatan?: string
  no_bpjs_ketenagakerjaan?: string
}

export type IUpdateKaryawan = Partial<ICreateKaryawan> & {
  id_jabatan?: string | null        // null = hapus assignment
  id_departemen?: string | null
  aktif?: 0 | 1
}

export interface ILokasiKaryawan {
  id_lokasi: string
  kode: string
  nama: string
  alamat: string | null
  kota: string | null
  provinsi: string | null
  radius: number | null             // Radius geofencing dalam meter
  aktif: number
}
```

---

### API Endpoints — `src/constants/api.constant.ts`

Tambahkan ke `API_ENDPOINTS`:

```typescript
karyawan: {
  list:            '/karyawan',
  detail:          (id: string) => `/karyawan/${id}`,
  create:          '/karyawan',
  update:          (id: string) => `/karyawan/${id}`,
  delete:          (id: string) => `/karyawan/${id}`,
  templateExcel:   '/karyawan/template/excel',
  uploadExcel:     '/karyawan/upload/excel',
  getLokasi:       (id: string) => `/karyawan/${id}/lokasi`,
  setLokasi:       (id: string) => `/karyawan/${id}/lokasi`,
},
```

---

### Routes — `src/constants/route.constant.ts`

```typescript
karyawan:         '/karyawan',
karyawanCreate:   '/karyawan/create',
karyawanDetail:   (id: string) => `/karyawan/${id}`,
karyawanEdit:     (id: string) => `/karyawan/${id}/edit`,
```

---

### Service — `src/services/karyawan.service.ts`

```typescript
import apiClient from './api-client'
import { API_ENDPOINTS } from '@/constants/api.constant'
import type { IKaryawan, ICreateKaryawan, IUpdateKaryawan, ILokasiKaryawan } from '@/@types/karyawan.types'
import type { ApiResponse, PaginatedResult } from '@/@types/api.types'

export const karyawanService = {
  getAll: (params?: {
    page?: number; limit?: number; search?: string
    aktif?: 0 | 1; status_kepegawaian?: string
  }) =>
    apiClient.get<ApiResponse<PaginatedResult<IKaryawan>>>(API_ENDPOINTS.karyawan.list, { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<IKaryawan>>(API_ENDPOINTS.karyawan.detail(id)),

  create: (data: ICreateKaryawan) =>
    apiClient.post<ApiResponse<IKaryawan>>(API_ENDPOINTS.karyawan.create, data),

  update: (id: string, data: IUpdateKaryawan) =>
    apiClient.patch<ApiResponse<IKaryawan>>(API_ENDPOINTS.karyawan.update(id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.karyawan.delete(id)),

  // Import Excel
  downloadTemplate: () =>
    apiClient.get(API_ENDPOINTS.karyawan.templateExcel, { responseType: 'blob' }),

  uploadExcel: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ApiResponse<{ berhasil: number; gagal: number; errors: string[] }>>(
      API_ENDPOINTS.karyawan.uploadExcel, form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },

  // Lokasi kantor (geofencing absensi)
  getLokasi: (id: string) =>
    apiClient.get<ApiResponse<ILokasiKaryawan[]>>(API_ENDPOINTS.karyawan.getLokasi(id)),

  // lokasi_ids: array UUID lokasi. Kirim [] untuk hapus semua.
  setLokasi: (id: string, lokasi_ids: string[]) =>
    apiClient.put<ApiResponse<ILokasiKaryawan[]>>(API_ENDPOINTS.karyawan.setLokasi(id), { lokasi_ids }),
}
```

---

### Catatan Penting Karyawan

> **Status Pajak (PTKP)** — nilai yang valid:
> `TK/0`, `TK/1`, `TK/2`, `TK/3` (tidak kawin, tanggungan 0-3)
> `K/0`, `K/1`, `K/2`, `K/3` (kawin, tanggungan 0-3)
> `K/I/0`, `K/I/1`, `K/I/2`, `K/I/3` (kawin, istri bekerja, tanggungan 0-3)
>
> **Lokasi Kantor** — untuk keperluan geofencing absensi. Satu karyawan bisa di-assign ke banyak lokasi.
> Gunakan `PUT /karyawan/:id/lokasi` untuk set sekaligus (replace-all).
>
> **Jabatan & Departemen** — di-assign via `id_jabatan` dan `id_departemen` saat create/update.
> Response selalu include nested object `jabatan` dan `departemen` (atau `null`).
> Untuk dropdown Jabatan per Departemen gunakan: `GET /organisasi/jabatan/departemen/:id_departemen`

---

## Aturan Wajib — Ecme Template

### ❌ JANGAN lakukan ini
```
// ❌ Buat page di luar route group
src/app/users/page.tsx          ← Harusnya di (protected-pages)

// ❌ Hardcode endpoint di komponen/page
fetch('http://localhost:3001/api/v1/users')  ← Pakai apiClient + API_ENDPOINTS

// ❌ Hardcode route string di Link
<Link href="/users/create">    ← Pakai ROUTES.usersCreate

// ❌ Ubah komponen di components/ui/
// Itu milik Ecme — update saat template diupdate akan konflik

// ❌ Type 'any' untuk response API
const res = await fetch('/api/users')
const data: any = await res.json()  ← Pakai ApiResponse<T>

// ❌ Logic bisnis di page.tsx langsung
export default function UsersPage() {
  const [users, setUsers] = useState([])
  useEffect(() => { fetch('/api/users').then(...) }, [])  // ← pindah ke service + komponen
}
```

### ✅ Lakukan ini
```tsx
// ✅ Page hanya orkestrasi — data fetching + render komponen
// src/app/(protected-pages)/users/page.tsx
import { UserTable } from '@/components/users/UserTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { ROUTES } from '@/constants/route.constant'

export default function UsersPage() {
  return (
    <>
      <PageHeader
        title="Manajemen User"
        breadcrumbs={[{ label: 'Dashboard', href: ROUTES.dashboard }, { label: 'Users' }]}
        actions={<Link href={ROUTES.usersCreate}><Button>+ Tambah User</Button></Link>}
      />
      <UserTable />
    </>
  )
}

// ✅ Data fetching di komponen atau server action
// src/components/users/UserTable.tsx (Client Component)
'use client'
import { useEffect, useState } from 'react'
import { usersService } from '@/services/users.service'
import { parseApiError } from '@/utils/error.util'

export function UserTable() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usersService.getAll({ page: 1, limit: 20 })
      .then(res => setUsers(res.data.data.data))
      .catch(err => setError(parseApiError(err)))
      .finally(() => setLoading(false))
  }, [])

  // ...render tabel
}
```

---

## Aturan Review Folder Structure Frontend

| Deviasi | Severity | Saran |
|---------|----------|-------|
| Page baru dibuat di `src/app/` langsung (bukan route group) | HIGH | Masukkan ke `(protected-pages)/`, `(auth-pages)/`, atau `(public-pages)/` |
| `fetch()` / `axios` dipanggil langsung di `page.tsx` | HIGH | Buat service di `src/services/` dan panggil dari komponen |
| Endpoint URL hardcode di service/komponen | HIGH | Gunakan `API_ENDPOINTS` dari `src/constants/api.constant.ts` |
| Route string hardcode (`'/users'`) di `Link` / `router.push` | MEDIUM | Gunakan `ROUTES` dari `src/constants/route.constant.ts` |
| Komponen di `components/ui/` dimodifikasi langsung | HIGH | Buat komponen baru di `components/shared/` atau `components/[feature]/` |
| Type `any` untuk data dari API | HIGH | Definisikan interface di `src/@types/[feature].types.ts` |
| Interface tidak menggunakan `ApiResponse<T>` sebagai wrapper | MEDIUM | Semua response backend dibungkus `ApiResponse<T>` |
| Logic bisnis / state management di `page.tsx` | MEDIUM | Pindahkan ke Client Component di `components/[feature]/` |
| Tidak ada `PageHeader` standar di halaman baru | LOW | Pakai `components/shared/PageHeader` untuk konsistensi |
| Error API tidak di-parse — langsung `console.error` | MEDIUM | Gunakan `parseApiError()` dari `utils/error.util.ts` |
| Komponen baru untuk satu feature dibuat di `components/shared/` | LOW | Feature-specific component masuk `components/[feature]/` |
| File `.env` di-commit ke git | CRITICAL | Tambahkan ke `.gitignore`, hanya commit `.env.example` |
| Tidak ada file di `@types/api.types.ts` — type duplikat di banyak tempat | MEDIUM | Centralize ke `@types/` |
