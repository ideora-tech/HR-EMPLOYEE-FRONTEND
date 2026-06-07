'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Tag, Spinner, Notification, toast } from '@/components/ui'
import { HiOutlineCreditCard, HiOutlineDownload } from 'react-icons/hi'
import TagihanService from '@/services/kursus/tagihan.service'
import { formatRupiah } from '@/utils/formatNumber'
import { ROUTES } from '@/constants/route.constant'
import type { ITagihan } from '@/@types/kursus.types'

const TAGIHAN_STATUS: Record<number, { label: string; cls: string }> = {
    1: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' },
    2: { label: 'Sebagian', cls: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' },
    3: { label: 'Lunas', cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' },
    4: { label: 'Dibatalkan', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
}

interface SiswaTagihanTableProps {
    data: ITagihan[]
    loading?: boolean
}

const SiswaTagihanTable = ({ data, loading = false }: SiswaTagihanTableProps) => {
    const router = useRouter()

    const sorted = useMemo(
        () => [...data].sort((a, b) => b.dibuat_pada.localeCompare(a.dibuat_pada)),
        [data],
    )

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner size={28} />
            </div>
        )
    }

    if (sorted.length === 0) {
        return (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada riwayat tagihan</p>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">No</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Tagihan</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paket</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dibayar</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sisa</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="py-2 px-3 w-20"></th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((item, i) => {
                        const st = TAGIHAN_STATUS[item.status] ?? TAGIHAN_STATUS[1]
                        const sisa = item.total_harga - item.total_bayar
                        const d0 = item.detail?.[0]
                        const judul = item.nama_tagihan ?? d0?.nama_biaya ?? '—'
                        const sub = d0?.nama_kelas
                        const paket = d0?.nama_paket

                        return (
                            <tr
                                key={item.id_tagihan}
                                className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                            >
                                <td className="py-3 px-3 text-gray-400">{i + 1}</td>
                                <td className="py-3 px-3">
                                    <p className="font-medium text-gray-800 dark:text-gray-100">{judul}</p>
                                    {sub && <p className="text-xs text-gray-400">{sub}</p>}
                                </td>
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                                    {paket ?? '-'}
                                </td>
                                <td className="py-3 px-3 text-right font-medium text-gray-700 dark:text-gray-200">
                                    {formatRupiah(item.total_harga)}
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                    {formatRupiah(item.total_bayar)}
                                </td>
                                <td className="py-3 px-3 text-right font-semibold">
                                    <span className={sisa > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}>
                                        {sisa > 0 ? formatRupiah(sisa) : '-'}
                                    </span>
                                </td>
                                <td className="py-3 px-3">
                                    <Tag className={`${st.cls} text-xs`}>{st.label}</Tag>
                                </td>
                                <td className="py-3 px-3">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {(item.status === 1 || item.status === 2) && (
                                            <span
                                                title="Catat Pembayaran"
                                                className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                                onClick={() =>
                                                    router.push(
                                                        `${ROUTES.KURSUS_TAGIHAN_CATAT_PEMBAYARAN}?id=${item.id_tagihan}`,
                                                    )
                                                }
                                            >
                                                <HiOutlineCreditCard className="text-lg" />
                                            </span>
                                        )}
                                        <span
                                            title="Download Invoice"
                                            className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                                            onClick={async () => {
                                                try {
                                                    await TagihanService.cetak(item.id_tagihan)
                                                } catch {
                                                    toast.push(
                                                        <Notification type="danger" title="Gagal mengunduh invoice" />,
                                                    )
                                                }
                                            }}
                                        >
                                            <HiOutlineDownload className="text-lg" />
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default SiswaTagihanTable
