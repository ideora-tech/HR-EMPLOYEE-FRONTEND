'use client'

import { useMemo } from 'react'
import { Tag, Tooltip } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineArrowCircleRight } from 'react-icons/hi'
import type { ISiswaKelasItem } from '@/@types/kursus.types'

const formatDate = (raw: string | null): string => {
    if (!raw) return '-'
    const d = new Date(raw)
    if (isNaN(d.getTime())) return raw
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface SiswaKelasTableProps {
    data: ISiswaKelasItem[]
    onConvert?: (item: ISiswaKelasItem) => void
    onChangeKelas?: (item: ISiswaKelasItem) => void
}

const SiswaKelasTable = ({ data, onConvert, onChangeKelas }: SiswaKelasTableProps) => {
    const sorted = useMemo(
        () => [...data].sort((a, b) => (b.mulai_kelas ?? '').localeCompare(a.mulai_kelas ?? '')),
        [data],
    )

    if (sorted.length === 0) {
        return (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada riwayat kelas</p>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">No</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Kelas</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jadwal</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Coach</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mulai</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hadir</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Absen</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sisa</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="py-2 px-3 w-24"></th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((item, i) => {
                        const sisa =
                            item.total_sesi !== null
                                ? item.total_sesi - item.total_sesi_hadir - item.total_sesi_tidak_hadir
                                : null
                        const jadwal =
                            item.hari
                                ? `${item.hari}${item.jam_mulai ? `, ${item.jam_mulai}–${item.jam_selesai}` : ''}`
                                : '-'
                        return (
                            <tr
                                key={item.id_catat}
                                className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                            >
                                <td className="py-3 px-3 text-gray-400">{i + 1}</td>
                                <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-100">
                                    {item.nama_kelas}
                                </td>
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{jadwal}</td>
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                                    {item.nama_karyawan ?? '-'}
                                </td>
                                <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                                    {formatDate(item.mulai_kelas)}
                                </td>
                                <td className="py-3 px-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                                    {item.total_sesi_hadir}
                                </td>
                                <td className="py-3 px-3 text-center font-semibold text-red-500 dark:text-red-400">
                                    {item.total_sesi_tidak_hadir}
                                </td>
                                <td className="py-3 px-3 text-center font-semibold text-blue-600 dark:text-blue-400">
                                    {sisa !== null ? sisa : '∞'}
                                </td>
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {item.is_trial === 1 && (
                                            <Tag className="bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                                                Coba
                                            </Tag>
                                        )}
                                        <Tag
                                            className={
                                                item.status === 1
                                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                            }
                                        >
                                            {item.status === 1 ? 'Berjalan' : 'Selesai'}
                                        </Tag>
                                    </div>
                                </td>
                                <td className="py-3 px-3 text-right">
                                    {item.is_trial === 1 && item.status === 1 && (
                                        <div className="flex items-center justify-end gap-1">
                                            {onChangeKelas && (
                                                <Tooltip title="Ubah Kelas">
                                                    <span
                                                        onClick={() => onChangeKelas(item)}
                                                        className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                                    >
                                                        <HiOutlinePencilAlt className="text-lg" />
                                                    </span>
                                                </Tooltip>
                                            )}
                                            {onConvert && (
                                                <Tooltip title="Convert ke Reguler">
                                                    <span
                                                        onClick={() => onConvert(item)}
                                                        className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30 transition-colors"
                                                    >
                                                        <HiOutlineArrowCircleRight className="text-lg" />
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default SiswaKelasTable
