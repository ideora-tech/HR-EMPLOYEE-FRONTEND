import type { AxiosError } from 'axios'
import { signOut } from 'next-auth/react'
import appConfig from '@/configs/app.config'
import { getAccessToken } from './tokenManager'

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
    const status = error.response?.status

    if (status === 401) {
        // Hanya logout jika token memang sudah ada — hindari race condition saat
        // halaman baru mount dan TokenSync belum sempat sync token ke localStorage
        const token = getAccessToken()
        if (token) {
            signOut({ callbackUrl: appConfig.unAuthenticatedEntryPath })
        }
        return Promise.reject(error)
    }

    return Promise.reject(error)
}

export default AxiosResponseIntrceptorErrorCallback
