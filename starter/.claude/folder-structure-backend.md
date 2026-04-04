# Folder Structure — NestJS Backend

Gunakan file ini sebagai acuan standar struktur folder project NestJS.
Claude wajib membandingkan kode yang direview dengan pola di sini dan
melaporkan deviasi sebagai temuan di modul Code Quality Review.

> **Arsitektur**: Controller → Service → Repository → Knex (DB)
> Setiap module wajib memiliki: `dto/`, `interfaces/`, controller, service, repository.
untuk setiap file tidak boleh lebih dari 1000 line

---

## ⚠️ Konvensi Penamaan Kolom DB

Kolom `kode` dan `nama` di setiap tabel **menggunakan prefix nama tabel** agar tidak ambigu saat JOIN multi-tabel:

| Tabel | Kolom lama (❌) | Kolom baru (✅) |
|---|---|---|
| `peran` | `nama` | `nama_peran` |
| `paket_langganan` | `nama` | `nama_paket` |
| `modul` | `nama` | `nama_modul` |
| `menu` | `nama` | `nama_menu` |
| `departemen` | `kode`, `nama` | `kode_departemen`, `nama_departemen` |
| `jabatan` | `kode`, `nama` | `kode_jabatan`, `nama_jabatan` |
| `lokasi_kantor` | `kode`, `nama`, `alamat` | `kode_lokasi`, `nama_lokasi`, `alamat_lokasi` |
| `zona_waktu` | `kode`, `nama` | `kode_zona`, `nama_zona` |
| `mata_uang` | `kode`, `nama` | `kode_mata_uang`, `nama_mata_uang` |

**Wajib diikuti di semua layer**: interface, repository (select/insert/where), service, dan DTO.
---

## Struktur Lengkap (Feature-based Modular)

```
{project-name}/
├── src/
│   ├── main.ts                                  ← Entry point, bootstrap app
│   ├── app.module.ts                            ← Root module
│   ├── app.controller.ts                        ← Health check endpoint
│   │
│   ├── config/                                  ← Konfigurasi global
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   │
│   ├── common/                                  ← Shared across semua module
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts               ← @Roles('admin', 'user')
│   │   │   └── current-user.decorator.ts        ← @CurrentUser()
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts         ← Global exception handler
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts          ← Format response standar
│   │   │   └── logging.interceptor.ts
│   │   ├── interfaces/                          ← Interface shared/global
│   │   │   ├── pagination.interface.ts          ← PaginatedResult<T>
│   │   │   ├── response.interface.ts            ← StandardResponse<T>
│   │   │   └── jwt-payload.interface.ts         ← JwtPayload
│   │   ├── middlewares/
│   │   │   └── logger.middleware.ts
│   │   ├── pipes/
│   │   │   └── parse-int.pipe.ts
│   │   └── utils/
│   │       ├── hash.util.ts
│   │       ├── date.util.ts
│   │       └── pagination.util.ts
│   │
│   ├── database/                                ← Database setup & migration
│   │   ├── database.module.ts                   ← Knex module (Global)
│   │   ├── migrations/
│   │   │   ├── 20240101_create_users_table.ts
│   │   │   ├── 20240102_create_roles_table.ts
│   │   │   └── 20240103_create_refresh_tokens_table.ts
│   │   └── seeds/
│   │       ├── 01_roles.seed.ts
│   │       └── 02_users.seed.ts
│   │
│   ├── modules/                                 ← Feature modules
│   │   │
│   │   ├── auth/                                ── MODULE: Authentication
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts               ← Terima request, panggil service
│   │   │   ├── auth.service.ts                  ← Business logic, panggil repository
│   │   │   ├── auth.repository.ts               ← Query Knex untuk auth
│   │   │   ├── interfaces/
│   │   │   │   ├── auth-payload.interface.ts    ← IAuthPayload, IAuthTokens
│   │   │   │   └── auth-repository.interface.ts ← IAuthRepository (contract)
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       └── refresh-token.dto.ts
│   │   │
│   │   ├── users/                               ── MODULE: User Management
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts              ← GET/PUT/DELETE /users
│   │   │   ├── users.service.ts                 ← Business logic
│   │   │   ├── users.repository.ts              ← Query Knex untuk users
│   │   │   ├── interfaces/
│   │   │   │   ├── user.interface.ts            ← IUser, IUserPublic
│   │   │   │   ├── create-user.interface.ts     ← ICreateUser, IUpdateUser
│   │   │   │   └── user-repository.interface.ts ← IUsersRepository (contract)
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       ├── update-user.dto.ts
│   │   │       └── user-response.dto.ts
│   │   │
│   │   ├── peran/                               ── MODULE: Peran (Role)
│   │   │   ├── peran.module.ts
│   │   │   ├── peran.controller.ts              ← GET/POST/PATCH/DELETE /peran
│   │   │   ├── peran.service.ts
│   │   │   ├── peran.repository.ts
│   │   │   ├── interfaces/
│   │   │   └── dto/
│   │   │
│   │   ├── izin-peran/                          ── MODULE: Izin Peran (Permission)
│   │   │   ├── izin-peran.module.ts
│   │   │   ├── izin-peran.controller.ts         ← CRUD izin + bulk assign per peran
│   │   │   ├── izin-peran.service.ts
│   │   │   ├── izin-peran.repository.ts
│   │   │   ├── interfaces/
│   │   │   └── dto/
│   │   │
│   │   ├── menu/                                ── MODULE: Menu
│   │   │   ├── menu.module.ts
│   │   │   ├── menu.controller.ts               ← GET /menu, GET /menu/me (tree)
│   │   │   ├── menu.service.ts                  ← buildTree, company override logic
│   │   │   ├── menu.repository.ts
│   │   │   ├── interfaces/
│   │   │   └── dto/
│   │   │
│   │   ├── modul/                               ── MODULE: Modul
│   │   │   ├── modul.module.ts
│   │   │   ├── modul.controller.ts              ← CRUD + assign menu ke modul
│   │   │   ├── modul.service.ts
│   │   │   ├── modul.repository.ts
│   │   │   ├── interfaces/
│   │   │   └── dto/
│   │   │
│   │   ├── akses-modul-tier/                    ── MODULE: Akses Modul per Paket
│   │   │   ├── akses-modul-tier.module.ts
│   │   │   ├── akses-modul-tier.controller.ts   ← CRUD akses modul per paket
│   │   │   ├── akses-modul-tier.service.ts
│   │   │   ├── akses-modul-tier.repository.ts
│   │   │   ├── interfaces/
│   │   │   └── dto/
│   │   │
│   │   ├── paket/                               ── MODULE: Paket Langganan
│   │   │   ├── paket.module.ts
│   │   │   ├── paket.controller.ts
│   │   │   ├── paket.service.ts
│   │   │   ├── paket.repository.ts
│   │   │   ├── interfaces/
│   │   │   └── dto/
│   │   │
│   │   ├── perusahaan/                          ── MODULE: Perusahaan (Company)
│   │   │   ├── perusahaan.module.ts
│   │   │   ├── perusahaan.controller.ts         ← CRUD perusahaan + overview stats
│   │   │   ├── perusahaan.service.ts
│   │   │   ├── perusahaan.repository.ts
│   │   │   ├── interfaces/
│   │   │   └── dto/
│   │   │
│   │   ├── pengguna/                            ── MODULE: Pengguna (User)
│   │   │   ├── pengguna.module.ts               ← exports PenggunaService + PenggunaRepository
│   │   │   ├── pengguna.controller.ts           ← CRUD user dalam perusahaan
│   │   │   ├── pengguna.service.ts              ← auto-clear harus_ganti_password saat password diubah
│   │   │   ├── pengguna.repository.ts           ← COLS includes id_karyawan, harus_ganti_password
│   │   │   ├── interfaces/
│   │   │   │   ├── user.interface.ts            ← IUser, IUserPublic — include id_karyawan, harus_ganti_password
│   │   │   │   └── user-repository.interface.ts ← ICreateUser (harus_ganti_password?), IUpdateUser
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts           ← id_karyawan opsional
│   │   │       ├── update-user.dto.ts           ← id_karyawan opsional, set null = unlink
│   │   │       └── user-response.dto.ts         ← include id_karyawan, harus_ganti_password
│   │   │
│   │   ├── karyawan/                            ── MODULE: Karyawan (Employee)
│   │   │   ├── karyawan.module.ts               ← imports PenggunaModule (untuk auto-create akun)
│   │   │   ├── karyawan.controller.ts           ← CRUD + download template + upload Excel + foto upload
│   │   │   ├── karyawan.service.ts              ← POST /karyawan → auto-buat pengguna EMPLOYEE + harus_ganti_password=1
│   │   │   ├── karyawan.repository.ts           ← findNiksByPerusahaan, batchInsert
│   │   │   ├── interfaces/
│   │   │   │   ├── karyawan.interface.ts        ← IKaryawan, IKaryawanPublic
│   │   │   │   └── karyawan-repository.interface.ts ← ICreateKaryawan, IKaryawanQuery
│   │   │   └── dto/
│   │   │       ├── create-karyawan.dto.ts
│   │   │       ├── update-karyawan.dto.ts
│   │   │       └── karyawan-response.dto.ts
│   │   │
│   │   ├── departemen/                          ── MODULE: Departemen (master data HR)
│   │   │   ├── departemen.module.ts
│   │   │   ├── departemen.controller.ts         ← CRUD /organisasi/departemen, 409 on kode duplikat
│   │   │   ├── departemen.service.ts
│   │   │   ├── departemen.repository.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── departemen.interface.ts      ← IDepartemenPublic
│   │   │   │   └── departemen-repository.interface.ts
│   │   │   └── dto/
│   │   │       ├── create-departemen.dto.ts     ← kode_departemen (unique), nama_departemen, deskripsi?
│   │   │       └── update-departemen.dto.ts
│   │   │
│   │   ├── jabatan/                             ── MODULE: Jabatan (master data HR)
│   │   │   ├── jabatan.module.ts
│   │   │   ├── jabatan.controller.ts            ← CRUD + GET /departemen/:id_departemen
│   │   │   ├── jabatan.service.ts
│   │   │   ├── jabatan.repository.ts            ← JSON_OBJECT for nested departemen + peran response
│   │   │   ├── interfaces/
│   │   │   │   ├── jabatan.interface.ts         ← IJabatanPublic (incl. nested departemen & peran obj)
│   │   │   │   └── jabatan-repository.interface.ts
│   │   │   └── dto/
│   │   │       ├── create-jabatan.dto.ts        ← id_departemen?, kode_jabatan, nama_jabatan, level?, deskripsi?
│   │   │       └── update-jabatan.dto.ts
│   │   │
│   │   ├── lokasi-kantor/                       ── MODULE: Lokasi Kantor (master data HR)
│   │   │   ├── lokasi-kantor.module.ts
│   │   │   ├── lokasi-kantor.controller.ts      ← CRUD /organisasi/lokasi-kantor
│   │   │   ├── lokasi-kantor.service.ts
│   │   │   ├── lokasi-kantor.repository.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── lokasi-kantor.interface.ts   ← ILokasiKantorPublic
│   │   │   │   └── lokasi-kantor-repository.interface.ts
│   │   │   └── dto/
│   │   │       ├── create-lokasi-kantor.dto.ts  ← kode_lokasi, nama_lokasi, alamat_lokasi?, kota?, provinsi?, kode_pos?, telepon?
│   │   │       └── update-lokasi-kantor.dto.ts
│   │   │
│   │   ├── module-access/                       ── MODULE: Module Access (internal)
│   │   │   └── ...                              ← Service untuk cek akses modul user
│   │   │
│   │   └── kursus/                              ── GROUP: Modul Kursus Dansa
│   │       ├── kelas/                           ── MODULE: Kelas (UUID PK, table: kursus_kelas)
│   │       │   ├── kelas.controller.ts
│   │       │   ├── kelas.service.ts
│   │       │   ├── kelas.repository.ts
│   │       │   ├── interfaces/
│   │       │   └── dto/
│   │       │
│   │       ├── paket/                           ── MODULE: Paket (FK: id_kelas, table: kursus_paket)
│   │       │   └── ...
│   │       │
│   │       ├── kategori-umur/                   ── MODULE: Kategori Umur (FK: id_paket+id_kelas, table: kursus_kategori_umur)
│   │       │   └── ...
│   │       │
│   │       ├── biaya/                           ── MODULE: Biaya (FK: id_kategori_umur+id_paket+id_kelas, table: kursus_biaya)
│   │       │   └── ...
│   │       │
│   │       ├── diskon/                          ── MODULE: Diskon (table: kursus_diskon)
│   │       │   └── ...
│   │       │
│   │       ├── jadwal-kelas/                    ── MODULE: Jadwal Kelas (table: kursus_jadwal_kelas)
│   │       │   ├── jadwal-kelas.controller.ts   ← CRUD + GET /kelas/:id_kelas
│   │       │   └── ...
│   │       │
│   │       ├── siswa/                           ── MODULE: Siswa (table: siswa, UUID PK)
│   │       │   ├── siswa.controller.ts          ← CRUD + GET /tunggakan + Excel import/template
│   │       │   └── ...
│   │       │
│   │       ├── tagihan/                         ── MODULE: Tagihan (table: kursus_tagihan)
│   │       │   └── ...
│   │       │
│   │       ├── pembayaran/                      ── MODULE: Pembayaran (table: kursus_pembayaran)
│   │       │   └── ...
│   │       │
│   │       ├── presensi/                        ── MODULE: Presensi (table: kursus_presensi)
│   │       │   ├── presensi.controller.ts       ← CRUD + batch + byJadwal + bySiswa
│   │       │   └── ...
│   │       │
│   │       ├── catat-kelas-siswa/               ── MODULE: Catat Kelas Siswa (table: kursus_catat_kelas_siswa)
│   │       │   ├── catat-kelas-siswa.controller.ts ← GET only (managed otomatis via presensi)
│   │       │   └── ...
│   │       │
│   │       └── dashboard/                       ── MODULE: Dashboard Kursus
│   │
│   ├── [feature]/                               ── Template module baru
│   │   ├── [feature].module.ts
│   │   ├── [feature].controller.ts              ← Hanya terima & validasi request
│   │   ├── [feature].service.ts                 ← Business logic
│   │   ├── [feature].repository.ts              ← Semua query Knex di sini
│   │   ├── interfaces/
│   │   │   ├── [feature].interface.ts           ← I[Feature], I[Feature]Public
│   │   │   └── [feature]-repository.interface.ts ← I[Feature]Repository (contract)
│   │   └── dto/
│   │       ├── create-[feature].dto.ts
│   │       ├── update-[feature].dto.ts
│   │       └── [feature]-response.dto.ts
│   │
├── test/
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env
├── .env.example
├── .env.test
├── .gitignore
├── knexfile.ts
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

---

## Tanggung Jawab Setiap Layer

| Layer | File | Tanggung Jawab |
|-------|------|----------------|
| **Controller** | `*.controller.ts` | Terima HTTP request, validasi via DTO, panggil service, return response |
| **Service** | `*.service.ts` | Business logic, orkestrasi, throw exception, panggil repository |
| **Repository** | `*.repository.ts` | Semua query Knex — tidak ada logic bisnis di sini |
| **Interface** | `interfaces/*.ts` | Type contract antar layer, shape dari tabel DB |
| **DTO** | `dto/*.ts` | Validasi & transformasi input dari HTTP request |

---

## Detail Setiap File Penting

### `src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Docs').setVersion('1.0').addBearerAuth().build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

---

### `src/common/interfaces/pagination.interface.ts`
```typescript
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
```

---

### `src/common/interfaces/response.interface.ts`
```typescript
export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
```

---

### `src/common/interfaces/jwt-payload.interface.ts`
```typescript
export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
```

---

### `src/modules/users/interfaces/user.interface.ts`
```typescript
export interface IUser {
  id: number;
  name: string;
  email: string;
  password_hash?: string;
  role: string;
  is_active: boolean | number;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

// Shape untuk response — tanpa field sensitif
export interface IUserPublic extends Omit<IUser, 'password_hash' | 'deleted_at'> {}
```

---

### `src/modules/users/interfaces/create-user.interface.ts`
```typescript
export interface ICreateUser {
  name: string;
  email: string;
  password_hash: string;
  role?: string;
}

export interface IUpdateUser {
  name?: string;
  email?: string;
  role?: string;
  updated_at?: Date;
}
```

---

### `src/modules/users/interfaces/user-repository.interface.ts`
```typescript
import { IUser, IUserPublic } from './user.interface';
import { ICreateUser, IUpdateUser } from './create-user.interface';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

// Contract yang harus dipenuhi oleh UsersRepository
export interface IUsersRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<IUserPublic>>;
  findById(id: number): Promise<IUserPublic | undefined>;
  findByEmail(email: string): Promise<IUser | undefined>;
  create(data: ICreateUser): Promise<IUserPublic>;
  update(id: number, data: IUpdateUser): Promise<IUserPublic>;
  softDelete(id: number): Promise<void>;
}
```

---

### `src/modules/auth/interfaces/auth-payload.interface.ts`
```typescript
import { IUserPublic } from '../../users/interfaces/user.interface';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthPayload {
  user: IUserPublic;
  tokens: IAuthTokens;
}
```

---

### `src/modules/auth/interfaces/auth-repository.interface.ts`
```typescript
export interface IAuthRepository {
  saveRefreshToken(userId: number, token: string): Promise<void>;
  deleteRefreshToken(userId: number, token: string): Promise<void>;
  findRefreshToken(token: string): Promise<{ user_id: number } | undefined>;
}
```

---

### `src/modules/roles/interfaces/role.interface.ts`
```typescript
export interface IRole {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
}

export interface IAssignRole {
  user_id: number;
  role_id: number;
}

export interface IUserRole extends IAssignRole {
  assigned_at: Date;
}
```

---

### `src/modules/roles/interfaces/role-repository.interface.ts`
```typescript
import { IRole } from './role.interface';
import { IAssignRole } from './assign-role.interface';

export interface IRolesRepository {
  findAll(): Promise<IRole[]>;
  findById(id: number): Promise<IRole | undefined>;
  findByName(name: string): Promise<IRole | undefined>;
  create(data: Partial<IRole>): Promise<IRole>;
  assignToUser(data: IAssignRole): Promise<void>;
  removeFromUser(data: IAssignRole): Promise<void>;
  findUserRoles(userId: number): Promise<IRole[]>;
}
```

---

### `src/modules/users/users.repository.ts`
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '../../database/database.module';
import { IUser, IUserPublic } from './interfaces/user.interface';
import { ICreateUser, IUpdateUser } from './interfaces/create-user.interface';
import { IUsersRepository } from './interfaces/user-repository.interface';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<IUserPublic>> {
    const offset = (page - 1) * limit;

    const [rows, [{ total }]] = await Promise.all([
      this.knex<IUser>('users')
        .select('id', 'name', 'email', 'role', 'is_active', 'created_at')
        .where({ is_active: 1 })
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      this.knex('users').where({ is_active: 1 }).count('id as total'),
    ]);

    return {
      data: rows,
      meta: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }

  async findById(id: number): Promise<IUserPublic | undefined> {
    return this.knex<IUser>('users')
      .select('id', 'name', 'email', 'role', 'is_active', 'created_at')
      .where({ id, is_active: 1 })
      .first();
  }

  async findByEmail(email: string): Promise<IUser | undefined> {
    return this.knex<IUser>('users').where({ email }).first();
  }

  async create(data: ICreateUser): Promise<IUserPublic> {
    const [insertId] = await this.knex('users').insert(data);
    return this.findById(insertId) as Promise<IUserPublic>;
  }

  async update(id: number, data: IUpdateUser): Promise<IUserPublic> {
    await this.knex('users').where({ id }).update({
      ...data,
      updated_at: this.knex.fn.now(),
    });
    return this.findById(id) as Promise<IUserPublic>;
  }

  async softDelete(id: number): Promise<void> {
    await this.knex('users').where({ id }).update({
      is_active: 0,
      deleted_at: this.knex.fn.now(),
    });
  }
}
```

---

### `src/modules/users/users.service.ts`
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { IUserPublic } from './interfaces/user.interface';
import { ICreateUser } from './interfaces/create-user.interface';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<IUserPublic>> {
    return this.usersRepository.findAll(page, limit);
  }

  async findById(id: number): Promise<IUserPublic> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException(`User #${id} tidak ditemukan`);
    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async create(dto: CreateUserDto): Promise<IUserPublic> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const data: ICreateUser = {
      name: dto.name,
      email: dto.email,
      password_hash: await bcrypt.hash(dto.password, 12),
    };

    return this.usersRepository.create(data);
  }

  async update(id: number, dto: UpdateUserDto): Promise<IUserPublic> {
    await this.findById(id); // throw 404 jika tidak ada
    return this.usersRepository.update(id, dto);
  }

  async softDelete(id: number): Promise<void> {
    await this.findById(id); // throw 404 jika tidak ada
    return this.usersRepository.softDelete(id);
  }
}
```

---

### `src/modules/users/users.controller.ts`
```typescript
import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.softDelete(id);
  }
}
```

---

### `src/modules/auth/auth.repository.ts`
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '../../database/database.module';
import { IAuthRepository } from './interfaces/auth-repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    await this.knex('refresh_tokens').insert({
      user_id: userId,
      token,
      expires_at: this.knex.raw('DATE_ADD(NOW(), INTERVAL 7 DAY)'),
    });
  }

  async deleteRefreshToken(userId: number, token: string): Promise<void> {
    await this.knex('refresh_tokens')
      .where({ user_id: userId, token })
      .delete();
  }

  async findRefreshToken(token: string): Promise<{ user_id: number } | undefined> {
    return this.knex('refresh_tokens')
      .select('user_id')
      .where({ token })
      .where('expires_at', '>', this.knex.fn.now())
      .first();
  }
}
```

---

### `src/modules/auth/auth.service.ts`
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import { IAuthPayload } from './interfaces/auth-payload.interface';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<IAuthPayload> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Email atau password salah');

    const isMatch = await bcrypt.compare(dto.password, user.password_hash!);
    if (!isMatch) throw new UnauthorizedException('Email atau password salah');

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.authRepository.saveRefreshToken(user.id, refreshToken);

    const { password_hash, deleted_at, ...userPublic } = user;
    return { user: userPublic, tokens: { accessToken, refreshToken } };
  }

  async register(dto: RegisterDto): Promise<IAuthPayload> {
    await this.usersService.create(dto);
    return this.login({ email: dto.email, password: dto.password });
  }

  async logout(userId: number, refreshToken: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(userId, refreshToken);
  }
}
```

---

### `src/modules/users/users.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService], // export service saja, bukan repository
})
export class UsersModule {}
```

---

### `src/modules/auth/auth.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '1d') },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy],
})
export class AuthModule {}
```

---

### `src/database/database.module.ts`
```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Knex from 'knex';

export const KNEX_CONNECTION = 'KNEX_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: KNEX_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => Knex({
        client: config.get('DB_CLIENT'),
        connection: {
          host: config.get('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          database: config.get('DB_NAME'),
          user: config.get('DB_USER'),
          password: config.get('DB_PASSWORD'),
        },
        pool: { min: 2, max: 10 },
        acquireConnectionTimeout: 10000,
      }),
    },
  ],
  exports: [KNEX_CONNECTION],
})
export class DatabaseModule {}
```

---

### `knexfile.ts`
```typescript
import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    migrations: { directory: './src/database/migrations', extension: 'ts' },
    seeds: { directory: './src/database/seeds' },
  },
  test: {
    client: 'mysql2',
    connection: {
      host: process.env.TEST_DB_HOST ?? 'localhost',
      port: Number(process.env.TEST_DB_PORT) || 3306,
      database: process.env.TEST_DB_NAME ?? 'test_db',
      user: process.env.TEST_DB_USER,
      password: process.env.TEST_DB_PASSWORD,
    },
    migrations: { directory: './src/database/migrations', extension: 'ts' },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: true },
    },
    pool: { min: 2, max: 20 },
    migrations: { directory: './src/database/migrations', extension: 'ts' },
  },
};

export default config;
```

---

### `.env.example`
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

JWT_SECRET=ganti_dengan_random_string_minimal_32_karakter
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=ganti_dengan_random_string_lain_minimal_32_karakter
JWT_REFRESH_EXPIRES_IN=7d

DB_CLIENT=mysql2
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

---

### `package.json` (scripts penting)
```json
{
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "migration:make": "knex migrate:make --knexfile knexfile.ts",
    "migration:latest": "knex migrate:latest --knexfile knexfile.ts",
    "migration:rollback": "knex migrate:rollback --knexfile knexfile.ts",
    "seed:run": "knex seed:run --knexfile knexfile.ts"
  }
}
```

---

## Export Module — Excel & PDF

### Library yang Digunakan
| Kebutuhan | Library | Install |
|-----------|---------|---------|
| Excel | `exceljs` | `npm install exceljs` |
| PDF | `puppeteer` | `npm install puppeteer` |

> **Mengapa exceljs?** Support styling sel, merge cell, freeze pane, auto-filter, gambar/logo — jauh lebih lengkap dari `xlsx`.
> **Mengapa puppeteer?** Render HTML → PDF, sehingga tampilan invoice/laporan bisa dibuat via HTML/CSS biasa, hasilnya pixel-perfect.

---

### `src/export/interfaces/export-options.interface.ts`
```typescript
export interface IExcelColumn {
  header: string;       // Label header kolom
  key: string;          // Key dari data object
  width?: number;       // Lebar kolom (default: 20)
  style?: Partial<ExcelJS.Style>;
}

export interface IExcelOptions {
  sheetName: string;
  title?: string;        // Judul laporan (merge cell di baris 1)
  columns: IExcelColumn[];
  data: Record<string, any>[];
  createdBy?: string;
}

export interface IPdfOptions {
  templatePath?: string; // Path ke file HTML template
  templateHtml?: string; // Atau langsung HTML string
  data: Record<string, any>;
  filename?: string;
}
```

---

### `src/export/dto/export-query.dto.ts`
```typescript
import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportQueryDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
```

---

### `src/export/excel.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { IExcelOptions } from './interfaces/export-options.interface';

@Injectable()
export class ExcelService {

  async generate(options: IExcelOptions): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Metadata workbook
    workbook.creator = options.createdBy ?? 'System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(options.sheetName, {
      pageSetup: { paperSize: 9, orientation: 'landscape' }, // A4 landscape
    });

    let startRow = 1;

    // ── Baris judul (merge cell) ──
    if (options.title) {
      const lastCol = options.columns.length;
      sheet.mergeCells(1, 1, 1, lastCol);
      const titleCell = sheet.getCell('A1');
      titleCell.value = options.title;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E79' }, // biru gelap
      };
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).height = 35;
      startRow = 2;
    }

    // ── Definisi kolom ──
    sheet.columns = options.columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width ?? 20,
      style: col.style,
    }));

    // ── Styling header row ──
    const headerRow = sheet.getRow(startRow);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E75B6' }, // biru
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });
    headerRow.height = 25;

    // ── Freeze pane (header tetap terlihat saat scroll) ──
    sheet.views = [{ state: 'frozen', ySplit: startRow }];

    // ── Auto filter ──
    sheet.autoFilter = {
      from: { row: startRow, column: 1 },
      to: { row: startRow, column: options.columns.length },
    };

    // ── Isi data ──
    options.data.forEach((row, index) => {
      const dataRow = sheet.addRow(row);
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
      dataRow.height = 20;

      // Alternating row color
      if (index % 2 === 0) {
        dataRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: 'FFF2F7FB' }, // biru sangat muda
          };
        });
      }
    });

    // ── Baris total (opsional, jika kolom numerik) ──
    const numericCols = options.columns.filter((c) => c.key.includes('total') || c.key.includes('amount'));
    if (numericCols.length > 0) {
      const totalRow = sheet.addRow({});
      const firstCell = totalRow.getCell(1);
      firstCell.value = 'TOTAL';
      firstCell.font = { bold: true };

      numericCols.forEach((col) => {
        const colIdx = options.columns.findIndex((c) => c.key === col.key) + 1;
        const cell = totalRow.getCell(colIdx);
        cell.value = {
          formula: `SUM(${sheet.getColumn(colIdx).letter}${startRow + 1}:${sheet.getColumn(colIdx).letter}${sheet.rowCount})`,
        };
        cell.font = { bold: true };
        cell.numFmt = '#,##0.00';
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
```

---

### `src/export/pdf.service.ts`
```typescript
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IPdfOptions } from './interfaces/export-options.interface';

@Injectable()
export class PdfService implements OnModuleDestroy {
  private browser: puppeteer.Browser | null = null;

  // Reuse browser instance — jangan launch baru tiap request (berat!)
  private async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // wajib untuk Docker/Linux
      });
    }
    return this.browser;
  }

  async generate(options: IPdfOptions): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    // Ambil HTML — dari file template atau string langsung
    let html = options.templateHtml ?? '';
    if (options.templatePath) {
      html = readFileSync(options.templatePath, 'utf-8');
    }

    // Inject data ke template (ganti placeholder {{key}} dengan nilai)
    html = this.renderTemplate(html, options.data);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,    // render background CSS
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    await page.close(); // tutup page, bukan browser
    return Buffer.from(pdfBuffer);
  }

  // Simple template engine: ganti {{key}} dengan data[key]
  private renderTemplate(html: string, data: Record<string, any>): string {
    return html.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => {
      const value = key.split('.').reduce((obj: any, k: string) => obj?.[k], data);
      return value !== undefined ? String(value) : '';
    });
  }

  // Tutup browser saat module destroy (graceful shutdown)
  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

---

### `src/export/templates/report.template.html`
```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; }

    /* ── Header laporan ── */
    .header { display: flex; justify-content: space-between; align-items: center;
              padding-bottom: 16px; border-bottom: 2px solid #1F4E79; margin-bottom: 20px; }
    .header .company h2 { font-size: 18px; color: #1F4E79; }
    .header .company p  { font-size: 11px; color: #666; }
    .header .logo img   { height: 50px; }

    /* ── Judul laporan ── */
    .report-title { text-align: center; margin-bottom: 16px; }
    .report-title h1 { font-size: 16px; color: #1F4E79; text-transform: uppercase; }
    .report-title p  { font-size: 11px; color: #888; }

    /* ── Tabel ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead tr { background-color: #2E75B6; color: white; }
    thead th { padding: 8px 10px; text-align: left; font-size: 11px; }
    tbody tr:nth-child(even) { background-color: #F2F7FB; }
    tbody td { padding: 7px 10px; border-bottom: 1px solid #E0E0E0; font-size: 11px; }
    tfoot tr { background-color: #1F4E79; color: white; font-weight: bold; }
    tfoot td { padding: 8px 10px; }

    /* ── Footer ── */
    .footer { margin-top: 24px; display: flex; justify-content: space-between;
              font-size: 10px; color: #999; border-top: 1px solid #E0E0E0; padding-top: 8px; }

    /* ── Tanda tangan ── */
    .signature { margin-top: 40px; display: flex; justify-content: flex-end; }
    .signature .sign-box { text-align: center; }
    .signature .sign-line { width: 180px; border-bottom: 1px solid #333;
                            margin: 50px auto 4px; }
  </style>
</head>
<body>

  <div class="header">
    <div class="company">
      <h2>{{companyName}}</h2>
      <p>{{companyAddress}}</p>
    </div>
  </div>

  <div class="report-title">
    <h1>{{reportTitle}}</h1>
    <p>Periode: {{dateFrom}} s/d {{dateTo}} &nbsp;|&nbsp; Dicetak: {{printedAt}}</p>
  </div>

  <!-- Konten dinamis inject dari service -->
  {{tableContent}}

  <div class="signature">
    <div class="sign-box">
      <p>{{signatureCity}}, {{signatureDate}}</p>
      <p>{{signatureRole}}</p>
      <div class="sign-line"></div>
      <p><strong>{{signatureName}}</strong></p>
    </div>
  </div>

  <div class="footer">
    <span>Digenerate otomatis oleh sistem</span>
    <span>Halaman <span class="pageNumber"></span></span>
  </div>

</body>
</html>
```

---

### `src/export/export.controller.ts`
```typescript
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExcelService } from './excel.service';
import { PdfService } from './pdf.service';
import { ExportQueryDto } from './dto/export-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'export', version: '1' })
export class ExportController {
  constructor(
    private readonly excelService: ExcelService,
    private readonly pdfService: PdfService,
  ) {}

  @Get('users/excel')
  async exportUsersExcel(
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    // Contoh data — di real app inject UsersService dan ambil data dari DB
    const data = [
      { no: 1, name: 'Arief', email: 'arief@email.com', role: 'admin', created_at: '2024-01-01' },
    ];

    const buffer = await this.excelService.generate({
      sheetName: 'Data Users',
      title: 'LAPORAN DATA USERS',
      createdBy: 'System',
      columns: [
        { header: 'No',         key: 'no',         width: 6  },
        { header: 'Nama',       key: 'name',        width: 25 },
        { header: 'Email',      key: 'email',       width: 30 },
        { header: 'Role',       key: 'role',        width: 15 },
        { header: 'Tgl Daftar', key: 'created_at',  width: 18 },
      ],
      data,
    });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="users-${Date.now()}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('users/pdf')
  async exportUsersPdf(
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    const { join } = require('path');

    const buffer = await this.pdfService.generate({
      templatePath: join(__dirname, 'templates', 'report.template.html'),
      data: {
        companyName: 'PT. Contoh Maju',
        companyAddress: 'Jl. Contoh No. 1, Jakarta',
        reportTitle: 'LAPORAN DATA USERS',
        dateFrom: query.dateFrom ?? '-',
        dateTo: query.dateTo ?? '-',
        printedAt: new Date().toLocaleDateString('id-ID'),
        signatureCity: 'Jakarta',
        signatureDate: new Date().toLocaleDateString('id-ID'),
        signatureRole: 'Manager',
        signatureName: '( ________________ )',
        tableContent: `
          <table>
            <thead>
              <tr><th>No</th><th>Nama</th><th>Email</th><th>Role</th></tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>Arief</td><td>arief@email.com</td><td>Admin</td></tr>
            </tbody>
          </table>
        `,
      },
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="users-${Date.now()}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
```

---

### `src/export/export.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExcelService } from './excel.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [ExportController],
  providers: [ExcelService, PdfService],
  exports: [ExcelService, PdfService], // export agar bisa dipakai module lain
})
export class ExportModule {}
```

---

### Install dependencies
```bash
npm install exceljs puppeteer
npm install --save-dev @types/puppeteer
```

---

## Aturan Review Folder Structure

Ketika mereview project NestJS, periksa deviasi berikut dan laporkan:

| Deviasi | Severity | Saran |
|---------|----------|-------|
| Query Knex ada di service (bukan repository) | HIGH | Pindahkan semua query ke `*.repository.ts` |
| Logic bisnis ada di controller | HIGH | Pindahkan ke service |
| Logic bisnis ada di repository | HIGH | Repository hanya boleh berisi query DB |
| Knex tidak di-inject via `KNEX_CONNECTION` di repository | HIGH | Pakai `@Inject(KNEX_CONNECTION)` |
| Tidak ada folder `interfaces/` di module | MEDIUM | Buat `interfaces/` dengan shape & repository contract |
| Repository tidak `implements` interface contract | MEDIUM | Tambah `implements I[Feature]Repository` |
| Return type service/repository pakai `any` | MEDIUM | Ganti dengan interface yang tepat |
| `IUser` dan `IUserPublic` tidak dipisah | MEDIUM | Pisahkan — `IUserPublic` exclude field sensitif |
| Repository di-export dari module | MEDIUM | Hanya export service — repository internal module |
| DTO tanpa `class-validator` decorator | HIGH | Tambah validasi |
| Module tidak punya file `*.module.ts` sendiri | MEDIUM | Buat module file terpisah |
| `common/interfaces/` tidak ada | MEDIUM | Buat `pagination`, `response`, `jwt-payload` interface |
| Global config pakai `process.env` langsung | MEDIUM | Ganti dengan `ConfigService` |
| Tidak ada `HttpExceptionFilter` global | MEDIUM | Tambah di `main.ts` |
| Semua file flat di `src/` tanpa subfolder | HIGH | Restructure ke feature-based modules |
| Export Excel pakai `xlsx` library | INFO | Pertimbangkan migrasi ke `exceljs` untuk styling lebih baik |
| PDF generate pakai `pdfkit` tanpa HTML template | INFO | Pertimbangkan `puppeteer` untuk hasil lebih fleksibel |
| Browser puppeteer di-launch tiap request | HIGH | Reuse browser instance via singleton service |
| Template HTML PDF di-hardcode di service | MEDIUM | Pisahkan ke file `templates/*.html` |

---

## Kursus Modules — Detail Lengkap

Group module untuk aplikasi kursus dansa. Semua controller prefix `/kursus/[nama]`.
Semua tabel kursus menggunakan UUID PK dan prefix `kursus_` (termasuk `kursus_siswa`).
Nama denormalized disimpan di setiap baris (tidak ada JOIN antar tabel kursus).

### Database Schema

#### `kursus_kelas`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_kelas | VARCHAR(36) PK | UUID |
| nama_kelas | VARCHAR(100) NOT NULL | |
| deskripsi | TEXT NULL | |
| aktif + 6 audit cols | | |

#### `kursus_paket`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_paket | VARCHAR(36) PK | UUID |
| nama_paket | VARCHAR(50) | |
| id_kelas | VARCHAR(36) FK | → kursus_kelas |
| nama_kelas | VARCHAR(50) | Denormalized |
| deskripsi | TEXT NULL | |
| aktif + 6 audit cols | | |

#### `kursus_kategori_umur`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_kategori_umur | VARCHAR(36) PK | UUID |
| nama_kategori_umur | VARCHAR(100) NOT NULL | |
| id_paket | VARCHAR(36) FK | → kursus_paket |
| nama_paket | VARCHAR(50) | Denormalized |
| id_kelas | VARCHAR(36) FK | → kursus_kelas |
| nama_kelas | VARCHAR(50) | Denormalized |
| durasi | INT NULL | Durasi dalam bulan |
| aktif + 6 audit cols | | |

#### `kursus_biaya`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_biaya | VARCHAR(36) PK | UUID |
| nama_biaya | VARCHAR(100) NOT NULL | |
| harga_biaya | INT NOT NULL | Rupiah |
| id_kategori_umur | VARCHAR(36) FK | → kursus_kategori_umur |
| nama_kategori_umur | VARCHAR(100) | Denormalized |
| id_paket | VARCHAR(36) FK | → kursus_paket |
| nama_paket | VARCHAR(50) | Denormalized |
| id_kelas | VARCHAR(36) FK | → kursus_kelas |
| nama_kelas | VARCHAR(50) | Denormalized |
| aktif + 6 audit cols | | |

#### `kursus_diskon`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_diskon | VARCHAR(36) PK | UUID |
| kode_diskon | VARCHAR(20) UNIQUE | |
| nama_diskon | VARCHAR(100) NOT NULL | |
| persentase | DECIMAL(5,2) NULL | |
| harga | INT NULL | Nominal diskon |
| berlaku_mulai | DATE NOT NULL | |
| berlaku_sampai | DATE NOT NULL | |
| aktif + 6 audit cols | | |

#### `kursus_jadwal_kelas`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_jadwal_kelas | VARCHAR(36) PK | UUID |
| id_kelas | VARCHAR(36) FK | → kursus_kelas |
| nama_kelas | VARCHAR(50) | Denormalized |
| id_karyawan | VARCHAR(36) FK | Instruktur → karyawan |
| nama_karyawan | VARCHAR(100) | Denormalized |
| id_kategori_umur | VARCHAR(36) FK | → kursus_kategori_umur |
| nama_kategori_umur | VARCHAR(100) | Denormalized |
| hari | VARCHAR(20) | Senin/Selasa/dst |
| jam_mulai | VARCHAR(5) NULL | HH:MM |
| jam_selesai | VARCHAR(5) NULL | HH:MM |
| tanggal_mulai | DATETIME NOT NULL | |
| tanggal_selesai | DATETIME NOT NULL | |
| sesi_pertemuan | INT NULL | |
| aktif TINYINT DEFAULT 1 | | |
| aktif + 6 audit cols | | |

#### `kursus_siswa` (sebelumnya: `siswa`)
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_siswa | VARCHAR(36) PK | UUID |
| nama_siswa | VARCHAR(100) NOT NULL | |
| email | VARCHAR(100) NULL | |
| telepon | VARCHAR(20) NULL | |
| tanggal_lahir | DATE NULL | |
| alamat | TEXT NULL | |
| jenis_kelamin | TINYINT NULL | 1=L, 2=P |
| foto_url | VARCHAR(255) NULL | |
| aktif + 6 audit cols | | |

#### `kursus_presensi`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_presensi | VARCHAR(36) PK | UUID |
| id_jadwal_kelas | VARCHAR(36) FK | → kursus_jadwal_kelas |
| id_siswa | VARCHAR(36) FK | → kursus_siswa |
| nama_siswa | VARCHAR(100) NULL | Denormalized |
| status | TINYINT NOT NULL | 1=HADIR, 2=TIDAK_HADIR, 3=SAKIT, 4=IZIN |
| waktu_mulai_kelas | DATETIME NULL | |
| catatan | TEXT NULL | |
| aktif + 6 audit cols | | |

#### `kursus_catat_kelas_siswa`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_catat | VARCHAR(36) PK | UUID |
| id_siswa | VARCHAR(36) FK | → kursus_siswa |
| nama_siswa | VARCHAR(100) NULL | Denormalized |
| id_kelas | VARCHAR(36) FK | → kursus_kelas |
| nama_kelas | VARCHAR(100) NULL | Denormalized |
| total_sesi_hadir | INT NOT NULL DEFAULT 0 | Dihitung otomatis dari presensi status=1 |
| aktif + 4 audit cols | | (no dihapus_pada — tidak soft delete) |
| UNIQUE | (id_siswa, id_kelas) | Satu record per kombinasi siswa+kelas |

#### `kursus_tagihan`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_tagihan | VARCHAR(36) PK | UUID |
| id_siswa | VARCHAR(36) FK | → kursus_siswa |
| nama_siswa | VARCHAR(100) | Denormalized |
| id_biaya | VARCHAR(36) FK | → kursus_biaya |
| nama_biaya | VARCHAR(100) | Denormalized |
| id_kategori_umur | VARCHAR(36) FK | |
| nama_kategori_umur | VARCHAR(100) | Denormalized |
| id_paket | VARCHAR(36) FK | |
| nama_paket | VARCHAR(50) | Denormalized |
| id_kelas | VARCHAR(36) FK | |
| nama_kelas | VARCHAR(50) | Denormalized |
| periode | VARCHAR(7) | YYYY-MM |
| sesi_pertemuan | INT NULL | |
| total_harga | DECIMAL(12,2) | |
| total_bayar | DECIMAL(12,2) DEFAULT 0 | |
| status | TINYINT | 1=MENUNGGU, 2=SEBAGIAN, 3=LUNAS, 4=DIBATALKAN |
| aktif TINYINT DEFAULT 1 | | |
| 6 audit cols | | |

#### `kursus_pembayaran`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id_pembayaran | VARCHAR(36) PK | UUID |
| id_tagihan | VARCHAR(36) FK | → kursus_tagihan |
| jumlah | DECIMAL(12,2) NOT NULL | |
| tanggal_bayar | DATE NOT NULL | |
| metode | VARCHAR(20) | TUNAI/TRANSFER/QRIS |
| referensi | VARCHAR(100) NULL | No. nota/referensi |
| deskripsi | TEXT NULL | (bukan `catatan`) |
| aktif INT DEFAULT 1 | | |
| 6 audit cols | | |

---

### Endpoints

#### `GET /kursus/kelas` — Daftar kelas (pagination + search)
#### `GET /kursus/paket` — Daftar paket (pagination)
#### `GET /kursus/paket/kelas/:id_kelas` — Dropdown paket per kelas
#### `GET /kursus/kategori-umur` — Daftar kategori umur (pagination)
#### `GET /kursus/kategori-umur/kelas/:id_kelas` — Dropdown per kelas
#### `GET /kursus/kategori-umur/paket/:id_paket` — Dropdown per paket
#### `GET /kursus/biaya` — Daftar biaya (pagination)
#### `GET /kursus/biaya/kelas/:id_kelas` — Dropdown per kelas
#### `GET /kursus/biaya/paket/:id_paket` — Dropdown per paket
#### `GET /kursus/biaya/kategori-umur/:id_kategori_umur` — Dropdown per kategori umur
#### `GET /kursus/diskon` — Daftar diskon (pagination)
#### `GET /kursus/diskon/aktif` — Diskon yang berlaku sekarang (tanpa pagination)
#### `GET /kursus/jadwal-kelas` — Daftar jadwal (pagination + search)
#### `GET /kursus/jadwal-kelas/kelas/:id_kelas` — Dropdown jadwal per kelas
#### `GET /kursus/siswa` — Daftar siswa (pagination + search)
#### `GET /kursus/siswa/tunggakan` — Siswa dengan tagihan belum lunas
#### `GET /kursus/siswa/template/excel` — Template import Excel
#### `POST /kursus/siswa/upload/excel` — Import bulk via Excel
#### `GET /kursus/tagihan` — Daftar tagihan (pagination)
#### `GET /kursus/tagihan/siswa/:id_siswa` — Tagihan per siswa
#### `GET /kursus/pembayaran` — Daftar pembayaran (pagination)
#### `GET /kursus/pembayaran/tagihan/:id_tagihan` — Pembayaran per tagihan
#### `GET /kursus/presensi` — List presensi (pagination + search + filter bulan)
#### `GET /kursus/presensi/jadwal/:id_jadwal` — Absen list per sesi (siswa + status presensi)
#### `GET /kursus/presensi/siswa/:id_siswa` — Riwayat presensi + sesi_terpakai
#### `GET /kursus/presensi/siswa-jadwal/:id_jadwal/:id_siswa` — Presensi satu siswa di satu jadwal
#### `GET /kursus/presensi/:id` — Detail presensi
#### `POST /kursus/presensi/batch` — Absen massal (upsert) — **panggil ini untuk absen**
#### `POST /kursus/presensi` — Catat presensi satu siswa
#### `PATCH /kursus/presensi/:id` — Koreksi status/catatan
#### `DELETE /kursus/presensi/:id` — Soft delete
#### `GET /kursus/catat-kelas-siswa/siswa/:id_siswa` — Semua kelas + total sesi hadir siswa
#### `GET /kursus/catat-kelas-siswa/kelas/:id_kelas` — Semua siswa + total sesi hadir di kelas
#### `GET /kursus/dashboard` — Ringkasan statistik kursus

---

### Business Logic Kritis

#### Pembayaran — Auto recalculate status tagihan
Setiap POST/DELETE pembayaran, service memanggil `tagihanService.recalculateStatus(id_tagihan)`:
- `total_bayar` = SUM semua pembayaran aktif untuk tagihan itu
- `status`: 1=MENUNGGU (0), 2=SEBAGIAN (partial), 3=LUNAS (total_bayar >= total_harga)

#### Siswa tunggakan
`findTunggakan()` query: `kursus_tagihan WHERE status IN (1,2)` JOIN `kursus_siswa`
GROUP BY `kursus_siswa.id_siswa` → COUNT tagihan belum lunas, SUM sisa outstanding.

#### Presensi — Auto recalculate catat_kelas_siswa
Setiap `POST`, `PATCH` (jika status berubah), `DELETE` presensi → service memanggil
`catatService.recalculate(id_siswa, id_kelas, names, userId)`:
- Hitung ulang COUNT dari scratch: `kursus_presensi JOIN kursus_jadwal_kelas WHERE status=1 AND dihapus_pada IS NULL`
- Upsert record di `kursus_catat_kelas_siswa` (INSERT jika belum ada, UPDATE jika sudah)
- `id_kelas` didapat dari `jadwalKelasService.findById(id_jadwal_kelas).id_kelas`

#### Validasi konflik jadwal instruktur
`findKonflikInstruktur(id_karyawan, hari, jam_mulai, jam_selesai, excludeId?)`:
- Query: overlap jam → `jam_mulai_existing < jam_selesai_baru AND jam_selesai_existing > jam_mulai_baru`
- Dipanggil di `JadwalKelasService.create()` dan `update()`
- Response 409 jika konflik ditemukan

---

### File Structure Detail

```
src/modules/kursus/
├── kelas/
│   ├── interfaces/
│   │   ├── kelas.interface.ts
│   │   └── kelas-repository.interface.ts
│   ├── dto/
│   │   ├── create-kelas.dto.ts
│   │   ├── update-kelas.dto.ts
│   │   └── kelas-response.dto.ts
│   ├── kelas.repository.ts       ← table: kursus_kelas, UUID PK: id_kelas
│   ├── kelas.service.ts
│   ├── kelas.module.ts
│   └── kelas.controller.ts
│
├── paket/
│   ├── interfaces/
│   ├── dto/
│   ├── paket.repository.ts       ← table: kursus_paket, findByKelas()
│   ├── paket.service.ts
│   ├── paket.module.ts
│   └── paket.controller.ts      ← GET /kelas/:id_kelas sebelum /:id
│
├── kategori-umur/
│   ├── interfaces/
│   ├── dto/
│   ├── kategori-umur.repository.ts ← findByKelas(), findByPaket()
│   ├── kategori-umur.service.ts
│   ├── kategori-umur.module.ts
│   └── kategori-umur.controller.ts
│
├── biaya/
│   ├── interfaces/
│   ├── dto/
│   ├── biaya.repository.ts       ← findByKelas(), findByPaket(), findByKategoriUmur()
│   ├── biaya.service.ts
│   ├── biaya.module.ts
│   └── biaya.controller.ts
│
├── diskon/
│   ├── interfaces/
│   ├── dto/
│   ├── diskon.repository.ts      ← table: kursus_diskon, findAktif()
│   ├── diskon.service.ts
│   ├── diskon.module.ts
│   └── diskon.controller.ts     ← GET /aktif sebelum /:id
│
├── jadwal-kelas/
│   ├── interfaces/
│   │   ├── jadwal-kelas.interface.ts           ← IJadwalKelas (no kuota/lokasi/instruktur text)
│   │   └── jadwal-kelas-repository.interface.ts
│   ├── dto/
│   │   ├── create-jadwal-kelas.dto.ts
│   │   ├── update-jadwal-kelas.dto.ts          ← PartialType(CreateJadwalKelasDto)
│   │   └── jadwal-kelas-response.dto.ts
│   ├── jadwal-kelas.repository.ts  ← table: kursus_jadwal_kelas, findByKelas()
│   ├── jadwal-kelas.service.ts
│   ├── jadwal-kelas.module.ts
│   └── jadwal-kelas.controller.ts  ← GET /kelas/:id_kelas sebelum /:id
│
├── siswa/
│   ├── interfaces/
│   │   ├── siswa.interface.ts              ← ISiswa, ISiswaPublic, ISiswaTunggakanItem
│   │   └── siswa-repository.interface.ts  ← findTunggakan() bukan findMonitoring()
│   ├── dto/
│   │   ├── create-siswa.dto.ts
│   │   ├── update-siswa.dto.ts
│   │   └── siswa-response.dto.ts
│   ├── siswa.repository.ts              ← table: siswa, findTunggakan via kursus_tagihan
│   ├── siswa.service.ts                 ← Excel import/export + getTunggakan()
│   ├── siswa.module.ts
│   └── siswa.controller.ts             ← GET /tunggakan, GET /template/excel, POST /upload/excel
│
├── tagihan/
│   ├── interfaces/
│   │   ├── tagihan.interface.ts              ← ITagihan (flat, semua nama denormalized)
│   │   └── tagihan-repository.interface.ts  ← recalculateStatus
│   ├── dto/
│   │   ├── create-tagihan.dto.ts
│   │   ├── update-tagihan.dto.ts            ← PartialType(CreateTagihanDto)
│   │   └── tagihan-response.dto.ts
│   ├── tagihan.repository.ts              ← table: kursus_tagihan, recalculateStatus()
│   ├── tagihan.service.ts
│   ├── tagihan.module.ts
│   └── tagihan.controller.ts
│
├── pembayaran/
│   ├── interfaces/
│   │   ├── pembayaran.interface.ts              ← IPembayaran (deskripsi bukan catatan, ada aktif)
│   │   └── pembayaran-repository.interface.ts
│   ├── dto/
│   │   ├── create-pembayaran.dto.ts            ← deskripsi + aktif
│   │   └── pembayaran-response.dto.ts
│   ├── pembayaran.repository.ts              ← table: kursus_pembayaran (tidak JOIN)
│   ├── pembayaran.service.ts               ← auto recalculate setelah create/delete
│   ├── pembayaran.module.ts               ← import TagihanModule
│   └── pembayaran.controller.ts
│
├── presensi/
│   ├── interfaces/
│   │   ├── presensi.interface.ts              ← IPresensiPublic, IPresensiJadwalItem
│   │   └── presensi-repository.interface.ts  ← IPresensiQuery (+ bulan filter), batchUpsert
│   ├── dto/
│   │   ├── create-presensi.dto.ts            ← id_jadwal, id_siswa, status, catatan
│   │   ├── create-batch-presensi.dto.ts      ← id_jadwal + items[]
│   │   ├── update-presensi.dto.ts            ← status, catatan (optional)
│   │   ├── presensi-query.dto.ts             ← extends PaginationQueryDto + bulan
│   │   └── presensi-response.dto.ts
│   ├── presensi.repository.ts    ← table: kursus_presensi
│   │                                JOIN kursus_jadwal_kelas as j
│   │                                JOIN kursus_siswa as s
│   │                                findByJadwal() via kursus_tagihan_detail
│   │                                batchUpsert() = upsert per siswa
│   ├── presensi.service.ts       ← inject JadwalKelasService + SiswaService + CatatKelasSiswaService
│   │                                recalculate dipanggil setelah create/batchUpsert/update(status)/remove
│   ├── presensi.module.ts        ← import JadwalKelasModule, SiswaModule, CatatKelasSiswaModule
│   └── presensi.controller.ts   ← GET /batch sebelum /:id, GET /jadwal/:id, GET /siswa/:id
│
├── catat-kelas-siswa/
│   ├── interfaces/
│   │   ├── catat-kelas-siswa.interface.ts              ← ICatatKelasSiswa, ICatatKelasSiswaPublic
│   │   └── catat-kelas-siswa-repository.interface.ts  ← upsertAndRecalculate()
│   ├── dto/
│   │   └── catat-kelas-siswa-response.dto.ts
│   ├── catat-kelas-siswa.repository.ts  ← table: kursus_catat_kelas_siswa
│   │                                       upsertAndRecalculate() = COUNT presensi status=1 lalu UPDATE
│   ├── catat-kelas-siswa.service.ts     ← recalculate(), findBySiswa(), findByKelas()
│   ├── catat-kelas-siswa.module.ts      ← exports CatatKelasSiswaService
│   └── catat-kelas-siswa.controller.ts ← GET /siswa/:id_siswa, GET /kelas/:id_kelas (read-only)
│
└── dashboard/
    ├── interfaces/
    │   └── dashboard.interface.ts            ← IDashboardSummary, ISiswaPerKelas (bukan ISiswaPerProgram)
    ├── dashboard.repository.ts              ← query kursus_tagihan, kursus_pembayaran, kursus_jadwal_kelas
    ├── dashboard.service.ts
    ├── dashboard.module.ts
    └── dashboard.controller.ts
```

---

### Migrations Kursus (Updated)

| File | Isi |
|------|-----|
| `*_create_siswa_table.ts` | Buat tabel `siswa` (UUID PK: id_siswa) |
| `*_create_kursus_kelas_table.ts` | Buat tabel `kursus_kelas` |
| `*_create_kursus_paket_table.ts` | Buat tabel `kursus_paket` (FK: id_kelas) |
| `*_create_kursus_kategori_umur_table.ts` | Buat tabel `kursus_kategori_umur` (FK: id_paket, id_kelas) |
| `*_create_kursus_biaya_table.ts` | Buat tabel `kursus_biaya` (FK: id_kategori_umur, id_paket, id_kelas) |
| `*_create_kursus_diskon_table.ts` | Buat tabel `kursus_diskon` |
| `*_create_kursus_jadwal_kelas_table.ts` | Buat tabel `kursus_jadwal_kelas` (was: jadwal_kelas) |
| `*_create_kursus_tagihan_table.ts` | Buat tabel `kursus_tagihan` (was: tagihan) |
| `*_create_kursus_pembayaran_table.ts` | Buat tabel `kursus_pembayaran` (was: pembayaran) |
