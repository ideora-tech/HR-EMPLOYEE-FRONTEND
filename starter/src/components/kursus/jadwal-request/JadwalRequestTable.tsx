'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IJadwalRequestPublic } from '@/@types/kursus.types'

function formatDate(s: string | null | undefined): string {
    if (!s) return '—'
    const d = new Date(s)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const STATUS_MAP: Record<1 | 2 | 3, { label: string; className: string }> = {
    1: {
        label: 'Menunggu',
        className: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100',
    },
    2: {
        label: 'Disetujui',
        className: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100',
    },
    3: {
        label: 'Ditolak',
        className: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100',
    },
}

interface JadwalRequestTableProps {
    data: IJadwalRequestPublic[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onApprove: (row: IJadwalRequestPublic) => void
    onReject: (row: IJadwalRequestPublic) => void
}

const JadwalRequestTable = ({
    data,
    loading = false,
    pagingData,
    onPageChange,
    onPageSizeChange,
    onApprove,
    onReject,
}: JadwalRequestTableProps) => {
    const columns: ColumnDef<IJadwalRequestPublic>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IJadwalRequestPublic, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Coach',
                id: 'coach',
                size: 200,
                cell: ({ row }: CellContext<IJadwalRequestPublic, unknown>) => (
                    <span className="font-semibold">{row.original.coach.nama_karyawan}</span>
                ),
            },
            {
                header: 'Jadwal',
                id: 'jadwal',
                size: 280,
                cell: ({ row }: CellContext<IJadwalRequestPublic, unknown>) => {
                    const { nama_kelas, hari, jam_mulai, jam_selesai } = row.original.jadwal
                    return (
                        <span className="text-sm">
                            {nama_kelas} &mdash; {hari} {jam_mulai}–{jam_selesai}
                        </span>
                    )
                },
            },
            {
                header: 'Status',
                id: 'status',
                size: 130,
                cell: ({ row }: CellContext<IJadwalRequestPublic, unknown>) => {
                    const s = row.original.status
                    const config = STATUS_MAP[s]
                    return <Tag className={config.className}>{config.label}</Tag>
                },
            },
            {
                header: 'Catatan Coach',
                id: 'catatan_coach',
                size: 200,
                cell: ({ row }: CellContext<IJadwalRequestPublic, unknown>) =>
                    row.original.catatan_coach ? (
                        <span className="text-sm">{row.original.catatan_coach}</span>
                    ) : (
                        <span className="text-gray-400">—</span>
                    ),
            },
            {
                header: 'Tgl Request',
                id: 'dibuat_pada',
                size: 160,
                cell: ({ row }: CellContext<IJadwalRequestPublic, unknown>) => (
                    <span className="text-sm">{formatDate(row.original.dibuat_pada)}</span>
                ),
            },
            {
                header: 'Aksi',
                id: 'action',
                size: 160,
                cell: ({ row }: CellContext<IJadwalRequestPublic, unknown>) => {
                    if (row.original.status !== 1) return null
                    return (
                        <div className="flex items-center gap-2">
                            <Tooltip title="Setujui">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30 transition-colors"
                                    onClick={() => onApprove(row.original)}
                                >
                                    <HiOutlineCheck className="text-lg" />
                                </span>
                            </Tooltip>
                            <Tooltip title="Tolak">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-colors"
                                    onClick={() => onReject(row.original)}
                                >
                                    <HiOutlineX className="text-lg" />
                                </span>
                            </Tooltip>
                        </div>
                    )
                },
            },
        ],
        [pagingData.pageIndex, pagingData.pageSize, onApprove, onReject],
    )

    return (
        <DataTable
            columns={columns}
            data={data as unknown[]}
            loading={loading}
            noData={!loading && data.length === 0}
            pagingData={pagingData}
            onPaginationChange={onPageChange}
            onSelectChange={onPageSizeChange}
        />
    )
}

export default JadwalRequestTable
