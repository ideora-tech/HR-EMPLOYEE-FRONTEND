'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import { DatePicker, Input, Button, Notification, Tooltip, toast } from '@/components/ui'
import type { DatePickerRangeValue } from '@/components/ui/DatePicker/DatePickerRange'
import {
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineSearch,
    HiOutlineX,
    HiChevronLeft,
    HiChevronRight,
    HiOutlineDownload,
} from 'react-icons/hi'
import type { IJadwalKelas } from '@/@types/kursus.types'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'

/* ─── constants ──────────────────────────────────────────── */

// index 0=Mon ... 6=Sun (hari field: 1=Mon ... 7=Sun)
const HARI_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

/* ─── helpers ────────────────────────────────────────────── */

function getMondayOf(date: dayjs.Dayjs): dayjs.Dayjs {
    const jsDay = date.day()
    const diff = jsDay === 0 ? -6 : 1 - jsDay
    return date.add(diff, 'day').startOf('day')
}

/** day.day(): 0=Sun,1=Mon,...,6=Sat  →  hari: 1=Mon,...,7=Sun */
function toHari(day: dayjs.Dayjs): number {
    const d = day.day()
    return d === 0 ? 7 : d
}

/** "YYYY-MM-DD HH:MM:SS" atau "YYYY-MM-DDTHH:MM:SS" → "HH:MM" */
function timeFromISO(iso: string): string {
    const sep = iso.includes('T') ? 'T' : ' '
    return iso.split(sep)[1]?.slice(0, 5) ?? '00:00'
}

/** Nama hari berdasarkan nilai hari (1–7) */
function hariName(day: dayjs.Dayjs): string {
    return HARI_NAMES[toHari(day) - 1]
}

function getShiftStyle(jamMulai: string) {
    const hour = parseInt(jamMulai.split(':')[0], 10)
    if (hour >= 6 && hour < 12)
        return {
            bg: 'bg-orange-50 dark:bg-orange-500/10',
            border: 'border-orange-200 dark:border-orange-500/30',
            text: 'text-orange-700 dark:text-orange-300',
            badge: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300',
            label: 'Shift Pagi',
        }
    if (hour >= 12 && hour < 17)
        return {
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-200 dark:border-emerald-500/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
            label: 'Shift Siang',
        }
    if (hour >= 17)
        return {
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            border: 'border-blue-200 dark:border-blue-500/30',
            text: 'text-blue-700 dark:text-blue-300',
            badge: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
            label: 'Shift Malam',
        }
    return {
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        border: 'border-indigo-200 dark:border-indigo-500/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        badge: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
        label: 'Shift Dini Hari',
    }
}

/* ─── types ──────────────────────────────────────────────── */

interface JadwalKalenderProps {
    refreshToken?: number
    onView: (item: IJadwalKelas) => void
    onEdit: (item: IJadwalKelas) => void
    onDelete: (item: IJadwalKelas) => void
}

/* ─── component ──────────────────────────────────────────── */

const JadwalKalender = ({ refreshToken, onView, onEdit, onDelete }: JadwalKalenderProps) => {
    const today = dayjs().startOf('day')

    const [rangeStart, setRangeStart] = useState<dayjs.Dayjs>(() => getMondayOf(today))
    const [rangeEnd, setRangeEnd] = useState<dayjs.Dayjs>(() => getMondayOf(today).add(6, 'day'))

    const [data, setData] = useState<IJadwalKelas[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [downloading, setDownloading] = useState(false)

    /* Range duration (days), used for prev/next shift */
    const rangeDays = useMemo(
        () => rangeEnd.diff(rangeStart, 'day') + 1,
        [rangeStart, rangeEnd],
    )

    /* All days in the selected range */
    const weekDays = useMemo(
        () => Array.from({ length: rangeDays }, (_, i) => rangeStart.add(i, 'day')),
        [rangeStart, rangeDays],
    )

    /* ─── navigation ────────────────────────────────────── */
    const prevRange = () => {
        setRangeStart((s) => s.subtract(rangeDays, 'day'))
        setRangeEnd((e) => e.subtract(rangeDays, 'day'))
    }
    const nextRange = () => {
        setRangeStart((s) => s.add(rangeDays, 'day'))
        setRangeEnd((e) => e.add(rangeDays, 'day'))
    }
    const goToday = () => {
        const monday = getMondayOf(today)
        setRangeStart(monday)
        setRangeEnd(monday.add(6, 'day'))
    }

    const handleRangeChange = (val: DatePickerRangeValue) => {
        const [start, end] = val
        if (start) setRangeStart(dayjs(start).startOf('day'))
        if (end) setRangeEnd(dayjs(end).startOf('day'))
    }

    /* ─── fetch data ─────────────────────────────────────── */
    useEffect(() => {
        setLoading(true)
        JadwalKelasService.getAll({
            week_start: rangeStart.format('YYYY-MM-DD'),
            week_end: rangeEnd.format('YYYY-MM-DD'),
            limit: 500,
        })
            .then((res) => { if (res.success) setData(res.data) })
            .catch(() => {
                toast.push(<Notification type="danger" title="Gagal memuat jadwal" />)
            })
            .finally(() => setLoading(false))
    }, [rangeStart, rangeEnd, refreshToken])

    /* ─── grouped data: instruktur → byHari ─────────────── */
    const grouped = useMemo(() => {
        const map = new Map<
            string,
            { items: IJadwalKelas[]; byHari: Record<number, IJadwalKelas[]> }
        >()
        data.forEach((j: IJadwalKelas) => {
            const key = j.instruktur?.trim() || '(Tanpa Instruktur)'
            if (!map.has(key)) {
                const byHari: Record<number, IJadwalKelas[]> = {}
                for (let h = 1; h <= 7; h++) byHari[h] = []
                map.set(key, { items: [], byHari })
            }
            const g = map.get(key)!
            g.items.push(j)

            // Masukkan jadwal ke semua hari yang dicakup range tanggal_mulai–tanggal_selesai
            // Gunakan tanggal saja (bukan datetime) agar jam tidak mempengaruhi hitungan hari
            const startD = new Date(j.tanggal_mulai.replace(' ', 'T'))
            const endD = new Date(j.tanggal_selesai.replace(' ', 'T'))
            const startDate = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate())
            const endDate = new Date(endD.getFullYear(), endD.getMonth(), endD.getDate())
            const diffDays = Math.round(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
            )

            if (diffDays >= 6) {
                // Range ≥ 7 hari → tampil di semua kolom
                for (let h = 1; h <= 7; h++) g.byHari[h].push(j)
            } else {
                for (let i = 0; i <= diffDays; i++) {
                    const d = new Date(startDate)
                    d.setDate(d.getDate() + i)
                    const jsDay = d.getDay()
                    const hari = jsDay === 0 ? 7 : jsDay
                    g.byHari[hari].push(j)
                }
            }
        })
        map.forEach((g) => {
            for (let h = 1; h <= 7; h++) {
                g.byHari[h].sort((a, b) =>
                    timeFromISO(a.tanggal_mulai).localeCompare(timeFromISO(b.tanggal_mulai)),
                )
            }
        })
        return map
    }, [data])

    const filteredKeys = useMemo(() => {
        const keys = Array.from(grouped.keys()).sort()
        if (!searchQuery.trim()) return keys
        const q = searchQuery.toLowerCase()
        return keys.filter((k) => k.toLowerCase().includes(q))
    }, [grouped, searchQuery])

    /* ─── Excel download ─────────────────────────────────── */
    const handleDownloadExcel = useCallback(async () => {
        setDownloading(true)
        try {
            const bulan = rangeStart.format('YYYY-MM')
            await JadwalKelasService.exportExcel(bulan)
        } catch {
            toast.push(<Notification type="danger" title="Gagal mengunduh file Excel" />)
        } finally {
            setDownloading(false)
        }
    }, [rangeStart])

    /* ─── grid column style ──────────────────────────────── */
    const gridStyle = {
        gridTemplateColumns: `220px repeat(${weekDays.length}, minmax(0, 1fr))`,
    }

    /* ─── render ─────────────────────────────────────────── */
    return (
        <div className="flex flex-col gap-3">
            {/* ── Navigation bar ──────────────────────────── */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    {/* Prev */}
                    <button
                        type="button"
                        onClick={prevRange}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <HiChevronLeft className="text-lg" />
                    </button>

                    {/* Date range picker */}
                    <DatePicker.DatePickerRange
                        value={[rangeStart.toDate(), rangeEnd.toDate()]}
                        inputFormat="DD MMM YYYY"
                        separator="–"
                        clearable={false}
                        onChange={handleRangeChange}
                    />

                    {/* Next */}
                    <button
                        type="button"
                        onClick={nextRange}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <HiChevronRight className="text-lg" />
                    </button>

                    {/* Today */}
                    <button
                        type="button"
                        onClick={goToday}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors whitespace-nowrap"
                    >
                        Hari Ini
                    </button>
                </div>

                {/* Excel download */}
                <Button
                    size="sm"
                    variant="default"
                    icon={<HiOutlineDownload />}
                    onClick={handleDownloadExcel}
                    loading={downloading}
                    disabled={data.length === 0}
                >
                    Unduh Excel
                </Button>
            </div>

            {/* ── Calendar grid ───────────────────────────── */}
            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-400 text-sm">
                    Memuat jadwal...
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div style={{ minWidth: `${220 + weekDays.length * 140}px` }}>
                        {/* Header row */}
                        <div className="grid" style={gridStyle}>
                            {/* Search */}
                            <div className="px-3 py-2.5 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center">
                                <Input
                                    size="sm"
                                    placeholder="Cari karyawan..."
                                    prefix={<HiOutlineSearch className="text-gray-400" />}
                                    suffix={
                                        searchQuery ? (
                                            <HiOutlineX
                                                className="text-gray-400 cursor-pointer hover:text-gray-600"
                                                onClick={() => setSearchQuery('')}
                                            />
                                        ) : null
                                    }
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Day + date headers */}
                            {weekDays.map((day, i) => {
                                const isToday = day.isSame(today, 'day')
                                return (
                                    <div
                                        key={i}
                                        className="px-2 py-2 text-center border-b border-r last:border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                                    >
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {hariName(day)}
                                        </p>
                                        <div
                                            className={`mx-auto mt-0.5 flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${isToday
                                                ? 'bg-primary text-white'
                                                : 'text-gray-700 dark:text-gray-200'
                                                }`}
                                        >
                                            {day.format('D')}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Body rows */}
                        {filteredKeys.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-sm">
                                {data.length === 0 ? 'Belum ada jadwal' : 'Tidak ditemukan'}
                            </div>
                        ) : (
                            filteredKeys.map((karyawan) => {
                                const group = grouped.get(karyawan)!
                                const initials = karyawan
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((w) => w[0])
                                    .join('')
                                    .toUpperCase()
                                const isTanpaInstruktur = karyawan === '(Tanpa Instruktur)'
                                return (
                                    <div
                                        key={karyawan}
                                        className="grid border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                        style={gridStyle}
                                    >
                                        {/* Left: karyawan name */}
                                        <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-900">
                                            <div
                                                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${isTanpaInstruktur
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                                    : 'bg-primary/10 text-primary dark:bg-primary/20'
                                                    }`}
                                            >
                                                {isTanpaInstruktur ? '—' : initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug truncate">
                                                    {karyawan}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {group.items.length} Shift
                                                </p>
                                            </div>
                                        </div>

                                        {/* Day cells */}
                                        {weekDays.map((day, i) => {
                                            const hari = toHari(day)
                                            const isToday = day.isSame(today, 'day')
                                            return (
                                                <div
                                                    key={i}
                                                    className={`p-2 border-r last:border-r-0 border-gray-100 dark:border-gray-700 flex flex-col gap-1.5 min-h-[80px] ${isToday ? 'bg-primary/[0.04] dark:bg-primary/10' : ''
                                                        }`}
                                                >
                                                    {group.byHari[hari].map((jadwal) => {
                                                        const jamMulai = timeFromISO(jadwal.tanggal_mulai)
                                                        const jamSelesai = timeFromISO(jadwal.tanggal_selesai)
                                                        const style = getShiftStyle(jamMulai)
                                                        const isInactive = jadwal.aktif !== 1
                                                        return (
                                                            <div
                                                                key={jadwal.id_jadwal}
                                                                className={`relative p-2 rounded-lg border group transition-shadow hover:shadow-md cursor-pointer ${style.bg} ${style.border} ${isInactive ? 'opacity-50 border-dashed' : ''}`}
                                                                onClick={() => onView(jadwal)}
                                                            >
                                                                <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}>
                                                                    {style.label}
                                                                </span>
                                                                <p className={`text-xs font-bold mt-1 ${style.text}`}>
                                                                    {jamMulai} – {jamSelesai}
                                                                </p>
                                                                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 mt-0.5 leading-snug truncate">
                                                                    {jadwal.nama_jadwal}
                                                                </p>
                                                                {jadwal.lokasi && (
                                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                                                        {jadwal.lokasi}
                                                                    </p>
                                                                )}
                                                                {isInactive && (
                                                                    <span className="text-[9px] font-medium text-gray-400 mt-0.5 block">
                                                                        Nonaktif
                                                                    </span>
                                                                )}
                                                                <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                                                                    <Tooltip title="Edit">
                                                                        <span
                                                                            className="cursor-pointer inline-flex items-center justify-center w-5 h-5 rounded bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors"
                                                                            onClick={(e) => { e.stopPropagation(); onEdit(jadwal) }}
                                                                        >
                                                                            <HiOutlinePencilAlt className="text-[11px]" />
                                                                        </span>
                                                                    </Tooltip>
                                                                    <Tooltip title="Hapus">
                                                                        <span
                                                                            className="cursor-pointer inline-flex items-center justify-center w-5 h-5 rounded bg-white dark:bg-gray-700 shadow-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
                                                                            onClick={(e) => { e.stopPropagation(); onDelete(jadwal) }}
                                                                        >
                                                                            <HiOutlineTrash className="text-[11px]" />
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default JadwalKalender
