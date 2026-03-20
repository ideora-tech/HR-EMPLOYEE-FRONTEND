'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IAksesModulTier } from '@/@types/akses-modul.types'

interface AksesModulTableProps {
    data: IAksesModulTier[]
    loading?: boolean
    onEdit: (item: IAksesModulTier) => void
}

const formatBatasan = (batasan: Record<string, number> | null) => {
    if (!batasan || Object.keys(batasan).length === 0) {
        return <span className="text-gray-400 text-sm">—</span>
    }
    return (
        <div className="flex flex-col gap-0.5">
            {Object.entries(batasan).map(([key, val]) => (
                <span
                    key={key}
                    className="text-xs text-gray-600 dark:text-gray-300"
                >
                    <span className="font-medium">{key}:</span> {val}
                </span>
            ))}
        </div>
    )
}

const AksesModulTable = ({
    data,
    loading = false,
    onEdit,
}: AksesModulTableProps) => {
    const columns: ColumnDef<IAksesModulTier>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IAksesModulTier, unknown>) =>
                    row.index + 1,
            },
            {
                header: 'Kode Modul',
                accessorKey: 'kode_modul',
                size: 220,
                cell: ({ row }: CellContext<IAksesModulTier, unknown>) => (
                    <Tag className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100">
                        {row.original.kode_modul}
                    </Tag>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 140,
                cell: ({ row }: CellContext<IAksesModulTier, unknown>) => (
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
                header: 'Batasan',
                accessorKey: 'batasan',
                cell: ({ row }: CellContext<IAksesModulTier, unknown>) =>
                    formatBatasan(row.original.batasan),
            },
            {
                header: '',
                id: 'action',
                size: 100,
                cell: ({ row }: CellContext<IAksesModulTier, unknown>) => (
                    <div className="flex items-center justify-end gap-2">
                        <Tooltip title="Edit">
                            <span
                                className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                onClick={() => onEdit(row.original)}
                            >
                                <HiOutlinePencilAlt className="text-lg" />
                            </span>
                        </Tooltip>
                    </div>
                ),
            },
        ],
        [onEdit],
    )

    const total = data.length

    return (
        <DataTable
            columns={columns}
            data={data as unknown[]}
            loading={loading}
            noData={!loading && data.length === 0}
            pagingData={{
                total,
                pageIndex: 1,
                pageSize: Math.max(total, 10),
            }}
            onPaginationChange={() => {}}
            onSelectChange={() => {}}
        />
    )
}

export default AksesModulTable
