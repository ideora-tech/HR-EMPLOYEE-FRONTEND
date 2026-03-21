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
} as const
