'use client'

import { useState, useEffect } from 'react'
import { Button, Drawer, Input, Notification, toast } from '@/components/ui'
import {
    HiOutlineSave,
    HiOutlineCalendar,
    HiOutlineUser,
    HiOutlineClock,
    HiOutlineSearch,
} from 'react-icons/hi'
import PresensiService from '@/services/kursus/presensi.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IJadwalKelas } from '@/@types/kursus.types'

/* ─── types ──────────────────────────────────────────────── */

type StatusValue = 1 | 2 | 3 | 4

type AbsenRow = {
    id_daftar: string
    siswa_nama: string
    siswa_telepon: string | null
    status: StatusValue | null
}

/* ─── constants ──────────────────────────────────────────── */

const STATUS_BUTTONS: {
    value: StatusValue
    short: string
    label: string
    active: string
    inactive: string
}[] = [
        {
            value: 1,
            short: 'H',
            label: 'Hadir',
            active: 'bg-emerald-500 text-white ring-2 ring-emerald-300',
            inactive:
                'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20',
        },
        {
            value: 2,
            short: 'I',
            label: 'Izin',
            active: 'bg-blue-500 text-white ring-2 ring-blue-300',
            inactive:
                'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20',
        },
        {
            value: 3,
            short: 'S',
            label: 'Sakit',
            active: 'bg-amber-500 text-white ring-2 ring-amber-300',
            inactive:
                'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20',
        },
        {
            value: 4,
            short: 'A',
            label: 'Alpha',
            active: 'bg-red-500 text-white ring-2 ring-red-300',
            inactive:
                'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20',
        },
    ]

const STATUS_BADGE: Record<StatusValue, string> = {
    1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    2: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
    3: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
    4: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400',
}

/* ─── helpers ────────────────────────────────────────────── */

function timeFromISO(iso: string): string {
    const sep = iso.includes('T') ? 'T' : ' '
    return iso.split(sep)[1]?.slice(0, 5) ?? '00:00'
}

function formatTanggal(tanggal: string): string {
    return new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

/* ─── props ──────────────────────────────────────────────── */

interface AbsenDrawerProps {
    open: boolean
    jadwal: IJadwalKelas | null
    tanggal: string | null         // 'YYYY-MM-DD' — untuk display saja
    presensiId: string | null      // null = belum ada presensi, isi = untuk load status existing
    onClose: () => void
    onSaved: () => void
}

/* ─── component ──────────────────────────────────────────── */

const AbsenDrawer = ({
    open,
    jadwal,
    tanggal,
    presensiId,
    onClose,
    onSaved,
}: AbsenDrawerProps) => {
    const [rows, setRows] = useState<AbsenRow[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    /* ── On open: load daftar siswa + existing statuses ── */
    useEffect(() => {
        if (!open || !jadwal) {
            setRows([])
            setSearch('')
            return
        }

        setLoading(true)
        setRows([])

        const run = async () => {
            // Satu endpoint: list semua siswa di jadwal ini + status presensi mereka
            const res = await PresensiService.getByJadwal(jadwal.id_jadwal)
            if (!res.success) return

            setRows(
                res.data.map((entry) => ({
                    id_daftar: entry.id_daftar,
                    siswa_nama: entry.siswa.nama,
                    siswa_telepon: entry.siswa.telepon,
                    // null = belum pernah diabsen → tidak ada default
                    status: entry.presensi
                        ? (Number(entry.presensi.status) as StatusValue)
                        : null,
                })),
            )
        }

        run()
            .catch((err) => {
                toast.push(
                    <Notification type="danger" title="Gagal memuat data presensi">
                        {parseApiError(err)}
                    </Notification>,
                )
            })
            .finally(() => setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, jadwal, presensiId])

    /* ── Handlers ── */
    const handleToggle = (id_daftar: string, status: StatusValue) => {
        setRows((prev) =>
            prev.map((r) => (r.id_daftar === id_daftar ? { ...r, status } : r)),
        )
    }

    const handleMarkAll = (status: StatusValue) => {
        setRows((prev) => prev.map((r) => ({ ...r, status })))
    }

    const handleSave = async () => {
        if (!jadwal) return

        const filledRows = rows.filter((r) => r.status !== null)
        if (filledRows.length === 0) {
            toast.push(
                <Notification type="warning" title="Belum ada status kehadiran yang dipilih" />,
            )
            return
        }
        const skipped = rows.length - filledRows.length
        if (skipped > 0) {
            toast.push(
                <Notification
                    type="warning"
                    title={`${skipped} siswa belum dipilih, data tersebut tidak disimpan`}
                />,
            )
        }

        setSaving(true)
        try {
            await PresensiService.batch({
                id_jadwal: jadwal.id_jadwal,
                items: filledRows.map((r) => ({
                    id_daftar: r.id_daftar,
                    status: r.status as StatusValue,
                })),
            })
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.PRESENSI)} />,
            )
            onSaved()
            onClose()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.UPDATE(ENTITY.PRESENSI)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSaving(false)
        }
    }

    /* ── Filtered rows for display ── */
    const filteredRows = search.trim()
        ? rows.filter((r) =>
            r.siswa_nama.toLowerCase().includes(search.trim().toLowerCase()),
        )
        : rows

    /* ── Summary counts ── */
    const counts: Record<StatusValue, number> = {
        1: rows.filter((r) => r.status === 1).length,
        2: rows.filter((r) => r.status === 2).length,
        3: rows.filter((r) => r.status === 3).length,
        4: rows.filter((r) => r.status === 4).length,
    }
    const unsetCount = rows.filter((r) => r.status === null).length

    /* ── Render ── */
    return (
        <Drawer
            title={
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {jadwal?.nama ?? 'Absensi Kelas'}
                    </span>
                </div>
            }
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            placement="right"
            width={500}
        >
            <div className="flex flex-col h-full">
                {/* ── Info: waktu + instruktur + tanggal ───── */}
                {jadwal && (
                    <div className="px-4 pt-1 pb-3 border-b border-gray-100 dark:border-gray-700 space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <HiOutlineClock className="shrink-0 text-base" />
                            <span>
                                {timeFromISO(jadwal.tanggal_mulai)} –{' '}
                                {timeFromISO(jadwal.tanggal_selesai)}
                            </span>
                            {jadwal.instruktur && (
                                <>
                                    <span className="text-gray-300 dark:text-gray-600">·</span>
                                    <HiOutlineUser className="shrink-0 text-base" />
                                    <span>{jadwal.instruktur}</span>
                                </>
                            )}
                        </div>
                        {tanggal && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <HiOutlineCalendar className="shrink-0 text-base" />
                                <span>{formatTanggal(tanggal)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Search ──────────────────────────────── */}
                {!loading && rows.length > 0 && (
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                        <Input
                            size="sm"
                            placeholder="Cari nama siswa..."
                            prefix={<HiOutlineSearch className="text-gray-400" />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}

                {/* ── Ringkasan + tombol mark-all ───────────── */}
                {!loading && rows.length > 0 && (
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {STATUS_BUTTONS.map((btn) => (
                                    <span
                                        key={btn.value}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[btn.value]}`}
                                    >
                                        {btn.label}
                                        <strong>{counts[btn.value]}</strong>
                                    </span>
                                ))}
                                {unsetCount > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                        Belum <strong>{unsetCount}</strong>
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    Total <strong>{rows.length}</strong>
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400 mr-0.5">Semua:</span>
                                {STATUS_BUTTONS.map((btn) => (
                                    <button
                                        key={btn.value}
                                        type="button"
                                        onClick={() => handleMarkAll(btn.value)}
                                        title={`Tandai semua ${btn.label}`}
                                        className={`w-8 h-7 rounded-lg text-xs font-bold transition-colors ${btn.inactive}`}
                                    >
                                        {btn.short}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Daftar siswa ─────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
                                        <div className="space-y-1.5">
                                            <div className="w-28 h-3.5 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
                                            <div className="w-20 h-3 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {Array.from({ length: 4 }).map((_, j) => (
                                            <div
                                                key={j}
                                                className="w-10 h-9 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 text-sm px-4">
                            Tidak ada siswa aktif terdaftar di kelas ini.
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 text-sm px-4">
                            Siswa &ldquo;{search}&rdquo; tidak ditemukan.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredRows.map((row) => {
                                const initials = row.siswa_nama
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((w) => w[0])
                                    .join('')
                                    .toUpperCase()

                                return (
                                    <div
                                        key={row.id_daftar}
                                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                {initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                                    {row.siswa_nama}
                                                </p>
                                                {row.siswa_telepon && (
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {row.siswa_telepon}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* H / I / S / A */}
                                        <div className="flex gap-1 shrink-0">
                                            {STATUS_BUTTONS.map((btn) => (
                                                <button
                                                    key={btn.value}
                                                    type="button"
                                                    title={btn.label}
                                                    onClick={() =>
                                                        handleToggle(row.id_daftar, btn.value)
                                                    }
                                                    className={`w-10 h-9 rounded-lg text-xs font-bold transition-all ${row.status === btn.value
                                                        ? btn.active
                                                        : btn.inactive
                                                        }`}
                                                >
                                                    {btn.short}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* ── Tombol simpan ─────────────────────────── */}
                {!loading && rows.length > 0 && (
                    <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
                        <Button
                            variant="solid"
                            className="w-full"
                            icon={<HiOutlineSave />}
                            loading={saving}
                            onClick={handleSave}
                        >
                            Simpan Presensi
                        </Button>
                    </div>
                )}
            </div>
        </Drawer>
    )
}

export default AbsenDrawer
