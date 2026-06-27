'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tag, Spinner, Select, Notification, toast } from '@/components/ui'
import { HiOutlineCreditCard, HiOutlineDownload, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'
import TagihanService from '@/services/kursus/tagihan.service'
import { formatRupiah } from '@/utils/formatNumber'
import { ROUTES } from '@/constants/route.constant'
import type { ITagihan } from '@/@types/kursus.types'

type SelectOption = { value: string; label: string }

const PAGE_SIZE = 10

const TAGIHAN_STATUS: Record<number, { label: string; cls: string }> = {
    1: { label: 'Menunggu',   cls: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' },
    2: { label: 'Sebagian',   cls: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' },
    3: { label: 'Lunas',      cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' },
    4: { label: 'Dibatalkan', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
}

const STATUS_OPTIONS: SelectOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Menunggu' },
    { value: '2', label: 'Sebagian' },
    { value: '3', label: 'Lunas' },
    { value: '4', label: 'Dibatalkan' },
]

const BULAN_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const BULAN_FULL  = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const formatTanggal = (raw: string) => {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return raw
    return `${d.getDate()} ${BULAN_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

interface SiswaTagihanTableProps {
    data: ITagihan[]
    loading?: boolean
}

const SiswaTagihanTable = ({ data, loading = false }: SiswaTagihanTableProps) => {
    const router = useRouter()

    const [filterBulan, setFilterBulan] = useState<SelectOption | null>(null)
    const [filterTahun, setFilterTahun] = useState<SelectOption | null>(null)
    const [filterStatus, setFilterStatus] = useState<SelectOption>(STATUS_OPTIONS[0])
    const [page, setPage] = useState(1)

    // Derive unique tahun options from data
    const tahunOptions = useMemo<SelectOption[]>(() => {
        const years = new Set<string>()
        data.forEach((d) => {
            const y = new Date(d.dibuat_pada).getFullYear()
            if (!isNaN(y)) years.add(String(y))
        })
        return [
            { value: '', label: 'Semua Tahun' },
            ...Array.from(years)
                .sort((a, b) => Number(b) - Number(a))
                .map((y) => ({ value: y, label: y })),
        ]
    }, [data])

    const bulanOptions = useMemo<SelectOption[]>(() => [
        { value: '', label: 'Semua Bulan' },
        ...Array.from({ length: 12 }, (_, i) => ({
            value: String(i + 1),
            label: BULAN_FULL[i],
        })),
    ], [])

    const filtered = useMemo(() => {
        return [...data]
            .sort((a, b) => b.dibuat_pada.localeCompare(a.dibuat_pada))
            .filter((item) => {
                const d = new Date(item.dibuat_pada)
                if (filterTahun?.value && String(d.getFullYear()) !== filterTahun.value) return false
                if (filterBulan?.value && String(d.getMonth() + 1) !== filterBulan.value) return false
                if (filterStatus.value && String(item.status) !== filterStatus.value) return false
                return true
            })
    }, [data, filterBulan, filterTahun, filterStatus])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const currentPage = Math.min(page, totalPages)
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    const handleFilterChange = () => setPage(1)

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Spinner size={28} />
            </div>
        )
    }

    return (
        <div>
            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
                <div className="w-36">
                    <Select<SelectOption>
                        size="sm"
                        placeholder="Semua Bulan"
                        options={bulanOptions}
                        value={filterBulan ?? bulanOptions[0]}
                        onChange={(opt) => { setFilterBulan(opt as SelectOption); handleFilterChange() }}
                    />
                </div>
                <div className="w-32">
                    <Select<SelectOption>
                        size="sm"
                        placeholder="Semua Tahun"
                        options={tahunOptions}
                        value={filterTahun ?? tahunOptions[0]}
                        onChange={(opt) => { setFilterTahun(opt as SelectOption); handleFilterChange() }}
                    />
                </div>
                <div className="w-36">
                    <Select<SelectOption>
                        size="sm"
                        options={STATUS_OPTIONS}
                        value={filterStatus}
                        onChange={(opt) => { setFilterStatus(opt as SelectOption); handleFilterChange() }}
                    />
                </div>
                {(filterBulan?.value || filterTahun?.value || filterStatus.value) && (
                    <button
                        type="button"
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline"
                        onClick={() => {
                            setFilterBulan(null)
                            setFilterTahun(null)
                            setFilterStatus(STATUS_OPTIONS[0])
                            setPage(1)
                        }}
                    >
                        Reset Filter
                    </button>
                )}
                <span className="ml-auto text-xs text-gray-400">
                    {filtered.length} tagihan
                </span>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                    {data.length === 0 ? 'Belum ada riwayat tagihan' : 'Tidak ada tagihan yang sesuai filter'}
                </p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40">
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-10">No</th>
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-28">Tanggal</th>
                                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tagihan</th>
                                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Dibayar</th>
                                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sisa</th>
                                    <th className="text-center py-2.5 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-28">Status</th>
                                    <th className="py-2.5 px-4 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {paginated.map((item, i) => {
                                    const st = TAGIHAN_STATUS[item.status] ?? TAGIHAN_STATUS[1]
                                    const sisa = item.total_harga - item.total_bayar
                                    const d0 = item.detail?.[0]
                                    const judul = item.nama_tagihan ?? d0?.nama_biaya ?? item.nama_biaya ?? '—'
                                    const kelas = d0?.nama_kelas ?? item.nama_kelas ?? null
                                    const paket = d0?.nama_paket ?? item.nama_paket ?? null

                                    return (
                                        <tr
                                            key={item.id_tagihan}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-gray-400 text-xs">
                                                {(currentPage - 1) * PAGE_SIZE + i + 1}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                                                {formatTanggal(item.dibuat_pada)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-800 dark:text-gray-100 leading-tight">
                                                    {judul}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                    {kelas && (
                                                        <span className="text-xs text-gray-400">{kelas}</span>
                                                    )}
                                                    {paket && (
                                                        <>
                                                            <span className="text-gray-300 dark:text-gray-600">·</span>
                                                            <span className="text-xs text-gray-400">{paket}</span>
                                                        </>
                                                    )}
                                                    {item.nama_diskon && (
                                                        <>
                                                            <span className="text-gray-300 dark:text-gray-600">·</span>
                                                            <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                                                Diskon {item.nama_diskon}
                                                                {item.persen_diskon ? ` (${item.persen_diskon}%)` : ''}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                                                {formatRupiah(item.total_harga)}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                {item.total_bayar > 0 ? formatRupiah(item.total_bayar) : <span className="text-gray-300 dark:text-gray-600 font-normal">—</span>}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold whitespace-nowrap">
                                                {sisa > 0
                                                    ? <span className="text-red-500 dark:text-red-400">{formatRupiah(sisa)}</span>
                                                    : <span className="text-gray-300 dark:text-gray-600 font-normal">—</span>
                                                }
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Tag className={`${st.cls} text-xs`}>{st.label}</Tag>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-1">
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
                                                        className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 pt-4 pb-1">
                            <p className="text-xs text-gray-400">
                                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length} tagihan
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <HiOutlineChevronLeft className="text-base" />
                                </button>
                                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                                        if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
                                        acc.push(p)
                                        return acc
                                    }, [])
                                    .map((p, idx) =>
                                        p === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400">…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPage(p as number)}
                                                className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                                                    p === currentPage
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ),
                                    )}
                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <HiOutlineChevronRight className="text-base" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default SiswaTagihanTable
