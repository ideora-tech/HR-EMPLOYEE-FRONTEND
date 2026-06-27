# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Referensi Dokumen Penting

File-file berikut ada di `.claude/` dan wajib dibaca saat relevan:

| File | Kapan dibaca |
|------|-------------|
| `.claude/PROJECT_PLAN.md` | Saat butuh konteks bisnis, fitur MVP, roadmap, atau pricing tier |
| `.claude/folder-structure-frontend.md` | Saat membuat fitur baru — ikuti pola folder & naming yang sudah ada |
| `.claude/folder-structure-backend.md` | Saat menyentuh atau mendiskusikan kode backend NestJS |
| `.claude/folder-structure-mobile.md` | Saat menyentuh kode Flutter/mobile |
| `.claude/checklist-js.md` | Saat review kode JS/TS — NestJS, Knex, Next.js, React |
| `.claude/checklist-flutter.md` | Saat review kode Flutter |
| `.claude/checklist-sql.md` | Saat review query SQL atau migration |
| `.claude/logging-guide.md` | Saat menambah logging atau debug |
| `.claude/module-access.md` | Saat mengatur permission atau akses modul |
| `.claude/kursus.md` | Saat mengerjakan modul Kursus (sekolah tari) |

---

## Commands

Semua perintah dijalankan dari direktori `starter/`:

```bash
npm run dev        # Start dev server (Next.js + Turbopack, port 3003)
npm run build      # Production build
npm run start      # Start production server (port 3003)
npm run lint       # ESLint
npm run prettier   # Check formatting
npm run prettier:fix  # Auto-fix formatting
```

---

## Tech Stack

- **Framework**: Next.js 15.3.1 App Router
- **Auth**: NextAuth v5 (beta) — Credentials provider, JWT session
- **Backend**: NestJS di `http://localhost:4012`, frontend di `http://localhost:3003`
- **UI**: Ecme template — komponen dari `@/components/ui` dan `@/components/shared`
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios via `@/services/ApiService`, baseURL `/api`
- **Table**: TanStack React Table via `@/components/shared/DataTable`
- **Icons**: `react-icons/hi` (HeroIcons outline)
- **Form**: React Hook Form + Zod validation
- **i18n**: next-intl (multi-language)

---

## Arsitektur Request API (PENTING)

Semua request ke backend **wajib** melewati Next.js Route Handler di `/api/proxy/[...path]`.

```
Browser (Axios) → /api/proxy/<endpoint>
→ Route Handler: src/app/api/proxy/[...path]/route.ts
    auth() → baca JWT cookie (server-side, tanpa HTTP call)
    Authorization: Bearer <token>
→ http://localhost:4012/<endpoint>
```

- Jangan gunakan `getSession()` dari client.
- Jangan gunakan Next.js rewrites untuk proxy ke backend.
- Jangan set header Authorization di Axios — sudah ditangani server-side oleh route handler.
- Token dibaca server-side via `auth()` — tidak ada race condition.

### Mendaftarkan Endpoint Baru

```ts
// src/constants/api.constant.ts
const PROXY = '/proxy'
export const API_ENDPOINTS = {
    MODUL: {
        BASE: `${PROXY}/modul`,
        BY_ID: (id: string) => `${PROXY}/modul/${id}`,
    },
}
```

---

## Auth Flow

```
Login   → validateCredential fetch POST http://localhost:4012/auth/login
        → jwt callback simpan accessToken, refreshToken ke JWT cookie
        → redirect /home

Request → Axios /api/proxy/<endpoint>
        → Route Handler auth() baca JWT cookie
        → Forward ke backend dengan Authorization: Bearer <accessToken>
```

- Error handling `handleSignIn.ts`: gunakan `error.type` (bukan `error.type.type`).
- Session di server: `const session = await auth()`
- Session di client: gunakan hook `useCurrentSession()`

---

## Routing & Proteksi Halaman

App Router menggunakan route groups:

```
src/app/
├── (auth-pages)/        ← sign-in, sign-up, forgot/reset-password
├── (protected-pages)/   ← semua halaman yang butuh login
│   └── layout.tsx       ← route guard: cek menu dari backend
├── (public-pages)/      ← tanpa auth
└── api/proxy/[...path]/ ← backend proxy handler
```

**Dynamic Access Control** — `(protected-pages)/layout.tsx` fetch menu tree dari backend saat load. Hanya path yang ada di menu (+ `ALWAYS_ALLOWED`) yang bisa diakses; selainnya redirect ke `/not-authorized`. Middleware di `middleware.ts` menangani redirect awal (login/logout).

---

## Struktur Folder Modul Baru

```
src/@types/<modul>.types.ts
src/services/<modul>.service.ts
src/constants/api.constant.ts       ← daftarkan endpoint di sini
src/app/(protected-pages)/<modul>/page.tsx
src/components/<modul>/
    ├── <Modul>Table.tsx
    ├── <Modul>Card.tsx
    └── <Modul>Form.tsx
```

---

## Design Pattern — Halaman List

```tsx
<Card
    header={{
        content: <h4>Judul</h4>,
        extra: <Button variant="solid" size="sm" icon={<HiPlusCircle />}>Tambah</Button>,
        bordered: false,
    }}
    bodyClass="p-0"
>
    <div className="flex items-center gap-3 px-4 pb-3">
        <Input ... />
        <Select ... />
    </div>
    <DataTable ... />
</Card>
```

---

## Design Pattern — DataTable

### Ukuran Kolom Standar

| Kolom | Size |
|-------|------|
| No (nomor urut) | 70 |
| Nama / teks utama | 280 |
| Kode / badge | 160 |
| Angka / kuantitas | 180 |
| Status (tag) | 140 |
| Aksi (tombol) | 100 |

### Nomor Urut Server-Side

```tsx
{ header: 'No', id: 'no', size: 70,
  cell: ({ row }) => (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1 }
```

### Tombol Aksi

```tsx
{/* Edit — biru */}
<span className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg
                 bg-blue-50 text-blue-600 hover:bg-blue-100
                 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
      onClick={() => onEdit(row.original)}>
    <HiOutlinePencilAlt className="text-lg" />
</span>

{/* Hapus — merah */}
<span className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg
                 bg-red-50 text-red-500 hover:bg-red-100
                 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-colors"
      onClick={() => onDelete(row.original)}>
    <HiOutlineTrash className="text-lg" />
</span>
```

### Pagination Server-Side

```tsx
const [currentPage, setCurrentPage] = useState(1)
const [pageSize, setPageSize] = useState(10)
const [total, setTotal] = useState(0)

const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])
const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size); setCurrentPage(1)
}, [])
```

Pagination area di `DataTable.tsx`: `<div className="flex items-center justify-between mt-4 px-4 pb-4">`

---

## Design Pattern — Tag / Badge

```tsx
// Status aktif/nonaktif
aktif === 1
    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100'
    : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100'
```

---

## Design Pattern — Form Modal

```tsx
<Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={480}>
    <h5 className="mb-6">{isEdit ? 'Edit Data' : 'Tambah Data Baru'}</h5>
    <div className="flex flex-col gap-4">
        <FormItem label="Nama" asterisk invalid={!!errors.nama} errorMessage={errors.nama}>
            <Input ... />
        </FormItem>
    </div>
    <div className="flex justify-end gap-2 mt-6">
        <Button variant="plain" onClick={onClose}>Batal</Button>
        <Button variant="solid" loading={submitting} onClick={handleSubmit}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah'}
        </Button>
    </div>
</Dialog>
```

---

## Design Pattern — Delete Confirmation

```tsx
<ConfirmDialog
    isOpen={!!deleteTarget}
    type="danger"
    title="Hapus Data?"
    confirmText="Ya, Hapus"
    cancelText="Batal"
    confirmButtonProps={{
        loading: submitting,
        customColorClass: () =>
            'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
    }}
    onClose={() => setDeleteTarget(null)}
    onCancel={() => setDeleteTarget(null)}
    onConfirm={handleDelete}
>
    <p className="text-sm">
        Data <span className="font-semibold">&ldquo;{deleteTarget?.nama}&rdquo;</span>{' '}
        akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
    </p>
</ConfirmDialog>
```

---

## Utility — Format Angka (WAJIB)

**JANGAN gunakan `toLocaleString('id-ID')` langsung di komponen** — menyebabkan hydration error di Next.js karena output berbeda antara server dan client.

Selalu import dari `@/utils/formatNumber`:

```ts
import { formatNum, formatRupiah, formatRupiahInput, parseRupiah } from '@/utils/formatNumber'
```

---

## Utility — Parse Error API

```ts
import { parseApiError } from '@/utils/parseApiError'

// Selalu gunakan ini — bukan err.message
.catch(err => setError(parseApiError(err)))
```

---

## Utility — Format Angka (WAJIB)

Selalu import dari `@/utils/formatNumber`:

```ts
formatNum(1500000)           // → "1.500.000"
formatRupiah(150000)         // → "Rp 150.000"
formatRupiahInput("1500abc") // → "1.500" (untuk input field)
parseRupiah("1.500.000")     // → 1500000 (parse kembali ke number)
```

Input Rupiah di form:

```tsx
<Input
    prefix={<span className="text-gray-500 font-medium">Rp</span>}
    value={form.harga}
    onChange={(e) => setForm(p => ({ ...p, harga: formatRupiahInput(e.target.value) }))}
/>
// Saat submit: parseRupiah(form.harga) untuk dapat nilai number
```

---

## Design Pattern — Toast

```tsx
toast.push(<Notification type="success" title="Data berhasil disimpan" />)
toast.push(<Notification type="danger" title="Gagal menyimpan data" />)
```

---

## Environment Variables

```env
BACKEND_API_URL=http://localhost:4012
NEXTAUTH_URL=http://localhost:3003/
AUTH_SECRET=<secret>
GOOGLE_AUTH_CLIENT_ID=<id>
GOOGLE_AUTH_CLIENT_SECRET=<secret>
GITHUB_AUTH_CLIENT_ID=<id>
GITHUB_AUTH_CLIENT_SECRET=<secret>
```
