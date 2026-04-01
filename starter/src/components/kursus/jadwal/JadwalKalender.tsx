'use client'

import { useState, useMemo, useEffect } from 'react'
import { Input, Notification, Tooltip, toast } from '@/components/ui'
import {
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineSearch,
    HiOutlineX,
} from 'react-icons/hi'
import type { IJadwalKelas } from '@/@types/kursus.types'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'

/* ─── constants ──────────────────────────────────────────── */

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const

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

/* ─── types ──────────────────────────────────────────────── */

interface JadwalKalenderProps {
    refreshToken?: number
    onView: (item: IJadwalKelas) => void
    onEdit: (item: IJadwalKelas) => void
    onDelete: (item: IJadwalKelas) => void
}

/* ─── component ──────────────────────────────────────────── */

const JadwalKalender = ({ refreshToken, onView, onEdit, onDelete }: JadwalKalenderProps) => {
    const [data, setData] = useState<IJadwalKelas[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    /* ─── fetch data ─────────────────────────────────────── */
    useEffect(() => {
        setLoading(true)
        JadwalKelasService.getAll({ limit: 500 })
            .then((res) => { if (res.success) setData(res.data) })
            .catch(() => {
                toast.push(<Notification type="danger" title="Gagal memuat jadwal" />)
            })
            .finally(() => setLoading(false))
    }, [refreshToken])

    /* ─── grouped: instruktur -> byHari ──────────────────── */
    const grouped = useMemo(() => {
        const map = new Map<string, { items: IJadwalKelas[]; byHari: Record<string, IJadwalKelas[]> }>()
        data.forEach((j) => {
            const key = j.nama_karyawan?.trim() || '(Tanpa Instruktur)'
            if (!map.has(key)) {
                const byHari: Record<string, IJadwalKelas[]> = {}
                HARI_LIST.forEach((h) => { byHari[h] = [] })
                map.set(key, { items: [], byHari })
            }
            const g = map.get(key)!
            g.items.push(j)
            if (g.byHari[j.hari]) g.byHari[j.hari].push(j)
        })
        map.forEach((g) => {
            HARI_LIST.forEach((h) => {
                g.byHari[h].sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai))
            })
        })
        return map
    }, [data])

    const filteredKeys = useMemo(() => {
        const keys = Array.from(grouped.keys()).sort()
        if (!searchQuery.trim()) return keys
        const q = searchQuery.toLowerCase()
        return keys.filter((k) => k.toLowerCase().includes(q))
    }, [grouped, searchQuery])

    const gridStyle = { gridTemplateColumns: `200px repeat(7, minmax(0, 1fr))` }

    return (
        <div className="flex flex-col gap-3">
            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-400 text-sm">
                    Memuat jadwal...
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div style={{ minWidth: `${200 + 7 * 140}px` }}>
                        {/* Header row */}
                        <div className="grid" style={gridStyle}>
                            <div className="px-3 py-2.5 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center">
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
                            {HARI_LIST.map((hari) => (
                                <div
                                    key={hari}
                                    className="px-2 py-2.5 text-center border-b border-r last:border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                                >
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{hari}</p>
                                </div>
                            ))}
                        </div>

                        {/* Body rows */}
                        {filteredKeys.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-sm">
                                {data.length === 0 ? 'Belum ada jadwal' : 'Tidak ditemukan'}
                            </div>
                        ) : (
                            filteredKeys.map((karyawan) => {
                                const group = grouped.get(karyawan)!
                                const initials = karyawan.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                                const isTanpa = karyawan === '(Tanpa Instruktur)'
                                return (
                                    <div
                                        key={karyawan}
                                        className="grid border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                        style={gridStyle}
                                    >
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
                                                    {karyawan}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {group.items.length} jadwal
                                                </p>
                                            </div>
                                        </div>
                                        {HARI_LIST.map((hari) => (
                                            <div
                                                key={hari}
                                                className="p-2 border-r last:border-r-0 border-gray-100 dark:border-gray-700 flex flex-col gap-1.5 min-h-[80px]"
                                            >
                                                {group.byHari[hari].map((jadwal) => {
                                                    const style = getShiftStyle(jadwal.jam_mulai)
                                                    const isInactive = jadwal.aktif !== 1
                                                    return (
                                                        <div
                                                            key={jadwal.id_jadwal_kelas}
                                                            className={`relative p-2 rounded-lg border group/card transition-shadow hover:shadow-md cursor-pointer ${style.bg} ${style.border} ${isInactive ? 'opacity-50 border-dashed' : ''}`}
                                                            onClick={() => onView(jadwal)}
                                                        >
                                                            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}>
                                                                {style.label}
                                                            </span>
                                                            <p className={`text-xs font-bold mt-1 ${style.text}`}>
                                                                {jadwal.jam_mulai} – {jadwal.jam_selesai}
                                                            </p>
                                                            <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 mt-0.5 leading-snug truncate">
                                                                {jadwal.nama_kelas}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                                                {jadwal.nama_kategori_umur}
                                                            </p>
                                                            {isInactive && (
                                                                <span className="text-[9px] font-medium text-gray-400 mt-0.5 block">Nonaktif</span>
                                                            )}
                                                            <div className="absolute top-1 right-1 hidden group-hover/card:flex gap-0.5">
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
                                        ))}
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