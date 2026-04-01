// Semua request ke /api/proxy/* akan di-handle oleh Route Handler Next.js
// yang membaca token dari sesi server-side (auth()) dan meneruskan ke backend.
const PROXY = '/proxy'

export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        REGISTER: `${PROXY}/auth/register`,
        LOGIN: `${PROXY}/auth/login`,
        LOGOUT: `${PROXY}/auth/logout`,
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
        ME: `${PROXY}/menu/me`,
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

    // Master Data
    MASTER_DATA: {
        ZONA_WAKTU: {
            BASE: `${PROXY}/zona-waktu`,
        },
        MATA_UANG: {
            BASE: `${PROXY}/mata-uang`,
        },
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
        FOTO: (id: string) => `${PROXY}/karyawan/${id}/foto`,
        LOKASI: (id: string) => `${PROXY}/karyawan/${id}/lokasi`,
        TEMPLATE_EXCEL: `${PROXY}/karyawan/template/excel`,
        UPLOAD_EXCEL: `${PROXY}/karyawan/upload/excel`,
    },

    // Karyawan Exit (Offboarding)
    KARYAWAN_EXIT: {
        BASE: `${PROXY}/karyawan-exit`,
        BY_ID: (id: string) => `${PROXY}/karyawan-exit/${id}`,
        BY_KARYAWAN: (id: string) => `${PROXY}/karyawan-exit/karyawan/${id}`,
    },

    // Kursus Dansa
    KURSUS: {
        DASHBOARD: {
            BASE: `${PROXY}/kursus/dashboard`,
        },
        KELAS: {
            BASE: `${PROXY}/kursus/kelas`,
            BY_ID: (id: string) => `${PROXY}/kursus/kelas/${id}`,
        },
        PAKET: {
            BASE: `${PROXY}/kursus/paket`,
            BY_ID: (id: string) => `${PROXY}/kursus/paket/${id}`,
            BY_KELAS: (idKelas: string) => `${PROXY}/kursus/paket/kelas/${idKelas}`,
        },
        KATEGORI_UMUR: {
            BASE: `${PROXY}/kursus/kategori-umur`,
            BY_ID: (id: string) => `${PROXY}/kursus/kategori-umur/${id}`,
            BY_KELAS: (idKelas: string) => `${PROXY}/kursus/kategori-umur/kelas/${idKelas}`,
            BY_PAKET: (idPaket: string) => `${PROXY}/kursus/kategori-umur/paket/${idPaket}`,
        },
        BIAYA: {
            BASE: `${PROXY}/kursus/biaya`,
            BY_ID: (id: string) => `${PROXY}/kursus/biaya/${id}`,
            BY_KELAS: (idKelas: string) => `${PROXY}/kursus/biaya/kelas/${idKelas}`,
            BY_PAKET: (idPaket: string) => `${PROXY}/kursus/biaya/paket/${idPaket}`,
            BY_KATEGORI_UMUR: (idKategori: string) =>
                `${PROXY}/kursus/biaya/kategori-umur/${idKategori}`,
        },
        DISKON: {
            BASE: `${PROXY}/kursus/diskon`,
            BY_ID: (id: string) => `${PROXY}/kursus/diskon/${id}`,
            AKTIF: `${PROXY}/kursus/diskon/aktif`,
        },
        JADWAL: {
            BASE: `${PROXY}/kursus/jadwal-kelas`,
            BY_ID: (id: string) => `${PROXY}/kursus/jadwal-kelas/${id}`,
            BY_KELAS: (idKelas: string) => `${PROXY}/kursus/jadwal-kelas/kelas/${idKelas}`,
            EXPORT_EXCEL: `${PROXY}/kursus/jadwal-kelas/export/excel`,
        },
        SISWA: {
            BASE: `${PROXY}/kursus/siswa`,
            BY_ID: (id: string) => `${PROXY}/kursus/siswa/${id}`,
            TUNGGAKAN: `${PROXY}/kursus/siswa/tunggakan`,
            IMPORT: `${PROXY}/kursus/siswa/upload/excel`,
            TEMPLATE: `${PROXY}/kursus/siswa/template/excel`,
        },
        TAGIHAN: {
            BASE: `${PROXY}/kursus/tagihan`,
            BY_ID: (id: string) => `${PROXY}/kursus/tagihan/${id}`,
            BY_SISWA: (idSiswa: string) => `${PROXY}/kursus/tagihan/siswa/${idSiswa}`,
        },
        PEMBAYARAN: {
            BASE: `${PROXY}/kursus/pembayaran`,
            BY_ID: (id: string) => `${PROXY}/kursus/pembayaran/${id}`,
            BY_TAGIHAN: (idTagihan: string) => `${PROXY}/kursus/pembayaran/tagihan/${idTagihan}`,
        },
    },

    // Struktur Organisasi
    ORGANISASI: {
        DEPARTEMEN: {
            BASE: `${PROXY}/organisasi/departemen`,
            BY_ID: (id: string) => `${PROXY}/organisasi/departemen/${id}`,
            TREE: `${PROXY}/organisasi/departemen/tree`,
        },
        JABATAN: {
            BASE: `${PROXY}/organisasi/jabatan`,
            BY_ID: (id: string) => `${PROXY}/organisasi/jabatan/${id}`,
            BY_DEPARTEMEN: (id: string) => `${PROXY}/organisasi/jabatan/departemen/${id}`,
        },
        LOKASI_KANTOR: {
            BASE: `${PROXY}/organisasi/lokasi-kantor`,
            BY_ID: (id: string) => `${PROXY}/organisasi/lokasi-kantor/${id}`,
        },
        STRUKTUR: `${PROXY}/organisasi/struktur`,
    },
} as const
