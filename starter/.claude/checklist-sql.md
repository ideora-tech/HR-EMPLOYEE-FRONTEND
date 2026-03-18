# Checklist Review — SQL (Oracle, PostgreSQL & MySQL)

## Code Quality

### Query Structure
- [ ] SELECT hanya kolom yang dibutuhkan, bukan `SELECT *`
- [ ] Alias tabel dipakai untuk query yang melibatkan lebih dari 1 tabel
- [ ] JOIN condition lengkap dan tidak menghasilkan cartesian product
- [ ] ORDER BY ada jika hasil harus berurutan
- [ ] Indeks ada di kolom yang sering dipakai di WHERE, JOIN, ORDER BY

### Readability
- [ ] Keyword SQL ditulis UPPERCASE (SELECT, FROM, WHERE, dll)
- [ ] Query panjang diformat dengan indentasi yang konsisten
- [ ] CTE (WITH clause) dipakai untuk subquery yang kompleks
- [ ] Nama kolom dan tabel deskriptif, tidak disingkat sembarangan

### Transaction & Data Integrity
- [ ] DML (INSERT/UPDATE/DELETE) yang kritikal dibungkus dalam transaksi
- [ ] COMMIT/ROLLBACK ada di akhir transaksi
- [ ] Foreign key constraint ada untuk relasi antar tabel
- [ ] NOT NULL constraint ada untuk kolom yang wajib diisi
- [ ] CHECK constraint ada untuk kolom yang punya aturan nilai

### MySQL Specific
- [ ] Storage engine pakai **InnoDB** bukan MyISAM (InnoDB support transaction & foreign key)
- [ ] Charset tabel/kolom pakai `utf8mb4` bukan `utf8` (utf8 MySQL tidak support emoji & beberapa karakter Unicode)
- [ ] Collation konsisten — hindari campur `utf8mb4_general_ci` dan `utf8mb4_unicode_ci` dalam satu JOIN
- [ ] `AUTO_INCREMENT` dipakai untuk primary key integer
- [ ] `DATETIME` atau `TIMESTAMP` dipakai untuk kolom waktu — bukan `VARCHAR`
- [ ] `ENUM` MySQL dipertimbangkan baik-baik — sulit di-alter setelah production
- [ ] Index tidak terlalu banyak di tabel yang sering di-INSERT/UPDATE (overhead write)
- [ ] `EXPLAIN` dijalankan untuk query yang lambat sebelum deploy
- [ ] Tidak ada `LIMIT` tanpa `ORDER BY` — hasil tidak deterministik
- [ ] `ON DELETE CASCADE` / `ON UPDATE CASCADE` dipakai dengan hati-hati — bisa hapus data tidak sengaja

---

## Bug Patterns yang Sering di SQL

### Missing WHERE pada UPDATE/DELETE
```sql
-- ❌ CRITICAL BUG: update SEMUA baris!
UPDATE users SET is_active = 0;

-- ✅ Fix: selalu ada WHERE
UPDATE users SET is_active = 0 WHERE id = :userId;
```

### NULL Comparison yang Salah
```sql
-- ❌ Bug: tidak pernah true, NULL != NULL
SELECT * FROM users WHERE deleted_at = NULL;

-- ✅ Fix: pakai IS NULL / IS NOT NULL
SELECT * FROM users WHERE deleted_at IS NULL;
```

### Implicit Type Conversion
```sql
-- ❌ Bug (Oracle): konversi implicit, index tidak dipakai
SELECT * FROM orders WHERE order_date = '2024-01-01';

-- ✅ Fix: eksplisit konversi
SELECT * FROM orders WHERE order_date = TO_DATE('2024-01-01', 'YYYY-MM-DD');

-- ✅ Fix (PostgreSQL)
SELECT * FROM orders WHERE order_date = '2024-01-01'::date;
```

### N+1 Query Problem
```sql
-- ❌ Bug: query dalam loop aplikasi
-- Loop 100 user → 100 query ke DB
FOR user IN users:
    SELECT * FROM orders WHERE user_id = user.id

-- ✅ Fix: satu query dengan JOIN atau IN
SELECT u.id, u.name, o.id as order_id, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.id IN (1, 2, 3, ...);
```

### Cartesian Product (JOIN tanpa kondisi)
```sql
-- ❌ Bug: 100 users × 50 products = 5000 rows!
SELECT * FROM users, products;

-- ✅ Fix: selalu ada JOIN condition
SELECT u.name, p.name
FROM users u
JOIN user_products up ON up.user_id = u.id
JOIN products p ON p.id = up.product_id;
```

### MySQL — Charset Mismatch pada JOIN
```sql
-- ❌ Bug: JOIN antara kolom dengan collation berbeda → index tidak dipakai, hasil salah
-- tabel users: utf8_general_ci
-- tabel orders: utf8mb4_unicode_ci
SELECT * FROM users u JOIN orders o ON u.email = o.email;
-- MySQL harus konversi charset dulu → full table scan!

-- ✅ Fix: pastikan charset & collation konsisten
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### MySQL — LIMIT tanpa ORDER BY
```sql
-- ❌ Bug: hasil tidak deterministik, bisa berbeda tiap query
SELECT * FROM users LIMIT 10;

-- ✅ Fix: selalu ada ORDER BY
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

### MySQL — Penggunaan ENUM yang Bermasalah
```sql
-- ❌ Bug: ALTER ENUM di production → table lock!
ALTER TABLE orders MODIFY COLUMN status ENUM('pending','processing','shipped','done','cancelled');
-- Pada tabel besar ini bisa lock tabel berjam-jam

-- ✅ Alternatif: pakai TINYINT + lookup table atau VARCHAR dengan CHECK
CREATE TABLE order_statuses (id TINYINT PK, name VARCHAR(50));
ALTER TABLE orders ADD COLUMN status_id TINYINT, ADD FOREIGN KEY (status_id) REFERENCES order_statuses(id);
```

### MySQL — MyISAM tanpa Transaction Support
```sql
-- ❌ Bug: MyISAM tidak support transaction → data inkonsisten jika error di tengah
CREATE TABLE payments (id INT, amount DECIMAL) ENGINE=MyISAM;

-- ✅ Fix: selalu InnoDB
CREATE TABLE payments (id INT, amount DECIMAL) ENGINE=InnoDB;
```

### Oracle — ROWNUM vs FETCH
```sql
-- ❌ Bug: ROWNUM difilter sebelum ORDER BY
SELECT * FROM users WHERE ROWNUM <= 10 ORDER BY created_at DESC;
-- Ini ambil 10 baris dulu BARU disorting, bukan 10 terbaru!

-- ✅ Fix: gunakan subquery atau FETCH
SELECT * FROM (
  SELECT * FROM users ORDER BY created_at DESC
) WHERE ROWNUM <= 10;

-- Atau (Oracle 12c+)
SELECT * FROM users ORDER BY created_at DESC
FETCH FIRST 10 ROWS ONLY;
```

---

## Checklist Penerapan Knex

### Setup & Konfigurasi
- [ ] `client` di knexfile sesuai DB yang dipakai: `'mysql2'` / `'pg'` / `'oracledb'`
- [ ] Knex di-inject via `KNEX_CONNECTION` token di NestJS — tidak dibuat ulang tiap request
- [ ] `pool.min` dan `pool.max` dikonfigurasi sesuai kebutuhan (default: min 2, max 10)
- [ ] `acquireConnectionTimeout` diset untuk menghindari hanging connection
- [ ] SSL diaktifkan untuk koneksi production

### Query Builder
- [ ] Selalu pakai query builder, bukan `knex.raw()` untuk query standar
- [ ] `knex.raw()` hanya untuk query yang tidak bisa dibuat dengan query builder — dan wajib pakai binding `?` atau `??`
- [ ] `.select()` eksplisit kolom yang dibutuhkan — jangan `.select('*')`
- [ ] `.where()` pakai object `{ key: value }` untuk kondisi sederhana
- [ ] `.first()` dipakai untuk query yang expected return 1 row
- [ ] Return value `.first()` dicek dulu (bisa `undefined`) sebelum dipakai
- [ ] `.orderBy()` selalu ada jika hasil harus deterministik
- [ ] `.limit()` dan `.offset()` dipakai untuk pagination — bukan fetch semua data
- [ ] Kolom `created_at` dan `updated_at` pakai `knex.fn.now()` bukan `new Date()`

### Transaction
- [ ] Operasi yang melibatkan lebih dari 1 tabel dibungkus dalam `knex.transaction()`
- [ ] `trx` di-pass ke semua query di dalam transaction — jangan campur `knex` dan `trx`
- [ ] Transaction di-commit otomatis jika tidak throw, rollback otomatis jika throw
- [ ] Tidak ada `try/catch` yang menelan error di dalam transaction — biarkan bubble up

### Migration
- [ ] Setiap perubahan schema dibuat via migration file — tidak ALTER manual di DB
- [ ] Migration file tidak diedit setelah dijalankan di production — buat migration baru
- [ ] `down()` di setiap migration bisa rollback dengan benar (reverse dari `up()`)
- [ ] Nama migration deskriptif: `20240101_create_users_table` bukan `migration_1`
- [ ] Setiap tabel **wajib** memiliki 6 kolom audit berikut (dalam Bahasa Indonesia):
  - `aktif` — TINYINT(1) NOT NULL DEFAULT 1 (0 = nonaktif, 1 = aktif)
  - `dibuat_pada` — DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP (kapan dibuat)
  - `dibuat_oleh` — INT UNSIGNED NULL (id user yang membuat)
  - `diubah_pada` — DATETIME NULL (kapan terakhir diubah)
  - `diubah_oleh` — INT UNSIGNED NULL (id user yang mengubah)
  - `dihapus_pada` — DATETIME NULL (kapan dihapus — untuk soft delete)
  - `dihapus_oleh` — INT UNSIGNED NULL (id user yang menghapus)
- [ ] Nama tabel dan kolom migration **wajib** menggunakan Bahasa Indonesia (kecuali `email`, `token`)
- [ ] Untuk id menggunakan format uuid di setiap tabel
- [ ] Primary key **wajib** diberi nama `id_namatabel` — bukan hanya `id` (contoh: `id_pengguna`, `id_perusahaan`, `id_langganan`)
- [ ] Foreign key yang mereferensikan PK tabel lain juga mengikuti nama PK tabel yang direferensikan (contoh: FK ke `perusahaan.id_perusahaan` harus bernama `id_perusahaan`)
- [ ] Soft delete menggunakan kolom `dihapus_pada` dan `dihapus_oleh` — bukan menghapus row

### Contoh Query Builder per DB

```typescript
// ── MySQL ──────────────────────────────────────────
// SELECT dengan pagination
const users = await knex('users')
  .select('id', 'name', 'email', 'role')
  .where({ is_active: 1 })
  .orderBy('created_at', 'desc')
  .limit(limit)
  .offset((page - 1) * limit);

// INSERT dan ambil data yang baru diinsert
const [insertId] = await knex('users').insert({ name, email, password_hash });
const newUser = await knex('users').where({ id: insertId }).first();

// UPDATE
await knex('users')
  .where({ id })
  .update({ name, updated_at: knex.fn.now() });

// SOFT DELETE
await knex('users')
  .where({ id })
  .update({ is_active: 0, deleted_at: knex.fn.now() });


// ── PostgreSQL ─────────────────────────────────────
// INSERT dengan returning (tidak ada di MySQL)
const [newUser] = await knex('users')
  .insert({ name, email, password_hash })
  .returning(['id', 'name', 'email', 'created_at']);

// UPDATE dengan returning
const [updated] = await knex('users')
  .where({ id })
  .update({ name, updated_at: knex.fn.now() })
  .returning(['id', 'name', 'email']);

// Boolean di PostgreSQL: true/false (bukan 1/0)
const users = await knex('users').where({ is_active: true });


// ── Oracle ─────────────────────────────────────────
// Oracle tidak support .returning() di Knex — ambil manual setelah insert
await knex('users').insert({ name, email, password_hash });
const newUser = await knex('users')
  .where({ email })
  .select('id', 'name', 'email')
  .first();

// Pagination Oracle (Knex handle otomatis FETCH FIRST ... ROWS ONLY)
const users = await knex('users')
  .select('id', 'name')
  .orderBy('created_at', 'desc')
  .limit(limit)
  .offset(offset);
// Knex generate: SELECT ... ORDER BY ... OFFSET ? ROWS FETCH NEXT ? ROWS ONLY


// ── Transaction (semua DB) ─────────────────────────
await knex.transaction(async (trx) => {
  // Semua query pakai trx, bukan knex langsung!
  const [orderId] = await trx('orders').insert({ user_id, total });
  await trx('order_items').insert(items.map(item => ({ order_id: orderId, ...item })));
  await trx('users').where({ id: user_id }).update({ last_order_at: trx.fn.now() });
  // otomatis COMMIT jika tidak ada error
  // otomatis ROLLBACK jika ada throw/error
});


// ── JOIN ───────────────────────────────────────────
const ordersWithUser = await knex('orders as o')
  .join('users as u', 'u.id', 'o.user_id')
  .leftJoin('order_items as oi', 'oi.order_id', 'o.id')
  .select(
    'o.id as order_id',
    'o.total',
    'o.created_at',
    'u.name as user_name',
    'u.email',
    knex.raw('COUNT(oi.id) as item_count')
  )
  .where('o.is_active', 1)
  .groupBy('o.id', 'o.total', 'o.created_at', 'u.name', 'u.email')
  .orderBy('o.created_at', 'desc');


// ── raw() dengan binding (AMAN) ────────────────────
// ❌ BERBAHAYA: string interpolation
const users = await knex.raw(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ AMAN: binding ? (MySQL/PG) atau :name (Oracle via knex.raw)
const users = await knex.raw(
  'SELECT id, name FROM users WHERE email = ? AND is_active = 1',
  [email]
);

// ✅ AMAN: ?? untuk nama kolom/tabel dinamis
const col = 'email';
const users = await knex.raw('SELECT ?? FROM users WHERE is_active = 1', [col]);
```

### Bug Patterns Knex

```typescript
// ❌ Bug: tidak cek undefined dari .first() → crash
const user = await knex('users').where({ id }).first();
console.log(user.name); // TypeError jika user tidak ditemukan!

// ✅ Fix: cek undefined dulu
const user = await knex('users').where({ id }).first();
if (!user) throw new NotFoundException(`User #${id} tidak ditemukan`);

// ❌ Bug: .returning() di MySQL → tidak ada hasilnya, selalu kosong
const [user] = await knex('users').insert({ name }).returning('*'); // MySQL tidak support!

// ✅ Fix MySQL: ambil manual dengan insertId
const [insertId] = await knex('users').insert({ name });
const user = await knex('users').where({ id: insertId }).first();

// ❌ Bug: campur knex dan trx dalam transaction → query di luar transaction!
await knex.transaction(async (trx) => {
  await trx('orders').insert({ total });
  await knex('order_items').insert({ ... }); // ← ini di luar transaction!
});

// ✅ Fix: semua query pakai trx
await knex.transaction(async (trx) => {
  await trx('orders').insert({ total });
  await trx('order_items').insert({ ... }); // ← ikut transaction
});

// ❌ Bug: N+1 query — query dalam loop
for (const order of orders) {
  const items = await knex('order_items').where({ order_id: order.id });
}

// ✅ Fix: satu query dengan whereIn
const orderIds = orders.map(o => o.id);
const items = await knex('order_items').whereIn('order_id', orderIds);
// Lalu group di JavaScript
const itemsByOrder = items.reduce((acc, item) => {
  acc[item.order_id] = [...(acc[item.order_id] || []), item];
  return acc;
}, {});
```

---

## Pola Query Aman (Parameterized)

### MySQL (Node.js mysql2)
```javascript
// ❌ SQL Injection vulnerable
const sql = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Parameterized query — pakai ? placeholder
const [rows] = await db.execute(
  `SELECT id, name, email FROM users WHERE email = ? AND is_active = 1`,
  [email]
);

// ✅ Knex (MySQL)
const user = await knex('users')
  .where({ email, is_active: 1 })
  .select('id', 'name', 'email')
  .first();
```

### Oracle (Node.js oracledb)
```javascript
// ❌ SQL Injection vulnerable
const sql = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Parameterized query
const result = await db.execute(
  `SELECT id, name, email FROM users WHERE email = :email AND is_active = 1`,
  { email: email }
);
```

### PostgreSQL (Node.js pg)
```javascript
// ❌ SQL Injection vulnerable
const sql = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Parameterized query
const result = await db.query(
  `SELECT id, name, email FROM users WHERE email = $1 AND is_active = true`,
  [email]
);
```

---

## Perbedaan Sintaks: Oracle vs PostgreSQL vs MySQL

| Fitur | Oracle | PostgreSQL | MySQL |
|-------|--------|------------|-------|
| Auto increment | `GENERATED AS IDENTITY` | `SERIAL` / `GENERATED ALWAYS` | `AUTO_INCREMENT` |
| Tanggal sekarang | `SYSDATE` | `NOW()` | `NOW()` / `CURRENT_TIMESTAMP` |
| Limit rows | `FETCH FIRST n ROWS ONLY` | `LIMIT n OFFSET m` | `LIMIT n OFFSET m` |
| Bind parameter | `:nama` | `$1, $2` | `?` |
| String concat | `\|\|` | `\|\|` | `CONCAT()` atau `\|\|` (MySQL 8+) |
| Boolean | `NUMBER(1)` | `BOOLEAN` | `TINYINT(1)` |
| Upsert | `MERGE INTO` | `ON CONFLICT DO UPDATE` | `ON DUPLICATE KEY UPDATE` |
| Pagination | `OFFSET x ROWS FETCH NEXT y` | `LIMIT y OFFSET x` | `LIMIT y OFFSET x` |
| Regex | `REGEXP_LIKE()` | `~` | `REGEXP` / `RLIKE` |
| JSON | `JSON_VALUE()` (21c+) | `->`, `->>` | `JSON_EXTRACT()`, `->` |

---

## Test Patterns untuk SQL

### MySQL — Test dengan Jest + mysql2
```javascript
// setup test database terpisah
const mysql = require('mysql2/promise');

let db;

beforeAll(async () => {
  db = await mysql.createConnection({
    host: process.env.TEST_DB_HOST,
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME, // pakai DB khusus test!
  });
  await db.execute('SET FOREIGN_KEY_CHECKS = 0');
  await db.execute('TRUNCATE TABLE users');
  await db.execute('SET FOREIGN_KEY_CHECKS = 1');
});

afterAll(() => db.end());

test('insert user baru', async () => {
  const [result] = await db.execute(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    ['Test User', 'test@test.com', 'hash123']
  );
  expect(result.insertId).toBeGreaterThan(0);

  const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
  expect(rows[0].email).toBe('test@test.com');
});

test('NOT NULL constraint harus error', async () => {
  await expect(
    db.execute('INSERT INTO users (name, email) VALUES (NULL, ?)', ['test2@test.com'])
  ).rejects.toThrow();
});
```

```sql
-- ============================================
-- TEST: Insert user baru
-- ============================================
-- Setup
DELETE FROM users WHERE email = 'test_unit@test.com';

-- Execute
INSERT INTO users (name, email, password_hash)
VALUES ('Test User', 'test_unit@test.com', 'hash123');

-- Assert
SELECT COUNT(*) as cnt FROM users WHERE email = 'test_unit@test.com';
-- Expected: cnt = 1

-- ============================================
-- TEST: Update tidak mempengaruhi baris lain
-- ============================================
-- Setup: catat jumlah baris sebelum
SELECT COUNT(*) as before_cnt FROM users;

-- Execute
UPDATE users SET is_active = 0 WHERE id = 99999; -- ID yang tidak ada

-- Assert: jumlah baris tidak berubah
SELECT COUNT(*) as after_cnt FROM users;
-- Expected: before_cnt = after_cnt

-- ============================================
-- TEST: Constraint NOT NULL
-- ============================================
-- Ini harus GAGAL (raise error)
BEGIN
  INSERT INTO users (name, email) VALUES (NULL, 'test@test.com');
  DBMS_OUTPUT.PUT_LINE('ERROR: Seharusnya gagal!');
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('OK: NOT NULL constraint bekerja');
END;
```

### Oracle/PostgreSQL — Test dengan SQL Script
```sql
-- ============================================
-- TEST: Insert user baru
-- ============================================
DELETE FROM users WHERE email = 'test_unit@test.com';

INSERT INTO users (name, email, password_hash)
VALUES ('Test User', 'test_unit@test.com', 'hash123');

SELECT COUNT(*) as cnt FROM users WHERE email = 'test_unit@test.com';
-- Expected: cnt = 1

-- ============================================
-- TEST: Update tidak mempengaruhi baris lain
-- ============================================
SELECT COUNT(*) as before_cnt FROM users;
UPDATE users SET is_active = 0 WHERE id = 99999;
SELECT COUNT(*) as after_cnt FROM users;
-- Expected: before_cnt = after_cnt

-- ============================================
-- TEST: Constraint NOT NULL (Oracle)
-- ============================================
BEGIN
  INSERT INTO users (name, email) VALUES (NULL, 'test@test.com');
  DBMS_OUTPUT.PUT_LINE('ERROR: Seharusnya gagal!');
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('OK: NOT NULL constraint bekerja');
END;
```

---

## Security Checklist SQL

### MySQL
- [ ] Selalu gunakan parameterized query dengan `?` placeholder — jangan string concat
- [ ] User DB punya privilege minimum: hanya `SELECT, INSERT, UPDATE, DELETE` untuk app user
- [ ] Tidak ada user dengan `ALL PRIVILEGES` untuk koneksi dari aplikasi
- [ ] `GRANT` spesifik per tabel/database, bukan `GRANT ALL ON *.*`
- [ ] SSL/TLS diaktifkan untuk koneksi production (`require_secure_transport = ON`)
- [ ] `general_log` dimatikan di production (log semua query → ekspos data sensitif)
- [ ] Password kolom tidak disimpan plaintext — gunakan bcrypt/argon2 di aplikasi
- [ ] Firewall: port MySQL (3306) tidak terbuka ke publik
- [ ] `mysql_native_password` plugin tidak dipakai — gunakan `caching_sha2_password` (MySQL 8+)
- [ ] Backup dienkripsi dan disimpan di lokasi terpisah dari server DB

### Oracle
- [ ] Tidak ada dynamic SQL dengan `EXECUTE IMMEDIATE` + input user langsung
- [ ] User DB punya privilege minimum (bukan DBA untuk operasi biasa)
- [ ] Audit trail diaktifkan untuk tabel sensitif
- [ ] Password di kolom tidak disimpan plaintext
- [ ] Backup enkripsi diaktifkan

### PostgreSQL
- [ ] Row Level Security (RLS) dipertimbangkan untuk multi-tenant
- [ ] User DB hanya punya GRANT yang diperlukan (bukan superuser)
- [ ] `pg_audit` extension diaktifkan untuk audit
- [ ] SSL connection diaktifkan (`ssl = on` di postgresql.conf)

### Umum (semua DB)
- [ ] Selalu gunakan parameterized query / bind variable
- [ ] Tidak ada kredensial DB di source code — pakai environment variable
- [ ] Query log tidak mengekspos data sensitif
- [ ] Stored procedure/function punya AUTHID yang tepat
- [ ] Koneksi DB dari aplikasi pakai user khusus app, bukan root/admin
