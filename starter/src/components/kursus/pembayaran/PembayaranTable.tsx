'use client'

import { useMemo } from 'react'
import { Tag } from '@/components/ui'
import { HiOutlineTrash } from 'react-icons/hi'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IPembayaran } from '@/@types/kursus.types'

interface PembayaranTableProps {
    data: IPembayaran[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (size: number) => void
    onDelete: (item: IPembayaran) => void
}

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

const formatTanggal = (value: string) => {
    const d = new Date(value)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const METODE_COLOR: Record<string, string> = {
    TUNAI: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    TRANSFER: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    QRIS: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
}

const PembayaranTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onDelete,
}: PembayaranTableProps) => {
    const columns: ColumnDef<IPembayaran>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 55,
                cell: ({ row }: CellContext<IPembayaran, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Siswa',
                id: 'siswa',
                cell: ({ row }: CellContext<IPembayaran, unknown>) => (
                    <span className="font-medium">
                        {row.original.tagihan?.nama_siswa ?? '-'}
                    </span>
                ),
            },
            {
                header: 'Jumlah',
                id: 'jumlah',
                size: 160,
                cell: ({ row }: CellContext<IPembayaran, unknown>) => (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(row.original.jumlah)}
                    </span>
                ),
            },
            {
                header: 'Tgl. Bayar',
                id: 'tanggal_bayar',
                size: 130,
                cell: ({ row }: CellContext<IPembayaran, unknown>) => (
                    <span className="text-sm">{formatTanggal(row.original.tanggal_bayar)}</span>
                ),
            },
            {
                header: 'Metode',
                id: 'metode',
                size: 130,
                cell: ({ row }: CellContext<IPembayaran, unknown>) => (
                    <Tag className={`${METODE_COLOR[row.original.metode] ?? 'bg-gray-100 text-gray-600'} border-0`}>
                        {row.original.metode}
                    </Tag>
                ),
            },
            {
                header: 'Referensi',
                id: 'referensi',
                size: 160,
                cell: ({ row }: CellContext<IPembayaran, unknown>) => (
                    <span className="text-sm text-gray-500">{row.original.referensi ?? '-'}</span>
                ),
            },
            {
                header: 'Status',
                id: 'aktif',
                size: 100,
                cell: ({ row }: CellContext<IPembayaran, unknown>) => (
                    <Tag
                        className={`${row.original.aktif === 1
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100'
                                : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100'
                            } border-0`}
                    >
                        {row.original.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                    </Tag>
                ),
            },
            {
                header: '',
                id: 'action',
                size: 80,
                cell: ({ row }: CellContext<IPembayaran, unknown>) => (
                    <div className="flex items-center justify-end">
                        <span
                            className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-colors"
                            onClick={() => onDelete(row.original)}
                        >
                            <HiOutlineTrash className="text-lg" />
                        </span>
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pagingData.pageIndex, pagingData.pageSize],
    )

    return (
        <DataTable
            columns={columns}
            data={data}
            loading={loading}
            pagingData={pagingData}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
        />
    )
}

export default PembayaranTable
