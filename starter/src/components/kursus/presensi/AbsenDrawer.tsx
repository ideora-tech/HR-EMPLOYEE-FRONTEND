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
import SiswaSesiPenggantiService from '@/services/kursus/siswa-sesi-pengganti.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import JadwalkanPenggantiModal from './JadwalkanPenggantiModal'
import type { IJadwalKelas, ISiswaSesiPengganti } from '@/@types/kursus.types'

/* ─── types ──────────────────────────────────────────────── */

type StatusValue = 1 | 2

type AbsenRow = {
    id_siswa: string
    nama_siswa: string
    telepon_siswa: string | null
    status: StatusValue | null
    id_presensi?: string
    is_pengganti: boolean
    id_siswa_sesi_pengganti?: string
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
            short: 'TH',
            label: 'Tidak Hadir',
            active: 'bg-red-500 text-white ring-2 ring-red-300',
            inactive:
                'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20',
        },
    ]

const STATUS_BADGE: Record<StatusValue, string> = {
    1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    2: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
}

/* ─── helpers ────────────────────────────────────────────── */

function formatTanggal(tanggal: string): string {
    return new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

function formatTanggalShort(tanggal: string): string {
    return new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    })
}

/* ─── props ──────────────────────────────────────────────── */

interface AbsenDrawerProps {
    open: boolean
    jadwal: IJadwalKelas | null
    tanggal: string | null
    presensiId: string | null
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

    // makeupMap: id_presensi_asal → ISiswaSesiPengganti (status DIJADWALKAN)
    const [makeupMap, setMakeupMap] = useState<Record<string, ISiswaSesiPengganti>>({})
    const [penggantiModal, setPenggantiModal] = useState<{
        open: boolean
        idPresensi: string | null
        namaSiswa: string
    }>({ open: false, idPresensi: null, namaSiswa: '' })

    /* ── On open: load presensi + makeup status ── */
    useEffect(() => {
        if (!open || !jadwal) {
            setRows([])
            setSearch('')
            setMakeupMap({})
            return
        }

        setLoading(true)
        setRows([])
        setMakeupMap({})

        const run = async () => {
            const [presensiRes, makeupRes] = await Promise.all([
                PresensiService.getByJadwal(jadwal.id_jadwal_kelas, tanggal ?? undefined),
                SiswaSesiPenggantiService.getAll({
                    id_jadwal_kelas_asal: jadwal.id_jadwal_kelas,
                    status: 1,
                    limit: 200,
                }),
            ])

            // Build map: id_presensi_asal → sesi pengganti yang dijadwalkan
            const map: Record<string, ISiswaSesiPengganti> = {}
            if (makeupRes.success) {
                for (const m of makeupRes.data) {
                    map[m.id_presensi_asal] = m
                }
            }
            setMakeupMap(map)

            if (!presensiRes.success) return

            setRows(
                presensiRes.data.map((entry) => ({
                    id_siswa: entry.siswa.id_siswa,
                    nama_siswa: entry.siswa.nama_siswa,
                    telepon_siswa: entry.siswa.telepon,
                    status: entry.presensi
                        ? (Number(entry.presensi.status) as StatusValue)
                        : null,
                    id_presensi: entry.presensi?.id_presensi,
                    is_pengganti: entry.is_pengganti ?? false,
                    id_siswa_sesi_pengganti: entry.id_siswa_sesi_pengganti,
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
    }, [open, jadwal, tanggal, presensiId])

    /* ── Handlers ── */
    const handleToggle = (id_siswa: string, isPengganti: boolean, status: StatusValue) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id_siswa === id_siswa && r.is_pengganti === isPengganti
                    ? { ...r, status }
                    : r,
            ),
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
                id_jadwal: jadwal.id_jadwal_kelas,
                ...(tanggal ? { tanggal } : {}),
                items: filledRows.map((r) => ({
                    id_siswa: r.id_siswa,
                    status: r.status as StatusValue,
                    ...(r.id_siswa_sesi_pengganti
                        ? { id_siswa_sesi_pengganti: r.id_siswa_sesi_pengganti }
                        : {}),
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

    /* ── Split regular vs pengganti ── */
    const regularRows = rows.filter((r) => !r.is_pengganti)
    const makeupRows  = rows.filter((r) => r.is_pengganti)

    const filteredRegular = search.trim()
        ? regularRows.filter((r) => r.nama_siswa.toLowerCase().includes(search.trim().toLowerCase()))
        : regularRows
    const filteredMakeup = search.trim()
        ? makeupRows.filter((r) => r.nama_siswa.toLowerCase().includes(search.trim().toLowerCase()))
        : makeupRows

    /* ── Summary counts ── */
    const counts: Record<StatusValue, number> = {
        1: rows.filter((r) => r.status === 1).length,
        2: rows.filter((r) => r.status === 2).length,
    }
    const unsetCount = rows.filter((r) => r.status === null).length

    /* ── Row renderer ── */
    const renderRow = (row: AbsenRow) => {
        const initials = row.nama_siswa
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase()

        const makeupRecord = !row.is_pengganti && row.id_presensi
            ? makeupMap[row.id_presensi]
            : undefined

        const isAbsen = row.status === 2

        return (
            <div
                key={`${row.is_pengganti ? 'p' : 'r'}-${row.id_siswa}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                        row.is_pengganti
                            ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                            : 'bg-primary/10 dark:bg-primary/20 text-primary'
                    }`}>
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                {row.nama_siswa}
                            </p>
                            {row.is_pengganti && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                                    Pengganti
                                </span>
                            )}
                            {makeupRecord && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                                    Makeup {formatTanggalShort(makeupRecord.tanggal_pengganti)}
                                </span>
                            )}
                        </div>
                        {row.telepon_siswa && (
                            <p className="text-xs text-gray-400 truncate">{row.telepon_siswa}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* Tombol "+ Pengganti" — hanya untuk siswa reguler TH yang belum punya makeup */}
                    {!row.is_pengganti && isAbsen && !makeupRecord && row.id_presensi && (
                        <button
                            type="button"
                            title="Jadwalkan sesi pengganti"
                            onClick={() => setPenggantiModal({
                                open: true,
                                idPresensi: row.id_presensi!,
                                namaSiswa: row.nama_siswa,
                            })}
                            className="h-9 px-2 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors whitespace-nowrap"
                        >
                            + Pengganti
                        </button>
                    )}

                    {STATUS_BUTTONS.map((btn) => (
                        <button
                            key={btn.value}
                            type="button"
                            title={btn.label}
                            onClick={() => handleToggle(row.id_siswa, row.is_pengganti, btn.value)}
                            className={`w-10 h-9 rounded-lg text-xs font-bold transition-all ${
                                row.status === btn.value ? btn.active : btn.inactive
                            }`}
                        >
                            {btn.short}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    /* ── Render ── */
    return (
        <>
            <Drawer
                title={
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {jadwal?.nama_kelas ?? 'Absensi Kelas'}
                        </span>
                    </div>
                }
                isOpen={open}
                onClose={onClose}
                onRequestClose={onClose}
                placement="right"
                width={520}
            >
                <div className="flex flex-col h-full">
                    {/* ── Info ─── */}
                    {jadwal && (
                        <div className="px-4 pt-1 pb-3 border-b border-gray-100 dark:border-gray-700 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <HiOutlineClock className="shrink-0 text-base" />
                                <span>{jadwal.jam_mulai} – {jadwal.jam_selesai}</span>
                                {jadwal.nama_karyawan && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">·</span>
                                        <HiOutlineUser className="shrink-0 text-base" />
                                        <span>{jadwal.nama_karyawan}</span>
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

                    {/* ── Search ── */}
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

                    {/* ── Ringkasan + mark-all ── */}
                    {!loading && rows.length > 0 && (
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {STATUS_BUTTONS.map((btn) => (
                                        <span
                                            key={btn.value}
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[btn.value]}`}
                                        >
                                            {btn.label} <strong>{counts[btn.value]}</strong>
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

                    {/* ── Daftar siswa ── */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
                                            <div className="space-y-1.5">
                                                <div className="w-28 h-3.5 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
                                                <div className="w-20 h-3 bg-gray-100 dark:bg-gray-700 animate-pulse rounded" />
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {Array.from({ length: 2 }).map((_, j) => (
                                                <div key={j} className="w-10 h-9 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : rows.length === 0 ? (
                            <div className="py-16 text-center text-gray-400 text-sm px-4">
                                Tidak ada siswa aktif terdaftar di kelas ini.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {filteredRegular.map((row) => renderRow(row))}

                                {filteredMakeup.length > 0 && (
                                    <>
                                        <div className="px-4 py-2 bg-indigo-50/60 dark:bg-indigo-900/20 border-y border-indigo-100 dark:border-indigo-800">
                                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                Sesi Pengganti ({filteredMakeup.length})
                                            </p>
                                        </div>
                                        {filteredMakeup.map((row) => renderRow(row))}
                                    </>
                                )}

                                {filteredRegular.length === 0 && filteredMakeup.length === 0 && (
                                    <div className="py-16 text-center text-gray-400 text-sm px-4">
                                        Siswa &ldquo;{search}&rdquo; tidak ditemukan.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Tombol simpan ── */}
                    {!loading && rows.length > 0 && (
                        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
                            <Button
                                variant="solid"
                                customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
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

            <JadwalkanPenggantiModal
                open={penggantiModal.open}
                idPresensiAsal={penggantiModal.idPresensi}
                namaSiswa={penggantiModal.namaSiswa}
                namaKelasAsal={jadwal?.nama_kelas ?? ''}
                onClose={() => setPenggantiModal({ open: false, idPresensi: null, namaSiswa: '' })}
                onSuccess={() => {
                    if (jadwal) {
                        SiswaSesiPenggantiService.getAll({
                            id_jadwal_kelas_asal: jadwal.id_jadwal_kelas,
                            status: 1,
                            limit: 200,
                        }).then((res) => {
                            if (res.success) {
                                const map: Record<string, ISiswaSesiPengganti> = {}
                                for (const m of res.data) map[m.id_presensi_asal] = m
                                setMakeupMap(map)
                            }
                        }).catch(() => { /* silent */ })
                    }
                }}
            />
        </>
    )
}

export default AbsenDrawer
