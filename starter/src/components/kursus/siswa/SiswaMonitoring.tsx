'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Notification, Spinner, toast } from '@/components/ui'
import { HiOutlineRefresh, HiOutlineExclamationCircle, HiOutlineClock } from 'react-icons/hi'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import type { ISiswaMonitoring, ISiswaMonitoringEntry } from '@/@types/kursus.types'

/* ─── helpers ────────────────────────────────────────────── */

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

/* ─── sub-component: card per siswa ─────────────────────── */

interface SiswaCardProps {
    entry: ISiswaMonitoringEntry
    variant: 'berhenti' | 'expired'
}

const SiswaCard = ({ entry, variant }: SiswaCardProps) => {
    const isBerhenti = variant === 'berhenti'
    return (
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{entry.nama}</p>
                    {entry.telepon && (
                        <p className="text-xs text-gray-400 mt-0.5">{entry.telepon}</p>
                    )}
                    {entry.email && (
                        <p className="text-xs text-gray-400">{entry.email}</p>
                    )}
                </div>
                <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isBerhenti
                            ? 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}
                >
                    {isBerhenti ? (
                        <><HiOutlineExclamationCircle className="text-sm" /> Berhenti</>
                    ) : (
                        <><HiOutlineClock className="text-sm" /> Akan Habis</>
                    )}
                </span>
            </div>

            <div className="space-y-1.5">
                {entry.kelas.map((k) => (
                    <div
                        key={k.id_daftar}
                        className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 gap-2"
                    >
                        <span className="text-gray-700 dark:text-gray-200 font-medium truncate">
                            {k.nama_jadwal}
                        </span>
                        <div className="shrink-0 text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(k.tanggal_selesai)}
                            </p>
                            {k.hari_tersisa !== null && (
                                <p
                                    className={`text-xs font-semibold ${
                                        k.hari_tersisa <= 7
                                            ? 'text-red-500'
                                            : 'text-amber-500'
                                    }`}
                                >
                                    {k.hari_tersisa} hari lagi
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─── main component ─────────────────────────────────────── */

const SiswaMonitoring = () => {
    const [data, setData] = useState<ISiswaMonitoring | null>(null)
    const [loading, setLoading] = useState(false)
    const [expiringDays, setExpiringDays] = useState('30')

    const fetchData = async (days?: number) => {
        setLoading(true)
        try {
            const res = await SiswaService.getMonitoring(days ?? Number(expiringDays))
            if (res.success) setData(res.data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data monitoring">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(30)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleRefresh = () => {
        const days = Number(expiringDays)
        if (!days || days < 1) return
        fetchData(days)
    }

    const berhenti = data?.berhenti ?? []
    const akanExpired = data?.akan_expired ?? []

    return (
        <div className="p-4 space-y-6">
            {/* Filter bar */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        Tampilkan yang habis dalam
                    </span>
                    <Input
                        type="number"
                        min={1}
                        max={365}
                        className="w-20"
                        value={expiringDays}
                        onChange={(e) => setExpiringDays(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRefresh() }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">hari</span>
                </div>
                <Button
                    size="sm"
                    variant="default"
                    icon={<HiOutlineRefresh />}
                    loading={loading}
                    onClick={handleRefresh}
                >
                    Refresh
                </Button>
            </div>

            {loading && !data ? (
                <div className="flex justify-center py-16">
                    <Spinner size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Berhenti */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <HiOutlineExclamationCircle className="text-red-500 text-xl" />
                            <h6 className="font-semibold text-gray-700 dark:text-gray-200">
                                Siswa Berhenti
                            </h6>
                            <span className="ml-auto text-xs font-semibold bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full">
                                {berhenti.length}
                            </span>
                        </div>
                        {berhenti.length === 0 ? (
                            <div className="text-center py-10 text-sm text-gray-400">
                                Tidak ada siswa berhenti
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {berhenti.map((entry) => (
                                    <SiswaCard key={entry.id_siswa} entry={entry} variant="berhenti" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Akan Expired */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <HiOutlineClock className="text-amber-500 text-xl" />
                            <h6 className="font-semibold text-gray-700 dark:text-gray-200">
                                Akan Berakhir (≤ {expiringDays} hari)
                            </h6>
                            <span className="ml-auto text-xs font-semibold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                {akanExpired.length}
                            </span>
                        </div>
                        {akanExpired.length === 0 ? (
                            <div className="text-center py-10 text-sm text-gray-400">
                                Tidak ada siswa yang akan berakhir dalam {expiringDays} hari
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {akanExpired.map((entry) => (
                                    <SiswaCard key={entry.id_siswa} entry={entry} variant="expired" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SiswaMonitoring
