# Checklist Review — JavaScript / TypeScript (Next.js + NestJS + Knex)

## Code Quality

### TypeScript Specific
- [ ] Tidak ada penggunaan `any` yang tidak perlu — pakai type yang spesifik
- [ ] Interface/Type didefinisikan untuk semua object yang kompleks
- [ ] Return type fungsi dideklarasikan secara eksplisit
- [ ] Enum dipakai untuk nilai konstan yang terbatas
- [ ] Generic type dipakai dengan benar

### Next.js Specific
- [ ] Server Component vs Client Component dipilih dengan tepat
- [ ] `use client` hanya di komponen yang benar-benar butuh interaktivitas
- [ ] Data fetching di Server Component, bukan Client Component jika bisa
- [ ] Image menggunakan `next/image` bukan `<img>` biasa
- [ ] Link menggunakan `next/link` bukan `<a>` biasa
- [ ] Environment variable: NEXT_PUBLIC_ hanya untuk yang boleh publik
- [ ] API Route punya validasi input dan error handling
- [ ] Loading dan error boundary ada untuk setiap route

### Node.js + Express Specific
- [ ] Semua route punya validasi input (joi, zod, atau express-validator)
- [ ] Middleware auth dipakai di semua route yang butuh proteksi
- [ ] Error di-pass ke `next(err)` bukan langsung res.status()
- [ ] Tidak ada `console.log` untuk production — pakai logger (winston/pino)
- [ ] Rate limiting ada untuk endpoint publik
- [ ] Helmet.js dipakai untuk security headers
- [ ] CORS dikonfigurasi spesifik, bukan `origin: '*'` untuk production

### NestJS Specific
- [ ] Module structure rapi — setiap fitur punya module sendiri (`UsersModule`, `AuthModule`, dll)
- [ ] DTO dipakai untuk semua request body — jangan pakai `any` atau raw object
- [ ] `class-validator` dan `class-transformer` dipakai di DTO dengan `ValidationPipe` global
- [ ] `@Injectable()` service tidak menyimpan state yang berbeda per request (singleton safe)
- [ ] Guard dipakai untuk auth (`JwtAuthGuard`), bukan logic manual di controller
- [ ] Interceptor dipakai untuk transform response (format standar), bukan di tiap controller
- [ ] Exception Filter dipakai untuk global error handling — jangan `try/catch` di setiap method
- [ ] `ConfigModule` dipakai untuk env variable, bukan `process.env` langsung
- [ ] Circular dependency antar module dihindari — pakai `forwardRef()` hanya jika terpaksa
- [ ] `@Roles()` decorator + RolesGuard dipakai untuk role-based access
- [ ] Repository pattern dipakai di service, bukan query langsung di controller
- [ ] `@ApiProperty()` dari Swagger ada di semua DTO untuk dokumentasi otomatis
- [ ] **DILARANG** pakai `@ApiResponse()` di controller — cukup `@ApiTags`, `@ApiOperation`, `@ApiBody`, dan `@ApiBearerAuth` saja

### Knex.js Specific
- [ ] Migration file ada untuk setiap perubahan skema DB (jangan alter tabel manual)
- [ ] Seed file tersedia untuk data awal / testing
- [ ] `knex.transaction()` dipakai untuk operasi multi-tabel yang harus atomic
- [ ] Query builder dipakai, bukan string SQL mentah — hindari `knex.raw()` jika bisa
- [ ] Jika terpaksa pakai `knex.raw()`, gunakan `?` binding — jangan string interpolation
- [ ] `knex.destroy()` dipanggil saat aplikasi shutdown (graceful close)
- [ ] Koneksi pool dikonfigurasi: `min`, `max`, `acquireTimeoutMillis`
- [ ] Migration dijalankan di CI/CD sebelum deploy, bukan manual
- [ ] Nama migration deskriptif: `20240101_create_users_table`, bukan `migration1`
- [ ] `returning()` dipakai setelah insert untuk mendapat data yang baru dibuat (PostgreSQL)
- [ ] Untuk MySQL, pakai `knex('table').insert(data)` lalu ambil `result[0]` sebagai insertId — `returning()` tidak didukung MySQL
- [ ] `knexfile.js` dikonfigurasi per environment: `development`, `staging`, `production`
- [ ] Client driver sesuai DB: `mysql2` untuk MySQL, `pg` untuk PostgreSQL, `oracledb` untuk Oracle

### Async/Promise
- [ ] Semua Promise di-await atau di-.catch()
- [ ] Tidak ada floating Promise (Promise yang tidak di-handle)
- [ ] `Promise.all()` dipakai jika beberapa async call independen
- [ ] Tidak ada `async` function tanpa `await` di dalamnya
- [ ] Timeout ada untuk external API call

### React/Next.js Hooks
- [ ] `useEffect` punya dependency array yang benar
- [ ] Cleanup function ada di `useEffect` jika subscribe ke event
- [ ] `useMemo` dan `useCallback` dipakai untuk optimasi yang tepat
- [ ] Tidak ada setState di luar component lifecycle

---

## Bug Patterns yang Sering di JS/TS

### NestJS — Missing ValidationPipe
```typescript
// ❌ Bug: DTO tidak divalidasi karena ValidationPipe tidak dipasang global
@Post('/login')
async login(@Body() dto: LoginDto) {
  // dto.email bisa null, undefined, atau bukan email sama sekali!
  return this.authService.login(dto);
}

// ✅ Fix: pasang ValidationPipe global di main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // buang property yang tidak ada di DTO
    forbidNonWhitelisted: true,
    transform: true,       // auto-transform tipe data
  }));
  await app.listen(3000);
}
```

### NestJS — Circular Dependency
```typescript
// ❌ Bug: UsersService inject AuthService, AuthService inject UsersService → error
@Injectable()
export class UsersService {
  constructor(private authService: AuthService) {} // circular!
}

// ✅ Fix: gunakan forwardRef atau pisah logic ke service ketiga
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}
}
```

### Knex — SQL Injection via knex.raw
```javascript
// ❌ Bug: SQL Injection!
const users = await knex.raw(`SELECT * FROM users WHERE name = '${name}'`);

// ✅ Fix: pakai binding
const users = await knex.raw('SELECT * FROM users WHERE name = ?', [name]);

// ✅ Lebih baik: pakai query builder
const users = await knex('users').where({ name });
```

### Knex — Transaction tidak di-rollback
```javascript
// ❌ Bug: jika insert kedua gagal, insert pertama tidak di-rollback
await knex('users').insert(userData);
await knex('profiles').insert(profileData); // error → data users orphan!

// ✅ Fix: pakai transaction
await knex.transaction(async (trx) => {
  await trx('users').insert(userData);
  await trx('profiles').insert(profileData);
  // auto commit jika berhasil, auto rollback jika throw
});
```

### Knex — N+1 Query
```javascript
// ❌ Bug: query per user → N+1
const users = await knex('users');
for (const user of users) {
  user.orders = await knex('orders').where({ user_id: user.id }); // N queries!
}

// ✅ Fix: join sekalian atau batch query
const users = await knex('users')
  .leftJoin('orders', 'users.id', 'orders.user_id')
  .select('users.*', 'orders.id as order_id', 'orders.total');
```

### Tipe Coercion
```javascript
// ❌ Bug: '5' == 5 → true
if (userId == '5') { ... }

// ✅ Fix: strict equality
if (userId === 5) { ... }
```

### Async tanpa await
```javascript
// ❌ Bug: tidak di-await, error tidak ter-catch
app.get('/users', (req, res) => {
  getUsers(); // Promise diabaikan
  res.json({ ok: true });
});

// ✅ Fix
app.get('/users', async (req, res, next) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});
```

### Object Mutation
```javascript
// ❌ Bug: mutasi state langsung di React
const [user, setUser] = useState({ name: 'Arief', age: 30 });
user.age = 31; // tidak trigger re-render

// ✅ Fix
setUser(prev => ({ ...prev, age: 31 }));
```

### Null/Undefined
```javascript
// ❌ Bug: TypeError jika user null
const name = user.profile.name;

// ✅ Fix: optional chaining
const name = user?.profile?.name ?? 'Unknown';
```

---

## Test Patterns — NestJS (Jest)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('POST /auth/login', () => {
    it('should return access token ketika credentials valid', async () => {
      const dto = { email: 'test@test.com', password: 'pass123' };
      authService.login.mockResolvedValueOnce({ accessToken: 'jwt_token' });

      const result = await controller.login(dto);

      expect(result).toEqual({ accessToken: 'jwt_token' });
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException ketika credentials salah', async () => {
      authService.login.mockRejectedValueOnce(new UnauthorizedException());
      await expect(controller.login({ email: 'x', password: 'y' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});

// Integration test dengan database (Knex)
describe('UsersService (integration)', () => {
  let knex: Knex;

  beforeAll(async () => {
    knex = Knex({ client: 'sqlite3', connection: ':memory:', useNullAsDefault: true });
    await knex.migrate.latest(); // jalankan migration
    await knex.seed.run();       // isi seed data
  });

  afterAll(() => knex.destroy());

  it('should create user dan return dengan id', async () => {
    const [id] = await knex('users').insert({
      name: 'Test User',
      email: 'test@test.com',
      password_hash: 'hashed',
    }).returning('id');

    expect(id).toBeDefined();

    const user = await knex('users').where({ id }).first();
    expect(user.email).toBe('test@test.com');
  });
});
```

---

## Test Patterns — Jest (Express + Knex)

```javascript
// Unit test controller
import { login } from '../controllers/authController';
import * as db from '../config/database';

jest.mock('../config/database');

describe('authController.login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return token when credentials valid', async () => {
    const mockUser = { ID: 1, EMAIL: 'test@test.com', PASSWORD_HASH: await bcrypt.hash('pass123', 10) };
    db.execute.mockResolvedValueOnce({ rows: [mockUser] });

    const req = { body: { email: 'test@test.com', password: 'pass123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await login(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ accessToken: expect.any(String) }),
    }));
  });

  it('should return 401 when user not found', async () => {
    db.execute.mockResolvedValueOnce({ rows: [] });

    const req = { body: { email: 'notfound@test.com', password: 'pass' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 when password wrong', async () => {
    const mockUser = { ID: 1, EMAIL: 'test@test.com', PASSWORD_HASH: await bcrypt.hash('correct', 10) };
    db.execute.mockResolvedValueOnce({ rows: [mockUser] });

    const req = { body: { email: 'test@test.com', password: 'wrong' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

---

## Security Checklist JS/TS

### Express
- [ ] `helmet()` dipasang di Express
- [ ] Input di-sanitize sebelum masuk ke query (parameterized query, bukan string concat)
- [ ] JWT secret minimal 32 karakter, disimpan di env
- [ ] Password di-hash dengan bcrypt (min saltRounds: 12)
- [ ] Tidak ada sensitive data di response (password_hash, internal IDs, dll)
- [ ] `console.log` tidak mengandung data sensitif
- [ ] Dependencies di-audit: `npm audit`
- [ ] `.env` ada di `.gitignore`
- [ ] Cookie httpOnly: true, secure: true, sameSite: 'strict'
- [ ] File upload: validasi tipe & ukuran file, simpan di luar webroot

### NestJS
- [ ] `ValidationPipe` global dengan `whitelist: true` aktif
- [ ] `@UseGuards(JwtAuthGuard)` ada di semua endpoint yang butuh auth
- [ ] `ThrottlerModule` dipasang untuk rate limiting
- [ ] Helmet dipakai via `app.use(helmet())`
- [ ] Secret di `ConfigModule` dengan `validationSchema` (Joi) — env yang wajib divalidasi saat startup
- [ ] `@Exclude()` dari `class-transformer` dipakai di field sensitif (password) pada response entity
- [ ] CORS dikonfigurasi spesifik origin, bukan `true`

### Knex
- [ ] Selalu gunakan query builder atau binding `?` — jangan `knex.raw()` dengan string interpolation
- [ ] Credential DB di environment variable, bukan hardcode di `knexfile.js`
- [ ] `knexfile.js` tidak di-commit dengan credential production
- [ ] SSL connection diaktifkan untuk production (`ssl: { rejectUnauthorized: true }`)
- [ ] Migration di-version control dan tidak boleh diedit setelah dijalankan di production

---

## Checklist Export — Excel (exceljs) & PDF (puppeteer)

### Excel (exceljs)
- [ ] Pakai `exceljs` bukan `xlsx` — exceljs support styling, merge cell, freeze pane
- [ ] Browser instance puppeteer di-reuse (singleton), bukan di-launch tiap request
- [ ] Judul laporan pakai merge cell di baris pertama
- [ ] Header row punya background color dan font bold
- [ ] Freeze pane aktif agar header tetap terlihat saat scroll (`sheet.views`)
- [ ] Auto filter aktif di header row (`sheet.autoFilter`)
- [ ] Alternating row color untuk readability
- [ ] Lebar kolom (`width`) didefinisikan eksplisit — jangan biarkan default
- [ ] Kolom numerik punya format angka (`numFmt: '#,##0.00'`)
- [ ] Response header set dengan benar: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- [ ] Filename include timestamp agar tidak overwrite: `laporan-${Date.now()}.xlsx`
- [ ] `workbook.creator` dan `workbook.created` diset untuk metadata

### PDF (puppeteer)
- [ ] Browser instance puppeteer di-reuse (singleton via `OnModuleDestroy`) — jangan launch baru tiap request
- [ ] `args: ['--no-sandbox', '--disable-setuid-sandbox']` diset untuk Docker/Linux
- [ ] HTML template dipisah ke file `templates/*.html` — jangan hardcode di service
- [ ] `printBackground: true` diset agar background CSS ter-render
- [ ] Margin halaman dikonfigurasi (`top`, `bottom`, `left`, `right`)
- [ ] `waitUntil: 'networkidle0'` dipakai agar konten fully loaded sebelum di-render
- [ ] `page.close()` dipanggil setelah generate — tutup page, bukan browser
- [ ] Response header set dengan benar: `Content-Type: application/pdf`
- [ ] Template pakai placeholder `{{key}}` yang di-replace dengan data, bukan string concat
- [ ] CSS di-embed di dalam `<style>` tag — jangan load dari URL eksternal (bisa timeout)

### Bug Patterns Export

```typescript
// ❌ Bug: launch browser baru tiap request → sangat lambat & memory leak
async generatePdf(data: any) {
  const browser = await puppeteer.launch(); // launch tiap request!
  const page = await browser.newPage();
  // ...
  await browser.close();
}

// ✅ Fix: singleton browser di service
@Injectable()
export class PdfService implements OnModuleDestroy {
  private browser: Browser | null = null;

  private async getBrowser() {
    if (!this.browser) this.browser = await puppeteer.launch({ ... });
    return this.browser;
  }

  async onModuleDestroy() {
    await this.browser?.close();
  }
}

// ❌ Bug: Excel tanpa set Content-Disposition → file dibuka di browser, tidak di-download
res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

// ✅ Fix: tambah Content-Disposition
res.set({
  'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'Content-Disposition': 'attachment; filename="laporan.xlsx"',
  'Content-Length': buffer.length,
});

// ❌ Bug: ROWNUM/LIMIT tidak ada → export semua data, bisa OOM untuk data jutaan baris
const data = await this.knex('orders').select('*');

// ✅ Fix: stream atau batch untuk data besar
const BATCH_SIZE = 1000;
let offset = 0;
while (true) {
  const batch = await this.knex('orders').limit(BATCH_SIZE).offset(offset);
  if (batch.length === 0) break;
  sheet.addRows(batch);
  offset += BATCH_SIZE;
}
```
