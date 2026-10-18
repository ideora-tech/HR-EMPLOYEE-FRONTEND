import { useCallback, useMemo } from 'react'
import useCurrentSession from './useCurrentSession'

/**
 * Izin pengguna yang login (dari GET /auth/me, disimpan di sesi). Dipakai untuk menyembunyikan
 * tombol/aksi; backend tetap menolak aksi tanpa izin, jadi ini murni kenyamanan tampilan.
 */
const useIzin = () => {
    const { session } = useCurrentSession()
    const izin = useMemo(() => new Set(session.user?.izin ?? []), [session.user?.izin])
    const superAdmin = !!session.user?.superAdmin

    /** Benar bila punya SALAH SATU kode izin yang disebut. */
    const punya = useCallback((...kodeIzin: string[]) => kodeIzin.some((k) => izin.has(k)), [izin])

    return {
        punya,
        superAdmin,
        isOwner: !!session.user?.isOwner,
    }
}

export default useIzin
