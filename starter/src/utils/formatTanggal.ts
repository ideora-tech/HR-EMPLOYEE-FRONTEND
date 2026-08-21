const BULAN = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

/**
 * Formats an API date for display, e.g. `24 Agu 2026`.
 *
 * A plain `YYYY-MM-DD` (a DATE column such as `tanggal` pertemuan) is read
 * literally — never through `new Date()` — so the day never shifts by timezone
 * and server and client render identically (no Next.js hydration mismatch).
 * A full ISO timestamp still converts to the viewer's local date.
 * Null, empty, or unparseable input yields an em dash.
 */
export function formatTanggal(value: string | null | undefined): string {
    if (!value) return '—'

    const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (ymd) {
        const bulan = BULAN[Number(ymd[2]) - 1]
        if (!bulan) return '—'
        return `${ymd[3]} ${bulan} ${ymd[1]}`
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '—'
    const hari = String(parsed.getDate()).padStart(2, '0')
    return `${hari} ${BULAN[parsed.getMonth()]} ${parsed.getFullYear()}`
}
