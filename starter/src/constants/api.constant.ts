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
} as const
