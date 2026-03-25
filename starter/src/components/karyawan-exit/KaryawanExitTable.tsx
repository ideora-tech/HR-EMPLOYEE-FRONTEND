'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IKaryawanExit, JenisExit } from '@/@types/karyawan-exit.types'

const JENIS_EXIT_STYLE: Record<
    JenisExit,
    { label: string; className: string }
> = {
    RESIGN: {
        label: 'Resign',
        className:
            'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100',
    },
    TERMINASI: {
        label: 'Terminasi (PHK)',
        className:
            'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100',
    },
    PENSIUN: {
        label: 'Pensiun',
        className:
            'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100',
    },
    KONTRAK_BERAKHIR: {
        label: 'Kontrak Berakhir',
        className:
            'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
    },
    KESEPAKATAN_BERSAMA: {
        label: 'Kesepakatan Bersama',
        className:
            'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-100',
    },
    MENINGGAL_DUNIA: {
        label: 'Meninggal Dunia',
        className:
            'bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
    },
}

const fmtDate = (s: string | null) =>
    s
        ? new Date(s).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        : '—'

interface KaryawanExitTableProps {
    data: IKaryawanExit[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (item: IKaryawanExit) => void
    onDelete: (item: IKaryawanExit) => void
}

const KaryawanExitTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: KaryawanExitTableProps) => {
    const columns: ColumnDef<IKaryawanExit>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 60,
                cell: ({ row }: CellContext<IKaryawanExit, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize +
                    row.index +
                    1,
            },
            {
                header: 'Karyawan',
                id: 'karyawan',
                cell: ({ row }: CellContext<IKaryawanExit, unknown>) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">
                            {row.original.karyawan?.nama ?? '—'}
                        </span>
                        {row.original.karyawan?.nik && (
                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-1.5 py-0.5 rounded w-fit">
                                {row.original.karyawan.nik}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                header: 'Jenis Exit',
                accessorKey: 'jenis_exit',
                size: 175,
                cell: ({ row }: CellContext<IKaryawanExit, unknown>) => {
                    const style =
                        JENIS_EXIT_STYLE[row.original.jenis_exit] ??
                        JENIS_EXIT_STYLE.RESIGN
                    return (
                        <Tag className={style.className}>{style.label}</Tag>
                    )
                },
            },
            {
                header: 'Tgl Pengajuan',
                accessorKey: 'tanggal_pengajuan',
                size: 140,
                cell: ({ row }: CellContext<IKaryawanExit, unknown>) => (
                    <span className="text-sm">
                        {fmtDate(row.original.tanggal_pengajuan)}
                    </span>
                ),
            },
            {
                header: 'Hari Kerja Terakhir',
                accessorKey: 'hari_kerja_terakhir',
                size: 160,
                cell: ({ row }: CellContext<IKaryawanExit, unknown>) => (
                    <span className="text-sm">
                        {fmtDate(row.original.hari_kerja_terakhir)}
                    </span>
                ),
            },
            {
                header: 'Tgl Efektif Keluar',
                accessorKey: 'tanggal_efektif_keluar',
                size: 155,
                cell: ({ row }: CellContext<IKaryawanExit, unknown>) => (
                    <span className="text-sm font-medium">
                        {fmtDate(row.original.tanggal_efektif_keluar)}
                    </span>
                ),
            },
            {
                header: 'Rehire',
                accessorKey: 'dapat_direkrut_kembali',
                size: 100,
                cell: ({ row }: CellContext<IKaryawanExit, unknown>) => (
                    <Tag
                        className={
                            row.original.dapat_direkrut_kembali === 1
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100'
                                : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100'
                        }
                    >
                        {row.original.dapat_direkrut_kembali === 1
                            ? 'Eligible'
                            : 'Tidak'}
                    </Tag>
                ),
            },
            {
                header: '',
                id: 'action',
                size: 90,
                cell: ({ row }: CellContext<IKaryawanExit, unknown>) => (
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
            data={data}
            loading={loading}
            pagingData={pagingData}
            onPaginationChange={onPaginationChange}
            onSelectChange={onSelectChange}
        />
    )
}

export default KaryawanExitTable
