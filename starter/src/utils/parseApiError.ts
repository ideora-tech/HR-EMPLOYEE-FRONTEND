import type { AxiosError } from 'axios'

/**
 * Ambil pesan error dari response backend (NestJS).
 * Backend mengembalikan: { statusCode, message, error? }
 * message bisa string atau string[] (dari ValidationPipe).
 */
export function parseApiError(error: unknown): string {
    const axiosError = error as AxiosError<{
        message?: string | string[]
        error?: string
        statusCode?: number
    }>

    const data = axiosError?.response?.data
    const status = axiosError?.response?.status

    if (data?.message) {
        return Array.isArray(data.message)
            ? data.message.join(', ')
            : String(data.message)
    }

    if (status === 401) return 'Sesi habis atau tidak memiliki akses'
    if (status === 403) return 'Anda tidak punya akses ke fitur ini'
    if (status === 404) return 'Data tidak ditemukan'
    if (status === 409) return 'Data sudah ada / terjadi konflik'
    if (status === 422) return 'Data tidak valid'
    if (status === 500) return 'Terjadi kesalahan server'

    return 'Terjadi kesalahan yang tidak diketahui'
}
