'use client'

import { Drawer, Tag } from '@/components/ui'
import {
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineBookOpen,
    HiOutlineTag,
} from 'react-icons/hi'
import type { IJadwalKelas } from '@/@types/kursus.types'

interface JadwalDetailDrawerProps {
    open: boolean
    jadwal: IJadwalKelas | null
    onClose: () => void
    onRefresh?: () => void
}

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <span className="mt-0.5 text-gray-400 text-lg shrink-0">{icon}</span>
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
)

const JadwalDetailDrawer = ({ open, jadwal, onClose }: JadwalDetailDrawerProps) => {
    if (!jadwal) return null

    return (
        <Drawer
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            closable
            title="Detail Jadwal"
            placement="right"
            width={360}
        >
            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
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
                        value={String(jadwal.kuota)}
                    />
                    <DetailRow
                        icon={<HiOutlineTag />}
                        label="Kategori Umur"
                        value={jadwal.nama_kategori_umur}
                    />
                </div>

                {jadwal.deskripsi && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Catatan</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{jadwal.deskripsi}</p>
                    </div>
                )}
            </div>
        </Drawer>
    )
}

export default JadwalDetailDrawer