'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IModul } from '@/@types/modul.types'

interface ModulTableProps {
    data: IModul[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (modul: IModul) => void
    onDelete: (modul: IModul) => void
}

const ModulTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: ModulTableProps) => {
    const columns: ColumnDef<IModul>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IModul, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize +
                    row.index +
                    1,
            },
            {
                header: 'Nama Modul',
                accessorKey: 'nama',
                size: 280,
                cell: ({ row }: CellContext<IModul, unknown>) => (
                    <span className="font-semibold">{row.original.nama}</span>
                ),
            },
            {
                header: 'Kode',
                accessorKey: 'kode_modul',
                size: 160,
                cell: ({ row }: CellContext<IModul, unknown>) => (
                    <Tag className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100">
                        {row.original.kode_modul}
                    </Tag>
                ),
            },
            {
                header: 'No. Urut',
                accessorKey: 'urutan',
                size: 120,
                cell: ({ row }: CellContext<IModul, unknown>) =>
                    row.original.urutan,
            },
            {
                header: 'Deskripsi',
                accessorKey: 'deskripsi',
                size: 300,
                cell: ({ row }: CellContext<IModul, unknown>) => (
                    <span className="text-gray-500 text-sm line-clamp-2">
                        {row.original.deskripsi ?? '-'}
                    </span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 140,
                cell: ({ row }: CellContext<IModul, unknown>) => (
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
                cell: ({ row }: CellContext<IModul, unknown>) => (
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

export default ModulTable
