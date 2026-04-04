'use client'

import { useState, useMemo, useEffect } from 'react'
import dayjs from 'dayjs'
import { Input, Notification, toast } from '@/components/ui'
import {
    HiChevronLeft,
    HiChevronRight,
    HiOutlineCheck,
    HiOutlineSearch,
    HiOutlineX,
} from 'react-icons/hi'
import type { IJadwalKelas, IPresensi } from '@/@types/kursus.types'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import PresensiService from '@/services/kursus/presensi.service'

/* --- constants -------------------------------------------- */

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const

// Offset dari Senin (0) sampai Minggu (6)
const HARI_OFFSET: Record<string, number> = {
    Senin: 0, Selasa: 1, Rabu: 2, Kamis: 3, Jumat: 4, Sabtu: 5, Minggu: 6,
}

/* --- helpers ---------------------------------------------- */

function getMondayOf(date: dayjs.Dayjs): dayjs.Dayjs {
    const d = date.day()
    return date.subtract(d === 0 ? 6 : d - 1, 'day').startOf('day')
}

function getShiftStyle(jamMulai: string) {
    const hour = parseInt(jamMulai.split(':')[0], 10)
    if (hour >= 6 && hour < 12)
        return {
            bg: 'bg-orange-50 dark:bg-orange-500/10',
            border: 'border-orange-200 dark:border-orange-500/30',
            text: 'text-orange-700 dark:text-orange-300',
            badge: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300',
            label: 'Pagi',
        }
    if (hour >= 12 && hour < 17)
        return {
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-200 dark:border-emerald-500/30',
            text: 'text-emerald-700 dark:text-emerald-300',
            badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
            label: 'Siang',
        }
    if (hour >= 17)
        return {
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            border: 'border-blue-200 dark:border-blue-500/30',
            text: 'text-blue-700 dark:text-blue-300',
            badge: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
            label: 'Malam',
        }
    return {
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        border: 'border-indigo-200 dark:border-indigo-500/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        badge: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
        label: 'Dini Hari',
    }
}

/* --- types ------------------------------------------------ */

interface PresensiKalenderProps {
    refreshToken?: number
    onClickJadwal: (jadwal: IJadwalKelas, tanggal: string, presensiId: string | null) => void
}

/* --- component -------------------------------------------- */

const PresensiKalender = ({ refreshToken, onClickJadwal }: PresensiKalenderProps) => {
    const today = dayjs().startOf('day')

    const [weekMonday, setWeekMonday] = useState<dayjs.Dayjs>(() => getMondayOf(today))
    const [jadwalData, setJadwalData] = useState<IJadwalKelas[]>([])
    const [presensiData, setPresensiData] = useState<IPresensi[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    /* --- computed dates for each hari column ----------- */
    const weekDates = useMemo(() => {
        const result: Record<string, dayjs.Dayjs> = {}
        HARI_LIST.forEach((hari) => {
            result[hari] = weekMonday.add(HARI_OFFSET[hari], 'day')
        })
        return result
    }, [weekMonday])

    const weekEnd = weekMonday.add(6, 'day')
    const weekLabel = `${weekMonday.format('D MMM')} – ${weekEnd.format('D MMM YYYY')}`

    /* --- navigation -------------------------------------- */
    const prevWeek = () => setWeekMonday((m) => m.subtract(7, 'day'))
    const nextWeek = () => setWeekMonday((m) => m.add(7, 'day'))
    const goThisWeek = () => setWeekMonday(getMondayOf(today))

    /* --- fetch jadwal + presensi ------------------------- */
    useEffect(() => {
        setLoading(true)
        const months = Array.from(
            new Set([weekMonday.format('YYYY-MM'), weekEnd.format('YYYY-MM')]),
        )
        const tanggal = dayjs().format('YYYY-MM-DD')
        Promise.all([
            JadwalKelasService.getAll({ aktif: 1, tanggal }),
            Promise.all(months.map((bulan) => PresensiService.getAll({ bulan }))),
        ])
            .then(([jadwalRes, presensiResults]) => {
                if (jadwalRes.success) setJadwalData(jadwalRes.data)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekMonday, refreshToken])

    /* --- group jadwal by instruktur ? byHari (string) -- */
    const grouped = useMemo(() => {
        const map = new Map<string, { items: IJadwalKelas[]; byHari: Record<string, IJadwalKelas[]> }>()
        jadwalData.forEach((j) => {
            const key = j.nama_karyawan?.trim() || '(Tanpa Instruktur)'
            if (!map.has(key)) {
                const byHari: Record<string, IJadwalKelas[]> = {}
                HARI_LIST.forEach((h) => { byHari[h] = [] })
                map.set(key, { items: [], byHari })
            }
            const g = map.get(key)!
            g.items.push(j)
            if (g.byHari[j.hari] !== undefined) g.byHari[j.hari].push(j)
        })
        map.forEach((g) => {
            HARI_LIST.forEach((h) => {
                g.byHari[h].sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
            })
        })
        return map
    }, [jadwalData])

    /* --- filtered instruktur keys ------------------------- */
    const filteredKeys = useMemo(() => {
        const keys = Array.from(grouped.keys()).sort()
        if (!searchQuery.trim()) return keys
        const q = searchQuery.toLowerCase()
        return keys.filter((k) => k.toLowerCase().includes(q))
    }, [grouped, searchQuery])

    /* --- presensi map: id_jadwal_kelas::tanggal → { hadir, tidakHadir, firstId } --- */
    const presensiMap = useMemo(() => {
        type S = { hadir: number; tidakHadir: number; firstId: string }
        const m = new Map<string, S>()
        presensiData.forEach((p) => {
            if (!p.waktu_mulai_kelas) return
            const tanggal = p.waktu_mulai_kelas.replace('T', ' ').slice(0, 10)
            const key = `${p.id_jadwal_kelas}::${tanggal}`
            const ex = m.get(key)
            if (ex) {
                if (p.status === 1) ex.hadir++
                else if (p.status === 2) ex.tidakHadir++
            } else {
                m.set(key, {
                    hadir: p.status === 1 ? 1 : 0,
                    tidakHadir: p.status === 2 ? 1 : 0,
                    firstId: p.id_presensi,
                })
            }
        })
        return m
    }, [presensiData])

    const gridStyle = { gridTemplateColumns: `200px repeat(7, minmax(0, 1fr))` }

    /* --- render ------------------------------------------- */
    return (
        <div className="flex flex-col gap-3">
            {/* Navigation bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={prevWeek}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <HiChevronLeft className="text-lg" />
                    </button>

                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[190px] text-center">
                        {weekLabel}
                    </span>

                    <button
                        type="button"
                        onClick={nextWeek}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <HiChevronRight className="text-lg" />
                    </button>

                    <button
                        type="button"
                        onClick={goThisWeek}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors whitespace-nowrap"
                    >
                        Minggu Ini
                    </button>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                        Hadir semua
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        Ada tidak hadir
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-orange-400" />
                        Belum diabsen
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
                    <div style={{ minWidth: `${200 + 7 * 140}px` }}>
                        {/* Header row */}
                        <div className="grid" style={gridStyle}>
                            <div className="px-3 py-2.5 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <Input
                                    size="sm"
                                    placeholder="Cari instruktur..."
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

                            {HARI_LIST.map((hari) => {
                                const dayDate = weekDates[hari]
                                const isToday = dayDate.isSame(today, 'day')
                                return (
                                    <div
                                        key={hari}
                                        className="px-2 py-2 text-center border-b border-r last:border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                                    >
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                            {hari}
                                        </p>
                                        <div
                                            className={`mx-auto mt-0.5 flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${isToday
                                                ? 'bg-primary text-white'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}
                                        >
                                            {dayDate.format('D')}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Body rows */}
                        {filteredKeys.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-sm">
                                {jadwalData.length === 0 ? 'Belum ada jadwal' : 'Tidak ditemukan'}
                            </div>
                        ) : (
                            filteredKeys.map((instruktur) => {
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
                                                {isTanpa ? '\u2014' : initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug truncate">
                                                    {instruktur}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {group.items.length} jadwal
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hari columns */}
                                        {HARI_LIST.map((hari) => {
                                            const dayDate = weekDates[hari]
                                            const tanggalStr = dayDate.format('YYYY-MM-DD')
                                            const isToday = dayDate.isSame(today, 'day')
                                            return (
                                                <div
                                                    key={hari}
                                                    className={`p-2 border-r last:border-r-0 border-gray-100 dark:border-gray-700 flex flex-col gap-1.5 min-h-[80px] ${isToday ? 'bg-primary/[0.04] dark:bg-primary/10' : ''
                                                        }`}
                                                >
                                                    {group.byHari[hari].map((jadwal) => {
                                                        const presensiKey = `${jadwal.id_jadwal_kelas}::${tanggalStr}`
                                                        const summary = presensiMap.get(presensiKey) ?? null
                                                        const presensiId = summary?.firstId ?? null
                                                        const sessionStatus = !summary
                                                            ? 'none'
                                                            : summary.tidakHadir > 0
                                                                ? 'absent'
                                                                : 'full'
                                                        const style = getShiftStyle(jadwal.jam_mulai)
                                                        return (
                                                            <div
                                                                key={jadwal.id_jadwal_kelas}
                                                                title={
                                                                    sessionStatus === 'full'
                                                                        ? 'Hadir semua'
                                                                        : sessionStatus === 'absent'
                                                                            ? 'Ada yang tidak hadir'
                                                                            : 'Klik untuk absen'
                                                                }
                                                                className={`relative p-2 rounded-lg border group/card transition-shadow hover:shadow-md cursor-pointer select-none ${sessionStatus === 'full'
                                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
                                                                    : sessionStatus === 'absent'
                                                                        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                                                                        : `${style.bg} ${style.border}`
                                                                    }`}
                                                                onClick={() =>
                                                                    onClickJadwal(jadwal, tanggalStr, presensiId)
                                                                }
                                                            >
                                                                {sessionStatus === 'full' ? (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                                                                        <HiOutlineCheck className="text-[11px]" />
                                                                        Hadir Semua
                                                                    </span>
                                                                ) : sessionStatus === 'absent' ? (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                                                                        Ada Tidak Hadir
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}
                                                                    >
                                                                        {isToday && (
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                                                        )}
                                                                        {isToday ? 'Absen Sekarang' : style.label}
                                                                    </span>
                                                                )}
                                                                <p
                                                                    className={`text-xs font-bold mt-1 ${sessionStatus === 'full'
                                                                        ? 'text-emerald-700 dark:text-emerald-300'
                                                                        : sessionStatus === 'absent'
                                                                            ? 'text-red-600 dark:text-red-400'
                                                                            : style.text
                                                                        }`}
                                                                >
                                                                    {jadwal.jam_mulai} – {jadwal.jam_selesai}
                                                                </p>
                                                                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 mt-0.5 leading-snug truncate">
                                                                    {jadwal.nama_kelas}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                                                    {jadwal.nama_kategori_umur}
                                                                </p>
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
