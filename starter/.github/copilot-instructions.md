# GitHub Copilot Instructions — HR-EMPLOYEE Project

> File ini dibaca OTOMATIS oleh Copilot di setiap sesi.
> Semua aturan di sini WAJIB diikuti tanpa diminta.

---

## 📋 Project Context (HR & Payroll SaaS)

> Detail lengkap ada di `.claude/PROJECT_PLAN.md` — baca sebelum mulai fitur baru.

**Nama Project:** PayrollPro / HRFlow  
**Type:** Multi-tenant SaaS — setiap company punya data terisolasi  
**Target Market:** UKM Indonesia (10–500 karyawan)  
**Status:** Planning Phase → MVP 16 minggu  

### Pricing Tier (pengaruhi feature gating)
| Tier | Harga | Max Karyawan |
|------|-------|-------------|
| Free | Rp 0 | 10 |
| Starter | Rp 299K/mo | 50 |
| Professional | Rp 799K/mo | 200 |
| Enterprise | Custom | Unlimited |

### Roadmap MVP
| Phase | Minggu | Scope |
|-------|--------|-------|
| Foundation | 1–4 | Multi-tenant, Auth RBAC, Employee CRUD |
| Payroll Core | 5–8 | Komponen gaji, proses payroll, slip PDF, export bank |
| Attendance | 9–10 | Clock in/out, cuti, izin, approval workflow |
| Compliance | 11–12 | PPh 21, BPJS, export Excel/PDF |
| Launch | 13–16 | Testing, security audit, beta launch |

### Domain Rules (wajib diingat saat coding)
- Multi-tenant: setiap query WAJIB difilter by `company_id`
- `is_active` di MySQL adalah int (0/1) — BUKAN boolean
- Penggajian harus support: gaji pokok, tunjangan, potongan, PPh 21, BPJS TK, BPJS Kes
- BPJS: JKK, JKM, JHT, JP — masing-masing ada tarif pekerja & perusahaan
- PPh 21: hitung berdasarkan PTKP & tarif progresif sesuai regulasi Indonesia
- THR wajib dibayar sebelum Hari Raya (Lebaran) — 1x gaji untuk masa kerja ≥ 12 bulan

---

## Stack Project

| Layer | Teknologi |
|-------|-----------|
| Backend | NestJS + Knex + MySQL |
| Frontend | Next.js 14 App Router (Template Ecme) |
| Mobile | Flutter + GetX + Dio |
| Database | MySQL (mysql2) |

---

## WAJIB: Baca File Referensi Sebelum Coding

Sebelum mengerjakan task, SELALU baca file referensi yang relevan menggunakan tool read_file:

| Task | File yang WAJIB dibaca |
|------|------------------------|
| Backend (NestJS) — buat/edit | `.claude/folder-structure-backend.md` |
| Frontend (Next.js) — buat/edit | `.claude/folder-structure-frontend.md` |
| Mobile (Flutter) — buat/edit | `.claude/folder-structure-mobile.md` |
| Setup logging / error tracking | `.claude/logging-guide.md` |
| Review kode JS/TS/NestJS/Knex | `.claude/checklist-js.md` |
| Review kode Flutter/Dart | `.claude/checklist-flutter.md` |
| Review query SQL / Knex | `.claude/checklist-sql.md` |
| Buat guard/permission/menu | `.claude/module-access.md` |
| Feature gating per paket tenant | `.claude/module-access.md` |

**Cara baca:** Gunakan tool `read_file` sebelum menulis kode apapun.

---

## Arsitektur & Aturan Wajib

### Backend (NestJS)
- **Alur wajib**: Controller → Service → Repository → Knex
- Query Knex **HANYA** boleh di `*.repository.ts` — DILARANG di service
- Setiap module wajib punya: `dto/`, `interfaces/`, controller, service, repository
- Repository wajib `implements` interface contract-nya
- Knex di-inject via `@Inject(KNEX_CONNECTION)` di repository
- Hanya `service` yang di-export dari module — repository internal

### Frontend (Next.js Ecme)
- **Alur wajib**: Page → Component → Service → Backend API
- Halaman baru WAJIB masuk route group `(protected-pages)/`, `(auth-pages)/`, atau `(public-pages)/`
- DILARANG ubah file di `components/ui/` — milik Ecme template
- Endpoint WAJIB pakai `API_ENDPOINTS` dari `constants/api.constant.ts`
- Route string WAJIB pakai `ROUTES` dari `constants/route.constant.ts`
- Logic/state DILARANG di `page.tsx` langsung — taruh di komponen

### Mobile (Flutter GetX)
- **Alur wajib**: View → Controller → Repository → Dio → Backend
- API call WAJIB di `*_repository.dart` — DILARANG di controller
- Dio singleton via `DioClient.instance` — DILARANG buat instance baru
- Token JWT di `flutter_secure_storage` — DILARANG di `SharedPreferences`
- `Obx()` hanya wrap widget yang reaktif — DILARANG wrap seluruh Scaffold
- `TextEditingController` wajib di-dispose di `onClose()`
- Route string WAJIB pakai `AppRoutes` constant

---

## Type Safety (WAJIB semua layer)

```typescript
// ✅ WAJIB — response API selalu pakai wrapper
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

interface PaginatedResult<T> {
  data: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

// ❌ DILARANG
const data: any = response.data
fetch('/api/users') // endpoint hardcode
```

```dart
// ✅ WAJIB — model selalu punya fromJson
factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
  id: json['id'] as int,
  isActive: json['is_active'] == 1 || json['is_active'] == true, // MySQL int!
);

// ❌ DILARANG
final data = response.data['user']['name']; // tanpa model
final isActive = json['is_active'] as bool; // MySQL return int bukan bool!
```

---

## Checklist Wajib Sebelum Selesai Task

- [ ] Tidak ada `any` di TypeScript — semua pakai interface
- [ ] Tidak ada query Knex di service — semua di repository
- [ ] Tidak ada API call di controller Flutter — semua di repository
- [ ] Tidak ada endpoint/route string hardcode
- [ ] Tidak ada secret/API key hardcode — semua di `.env`
- [ ] Setiap `async` function punya error handling
- [ ] `is_active` MySQL dihandle sebagai int (0/1), bukan bool
- [ ] File baru mengikuti struktur folder yang ada di referensi

---

## Error Handling Pattern

```typescript
// ✅ Service — throw exception
async findById(id: number): Promise<IUserPublic> {
  const user = await this.usersRepository.findById(id)
  if (!user) throw new NotFoundException(`User #${id} tidak ditemukan`)
  return user
}

// ✅ Frontend — parse error dari NestJS
import { parseApiError } from '@/utils/error.util'
try {
  const res = await usersService.getAll()
} catch (err) {
  setError(parseApiError(err))
}
```

```dart
// ✅ Flutter Controller — catch AppException
try {
  await _repo.getUsers()
} on AppException catch (e) {
  errorMsg.value = e.message
  AppSnackbar.error(e.message)
}
```

---

## Cara Menambah Fitur Baru

### Backend
1. Baca `.claude/folder-structure-backend.md` terlebih dahulu
2. Buat `src/modules/[feature]/` dengan struktur lengkap
3. Daftarkan di `app.module.ts`

### Frontend
1. Baca `.claude/folder-structure-frontend.md` terlebih dahulu
2. Buat halaman di `src/app/(protected-pages)/[feature]/page.tsx`
3. Tambah di `constants/route.constant.ts` dan `api.constant.ts`

### Mobile
1. Baca `.claude/folder-structure-mobile.md` terlebih dahulu
2. Buat `lib/features/[feature]/` dengan struktur lengkap
3. Daftarkan di `app_pages.dart` dan `app_routes.dart`
