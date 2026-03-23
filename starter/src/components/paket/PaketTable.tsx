'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IPaket, KodePaket } from '@/@types/paket.types'
import { formatNum, formatRupiah } from '@/utils/formatNumber'

const KODE_TAG_CLASS: Record<KodePaket, string> = {
    FREE: 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-100',
    STARTER: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100',
    PROFESSIONAL: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-100',
    ENTERPRISE: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100',
}

const formatMaks = (maks: number) =>
    maks >= 999999 ? 'Unlimited' : formatNum(maks)

interface PaketTableProps {
    data: IPaket[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (paket: IPaket) => void
    onDelete: (paket: IPaket) => void
}

const PaketTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: PaketTableProps) => {
    const columns: ColumnDef<IPaket>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IPaket, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize +
                    row.index +
                    1,
            },
            {
                header: 'Nama Paket',
                accessorKey: 'nama',
                size: 280,
                cell: ({ row }: CellContext<IPaket, unknown>) => (
                    <span className="font-semibold">{row.original.nama}</span>
                ),
            },
            {
                header: 'Kode',
                accessorKey: 'kode_paket',
                size: 160,
                cell: ({ row }: CellContext<IPaket, unknown>) => (
                    <Tag className={KODE_TAG_CLASS[row.original.kode_paket]}>
                        {row.original.kode_paket}
                    </Tag>
                ),
            },
            {
                header: 'Harga',
                accessorKey: 'harga',
                size: 180,
                cell: ({ row }: CellContext<IPaket, unknown>) =>
                    formatRupiah(row.original.harga),
            },
            {
                header: 'Maks. Karyawan',
                accessorKey: 'maks_karyawan',
                size: 180,
                cell: ({ row }: CellContext<IPaket, unknown>) =>
                    formatMaks(row.original.maks_karyawan),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 140,
                cell: ({ row }: CellContext<IPaket, unknown>) => (
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
                cell: ({ row }: CellContext<IPaket, unknown>) => (
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

export default PaketTable
