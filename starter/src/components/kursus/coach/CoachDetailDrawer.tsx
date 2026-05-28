'use client'

import { Drawer } from '@/components/ui'
import {
    HiOutlineUser,
    HiOutlineCurrencyDollar,
    HiOutlineCreditCard,
    HiOutlineAnnotation,
    HiOutlineTag,
    HiOutlineCalendar,
    HiOutlineCheckCircle,
} from 'react-icons/hi'
import type { ICoachPublic } from '@/@types/kursus.types'
import { formatRupiah } from '@/utils/formatNumber'

interface CoachDetailDrawerProps {
    open: boolean
    data: ICoachPublic | null
    onClose: () => void
}

const Row = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
}) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
        <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</div>
        </div>
    </div>
)

function formatDatetime(s: string | null | undefined): string {
    if (!s) return '—'
    const d = new Date(s)
    const day = String(d.getDate()).padStart(2, '0')
    const months = ['Januari','Februari','Maret','April','Mei','Juni',
                    'Juli','Agustus','September','Oktober','November','Desember']
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year}, ${hh}:${mm}`
}

const CoachDetailDrawer = ({ open, data, onClose }: CoachDetailDrawerProps) => {
    if (!data) return null

    const rekeningText =
        data.nama_bank && data.no_rekening
            ? `${data.nama_bank} - ${data.no_rekening}`
            : data.nama_bank ?? data.no_rekening ?? null

    return (
        <Drawer
            title={
                <div className="flex items-center gap-2">
                    <HiOutlineUser className="text-lg text-primary" />
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Detail Coach
                    </span>
                </div>
            }
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            placement="right"
            width={440}
        >
            <div className="px-1 py-2">
                {/* ── Foto & nama ── */}
                <div className="mb-6 flex flex-col items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-5">
                    {data.foto_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={data.foto_url}
                            alt={data.nama_karyawan}
                            className="w-20 h-20 rounded-full object-cover border-2 border-white shadow"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                            {data.nama_karyawan.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="text-center">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-base">
                            {data.nama_karyawan}
                        </p>
                        {data.spesialisasi && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {data.spesialisasi}
                            </p>
                        )}
                        <span
                            className={`mt-2 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                data.aktif === 1
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                    : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300'
                            }`}
                        >
                            {data.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                        </span>
                    </div>
                </div>

                {/* ── Info detail ── */}
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-4 mb-4">
                    <Row
                        icon={<HiOutlineCurrencyDollar />}
                        label="Tarif per Sesi"
                        value={
                            data.tarif_per_sesi != null ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    {formatRupiah(data.tarif_per_sesi)}
                                </span>
                            ) : (
                                <span className="text-gray-400 font-normal">—</span>
                            )
                        }
                    />
                    <Row
                        icon={<HiOutlineCreditCard />}
                        label="Rekening"
                        value={
                            rekeningText ?? (
                                <span className="text-gray-400 font-normal">—</span>
                            )
                        }
                    />
                    <Row
                        icon={<HiOutlineTag />}
                        label="Spesialisasi"
                        value={
                            data.spesialisasi ?? (
                                <span className="text-gray-400 font-normal">—</span>
                            )
                        }
                    />
                    <Row
                        icon={<HiOutlineCheckCircle />}
                        label="Status"
                        value={
                            <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    data.aktif === 1
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                                        : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-100'
                                }`}
                            >
                                {data.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                            </span>
                        }
                    />
                </div>

                {/* ── Bio ── */}
                {data.bio && (
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-4 mb-4">
                        <Row
                            icon={<HiOutlineAnnotation />}
                            label="Bio"
                            value={
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                    {data.bio}
                                </p>
                            }
                        />
                    </div>
                )}

                {/* ── Timestamps ── */}
                <div className="space-y-1 text-xs text-gray-400 px-1">
                    {data.dibuat_pada && (
                        <div className="flex items-center gap-1.5">
                            <HiOutlineCalendar />
                            <span>Dibuat: {formatDatetime(data.dibuat_pada)}</span>
                        </div>
                    )}
                    {data.diubah_pada && (
                        <div className="flex items-center gap-1.5">
                            <HiOutlineCalendar />
                            <span>Diperbarui: {formatDatetime(data.diubah_pada)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Drawer>
    )
}

export default CoachDetailDrawer
