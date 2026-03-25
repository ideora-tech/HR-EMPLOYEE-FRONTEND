'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IDepartemen } from '@/@types/organisasi.types'

interface DepartemenTableProps {
    data: IDepartemen[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (item: IDepartemen) => void
    onDelete: (item: IDepartemen) => void
}

const DepartemenTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: DepartemenTableProps) => {
    const columns: ColumnDef<IDepartemen>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 60,
                cell: ({ row }: CellContext<IDepartemen, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Kode',
                accessorKey: 'kode',
                size: 140,
                cell: ({ row }: CellContext<IDepartemen, unknown>) => (
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                        {row.original.kode}
                    </span>
                ),
            },
            {
                header: 'Nama Departemen',
                accessorKey: 'nama',
                cell: ({ row }: CellContext<IDepartemen, unknown>) => (
                    <span className="font-semibold">{row.original.nama}</span>
                ),
            },
            {
                header: 'Departemen Induk',
                accessorKey: 'departemen_induk',
                size: 200,
                cell: ({ row }: CellContext<IDepartemen, unknown>) => (
                    <span className="text-gray-500">
                        {row.original.departemen_induk?.nama ?? '—'}
                    </span>
                ),
            },
            {
                header: 'Deskripsi',
                accessorKey: 'deskripsi',
                cell: ({ row }: CellContext<IDepartemen, unknown>) => (
                    <span className="text-gray-500 line-clamp-1">
                        {row.original.deskripsi ?? '—'}
                    </span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 110,
                cell: ({ row }: CellContext<IDepartemen, unknown>) => (
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
                size: 90,
                cell: ({ row }: CellContext<IDepartemen, unknown>) => (
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

export default DepartemenTable
