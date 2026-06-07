'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Notification, toast } from '@/components/ui'
import KpiCard from '../widgets/KpiCard'
import KursusDashboardService from '@/services/kursus/dashboard.service'
import { formatRupiah } from '@/utils/formatNumber'
import { apexAreaChartDefaultOption } from '@/configs/chart.config'
import { COLORS } from '@/constants/chart.constant'
import type { IKursusDashboard } from '@/@types/kursus.types'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const TabRingkasan = () => {
    const [data, setData] = useState<IKursusDashboard | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        KursusDashboardService.getSummary()
            .then(res => { if (res.success) setData(res.data) })
            .catch(() => toast.push(<Notification type="danger" title="Gagal memuat data ringkasan" />))
            .finally(() => setLoading(false))
    }, [])

    const revenueOptions: ApexOptions = {
        ...apexAreaChartDefaultOption,
        xaxis: { categories: data?.pendapatan_6_bulan.map(p => p.bulan) ?? [] },
        yaxis: { labels: { formatter: (v) => formatRupiah(v) } },
        colors: [COLORS[0]],
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon="👥" label="Siswa Aktif" color="purple"
                    value={data?.siswa_aktif ?? 0} loading={loading}
                    href="/kursus/siswa" />
                <KpiCard icon="💰" label="Pendapatan Bulan Ini" color="green"
                    value={data ? formatRupiah(data.pendapatan_bulan_ini) : '-'} loading={loading} />
                <KpiCard icon="📋" label="Tagihan Belum Lunas" color="orange"
                    value={data?.tagihan_belum_lunas ?? 0} loading={loading}
                    href="/kursus/tagihan" />
                <KpiCard icon="🎓" label="Kelas Aktif" color="blue"
                    value={data?.kelas_aktif ?? 0} loading={loading}
                    sub={`${data?.kelas_hari_ini ?? 0} jadwal aktif`}
                    href="/kursus/jadwal-kelas" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h6 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Pendapatan 6 Bulan</h6>
                    {loading ? (
                        <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                        <Chart
                            type="area"
                            height={200}
                            options={revenueOptions}
                            series={[{ name: 'Pendapatan', data: data?.pendapatan_6_bulan.map(p => p.total) ?? [] }]}
                        />
                    )}
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h6 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Pembayaran Terbaru</h6>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {(data?.pembayaran_terbaru ?? []).map(p => (
                                <li key={p.id_pembayaran} className="flex items-center justify-between py-2.5 gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                                        {p.nama_siswa.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{p.nama_siswa}</p>
                                        <p className="text-xs text-gray-400">{p.tanggal_bayar}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-emerald-600">{formatRupiah(p.jumlah)}</p>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">
                                            {p.metode}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TabRingkasan
