'use client'

import { useMemo } from 'react'
import { Tag } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import { formatRupiah } from '@/utils/formatNumber'
import type { IDiskon } from '@/@types/kursus.types'

interface DiskonTableProps {
    data: IDiskon[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (size: number) => void
    onEdit: (item: IDiskon) => void
    onDelete: (item: IDiskon) => void
}

const formatTanggal = (value: string | null) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const DiskonTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: DiskonTableProps) => {
    const columns: ColumnDef<IDiskon>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IDiskon, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Kode',
                accessorKey: 'kode_diskon',
                size: 160,
                cell: ({ row }: CellContext<IDiskon, unknown>) => (
                    <span className="font-mono text-sm font-semibold">{row.original.kode_diskon}</span>
                ),
            },
            {
                header: 'Nama Diskon',
                accessorKey: 'nama_diskon',
                cell: ({ row }: CellContext<IDiskon, unknown>) => (
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{row.original.nama_diskon}</span>
                ),
            },
            {
                header: 'Diskon',
                id: 'diskon',
                size: 140,
                cell: ({ row }: CellContext<IDiskon, unknown>) => {
                    const { persentase, harga } = row.original
                    const text =
                        persentase != null ? `${persentase}%` :
                            harga != null ? formatRupiah(harga) : '-'
                    return <span className="font-medium">{text}</span>
                },
            },
            {
                header: 'Berlaku',
                id: 'berlaku',
                size: 200,
                cell: ({ row }: CellContext<IDiskon, unknown>) => {
                    const { berlaku_mulai, berlaku_sampai } = row.original
                    if (!berlaku_mulai && !berlaku_sampai) return <span className="text-gray-400">-</span>
                    return (
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatTanggal(berlaku_mulai)} – {formatTanggal(berlaku_sampai)}
                        </span>
                    )
                },
            },
            {
                header: 'Status',
                id: 'status',
                size: 100,
                cell: ({ row }: CellContext<IDiskon, unknown>) => (
                    <Tag className={`${row.original.aktif === 1 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100' : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100'} border-0`}>
                        {row.original.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                    </Tag>
                ),
            },
            {
                header: '',
                id: 'action',
                size: 100,
                cell: ({ row }: CellContext<IDiskon, unknown>) => (
                    <div className="flex items-center justify-end gap-2">
                        <span
                            className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                            onClick={() => onEdit(row.original)}
                        >
                            <HiOutlinePencilAlt className="text-lg" />
                        </span>
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

export default DiskonTable
