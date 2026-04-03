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
    KURSUS_DASHBOARD: '/kursus/dashboard',
    KURSUS_KELAS: '/kursus/kelas',
    KURSUS_KATEGORI_UMUR_TAMBAH: '/kursus/kelas/kategori-umur/tambah',
    KURSUS_KATEGORI_UMUR_EDIT: (id: string) => `/kursus/kelas/kategori-umur/${id}/edit`,
    KURSUS_SISWA: '/kursus/siswa',
    KURSUS_SISWA_DAFTAR: '/kursus/siswa/daftar',
    KURSUS_SISWA_EDIT: (id: string) => `/kursus/siswa/${id}/edit`,
    KURSUS_PROGRAM: '/kursus/program-pengajaran',
    KURSUS_TARIF: '/kursus/tarif',
    KURSUS_JADWAL: '/kursus/jadwal-kelas',
    KURSUS_JADWAL_TAMBAH: '/kursus/jadwal-kelas/tambah',
    KURSUS_JADWAL_EDIT: (id: string) => `/kursus/jadwal-kelas/${id}/edit`,
    KURSUS_DAFTAR: '/kursus/daftar-kelas',
    KURSUS_PRESENSI: '/kursus/presensi',
    KURSUS_BIAYA: '/kursus/biaya',
    KURSUS_BIAYA_TAMBAH: '/kursus/biaya/tambah',
    KURSUS_BIAYA_EDIT: (id: string) => `/kursus/biaya/${id}/edit`,
    KURSUS_TAGIHAN: '/kursus/tagihan',
    KURSUS_TAGIHAN_CATAT_PEMBAYARAN: '/kursus/tagihan/catat-pembayaran',
    KURSUS_PEMBAYARAN: '/kursus/pembayaran',

    DEPARTEMEN: '/departemen',
    JABATAN: '/jabatan',
    LOKASI_KANTOR: '/lokasi-kantor',
} as const