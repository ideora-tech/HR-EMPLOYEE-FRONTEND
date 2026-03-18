# Logging Guide — NestJS Backend

Panduan lengkap implementasi logging di NestJS agar setiap error, warning, dan activity
penting bisa dimonitor dengan mudah.

> **Library**: `winston` + `nest-winston` — lebih powerful dari Logger bawaan NestJS
> **Konsep**: Log tersimpan di file (rotating daily) + tampil di console dengan warna

---

## Struktur Folder Logging

```
src/
├── common/
│   ├── interceptors/
│   │   └── logging.interceptor.ts     ← Log setiap HTTP request/response
│   ├── filters/
│   │   └── http-exception.filter.ts   ← Log setiap error/exception
│   └── logger/
│       ├── winston.config.ts          ← Konfigurasi Winston (format, transport)
│       └── app-logger.service.ts      ← Custom logger service (inject ke mana saja)
│
logs/                                  ← Folder output log (auto-created)
├── app-2024-01-01.log                 ← Log harian semua level
├── error-2024-01-01.log               ← Log khusus error saja
└── exceptions-2024-01-01.log          ← Uncaught exception
```

---

## Install Dependencies

```bash
npm install winston nest-winston winston-daily-rotate-file
```

---

## `src/common/logger/winston.config.ts`

```typescript
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// ── Format log untuk console (berwarna, mudah dibaca) ──
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, context, traceId, stack, ...meta }) => {
    const ctx = context ? `[${context}]` : '';
    const trace = traceId ? `[TraceID: ${traceId}]` : '';
    const extra = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    const stackTrace = stack ? `\n${stack}` : '';
    return `${timestamp} ${level} ${ctx} ${trace} ${message}${extra}${stackTrace}`;
  }),
);

// ── Format log untuk file (JSON, mudah di-parse) ──
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  winston.format.json(),
);

// ── Transport: file harian semua level ──
const dailyRotateAll = new (require('winston-daily-rotate-file'))({
  filename:     'logs/app-%DATE%.log',
  datePattern:  'YYYY-MM-DD',
  zippedArchive: true,         // arsip lama di-gzip
  maxSize:      '20m',         // max 20MB per file
  maxFiles:     '30d',         // simpan 30 hari
  format:       fileFormat,
  level:        'info',
});

// ── Transport: file khusus error ──
const dailyRotateError = new (require('winston-daily-rotate-file'))({
  filename:     'logs/error-%DATE%.log',
  datePattern:  'YYYY-MM-DD',
  zippedArchive: true,
  maxSize:      '20m',
  maxFiles:     '90d',         // error disimpan lebih lama (90 hari)
  format:       fileFormat,
  level:        'error',
});

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console hanya di non-production
    ...(process.env.NODE_ENV !== 'production'
      ? [new winston.transports.Console({ format: consoleFormat })]
      : []
    ),
    dailyRotateAll,
    dailyRotateError,
  ],
  // Tangkap uncaught exception & unhandled rejection
  exceptionHandlers: [
    new (require('winston-daily-rotate-file'))({
      filename:    'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles:    '30d',
      format:      fileFormat,
    }),
  ],
  rejectionHandlers: [
    new (require('winston-daily-rotate-file'))({
      filename:    'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles:    '30d',
      format:      fileFormat,
    }),
  ],
};
```

---

## `src/main.ts` — Pasang Winston ke NestJS

```typescript
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Ganti logger bawaan NestJS dengan Winston
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // ... setup lainnya (helmet, cors, pipes, dll)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

---

## `src/app.module.ts` — Import WinstonModule

```typescript
import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    // ... module lainnya
  ],
})
export class AppModule {}
```

---

## `src/common/logger/app-logger.service.ts`

```typescript
import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // ── Standard levels ──

  log(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: Record<string, any>) {
    this.logger.error(message, { context, stack: trace, ...meta });
  }

  warn(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.debug(message, { context, ...meta });
  }

  // ── Helper khusus ──

  // Log HTTP request masuk
  logRequest(method: string, url: string, userId?: number, traceId?: string) {
    this.logger.info(`→ ${method} ${url}`, {
      context: 'HTTP',
      traceId,
      userId,
    });
  }

  // Log HTTP response keluar
  logResponse(method: string, url: string, statusCode: number, duration: number, traceId?: string) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.logger[level](`← ${method} ${url} ${statusCode} (${duration}ms)`, {
      context: 'HTTP',
      traceId,
      statusCode,
      duration,
    });
  }

  // Log error dengan context lengkap
  logError(error: Error, context: string, meta?: Record<string, any>) {
    this.logger.error(error.message, {
      context,
      stack: error.stack,
      errorName: error.name,
      ...meta,
    });
  }

  // Log DB query (hanya development)
  logQuery(query: string, bindings: any[], duration: number) {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`DB Query (${duration}ms): ${query}`, {
        context: 'Database',
        bindings,
        duration,
      });
    }
  }

  // Generate trace ID untuk lacak 1 request end-to-end
  generateTraceId(): string {
    return uuidv4();
  }
}
```

---

## `src/common/interceptors/logging.interceptor.ts`

```typescript
import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { method, url, ip } = req;
    const userAgent = req.headers['user-agent'] || '';
    const userId = req.user?.sub;

    // Generate traceId unik per request — taruh di header dan request object
    const traceId = uuidv4();
    req.traceId = traceId;
    res.setHeader('X-Trace-Id', traceId); // kirim ke client untuk debugging

    const startTime = Date.now();

    this.logger.info(`→ ${method} ${url}`, {
      context: 'HTTP',
      traceId,
      userId,
      ip,
      userAgent,
    });

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        this.logger.info(`← ${method} ${url} ${statusCode} (${duration}ms)`, {
          context: 'HTTP',
          traceId,
          userId,
          statusCode,
          duration,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(`✗ ${method} ${url} FAILED (${duration}ms)`, {
          context: 'HTTP',
          traceId,
          userId,
          duration,
          errorMessage: error.message,
          stack: error.stack,
        });
        return throwError(() => error);
      }),
    );
  }
}
```

---

## `src/common/filters/http-exception.filter.ts`

```typescript
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx     = host.switchToHttp();
    const res     = ctx.getResponse<Response>();
    const req     = ctx.getRequest<Request & { traceId?: string; user?: any }>();

    const traceId = req.traceId;
    const userId  = req.user?.sub;

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : null;

    const message = typeof exceptionResponse === 'object'
      ? (exceptionResponse as any).message
      : exceptionResponse || 'Internal server error';

    // ── Pilih level log berdasarkan status code ──
    if (status >= 500) {
      // 5xx — error di server kita, WAJIB dilog sebagai error + stack trace
      this.logger.error(`[${status}] ${req.method} ${req.url} — ${message}`, {
        context:    'ExceptionFilter',
        traceId,
        userId,
        statusCode: status,
        stack:      exception instanceof Error ? exception.stack : undefined,
        body:       req.body,
        params:     req.params,
        query:      req.query,
      });
    } else if (status >= 400) {
      // 4xx — error dari client (validasi, not found, unauthorized) — log sebagai warn
      this.logger.warn(`[${status}] ${req.method} ${req.url} — ${message}`, {
        context:    'ExceptionFilter',
        traceId,
        userId,
        statusCode: status,
      });
    }

    res.status(status).json({
      success:    false,
      statusCode: status,
      message:    Array.isArray(message) ? message.join(', ') : message,
      traceId,                        // kirim ke frontend untuk debugging
      timestamp:  new Date().toISOString(),
      path:       req.url,
    });
  }
}
```

---

## Cara Pakai Logger di Service

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  // Pakai Logger bawaan NestJS — otomatis diteruskan ke Winston
  private readonly logger = new Logger(UsersService.name);

  async findById(id: number) {
    this.logger.log(`Mencari user dengan id: ${id}`);

    const user = await this.usersRepository.findById(id);

    if (!user) {
      this.logger.warn(`User #${id} tidak ditemukan`);
      throw new NotFoundException(`User #${id} tidak ditemukan`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    try {
      const user = await this.usersRepository.create(dto);
      this.logger.log(`User baru dibuat: ${user.id} (${user.email})`);
      return user;
    } catch (error) {
      // Log error dengan context lengkap
      this.logger.error(
        `Gagal membuat user: ${error.message}`,
        error.stack,
        // metadata tambahan untuk debugging
      );
      throw error; // re-throw agar filter tangkap
    }
  }
}
```

---

## Log Knex Query (Database)

```typescript
// src/database/database.module.ts
import Knex from 'knex';
import * as winston from 'winston';

useFactory: (config: ConfigService) => {
  const knex = Knex({ ... });

  // Log query lambat (> 1 detik) — production safe
  knex.on('query', (query) => {
    query.__startTime = Date.now();
  });

  knex.on('query-response', (response, query) => {
    const duration = Date.now() - query.__startTime;
    if (duration > 1000) {
      // Query lambat — log sebagai warning
      winston.warn(`Slow query (${duration}ms): ${query.sql}`, {
        context:  'Database',
        duration,
        bindings: query.bindings,
      });
    }
  });

  knex.on('query-error', (error, query) => {
    winston.error(`DB Query Error: ${error.message}`, {
      context:  'Database',
      sql:      query.sql,
      bindings: query.bindings,
      stack:    error.stack,
    });
  });

  return knex;
}
```

---

## Pasang di `main.ts` (lengkap)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Global interceptor — log semua request
  app.useGlobalInterceptors(
    new LoggingInterceptor(app.get(WINSTON_MODULE_PROVIDER)),
    new ResponseInterceptor(),
  );

  // Global filter — log semua error
  app.useGlobalFilters(
    new HttpExceptionFilter(app.get(WINSTON_MODULE_PROVIDER)),
  );

  await app.listen(process.env.PORT ?? 3000);
}
```

---

## Contoh Output Log

### Console (development) — berwarna
```
2024-01-15 10:23:45 info [HTTP] [TraceID: abc-123] → POST /api/v1/auth/login
2024-01-15 10:23:45 info [HTTP] [TraceID: abc-123] ← POST /api/v1/auth/login 200 (45ms)
2024-01-15 10:23:50 warn [HTTP] [TraceID: def-456] ← POST /api/v1/auth/login 401 (12ms)
2024-01-15 10:24:00 error [ExceptionFilter] [TraceID: ghi-789] [500] GET /api/v1/users FAILED
  Error: connect ECONNREFUSED 127.0.0.1:3306
    at ...stack trace...
```

### File JSON (production) — mudah di-parse
```json
{
  "level": "error",
  "message": "[500] GET /api/v1/users — Internal server error",
  "context": "ExceptionFilter",
  "traceId": "ghi-789-xxx",
  "userId": 42,
  "statusCode": 500,
  "stack": "Error: connect ECONNREFUSED...",
  "timestamp": "2024-01-15 10:24:00"
}
```

---

## Tambah ke `.env`

```env
# Logging
LOG_LEVEL=info          # debug | info | warn | error
LOG_DIR=logs            # folder output log
```

---

## Aturan Review Logging

| Deviasi | Severity | Saran |
|---------|----------|-------|
| Pakai `console.log` / `console.error` di production | HIGH | Ganti dengan `Logger` NestJS atau `AppLoggerService` |
| Error di-catch tapi tidak di-log sama sekali | HIGH | Tambah `this.logger.error()` sebelum re-throw |
| Stack trace tidak di-log saat error | HIGH | Sertakan `error.stack` di log error |
| Logger tidak di-inject Winston — pakai default NestJS Logger | MEDIUM | Setup `nest-winston` agar log masuk ke file |
| Log file tidak ada rotation — satu file terus membesar | HIGH | Pakai `winston-daily-rotate-file` |
| Sensitive data (password, token) masuk ke log | CRITICAL | Filter field sensitif sebelum log |
| `traceId` tidak ada — sulit lacak 1 request | MEDIUM | Tambah `traceId` di interceptor dan response |
| Query DB error tidak di-log | MEDIUM | Pasang event listener `knex.on('query-error')` |
| 4xx dan 5xx di-log dengan level yang sama | LOW | 4xx → warn, 5xx → error |
| Log folder di-commit ke git | MEDIUM | Tambah `logs/` ke `.gitignore` |
