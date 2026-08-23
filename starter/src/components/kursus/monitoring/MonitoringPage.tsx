'use client'

import { useState, useEffect, useCallback } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { HiOutlineRefresh, HiOutlineDownload } from 'react-icons/hi'
import { Card, Button, DatePicker } from '@/components/ui'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import DataTable from '@/components/shared/DataTable'
import { parseApiError } from '@/utils/parseApiError'
import { formatTanggal } from '@/utils/formatTanggal'
import MonitoringService from '@/services/kursus/monitoring.service'
import type { IPresensi, IAbsensiCoachPublic } from '@/@types/kursus.types'

// ─── helpers ──────────────────────────────────────────────────────────────────

function dateToStr(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/** Default range: 7 hari terakhir (hari ini − 6 hari s/d hari ini). */
function getDefaultRange(): [Date, Date] {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 6)
    return [start, end]
}

/** Ambil jam (HH:mm) dari "YYYY-MM-DD HH:mm:ss" (mysql2 dateStrings), ISO "…THH:mm:ss", atau "HH:mm:ss". */
function fmtTime(val: string | null | undefined): string {
    if (!val) return '-'
    const sep = val.includes('T') ? 'T' : val.includes(' ') ? ' ' : null
    const jam = sep ? val.split(sep).pop() ?? '' : val
    return jam.length >= 5 && jam[2] === ':' ? jam.slice(0, 5) : jam || '-'
}

// ─── status helpers ────────────────────────────────────────────────────────────

function presensiBadge(status: number): { label: string; cls: string } {
    return status === 1
        ? { label: 'Hadir',       cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' }
        : { label: 'Tidak Hadir', cls: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400' }
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
    const [range, setRange] = useState<[Date, Date]>(getDefaultRange)
    // Nilai mentah picker: saat user baru memilih tanggal pertama, nilainya [start, null].
    // Harus ikut disimpan agar picker (controlled) bisa menampilkan pilihan pertama;
    // `range` (dan fetch) hanya berubah setelah kedua tanggal lengkap.
    const [pickerValue, setPickerValue] = useState<[Date | null, Date | null]>(getDefaultRange)
    const dari = dateToStr(range[0])
    const sampai = dateToStr(range[1])
    const subtitle = dari === sampai ? formatTanggal(dari) : `${formatTanggal(dari)} – ${formatTanggal(sampai)}`

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
    const [downloadingRekap, setDownloadingRekap] = useState(false)
    const [downloadingRekapSiswa, setDownloadingRekapSiswa] = useState(false)

    const fetchPresensi = useCallback(async (page = siswaPage) => {
        setLoadingSiswa(true)
        try {
            const res = await MonitoringService.getPresensiSiswa({ dari, sampai, page, limit: siswaPageSize })
            setSiswaList(res.data ?? [])
            setSiswaTotal(res.meta?.total ?? 0)
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setLoadingSiswa(false)
        }
    }, [dari, sampai, siswaPage, siswaPageSize])

    const fetchCoach = useCallback(async (page = coachPage) => {
        setLoadingCoach(true)
        try {
            const res = await MonitoringService.getAbsensiCoach({ dari, sampai, page, limit: coachPageSize })
            setCoachList(res.data ?? [])
            setCoachTotal(res.meta?.total ?? 0)
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setLoadingCoach(false)
        }
    }, [dari, sampai, coachPage, coachPageSize])

    const handleDownloadRekapCoach = useCallback(async () => {
        setDownloadingRekap(true)
        try {
            await MonitoringService.downloadRekapCoach({ dari, sampai })
            toast.push(<Notification type="success" title="Rekap coach diunduh" />)
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setDownloadingRekap(false)
        }
    }, [dari, sampai])

    const handleDownloadRekapSiswa = useCallback(async () => {
        setDownloadingRekapSiswa(true)
        try {
            await MonitoringService.downloadRekapSiswa({ dari, sampai })
            toast.push(<Notification type="success" title="Rekap siswa diunduh" />)
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setDownloadingRekapSiswa(false)
        }
    }, [dari, sampai])

    useEffect(() => { setSiswaPage(1); fetchPresensi(1) }, [dari, sampai]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { setCoachPage(1); fetchCoach(1) },   [dari, sampai]) // eslint-disable-line react-hooks/exhaustive-deps

    // ─── columns ─────────────────────────────────────────────────────────────

    const siswaColumns: ColumnDef<IPresensi>[] = [
        { header: 'No', id: 'no', size: 60,
          cell: ({ row }) => (siswaPage - 1) * siswaPageSize + row.index + 1 },
        { header: 'Tanggal', id: 'tanggal', size: 120,
          cell: ({ row }) => formatTanggal(row.original.tanggal) },
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
              const s = presensiBadge(row.original.status)
              return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
          } },
    ]

    const coachColumns: ColumnDef<IAbsensiCoachPublic>[] = [
        { header: 'No', id: 'no', size: 60,
          cell: ({ row }) => (coachPage - 1) * coachPageSize + row.index + 1 },
        { header: 'Tanggal', id: 'tanggal', size: 120,
          cell: ({ row }) => formatTanggal(row.original.tanggal) },
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
        tidakHadir: siswaList.filter(e => e.status === 2 || e.status === 3 || e.status === 4).length,
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
                            {subtitle}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2 max-w-full">
                        <DatePicker.DatePickerRange
                            value={pickerValue}
                            onChange={(value) => {
                                setPickerValue(value)
                                const [start, end] = value
                                if (start && end) {
                                    setRange(start <= end ? [start, end] : [end, start])
                                }
                            }}
                            inputtable
                            clearable={false}
                            placeholder="Pilih rentang tanggal"
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
                                <Button
                                    className="ml-auto"
                                    size="sm"
                                    variant="default"
                                    icon={<HiOutlineDownload />}
                                    loading={downloadingRekapSiswa}
                                    onClick={handleDownloadRekapSiswa}
                                >
                                    Unduh Excel
                                </Button>
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
                                <Button
                                    className="ml-auto"
                                    size="sm"
                                    variant="default"
                                    icon={<HiOutlineDownload />}
                                    loading={downloadingRekap}
                                    onClick={handleDownloadRekapCoach}
                                >
                                    Unduh Excel
                                </Button>
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
