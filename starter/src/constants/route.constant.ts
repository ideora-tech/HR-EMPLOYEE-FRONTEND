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
    PERUSAHAAN: '/perusahaan',
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
    FORGOT_PASSWORD: '/forgot-password',

    // Karyawan
    KARYAWAN: '/karyawan',

    // Kursus
    KURSUS_SISWA: '/kursus/siswa',
    KURSUS_PROGRAM: '/kursus/program-pengajaran',
    KURSUS_TARIF: '/kursus/tarif',
    KURSUS_JADWAL: '/kursus/jadwal-kelas',
    KURSUS_DAFTAR: '/kursus/daftar-kelas',
} as const