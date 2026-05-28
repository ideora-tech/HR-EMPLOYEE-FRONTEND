'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag } from '@/components/ui'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IAbsensiCoachPublic } from '@/@types/kursus.types'

function formatDate(s: string | null): string {
    if (!s) return '—'
    const d = new Date(s)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatTime(s: string | null): string {
    if (!s) return '—'
    const d = new Date(s)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const STATUS_MAP: Record<1 | 2 | 3, { label: string; className: string }> = {
    1: {
        label: 'HADIR',
        className: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100',
    },
    2: {
        label: 'TIDAK HADIR',
        className: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100',
    },
    3: {
        label: 'TERLAMBAT',
        className: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100',
    },
}

interface AbsensiCoachTableProps {
    data: IAbsensiCoachPublic[]
    loading: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

const AbsensiCoachTable = ({
    data,
    loading,
    pagingData,
    onPageChange,
    onPageSizeChange,
}: AbsensiCoachTableProps) => {
    const columns: ColumnDef<IAbsensiCoachPublic>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IAbsensiCoachPublic, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Coach',
                id: 'coach',
                size: 200,
                cell: ({ row }: CellContext<IAbsensiCoachPublic, unknown>) => (
                    <span className="font-semibold">{row.original.coach.nama_karyawan}</span>
                ),
            },
            {
                header: 'Kelas',
                id: 'kelas',
                size: 200,
                cell: ({ row }: CellContext<IAbsensiCoachPublic, unknown>) => (
                    <span>{row.original.jadwal.nama_kelas}</span>
                ),
            },
            {
                header: 'Hari',
                id: 'hari',
                size: 100,
                cell: ({ row }: CellContext<IAbsensiCoachPublic, unknown>) => (
                    <span>{row.original.jadwal.hari}</span>
                ),
            },
            {
                header: 'Tanggal',
                id: 'tanggal',
                size: 140,
                cell: ({ row }: CellContext<IAbsensiCoachPublic, unknown>) => (
                    <span>{formatDate(row.original.tanggal)}</span>
                ),
            },
            {
                header: 'Status',
                id: 'status',
                size: 130,
                cell: ({ row }: CellContext<IAbsensiCoachPublic, unknown>) => {
                    const s = row.original.status
                    const config = STATUS_MAP[s]
                    return <Tag className={config.className}>{config.label}</Tag>
                },
            },
            {
                header: 'Check-in',
                id: 'waktu_checkin',
                size: 140,
                cell: ({ row }: CellContext<IAbsensiCoachPublic, unknown>) => (
                    <span>{formatTime(row.original.waktu_checkin)}</span>
                ),
            },
            {
                header: 'Check-out',
                id: 'waktu_checkout',
                size: 140,
                cell: ({ row }: CellContext<IAbsensiCoachPublic, unknown>) => (
                    <span>{formatTime(row.original.waktu_checkout)}</span>
                ),
            },
        ],
        [pagingData.pageIndex, pagingData.pageSize],
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

export default AbsensiCoachTable
