'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    Button,
    Card,
    Notification,
    toast,
} from '@/components/ui'
import { HiArrowLeft } from 'react-icons/hi'
import PresensiService from '@/services/kursus/presensi.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IPresensi } from '@/@types/kursus.types'

const STATUS_MAP: Record<1 | 2 | 3 | 4, { label: string; className: string }> = {
    1: { label: 'Hadir', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
    2: { label: 'Tidak Hadir', className: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
    3: { label: 'Sakit', className: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' },
    4: { label: 'Izin', className: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' },
}

const PresensiDetailPage = () => {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string

    const [presensi, setPresensi] = useState<IPresensi | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchDetail = useCallback(async () => {
        if (!id) return
        setLoading(true)
        try {
            const res = await PresensiService.getById(id)
            if (res.success) {
                setPresensi(res.data)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.PRESENSI)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchDetail()
    }, [fetchDetail])

    const j = presensi?.jadwal
    const s = presensi?.siswa
    const statusInfo = presensi ? STATUS_MAP[presensi.status] : null

    return (
        <div className="flex flex-col gap-4">
            {/* Back */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push('/kursus/presensi')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <HiArrowLeft className="text-base" />
                    Kembali
                </button>
            </div>

            {/* Info Card */}
            <Card>
                {loading ? (
                    <div className="h-24 animate-pulse bg-gray-100 dark:bg-gray-700 rounded" />
                ) : presensi && j && s ? (
                    <div className="flex flex-col gap-4">
                        {/* Jadwal info */}
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-100">
                                {j.nama_kelas}
                            </h4>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {j.hari} · {j.jam_mulai} – {j.jam_selesai}
                            </p>
                            <p className="text-sm text-gray-500">
                                Tanggal:{' '}
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {presensi.tanggal
                                        ? new Date(presensi.tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })
                                        : '–'}
                                </span>
                            </p>
                        </div>

                        {/* Siswa + status */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Siswa</p>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{s.nama_siswa}</p>
                                {s.telepon && (
                                    <p className="text-xs text-gray-400">{s.telepon}</p>
                                )}
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1">
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                                {statusInfo && (
                                    <span
                                        className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold ${statusInfo.className}`}
                                    >
                                        {statusInfo.label}
                                    </span>
                                )}
                                {presensi.catatan && (
                                    <p className="text-xs text-gray-500 italic">{presensi.catatan}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">Data presensi tidak ditemukan.</p>
                )}
            </Card>
        </div>
    )
}

export default PresensiDetailPage

const HARI_MAP: Record<number, string> = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis',
    5: 'Jumat', 6: 'Sabtu', 7: 'Minggu',
}

const KET_LABEL: Record<KeteranganValue, string> = {
    1: 'Hadir', 2: 'Izin', 3: 'Sakit', 4: 'Alpha',
}
const KET_CLASS: Record<KeteranganValue, string> = {
    1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    2: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
    3: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
    4: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400',
}

const PresensiDetailPage = () => {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string

    const [presensi, setPresensi] = useState<IPresensiWithDetail | null>(null)
    const [rows, setRows] = useState<PresensiRow[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetchDetail = useCallback(async () => {
        if (!id) return
        setLoading(true)
        try {
            const res = await PresensiService.getById(id)
            if (res.success) {
                setPresensi(res.data)
                setRows(
                    res.data.detail.map((d) => ({
                        id_detail: d.id_detail,
                        id_daftar: d.daftar?.id_daftar ?? '',
                        nama_siswa: d.siswa.nama_siswa,
                        telepon: d.siswa.telepon,
                        keterangan: d.keterangan,
                        catatan: d.catatan ?? '',
                    })),
                )
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.PRESENSI)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        fetchDetail()
    }, [fetchDetail])

    const handleChange = (
        id_detail: string,
        field: 'keterangan' | 'catatan',
        value: KeteranganValue | string,
    ) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id_detail === id_detail ? { ...r, [field]: value } : r,
            ),
        )
    }

    const handleSave = async () => {
        if (!presensi) return
        setSaving(true)
        try {
            await PresensiService.batch({
                id_jadwal: presensi.jadwal.id_jadwal,
                items: rows.map((r) => ({
                    id_daftar: r.id_daftar,
                    status: r.keterangan,
                })),
            })
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.PRESENSI)} />,
            )
            fetchDetail()
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

    const j = presensi?.jadwal

    return (
        <div className="flex flex-col gap-4">
            {/* ── Back + Header ── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push('/kursus/presensi')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <HiArrowLeft className="text-base" />
                    Kembali
                </button>
            </div>

            {/* ── Info Card ── */}
            <Card>
                {loading ? (
                    <div className="h-16 animate-pulse bg-gray-100 dark:bg-gray-700 rounded" />
                ) : presensi ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-100">
                                {j?.nama_jadwal}
                            </h4>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {j?.hari ? `${HARI_MAP[j.hari]} · ` : ''}
                                {j?.tanggal_mulai
                                    ? `${j.tanggal_mulai.replace('T', ' ').slice(11, 16)} – ${j?.tanggal_selesai?.replace('T', ' ').slice(11, 16)}`
                                    : `${j?.jam_mulai ?? ''}–${j?.jam_selesai ?? ''}`}
                                {j?.program ? ` · ${j.program.nama_program}` : ''}
                            </p>
                            <p className="text-sm text-gray-500">
                                Tanggal:{' '}
                                <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {j?.tanggal_mulai
                                        ? new Date(j.tanggal_mulai.replace(' ', 'T')).toLocaleDateString('id-ID', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                                        })
                                        : '–'}
                                </span>
                            </p>
                            {j?.instruktur && (
                                <p className="text-sm text-gray-400">Instruktur: {j.instruktur}</p>
                            )}
                        </div>

                        {/* ── Summary badges ── */}
                        <div className="flex flex-wrap gap-2 shrink-0">
                            {([1, 2, 3, 4] as KeteranganValue[]).map((k) => {
                                const count = rows.filter((r) => r.keterangan === k).length
                                return (
                                    <div
                                        key={k}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${KET_CLASS[k]}`}
                                    >
                                        <span>{KET_LABEL[k]}</span>
                                        <span className="text-base font-bold">{count}</span>
                                    </div>
                                )
                            })}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                <span>Total</span>
                                <span className="text-base font-bold">{rows.length}</span>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Card>

            {/* ── Detail Table ── */}
            <Card
                header={{
                    content: <h5>Daftar Kehadiran Siswa</h5>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiOutlineSave />}
                            loading={saving}
                            disabled={loading || rows.length === 0}
                            onClick={handleSave}
                        >
                            Simpan Presensi
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <PresensiDetailTable
                    rows={rows}
                    onChange={handleChange}
                    disabled={loading}
                />
            </Card>
        </div>
    )
}

export default PresensiDetailPage
