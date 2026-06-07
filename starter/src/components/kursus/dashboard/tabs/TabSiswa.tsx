'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Notification, toast } from '@/components/ui'
import KpiCard from '../widgets/KpiCard'
import ReminderList from '../widgets/ReminderList'
import KursusDashboardService from '@/services/kursus/dashboard.service'
import { formatRupiah } from '@/utils/formatNumber'
import { COLORS } from '@/constants/chart.constant'
import type { IKursusDashboardSiswa } from '@/@types/kursus.types'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const STATUS_LABEL: Record<number, string> = { 1: 'BARU', 2: 'AKTIF', 3: 'SELESAI', 4: 'DIBATALKAN' }
const TAGIHAN_BADGE: Record<number, string> = {
    1: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    2: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
}

const TabSiswa = () => {
    const [data, setData] = useState<IKursusDashboardSiswa | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        KursusDashboardService.getSiswa()
            .then(res => { if (res.success) setData(res.data) })
            .catch(() => toast.push(<Notification type="danger" title="Gagal memuat data siswa" />))
            .finally(() => setLoading(false))
    }, [])

    const barOptions: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false } },
        xaxis: { categories: data?.per_kelas.map(k => k.nama_kelas) ?? [] },
        colors: [COLORS[0]],
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
        dataLabels: { enabled: false },
        grid: { borderColor: 'rgba(0,0,0,0.06)' },
    }

    const donutOptions: ApexOptions = {
        chart: { type: 'donut' },
        labels: data?.per_status.map(s => STATUS_LABEL[s.status_pendaftaran] ?? `Status ${s.status_pendaftaran}`) ?? [],
        colors: [COLORS[2], COLORS[0], COLORS[4], COLORS[1]],
        legend: { position: 'bottom' },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '65%' } } },
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon="🆕" label="Siswa Baru" color="blue"
                    value={data?.siswa_baru_bulan_ini ?? 0} loading={loading} sub="Bulan ini" />
                <KpiCard icon="✅" label="Siswa Aktif" color="purple"
                    value={data?.siswa_aktif ?? 0} loading={loading} href="/kursus/siswa" />
                <KpiCard icon="🎓" label="Selesai" color="teal"
                    value={data?.siswa_selesai ?? 0} loading={loading} />
                <KpiCard icon="⚠️" label="Ada Tunggakan" color="orange"
                    value={data?.siswa_dengan_tunggakan ?? 0} loading={loading}
                    sub={data ? formatRupiah(data.nominal_total_tunggakan) : undefined}
                    href="/kursus/tagihan" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h6 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Siswa per Kelas</h6>
                    {loading ? <div className="h-52 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /> : (
                        <Chart type="bar" height={220} options={barOptions}
                            series={[{ name: 'Siswa', data: data?.per_kelas.map(k => k.jumlah) ?? [] }]} />
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h6 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Status Pendaftaran</h6>
                    {loading ? <div className="h-52 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /> : (
                        <Chart type="donut" height={220} options={donutOptions}
                            series={data?.per_status.map(s => s.jumlah) ?? []} />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-700 dark:text-gray-200">Siswa dengan Tunggakan</h6>
                        {data && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{data.siswa_dengan_tunggakan} siswa</span>}
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/60">
                            <tr>
                                {['Nama', 'Kelas', 'Tunggakan', 'Status'].map(h => (
                                    <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td></tr>
                                ))
                            ) : (data?.tunggakan_list ?? []).map(t => (
                                <tr key={t.id_siswa} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="px-4 py-2.5 font-medium">{t.nama_siswa}</td>
                                    <td className="px-4 py-2.5 text-gray-500 text-xs">{t.nama_kelas}</td>
                                    <td className="px-4 py-2.5 font-bold text-red-500">{formatRupiah(t.nominal)}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${TAGIHAN_BADGE[t.status_tagihan] ?? ''}`}>
                                            {t.status_tagihan === 1 ? 'MENUNGGU' : 'SEBAGIAN'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="font-semibold text-gray-700 dark:text-gray-200">Reminder — Sesi Hampir Habis</h6>
                        {data && <span className="text-xs bg-amber-100 text-amber-600 font-bold px-2 py-0.5 rounded-full">{data.reminder_sesi.length} siswa</span>}
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}</div>
                    ) : (
                        <ReminderList items={data?.reminder_sesi ?? []} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default TabSiswa
