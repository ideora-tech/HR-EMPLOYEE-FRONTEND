// Semua request ke /api/proxy/* akan di-handle oleh Route Handler Next.js
// yang membaca token dari sesi server-side (auth()) dan meneruskan ke backend.
const PROXY = '/proxy'

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        SIGN_IN: `${PROXY}/auth/sign-in`,
        SIGN_OUT: `${PROXY}/auth/sign-out`,
        REFRESH: `${PROXY}/auth/refresh`,
        ME: `${PROXY}/auth/me`,
    },

    // Paket (Pricing)
    PAKET: {
        BASE: `${PROXY}/paket`,
        BY_ID: (id: string) => `${PROXY}/paket/${id}`,
    },

    // Modul (Fitur Aplikasi)
    MODUL: {
        BASE: `${PROXY}/modul`,
        BY_ID: (id: string) => `${PROXY}/modul/${id}`,
        MENU_LIST: (kode: string) => `${PROXY}/modul/${kode}/menu`,
        MENU_ITEM: (kode: string, id_menu: string) =>
            `${PROXY}/modul/${kode}/menu/${id_menu}`,
    },

    // Menu (Navigasi Aplikasi)
    MENU: {
        BASE: `${PROXY}/menu`,
        BY_ID: (id: string) => `${PROXY}/menu/${id}`,
    },

    // Peran (Role Pengguna)
    PERAN: {
        BASE: `${PROXY}/peran`,
        BY_ID: (id: string) => `${PROXY}/peran/${id}`,
    },

    // Perusahaan (Company Management)
    PERUSAHAAN: {
        BASE: `${PROXY}/perusahaan`,
        BY_ID: (id: string) => `${PROXY}/perusahaan/${id}`,
        OVERVIEW: (id: string) => `${PROXY}/perusahaan/${id}/overview`,
    },

    // Izin Peran (Permission Matrix)
    IZIN_PERAN: {
        BY_PERAN: (kode: string) => `${PROXY}/izin-peran/peran/${kode}`,
        BY_PERAN_MENU: (kode: string, id_menu: string) =>
            `${PROXY}/izin-peran/peran/${kode}/menu/${id_menu}`,
        BULK: (kode: string) => `${PROXY}/izin-peran/peran/${kode}/bulk`,
    },

    // Pengguna (User Management)
    PENGGUNA: {
        BASE: `${PROXY}/pengguna`,
        BY_ID: (id: string) => `${PROXY}/pengguna/${id}`,
    },

    // Akses Modul Tier (Konfigurasi Paket × Modul)
    AKSES_MODUL_TIER: {
        BASE: `${PROXY}/akses-modul-tier`,
        BY_PAKET: (paket: string) =>
            `${PROXY}/akses-modul-tier/paket/${paket}`,
        BY_PAKET_MODUL: (paket: string, kode_modul: string) =>
            `${PROXY}/akses-modul-tier/paket/${paket}/modul/${kode_modul}`,
    },

    // Karyawan (Employee Management)
    KARYAWAN: {
        BASE: `${PROXY}/karyawan`,
        BY_ID: (id: string) => `${PROXY}/karyawan/${id}`,
        TEMPLATE_EXCEL: `${PROXY}/karyawan/template/excel`,
        UPLOAD_EXCEL: `${PROXY}/karyawan/upload/excel`,
    },

    // Kursus Dansa
    KURSUS: {
        TINGKAT: {
            BASE: `${PROXY}/kursus/tingkat-program`,
            BY_ID: (id: string) => `${PROXY}/kursus/tingkat-program/${id}`,
        },
        SISWA: {
            BASE: `${PROXY}/kursus/siswa`,
            BY_ID: (id: string) => `${PROXY}/kursus/siswa/${id}`,
            IMPORT: `${PROXY}/kursus/siswa/upload/excel`,
            TEMPLATE: `${PROXY}/kursus/siswa/template/excel`,
        },
        PROGRAM: {
            BASE: `${PROXY}/kursus/program-pengajaran`,
            BY_ID: (id: string) => `${PROXY}/kursus/program-pengajaran/${id}`,
        },
        TARIF: {
            BASE: `${PROXY}/kursus/tarif`,
            BY_ID: (id: string) => `${PROXY}/kursus/tarif/${id}`,
            BY_PROGRAM: (idProgram: string) =>
                `${PROXY}/kursus/tarif/program/${idProgram}`,
        },
        JADWAL: {
            BASE: `${PROXY}/kursus/jadwal-kelas`,
            BY_ID: (id: string) => `${PROXY}/kursus/jadwal-kelas/${id}`,
            KUOTA: (id: string) => `${PROXY}/kursus/jadwal-kelas/${id}/kuota`,
            EXPORT: (weekStart: string, weekEnd: string) =>
                `${PROXY}/kursus/jadwal-kelas/export?week_start=${weekStart}&week_end=${weekEnd}`,
        },
        DAFTAR: {
            BASE: `${PROXY}/kursus/daftar-kelas`,
            BY_ID: (id: string) => `${PROXY}/kursus/daftar-kelas/${id}`,
            BY_SISWA: (idSiswa: string) =>
                `${PROXY}/kursus/daftar-kelas/siswa/${idSiswa}`,
            BY_JADWAL: (idJadwal: string) =>
                `${PROXY}/kursus/daftar-kelas/jadwal/${idJadwal}`,
        },
        PRESENSI: {
            BASE: `${PROXY}/kursus/presensi`,
            BY_ID: (id: string) => `${PROXY}/kursus/presensi/${id}`,
            BY_JADWAL: (idJadwal: string) => `${PROXY}/kursus/presensi/jadwal/${idJadwal}`,
            BATCH: `${PROXY}/kursus/presensi/batch`,
        },
    },
} as const
