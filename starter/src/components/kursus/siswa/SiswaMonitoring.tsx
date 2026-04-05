'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input, Notification, Spinner, Tag, toast } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineExclamationCircle, HiOutlineClock } from 'react-icons/hi'
import DataTable from '@/components/shared/DataTable'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { ISiswaMonitoring } from '@/@types/kursus.types'

/* ─── flat row type ──────────────────────────────────────── */

interface MonitoringRow {
    id_catat: string
    id_siswa: string
    nama_siswa: string
    email: string | null
    telepon: string | null
    nama_kelas: string
    sesi_hadir: number
    sesi_tidak_hadir: number
    total_sesi: number | null
    sesi_tersisa: number | null
    kategori: 'berhenti' | 'akan_habis'
}

/* ─── helpers ────────────────────────────────────────────── */

const flatten = (data: ISiswaMonitoring): { berhenti: MonitoringRow[]; akan_habis: MonitoringRow[] } => {
    const map = (kategori: 'berhenti' | 'akan_habis') =>
        data[kategori].flatMap((entry) =>
            entry.kelas.map((k) => ({
                id_catat: k.id_catat,
                id_siswa: entry.id_siswa,
                nama_siswa: entry.nama_siswa,
                email: entry.email,
                telepon: entry.telepon,
                nama_kelas: k.nama_kelas,
                sesi_hadir: k.sesi_hadir,
                sesi_tidak_hadir: k.sesi_tidak_hadir,
                total_sesi: k.total_sesi,
                sesi_tersisa: k.sesi_tersisa,
                kategori,
            })),
        )
    return { berhenti: map('berhenti'), akan_habis: map('akan_habis') }
}

/* ─── progress mini ──────────────────────────────────────── */

const SesiBar = ({ hadir, total }: { hadir: number; total: number | null }) => {
    if (!total) return <span className="text-gray-400 text-xs">—</span>
    const pct = Math.min(100, Math.round((hadir / total) * 100))
    const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
    return (
        <div className="flex items-center gap-2 min-w-[100px]">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{hadir}/{total}</span>
        </div>
    )
}

/* ─── columns ────────────────────────────────────────────── */

const buildColumns = (): ColumnDef<MonitoringRow>[] => [
    {
        header: 'No',
        id: 'no',
        size: 60,
        cell: ({ row }: CellContext<MonitoringRow, unknown>) => row.index + 1,
    },
    {
        header: 'Nama Siswa',
        accessorKey: 'nama_siswa',
        size: 200,
        cell: ({ row }: CellContext<MonitoringRow, unknown>) => (
            <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                    {row.original.nama_siswa}
                </p>
                {row.original.telepon && (
                    <p className="text-xs text-gray-400">{row.original.telepon}</p>
                )}
            </div>
        ),
    },
    {
        header: 'Kelas',
        accessorKey: 'nama_kelas',
        size: 200,
        cell: ({ row }: CellContext<MonitoringRow, unknown>) => (
            <span className="text-sm">{row.original.nama_kelas}</span>
        ),
    },
    {
        header: 'Progress Sesi',
        id: 'progress',
        size: 160,
        cell: ({ row }: CellContext<MonitoringRow, unknown>) => (
            <SesiBar hadir={row.original.sesi_hadir} total={row.original.total_sesi} />
        ),
    },
    {
        header: 'Hadir',
        accessorKey: 'sesi_hadir',
        size: 80,
        cell: ({ row }: CellContext<MonitoringRow, unknown>) => (
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {row.original.sesi_hadir}
            </span>
        ),
    },
    {
        header: 'Tdk Hadir',
        accessorKey: 'sesi_tidak_hadir',
        size: 90,
        cell: ({ row }: CellContext<MonitoringRow, unknown>) => (
            <span className="text-sm font-semibold text-red-500 dark:text-red-400">
                {row.original.sesi_tidak_hadir}
            </span>
        ),
    },
    {
        header: 'Sisa Sesi',
        accessorKey: 'sesi_tersisa',
        size: 110,
        cell: ({ row }: CellContext<MonitoringRow, unknown>) => {
            const sisa = row.original.sesi_tersisa
            if (sisa === null) return <span className="text-gray-400 text-xs">—</span>
            if (sisa === 0)
                return <span className="text-sm font-bold text-red-500">Habis</span>
            return (
                <span className={`text-sm font-semibold ${sisa <= 2 ? 'text-red-500' : 'text-amber-500'}`}>
                    {sisa} sesi
                </span>
            )
        },
    },
    {
        header: 'Status',
        id: 'status',
        size: 130,
        cell: ({ row }: CellContext<MonitoringRow, unknown>) =>
            row.original.kategori === 'berhenti' ? (
                <Tag className="bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400 whitespace-nowrap">
                    <HiOutlineExclamationCircle className="inline mr-1" />
                    Sesi Habis
                </Tag>
            ) : (
                <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 whitespace-nowrap">
                    <HiOutlineClock className="inline mr-1" />
                    Akan Habis
                </Tag>
            ),
    },
]

/* ─── main component ─────────────────────────────────────── */

type TabKey = 'berhenti' | 'akan_habis'

const SiswaMonitoring = () => {
    const [data, setData] = useState<ISiswaMonitoring | null>(null)
    const [loading, setLoading] = useState(false)
    const [threshold, setThreshold] = useState('5')
    const [activeTab, setActiveTab] = useState<TabKey>('berhenti')

    const fetchData = useCallback(async (sessionThreshold?: number) => {
        setLoading(true)
        try {
            const result = await SiswaService.getMonitoring(sessionThreshold ?? Number(threshold))
            setData(result)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data monitoring">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [threshold])

    useEffect(() => {
        fetchData(5)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleRefresh = () => {
        const n = Number(threshold)
        if (!n || n < 1) return
        fetchData(n)
    }

    const rows = useMemo(() => {
        if (!data) return { berhenti: [], akan_habis: [] }
        return flatten(data)
    }, [data])

    const currentRows = rows[activeTab]
    const columns = useMemo(() => buildColumns(), [])

    const TABS: { key: TabKey; label: string; count: number; color: string; activeColor: string }[] = [
        {
            key: 'berhenti',
            label: 'Sesi Habis',
            count: rows.berhenti.length,
            color: 'text-gray-500',
            activeColor: 'border-red-500 text-red-500',
        },
        {
            key: 'akan_habis',
            label: `Akan Habis (≤ ${threshold} sesi)`,
            count: rows.akan_habis.length,
            color: 'text-gray-500',
            activeColor: 'border-amber-500 text-amber-600',
        },
    ]

    return (
        <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex items-center gap-3 px-4 pt-4">
                <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    Tampilkan yang tersisa ≤
                </span>
                <Input
                    type="number"
                    min={1}
                    max={100}
                    className="w-20"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRefresh() }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">sesi</span>
                <Button
                    size="sm"
                    variant="default"
                    icon={<HiOutlineRefresh />}
                    loading={loading}
                    onClick={handleRefresh}
                >
                    Refresh
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
                            ${activeTab === tab.key
                                ? tab.activeColor + ' border-current'
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeTab === tab.key
                            ? tab.key === 'berhenti'
                                ? 'bg-red-100 text-red-500 dark:bg-red-500/20'
                                : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20'
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading && !data ? (
                <div className="flex justify-center py-16">
                    <Spinner size={40} />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={currentRows as unknown[]}
                    loading={loading}
                    noData={!loading && currentRows.length === 0}
                    pagingData={{ pageIndex: 1, pageSize: currentRows.length || 1, total: currentRows.length }}
                    onPaginationChange={() => { }}
                    onSelectChange={() => { }}
                />
            )}
        </div>
    )
}

export default SiswaMonitoring

