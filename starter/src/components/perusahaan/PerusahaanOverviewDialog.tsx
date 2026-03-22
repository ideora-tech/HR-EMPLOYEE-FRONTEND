'use client'

import { useEffect, useState } from 'react'
import { Dialog, Tag, Spinner, Notification, toast } from '@/components/ui'
import {
    HiOfficeBuilding,
    HiMail,
    HiPhone,
    HiLocationMarker,
    HiUserGroup,
    HiCube,
} from 'react-icons/hi'
import PerusahaanService from '@/services/perusahaan.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IPerusahaan, IPerusahaanOverview } from '@/@types/perusahaan.types'

interface PerusahaanOverviewDialogProps {
    perusahaan: IPerusahaan | null
    onClose: () => void
}

const PAKET_COLOR: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
    STARTER: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300',
    PROFESSIONAL:
        'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
    ENTERPRISE:
        'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
}

const InfoRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string | null | undefined
}) => {
    if (!value) return null
    return (
        <div className="flex items-start gap-3 text-sm">
            <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
            <div>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-gray-700 dark:text-gray-200">{value}</p>
            </div>
        </div>
    )
}

const PerusahaanOverviewDialog = ({
    perusahaan,
    onClose,
}: PerusahaanOverviewDialogProps) => {
    const [overview, setOverview] = useState<IPerusahaanOverview | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!perusahaan) {
            setOverview(null)
            return
        }
        setLoading(true)
        PerusahaanService.getOverview(perusahaan.id_perusahaan)
            .then((res) => {
                if (res.success) setOverview(res.data)
            })
            .catch((err) => {
                toast.push(
                    <Notification type="danger" title="Gagal memuat overview">
                        {parseApiError(err)}
                    </Notification>,
                )
                onClose()
            })
            .finally(() => setLoading(false))
    }, [perusahaan, onClose])

    const paket = overview?.langganan?.paket ?? perusahaan?.langganan?.paket

    return (
        <Dialog
            isOpen={!!perusahaan}
            onClose={onClose}
            onRequestClose={onClose}
            width={540}
        >
            {loading || !overview ? (
                <div className="flex justify-center items-center py-16">
                    <Spinner size={36} />
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        {overview.url_logo ? (
                            <img
                                src={overview.url_logo}
                                alt={overview.nama}
                                className="w-12 h-12 rounded-lg object-contain border border-gray-100 dark:border-gray-700 bg-white shrink-0"
                                onError={(e) => {
                                    ;(e.target as HTMLImageElement).style.display =
                                        'none'
                                }}
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                                <HiOfficeBuilding className="text-indigo-600 dark:text-indigo-300 text-xl" />
                            </div>
                        )}
                        <div>
                            <h5 className="font-bold">{overview.nama}</h5>
                            <Tag
                                className={
                                    overview.aktif === 1
                                        ? 'bg-emerald-100 text-emerald-600 mt-1'
                                        : 'bg-red-100 text-red-500 mt-1'
                                }
                            >
                                {overview.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                            </Tag>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                <HiCube className="text-base" />
                                Paket Langganan
                            </p>
                            {paket ? (
                                <>
                                    <Tag
                                        className={`${PAKET_COLOR[paket] ?? 'bg-gray-100 text-gray-600'} mb-1`}
                                    >
                                        {paket}
                                    </Tag>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Maks {overview.langganan?.maks_karyawan ?? '?'} karyawan
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Sejak{' '}
                                        {overview.langganan?.dibuat_pada
                                            ? new Date(
                                                  overview.langganan.dibuat_pada,
                                              ).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'short',
                                                  year: 'numeric',
                                              })
                                            : '—'}
                                    </p>
                                </>
                            ) : (
                                <span className="text-gray-400 text-sm">
                                    Belum berlangganan
                                </span>
                            )}
                        </div>

                        <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                <HiUserGroup className="text-base" />
                                Total Pengguna
                            </p>
                            <p className="text-3xl font-bold text-gray-700 dark:text-gray-100">
                                {overview.total_pengguna}
                            </p>
                            {overview.langganan && (
                                <p className="text-xs text-gray-400 mt-1">
                                    dari maks{' '}
                                    {overview.langganan.maks_karyawan} karyawan
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Modul */}
                    {overview.modul.length > 0 && (
                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Modul yang Diakses ({overview.modul.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {overview.modul.map((m) => (
                                    <div
                                        key={m.kode_modul}
                                        className="flex flex-col items-start rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800/50"
                                    >
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            {m.nama}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {m.kode_modul}
                                        </span>
                                        {m.batasan && (
                                            <span className="text-xs text-amber-500 mt-0.5">
                                                {Object.entries(m.batasan)
                                                    .map(
                                                        ([k, v]) =>
                                                            `${k}: ${v}`,
                                                    )
                                                    .join(', ')}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Info kontak */}
                    <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                        <InfoRow
                            icon={<HiMail />}
                            label="Email"
                            value={overview.email}
                        />
                        <InfoRow
                            icon={<HiPhone />}
                            label="Telepon"
                            value={overview.telepon}
                        />
                        <InfoRow
                            icon={<HiLocationMarker />}
                            label="Alamat"
                            value={overview.alamat}
                        />
                    </div>
                </>
            )}
        </Dialog>
    )
}

export default PerusahaanOverviewDialog
