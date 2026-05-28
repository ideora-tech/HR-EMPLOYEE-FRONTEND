'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, Input, Select, Button, Notification, toast, DatePicker } from '@/components/ui'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/components/shared/DataTable'
import PembayaranService from '@/services/kursus/pembayaran.service'
import { formatRupiah } from '@/utils/formatNumber'
import { parseApiError } from '@/utils/parseApiError'
import type { IPembayaran } from '@/@types/kursus.types'

/* ─── constants ──────────────────────────────────────────────── */

const METODE_OPTIONS = [
    { value: '', label: 'Semua Metode' },
    { value: 'TUNAI', label: 'Tunai' },
    { value: 'TRANSFER', label: 'Transfer' },
    { value: 'QRIS', label: 'QRIS' },
]

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

/* ─── helpers ────────────────────────────────────────────────── */

const toDate = (s: string): Date | null => (s ? new Date(s) : null)
const toStr = (d: Date | null): string =>
    d ? d.toISOString().split('T')[0] : ''

/* ─── component ──────────────────────────────────────────────── */

const PembayaranListPage = () => {
    const [list, setList] = useState<IPembayaran[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [totalJumlah, setTotalJumlah] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [metode, setMetode] = useState('')
    const [tanggalMulai, setTanggalMulai] = useState('')
    const [tanggalSelesai, setTanggalSelesai] = useState('')

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await PembayaranService.getAll({
                search: search || undefined,
                metode: (metode as 'TUNAI' | 'TRANSFER' | 'QRIS') || undefined,
                tanggal_mulai: tanggalMulai || undefined,
                tanggal_selesai: tanggalSelesai || undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta.total)
                setTotalJumlah(res.meta.total_jumlah)
            }
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setLoading(false)
        }
    }, [search, metode, tanggalMulai, tanggalSelesai, currentPage, pageSize])

    useEffect(() => { fetchData() }, [fetchData])

    const commitSearch = () => {
        setSearch(searchInput)
        setCurrentPage(1)
    }

    const clearFilters = () => {
        setSearchInput('')
        setSearch('')
        setMetode('')
        setTanggalMulai('')
        setTanggalSelesai('')
        setCurrentPage(1)
    }

    const hasFilter = !!(search || metode || tanggalMulai || tanggalSelesai)

    /* ─── columns ─────────────────────────────────────────────── */
    const columns: ColumnDef<IPembayaran>[] = [
        {
            header: 'No',
            id: 'no',
            size: 60,
            cell: ({ row }) => (currentPage - 1) * pageSize + row.index + 1,
        },
        {
            header: 'Nama Siswa',
            accessorKey: 'nama_siswa',
            size: 200,
            cell: ({ row }) => (
                <span className="font-medium text-gray-800 dark:text-gray-100">
                    {row.original.nama_siswa ?? '—'}
                </span>
            ),
        },
        {
            header: 'Jumlah',
            accessorKey: 'jumlah',
            size: 150,
            cell: ({ row }) => (
                <span className="font-bold text-emerald-600">
                    {formatRupiah(row.original.jumlah)}
                </span>
            ),
        },
        {
            header: 'Metode',
            accessorKey: 'metode',
            size: 110,
            cell: ({ row }) => (
                <span className={`text-xs font-bold px-2 py-1 rounded ${METODE_CLS[row.original.metode] ?? 'bg-gray-100 text-gray-600'}`}>
                    {row.original.metode}
                </span>
            ),
        },
        {
            header: 'Tanggal Bayar',
            accessorKey: 'tanggal_bayar',
            size: 160,
            cell: ({ row }) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {row.original.tanggal_bayar?.substring(0, 16).replace('T', ' ') ?? '—'}
                </span>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status_konfirmasi',
            size: 130,
            cell: ({ row }) => {
                const s = STATUS_KONFIRMASI[row.original.status_konfirmasi]
                return s ? (
                    <span className={`text-xs font-bold px-2 py-1 rounded ${s.cls}`}>{s.label}</span>
                ) : null
            },
        },
        {
            header: 'Referensi',
            accessorKey: 'referensi',
            size: 150,
            cell: ({ row }) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {row.original.referensi ?? '—'}
                </span>
            ),
        },
    ]

    /* ─── render ──────────────────────────────────────────────── */
    return (
        <div className="flex flex-col gap-4">
            {/* Summary KPI */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Transaksi</p>
                    <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{total.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-gray-400 mt-1">dari filter aktif</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Jumlah Bayar</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(totalJumlah)}</p>
                    <p className="text-xs text-gray-400 mt-1">dari filter aktif</p>
                </div>
            </div>

            {/* Table card */}
            <Card
                header={{
                    content: <h4>Riwayat Pembayaran</h4>,
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3 px-4 pt-4 pb-3">
                    {/* Search — trigger on Enter */}
                    <Input
                        className="min-w-[220px]"
                        placeholder="Cari nama siswa... (Enter)"
                        prefix={<HiOutlineSearch className="text-gray-400" />}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && commitSearch()}
                        suffix={
                            searchInput ? (
                                <HiOutlineX
                                    className="cursor-pointer text-gray-400 hover:text-gray-600"
                                    onClick={() => { setSearchInput(''); setSearch(''); setCurrentPage(1) }}
                                />
                            ) : null
                        }
                    />

                    {/* Metode */}
                    <Select
                        className="min-w-[160px]"
                        options={METODE_OPTIONS}
                        value={METODE_OPTIONS.find((o) => o.value === metode)}
                        onChange={(opt) => {
                            setMetode((opt as { value: string })?.value ?? '')
                            setCurrentPage(1)
                        }}
                    />

                    {/* Date range — DatePicker */}
                    <div className="flex items-center gap-2">
                        <DatePicker
                            value={toDate(tanggalMulai)}
                            placeholder="Tanggal mulai"
                            onChange={(date) => {
                                setTanggalMulai(toStr(date))
                                setCurrentPage(1)
                            }}
                            inputFormat="DD/MM/YYYY"
                        />
                        <span className="text-gray-400 text-sm">—</span>
                        <DatePicker
                            value={toDate(tanggalSelesai)}
                            placeholder="Tanggal selesai"
                            onChange={(date) => {
                                setTanggalSelesai(toStr(date))
                                setCurrentPage(1)
                            }}
                            inputFormat="DD/MM/YYYY"
                        />
                    </div>

                    {/* Reset filter */}
                    {hasFilter && (
                        <Button size="sm" variant="plain" onClick={clearFilters} icon={<HiOutlineX />}>
                            Reset Filter
                        </Button>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={list}
                    loading={loading}
                    pagingData={{ total, pageIndex: currentPage, pageSize }}
                    onPaginationChange={setCurrentPage}
                    onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                />
            </Card>
        </div>
    )
}

export default PembayaranListPage
