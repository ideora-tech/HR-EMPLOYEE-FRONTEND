# Module Access & Role Menu — HR & Payroll SaaS

> File ini adalah **single source of truth** untuk:
> 1. Modul apa yang bisa diakses per paket tenant (feature gating)
> 2. Menu/aksi apa yang bisa dilakukan per role dalam modul tersebut
>
> Gunakan file ini sebagai acuan saat membuat:
> - Guard / middleware feature gating di backend (NestJS)
> - Kondisi render menu di frontend (Next.js)
> - Filter menu di mobile (Flutter)
> - Permission seeder di database (MySQL)

---

## 1. Daftar Modul

| Kode Modul | Nama | Deskripsi |
|------------|------|-----------|
| `DASHBOARD` | Dashboard | Overview analytics & summary |
| `EMPLOYEES` | Manajemen Karyawan | CRUD karyawan, jabatan, departemen |
| `PAYROLL` | Penggajian | Proses payroll, slip gaji, komponen gaji |
| `ATTENDANCE` | Kehadiran | Clock in/out, rekap kehadiran |
| `LEAVE` | Cuti & Izin | Request cuti, izin, sakit + approval |
| `COMPLIANCE` | Kepatuhan | PPh 21, BPJS TK, BPJS Kes |
| `REPORTS` | Laporan | Export Excel/PDF, laporan keuangan |
| `SETTINGS` | Pengaturan | Pengaturan perusahaan, jabatan, departemen |
| `BILLING` | Langganan | Kelola paket, invoice, limit karyawan |

---

## 2. Akses Modul per Paket Tenant (Feature Gating)

> `✅` = Akses penuh | `⚡` = Terbatas | `❌` = Tidak bisa akses

| Modul | Free (≤10 org) | Starter (≤50 org) | Professional (≤200 org) | Enterprise (unlimited) |
|-------|:--------------:|:-----------------:|:-----------------------:|:---------------------:|
| `DASHBOARD` | ⚡ Basic | ✅ Full | ✅ Full | ✅ Full + Custom |
| `EMPLOYEES` | ⚡ Max 10 | ⚡ Max 50 | ⚡ Max 200 | ✅ Unlimited |
| `PAYROLL` | ⚡ Basic | ✅ Full | ✅ Full | ✅ Full + Multi-schedule |
| `ATTENDANCE` | ❌ | ✅ | ✅ | ✅ + GPS + Biometric |
| `LEAVE` | ❌ | ❌ | ✅ | ✅ |
| `COMPLIANCE` | ❌ | ❌ | ✅ PPh21 + BPJS | ✅ + e-SPT Export |
| `REPORTS` | ⚡ 3 bulan terakhir | ✅ Full | ✅ Full | ✅ Full + Custom Report |
| `SETTINGS` | ⚡ Basic | ✅ | ✅ | ✅ + Custom Fields |
| `BILLING` | ✅ | ✅ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ❌ | ✅ |

### Detail Batasan per Tier

#### Free
- Maks 10 karyawan aktif
- Payroll: hanya gaji pokok + 1 tunjangan tetap
- Riwayat payroll: 3 bulan terakhir saja
- Dashboard: summary headcount & total payroll bulan ini saja
- Tidak ada modul: ATTENDANCE, LEAVE, COMPLIANCE

#### Starter
- Maks 50 karyawan aktif
- Payroll lengkap: gaji pokok + tunjangan tidak terbatas + potongan
- Riwayat payroll: tidak terbatas
- Attendance: clock in/out web-based
- Tidak ada modul: LEAVE, COMPLIANCE

#### Professional
- Maks 200 karyawan aktif
- Semua fitur Starter +
- Leave management dengan approval workflow
- PPh 21 otomatis berdasarkan PTKP & tarif progresif
- BPJS TK (JKK, JKM, JHT, JP) & BPJS Kes

#### Enterprise
- Karyawan tidak terbatas
- Semua fitur Professional +
- Custom fields untuk data karyawan
- REST API access
- Multiple payroll schedule (mingguan, dua mingguan, bulanan)
- Export e-SPT untuk pelaporan pajak
- Dedicated support & onboarding

---

## 3. Daftar Role

| Kode Role | Nama | Deskripsi |
|-----------|------|-----------|
| `OWNER` | Pemilik Perusahaan | Full visibility, approve level tertinggi |
| `HR_ADMIN` | HR Manager / Admin | Kelola SDM & proses payroll harian |
| `FINANCE` | Finance / Accounting | Akses laporan keuangan & compliance |
| `EMPLOYEE` | Karyawan | Self-service: slip gaji, cuti, absensi |

---

## 4. Menu & Aksi per Role

### 4.1 Modul DASHBOARD

| Menu / Aksi | OWNER | HR_ADMIN | FINANCE | EMPLOYEE |
|-------------|:-----:|:--------:|:-------:|:--------:|
| Summary headcount total | ✅ | ✅ | ✅ | ❌ |
| Total payroll bulan ini | ✅ | ✅ | ✅ | ❌ |
| Grafik tren payroll | ✅ | ✅ | ✅ | ❌ |
| Rekap kehadiran hari ini | ✅ | ✅ | ❌ | ❌ |
| Pending approval cuti/izin | ✅ | ✅ | ❌ | ✅ (milik sendiri) |
| Slip gaji terbaru | ❌ | ❌ | ❌ | ✅ (milik sendiri) |
| Karyawan berulang tahun bulan ini | ✅ | ✅ | ❌ | ❌ |
| Masa kontrak akan habis | ✅ | ✅ | ❌ | ❌ |
| Notifikasi sistem | ✅ | ✅ | ✅ | ✅ |

---

### 4.2 Modul EMPLOYEES

| Menu / Aksi | OWNER | HR_ADMIN | FINANCE | EMPLOYEE |
|-------------|:-----:|:--------:|:-------:|:--------:|
| Lihat daftar semua karyawan | ✅ | ✅ | ✅ (view only) | ❌ |
| Lihat profil karyawan lain | ✅ | ✅ | ❌ | ❌ |
| Lihat & edit profil sendiri | ✅ | ✅ | ✅ | ✅ |
| Tambah karyawan baru | ❌ | ✅ | ❌ | ❌ |
| Edit data karyawan | ❌ | ✅ | ❌ | ❌ |
| Nonaktifkan karyawan (request) | ❌ | ✅ | ❌ | ❌ |
| Nonaktifkan karyawan (approve) | ✅ | ❌ | ❌ | ❌ |
| Upload dokumen karyawan | ❌ | ✅ | ❌ | ❌ |
| Lihat dokumen karyawan | ✅ | ✅ | ❌ | ✅ (milik sendiri) |
| Kelola jabatan (position) | ❌ | ✅ | ❌ | ❌ |
| Kelola departemen | ❌ | ✅ | ❌ | ❌ |
| Export daftar karyawan (Excel/PDF) | ✅ | ✅ | ✅ | ❌ |

---

### 4.3 Modul PAYROLL

| Menu / Aksi | OWNER | HR_ADMIN | FINANCE | EMPLOYEE |
|-------------|:-----:|:--------:|:-------:|:--------:|
| Setup komponen gaji (template) | ❌ | ✅ | ❌ | ❌ |
| Input gaji pokok karyawan | ❌ | ✅ | ❌ | ❌ |
| Input tunjangan & potongan | ❌ | ✅ | ❌ | ❌ |
| Proses payroll bulanan | ❌ | ✅ | ❌ | ❌ |
| Review payroll sebelum finalisasi | ✅ | ✅ | ✅ | ❌ |
| Approve & finalisasi payroll | ✅ | ❌ | ❌ | ❌ |
| Batalkan/revisi payroll yang sudah difinalisasi | ✅ | ❌ | ❌ | ❌ |
| Lihat slip gaji semua karyawan | ✅ | ✅ | ✅ | ❌ |
| Lihat slip gaji sendiri | ✅ | ✅ | ✅ | ✅ |
| Download slip gaji PDF (sendiri) | ✅ | ✅ | ✅ | ✅ |
| Download slip gaji PDF (semua) | ✅ | ✅ | ✅ | ❌ |
| Export file transfer bank | ❌ | ✅ | ✅ | ❌ |
| Riwayat payroll (semua) | ✅ | ✅ | ✅ | ❌ |
| Riwayat payroll (sendiri) | ✅ | ✅ | ✅ | ✅ |
| Proses THR (input & hitung) | ❌ | ✅ | ❌ | ❌ |
| Approve THR | ✅ | ❌ | ❌ | ❌ |

---

### 4.4 Modul ATTENDANCE

| Menu / Aksi | OWNER | HR_ADMIN | FINANCE | EMPLOYEE |
|-------------|:-----:|:--------:|:-------:|:--------:|
| Clock in | ❌ | ✅ | ✅ | ✅ |
| Clock out | ❌ | ✅ | ✅ | ✅ |
| Lihat kehadiran sendiri | ✅ | ✅ | ✅ | ✅ |
| Lihat kehadiran semua karyawan | ✅ | ✅ | ❌ | ❌ |
| Request koreksi absensi | ❌ | ✅ | ✅ | ✅ |
| Approve koreksi absensi | ✅ | ✅ | ❌ | ❌ |
| Setup shift kerja | ❌ | ✅ | ❌ | ❌ |
| Assign shift ke karyawan | ❌ | ✅ | ❌ | ❌ |
| Setup hari libur nasional | ❌ | ✅ | ❌ | ❌ |
| Rekap kehadiran bulanan (sendiri) | ✅ | ✅ | ✅ | ✅ |
| Rekap kehadiran bulanan (semua) | ✅ | ✅ | ❌ | ❌ |
| Export rekap kehadiran | ✅ | ✅ | ❌ | ❌ |

---

### 4.5 Modul LEAVE

| Menu / Aksi | OWNER | HR_ADMIN | FINANCE | EMPLOYEE |
|-------------|:-----:|:--------:|:-------:|:--------:|
| Request cuti tahunan | ✅ | ✅ | ✅ | ✅ |
| Request izin | ✅ | ✅ | ✅ | ✅ |
| Request sakit (+ upload surat) | ✅ | ✅ | ✅ | ✅ |
| Lihat status pengajuan sendiri | ✅ | ✅ | ✅ | ✅ |
| Lihat sisa jatah cuti sendiri | ✅ | ✅ | ✅ | ✅ |
| Approve / tolak pengajuan cuti | ✅ | ✅ | ❌ | ❌ |
| Lihat semua pengajuan cuti | ✅ | ✅ | ❌ | ❌ |
| Lihat sisa cuti semua karyawan | ✅ | ✅ | ❌ | ❌ |
| Setup jenis cuti & kuota per tahun | ❌ | ✅ | ❌ | ❌ |
| Setup kebijakan cuti (carry over, dll) | ❌ | ✅ | ❌ | ❌ |
| Rekap cuti bulanan / tahunan | ✅ | ✅ | ❌ | ❌ |
| Export rekap cuti | ✅ | ✅ | ❌ | ❌ |

---

### 4.6 Modul COMPLIANCE

| Menu / Aksi | OWNER | HR_ADMIN | FINANCE | EMPLOYEE |
|-------------|:-----:|:--------:|:-------:|:--------:|
| Lihat detail PPh 21 sendiri | ✅ | ✅ | ✅ | ✅ |
| Lihat detail PPh 21 semua karyawan | ✅ | ✅ | ✅ | ❌ |
| Setup PTKP per karyawan | ❌ | ✅ | ❌ | ❌ |
| Lihat detail BPJS TK sendiri | ✅ | ✅ | ✅ | ✅ |
| Lihat detail BPJS TK semua karyawan | ✅ | ✅ | ✅ | ❌ |
| Lihat detail BPJS Kes sendiri | ✅ | ✅ | ✅ | ✅ |
| Lihat detail BPJS Kes semua karyawan | ✅ | ✅ | ✅ | ❌ |
| Setup tarif BPJS perusahaan | ❌ | ✅ | ❌ | ❌ |
| Generate laporan BPJS bulanan | ❌ | ✅ | ✅ | ❌ |
| Generate laporan PPh 21 (1721-A1) | ❌ | ✅ | ✅ | ❌ |
| Export e-SPT *(Enterprise only)* | ❌ | ✅ | ✅ | ❌ |

---

### 4.7 Modul REPORTS

| Menu / Aksi | OWNER | HR_ADMIN | FINANCE | EMPLOYEE |
|-------------|:-----:|:--------:|:-------:|:--------:|
| Laporan payroll bulanan | ✅ | ✅ | ✅ | ❌ |
| Laporan rekapitulasi kehadiran | ✅ | ✅ | ❌ | ❌ |
| Laporan rekapitulasi cuti & izin | ✅ | ✅ | ❌ | ❌ |
| Laporan PPh 21 | ✅ | ✅ | ✅ | ❌ |
| Laporan iuran BPJS | ✅ | ✅ | ✅ | ❌ |
| Laporan turnover karyawan | ✅ | ✅ | ❌ | ❌ |
| Export laporan ke Excel | ✅ | ✅ | ✅ | ❌ |
| Export laporan ke PDF | ✅ | ✅ | ✅ | ✅ (slip gaji sendiri) |
| Export file transfer bank | ❌ | ✅ | ✅ | ❌ |

---

### 4.8 Modul SETTINGS

| Menu / Aksi | OWNER | HR_ADMIN | FINANCE | EMPLOYEE |
|-------------|:-----:|:--------:|:-------:|:--------:|
| Edit info & logo perusahaan | ✅ | ✅ | ❌ | ❌ |
| Undang user baru | ✅ | ✅ | ❌ | ❌ |
| Assign / ubah role user | ✅ | ❌ | ❌ | ❌ |
| Nonaktifkan akun user | ✅ | ❌ | ❌ | ❌ |
| Setup departemen | ❌ | ✅ | ❌ | ❌ |
| Setup jabatan & grade | ❌ | ✅ | ❌ | ❌ |
| Setup template komponen gaji | ❌ | ✅ | ❌ | ❌ |
| Setup hari libur nasional | ❌ | ✅ | ❌ | ❌ |
| Setup kebijakan cuti global | ❌ | ✅ | ❌ | ❌ |
| Custom fields karyawan *(Enterprise)* | ✅ | ❌ | ❌ | ❌ |
| Ganti password akun sendiri | ✅ | ✅ | ✅ | ✅ |
| Preferensi notifikasi | ✅ | ✅ | ✅ | ✅ |

---

### 4.9 Modul BILLING

| Menu / Aksi | OWNER | HR_ADMIN | FINANCE | EMPLOYEE |
|-------------|:-----:|:--------:|:-------:|:--------:|
| Lihat paket aktif & usage | ✅ | ❌ | ✅ | ❌ |
| Upgrade / downgrade paket | ✅ | ❌ | ❌ | ❌ |
| Lihat invoice & riwayat pembayaran | ✅ | ❌ | ✅ | ❌ |
| Download invoice PDF | ✅ | ❌ | ✅ | ❌ |
| Update metode pembayaran | ✅ | ❌ | ❌ | ❌ |
| Lihat sisa kapasitas karyawan | ✅ | ✅ | ❌ | ❌ |

---

## 5. Implementasi Backend (NestJS)

### Struktur Tabel Permission di MySQL

> **Catatan Arsitektur:** Role tidak menggunakan ENUM agar mudah ditambah tanpa ALTER TABLE.
> Tambah role baru cukup `INSERT` ke tabel `peran` dan `izin_peran` — tanpa ubah skema atau kode.

```sql
-- Master data role (tidak pakai ENUM — mudah ditambah tanpa ALTER TABLE)
CREATE TABLE peran (
  id_peran    CHAR(36) PRIMARY KEY,
  kode_peran  VARCHAR(50) NOT NULL UNIQUE,  -- 'OWNER', 'HR_ADMIN', dll
  nama        VARCHAR(100) NOT NULL,
  aktif       TINYINT(1) DEFAULT 1
  -- + kolom audit
);

-- Master data paket (tidak pakai ENUM — mudah ditambah tanpa ALTER TABLE)
CREATE TABLE paket_langganan (
  id_paket      CHAR(36) PRIMARY KEY,
  kode_paket    VARCHAR(50) NOT NULL UNIQUE,  -- 'FREE', 'STARTER', dll
  nama          VARCHAR(100) NOT NULL,
  maks_karyawan INT NOT NULL,                 -- batas default per paket
  aktif         TINYINT(1) DEFAULT 1
  -- + kolom audit
);

-- Tier subscription perusahaan
CREATE TABLE langganan (
  id_langganan  CHAR(36) PRIMARY KEY,
  id_perusahaan CHAR(36) NOT NULL,
  paket         VARCHAR(50) NOT NULL,         -- FK ke paket_langganan.kode_paket
  maks_karyawan INT NOT NULL,                 -- bisa di-override per perusahaan
  aktif         TINYINT(1) DEFAULT 1,
  FOREIGN KEY (paket) REFERENCES paket_langganan(kode_paket)
  -- + kolom audit
);

-- Kontrol akses modul per tier
CREATE TABLE akses_modul_tier (
  id_akses_modul CHAR(36) PRIMARY KEY,
  kode_modul     VARCHAR(50) NOT NULL,
  paket          VARCHAR(50) NOT NULL,         -- FK ke paket_langganan.kode_paket
  diaktifkan     TINYINT(1) DEFAULT 1,
  batasan        JSON NULL,                    -- {"maks_karyawan": 10, "bulan_riwayat": 3}
  FOREIGN KEY (paket) REFERENCES paket_langganan(kode_paket)
  -- + kolom audit
);

-- Kontrol aksi per role dalam modul
-- role pakai VARCHAR + FK ke peran.kode_peran (bukan ENUM)
CREATE TABLE izin_peran (
  id_izin    CHAR(36) PRIMARY KEY,
  peran      VARCHAR(50) NOT NULL,      -- FK ke peran.kode_peran
  kode_modul VARCHAR(50) NOT NULL,
  aksi       VARCHAR(50) NOT NULL,      -- 'READ', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT'
  diizinkan  TINYINT(1) DEFAULT 1,
  FOREIGN KEY (peran) REFERENCES peran(kode_peran),
  UNIQUE (peran, kode_modul, aksi)
  -- + kolom audit
);
```

### Cara Tambah Role Baru
```sql
-- Contoh: tambah role MANAGER tanpa ALTER TABLE apapun
INSERT INTO peran (id_peran, kode_peran, nama) VALUES (UUID(), 'MANAGER', 'Manager');

-- Definisikan izin untuk role baru
INSERT INTO izin_peran (id_izin, peran, kode_modul, aksi, diizinkan)
VALUES
  (UUID(), 'MANAGER', 'EMPLOYEES', 'READ',   1),
  (UUID(), 'MANAGER', 'ATTENDANCE','READ',   1),
  (UUID(), 'MANAGER', 'LEAVE',     'APPROVE',1);
-- Selesai — tidak perlu restart aplikasi, tidak perlu ubah kode
```

### Guard Pattern (urutan wajib: JWT → Tier → Role)
```typescript
// TierGuard cek dulu apakah paket mendukung modul ini
@UseGuards(JwtAuthGuard, TierGuard('ATTENDANCE'), RolesGuard)
@Roles('HR_ADMIN', 'OWNER')
@Get('attendance')
findAll() { ... }
```

### Alur TierGuard
```
Request masuk
  → Ambil company_id dari JWT payload
  → Cek tier aktif di tabel subscriptions
  → Lookup modul di module_tier_access WHERE module_code = ? AND tier = ?
  → Jika is_enabled = 0 → throw ForbiddenException('Upgrade paket untuk akses fitur ini')
  → Jika OK → lanjut ke RolesGuard
```

---

## 6. Implementasi Frontend (Next.js)

### File Konstanta yang Harus Dibuat
```
src/constants/
├── modules.constant.ts        ← enum/object kode modul
├── tier-access.constant.ts    ← mapping tier → modul yang diaktifkan
└── role-permission.constant.ts ← mapping role → aksi per modul
```

### Render Menu Kondisional
```typescript
// Hanya tampilkan menu jika tier & role mengizinkan
const sidebarMenus = ALL_MENUS.filter(menu =>
  hasModuleAccess(company.tier, menu.module) &&
  hasRolePermission(user.role, menu.module, 'READ')
)
```

---

## 7. Implementasi Mobile (Flutter)

### Filter Menu Dinamis
```dart
// Di controller, filter menu berdasarkan role & tier dari response API
List<MenuModel> get accessibleMenus => AppMenus.all
  .where((m) => tierService.hasAccess(m.module))
  .where((m) => roleService.canRead(user.role, m.module))
  .toList();
```

---

**Document Version:** 1.2
**Last Updated:** 2026-03-18
**Owner:** @ideora-tech

### Changelog
- **v1.1** — Role tidak lagi menggunakan ENUM. Dipisah ke tabel master `peran` (VARCHAR + FK) agar bisa tambah role baru tanpa ALTER TABLE.
- **v1.2** — Paket langganan tidak lagi menggunakan ENUM. Dipisah ke tabel master `paket_langganan` (VARCHAR + FK) agar bisa tambah tier baru tanpa ALTER TABLE.
