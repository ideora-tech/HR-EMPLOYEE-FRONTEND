'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, Dialog, FormItem, Input, Notification, Select, Spinner, Tag, toast } from '@/components/ui'
import { HiArrowLeft, HiOutlinePlus, HiOutlineTrash, HiOutlineUser, HiOutlineTag, HiOutlineCollection, HiOutlineCalendar, HiOutlineCash, HiOutlineCheckCircle, HiOutlineClock, HiOutlineReceiptTax, HiOutlineDocumentText, HiOutlineX, HiCheck } from 'react-icons/hi'
import TagihanService from '@/services/kursus/tagihan.service'
import DiskonService from '@/services/kursus/diskon.service'
import { parseApiError } from '@/utils/parseApiError'
import { formatNum, formatRupiah } from '@/utils/formatNumber'
import { ROUTES } from '@/constants/route.constant'
import type { ITagihan, IDiskon, ICreatePembayaran } from '@/@types/kursus.types'
import TambahDetailForm from '@/components/kursus/tagihan/TambahDetailForm'

/* ─── helpers ─────────────────────────────────────────────── */

function todayIso(): string {
    return new Date().toISOString().slice(0, 10)
}

function formatRupiahInput(raw: string): string {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return '0'
    return formatNum(Number(digits))
}

function parseRupiah(v: string): number {
    return Number(v.replace(/\./g, '')) || 0
}

const STATUS_LABEL: Record<number, { label: string; cls: string }> = {
    1: { label: 'Menunggu', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    2: { label: 'Sebagian', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
    3: { label: 'Lunas', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
    4: { label: 'Dibatalkan', cls: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
}

type MetodeOption = { value: 'TUNAI' | 'TRANSFER' | 'QRIS'; label: string }

const METODE_OPTIONS: MetodeOption[] = [
    { value: 'TUNAI', label: 'Tunai' },
    { value: 'TRANSFER', label: 'Transfer Bank' },
    { value: 'QRIS', label: 'QRIS' },
]

type TagihanOption = { value: string; label: string; tagihan: ITagihan }
type DiskonOption = { value: string; label: string; diskon: IDiskon }
type DiskonMode = 'none' | 'dropdown' | 'kode'

interface FormState {
    id_tagihan: string
    jumlah: string
    tanggal_bayar: string
    metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
    referensi: string
    deskripsi: string
}

const INITIAL: FormState = {
    id_tagihan: '',
    jumlah: '0',
    tanggal_bayar: todayIso(),
    metode: 'TUNAI',
    referensi: '',
    deskripsi: '',
}

/* ─── props ─────────────────────────────────────────────────── */

interface PembayaranFormPageProps {
    submitting?: boolean
    onSubmit: (payload: ICreatePembayaran) => void
}

/* ─── component ─────────────────────────────────────────────── */

const PembayaranFormPage = ({ submitting = false, onSubmit }: PembayaranFormPageProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedId = searchParams.get('id')

    /* Fix: react-modal (Drawer/Dialog) kadang meninggalkan class drawer-open + drawer-lock-scroll
       di body saat navigasi client-side, menyebabkan overflow:hidden dan scroll hilang */
    useEffect(() => {
        document.body.classList.remove('drawer-open', 'drawer-lock-scroll')
        document.body.style.overflow = ''
    }, [])

    const [form, setForm] = useState<FormState>(INITIAL)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const [tagihanOptions, setTagihanOptions] = useState<TagihanOption[]>([])
    const [loadingTagihan, setLoadingTagihan] = useState(false)
    const [selectedTagihan, setSelectedTagihan] = useState<ITagihan | null>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    const [detailFormOpen, setDetailFormOpen] = useState(false)
    const [deletingDetailId, setDeletingDetailId] = useState<string | null>(null)
    const [deleteDetailConfirm, setDeleteDetailConfirm] = useState(false)
    const [deletingDetail, setDeletingDetail] = useState(false)

    // Diskon
    const [diskonMode, setDiskonMode] = useState<'none' | 'dropdown' | 'kode'>('none')
    const [diskonOptions, setDiskonOptions] = useState<DiskonOption[]>([])
    const [loadingDiskon, setLoadingDiskon] = useState(false)
    const [selectedDiskon, setSelectedDiskon] = useState<DiskonOption | null>(null)
    const [kodeDiskon, setKodeDiskon] = useState('')
    const [applyingDiskon, setApplyingDiskon] = useState(false)

    const loadTagihan = useCallback(async () => {
        setLoadingTagihan(true)
        try {
            const res = await TagihanService.getAll({ limit: 500 })
            if (res.success) {
                const belumLunas = res.data.filter((t) => t.status !== 3 && t.status !== 4)
                setTagihanOptions(
                    belumLunas.map((t) => ({
                        value: t.id_tagihan,
                        label: `${t.nama_siswa}`,
                        tagihan: t,
                    })),
                )
            }
        } catch {
            setTagihanOptions([])
        } finally {
            setLoadingTagihan(false)
        }
    }, [])

    useEffect(() => {
        loadTagihan()
    }, [loadTagihan])

    const loadDiskon = useCallback(async () => {
        setLoadingDiskon(true)
        try {
            const res = await DiskonService.getAktif()
            if (res.success)
                setDiskonOptions(res.data.map((d) => ({
                    value: d.id_diskon,
                    label: `${d.nama_diskon} — ${d.persentase ? d.persentase + '%' : formatRupiah(d.harga ?? 0)}`,
                    diskon: d,
                })))
        } catch {
            setDiskonOptions([])
        } finally {
            setLoadingDiskon(false)
        }
    }, [])

    useEffect(() => { loadDiskon() }, [loadDiskon])

    /* Auto-select tagihan jika ada query param ?id= */
    useEffect(() => {
        if (!preselectedId || tagihanOptions.length === 0) return
        const opt = tagihanOptions.find((o) => o.value === preselectedId)
        if (opt) handleTagihanChange(opt)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedId, tagihanOptions])

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((p) => ({ ...p, [key]: val }))

    const handleTagihanChange = async (opt: TagihanOption) => {
        const t = opt.tagihan
        const sisa = t.total_harga - t.total_bayar
        // Set data dari list dulu (langsung tampil)
        setSelectedTagihan(t)
        setForm((p) => ({
            ...p,
            id_tagihan: t.id_tagihan,
            jumlah: formatNum(sisa > 0 ? sisa : 0),
        }))
        // Lalu fetch detail lengkap (detail[], diskon)
        setLoadingDetail(true)
        try {
            const res = await TagihanService.getById(t.id_tagihan)
            if (res.success) setSelectedTagihan(res.data)
        } catch {
            // biarkan data dari list tetap tampil
        } finally {
            setLoadingDetail(false)
        }
    }

    const validate = (): boolean => {
        const e: typeof errors = {}
        if (!form.id_tagihan) e.id_tagihan = 'Tagihan wajib dipilih'
        if (parseRupiah(form.jumlah) <= 0) e.jumlah = 'Jumlah harus lebih dari 0'
        if (!form.tanggal_bayar) e.tanggal_bayar = 'Tanggal wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        onSubmit({
            id_tagihan: form.id_tagihan,
            jumlah: parseRupiah(form.jumlah),
            tanggal_bayar: form.tanggal_bayar,
            metode: form.metode,
            referensi: form.referensi || null,
            deskripsi: form.deskripsi || null,
            aktif: 1,
        })
    }

    const sisa = selectedTagihan
        ? selectedTagihan.total_harga - selectedTagihan.total_bayar
        : null
    const statusInfo = selectedTagihan ? STATUS_LABEL[selectedTagihan.status] : null

    const handleDetailSaved = (updated: ITagihan) => {
        setSelectedTagihan(updated)
        const sisa = updated.total_harga - updated.total_bayar
        setForm((p) => ({ ...p, jumlah: formatNum(sisa > 0 ? sisa : 0) }))
    }

    const handleApplyDiskon = async () => {
        if (!selectedTagihan) return
        setApplyingDiskon(true)
        try {
            let payload: { id_diskon?: string; kode_diskon?: string }
            if (diskonMode === 'dropdown' && selectedDiskon) {
                payload = { id_diskon: selectedDiskon.value }
            } else if (diskonMode === 'kode' && kodeDiskon.trim()) {
                payload = { kode_diskon: kodeDiskon.trim() }
            } else {
                toast.push(<Notification type="warning" title="Pilih diskon atau masukkan kode promo" />)
                setApplyingDiskon(false)
                return
            }
            const res = await TagihanService.applyDiskon(selectedTagihan.id_tagihan, payload)
            if (res.success) {
                setSelectedTagihan(res.data)
                const sisaBaru = res.data.total_harga - res.data.total_bayar
                setForm((p) => ({ ...p, jumlah: formatNum(sisaBaru > 0 ? sisaBaru : 0) }))
                toast.push(<Notification type="success" title="Diskon berhasil diterapkan" />)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menerapkan diskon">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setApplyingDiskon(false)
        }
    }

    const handleRemoveDiskon = async () => {
        if (!selectedTagihan) return
        setApplyingDiskon(true)
        try {
            const res = await TagihanService.applyDiskon(selectedTagihan.id_tagihan, { id_diskon: null })
            if (res.success) {
                setSelectedTagihan(res.data)
                const sisaBaru = res.data.total_harga - res.data.total_bayar
                setForm((p) => ({ ...p, jumlah: formatNum(sisaBaru > 0 ? sisaBaru : 0) }))
                setDiskonMode('none')
                setSelectedDiskon(null)
                setKodeDiskon('')
                toast.push(<Notification type="success" title="Diskon berhasil dihapus" />)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menghapus diskon">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setApplyingDiskon(false)
        }
    }

    const handleDeleteDetailClick = (idDetail: string) => {
        setDeletingDetailId(idDetail)
        setDeleteDetailConfirm(true)
    }

    const handleDeleteDetailConfirm = async () => {
        if (!deletingDetailId || !selectedTagihan) return
        setDeletingDetail(true)
        try {
            const res = await TagihanService.removeDetail(selectedTagihan.id_tagihan, deletingDetailId)
            toast.push(<Notification type="success" title="Baris biaya berhasil dihapus" />)
            setDeleteDetailConfirm(false)
            setDeletingDetailId(null)
            setSelectedTagihan(res.data)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menghapus baris biaya">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setDeletingDetail(false)
        }
    }

    return (
        <>
            <form
                className="flex flex-col gap-6"
                onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
            >
                {/* ── Page header ── */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push(ROUTES.KURSUS_TAGIHAN)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <HiArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h3 className="font-bold">Catat Pembayaran</h3>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Rekam pembayaran tagihan siswa
                        </p>
                    </div>
                </div>

                <Card>
                    <div className="flex flex-col gap-1">

                        {/* ── Section: Tagihan ── */}
                        <div>
                            <div className="mb-3">
                                <h5 className="font-semibold">Pilih Tagihan</h5>
                                <p className="text-gray-500 text-sm mt-0.5">
                                    Hanya tagihan yang belum lunas yang ditampilkan
                                </p>
                            </div>

                            <FormItem
                                label="Tagihan Siswa"
                                asterisk
                                invalid={!!errors.id_tagihan}
                                errorMessage={errors.id_tagihan}
                            >
                                {loadingTagihan || loadingDetail ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-400 h-10">
                                        <Spinner size={16} /> Memuat data tagihan…
                                    </div>
                                ) : (
                                    <Input
                                        readOnly
                                        placeholder="Tagihan belum dipilih"
                                        value={selectedTagihan ? selectedTagihan.nama_siswa : ''}
                                        invalid={!!errors.id_tagihan}
                                    />
                                )}
                            </FormItem>

                            {/* Info tagihan — muncul setelah dipilih */}
                            {selectedTagihan && (() => {
                                const pct = selectedTagihan.total_harga > 0
                                    ? Math.min(Math.round((selectedTagihan.total_bayar / selectedTagihan.total_harga) * 100), 100)
                                    : 0
                                return (
                                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">

                                    {/* ── Header: nama siswa + status + aksi ── */}
                                    <div className="flex items-center justify-between px-5 py-4 bg-[#E9F3FF] dark:bg-[#E9F3FF]/10 border-b border-[#E9F3FF] dark:border-[#E9F3FF]/10">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2a85ff]/10 shrink-0">
                                                <HiOutlineUser className="text-[#2a85ff] text-lg" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100 text-base leading-tight">{selectedTagihan.nama_siswa}</p>
                                                {selectedTagihan.nama_biaya && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{selectedTagihan.nama_biaya}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {loadingDetail && <Spinner size={14} />}
                                            {statusInfo && (
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.cls}`}>
                                                    {statusInfo.label}
                                                </span>
                                            )}
                                            <Button
                                                type="button"
                                                size="xs"
                                                variant="solid"
                                                className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500"
                                                icon={<HiOutlinePlus />}
                                                onClick={() => setDetailFormOpen(true)}
                                            >
                                                Tambah Biaya
                                            </Button>
                                        </div>
                                    </div>

                                    {/* ── Meta info: kelas, periode, instruktur ── */}
                                    {(selectedTagihan.nama_kelas || selectedTagihan.periode || selectedTagihan.nama_instruktur) && (
                                        <div className="flex flex-wrap gap-4 px-5 py-3 bg-[#E9F3FF] dark:bg-[#E9F3FF]/10 border-b border-[#d0e6ff] dark:border-[#E9F3FF]/20">
                                            {selectedTagihan.nama_kelas && (
                                                <div className="flex items-center gap-1.5 text-sm text-[#2a85ff] dark:text-[#7BB8FF]">
                                                    <HiOutlineCollection className="text-[#2a85ff]/60 shrink-0" />
                                                    <span className="font-medium">{selectedTagihan.nama_kelas}</span>
                                                </div>
                                            )}
                                            {selectedTagihan.periode && (
                                                <div className="flex items-center gap-1.5 text-sm text-[#2a85ff] dark:text-[#7BB8FF]">
                                                    <HiOutlineCalendar className="text-[#2a85ff]/60 shrink-0" />
                                                    <span className="font-medium">{selectedTagihan.periode}</span>
                                                </div>
                                            )}
                                            {selectedTagihan.nama_instruktur && (
                                                <div className="flex items-center gap-1.5 text-sm text-[#2a85ff] dark:text-[#7BB8FF]">
                                                    <HiOutlineTag className="text-[#2a85ff]/60 shrink-0" />
                                                    <span className="font-medium">{selectedTagihan.nama_instruktur}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ── Diskon info ── */}
                                    {selectedTagihan.id_diskon && (
                                        <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-100 dark:border-emerald-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <HiOutlineReceiptTax className="text-emerald-500 shrink-0" />
                                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Diskon Diterapkan</span>
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                                    <span>Harga sebelum diskon</span>
                                                    <span>{formatRupiah(selectedTagihan.total_harga + (selectedTagihan.nominal_diskon ?? 0))}</span>
                                                </div>
                                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <span>
                                                        {selectedTagihan.nama_diskon}
                                                        {selectedTagihan.persen_diskon ? ` (${selectedTagihan.persen_diskon}%)` : ''}
                                                    </span>
                                                    <span>− {formatRupiah(selectedTagihan.nominal_diskon ?? 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── 3 stat cards ── */}
                                    <div className="grid grid-cols-3 bg-white dark:bg-gray-800/40">
                                        <div className="flex flex-col gap-0.5 px-4 py-4 border-r border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                                                <HiOutlineCash className="text-base" />
                                                <span>Total Tagihan</span>
                                            </div>
                                            <p className="font-bold text-gray-800 dark:text-gray-100 text-base">
                                                {formatRupiah(selectedTagihan.total_harga)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-0.5 px-4 py-4 border-r border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-1.5 text-emerald-500 text-xs mb-1">
                                                <HiOutlineCheckCircle className="text-base" />
                                                <span>Sudah Dibayar</span>
                                            </div>
                                            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                                {formatRupiah(selectedTagihan.total_bayar)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-0.5 px-4 py-4">
                                            <div className={`flex items-center gap-1.5 text-xs mb-1 ${(sisa ?? 0) > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
                                                <HiOutlineClock className="text-base" />
                                                <span>Sisa Tagihan</span>
                                            </div>
                                            <p className={`font-bold text-base ${(sisa ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                                                {formatRupiah(sisa ?? 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ── Progress bar ── */}
                                    <div className="px-5 py-3 bg-white dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                                            <span>Progress Pembayaran</span>
                                            <span className="font-semibold text-gray-600 dark:text-gray-300">{pct}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-[#2a85ff]' : 'bg-gray-300'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* ── Rincian Biaya ── */}
                                    <div className="border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800/60">
                                            <HiOutlineDocumentText className="text-gray-400 text-base shrink-0" />
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rincian Biaya</span>
                                            {selectedTagihan.detail && selectedTagihan.detail.length > 0 && (
                                                <span className="ml-auto text-xs font-semibold text-[#2a85ff] dark:text-[#7BB8FF] bg-[#E9F3FF] dark:bg-[#E9F3FF]/10 px-2 py-0.5 rounded-full">
                                                    {selectedTagihan.detail.length} item
                                                </span>
                                            )}
                                        </div>
                                        {selectedTagihan.detail && selectedTagihan.detail.length > 0 ? (
                                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                                {selectedTagihan.detail.map((d, i) => (
                                                    <div key={d.id_detail} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                                                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#E9F3FF] dark:bg-[#E9F3FF]/10 shrink-0">
                                                            <span className="text-xs font-bold text-[#2a85ff] dark:text-[#7BB8FF]">{i + 1}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{d.nama_biaya}</p>
                                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                {d.nama_kelas && (
                                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                        <HiOutlineCollection className="shrink-0" />{d.nama_kelas}
                                                                    </span>
                                                                )}
                                                                {d.periode && (
                                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                        <HiOutlineCalendar className="shrink-0" />{d.periode}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                                                {formatRupiah(d.harga_akhir)}
                                                            </span>
                                                            {(selectedTagihan.detail?.length ?? 0) > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteDetailClick(d.id_detail)}
                                                                    className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                    title="Hapus baris biaya"
                                                                >
                                                                    <HiOutlineTrash className="text-base" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Total baris biaya */}
                                                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/60">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</span>
                                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                                        {formatRupiah(selectedTagihan.detail.reduce((acc, d) => acc + d.harga_akhir, 0))}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
                                                <HiOutlineDocumentText className="text-3xl opacity-40" />
                                                <p className="text-sm">Belum ada rincian biaya</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                )
                            })()}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 my-2" />

                        {/* ── Section: Diskon ── */}
                        {selectedTagihan && (
                            <div>
                                <div className="mb-3">
                                    <h5 className="font-semibold">Diskon</h5>
                                </div>

                                {/* Diskon sudah terpasang */}
                                {selectedTagihan.id_diskon ? (
                                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                                <HiCheck className="text-emerald-600 dark:text-emerald-400 text-base" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                                    {selectedTagihan.nama_diskon}
                                                    {selectedTagihan.persen_diskon ? ` (${selectedTagihan.persen_diskon}%)` : ''}
                                                </p>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                                    Hemat {formatRupiah(selectedTagihan.nominal_diskon ?? 0)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveDiskon}
                                            disabled={applyingDiskon}
                                            className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            title="Hapus diskon"
                                        >
                                            <HiOutlineX className="text-base" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {/* Mode selector */}
                                        <div className="flex gap-2">
                                            {(['none', 'dropdown', 'kode'] as const).map((mode) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => { setDiskonMode(mode); setSelectedDiskon(null); setKodeDiskon('') }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                                                        diskonMode === mode
                                                            ? 'bg-[#E9F3FF] text-[#2a85ff] border-[#d0e6ff] dark:bg-[#E9F3FF]/10 dark:border-[#E9F3FF]/20 dark:text-[#7BB8FF]'
                                                            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {mode === 'none' ? 'Tanpa Diskon' : mode === 'dropdown' ? 'Pilih Diskon' : 'Kode Promo'}
                                                </button>
                                            ))}
                                        </div>

                                        {diskonMode === 'dropdown' && (
                                            <div className="flex gap-2 items-start">
                                                <div className="flex-1">
                                                    <Select<DiskonOption>
                                                        placeholder="— Pilih diskon aktif —"
                                                        options={diskonOptions}
                                                        isLoading={loadingDiskon}
                                                        isClearable
                                                        value={selectedDiskon}
                                                        onChange={(opt) => setSelectedDiskon(opt as DiskonOption | null)}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="solid"
                                                    size="sm"
                                                    className="bg-[#2a85ff] hover:bg-[#0069f6] text-white border-[#2a85ff] shrink-0"
                                                    loading={applyingDiskon}
                                                    disabled={!selectedDiskon}
                                                    onClick={handleApplyDiskon}
                                                >
                                                    Terapkan
                                                </Button>
                                            </div>
                                        )}

                                        {diskonMode === 'kode' && (
                                            <div className="flex gap-2 items-start">
                                                <div className="flex-1">
                                                    <Input
                                                        placeholder="Masukkan kode promo"
                                                        value={kodeDiskon}
                                                        onChange={(e) => setKodeDiskon(e.target.value.toUpperCase())}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="solid"
                                                    size="sm"
                                                    className="bg-[#2a85ff] hover:bg-[#0069f6] text-white border-[#2a85ff] shrink-0"
                                                    loading={applyingDiskon}
                                                    disabled={!kodeDiskon.trim()}
                                                    onClick={handleApplyDiskon}
                                                >
                                                    Terapkan
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="border-t border-gray-100 dark:border-gray-700 my-2" />

                        {/* ── Section: Detail Pembayaran ── */}
                        <div>
                            <div className="mb-3">
                                <h5 className="font-semibold">Detail Pembayaran</h5>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <FormItem
                                    label="Jumlah Pembayaran"
                                    asterisk
                                    invalid={!!errors.jumlah}
                                    errorMessage={errors.jumlah}
                                >
                                    <Input
                                        prefix={<span className="text-gray-500 font-medium">Rp</span>}
                                        value={form.jumlah}
                                        invalid={!!errors.jumlah}
                                        onChange={(e) => set('jumlah', formatRupiahInput(e.target.value))}
                                    />
                                    {selectedTagihan && (sisa ?? 0) > 0 && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Sisa:{' '}
                                            <span
                                                className="text-primary cursor-pointer underline"
                                                onClick={() => set('jumlah', formatNum(sisa!))}
                                            >
                                                {formatRupiah(sisa!)} — klik untuk isi otomatis
                                            </span>
                                        </p>
                                    )}
                                </FormItem>

                                <FormItem
                                    label="Tanggal Pembayaran"
                                    asterisk
                                    invalid={!!errors.tanggal_bayar}
                                    errorMessage={errors.tanggal_bayar}
                                >
                                    <Input
                                        type="date"
                                        value={form.tanggal_bayar}
                                        onChange={(e) => set('tanggal_bayar', e.target.value)}
                                    />
                                </FormItem>

                                <FormItem label="Metode Pembayaran">
                                    <Select<MetodeOption>
                                        options={METODE_OPTIONS}
                                        value={METODE_OPTIONS.find((o) => o.value === form.metode)}
                                        onChange={(opt) => opt && set('metode', (opt as MetodeOption).value)}
                                    />
                                </FormItem>

                                <FormItem label="Nomor Referensi (opsional)">
                                    <Input
                                        placeholder="Mis. TRF-20260401-001"
                                        value={form.referensi}
                                        onChange={(e) => set('referensi', e.target.value)}
                                    />
                                </FormItem>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 my-2" />

                        {/* ── Section: Keterangan ── */}
                        <div>
                            <div className="mb-3">
                                <h5 className="font-semibold">Keterangan</h5>
                            </div>
                            <FormItem label="Catatan (opsional)">
                                <Input
                                    textArea
                                    rows={3}
                                    placeholder="Keterangan tambahan pembayaran…"
                                    value={form.deskripsi}
                                    onChange={(e) => set('deskripsi', e.target.value)}
                                />
                            </FormItem>
                        </div>

                        {/* ── Actions ── */}
                        <div className="flex items-center justify-end gap-4 mt-6">
                            <Button
                                type="button"
                                variant="default"
                                onClick={() => router.push(ROUTES.KURSUS_TAGIHAN)}
                                disabled={submitting}
                            >
                                Batal
                            </Button>
                            <Button type="submit" variant="solid" loading={submitting}>
                                Simpan Pembayaran
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>

            {/* ── Form tambah baris biaya ── */}
            {selectedTagihan && (
                <TambahDetailForm
                    open={detailFormOpen}
                    tagihan={selectedTagihan}
                    onClose={() => setDetailFormOpen(false)}
                    onSaved={handleDetailSaved}
                />
            )}

            {/* ── Konfirmasi hapus baris biaya ── */}
            <Dialog
                isOpen={deleteDetailConfirm}
                onClose={() => setDeleteDetailConfirm(false)}
                onRequestClose={() => setDeleteDetailConfirm(false)}
            >
                <div className="flex flex-col gap-4">
                    <h5 className="font-semibold">Hapus Baris Biaya?</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Baris biaya ini akan dihapus dari tagihan. Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="plain"
                            onClick={() => setDeleteDetailConfirm(false)}
                            disabled={deletingDetail}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="solid"
                            color="red"
                            loading={deletingDetail}
                            onClick={handleDeleteDetailConfirm}
                        >
                            Ya, Hapus
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default PembayaranFormPage
