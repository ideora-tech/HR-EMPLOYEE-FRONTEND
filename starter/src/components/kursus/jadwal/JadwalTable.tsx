'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IJadwalKelas } from '@/@types/kursus.types'


interface JadwalTableProps {
    data: IJadwalKelas[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (item: IJadwalKelas) => void
    onDelete: (item: IJadwalKelas) => void
}

const JadwalTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: JadwalTableProps) => {
    const columns: ColumnDef<IJadwalKelas>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 60,
                cell: ({ row }: CellContext<IJadwalKelas, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Kelas',
                accessorKey: 'nama_kelas',
                size: 150,
                cell: ({ row }: CellContext<IJadwalKelas, unknown>) => (
                    <span className="font-semibold">{row.original.nama_kelas}</span>
                ),
            },
            {
                header: 'Instruktur',
                accessorKey: 'nama_karyawan',
                size: 150,
                cell: ({ row }: CellContext<IJadwalKelas, unknown>) =>
                    row.original.nama_karyawan,
            },
            {
                header: 'Kategori Umur',
                accessorKey: 'nama_kategori_umur',
                size: 140,
                cell: ({ row }: CellContext<IJadwalKelas, unknown>) =>
                    row.original.nama_kategori_umur,
            },
            {
                header: 'Hari',
                accessorKey: 'hari',
                size: 100,
                cell: ({ row }: CellContext<IJadwalKelas, unknown>) =>
                    row.original.hari,
            },
            {
                header: 'Jam',
                id: 'jam',
                size: 120,
                cell: ({ row }: CellContext<IJadwalKelas, unknown>) =>
                    `${row.original.jam_mulai} – ${row.original.jam_selesai}`,
            },
            {
                header: 'Sesi',
                accessorKey: 'sesi_pertemuan',
                size: 80,
                cell: ({ row }: CellContext<IJadwalKelas, unknown>) => (
                    <span className="font-medium">{row.original.sesi_pertemuan}x</span>
                ),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 110,
                cell: ({ row }: CellContext<IJadwalKelas, unknown>) => (
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
                cell: ({ row }: CellContext<IJadwalKelas, unknown>) => (
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

export default JadwalTable
