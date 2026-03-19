export const ROOT = '/'

export const ROUTES = {
    HOME: '/home',
    PAKET: '/paket',
    PAKET_CREATE: '/paket/create',
    PAKET_DETAIL: (id: number) => `/paket/${id}`,
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
    FORGOT_PASSWORD: '/forgot-password',
} as const