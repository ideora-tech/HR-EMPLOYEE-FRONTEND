'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IPengguna } from '@/@types/pengguna.types'
import PeranBadges from '@/components/pengguna/PeranBadges'

interface PenggunaTableProps {
    data: IPengguna[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (pengguna: IPengguna) => void
    onDelete: (pengguna: IPengguna) => void
    bolehUbah: (pengguna: IPengguna) => boolean
    bolehHapus: (pengguna: IPengguna) => boolean
}

const PenggunaTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
    bolehUbah,
    bolehHapus,
}: PenggunaTableProps) => {
    const columns: ColumnDef<IPengguna>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IPengguna, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize +
                    row.index +
                    1,
            },
            {
                header: 'Nama',
                accessorKey: 'nama',
                size: 280,
                cell: ({ row }: CellContext<IPengguna, unknown>) => (
                    <div>
                        <p className="font-semibold">{row.original.nama_pengguna}</p>
                        <p className="text-xs text-gray-400">{row.original.email}</p>
                    </div>
                ),
            },
            {
                header: 'Peran',
                accessorKey: 'peran',
                size: 160,
                cell: ({ row }: CellContext<IPengguna, unknown>) => <PeranBadges pengguna={row.original} />,
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 140,
                cell: ({ row }: CellContext<IPengguna, unknown>) => (
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
                cell: ({ row }: CellContext<IPengguna, unknown>) => (
                    <div className="flex items-center justify-end gap-2">
                        {bolehUbah(row.original) && (
                            <Tooltip title="Edit">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                    onClick={() => onEdit(row.original)}
                                >
                                    <HiOutlinePencilAlt className="text-lg" />
                                </span>
                            </Tooltip>
                        )}
                        {bolehHapus(row.original) && (
                            <Tooltip title="Hapus">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-colors"
                                    onClick={() => onDelete(row.original)}
                                >
                                    <HiOutlineTrash className="text-lg" />
                                </span>
                            </Tooltip>
                        )}
                    </div>
                ),
            },
        ],
        [pagingData.pageIndex, pagingData.pageSize, onEdit, onDelete, bolehUbah, bolehHapus],
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

export default PenggunaTable
