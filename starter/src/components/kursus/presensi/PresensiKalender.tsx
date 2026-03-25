'use client'

import { useState, useMemo, useEffect } from 'react'
import dayjs from 'dayjs'
import { DatePicker, Notification, toast } from '@/components/ui'
import type { DatePickerRangeValue } from '@/components/ui/DatePicker/DatePickerRange'
import {
    HiChevronLeft,
    HiChevronRight,
    HiOutlineCheck,
} from 'react-icons/hi'
import type { IJadwalKelas, IPresensi } from '@/@types/kursus.types'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import PresensiService from '@/services/kursus/presensi.service'

/* ─── helpers ────────────────────────────────────────────── */

const HARI_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

function getMondayOf(date: dayjs.Dayjs): dayjs.Dayjs {
    const jsDay = date.day()
    const diff = jsDay === 0 ? -6 : 1 - jsDay
    return date.add(diff, 'day').startOf('day')
}

function toHari(day: dayjs.Dayjs): number {
    const d = day.day()
    return d === 0 ? 7 : d
}

function hariName(day: dayjs.Dayjs): string {
    return HARI_NAMES[toHari(day) - 1]
}

function timeFromISO(iso: string): string {
    const sep = iso.includes('T') ? 'T' : ' '
    return iso.split(sep)[1]?.slice(0, 5) ?? '00:00'
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

interface PresensiKalenderProps {
    refreshToken?: number
    onClickJadwal: (jadwal: IJadwalKelas, tanggal: string, presensiId: string | null) => void
}

/* ─── component ──────────────────────────────────────────── */

const PresensiKalender = ({ refreshToken, onClickJadwal }: PresensiKalenderProps) => {
    const today = dayjs().startOf('day')

    const [rangeStart, setRangeStart] = useState<dayjs.Dayjs>(() => getMondayOf(today))
    const [rangeEnd, setRangeEnd] = useState<dayjs.Dayjs>(() => getMondayOf(today).add(6, 'day'))

    const [jadwalData, setJadwalData] = useState<IJadwalKelas[]>([])
    const [presensiData, setPresensiData] = useState<IPresensi[]>([])
    const [loading, setLoading] = useState(false)

    const rangeDays = useMemo(
        () => rangeEnd.diff(rangeStart, 'day') + 1,
        [rangeStart, rangeEnd],
    )

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

    /* ─── fetch jadwal + presensi ───────────────────────── */
    useEffect(() => {
        setLoading(true)
        // Collect unique months covered by the visible range
        const months = Array.from(
            new Set([rangeStart.format('YYYY-MM'), rangeEnd.format('YYYY-MM')]),
        )
        Promise.all([
            JadwalKelasService.getAll({
                week_start: rangeStart.format('YYYY-MM-DD'),
                week_end: rangeEnd.format('YYYY-MM-DD'),
                limit: 500,
            }),
            Promise.all(months.map((bulan) => PresensiService.getAll({ bulan, limit: 500 }))),
        ])
            .then(([jadwalRes, presensiResults]) => {
                if (jadwalRes.success) setJadwalData(jadwalRes.data)
                // Merge + deduplicate presensi from potentially 2 months
                const seen = new Set<string>()
                const merged: IPresensi[] = []
                presensiResults.forEach((res) => {
                    if (!res.success) return
                    res.data.forEach((p) => {
                        if (!seen.has(p.id_presensi)) {
                            seen.add(p.id_presensi)
                            merged.push(p)
                        }
                    })
                })
                setPresensiData(merged)
            })
            .catch(() => {
                toast.push(<Notification type="danger" title="Gagal memuat data kalender" />)
            })
            .finally(() => setLoading(false))
    }, [rangeStart, rangeEnd, refreshToken])

    /* ─── group jadwal by instruktur → byHari ───────────── */
    const grouped = useMemo(() => {
        const map = new Map<
            string,
            { items: IJadwalKelas[]; byHari: Record<number, IJadwalKelas[]> }
        >()
        jadwalData.forEach((j) => {
            const key = j.instruktur?.trim() || '(Tanpa Instruktur)'
            if (!map.has(key)) {
                const byHari: Record<number, IJadwalKelas[]> = {}
                for (let h = 1; h <= 7; h++) byHari[h] = []
                map.set(key, { items: [], byHari })
            }
            const g = map.get(key)!
            g.items.push(j)

            const startD = new Date(j.tanggal_mulai.replace(' ', 'T'))
            const endD = new Date(j.tanggal_selesai.replace(' ', 'T'))
            const startDate = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate())
            const endDate = new Date(endD.getFullYear(), endD.getMonth(), endD.getDate())
            const diffDays = Math.round(
                (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
            )

            if (diffDays >= 6) {
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
    }, [jadwalData])

    const groupKeys = useMemo(() => Array.from(grouped.keys()).sort(), [grouped])

    /* ─── presensi lookup map: `id_jadwal::tanggal` → id_presensi ── */
    const presensiMap = useMemo(() => {
        const m = new Map<string, string>()
        presensiData.forEach((p) => {
            // tanggal_mulai = "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DDTHH:MM:SS"
            const tanggal = p.jadwal.tanggal_mulai.replace('T', ' ').slice(0, 10)
            m.set(`${p.jadwal.id_jadwal}::${tanggal}`, p.id_presensi)
        })
        return m
    }, [presensiData])

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

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                        Sudah absen
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
                        Belum absen hari ini
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                        Klik untuk absen
                    </span>
                </div>
            </div>

            {/* Calendar grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-400 text-sm">
                    Memuat jadwal...
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div style={{ minWidth: `${220 + weekDays.length * 140}px` }}>
                        {/* Header row */}
                        <div className="grid" style={gridStyle}>
                            <div className="px-3 py-2.5 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center">
                                <span className="text-xs font-medium text-gray-400">Instruktur</span>
                            </div>
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
                        {groupKeys.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-sm">
                                {jadwalData.length === 0
                                    ? 'Belum ada jadwal di periode ini'
                                    : 'Tidak ditemukan'}
                            </div>
                        ) : (
                            groupKeys.map((instruktur) => {
                                const group = grouped.get(instruktur)!
                                const initials = instruktur
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((w) => w[0])
                                    .join('')
                                    .toUpperCase()
                                const isTanpa = instruktur === '(Tanpa Instruktur)'
                                return (
                                    <div
                                        key={instruktur}
                                        className="grid border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                        style={gridStyle}
                                    >
                                        {/* Instruktur column */}
                                        <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700 flex items-center gap-3 bg-white dark:bg-gray-900">
                                            <div
                                                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${isTanpa
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                                    : 'bg-primary/10 text-primary dark:bg-primary/20'
                                                    }`}
                                            >
                                                {isTanpa ? '—' : initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug truncate">
                                                    {instruktur}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {group.items.length} Kelas
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
                                                    className={`p-2 border-r last:border-r-0 border-gray-100 dark:border-gray-700 flex flex-col gap-1.5 min-h-[80px] ${isToday
                                                        ? 'bg-primary/[0.04] dark:bg-primary/10'
                                                        : ''
                                                        }`}
                                                >
                                                    {group.byHari[hari].map((jadwal) => {
                                                        const jamMulai = timeFromISO(
                                                            jadwal.tanggal_mulai,
                                                        )
                                                        const jamSelesai = timeFromISO(
                                                            jadwal.tanggal_selesai,
                                                        )
                                                        const tanggalStr = day.format('YYYY-MM-DD')
                                                        const presensiKey = `${jadwal.id_jadwal}::${tanggalStr}`
                                                        const presensiId =
                                                            presensiMap.get(presensiKey) ?? null
                                                        const done = presensiId !== null
                                                        const style = getShiftStyle(jamMulai)

                                                        return (
                                                            <div
                                                                key={jadwal.id_jadwal}
                                                                title={done ? 'Lihat / Edit presensi' : 'Klik untuk absen'}
                                                                className={`relative p-2 rounded-lg border group transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer select-none ${done
                                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                                                                    : `${style.bg} ${style.border}`
                                                                    }`}
                                                                onClick={() =>
                                                                    onClickJadwal(
                                                                        jadwal,
                                                                        tanggalStr,
                                                                        presensiId,
                                                                    )
                                                                }
                                                            >
                                                                {done ? (
                                                                    <>
                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                                                                            <HiOutlineCheck className="text-[11px]" />
                                                                            Sudah Absen
                                                                        </span>
                                                                        <p className="text-xs font-bold mt-1 text-emerald-700 dark:text-emerald-300">
                                                                            {jamMulai} – {jamSelesai}
                                                                        </p>
                                                                        <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 mt-0.5 leading-snug truncate">
                                                                            {jadwal.nama_jadwal}
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span
                                                                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}
                                                                        >
                                                                            {isToday && (
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                                            )}
                                                                            {isToday ? 'Absen Sekarang' : style.label}
                                                                        </span>
                                                                        <p
                                                                            className={`text-xs font-bold mt-1 ${style.text}`}
                                                                        >
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
                                                                    </>
                                                                )}
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

export default PresensiKalender
