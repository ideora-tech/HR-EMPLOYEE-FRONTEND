'use client'

import { useMemo } from 'react'
import DataTable from '@/components/shared/DataTable'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineAcademicCap, HiOutlineEye } from 'react-icons/hi'
import type { ColumnDef, CellContext } from '@/components/shared/DataTable'
import type { ISiswa } from '@/@types/kursus.types'

const formatJenisKelamin = (jk: number | null): string => {
    if (jk === 1) return 'Laki-laki'
    if (jk === 2) return 'Perempuan'
    return '-'
}

interface SiswaTableProps {
    data: ISiswa[]
    loading?: boolean
    pagingData: { total: number; pageIndex: number; pageSize: number }
    onPaginationChange: (page: number) => void
    onSelectChange: (pageSize: number) => void
    onEdit: (item: ISiswa) => void
    onDelete: (item: ISiswa) => void
    onAssignKelas?: (item: ISiswa) => void
    onViewKelas?: (item: ISiswa) => void
}

const SiswaTable = ({
    data,
    loading = false,
    pagingData,
    onPaginationChange,
    onSelectChange,
    onEdit,
    onDelete,
    onAssignKelas,
    onViewKelas,
}: SiswaTableProps) => {
    const columns: ColumnDef<ISiswa>[] = useMemo(
        () => [
            {
                header: 'No',
                id: 'no',
                size: 70,
                cell: ({ row }: CellContext<ISiswa, unknown>) =>
                    (pagingData.pageIndex - 1) * pagingData.pageSize + row.index + 1,
            },
            {
                header: 'Nama',
                accessorKey: 'nama_siswa',
                size: 220,
                cell: ({ row }: CellContext<ISiswa, unknown>) => (
                    <span className="font-semibold">{row.original.nama_siswa}</span>
                ),
            },
            {
                header: 'Email',
                accessorKey: 'email',
                size: 220,
                cell: ({ row }: CellContext<ISiswa, unknown>) => (
                    <span className="text-sm">{row.original.email ?? '-'}</span>
                ),
            },
            {
                header: 'Telepon',
                accessorKey: 'telepon',
                size: 160,
                cell: ({ row }: CellContext<ISiswa, unknown>) =>
                    row.original.telepon ?? '-',
            },
            {
                header: 'Jenis Kelamin',
                accessorKey: 'jenis_kelamin',
                size: 150,
                cell: ({ row }: CellContext<ISiswa, unknown>) =>
                    formatJenisKelamin(row.original.jenis_kelamin),
            },
            {
                header: 'Status',
                accessorKey: 'aktif',
                size: 120,
                cell: ({ row }: CellContext<ISiswa, unknown>) => (
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
                header: 'Kelas Diikuti',
                id: 'kelas',
                size: 240,
                cell: ({ row }: CellContext<ISiswa, unknown>) => {
                    const kelas = row.original.kelas ?? []
                    if (kelas.length === 0)
                        return <span className="text-xs text-gray-400 italic">Belum ada kelas</span>
                    const visible = kelas.slice(0, 2)
                    const extra = kelas.length - visible.length
                    return (
                        <div className="flex flex-wrap gap-1">
                            {visible.map((k) => (
                                <span
                                    key={k.id_catat}
                                    className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${k.status === 1
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    {k.nama_kelas}
                                </span>
                            ))}
                            {extra > 0 && (
                                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/20 dark:text-blue-300 font-medium">
                                    +{extra} lagi
                                </span>
                            )}
                        </div>
                    )
                },
            },
            {
                header: '',
                id: 'action',
                size: 100,
                cell: ({ row }: CellContext<ISiswa, unknown>) => (
                    <div className="flex items-center justify-end gap-2">
                        {onViewKelas && (
                            <Tooltip title="Detail Kelas">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30 transition-colors"
                                    onClick={() => onViewKelas(row.original)}
                                >
                                    <HiOutlineEye className="text-lg" />
                                </span>
                            </Tooltip>
                        )}
                        {onAssignKelas && (
                            <Tooltip title="Input Kelas">
                                <span
                                    className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-500/20 dark:text-teal-300 dark:hover:bg-teal-500/30 transition-colors"
                                    onClick={() => onAssignKelas(row.original)}
                                >
                                    <HiOutlineAcademicCap className="text-lg" />
                                </span>
                            </Tooltip>
                        )}
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
        [pagingData.pageIndex, pagingData.pageSize, onEdit, onDelete, onAssignKelas, onViewKelas],
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

export default SiswaTable
