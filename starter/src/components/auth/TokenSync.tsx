'use client'

import { useLayoutEffect } from 'react'
import { useSession } from 'next-auth/react'
import { setAccessToken } from '@/services/axios/tokenManager'

/**
 * Sync access_token dari NextAuth session ke localStorage.
 * Menggunakan useLayoutEffect agar token tersimpan SEBELUM useEffect manapun
 * (termasuk fetchPaket di halaman anak) sempat berjalan.
 */
const TokenSync = () => {
    const { data: session, status } = useSession()

    useLayoutEffect(() => {
        // Jangan hapus token saat session masih loading
        if (status === 'loading') return
        setAccessToken(session?.accessToken ?? null)
    }, [session?.accessToken, status])

    return null
}

export default TokenSync
