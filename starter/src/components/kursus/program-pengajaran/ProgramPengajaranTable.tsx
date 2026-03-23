'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IProgramPengajaran } from '@/@types/kursus.types'

const TINGKAT_COLORS = [
    'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
    'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
    'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300',
    'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-300',
    'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
]

/** Pilih warna berdasarkan hash kode agar konsisten */
const getTingkatColor = (kode: string): string => {
    let hash = 0
    for (let i = 0; i < kode.length; i++) hash += kode.charCodeAt(i)
    return TINGKAT_COLORS[hash % TINGKAT_COLORS.length]
}

interface ProgramPengajaranTableProps {
    data: IProgramPengajaran[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (item: IProgramPengajaran) => void
    onDelete: (item: IProgramPengajaran) => void
}

const ProgramPengajaranTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: ProgramPengajaranTableProps) => {
    const columns: ColumnDef<IProgramPengajaran>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IProgramPengajaran, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize +
                    row.index +
                    1,
            },
            {
                header: 'Kode',
                accessorKey: 'kode_program',
                size: 160,
                cell: ({ row }: CellContext<IProgramPengajaran, unknown>) => (
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                        {row.original.kode_program}
                    </span>
                ),
            },
            {
                header: 'Nama Program',
                accessorKey: 'nama',
                size: 280,
                cell: ({ row }: CellContext<IProgramPengajaran, unknown>) => (
                    <span className="font-semibold">{row.original.nama}</span>
                ),
            },
            {
                header: 'Tingkat',
                accessorKey: 'tingkat',
                size: 140,
                cell: ({ row }: CellContext<IProgramPengajaran, unknown>) => {
                    const tingkat = row.original.tingkat
                    if (!tingkat) return <span className="text-gray-400">-</span>
                    return (
                        <Tag className={getTingkatColor(tingkat)}>{tingkat}</Tag>
                    )
                },
            },
            {
                header: 'Durasi',
                accessorKey: 'durasi_menit',
                size: 120,
                cell: ({ row }: CellContext<IProgramPengajaran, unknown>) => (
                    <span>{row.original.durasi_menit} menit</span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 120,
                cell: ({ row }: CellContext<IProgramPengajaran, unknown>) => (
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
                cell: ({ row }: CellContext<IProgramPengajaran, unknown>) => (
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

export default ProgramPengajaranTable
