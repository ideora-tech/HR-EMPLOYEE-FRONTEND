'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    Button,
    DatePicker,
    Dialog,
    Drawer,
    FormItem,
    Input,
    Select,
    Notification,
    toast,
} from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlinePlusCircle,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineUserGroup,
    HiOutlineLocationMarker,
    HiOutlineUser,
    HiOutlineClock,
} from 'react-icons/hi'
import DaftarSiswaService from '@/services/kursus/daftar-kelas.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import SiswaService from '@/services/kursus/siswa.service'
import TarifService from '@/services/kursus/tarif.service'
import { parseApiError } from '@/utils/parseApiError'
import { formatRupiah } from '@/utils/formatNumber'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IJadwalKelas,
    IDaftarKelas,
    ISiswa,
    ITarif,
    IKuotaJadwal,
} from '@/@types/kursus.types'

/* ─── helpers ────────────────────────────────────────────── */

const timeFromISO = (iso: string) => {
    const sep = iso.includes('T') ? 'T' : ' '
    return iso.split(sep)[1]?.slice(0, 5) ?? '00:00'
}

const dateRangeLabel = (mulai: string, selesai: string) => {
    const fmt = (iso: string) => {
        const d = iso.split(/[T ]/)[0]
        if (!d) return ''
        const [y, m, dd] = d.split('-')
        const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
        return `${dd} ${months[parseInt(m, 10) - 1]} ${y}`
    }
    const a = fmt(mulai)
    const b = fmt(selesai)
    return a === b ? a : `${a} – ${b}`
}


const STATUS_OPTIONS = [
    { value: '1', label: 'Aktif' },
    { value: '2', label: 'Selesai' },
    { value: '3', label: 'Berhenti' },
]

const STATUS_STYLE: Record<number, string> = {
    1: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
    2: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300',
    3: 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400',
}
const STATUS_LABEL: Record<number, string> = { 1: 'Aktif', 2: 'Selesai', 3: 'Berhenti' }

type StatusOption = { value: string; label: string }
type TarifOption  = { value: string; label: string }

/* ─── props ──────────────────────────────────────────────── */

interface JadwalDetailDrawerProps {
    open: boolean
    jadwal: IJadwalKelas | null
    onClose: () => void
    onRefresh?: () => void
}

/* ─── component ──────────────────────────────────────────── */

const JadwalDetailDrawer = ({
    open,
    jadwal,
    onClose,
    onRefresh,
}: JadwalDetailDrawerProps) => {
    /* ── list siswa terdaftar ── */
    const [daftarList, setDaftarList]     = useState<IDaftarKelas[]>([])
    const [loadingDaftar, setLoadingDaftar] = useState(false)
    const [kuota, setKuota]               = useState<IKuotaJadwal | null>(null)

    /* ── sub-modal state ── */
    const [enrollOpen, setEnrollOpen]     = useState(false)
    const [editTarget, setEditTarget]     = useState<IDaftarKelas | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IDaftarKelas | null>(null)
    const [submitting, setSubmitting]     = useState(false)

    /* ── enroll form ── */
    const [siswaSearch, setSiswaSearch]       = useState('')
    const [siswaResults, setSiswaResults]     = useState<ISiswa[]>([])
    const [selectedSiswa, setSelectedSiswa]   = useState<ISiswa | null>(null)
    const [tarifList, setTarifList]           = useState<ITarif[]>([])
    const [selectedTarifId, setSelectedTarifId] = useState('')
    const [tanggalDaftar, setTanggalDaftar]   = useState<Date | null>(new Date())
    const [loadingSearch, setLoadingSearch]   = useState(false)
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    /* ── edit status form ── */
    const [editStatus, setEditStatus] = useState<string>('1')
    const [editCatatan, setEditCatatan] = useState('')

    /* ─── load data on open ─────────────────────────────── */
    const loadDaftar = useCallback(async () => {
        if (!jadwal) return
        setLoadingDaftar(true)
        try {
            const [dRes, kRes] = await Promise.all([
                DaftarSiswaService.getByJadwal(jadwal.id_jadwal),
                JadwalKelasService.getKuota(jadwal.id_jadwal),
            ])
            if (dRes.success) setDaftarList(dRes.data)
            if (kRes.success) setKuota(kRes.data)
        } catch {
            toast.push(<Notification type="danger" title="Gagal memuat data siswa" />)
        } finally {
            setLoadingDaftar(false)
        }
    }, [jadwal])

    useEffect(() => {
        if (open && jadwal) {
            loadDaftar()
            TarifService.getByProgram(jadwal.id_program)
                .then((res) => { if (res.success) setTarifList(res.data) })
                .catch(() => {})
        } else {
            setDaftarList([])
            setKuota(null)
            setTarifList([])
        }
    }, [open, jadwal, loadDaftar])

    /* ─── siswa search with debounce ───────────────────── */
    const handleSiswaSearch = (q: string) => {
        setSiswaSearch(q)
        setSelectedSiswa(null)
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
        if (!q.trim()) { setSiswaResults([]); return }
        searchTimerRef.current = setTimeout(async () => {
            setLoadingSearch(true)
            try {
                const res = await SiswaService.getAll({ search: q, limit: 20, aktif: 1 })
                if (res.success) setSiswaResults(res.data)
            } catch {
                // ignore
            } finally {
                setLoadingSearch(false)
            }
        }, 400)
    }

    const resetEnrollForm = () => {
        setSiswaSearch('')
        setSiswaResults([])
        setSelectedSiswa(null)
        setSelectedTarifId('')
        setTanggalDaftar(new Date())
    }

    /* ─── enroll siswa ──────────────────────────────────── */
    const handleEnroll = async () => {
        if (!jadwal || !selectedSiswa || !tanggalDaftar) return
        const y = tanggalDaftar.getFullYear()
        const m = String(tanggalDaftar.getMonth() + 1).padStart(2, '0')
        const d = String(tanggalDaftar.getDate()).padStart(2, '0')

        setSubmitting(true)
        try {
            await DaftarSiswaService.create({
                id_siswa: selectedSiswa.id_siswa,
                id_jadwal: jadwal.id_jadwal,
                tanggal_daftar: `${y}-${m}-${d}`,
                id_tarif: selectedTarifId || undefined,
            })
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.DAFTAR_KELAS)} />)
            setEnrollOpen(false)
            resetEnrollForm()
            loadDaftar()
            onRefresh?.()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.CREATE(ENTITY.DAFTAR_KELAS)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    /* ─── update status ─────────────────────────────────── */
    const handleEditStatus = async () => {
        if (!editTarget) return
        setSubmitting(true)
        try {
            await DaftarSiswaService.update(editTarget.id_daftar, {
                status: Number(editStatus) as 1 | 2 | 3,
                catatan: editCatatan.trim() || undefined,
            })
            toast.push(<Notification type="success" title="Status berhasil diperbarui" />)
            setEditTarget(null)
            loadDaftar()
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memperbarui status">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    /* ─── hapus siswa ───────────────────────────────────── */
    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await DaftarSiswaService.remove(deleteTarget.id_daftar)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.DAFTAR_KELAS)} />)
            setDeleteTarget(null)
            loadDaftar()
            onRefresh?.()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.DAFTAR_KELAS)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    /* ─── tarif options ─────────────────────────────────── */
    const tarifOptions: TarifOption[] = [
        { value: '', label: '— Tanpa Tarif —' },
        ...tarifList.map((t) => ({
            value: t.id_tarif,
            label: `${t.nama} (${t.jenis === 'PAKET' ? `${t.jumlah_pertemuan}x` : 'Per Sesi'} · ${formatRupiah(parseFloat(t.harga))})`,
        })),
    ]

    /* ─── kuota bar ─────────────────────────────────────── */
    const kuotaPct = kuota ? Math.min((kuota.terisi / kuota.kuota) * 100, 100) : 0
    const kuotaFull = kuota ? kuota.sisa === 0 : false

    /* ─── render ─────────────────────────────────────────── */
    return (
        <>
            {/* ── Main Drawer ──────────────────────────────── */}
            <Drawer
                title={
                    <div className="flex items-center gap-2">
                        <HiOutlineUserGroup className="text-primary text-lg" />
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {jadwal?.nama ?? 'Detail Jadwal'}
                        </span>
                    </div>
                }
                isOpen={open}
                onClose={onClose}
                onRequestClose={onClose}
                placement="right"
                width={480}
            >
                {jadwal && (
                    <div className="flex flex-col h-full">
                        {/* ── Jadwal info ─────────────────────── */}
                        <div className="px-4 pt-1 pb-4 border-b border-gray-100 dark:border-gray-700 space-y-2">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <HiOutlineClock className="text-base" />
                                    {timeFromISO(jadwal.tanggal_mulai)} – {timeFromISO(jadwal.tanggal_selesai)}
                                </span>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <span>{dateRangeLabel(jadwal.tanggal_mulai, jadwal.tanggal_selesai)}</span>
                                {jadwal.instruktur && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">|</span>
                                        <span className="flex items-center gap-1">
                                            <HiOutlineUser className="text-base" />
                                            {jadwal.instruktur}
                                        </span>
                                    </>
                                )}
                                {jadwal.lokasi && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">|</span>
                                        <span className="flex items-center gap-1">
                                            <HiOutlineLocationMarker className="text-base" />
                                            {jadwal.lokasi}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Kuota bar */}
                            {kuota && (
                                <div>
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>Kuota terisi</span>
                                        <span className={kuotaFull ? 'text-red-500 font-semibold' : ''}>
                                            {kuota.terisi} / {kuota.kuota}
                                            {kuotaFull && ' — Penuh'}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${kuotaFull ? 'bg-red-400' : 'bg-primary'}`}
                                            style={{ width: `${kuotaPct}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Header siswa + tombol daftar ────── */}
                        <div className="flex items-center justify-between px-4 py-3">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Siswa Terdaftar
                                {daftarList.length > 0 && (
                                    <span className="ml-1.5 text-xs font-normal text-gray-400">
                                        ({daftarList.length})
                                    </span>
                                )}
                            </p>
                            <Button
                                size="xs"
                                variant="solid"
                                icon={<HiOutlinePlusCircle />}
                                disabled={kuotaFull}
                                onClick={() => { resetEnrollForm(); setEnrollOpen(true) }}
                            >
                                Daftarkan Siswa
                            </Button>
                        </div>

                        {/* ── List siswa ──────────────────────── */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                            {loadingDaftar ? (
                                <p className="text-center text-sm text-gray-400 py-8">Memuat...</p>
                            ) : daftarList.length === 0 ? (
                                <div className="text-center py-12">
                                    <HiOutlineUserGroup className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-2" />
                                    <p className="text-sm text-gray-400">Belum ada siswa terdaftar</p>
                                </div>
                            ) : (
                                daftarList.map((item) => (
                                    <div
                                        key={item.id_daftar}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                                    >
                                        {/* Avatar */}
                                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                            {item.siswa.nama.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                {item.siswa.nama}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${STATUS_STYLE[item.status]}`}>
                                                    {STATUS_LABEL[item.status]}
                                                </span>
                                                {item.tarif && (
                                                    <span className="text-[10px] text-gray-400 truncate">
                                                        {item.tarif.nama} · {formatRupiah(parseFloat(item.tarif.harga))}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Aksi */}
                                        <div className="flex gap-1 flex-shrink-0">
                                            <span
                                                className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/30 transition-colors"
                                                onClick={() => {
                                                    setEditTarget(item)
                                                    setEditStatus(String(item.status))
                                                    setEditCatatan(item.catatan ?? '')
                                                }}
                                            >
                                                <HiOutlinePencilAlt className="text-sm" />
                                            </span>
                                            <span
                                                className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 transition-colors"
                                                onClick={() => setDeleteTarget(item)}
                                            >
                                                <HiOutlineTrash className="text-sm" />
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </Drawer>

            {/* ── Enroll Modal ──────────────────────────────── */}
            <Dialog
                isOpen={enrollOpen}
                onClose={submitting ? undefined : () => setEnrollOpen(false)}
                closable={!submitting}
                width={480}
            >
                <h5 className="mb-5">Daftarkan Siswa</h5>

                <div className="flex flex-col gap-1">
                    {/* Search siswa */}
                    <FormItem label="Cari Siswa" asterisk>
                        <div className="relative">
                            <Input
                                placeholder="Ketik nama siswa..."
                                value={siswaSearch}
                                prefix={<HiOutlineSearch className="text-gray-400" />}
                                suffix={
                                    siswaSearch ? (
                                        <HiOutlineX
                                            className="text-gray-400 cursor-pointer hover:text-gray-600"
                                            onClick={() => { setSiswaSearch(''); setSiswaResults([]); setSelectedSiswa(null) }}
                                        />
                                    ) : null
                                }
                                onChange={(e) => handleSiswaSearch(e.target.value)}
                            />
                        </div>

                        {/* Hasil pencarian */}
                        {(siswaResults.length > 0 || loadingSearch) && !selectedSiswa && (
                            <div className="mt-1 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden max-h-48 overflow-y-auto shadow-sm">
                                {loadingSearch ? (
                                    <p className="text-sm text-gray-400 px-3 py-2">Mencari...</p>
                                ) : (
                                    siswaResults.map((s) => (
                                        <button
                                            key={s.id_siswa}
                                            type="button"
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                            onClick={() => { setSelectedSiswa(s); setSiswaSearch(s.nama); setSiswaResults([]) }}
                                        >
                                            <span className="font-medium text-gray-800 dark:text-gray-100">{s.nama}</span>
                                            {s.telepon && <span className="ml-2 text-xs text-gray-400">{s.telepon}</span>}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Selected siswa badge */}
                        {selectedSiswa && (
                            <div className="mt-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium">
                                <HiOutlineUser />
                                {selectedSiswa.nama}
                                <button
                                    type="button"
                                    className="ml-auto text-primary/60 hover:text-primary"
                                    onClick={() => { setSelectedSiswa(null); setSiswaSearch(''); setSiswaResults([]) }}
                                >
                                    <HiOutlineX />
                                </button>
                            </div>
                        )}
                    </FormItem>

                    <FormItem label="Tarif">
                        <Select<TarifOption>
                            options={tarifOptions}
                            value={tarifOptions.find((o) => o.value === selectedTarifId) ?? tarifOptions[0]}
                            onChange={(opt) => setSelectedTarifId((opt as TarifOption).value)}
                        />
                    </FormItem>

                    <FormItem label="Tanggal Daftar" asterisk>
                        <DatePicker
                            value={tanggalDaftar}
                            inputFormat="DD MMM YYYY"
                            clearable={false}
                            onChange={(d) => setTanggalDaftar(d)}
                        />
                    </FormItem>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="plain" onClick={() => setEnrollOpen(false)} disabled={submitting}>
                        Batal
                    </Button>
                    <Button
                        variant="solid"
                        loading={submitting}
                        disabled={!selectedSiswa || !tanggalDaftar}
                        onClick={handleEnroll}
                    >
                        Daftarkan
                    </Button>
                </div>
            </Dialog>

            {/* ── Edit Status Modal ─────────────────────────── */}
            <Dialog
                isOpen={!!editTarget}
                onClose={submitting ? undefined : () => setEditTarget(null)}
                closable={!submitting}
                width={400}
            >
                <h5 className="mb-5">Edit Status Siswa</h5>
                {editTarget && (
                    <div className="flex flex-col gap-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-3">
                            {editTarget.siswa.nama}
                        </p>
                        <FormItem label="Status">
                            <Select<StatusOption>
                                options={STATUS_OPTIONS}
                                value={STATUS_OPTIONS.find((o) => o.value === editStatus) ?? STATUS_OPTIONS[0]}
                                onChange={(opt) => setEditStatus((opt as StatusOption).value)}
                            />
                        </FormItem>
                        <FormItem label="Catatan">
                            <Input
                                placeholder="Catatan opsional..."
                                value={editCatatan}
                                onChange={(e) => setEditCatatan(e.target.value)}
                            />
                        </FormItem>
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="plain" onClick={() => setEditTarget(null)} disabled={submitting}>
                        Batal
                    </Button>
                    <Button variant="solid" loading={submitting} onClick={handleEditStatus}>
                        Simpan
                    </Button>
                </div>
            </Dialog>

            {/* ── Confirm Delete ────────────────────────────── */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Siswa dari Kelas?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: submitting,
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => setDeleteTarget(null)}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            >
                <p className="text-sm">
                    Siswa{' '}
                    <span className="font-semibold">&ldquo;{deleteTarget?.siswa.nama}&rdquo;</span>{' '}
                    akan dikeluarkan dari kelas ini.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default JadwalDetailDrawer
