'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IKaryawan, StatusKepegawaian } from '@/@types/karyawan.types'

const STATUS_STYLE: Record<
    StatusKepegawaian,
    { label: string; className: string }
> = {
    TETAP: {
        label: 'Tetap',
        className:
            'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100',
    },
    KONTRAK: {
        label: 'Kontrak',
        className:
            'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100',
    },
    PROBASI: {
        label: 'Probasi',
        className:
            'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100',
    },
    MAGANG: {
        label: 'Magang',
        className:
            'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-100',
    },
}

interface KaryawanTableProps {
    data: IKaryawan[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (item: IKaryawan) => void
    onDelete: (item: IKaryawan) => void
}

const KaryawanTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: KaryawanTableProps) => {
    const columns: ColumnDef<IKaryawan>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IKaryawan, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize +
                    row.index +
                    1,
            },
            {
                header: 'NIK',
                accessorKey: 'nik',
                size: 130,
                cell: ({ row }: CellContext<IKaryawan, unknown>) => (
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {row.original.nik ?? '-'}
                    </span>
                ),
            },
            {
                header: 'Nama',
                accessorKey: 'nama',
                size: 220,
                cell: ({ row }: CellContext<IKaryawan, unknown>) => {
                    const initials = row.original.nama_karyawan
                        .split(' ')
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                    return (
                        <div className="flex items-center gap-2.5">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center text-xs font-bold">
                                {initials}
                            </div>
                            <span className="font-semibold">
                                {row.original.nama_karyawan}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Email',
                accessorKey: 'email',
                size: 200,
                cell: ({ row }: CellContext<IKaryawan, unknown>) => (
                    <span className="text-sm">
                        {row.original.email ?? '-'}
                    </span>
                ),
            },
            {
                header: 'Telepon',
                accessorKey: 'telepon',
                size: 150,
                cell: ({ row }: CellContext<IKaryawan, unknown>) =>
                    row.original.telepon ?? '-',
            },
            {
                header: 'Status Kepegawaian',
                accessorKey: 'status_kepegawaian',
                size: 170,
                cell: ({ row }: CellContext<IKaryawan, unknown>) => {
                    const sk = row.original.status_kepegawaian
                    if (!sk) return <span className="text-gray-400">-</span>
                    const s = STATUS_STYLE[sk]
                    return (
                        <Tag className={s.className}>{s.label}</Tag>
                    )
                },
            },
            {
                header: 'Tgl Masuk',
                accessorKey: 'tanggal_masuk',
                size: 130,
                cell: ({ row }: CellContext<IKaryawan, unknown>) => {
                    const tgl = row.original.tanggal_masuk
                    if (!tgl) return '-'
                    const d = new Date(tgl)
                    return d.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })
                },
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 110,
                cell: ({ row }: CellContext<IKaryawan, unknown>) => (
                    <Tag
                        className={
                            row.original.aktif === 1
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100'
                                : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100'
                        }
                    >
                        {row.original.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                    </Tag>
                ),
            },
            {
                header: '',
                id: 'action',
                size: 100,
                cell: ({ row }: CellContext<IKaryawan, unknown>) => (
                    <div className="flex items-center justify-end gap-2">
                        <Tooltip title="Edit">
                            <span
                                className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                onClick={() => onEdit(row.original)}
                            >
                                <HiOutlinePencilAlt className="text-lg" />
                            </span>
                        </Tooltip>
                        <Tooltip title="Hapus">
                            <span
                                className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-colors"
                                onClick={() => onDelete(row.original)}
                            >
                                <HiOutlineTrash className="text-lg" />
                            </span>
                        </Tooltip>
                    </div>
                ),
            },
        ],
        [pagingData.pageIndex, pagingData.pageSize, onEdit, onDelete],
    )

    return (
        <DataTable
            columns={columns}
            data={data as unknown[]}
            loading={loading}
            noData={!loading && data.length === 0}
            pagingData={pagingData}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
        />
    )
}

export default KaryawanTable
