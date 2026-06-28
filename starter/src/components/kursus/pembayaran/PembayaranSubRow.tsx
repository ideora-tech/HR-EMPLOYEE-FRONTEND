'use client'

import { HiOutlineDocumentDownload, HiOutlineEye } from 'react-icons/hi'
import { Tooltip } from '@/components/ui'
import { formatRupiah } from '@/utils/formatNumber'
import type { IPembayaran } from '@/@types/kursus.types'

const STATUS_KONFIRMASI: Record<number, { label: string; cls: string }> = {
    0: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
    1: { label: 'Dikonfirmasi', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
    2: { label: 'Ditolak', cls: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
}

const METODE_CLS: Record<string, string> = {
    TUNAI: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    TRANSFER: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    QRIS: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
}

interface PembayaranSubRowProps {
    pembayaran: IPembayaran
    namaTagihan?: string | null
    cetakLoading: boolean
    onView: () => void
    onCetak: () => void
}

const PembayaranSubRow = ({ pembayaran, namaTagihan, cetakLoading, onView, onCetak }: PembayaranSubRowProps) => {
    const st = STATUS_KONFIRMASI[pembayaran.status_konfirmasi]
    const tanggal = pembayaran.tanggal_bayar?.substring(0, 10) ?? '—'
    const kembalian = Number(pembayaran.kembalian ?? 0)

    return (
        <tr className="bg-gray-50/60 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50">
            <td className="py-2 pl-10 pr-2 text-gray-300 dark:text-gray-600 text-xs w-8">└</td>
            <td className="py-2 px-2 w-10"></td>
            {/* Tanggal + nama tagihan + referensi */}
            <td className="py-2 px-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">{tanggal}</p>
                {namaTagihan && (
                    <p className="text-xs text-gray-400 truncate max-w-xs">{namaTagihan}</p>
                )}
                {pembayaran.referensi && (
                    <p className="text-xs text-gray-400 truncate max-w-xs font-mono">{pembayaran.referensi}</p>
                )}
            </td>
            <td className="py-2 px-3 text-right">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${METODE_CLS[pembayaran.metode] ?? 'bg-gray-100 text-gray-600'}`}>
                    {pembayaran.metode}
                </span>
            </td>
            <td className="py-2 px-3 text-right text-sm">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(pembayaran.jumlah)}
                </span>
                {kembalian > 0 && (
                    <p className="text-xs font-medium text-emerald-500 dark:text-emerald-400 mt-0.5 whitespace-nowrap">
                        Kembalian: {formatRupiah(kembalian)}
                    </p>
                )}
            </td>
            {/* Sisa tidak berlaku untuk baris pembayaran */}
            <td className="py-2 px-3"></td>
            <td className="py-2 px-3">
                {st && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${st.cls}`}>{st.label}</span>
                )}
            </td>
            <td className="py-2 px-3 text-right">
                <div className="flex items-center justify-end gap-1">
                    {/* Lihat detail */}
                    <Tooltip title="Lihat Detail">
                        <span
                            className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                            onClick={onView}
                        >
                            <HiOutlineEye className="text-base" />
                        </span>
                    </Tooltip>
                    {/* Cetak bukti bayar */}
                    <Tooltip title="Cetak Bukti Bayar">
                        <span
                            className={`cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                                cetakLoading
                                    ? 'opacity-50 cursor-wait bg-gray-100 dark:bg-gray-700'
                                    : 'bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30'
                            }`}
                            onClick={() => !cetakLoading && onCetak()}
                        >
                            <HiOutlineDocumentDownload className="text-base" />
                        </span>
                    </Tooltip>
                </div>
            </td>
        </tr>
    )
}

export default PembayaranSubRow
