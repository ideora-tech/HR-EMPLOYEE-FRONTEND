---
applyTo: "**/app/(protected-pages)/**,**/app/(auth-pages)/**,**/services/*.service.ts,**/components/**/*.tsx,**/@types/*.types.ts"
---

# Frontend Next.js Instructions

Sebelum menulis atau mengedit kode frontend, baca file referensi berikut:
- `.claude/folder-structure-frontend.md` — struktur folder wajib
- `.claude/checklist-js.md` — checklist review kode TypeScript/Next.js

## Aturan Wajib Frontend

- **Alur wajib**: Page → Component → Service → Backend API
- Halaman baru WAJIB masuk route group `(protected-pages)/`, `(auth-pages)/`, atau `(public-pages)/`
- DILARANG ubah file di `components/ui/` — milik Ecme template
- Endpoint WAJIB pakai `API_ENDPOINTS` dari `constants/api.constant.ts`
- Route string WAJIB pakai `ROUTES` dari `constants/route.constant.ts`
- Logic/state DILARANG di `page.tsx` langsung — taruh di komponen terpisah

## Contoh Struktur Fitur

```
src/
├── app/(protected-pages)/[feature]/
│   └── page.tsx                  ← Hanya render komponen, tanpa logic
├── @types/[feature].types.ts     ← Interface/type definitions
├── services/[feature].service.ts ← API calls ke backend
└── components/[feature]/
    ├── [Feature]List.tsx
    └── [Feature]Form.tsx
```

## Error Handling Pattern

```typescript
import { parseApiError } from '@/utils/error.util'
try {
  const res = await featureService.getAll()
} catch (err) {
  setError(parseApiError(err)) // bukan err.message langsung!
}
```

## Larangan

- DILARANG `any` di TypeScript
- DILARANG hardcode URL endpoint — pakai `API_ENDPOINTS`
- DILARANG hardcode route string — pakai `ROUTES`
- DILARANG edit file di `components/ui/`
- DILARANG logic/state di `page.tsx`
