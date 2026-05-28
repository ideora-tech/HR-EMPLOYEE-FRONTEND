'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlineEye, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { ICoachPublic } from '@/@types/kursus.types'
import { formatRupiah } from '@/utils/formatNumber'

interface CoachTableProps {
    data: ICoachPublic[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onEdit: (row: ICoachPublic) => void
    onDelete: (row: ICoachPublic) => void
    onViewDetail: (row: ICoachPublic) => void
}

const CoachTable = ({
    data,
    loading = false,
    pagingData,
    onPageChange,
    onPageSizeChange,
    onEdit,
    onDelete,
    onViewDetail,
}: CoachTableProps) => {
    const columns: ColumnDef<ICoachPublic>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<ICoachPublic, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Nama Karyawan',
                accessorKey: 'nama_karyawan',
                size: 240,
                cell: ({ row }: CellContext<ICoachPublic, unknown>) => (
                    <span className="font-semibold">{row.original.nama_karyawan}</span>
                ),
            },
            {
                header: 'Spesialisasi',
                accessorKey: 'spesialisasi',
                size: 200,
                cell: ({ row }: CellContext<ICoachPublic, unknown>) =>
                    row.original.spesialisasi ?? (
                        <span className="text-gray-400">—</span>
                    ),
            },
            {
                header: 'Tarif/Sesi',
                accessorKey: 'tarif_per_sesi',
                size: 160,
                cell: ({ row }: CellContext<ICoachPublic, unknown>) =>
                    row.original.tarif_per_sesi != null ? (
                        <span className="font-medium">{formatRupiah(row.original.tarif_per_sesi)}</span>
                    ) : (
                        <span className="text-gray-400">—</span>
                    ),
            },
            {
                header: 'Rekening',
                id: 'rekening',
                size: 220,
                cell: ({ row }: CellContext<ICoachPublic, unknown>) => {
                    const { nama_bank, no_rekening } = row.original
                    if (!nama_bank && !no_rekening) {
                        return <span className="text-gray-400">—</span>
                    }
                    return (
                        <span className="text-sm">
                            {nama_bank ?? ''}{nama_bank && no_rekening ? ' - ' : ''}{no_rekening ?? ''}
                        </span>
                    )
                },
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 120,
                cell: ({ row }: CellContext<ICoachPublic, unknown>) => (
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
                cell: ({ row }: CellContext<ICoachPublic, unknown>) => (
                    <div className="flex items-center justify-end gap-2">
                        <Tooltip title="Detail">
                            <span
                                className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                onClick={() => onViewDetail(row.original)}
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
        [pagingData.pageIndex, pagingData.pageSize, onViewDetail, onEdit, onDelete],
    )

    return (
        <DataTable
            columns={columns}
            data={data as unknown[]}
            loading={loading}
            noData={!loading && data.length === 0}
            pagingData={pagingData}
            onPaginationChange={onPageChange}
            onSelectChange={onPageSizeChange}
        />
    )
}

export default CoachTable
