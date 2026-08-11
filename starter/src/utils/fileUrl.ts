/**
 * Ubah URL file upload dari backend menjadi URL yang lewat proxy Next.js.
 * Menangani path relatif baru (/uploads/...), URL absolut lama dengan host
 * yang salah, dan segment /upload_documents/ lama yang tidak pernah di-serve.
 */
export function toProxyFileUrl(url: string): string {
    if (url.startsWith('/')) {
        return `/api/proxy${url.replace('/upload_documents/', '/uploads/')}`
    }
    return url.replace(/^https?:\/\/[^/]+/, '/api/proxy')
}
