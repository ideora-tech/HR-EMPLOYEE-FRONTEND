'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlineKey, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IPeran } from '@/@types/peran.types'

interface PeranTableProps {
    data: IPeran[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onAturIzin: (peran: IPeran) => void
    onEdit: (peran: IPeran) => void
    onDelete: (peran: IPeran) => void
    bolehUbah: boolean
    bolehHapus: boolean
}

const TOMBOL = 'cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors'

const PeranTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onAturIzin,
    onEdit,
    onDelete,
    bolehUbah,
    bolehHapus,
}: PeranTableProps) => {
    const columns: ColumnDef<IPeran>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IPeran, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Nama Peran',
                accessorKey: 'nama_peran',
                size: 260,
                cell: ({ row }: CellContext<IPeran, unknown>) => (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{row.original.nama_peran}</span>
                        {row.original.is_sistem === 1 && (
                            <Tag className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">Bawaan</Tag>
                        )}
                    </div>
                ),
            },
            {
                header: 'Kode',
                accessorKey: 'kode_peran',
                size: 150,
                cell: ({ row }: CellContext<IPeran, unknown>) => (
                    <Tag className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-100">
                        {row.original.kode_peran}
                    </Tag>
                ),
            },
            {
                header: 'Jumlah Izin',
                id: 'izin',
                size: 140,
                cell: ({ row }: CellContext<IPeran, unknown>) =>
                    row.original.is_sistem === 1 ? (
                        <span className="text-gray-500">Semua izin paket</span>
                    ) : (
                        <span>{row.original.kode_izin?.length ?? 0} izin</span>
                    ),
            },
            {
                header: 'Pengguna',
                id: 'pengguna',
                size: 110,
                cell: ({ row }: CellContext<IPeran, unknown>) => <span>{row.original.jumlah_pengguna ?? 0}</span>,
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 120,
                cell: ({ row }: CellContext<IPeran, unknown>) => (
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
                cell: ({ row }: CellContext<IPeran, unknown>) => {
                    const owner = row.original.is_sistem === 1
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <Tooltip title={owner || !bolehUbah ? 'Lihat Izin' : 'Atur Izin'}>
                                <span
                                    className={`${TOMBOL} bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-500/20 dark:text-violet-300`}
                                    onClick={() => onAturIzin(row.original)}
                                >
                                    <HiOutlineKey className="text-lg" />
                                </span>
                            </Tooltip>
                            {bolehUbah && !owner && (
                                <Tooltip title="Ubah Nama/Status">
                                    <span
                                        className={`${TOMBOL} bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300`}
                                        onClick={() => onEdit(row.original)}
                                    >
                                        <HiOutlinePencilAlt className="text-lg" />
                                    </span>
                                </Tooltip>
                            )}
                            {bolehHapus && !owner && (
                                <Tooltip title="Hapus">
                                    <span
                                        className={`${TOMBOL} bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400`}
                                        onClick={() => onDelete(row.original)}
                                    >
                                        <HiOutlineTrash className="text-lg" />
                                    </span>
                                </Tooltip>
                            )}
                        </div>
                    )
                },
            },
        ],
        [pagingData.pageIndex, pagingData.pageSize, onAturIzin, onEdit, onDelete, bolehUbah, bolehHapus],
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

export default PeranTable
