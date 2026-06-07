'use client'

import { useRouter } from 'next/navigation'
import { HiChevronRight, HiChevronDown, HiOutlineCreditCard, HiOutlineTrash, HiOutlineDocumentDownload } from 'react-icons/hi'
import { Spinner, Tooltip } from '@/components/ui'
import { formatRupiah } from '@/utils/formatNumber'
import { ROUTES } from '@/constants/route.constant'
import PembayaranSubRow from './PembayaranSubRow'
import type { ITagihan, IPembayaran } from '@/@types/kursus.types'

const TAGIHAN_STATUS: Record<number, { label: string; cls: string }> = {
    1: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
    2: { label: 'Sebagian', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' },
    3: { label: 'Lunas', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
    4: { label: 'Dibatalkan', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
}

interface TagihanGroupRowProps {
    tagihan: ITagihan
    index: number
    expanded: boolean
    loadingExpand: boolean
    pembayaran: IPembayaran[]
    pdfLoadingId: string | null
    cetakLoadingId: string | null
    onToggle: () => void
    onDownloadPdf: (p: IPembayaran) => void
    onDelete: (tagihan: ITagihan) => void
    onCetak: (tagihan: ITagihan) => void
}

const TagihanGroupRow = ({
    tagihan,
    index,
    expanded,
    loadingExpand,
    pembayaran,
    pdfLoadingId,
    cetakLoadingId,
    onToggle,
    onDownloadPdf,
    onDelete,
    onCetak,
}: TagihanGroupRowProps) => {
    const router = useRouter()
    const st = TAGIHAN_STATUS[tagihan.status]
    const sisa = tagihan.total_harga - tagihan.total_bayar
    const subtitle = tagihan.nomor_kwitansi ?? tagihan.nama_tagihan ?? tagihan.nama_biaya ?? tagihan.periode_label ?? tagihan.dibuat_pada?.substring(0, 10) ?? '—'
    const canBayar = tagihan.status === 1 || tagihan.status === 2

    return (
        <>
            <tr
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 cursor-pointer"
                onClick={onToggle}
            >
                {/* expand toggle */}
                <td className="py-3 pl-3 pr-1 w-8">
                    <span className="text-gray-400 inline-flex">
                        {loadingExpand
                            ? <Spinner size={14} />
                            : expanded
                                ? <HiChevronDown className="text-base" />
                                : <HiChevronRight className="text-base" />
                        }
                    </span>
                </td>
                {/* no */}
                <td className="py-3 px-2 text-gray-400 text-sm w-10">{index}</td>
                {/* siswa + tagihan */}
                <td className="py-3 px-3">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{tagihan.nama_siswa}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{subtitle}</p>
                </td>
                {/* total */}
                <td className="py-3 px-3 text-right text-sm font-medium text-gray-700 dark:text-gray-200">
                    {formatRupiah(tagihan.total_harga)}
                </td>
                {/* terbayar */}
                <td className="py-3 px-3 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(tagihan.total_bayar)}
                </td>
                {/* sisa */}
                <td className="py-3 px-3 text-right text-sm font-semibold">
                    <span className={sisa > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}>
                        {sisa > 0 ? formatRupiah(sisa) : '—'}
                    </span>
                </td>
                {/* status */}
                <td className="py-3 px-3">
                    {st && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${st.cls}`}>{st.label}</span>
                    )}
                </td>
                {/* aksi */}
                <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                        {/* Download Invoice */}
                        <Tooltip title="Download Invoice">
                            <span
                                className={`cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                                    cetakLoadingId === tagihan.id_tagihan
                                        ? 'opacity-50 cursor-wait bg-gray-100 dark:bg-gray-700'
                                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-500/20 dark:text-purple-300 dark:hover:bg-purple-500/30'
                                }`}
                                onClick={() => cetakLoadingId !== tagihan.id_tagihan && onCetak(tagihan)}
                            >
                                <HiOutlineDocumentDownload className="text-lg" />
                            </span>
                        </Tooltip>

                        {/* Catat Pembayaran */}
                        {canBayar && (
                            <Tooltip title="Catat Pembayaran">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                    onClick={() => router.push(`${ROUTES.KURSUS_TAGIHAN_CATAT_PEMBAYARAN}?id=${tagihan.id_tagihan}`)}
                                >
                                    <HiOutlineCreditCard className="text-lg" />
                                </span>
                            </Tooltip>
                        )}

                        {/* Hapus */}
                        <Tooltip title="Hapus Tagihan">
                            <span
                                className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-colors"
                                onClick={() => onDelete(tagihan)}
                            >
                                <HiOutlineTrash className="text-lg" />
                            </span>
                        </Tooltip>
                    </div>
                </td>
            </tr>

            {/* empty state after expand */}
            {expanded && !loadingExpand && pembayaran.length === 0 && (
                <tr className="bg-gray-50/60 dark:bg-gray-700/20 border-b border-gray-100 dark:border-gray-700/50">
                    <td colSpan={8} className="py-3 pl-10 text-xs text-gray-400 italic">
                        Belum ada pembayaran tercatat
                    </td>
                </tr>
            )}

            {/* sub-rows */}
            {expanded && !loadingExpand && pembayaran.map((p) => (
                <PembayaranSubRow
                    key={p.id_pembayaran}
                    pembayaran={p}
                    namaTagihan={tagihan.nama_tagihan ?? tagihan.nama_biaya ?? null}
                    pdfLoading={pdfLoadingId === p.id_pembayaran}
                    onDownloadPdf={() => onDownloadPdf(p)}
                />
            ))}
        </>
    )
}

export default TagihanGroupRow
