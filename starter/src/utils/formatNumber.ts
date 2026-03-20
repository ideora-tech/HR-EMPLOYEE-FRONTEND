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
