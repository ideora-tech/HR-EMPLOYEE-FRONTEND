'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, FormItem, Input, Select, Spinner, Tag } from '@/components/ui'
import { HiArrowLeft, HiOutlineUser, HiOutlineTag, HiOutlineCollection, HiOutlineCalendar, HiOutlineCash, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi'
import TagihanService from '@/services/kursus/tagihan.service'
import { formatNum, formatRupiah } from '@/utils/formatNumber'
import { ROUTES } from '@/constants/route.constant'
import type { ITagihan, ICreatePembayaran } from '@/@types/kursus.types'

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

    const [form, setForm] = useState<FormState>(INITIAL)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const [tagihanOptions, setTagihanOptions] = useState<TagihanOption[]>([])
    const [loadingTagihan, setLoadingTagihan] = useState(false)
    const [selectedTagihan, setSelectedTagihan] = useState<ITagihan | null>(null)

    const loadTagihan = useCallback(async () => {
        setLoadingTagihan(true)
        try {
            const res = await TagihanService.getAll({ limit: 500 })
            if (res.success) {
                const belumLunas = res.data.filter((t) => t.status !== 3 && t.status !== 4)
                setTagihanOptions(
                    belumLunas.map((t) => ({
                        value: t.id_tagihan,
                        label: `${t.nama_siswa}${t.periode ? ` — ${t.periode}` : ''} (${t.nama_biaya})`,
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

    /* Auto-select tagihan jika ada query param ?id= */
    useEffect(() => {
        if (!preselectedId || tagihanOptions.length === 0) return
        const opt = tagihanOptions.find((o) => o.value === preselectedId)
        if (opt) handleTagihanChange(opt)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedId, tagihanOptions])

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((p) => ({ ...p, [key]: val }))

    const handleTagihanChange = (opt: TagihanOption) => {
        const t = opt.tagihan
        const sisa = t.total_harga - t.total_bayar
        setSelectedTagihan(t)
        setForm((p) => ({
            ...p,
            id_tagihan: t.id_tagihan,
            jumlah: formatNum(sisa > 0 ? sisa : 0),
        }))
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

    return (
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
                            {loadingTagihan ? (
                                <div className="flex items-center gap-2 text-sm text-gray-400 h-10">
                                    <Spinner size={16} /> Memuat data tagihan…
                                </div>
                            ) : (
                                <Select<TagihanOption>
                                    options={tagihanOptions}
                                    value={tagihanOptions.find((o) => o.value === form.id_tagihan) ?? null}
                                    onChange={(opt) => opt && handleTagihanChange(opt as TagihanOption)}
                                    placeholder="Pilih tagihan siswa"
                                />
                            )}
                        </FormItem>

                        {/* Info tagihan — muncul setelah dipilih */}
                        {selectedTagihan && (
                            <div className="mt-4 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                {/* Header strip */}
                                <div className="flex items-center justify-between px-5 py-3 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-100 dark:border-indigo-500/20">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineUser className="text-indigo-500 text-base shrink-0" />
                                        <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm">
                                            {selectedTagihan.nama_siswa}
                                        </span>
                                    </div>
                                    {statusInfo && (
                                        <Tag className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusInfo.cls}`}>
                                            {statusInfo.label}
                                        </Tag>
                                    )}
                                </div>

                                {/* Detail info */}
                                <div className="px-5 py-4 bg-white dark:bg-gray-800/40 grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                                    <div className="flex items-start gap-2">
                                        <HiOutlineTag className="text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400">Biaya</p>
                                            <p className="font-medium text-gray-700 dark:text-gray-200">{selectedTagihan.nama_biaya}</p>
                                        </div>
                                    </div>
                                    {selectedTagihan.nama_kelas && (
                                        <div className="flex items-start gap-2">
                                            <HiOutlineCollection className="text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-400">Kelas</p>
                                                <p className="font-medium text-gray-700 dark:text-gray-200">{selectedTagihan.nama_kelas}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedTagihan.periode && (
                                        <div className="flex items-start gap-2">
                                            <HiOutlineCalendar className="text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-400">Periode</p>
                                                <p className="font-medium text-gray-700 dark:text-gray-200">{selectedTagihan.periode}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Ringkasan nominal */}
                                <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex flex-col items-center gap-1 py-4 px-3 bg-gray-50 dark:bg-gray-800/60">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <HiOutlineCash className="text-base" />
                                            <span className="text-xs">Total Tagihan</span>
                                        </div>
                                        <p className="font-bold text-gray-800 dark:text-gray-100 text-base">
                                            {formatRupiah(selectedTagihan.total_harga)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 py-4 px-3 bg-emerald-50 dark:bg-emerald-500/10">
                                        <div className="flex items-center gap-1.5 text-emerald-500">
                                            <HiOutlineCheckCircle className="text-base" />
                                            <span className="text-xs">Sudah Dibayar</span>
                                        </div>
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                            {formatRupiah(selectedTagihan.total_bayar)}
                                        </p>
                                    </div>
                                    <div className={`flex flex-col items-center gap-1 py-4 px-3 ${(sisa ?? 0) > 0 ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-gray-50 dark:bg-gray-800/60'}`}>
                                        <div className={`flex items-center gap-1.5 ${(sisa ?? 0) > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
                                            <HiOutlineClock className="text-base" />
                                            <span className="text-xs">Sisa Tagihan</span>
                                        </div>
                                        <p className={`font-bold text-base ${(sisa ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`}>
                                            {formatRupiah(sisa ?? 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

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
    )
}

export default PembayaranFormPage
