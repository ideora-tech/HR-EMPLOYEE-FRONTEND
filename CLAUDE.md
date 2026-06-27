# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

All frontend code lives in `starter/`. Read `starter/CLAUDE.md` before making changes — it contains the full architecture, design patterns, and project-specific rules.

## Commands (run from `starter/`)

```bash
npm run dev           # Dev server — Next.js + Turbopack, port 3003
npm run build         # Production build
npm run lint          # ESLint
npm run prettier:fix  # Auto-fix formatting
```

No test suite exists in this project.

## Architecture Summary

**Stack**: Next.js 15 App Router · NextAuth v5 · Tailwind CSS 4 · TanStack Table · React Hook Form + Zod · Zustand · Axios

**Request flow** — all backend calls go through the Next.js proxy; never call the backend directly from the browser:
```
Browser (Axios, baseURL /api)
  → /api/proxy/[...path]/route.ts  (injects JWT from auth() server-side)
  → NestJS backend at http://localhost:4012
```

**Module pattern** for every new feature:
```
src/@types/<feature>.types.ts          ← interfaces
src/services/<feature>.service.ts      ← Axios calls via apiClient
src/constants/api.constant.ts          ← register endpoints in API_ENDPOINTS
src/constants/route.constant.ts        ← register routes in ROUTES
src/app/(protected-pages)/<feature>/   ← pages (no logic here)
src/components/<feature>/              ← all state and data-fetching
```

**Route groups**:
- `(auth-pages)/` — login, forgot-password (no sidebar)
- `(protected-pages)/` — all authenticated pages; layout fetches menu from backend and enforces RBAC
- `(public-pages)/` — no auth required

## Critical Rules

- **Never modify `components/ui/`** — Ecme template components; extend in `components/shared/` or `components/<feature>/`
- **No `any` types** — all API responses typed with `ApiResponse<T>` / `PaginatedResult<T>`
- **No `toLocaleString('id-ID')`** in components — causes Next.js hydration errors; use `formatNum`/`formatRupiah` from `@/utils/formatNumber`
- **Error parsing**: always use `parseApiError` from `@/utils/parseApiError` — never read `err.message` directly
- **MySQL booleans**: `aktif` returns `0`/`1`, not `true`/`false`; compare with `=== 1`
- **File size**: keep files under 1000 lines
- **DB column naming**: columns use prefixed names (`kode_departemen`, `nama_jabatan`, `alamat_lokasi`) — never bare `kode`/`nama`

## DB Column Naming Convention

| Table | Column | Correct name |
|-------|--------|-------------|
| departemen | kode | `kode_departemen` |
| departemen | nama | `nama_departemen` |
| jabatan | kode | `kode_jabatan` |
| jabatan | nama | `nama_jabatan` |
| lokasi_kantor | kode | `kode_lokasi` |
| lokasi_kantor | nama | `nama_lokasi` |
| peran | nama | `nama_peran` |
| paket_langganan | nama | `nama_paket` |

## `harus_ganti_password` Flow

After `POST /auth/login`, check `data.user.harus_ganti_password`. If `=== 1`, middleware must redirect to `/ganti-password` before any other page. After a successful password change via `PATCH /pengguna/:id`, backend resets the flag to `0`.
