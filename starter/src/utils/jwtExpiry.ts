/**
 * Baca klaim `exp` dari sebuah JWT tanpa verifikasi signature.
 * Hanya memakai `atob` agar aman dijalankan di Edge runtime (middleware)
 * maupun Node.
 */
const getJwtExp = (token: string): number | null => {
    try {
        const payloadPart = token.split('.')[1]
        if (!payloadPart) return null
        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            '=',
        )
        const payload = JSON.parse(atob(padded)) as { exp?: unknown }
        return typeof payload.exp === 'number' ? payload.exp : null
    } catch {
        return null
    }
}

/**
 * True jika JWT backend sudah kedaluwarsa.
 * Token yang tidak bisa dibaca dianggap belum expired — biarkan backend
 * yang menolak (401) dan interceptor axios yang menangani redirect.
 */
export const isJwtExpired = (token: string): boolean => {
    const exp = getJwtExp(token)
    if (exp === null) return false
    return Date.now() >= exp * 1000
}
