---
applyTo: "**/*.repository.ts,**/*.service.ts,**/*.controller.ts,**/*.module.ts,**/*.dto.ts,**/*.interface.ts"
---

# Backend NestJS Instructions

Sebelum menulis atau mengedit kode backend, baca file referensi berikut:
- `.claude/folder-structure-backend.md` — struktur folder wajib
- `.claude/checklist-js.md` — checklist review kode TypeScript/NestJS/Knex

## Aturan Wajib Backend

- **Alur wajib**: Controller → Service → Repository → Knex
- Query Knex **HANYA** boleh di `*.repository.ts` — DILARANG di service
- Setiap module wajib punya: `dto/`, `interfaces/`, controller, service, repository
- Repository wajib `implements` interface contract-nya
- Knex di-inject via `@Inject(KNEX_CONNECTION)` — bukan instansiasi manual
- Hanya `service` yang di-export dari module

## Contoh Struktur Module

```
src/modules/[feature]/
├── [feature].module.ts
├── [feature].controller.ts      ← Terima request, panggil service
├── [feature].service.ts         ← Business logic, panggil repository
├── [feature].repository.ts      ← Query Knex SAJA
├── interfaces/
│   ├── [feature].interface.ts
│   └── [feature]-repository.interface.ts
└── dto/
    ├── create-[feature].dto.ts
    └── update-[feature].dto.ts
```

## Larangan

- DILARANG `any` di TypeScript
- DILARANG query Knex di service
- DILARANG endpoint/route string hardcode
- DILARANG `knex.raw()` dengan string interpolation — pakai `?` binding
- DILARANG `process.env` langsung — pakai `ConfigModule`
