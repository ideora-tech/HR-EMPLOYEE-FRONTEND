// ─── Akses Modul Tier Types ───────────────────────────────────────────────────
// Konfigurasi modul apa yang aktif di tiap paket.
// Data di-seed otomatis — admin hanya bisa UPDATE (tidak ada create/delete).

export interface IAksesModulTier {
    id_akses_modul: string
    kode_modul: string
    paket: string
    aktif: number                        // MySQL int: 0 | 1
    batasan: Record<string, number> | null
    dibuat_pada: string
    diubah_pada: string | null
}

export interface IAksesModulUpdate {
    aktif?: number
    batasan?: Record<string, number> | null
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    timestamp: string
}
