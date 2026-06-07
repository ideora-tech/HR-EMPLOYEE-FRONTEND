'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Notification, toast } from '@/components/ui'
import KpiCard from '../widgets/KpiCard'
import KursusDashboardService from '@/services/kursus/dashboard.service'
import { formatRupiah } from '@/utils/formatNumber'
import { COLORS } from '@/constants/chart.constant'
import type { IKursusDashboardKeuangan } from '@/@types/kursus.types'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const METODE_COLOR: Record<string, string> = {
    TUNAI: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    TRANSFER: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    QRIS: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
}

const TabKeuangan = () => {
    const [data, setData] = useState<IKursusDashboardKeuangan | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        KursusDashboardService.getKeuangan()
            .then(res => { if (res.success) setData(res.data) })
            .catch(() => toast.push(<Notification type="danger" title="Gagal memuat data keuangan" />))
            .finally(() => setLoading(false))
    }, [])

    const barOptions: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false } },
        xaxis: { categories: data?.revenue_12_bulan.map(r => r.bulan) ?? [] },
        yaxis: { labels: { formatter: v => (v / 1000000).toFixed(1) + 'jt' } },
        colors: [COLORS[0]],
        plotOptions: { bar: { borderRadius: 4 } },
        dataLabels: { enabled: false },
        grid: { borderColor: 'rgba(0,0,0,0.06)' },
    }

    const donutOptions: ApexOptions = {
        chart: { type: 'donut' },
        labels: data?.metode_pembayaran.map(m => m.metode) ?? [],
        colors: [COLORS[1], COLORS[2], COLORS[0]],
        legend: { position: 'bottom' },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '65%' } } },
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon="✅" label="Tagihan Lunas" color="green"
                    value={data?.tagihan_lunas ?? 0} loading={loading}
                    sub={data ? formatRupiah(data.nominal_lunas) : undefined} />
                <KpiCard icon="⏳" label="Sebagian Dibayar" color="orange"
                    value={data?.tagihan_sebagian ?? 0} loading={loading}
                    sub={data ? `Sisa ${formatRupiah(data.nominal_sebagian_sisa)}` : undefined} />
                <KpiCard icon="🔔" label="Menunggu Bayar" color="red"
                    value={data?.tagihan_menunggu ?? 0} loading={loading}
                    sub={data ? formatRupiah(data.nominal_menunggu) : undefined} />
                <KpiCard icon="🔍" label="Pending Konfirmasi" color="purple"
                    value={data?.pembayaran_pending_konfirmasi ?? 0} loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h6 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Revenue 12 Bulan</h6>
                    {loading ? <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /> : (
                        <Chart type="bar" height={200} options={barOptions}
                            series={[{ name: 'Revenue', data: data?.revenue_12_bulan.map(r => r.total) ?? [] }]} />
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <h6 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Metode Pembayaran</h6>
                    {loading ? <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /> : (
                        <Chart type="donut" height={200} options={donutOptions}
                            series={data?.metode_pembayaran.map(m => m.jumlah) ?? []} />
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700">
                    <h6 className="font-semibold text-gray-700 dark:text-gray-200">Pembayaran Pending Konfirmasi</h6>
                    {data && data.pembayaran_pending_konfirmasi > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                            {data.pembayaran_pending_konfirmasi} menunggu
                        </span>
                    )}
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/60">
                        <tr>
                            {['Siswa', 'Jumlah', 'Metode', 'Tanggal'].map(h => (
                                <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /></td></tr>
                            ))
                        ) : (data?.pending_konfirmasi ?? []).length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">Tidak ada pembayaran pending</td></tr>
                        ) : (
                            (data?.pending_konfirmasi ?? []).map(p => (
                                <tr key={p.id_pembayaran} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="px-4 py-3 font-medium">{p.nama_siswa}</td>
                                    <td className="px-4 py-3 font-bold text-emerald-600">{formatRupiah(p.jumlah)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${METODE_COLOR[p.metode] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {p.metode}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{p.tanggal_bayar}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TabKeuangan
