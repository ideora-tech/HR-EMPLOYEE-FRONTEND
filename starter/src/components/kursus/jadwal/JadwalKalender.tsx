'use client'

import { useState, useMemo, useCallback } from 'react'
import dayjs from 'dayjs'
import { Input, Button, Notification, Tooltip, toast } from '@/components/ui'
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
import { API_ENDPOINTS } from '@/constants/api.constant'

/* ─── constants ──────────────────────────────────────────── */

const HARI_NAMES = [
    'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu',
]

const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/* ─── helpers ────────────────────────────────────────────── */

/** Returns the Monday of the week containing `date`. */
function getMondayOf(date: dayjs.Dayjs): dayjs.Dayjs {
    const jsDay = date.day() // 0=Sun, 1=Mon, ..., 6=Sat
    const diff = jsDay === 0 ? -6 : 1 - jsDay
    return date.add(diff, 'day').startOf('day')
}

function monthLabel(d: dayjs.Dayjs): string {
    return `${MONTHS_ID[d.month()]} ${d.year()}`
}

function weekRangeLabel(monday: dayjs.Dayjs): string {
    const sunday = monday.add(6, 'day')
    const mStart = MONTHS_ID[monday.month()]
    const mEnd = MONTHS_ID[sunday.month()]
    if (monday.month() === sunday.month()) {
        return `${monday.format('D')} – ${sunday.format('D')} ${mStart} ${sunday.year()}`
    }
    return `${monday.format('D')} ${mStart} – ${sunday.format('D')} ${mEnd} ${sunday.year()}`
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
    data: IJadwalKelas[]
    loading?: boolean
    onEdit: (item: IJadwalKelas) => void
    onDelete: (item: IJadwalKelas) => void
}

/* ─── component ──────────────────────────────────────────── */

const JadwalKalender = ({
    data,
    loading = false,
    onEdit,
    onDelete,
}: JadwalKalenderProps) => {
    const today = dayjs().startOf('day')
    const [weekStart, setWeekStart] = useState(() => getMondayOf(today))
    const [searchQuery, setSearchQuery] = useState('')
    const [downloading, setDownloading] = useState(false)

    /* 7 days of the displayed week, starting Monday */
    const weekDays = useMemo(
        () => Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day')),
        [weekStart],
    )

    const prevWeek = () => setWeekStart((w) => w.subtract(7, 'day'))
    const nextWeek = () => setWeekStart((w) => w.add(7, 'day'))
    const goToday = () => setWeekStart(getMondayOf(today))

    /* ─── grouped data: nama → byHari ─────────────────────── */
    const grouped = useMemo(() => {
        const map = new Map<
            string,
            { items: IJadwalKelas[]; byHari: Record<number, IJadwalKelas[]> }
        >()
        data.forEach((j) => {
            if (!map.has(j.nama)) {
                const byHari: Record<number, IJadwalKelas[]> = {}
                for (let h = 1; h <= 7; h++) byHari[h] = []
                map.set(j.nama, { items: [], byHari })
            }
            const g = map.get(j.nama)!
            g.items.push(j)
            if (g.byHari[j.hari]) g.byHari[j.hari].push(j)
        })
        map.forEach((g) => {
            for (let h = 1; h <= 7; h++) {
                g.byHari[h].sort((a, b) =>
                    a.jam_mulai.localeCompare(b.jam_mulai),
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

    /* ─── Excel download (dari backend) ────────────────────── */
    const handleDownloadExcel = useCallback(async () => {
        setDownloading(true)
        try {
            const weekEnd = weekStart.add(6, 'day')
            const url = API_ENDPOINTS.KURSUS.JADWAL.EXPORT(
                weekStart.format('YYYY-MM-DD'),
                weekEnd.format('YYYY-MM-DD'),
            )
            const res = await fetch(url)
            if (!res.ok) throw new Error('Gagal mengunduh file')

            const blob = await res.blob()
            const objectUrl = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = objectUrl
            anchor.download = `Jadwal_${weekStart.format('DDMMYYYY')}-${weekEnd.format('DDMMYYYY')}.xlsx`
            anchor.click()
            URL.revokeObjectURL(objectUrl)
        } catch {
            toast.push(
                <Notification type="danger" title="Gagal mengunduh file Excel" />,
            )
        } finally {
            setDownloading(false)
        }
    }, [weekStart])

    /* ─── render ───────────────────────────────────────────── */

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 text-gray-400 text-sm">
                Memuat jadwal...
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {/* ── Navigation bar ──────────────────────────── */}
            <div className="flex items-center justify-between">
                {/* Week nav */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={prevWeek}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <HiChevronLeft className="text-lg" />
                    </button>

                    <div className="flex flex-col items-center min-w-[200px]">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                            {monthLabel(weekStart)}
                        </span>
                        <span className="text-xs text-gray-400">
                            {weekRangeLabel(weekStart)}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={nextWeek}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <HiChevronRight className="text-lg" />
                    </button>

                    <button
                        type="button"
                        onClick={goToday}
                        className="ml-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
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
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="min-w-[960px]">
                    {/* Header row */}
                    <div className="grid grid-cols-[220px_repeat(7,1fr)]">
                        {/* Search */}
                        <div className="px-3 py-2.5 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center">
                            <Input
                                size="sm"
                                placeholder="Cari kelas..."
                                prefix={
                                    <HiOutlineSearch className="text-gray-400" />
                                }
                                suffix={
                                    searchQuery ? (
                                        <HiOutlineX
                                            className="text-gray-400 cursor-pointer hover:text-gray-600"
                                            onClick={() => setSearchQuery('')}
                                        />
                                    ) : null
                                }
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
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
                                        {HARI_NAMES[i]}
                                    </p>
                                    <div
                                        className={`mx-auto mt-0.5 flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                                            isToday
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
                            {data.length === 0
                                ? 'Belum ada jadwal'
                                : 'Tidak ditemukan'}
                        </div>
                    ) : (
                        filteredKeys.map((nama) => {
                            const group = grouped.get(nama)!
                            return (
                                <div
                                    key={nama}
                                    className="grid grid-cols-[220px_repeat(7,1fr)] border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                >
                                    {/* Left: class name */}
                                    <div className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 flex flex-col justify-center bg-white dark:bg-gray-900">
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">
                                            {nama}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {group.items.length} Jadwal
                                        </p>
                                    </div>

                                    {/* Day cells */}
                                    {weekDays.map((day, i) => {
                                        const hari = i + 1 // 1=Mon … 7=Sun
                                        const isToday = day.isSame(
                                            today,
                                            'day',
                                        )
                                        return (
                                            <div
                                                key={i}
                                                className={`p-2 border-r last:border-r-0 border-gray-100 dark:border-gray-700 flex flex-col gap-1.5 min-h-[80px] ${
                                                    isToday
                                                        ? 'bg-primary/[0.04] dark:bg-primary/10'
                                                        : ''
                                                }`}
                                            >
                                                {group.byHari[hari].map(
                                                    (jadwal) => {
                                                        const style =
                                                            getShiftStyle(
                                                                jadwal.jam_mulai,
                                                            )
                                                        const isInactive =
                                                            jadwal.aktif !== 1
                                                        return (
                                                            <div
                                                                key={
                                                                    jadwal.id_jadwal
                                                                }
                                                                className={`relative p-2 rounded-lg border group transition-shadow hover:shadow-md ${style.bg} ${style.border} ${isInactive ? 'opacity-50 border-dashed' : ''}`}
                                                            >
                                                                <span
                                                                    className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}
                                                                >
                                                                    {
                                                                        style.label
                                                                    }
                                                                </span>

                                                                <p
                                                                    className={`text-xs font-bold mt-1 ${style.text}`}
                                                                >
                                                                    {
                                                                        jadwal.jam_mulai
                                                                    }{' '}
                                                                    –{' '}
                                                                    {
                                                                        jadwal.jam_selesai
                                                                    }
                                                                </p>

                                                                {jadwal.lokasi && (
                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                                                        {
                                                                            jadwal.lokasi
                                                                        }
                                                                    </p>
                                                                )}

                                                                {jadwal.instruktur && (
                                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                                                        {
                                                                            jadwal.instruktur
                                                                        }
                                                                    </p>
                                                                )}

                                                                {isInactive && (
                                                                    <span className="text-[9px] font-medium text-gray-400 mt-0.5 block">
                                                                        Nonaktif
                                                                    </span>
                                                                )}

                                                                {/* Hover actions */}
                                                                <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                                                                    <Tooltip title="Edit">
                                                                        <span
                                                                            className="cursor-pointer inline-flex items-center justify-center w-5 h-5 rounded bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-colors"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation()
                                                                                onEdit(
                                                                                    jadwal,
                                                                                )
                                                                            }}
                                                                        >
                                                                            <HiOutlinePencilAlt className="text-[11px]" />
                                                                        </span>
                                                                    </Tooltip>
                                                                    <Tooltip title="Hapus">
                                                                        <span
                                                                            className="cursor-pointer inline-flex items-center justify-center w-5 h-5 rounded bg-white dark:bg-gray-700 shadow-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation()
                                                                                onDelete(
                                                                                    jadwal,
                                                                                )
                                                                            }}
                                                                        >
                                                                            <HiOutlineTrash className="text-[11px]" />
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                        )
                                                    },
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default JadwalKalender
