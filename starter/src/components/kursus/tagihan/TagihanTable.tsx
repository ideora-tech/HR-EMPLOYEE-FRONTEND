'use client'

import { useMemo } from 'react'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlineEye, HiOutlineTrash, HiOutlineCash, HiOutlineDocumentDownload } from 'react-icons/hi'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import { formatRupiah } from '@/utils/formatNumber'
import type { ITagihan } from '@/@types/kursus.types'

/* ─── helpers ────────────────────────────────────────────── */

const STATUS_MAP: Record<number, { label: string; class: string }> = {
    1: {
        label: 'Menunggu',
        class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    },
    2: {
        label: 'Sebagian',
        class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    },
    3: {
        label: 'Lunas',
        class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    },
    4: {
        label: 'Dibatalkan',
        class: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    },
}

/* ─── props ──────────────────────────────────────────────── */

interface TagihanTableProps {
    data: ITagihan[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onDetail: (item: ITagihan) => void
    onBayar: (item: ITagihan) => void
    onDelete: (item: ITagihan) => void
    onCetak: (item: ITagihan) => void
}

/* ─── component ──────────────────────────────────────────── */

const TagihanTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onDetail,
    onBayar,
    onDelete,
    onCetak,
}: TagihanTableProps) => {
    const columns: ColumnDef<ITagihan>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 55,
                cell: ({ row }: CellContext<ITagihan, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Siswa',
                id: 'siswa',
                cell: ({ row }: CellContext<ITagihan, unknown>) => (
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {row.original.nama_siswa}
                    </span>
                ),
            },
            {
                header: 'Periode',
                accessorKey: 'periode',
                size: 110,
                cell: ({ row }: CellContext<ITagihan, unknown>) => (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {row.original.periode ?? '–'}
                    </span>
                ),
            },
            {
                header: 'Total Tagihan',
                id: 'total_harga',
                size: 150,
                cell: ({ row }: CellContext<ITagihan, unknown>) => (
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                        {formatRupiah(row.original.total_harga)}
                    </span>
                ),
            },
            {
                header: 'Dibayar',
                id: 'total_bayar',
                size: 150,
                cell: ({ row }: CellContext<ITagihan, unknown>) => {
                    const { total_bayar, total_harga } = row.original
                    const pct = total_harga > 0 ? Math.round((total_bayar / total_harga) * 100) : 0
                    return (
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {formatRupiah(total_bayar)}
                            </p>
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                <div
                                    className="h-full bg-emerald-400 rounded-full transition-all"
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                            </div>
                        </div>
                    )
                },
            },
            {
                header: 'Status',
                id: 'status',
                size: 120,
                cell: ({ row }: CellContext<ITagihan, unknown>) => {
                    const st = STATUS_MAP[row.original.status] ?? STATUS_MAP[1]
                    return (
                        <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.class}`}
                        >
                            {st.label}
                        </span>
                    )
                },
            },
            {
                header: '',
                id: 'action',
                size: 110,
                cell: ({ row }: CellContext<ITagihan, unknown>) => {
                    const belumLunas = row.original.status !== 3 && row.original.status !== 4
                    return (
                        <div className="flex items-center justify-end gap-1">

                            <Tooltip title="Download Invoice PDF">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-500/20 dark:text-purple-300 dark:hover:bg-purple-500/30 transition-colors"
                                    onClick={() => onCetak(row.original)}
                                >
                                    <HiOutlineDocumentDownload className="text-lg" />
                                </span>
                            </Tooltip>
                            {belumLunas && (
                                <Tooltip title="Catat Pembayaran">
                                    <span
                                        className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30 transition-colors"
                                        onClick={() => onBayar(row.original)}
                                    >
                                        <HiOutlineCash className="text-lg" />
                                    </span>
                                </Tooltip>
                            )}
                            <Tooltip title="Detail">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                    onClick={() => onDetail(row.original)}
                                >
                                    <HiOutlineEye className="text-lg" />
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
                    )
                },
            },
        ],
        [pagingData.pageIndex, pagingData.pageSize, onCetak, onBayar, onDetail, onDelete],
    )

    return (
        <DataTable
            columns={columns}
            data={data}
            loading={loading}
            noData={!loading && data.length === 0}
            pagingData={pagingData}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
        />
    )
}

export default TagihanTable
