/**
 * Format angka dengan pemisah ribuan titik (format Indonesia).
 * Contoh: 1500000 → "1.500.000"
 */
export const formatNum = (value: number | string): string =>
    Number(value).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/**
 * Format angka sebagai Rupiah tanpa desimal.
 * Contoh: 150000 → "Rp 150.000"
 */
export const formatRupiah = (value: number | string): string =>
    'Rp ' + formatNum(value)

/**
 * Format input Rupiah saat user mengetik — strip non-digit lalu formatNum.
 * Return '' jika tidak ada digit (supaya placeholder tetap tampil).
 * Contoh: "1.500abc" → "1.500", "" → ""
 */
export const formatRupiahInput = (raw: string): string => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return ''
    return formatNum(Number(digits))
}

/**
 * Parse string Rupiah yang sudah diformat kembali ke number.
 * Contoh: "1.500.000" → 1500000, "" → 0
 */
export const parseRupiah = (formatted: string): number =>
    Number(formatted.replace(/\./g, '')) || 0
