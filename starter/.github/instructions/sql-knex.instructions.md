---
applyTo: "**/migrations/**,**/seeds/**,**/*.seed.ts,**/*.migration.ts"
---

# SQL / Knex Instructions

Sebelum menulis atau mengedit migration/seed/query, baca file referensi berikut:
- `.claude/checklist-sql.md` — checklist review query SQL/Knex

## Aturan Wajib Knex/SQL

- Migration file wajib ada untuk setiap perubahan skema DB — jangan alter tabel manual
- Nama migration deskriptif: `20240101_create_users_table`, bukan `migration1`
- Gunakan query builder — hindari `knex.raw()` jika bisa
- Jika terpaksa `knex.raw()`, wajib pakai `?` binding — DILARANG string interpolation
- `knex.transaction()` untuk operasi multi-tabel yang harus atomic
- MySQL tidak support `returning()` — pakai `result[0]` sebagai insertId setelah insert
- `is_active` di MySQL adalah int (0/1) — BUKAN boolean

## Contoh Pattern MySQL yang Benar

```typescript
// ✅ Insert dan ambil insertId (MySQL)
const [insertId] = await this.knex('users').insert(data)
const user = await this.knex('users').where({ id: insertId }).first()

// ✅ Raw query dengan binding aman
await this.knex.raw('SELECT * FROM users WHERE email = ?', [email])

// ❌ DILARANG — SQL injection risk
await this.knex.raw(`SELECT * FROM users WHERE email = '${email}'`)
```

## Larangan

- DILARANG alter tabel manual — selalu buat migration
- DILARANG string interpolation di `knex.raw()`
- DILARANG `returning()` untuk MySQL (hanya PostgreSQL)
- DILARANG hardcode nilai `is_active` sebagai boolean
