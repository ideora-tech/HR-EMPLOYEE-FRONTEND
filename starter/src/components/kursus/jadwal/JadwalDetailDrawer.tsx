'use client'

import { useState, useEffect } from 'react'
import { Drawer, Tag } from '@/components/ui'
import {
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineBookOpen,
    HiOutlineTag,
    HiOutlineAcademicCap,
} from 'react-icons/hi'
import type { IJadwalKelas, ICatatKelasSiswa } from '@/@types/kursus.types'
import CatatKelasSiswaService from '@/services/kursus/catat-kelas-siswa.service'

interface JadwalDetailDrawerProps {
    open: boolean
    jadwal: IJadwalKelas | null
    onClose: () => void
    onRefresh?: () => void
}

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="mt-0.5 text-gray-400 text-lg shrink-0">{icon}</span>
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
)

const JadwalDetailDrawer = ({ open, jadwal, onClose }: JadwalDetailDrawerProps) => {
    const [siswaList, setSiswaList] = useState<ICatatKelasSiswa[]>([])
    const [loadingSiswa, setLoadingSiswa] = useState(false)

    useEffect(() => {
        if (!open) {
            document.body.style.overflow = ''
            setSiswaList([])
            return
        }
        if (!jadwal) return
        setLoadingSiswa(true)
        CatatKelasSiswaService.getByJadwal(jadwal.id_jadwal_kelas)
            .then(res => setSiswaList(res.data ?? []))
            .catch(() => setSiswaList([]))
            .finally(() => setLoadingSiswa(false))
    }, [open, jadwal?.id_jadwal_kelas])

    if (!jadwal) return null

    return (
        <Drawer
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            closable
            title="Detail Jadwal"
            placement="right"
            width={440}
            bodyClass="p-0"
        >
            <div className="px-4 pt-4 pb-6 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-50 truncate">
                            {jadwal.nama_kelas}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{jadwal.nama_kategori_umur}</p>
                    </div>
                    <Tag
                        className={
                            jadwal.aktif === 1
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100'
                                : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100'
                        }
                    >
                        {jadwal.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                    </Tag>
                </div>

                {/* Info rows */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3">
                    <DetailRow
                        icon={<HiOutlineUser />}
                        label="Coach"
                        value={jadwal.nama_karyawan}
                    />
                    <DetailRow
                        icon={<HiOutlineCalendar />}
                        label="Hari"
                        value={jadwal.hari}
                    />
                    <DetailRow
                        icon={<HiOutlineClock />}
                        label="Jam"
                        value={`${jadwal.jam_mulai} – ${jadwal.jam_selesai}`}
                    />
                    <DetailRow
                        icon={<HiOutlineBookOpen />}
                        label="Kuota"
                        value={`${jadwal.kuota_terpakai} / ${jadwal.kuota}`}
                    />
                    <DetailRow
                        icon={<HiOutlineTag />}
                        label="Kategori Umur"
                        value={jadwal.nama_kategori_umur}
                    />
                </div>

                {/* Catatan */}
                {jadwal.deskripsi && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Catatan</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{jadwal.deskripsi}</p>
                    </div>
                )}

                {/* Daftar Siswa */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <HiOutlineAcademicCap className="text-gray-400 text-lg shrink-0" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Siswa di Kelas
                        </p>
                        {!loadingSiswa && (
                            <span className="ml-auto text-xs text-gray-400">
                                {siswaList.length} siswa
                            </span>
                        )}
                    </div>

                    {loadingSiswa ? (
                        <div className="flex items-center justify-center py-5 text-sm text-gray-400">
                            Memuat...
                        </div>
                    ) : siswaList.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">
                            Belum ada siswa terdaftar
                        </p>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {siswaList.map(siswa => (
                                <div
                                    key={siswa.id_catat}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                                >
                                    <div className="flex-1 min-w-0 mr-2">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                            {siswa.nama_siswa}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {siswa.total_sesi_hadir} / {siswa.total_sesi ?? '—'} sesi hadir
                                        </p>
                                    </div>
                                    <Tag
                                        className={
                                            siswa.status === 1
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 shrink-0'
                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 shrink-0'
                                        }
                                    >
                                        {siswa.status === 1 ? 'Berjalan' : 'Selesai'}
                                    </Tag>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Drawer>
    )
}

export default JadwalDetailDrawer
