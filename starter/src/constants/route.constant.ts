export const ROOT = '/'

export const ROUTES = {
    HOME: '/home',
    PAKET: '/paket',
    PAKET_CREATE: '/paket/create',
    PAKET_DETAIL: (id: number) => `/paket/${id}`,
    MODUL: '/modul',
    AKSES_MODUL: '/akses-modul',
    MENU: '/menu',
    MENU_MODUL: '/menu-modul',
    PERAN: '/peran',
    PENGGUNA: '/pengguna',
    IZIN_PERAN: '/izin-peran',
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
    FORGOT_PASSWORD: '/forgot-password',
} as const