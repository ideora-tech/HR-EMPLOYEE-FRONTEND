/**
 * Profil sesi dari backend (GET /auth/me): daftar izin & peran pengguna yang login.
 * Dipanggil di sisi server (authorize & callback jwt NextAuth). Gagal → null, supaya sesi
 * tetap jalan dengan izin terakhir yang diketahui; backend tetap memeriksa izin di setiap request.
 */
export interface ProfilSesi {
    izin: string[]
    namaPeran: string | null
    superAdmin: boolean
    isOwner: boolean
}

interface ProfilSesiResponse {
    success: boolean
    data: {
        super_admin: boolean
        is_owner: boolean
        izin: string[]
        peran: { nama_peran: string; is_sistem: number }[]
    }
}

export const fetchProfilSesi = async (accessToken: string): Promise<ProfilSesi | null> => {
    try {
        const response = await fetch(`${process.env.BACKEND_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
            cache: 'no-store',
        })
        if (!response.ok) return null
        const body: ProfilSesiResponse = await response.json()
        if (!body.success) return null
        const { data } = body
        return {
            izin: data.izin,
            namaPeran: data.super_admin
                ? 'Super Administrator'
                : data.peran.map((p) => p.nama_peran).join(', ') || null,
            superAdmin: data.super_admin,
            isOwner: data.is_owner,
        }
    } catch {
        return null
    }
}
