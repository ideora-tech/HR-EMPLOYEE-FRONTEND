import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const protectedRoutes: Routes = {
    '/home': {
        key: 'home',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
}

export const publicRoutes: Routes = {
    '/profil': {
        key: 'profil',
        authority: [],
    },
    // SEMENTARA — hapus bersama halaman zz-repro-kedip
    '/zz-repro-kedip': {
        key: 'zzReproKedip',
        authority: [],
    },
}

export const authRoutes = authRoute
