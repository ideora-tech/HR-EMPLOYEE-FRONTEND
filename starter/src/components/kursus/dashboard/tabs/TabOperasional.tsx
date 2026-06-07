'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Notification, toast } from '@/components/ui'
import JadwalHariIniGrid from '../widgets/JadwalHariIniGrid'
import KursusDashboardService from '@/services/kursus/dashboard.service'
import { COLORS } from '@/constants/chart.constant'
import type { IKursusDashboardOperasional } from '@/@types/kursus.types'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

const TabOperasional = () => {
    const [data, setData] = useState<IKursusDashboardOperasional | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        KursusDashboardService.getOperasional()
            .then(res => { if (res.success) setData(res.data) })
            .catch(() => toast.push(<Notification type="danger" title="Gagal memuat data operasional" />))
            .finally(() => setLoading(false))
    }, [])

    const kehadiranMap = new Map(data?.kehadiran_minggu_ini.map(k => [k.hari, k]) ?? [])
    const mkSeries = (field: 'hadir' | 'tidak_hadir' | 'sakit' | 'izin') =>
        HARI_LIST.map(h => kehadiranMap.get(h)?.[field] ?? 0)

    const stackedOptions: ApexOptions = {
        chart: { type: 'bar', stacked: true, toolbar: { show: false } },
        xaxis: { categories: HARI_LIST },
        colors: [COLORS[1], COLORS[3], COLORS[0], COLORS[2]],
        plotOptions: { bar: { borderRadius: 3 } },
        dataLabels: { enabled: false },
        legend: { position: 'bottom' },
        grid: { borderColor: 'rgba(0,0,0,0.06)' },
    }

    const s = data?.kehadiran_summary

    const today = new Date()
    const hariNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const todayLabel = `${hariNames[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`

    return (
        <div className="flex flex-col gap-4">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{todayLabel}</p>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <JadwalHariIniGrid items={data?.jadwal_hari_ini ?? []} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="font-semibold text-gray-700 dark:text-gray-200">Kehadiran Minggu Ini</h6>
                        {s && <span className="text-xs text-gray-400">{s.total_sesi} sesi total</span>}
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                            { label: 'Hadir', pct: s?.pct_hadir ?? 0, cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20' },
                            { label: 'Tdk Hadir', pct: s?.pct_tidak_hadir ?? 0, cls: 'bg-red-50 dark:bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20' },
                            { label: 'Sakit', pct: s?.pct_sakit ?? 0, cls: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/20' },
                            { label: 'Izin', pct: s?.pct_izin ?? 0, cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/20' },
                        ].map(item => (
                            <div key={item.label} className={`rounded-lg border text-center p-3 ${item.cls}`}>
                                <p className="text-2xl font-bold leading-tight">{item.pct}%</p>
                                <p className="text-xs font-bold uppercase tracking-wide mt-0.5">{item.label}</p>
                            </div>
                        ))}
                    </div>
                    {loading ? <div className="h-36 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /> : (
                        <Chart type="bar" height={150} options={stackedOptions} series={[
                            { name: 'Hadir', data: mkSeries('hadir') },
                            { name: 'Tdk Hadir', data: mkSeries('tidak_hadir') },
                            { name: 'Sakit', data: mkSeries('sakit') },
                            { name: 'Izin', data: mkSeries('izin') },
                        ]} />
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="font-semibold text-gray-700 dark:text-gray-200">Kehadiran Rendah (&lt;70%)</h6>
                        {data && data.kelas_kehadiran_rendah.length > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{data.kelas_kehadiran_rendah.length} kelas</span>
                        )}
                    </div>
                    {loading ? (
                        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />)}</div>
                    ) : data?.kelas_kehadiran_rendah.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-2xl mb-2">✅</p>
                            <p className="text-sm text-gray-400">Semua kelas kehadirannya baik minggu ini</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {data?.kelas_kehadiran_rendah.map((k, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-red-50/60 dark:bg-red-500/5 border border-red-200/60 dark:border-red-500/15 rounded-lg">
                                    <div className="w-8 h-8 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center text-sm shrink-0">⚠️</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{k.nama_kelas}</p>
                                        <p className="text-xs text-gray-400">{k.jadwal_label}{k.nama_karyawan ? ` · ${k.nama_karyawan}` : ''}</p>
                                    </div>
                                    <p className="text-xl font-bold text-red-600 shrink-0">{k.pct_hadir}%</p>
                                </div>
                            ))}
                            <div className="mt-2 p-3 bg-violet-50 dark:bg-violet-500/10 border border-violet-200/60 dark:border-violet-500/20 rounded-lg">
                                <p className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-0.5">💡 Saran</p>
                                <p className="text-xs text-gray-500">Pertimbangkan menghubungi siswa yang sering absen di kelas-kelas ini.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TabOperasional
