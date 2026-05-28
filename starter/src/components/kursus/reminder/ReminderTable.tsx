'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button, Input, Notification, Spinner, Tag, toast, Tooltip } from '@/components/ui'
import {
    HiOutlineRefresh,
    HiOutlinePhone,
    HiOutlineCheckCircle,
    HiOutlinePlusCircle,
    HiOutlineClock,
} from 'react-icons/hi'
import DataTable from '@/components/shared/DataTable'
import ReminderService from '@/services/kursus/reminder.service'
import { parseApiError } from '@/utils/parseApiError'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IReminderItem } from '@/@types/kursus.types'
import CreateTagihanFromReminderDrawer from './CreateTagihanFromReminderDrawer'

/* ─── progress bar ───────────────────────────────────────── */

const SesiBar = ({ hadir, total }: { hadir: number; total: number }) => {
    const pct = Math.min(100, Math.round((hadir / total) * 100))
    const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
    return (
        <div className="flex items-center gap-2 min-w-[100px]">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
                {hadir}/{total}
            </span>
        </div>
    )
}

/* ─── main component ─────────────────────────────────────── */

const ReminderTable = () => {
    const [items, setItems] = useState<IReminderItem[]>([])
    const [loading, setLoading] = useState(false)
    const [threshold, setThreshold] = useState('3')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<IReminderItem | null>(null)

    const fetchData = useCallback(async () => {
        const n = Number(threshold)
        if (!n || n < 1) return
        setLoading(true)
        try {
            const data = await ReminderService.getReminders(n)
            setItems(data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data reminder">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [threshold])

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleTandai = useCallback(async (idCatat: string) => {
        try {
            const updated = await ReminderService.tandaiDihubungi(idCatat)
            setItems((prev) =>
                prev.map((item) => (item.id_catat === idCatat ? updated : item)),
            )
            toast.push(
                <Notification type="success" title="Berhasil ditandai sudah dihubungi" />,
            )
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal">
                    {parseApiError(err)}
                </Notification>,
            )
        }
    }, [])

    const handleOpenDrawer = useCallback((item: IReminderItem) => {
        setSelectedItem(item)
        setDrawerOpen(true)
    }, [])

    const handleCloseDrawer = useCallback(() => {
        setDrawerOpen(false)
        setSelectedItem(null)
    }, [])

    const columns: ColumnDef<IReminderItem>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 60,
                cell: ({ row }: CellContext<IReminderItem, unknown>) => row.index + 1,
            },
            {
                header: 'Nama Siswa',
                accessorKey: 'nama_siswa',
                size: 200,
                cell: ({ row }: CellContext<IReminderItem, unknown>) => (
                    <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                            {row.original.nama_siswa}
                        </p>
                        {row.original.telepon && (
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <HiOutlinePhone className="inline shrink-0" />
                                {row.original.telepon}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                header: 'Kelas',
                accessorKey: 'nama_kelas',
                size: 180,
                cell: ({ row }: CellContext<IReminderItem, unknown>) => (
                    <span className="text-sm">{row.original.nama_kelas}</span>
                ),
            },
            {
                header: 'Progress Sesi',
                id: 'progress',
                size: 160,
                cell: ({ row }: CellContext<IReminderItem, unknown>) => (
                    <SesiBar
                        hadir={row.original.total_sesi_hadir}
                        total={row.original.total_sesi}
                    />
                ),
            },
            {
                header: 'Sisa Sesi',
                accessorKey: 'sesi_tersisa',
                size: 110,
                cell: ({ row }: CellContext<IReminderItem, unknown>) => {
                    const sisa = row.original.sesi_tersisa
                    if (sisa === 0)
                        return <span className="text-sm font-bold text-red-500">Habis</span>
                    return (
                        <span
                            className={`text-sm font-semibold ${
                                sisa <= 2 ? 'text-red-500' : 'text-amber-500'
                            }`}
                        >
                            {sisa} sesi
                        </span>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'status_reminder',
                size: 160,
                cell: ({ row }: CellContext<IReminderItem, unknown>) =>
                    row.original.status_reminder === 1 ? (
                        <Tag className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 whitespace-nowrap">
                            <HiOutlineCheckCircle className="inline mr-1" />
                            Sudah Dihubungi
                        </Tag>
                    ) : (
                        <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 whitespace-nowrap">
                            <HiOutlineClock className="inline mr-1" />
                            Belum Dihubungi
                        </Tag>
                    ),
            },
            {
                header: '',
                id: 'action',
                size: 100,
                cell: ({ row }: CellContext<IReminderItem, unknown>) => (
                    <div className="flex items-center justify-end gap-2">
                        {row.original.status_reminder === 0 && (
                            <Tooltip title="Tandai Sudah Dihubungi">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30 transition-colors"
                                    onClick={() => handleTandai(row.original.id_catat)}
                                >
                                    <HiOutlineCheckCircle className="text-lg" />
                                </span>
                            </Tooltip>
                        )}
                        <Tooltip title="Generate Tagihan Perpanjangan">
                            <span
                                className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                onClick={() => handleOpenDrawer(row.original)}
                            >
                                <HiOutlinePlusCircle className="text-lg" />
                            </span>
                        </Tooltip>
                    </div>
                ),
            },
        ],
        [handleTandai, handleOpenDrawer],
    )

    return (
        <div>
            {/* Filter bar */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    Tampilkan siswa dengan sisa sesi ≤
                </span>
                <Input
                    type="number"
                    min={1}
                    max={50}
                    className="w-20"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchData()
                    }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">sesi</span>
                <Button
                    size="sm"
                    variant="default"
                    icon={<HiOutlineRefresh />}
                    loading={loading}
                    onClick={fetchData}
                >
                    Tampilkan
                </Button>
                <span className="ml-auto text-sm text-gray-400">
                    {items.length} siswa
                </span>
            </div>

            {/* Table */}
            {loading && items.length === 0 ? (
                <div className="flex justify-center py-16">
                    <Spinner size={40} />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={items as unknown[]}
                    loading={loading}
                    noData={!loading && items.length === 0}
                    pagingData={{
                        pageIndex: 1,
                        pageSize: items.length || 1,
                        total: items.length,
                    }}
                    onPaginationChange={() => {}}
                    onSelectChange={() => {}}
                />
            )}

            {selectedItem && (
                <CreateTagihanFromReminderDrawer
                    open={drawerOpen}
                    onClose={handleCloseDrawer}
                    idSiswa={selectedItem.id_siswa}
                    namaSiswa={selectedItem.nama_siswa}
                    onSuccess={() => {
                        handleCloseDrawer()
                        fetchData()
                    }}
                />
            )}
        </div>
    )
}

export default ReminderTable
