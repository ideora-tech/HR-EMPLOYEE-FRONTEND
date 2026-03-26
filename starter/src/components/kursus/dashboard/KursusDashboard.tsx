'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, Skeleton } from '@/components/ui'
import {
    HiOutlineUserGroup,
    HiOutlineCalendar,
    HiOutlineCurrencyDollar,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineUserRemove,
} from 'react-icons/hi'
import KursusDashboardService from '@/services/kursus/dashboard.service'
import { formatRupiah } from '@/utils/formatNumber'
import { apexAreaChartDefaultOption, apexDonutChartDefaultOption } from '@/configs/chart.config'
import { COLORS } from '@/constants/chart.constant'
import type { IKursusDashboard } from '@/@types/kursus.types'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// ─── Stat Card ───────────────────────────────────────────────────────────────
type StatCardProps = {
    title: string
    value: string | number
    icon: React.ReactNode
    iconBg: string
    iconColor: string
    loading: boolean
    href: string
}

const StatCard = ({ title, value, icon, iconBg, iconColor, loading, href }: StatCardProps) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <span className={`text-2xl ${iconColor}`}>{icon}</span>
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
                    {loading ? (
                        <Skeleton width={60} height={24} />
                    ) : (
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    )}
                </div>
            </div>
        </Card>
    </a>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const KursusDashboard = () => {
    const [data, setData] = useState<IKursusDashboard | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        KursusDashboardService.getSummary()
            .then((res) => { if (res.success) setData(res.data) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    // ── Pendapatan 6 bulan chart ──
    const pendapatanCategories = data?.pendapatan_6_bulan.map((d) => {
        const [year, month] = d.bulan.split('-')
        return new Date(Number(year), Number(month) - 1).toLocaleString('id-ID', { month: 'short', year: '2-digit' })
    }) ?? []
    const pendapatanSeries = [{ name: 'Pendapatan', data: data?.pendapatan_6_bulan.map((d) => d.total) ?? [] }]
    const pendapatanOptions: ApexOptions = {
        ...apexAreaChartDefaultOption,
        xaxis: { categories: pendapatanCategories },
        yaxis: {
            labels: {
                formatter: (val) => {
                    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`
                    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`
                    return String(val)
                },
            },
        },
        tooltip: {
            y: { formatter: (val) => formatRupiah(val) },
        },
        colors: [COLORS[0]],
    }

    // ── Siswa per program donut chart ──
    const donutSeries = data?.siswa_per_program.map((d) => d.jumlah) ?? []
    const donutLabels = data?.siswa_per_program.map((d) => d.nama_program) ?? []
    const donutOptions: ApexOptions = {
        ...apexDonutChartDefaultOption,
        labels: donutLabels,
        legend: { show: true, position: 'bottom' },
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Total Siswa',
                            formatter: (w) =>
                                String(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)),
                        },
                    },
                    size: '75%',
                },
            },
        },
    }

    const METODE_COLOR: Record<string, string> = {
        TUNAI: 'bg-green-100 text-green-700',
        TRANSFER: 'bg-blue-100 text-blue-700',
        QRIS: 'bg-purple-100 text-purple-700',
    }

    return (
        <div className="flex flex-col gap-6">
            {/* ── Stat Cards ─────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                    title="Siswa Aktif"
                    value={data?.siswa_aktif ?? 0}
                    icon={<HiOutlineUserGroup />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                    loading={loading}
                    href="/kursus/siswa"
                />
                <StatCard
                    title="Kelas Hari Ini"
                    value={data?.kelas_hari_ini ?? 0}
                    icon={<HiOutlineCalendar />}
                    iconBg="bg-indigo-50"
                    iconColor="text-indigo-500"
                    loading={loading}
                    href="/kursus/jadwal-kelas"
                />
                <StatCard
                    title="Pendapatan Bulan Ini"
                    value={loading ? '-' : formatRupiah(data?.pendapatan_bulan_ini ?? 0)}
                    icon={<HiOutlineCurrencyDollar />}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-500"
                    loading={loading}
                    href="/kursus/tagihan"
                />
                <StatCard
                    title="Tagihan Belum Lunas"
                    value={data?.tagihan_belum_lunas ?? 0}
                    icon={<HiOutlineClipboardList />}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-500"
                    loading={loading}
                    href="/kursus/tagihan"
                />
                <StatCard
                    title="Akan Expired"
                    value={data?.siswa_akan_expired ?? 0}
                    icon={<HiOutlineClock />}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                    loading={loading}
                    href="/kursus/siswa"
                />
                <StatCard
                    title="Siswa Berhenti"
                    value={data?.siswa_berhenti ?? 0}
                    icon={<HiOutlineUserRemove />}
                    iconBg="bg-red-50"
                    iconColor="text-red-500"
                    loading={loading}
                    href="/kursus/siswa"
                />
            </div>

            {/* ── Charts ─────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Area chart pendapatan */}
                <Card className="xl:col-span-2" header={{ content: <h5 className="font-semibold">Pendapatan 6 Bulan Terakhir</h5>, bordered: false }}>
                    {loading ? (
                        <Skeleton height={220} />
                    ) : (
                        <Chart
                            type="area"
                            height={220}
                            series={pendapatanSeries}
                            options={pendapatanOptions}
                        />
                    )}
                </Card>

                {/* Donut chart siswa per program */}
                <Card header={{ content: <h5 className="font-semibold">Siswa per Program</h5>, bordered: false }}>
                    {loading ? (
                        <Skeleton height={220} />
                    ) : donutSeries.length === 0 ? (
                        <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">Belum ada data</div>
                    ) : (
                        <Chart
                            type="donut"
                            height={220}
                            series={donutSeries}
                            options={donutOptions}
                        />
                    )}
                </Card>
            </div>

            {/* ── Jadwal + Pembayaran ────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Jadwal hari ini */}
                <Card header={{ content: <h5 className="font-semibold">Jadwal Hari Ini</h5>, bordered: false }} bodyClass="p-0">
                    {loading ? (
                        <div className="p-4 flex flex-col gap-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} height={40} />)}
                        </div>
                    ) : (data?.jadwal_hari_ini ?? []).length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">Tidak ada jadwal hari ini</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {data!.jadwal_hari_ini.map((j) => {
                                const pct = j.kuota > 0 ? Math.round((j.terisi / j.kuota) * 100) : 0
                                return (
                                    <div key={j.id_jadwal} className="px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate">{j.nama_jadwal}</p>
                                            <p className="text-xs text-gray-500">{j.instruktur} · {j.jam_mulai}–{j.jam_selesai}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{j.terisi}/{j.kuota}</p>
                                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                                <div
                                                    className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>

                {/* Pembayaran terbaru */}
                <Card header={{ content: <h5 className="font-semibold">Pembayaran Terbaru</h5>, bordered: false }} bodyClass="p-0">
                    {loading ? (
                        <div className="p-4 flex flex-col gap-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} height={40} />)}
                        </div>
                    ) : (data?.pembayaran_terbaru ?? []).length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-gray-400 text-sm">Belum ada pembayaran</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {data!.pembayaran_terbaru.map((p) => (
                                <div key={p.id_pembayaran} className="px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{p.nama_siswa}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(p.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${METODE_COLOR[p.metode] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {p.metode}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {formatRupiah(p.jumlah)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

export default KursusDashboard
