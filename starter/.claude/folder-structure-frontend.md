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
