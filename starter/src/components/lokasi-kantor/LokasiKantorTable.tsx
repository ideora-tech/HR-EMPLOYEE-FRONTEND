'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { ILokasiKantor } from '@/@types/organisasi.types'

interface LokasiKantorTableProps {
    data: ILokasiKantor[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (item: ILokasiKantor) => void
    onDelete: (item: ILokasiKantor) => void
}

const LokasiKantorTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: LokasiKantorTableProps) => {
    const columns: ColumnDef<ILokasiKantor>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 60,
                cell: ({ row }: CellContext<ILokasiKantor, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Kode',
                accessorKey: 'kode_lokasi',
                size: 120,
                cell: ({ row }: CellContext<ILokasiKantor, unknown>) => (
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                        {row.original.kode_lokasi}
                    </span>
                ),
            },
            {
                header: 'Nama Lokasi',
                accessorKey: 'nama_lokasi',
                cell: ({ row }: CellContext<ILokasiKantor, unknown>) => (
                    <span className="font-semibold">{row.original.nama_lokasi}</span>
                ),
            },
            {
                header: 'Kota',
                accessorKey: 'kota',
                size: 150,
                cell: ({ row }: CellContext<ILokasiKantor, unknown>) => (
                    <span>{row.original.kota ?? '—'}</span>
                ),
            },
            {
                header: 'Provinsi',
                accessorKey: 'provinsi',
                size: 160,
                cell: ({ row }: CellContext<ILokasiKantor, unknown>) => (
                    <span>{row.original.provinsi ?? '—'}</span>
                ),
            },
            {
                header: 'Telepon',
                accessorKey: 'telepon',
                size: 150,
                cell: ({ row }: CellContext<ILokasiKantor, unknown>) => (
                    <span className="font-mono text-sm">{row.original.telepon ?? '—'}</span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 110,
                cell: ({ row }: CellContext<ILokasiKantor, unknown>) => (
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
                cell: ({ row }: CellContext<ILokasiKantor, unknown>) => (
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

export default LokasiKantorTable
