'use client'

import { Tag, Button } from '@/components/ui'
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineAcademicCap } from 'react-icons/hi'
import type { ISiswa } from '@/@types/kursus.types'

interface SiswaDetailHeaderProps {
    siswa: ISiswa
    onEdit: () => void
    onInputKelas: () => void
    onHapus: () => void
}

const formatDate = (raw: string | null): string => {
    if (!raw) return '-'
    const d = new Date(raw)
    if (isNaN(d.getTime())) return raw
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatJK = (jk: number | null): string => {
    if (jk === 1) return 'Laki-laki'
    if (jk === 2) return 'Perempuan'
    return '-'
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <span className="text-xs text-gray-400">{label}: </span>
        <span className="text-sm text-gray-700 dark:text-gray-200">{value}</span>
    </div>
)

const SiswaDetailHeader = ({ siswa, onEdit, onInputKelas, onHapus }: SiswaDetailHeaderProps) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-gray-900 dark:text-gray-50 m-0">{siswa.nama_siswa}</h4>
                        {siswa.nama_panggilan && (
                            <span className="text-sm text-gray-400">({siswa.nama_panggilan})</span>
                        )}
                        <Tag
                            className={
                                siswa.aktif === 1
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100'
                                    : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100'
                            }
                        >
                            {siswa.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                        </Tag>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                        <InfoItem label="Telepon" value={siswa.telepon ?? '-'} />
                        <InfoItem label="Email" value={siswa.email ?? '-'} />
                        <InfoItem label="Jenis Kelamin" value={formatJK(siswa.jenis_kelamin)} />
                        <InfoItem label="Tanggal Lahir" value={formatDate(siswa.tanggal_lahir)} />
                        {siswa.alamat && <InfoItem label="Alamat" value={siswa.alamat} />}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        variant="default"
                        icon={<HiOutlineAcademicCap />}
                        onClick={onInputKelas}
                    >
                        Input Kelas
                    </Button>
                    <Button
                        size="sm"
                        variant="default"
                        icon={<HiOutlinePencilAlt />}
                        onClick={onEdit}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="default"
                        icon={<HiOutlineTrash />}
                        customColorClass={() =>
                            'border-red-200 text-red-500 hover:bg-red-50 active:bg-red-100 dark:border-red-500/30 dark:hover:bg-red-500/10'
                        }
                        onClick={onHapus}
                    >
                        Hapus
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SiswaDetailHeader
