'use client'

import { useState, useEffect, useCallback } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { HiOutlineRefresh } from 'react-icons/hi'
import { Card, Button, DatePicker } from '@/components/ui'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import DataTable from '@/components/shared/DataTable'
import { parseApiError } from '@/utils/parseApiError'
import MonitoringService from '@/services/kursus/monitoring.service'
import type { IPresensi, IAbsensiCoachPublic } from '@/@types/kursus.types'

// ─── helpers ──────────────────────────────────────────────────────────────────

function dateToStr(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function fmtTanggal(str: string): string {
    if (!str) return '-'
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const [y, m, d] = str.split('-')
    return `${d} ${months[parseInt(m, 10) - 1]} ${y}`
}

function fmtTime(val: string | null | undefined): string {
    if (!val) return '-'
    if (val.includes('T')) return val.split('T')[1]?.slice(0, 5) ?? '-'
    return val.slice(0, 5)
}

// ─── status helpers ────────────────────────────────────────────────────────────

const PRESENSI_STATUS: Record<number, { label: string; cls: string }> = {
    1: { label: 'Hadir',       cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' },
    2: { label: 'Tidak Hadir', cls: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400' },
    3: { label: 'Sakit',       cls: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' },
    4: { label: 'Izin',        cls: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' },
}

function getCoachStatus(item: IAbsensiCoachPublic): { label: string; cls: string } {
    if (item.waktu_checkout) return { label: 'Selesai',         cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' }
    if (item.waktu_checkin)  return { label: 'Sedang Mengajar', cls: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' }
    return                          { label: 'Belum Checkin',   cls: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400' }
}

// ─── stat chip ────────────────────────────────────────────────────────────────

function StatChip({ label, count, color }: { label: string; count: number; color: string }) {
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${color}`}>
            <span className="text-sm font-bold">{count}</span>
            <span>{label}</span>
        </div>
    )
}

// ─── tabs config ──────────────────────────────────────────────────────────────

type TabKey = 'siswa' | 'coach'
const TABS: { key: TabKey; label: string }[] = [
    { key: 'siswa', label: 'Absensi Siswa' },
    { key: 'coach', label: 'Absensi Coach' },
]

// ─── main component ────────────────────────────────────────────────────────────

export default function MonitoringPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('siswa')
    const [tanggalDate, setTanggalDate] = useState<Date>(() => new Date())
    const tanggal = dateToStr(tanggalDate)

    // Siswa state
    const [siswaList, setSiswaList]     = useState<IPresensi[]>([])
    const [loadingSiswa, setLoadingSiswa] = useState(false)
    const [siswaPage, setSiswaPage]     = useState(1)
    const [siswaPageSize]               = useState(20)
    const [siswaTotal, setSiswaTotal]   = useState(0)

    // Coach state
    const [coachList, setCoachList]     = useState<IAbsensiCoachPublic[]>([])
    const [loadingCoach, setLoadingCoach] = useState(false)
    const [coachPage, setCoachPage]     = useState(1)
    const [coachPageSize]               = useState(20)
    const [coachTotal, setCoachTotal]   = useState(0)

    const fetchPresensi = useCallback(async (page = siswaPage) => {
        setLoadingSiswa(true)
        try {
            const res = await MonitoringService.getPresensiSiswa({ tanggal, page, limit: siswaPageSize })
            setSiswaList(res.data ?? [])
            setSiswaTotal(res.meta?.total ?? 0)
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setLoadingSiswa(false)
        }
    }, [tanggal, siswaPage, siswaPageSize])

    const fetchCoach = useCallback(async (page = coachPage) => {
        setLoadingCoach(true)
        try {
            const res = await MonitoringService.getAbsensiCoach({ tanggal, page, limit: coachPageSize })
            setCoachList(res.data ?? [])
            setCoachTotal(res.meta?.total ?? 0)
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setLoadingCoach(false)
        }
    }, [tanggal, coachPage, coachPageSize])

    useEffect(() => { setSiswaPage(1); fetchPresensi(1) }, [tanggal]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { setCoachPage(1); fetchCoach(1) },   [tanggal]) // eslint-disable-line react-hooks/exhaustive-deps

    // ─── columns ─────────────────────────────────────────────────────────────

    const siswaColumns: ColumnDef<IPresensi>[] = [
        { header: 'No', id: 'no', size: 60,
          cell: ({ row }) => (siswaPage - 1) * siswaPageSize + row.index + 1 },
        { header: 'Nama Siswa', accessorKey: 'nama_siswa', size: 220,
          cell: ({ row }) => (
              <span className="font-medium text-gray-800 dark:text-gray-100">
                  {row.original.nama_siswa || row.original.siswa?.nama_siswa || '-'}
              </span>
          ) },
        { header: 'Kelas', id: 'kelas', size: 200,
          cell: ({ row }) => row.original.jadwal?.nama_kelas ?? '-' },
        { header: 'Hari', id: 'hari', size: 100,
          cell: ({ row }) => row.original.jadwal?.hari ?? '-' },
        { header: 'Jam', id: 'jam', size: 120,
          cell: ({ row }) => {
              const j = row.original.jadwal
              return j ? `${j.jam_mulai}–${j.jam_selesai}` : '-'
          } },
        { header: 'Status', id: 'status', size: 140,
          cell: ({ row }) => {
              const s = PRESENSI_STATUS[row.original.status] ?? { label: '-', cls: '' }
              return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
          } },
    ]

    const coachColumns: ColumnDef<IAbsensiCoachPublic>[] = [
        { header: 'No', id: 'no', size: 60,
          cell: ({ row }) => (coachPage - 1) * coachPageSize + row.index + 1 },
        { header: 'Nama Coach', id: 'coach', size: 220,
          cell: ({ row }) => (
              <span className="font-medium text-gray-800 dark:text-gray-100">
                  {row.original.coach?.nama_karyawan ?? '-'}
              </span>
          ) },
        { header: 'Kelas', id: 'kelas', size: 200,
          cell: ({ row }) => row.original.jadwal?.nama_kelas ?? '-' },
        { header: 'Hari', id: 'hari', size: 100,
          cell: ({ row }) => row.original.jadwal?.hari ?? '-' },
        { header: 'Checkin', id: 'checkin', size: 110,
          cell: ({ row }) => {
              const t = fmtTime(row.original.waktu_checkin)
              return t === '-'
                  ? <span className="text-gray-400">-</span>
                  : <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t}</span>
          } },
        { header: 'Checkout', id: 'checkout', size: 110,
          cell: ({ row }) => {
              const t = fmtTime(row.original.waktu_checkout)
              return t === '-'
                  ? <span className="text-gray-400">-</span>
                  : <span className="text-violet-600 dark:text-violet-400 font-semibold">{t}</span>
          } },
        { header: 'Status', id: 'status', size: 150,
          cell: ({ row }) => {
              const s = getCoachStatus(row.original)
              return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
          } },
    ]

    // ─── stats ────────────────────────────────────────────────────────────────

    const siswaStats = {
        hadir:      siswaList.filter(e => e.status === 1).length,
        tidakHadir: siswaList.filter(e => e.status === 2).length,
        sakit:      siswaList.filter(e => e.status === 3).length,
        izin:       siswaList.filter(e => e.status === 4).length,
    }
    const coachStats = {
        checkin: coachList.filter(e => !!e.waktu_checkin).length,
        selesai: coachList.filter(e => !!e.waktu_checkout).length,
        belum:   coachList.filter(e => !e.waktu_checkin).length,
    }

    // ─── render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-4">
            <Card bodyClass="p-0">
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 pt-4 pb-0">
                    <div>
                        <h4 className="mb-0">Monitoring Kehadiran</h4>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {fmtTanggal(tanggal)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DatePicker
                            value={tanggalDate}
                            onChange={(date) => {
                                if (date) setTanggalDate(date)
                            }}
                            inputtable
                            clearable={false}
                            placeholder="Pilih tanggal"
                        />
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiOutlineRefresh />}
                            onClick={() => { fetchPresensi(); fetchCoach() }}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* ── Tab bar ── */}
                <div className="px-4 pt-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex gap-0">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={[
                                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                    activeTab === tab.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                                ].join(' ')}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab content ── */}
                <div className="pt-3">
                    {/* Absensi Siswa */}
                    {activeTab === 'siswa' && (
                        <>
                            <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
                                <StatChip label="Total"       count={siswaList.length}      color="border-gray-200 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700" />
                                <StatChip label="Hadir"       count={siswaStats.hadir}      color="border-emerald-200 text-emerald-600 bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-500/10" />
                                <StatChip label="Tidak Hadir" count={siswaStats.tidakHadir} color="border-red-200 text-red-500 bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:bg-red-500/10" />
                                <StatChip label="Sakit"       count={siswaStats.sakit}      color="border-amber-200 text-amber-600 bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:bg-amber-500/10" />
                                <StatChip label="Izin"        count={siswaStats.izin}       color="border-blue-200 text-blue-600 bg-blue-50 dark:border-blue-500/30 dark:text-blue-400 dark:bg-blue-500/10" />
                            </div>
                            <DataTable
                                columns={siswaColumns}
                                data={siswaList}
                                loading={loadingSiswa}
                                pagingData={{ pageSize: siswaPageSize, pageIndex: siswaPage, total: siswaTotal }}
                                onPaginationChange={p => { setSiswaPage(p); fetchPresensi(p) }}
                                onSelectChange={() => {}}
                            />
                        </>
                    )}

                    {/* Absensi Coach */}
                    {activeTab === 'coach' && (
                        <>
                            <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
                                <StatChip label="Total"   count={coachList.length}   color="border-gray-200 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700" />
                                <StatChip label="Checkin" count={coachStats.checkin} color="border-emerald-200 text-emerald-600 bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-500/10" />
                                <StatChip label="Selesai" count={coachStats.selesai} color="border-violet-200 text-violet-600 bg-violet-50 dark:border-violet-500/30 dark:text-violet-400 dark:bg-violet-500/10" />
                                <StatChip label="Belum"   count={coachStats.belum}   color="border-red-200 text-red-500 bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:bg-red-500/10" />
                            </div>
                            <DataTable
                                columns={coachColumns}
                                data={coachList}
                                loading={loadingCoach}
                                pagingData={{ pageSize: coachPageSize, pageIndex: coachPage, total: coachTotal }}
                                onPaginationChange={p => { setCoachPage(p); fetchCoach(p) }}
                                onSelectChange={() => {}}
                            />
                        </>
                    )}
                </div>
            </Card>
        </div>
    )
}
