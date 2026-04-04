'use client'

import { Select } from '@/components/ui'

export type KeteranganValue = 1 | 2

type KetOption = { value: KeteranganValue; label: string }

const KET_OPTIONS: KetOption[] = [
    { value: 1, label: 'Hadir' },
    { value: 2, label: 'Tidak Hadir' },
]

const KET_CLASS: Record<KeteranganValue, string> = {
    1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    2: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
}

export type PresensiRow = {
    id_detail: string
    id_daftar: string
    nama_siswa: string
    telepon: string | null
    keterangan: KeteranganValue
    catatan: string
}

interface PresensiDetailTableProps {
    rows: PresensiRow[]
    onChange: (id_detail: string, field: 'keterangan' | 'catatan', value: KeteranganValue | string) => void
    disabled?: boolean
}

const PresensiDetailTable = ({ rows, onChange, disabled = false }: PresensiDetailTableProps) => {
    if (rows.length === 0) {
        return (
            <div className="py-10 text-center text-gray-400 text-sm">
                Tidak ada siswa terdaftar aktif di kelas ini.
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left py-2 px-3 font-semibold text-gray-500 dark:text-gray-400 w-10">No</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-500 dark:text-gray-400">Siswa</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-500 dark:text-gray-400 w-36">Keterangan</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-500 dark:text-gray-400">Catatan</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => {
                        const selectedKet = KET_OPTIONS.find((o) => o.value === row.keterangan) ?? KET_OPTIONS[0]
                        return (
                            <tr
                                key={row.id_detail}
                                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <td className="py-2 px-3 text-gray-400">{idx + 1}</td>
                                <td className="py-2 px-3">
                                    <div className="font-medium text-gray-800 dark:text-gray-100">
                                        {row.nama_siswa}
                                    </div>
                                    {row.telepon && (
                                        <div className="text-xs text-gray-400">{row.telepon}</div>
                                    )}
                                </td>
                                <td className="py-2 px-3">
                                    {disabled ? (
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${KET_CLASS[row.keterangan]}`}>
                                            {selectedKet.label}
                                        </span>
                                    ) : (
                                        <Select<KetOption>
                                            options={KET_OPTIONS}
                                            value={selectedKet}
                                            size="sm"
                                            onChange={(opt) =>
                                                onChange(row.id_detail, 'keterangan', (opt as KetOption).value)
                                            }
                                        />
                                    )}
                                </td>
                                <td className="py-2 px-3">
                                    {disabled ? (
                                        <span className="text-gray-500">{row.catatan || '—'}</span>
                                    ) : (
                                        <input
                                            type="text"
                                            className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400 dark:text-gray-100 placeholder:text-gray-400"
                                            placeholder="Catatan (opsional)"
                                            value={row.catatan}
                                            onChange={(e) =>
                                                onChange(row.id_detail, 'catatan', e.target.value)
                                            }
                                        />
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

export { KET_OPTIONS, KET_CLASS }
export default PresensiDetailTable
