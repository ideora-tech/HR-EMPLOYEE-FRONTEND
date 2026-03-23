'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import {
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineEye,
} from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IPerusahaan } from '@/@types/perusahaan.types'

interface PerusahaanTableProps {
    data: IPerusahaan[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onDetail: (perusahaan: IPerusahaan) => void
    onEdit: (perusahaan: IPerusahaan) => void
    onDelete: (perusahaan: IPerusahaan) => void
}

const PAKET_COLOR: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
    STARTER: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300',
    PROFESSIONAL: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
    ENTERPRISE: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
}

const PerusahaanTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onDetail,
    onEdit,
    onDelete,
}: PerusahaanTableProps) => {
    const columns: ColumnDef<IPerusahaan>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IPerusahaan, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize +
                    row.index +
                    1,
            },
            {
                header: 'Perusahaan',
                accessorKey: 'nama',
                size: 260,
                cell: ({ row }: CellContext<IPerusahaan, unknown>) => (
                    <div className="flex items-center gap-3">
                        {row.original.url_logo ? (
                            <img
                                src={row.original.url_logo}
                                alt={row.original.nama}
                                className="w-8 h-8 rounded object-contain border border-gray-100 dark:border-gray-700 bg-white shrink-0"
                                onError={(e) => {
                                    ; (e.target as HTMLImageElement).style.display =
                                        'none'
                                }}
                            />
                        ) : (
                            <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                                <span className="text-indigo-600 dark:text-indigo-300 text-xs font-bold">
                                    {row.original.nama.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div>
                            <p className="font-semibold">{row.original.nama}</p>
                            {row.original.email && (
                                <p className="text-xs text-gray-400">
                                    {row.original.email}
                                </p>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Paket',
                id: 'paket',
                size: 160,
                cell: ({ row }: CellContext<IPerusahaan, unknown>) => {
                    const paket = row.original.langganan?.paket
                    if (!paket)
                        return (
                            <span className="text-gray-300 dark:text-gray-600 text-xs">
                                —
                            </span>
                        )
                    return (
                        <div className="flex flex-col gap-1">
                            <Tag
                                className={
                                    PAKET_COLOR[paket] ??
                                    'bg-gray-100 text-gray-600'
                                }
                            >
                                {paket}
                            </Tag>
                            <span className="text-xs text-gray-400">
                                Maks {row.original.langganan?.maks_karyawan ?? '?'} org
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Pengguna',
                id: 'total_pengguna',
                size: 100,
                cell: ({ row }: CellContext<IPerusahaan, unknown>) => (
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {row.original.total_pengguna ?? (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                    </span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 110,
                cell: ({ row }: CellContext<IPerusahaan, unknown>) => (
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
                size: 130,
                cell: ({ row }: CellContext<IPerusahaan, unknown>) => (
                    <div className="flex items-center justify-end gap-2">
                        <Tooltip title="Lihat Detail">
                            <span
                                className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-500/20 dark:text-teal-300 dark:hover:bg-teal-500/30 transition-colors"
                                onClick={() => onDetail(row.original)}
                            >
                                <HiOutlineEye className="text-lg" />
                            </span>
                        </Tooltip>
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
        [pagingData.pageIndex, pagingData.pageSize, onDetail, onEdit, onDelete],
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

export default PerusahaanTable
