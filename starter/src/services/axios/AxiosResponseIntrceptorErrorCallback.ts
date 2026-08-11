import type { AxiosError } from 'axios'
import { signOut } from 'next-auth/react'
import appConfig from '@/configs/app.config'

// Cegah signOut dipanggil berkali-kali saat beberapa request 401 bersamaan
let isSigningOut = false

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
    const status = error.response?.status

    // 401 = token expired / session tidak valid → langsung ke halaman login.
    // Authorization di-inject server-side oleh /api/proxy, jadi 401 di sini
    // selalu berarti session memang sudah tidak valid.
    if (status === 401 && !isSigningOut) {
        isSigningOut = true
        signOut({ callbackUrl: appConfig.unAuthenticatedEntryPath })
    }

    return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback
