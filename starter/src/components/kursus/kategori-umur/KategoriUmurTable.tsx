'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IKategoriUmur } from '@/@types/kursus.types'

interface KategoriUmurTableProps {
    data: IKategoriUmur[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (item: IKategoriUmur) => void
    onDelete: (item: IKategoriUmur) => void
}

const KategoriUmurTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: KategoriUmurTableProps) => {
    const columns: ColumnDef<IKategoriUmur>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 60,
                cell: ({ row }: CellContext<IKategoriUmur, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Nama Kategori',
                accessorKey: 'nama_kategori_umur',
                cell: ({ row }: CellContext<IKategoriUmur, unknown>) => (
                    <span className="font-semibold">{row.original.nama_kategori_umur}</span>
                ),
            },
            {
                header: 'Kelas',
                accessorKey: 'nama_kelas',
                size: 140,
                cell: ({ row }: CellContext<IKategoriUmur, unknown>) =>
                    row.original.nama_kelas ?? '-',
            },
            {
                header: 'Paket',
                accessorKey: 'nama_paket',
                size: 140,
                cell: ({ row }: CellContext<IKategoriUmur, unknown>) =>
                    row.original.nama_paket ?? '-',
            },
            {
                header: 'Durasi (bulan)',
                accessorKey: 'durasi',
                size: 120,
                cell: ({ row }: CellContext<IKategoriUmur, unknown>) =>
                    row.original.durasi != null ? `${row.original.durasi} bulan` : '-',
            },
            {
                header: 'Sesi Pertemuan',
                accessorKey: 'sesi_pertemuan',
                size: 120,
                cell: ({ row }: CellContext<IKategoriUmur, unknown>) =>
                    row.original.sesi_pertemuan != null ? `${row.original.sesi_pertemuan}x` : '-',
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 110,
                cell: ({ row }: CellContext<IKategoriUmur, unknown>) => (
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
                cell: ({ row }: CellContext<IKategoriUmur, unknown>) => (
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

export default KategoriUmurTable
