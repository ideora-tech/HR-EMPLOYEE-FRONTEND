// ─── Generic CRUD Messages ────────────────────────────────────────────────────
// Gunakan fungsi ini untuk pesan yang butuh nama entitas dinamis.
// Contoh: MESSAGES.SUCCESS.CREATED('Karyawan') → 'Karyawan berhasil ditambahkan'

export const MESSAGES = {
    SUCCESS: {
        CREATED: (entity: string) => `${entity} berhasil ditambahkan`,
        UPDATED: (entity: string) => `${entity} berhasil diperbarui`,
        DELETED: (entity: string) => `${entity} berhasil dihapus`,
    },
    ERROR: {
        FETCH: (entity: string) => `Gagal memuat data ${entity}`,
        CREATE: (entity: string) => `Gagal menambah ${entity}`,
        UPDATE: (entity: string) => `Gagal memperbarui ${entity}`,
        DELETE: (entity: string) => `Gagal menghapus ${entity}`,
    },
} as const

// ─── Entity Names ─────────────────────────────────────────────────────────────
// Daftarkan nama entitas di sini agar konsisten di seluruh aplikasi.

export const ENTITY = {
    PAKET: 'Paket',
    MODUL: 'Modul',
    AKSES_MODUL: 'Akses Modul',
    MENU: 'Menu',
    PERAN: 'Peran',
    KARYAWAN: 'Karyawan',
    PERUSAHAAN: 'Perusahaan',
    PENGGUNA: 'Pengguna',
    MENU_MODUL: 'Menu Modul',
    SISWA: 'Siswa',
    TINGKAT_PROGRAM: 'Tingkat Program',
    PROGRAM_PENGAJARAN: 'Program Pengajaran',
    TARIF: 'Tarif',
    JADWAL_KELAS: 'Jadwal Kelas',
    DAFTAR_KELAS: 'Pendaftaran',
} as const
