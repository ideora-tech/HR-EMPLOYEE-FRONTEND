'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IMenu } from '@/@types/menu.types'

interface MenuTableProps {
    data: IMenu[]
    loading?: boolean
    pagingData: {
        total: number
        pageIndex: number
        pageSize: number
    }
    onPaginationChange: (page: number) => void
    onSelectChange: (size: number) => void
    onEdit: (item: IMenu) => void
    onDelete: (item: IMenu) => void
}

const MenuTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: MenuTableProps) => {
    const columns: ColumnDef<IMenu>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IMenu, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Nama',
                accessorKey: 'nama',
                size: 280,
                cell: ({ row }: CellContext<IMenu, unknown>) => (
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                        {row.original.nama}
                    </span>
                ),
            },
            {
                header: 'Kode Modul',
                accessorKey: 'kode_modul',
                size: 160,
                cell: ({ row }: CellContext<IMenu, unknown>) =>
                    row.original.kode_modul ? (
                        <Tag className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100">
                            {row.original.kode_modul}
                        </Tag>
                    ) : (
                        <span className="text-xs text-gray-400 italic">selalu tampil</span>
                    ),
            },
            {
                header: 'Path',
                accessorKey: 'path',
                size: 220,
                cell: ({ row }: CellContext<IMenu, unknown>) => (
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {row.original.path || '—'}
                    </span>
                ),
            },
            {
                header: 'Icon',
                accessorKey: 'icon',
                size: 140,
                cell: ({ row }: CellContext<IMenu, unknown>) => (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {row.original.icon || '—'}
                    </span>
                ),
            },
            {
                header: 'No. Urut',
                accessorKey: 'urutan',
                size: 120,
                cell: ({ row }: CellContext<IMenu, unknown>) => (
                    <span className="text-gray-600 dark:text-gray-300">
                        {row.original.urutan}
                    </span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 140,
                cell: ({ row }: CellContext<IMenu, unknown>) => (
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
                cell: ({ row }: CellContext<IMenu, unknown>) => (
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
        [onEdit, onDelete, pagingData.pageIndex, pagingData.pageSize],
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

export default MenuTable
