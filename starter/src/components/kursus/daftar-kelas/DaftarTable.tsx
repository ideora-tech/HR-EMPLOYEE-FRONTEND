'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { IDaftarKelas } from '@/@types/kursus.types'

const HARI_MAP: Record<number, string> = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis',
    5: 'Jumat', 6: 'Sabtu', 7: 'Minggu',
}

const STATUS_MAP: Record<number, { label: string; class: string }> = {
    1: { label: 'Aktif', class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100' },
    2: { label: 'Selesai', class: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100' },
    3: { label: 'Berhenti', class: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100' },
}

interface DaftarTableProps {
    data: IDaftarKelas[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (item: IDaftarKelas) => void
    onDelete: (item: IDaftarKelas) => void
}

const DaftarTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
}: DaftarTableProps) => {
    const columns: ColumnDef<IDaftarKelas>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<IDaftarKelas, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Siswa',
                id: 'siswa',
                size: 200,
                cell: ({ row }: CellContext<IDaftarKelas, unknown>) => (
                    <div>
                        <div className="font-semibold">{row.original.siswa.nama}</div>
                        <div className="text-xs text-gray-400">{row.original.siswa.telepon ?? row.original.siswa.email ?? '-'}</div>
                    </div>
                ),
            },
            {
                header: 'Kelas',
                id: 'jadwal',
                size: 220,
                cell: ({ row }: CellContext<IDaftarKelas, unknown>) => {
                    const j = row.original.jadwal
                    return (
                        <div>
                            <div className="font-medium">{j.nama}</div>
                            <div className="text-xs text-gray-400">
                                {HARI_MAP[j.hari]} · {j.jam_mulai}–{j.jam_selesai}
                            </div>
                            <div className="text-xs text-gray-400">{j.program.nama}</div>
                        </div>
                    )
                },
            },
            {
                header: 'Tgl Daftar',
                accessorKey: 'tanggal_daftar',
                size: 130,
                cell: ({ row }: CellContext<IDaftarKelas, unknown>) =>
                    row.original.tanggal_daftar,
            },
            {
                header: 'Tarif',
                id: 'tarif',
                size: 160,
                cell: ({ row }: CellContext<IDaftarKelas, unknown>) =>
                    row.original.tarif ? row.original.tarif.nama : (
                        <span className="text-gray-400 text-sm">-</span>
                    ),
            },
            {
                header: 'Status',
                accessorKey: 'status',
                size: 120,
                cell: ({ row }: CellContext<IDaftarKelas, unknown>) => {
                    const s = STATUS_MAP[row.original.status] ?? STATUS_MAP[1]
                    return <Tag className={s.class}>{s.label}</Tag>
                },
            },
            {
                header: '',
                id: 'action',
                size: 100,
                cell: ({ row }: CellContext<IDaftarKelas, unknown>) => (
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

export default DaftarTable
