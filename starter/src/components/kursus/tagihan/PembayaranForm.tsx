'use client'

import { useState, useEffect, useRef } from 'react'
import { Button, Dialog, FormItem, Input, Select } from '@/components/ui'
import { Notification, toast } from '@/components/ui'
import { HiOutlineUpload, HiOutlineX, HiOutlinePhotograph } from 'react-icons/hi'
import PembayaranService from '@/services/kursus/pembayaran.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ITagihan } from '@/@types/kursus.types'
import { formatNum } from '@/utils/formatNumber'

/* ─── types ──────────────────────────────────────────────── */

type MetodeOption = { value: 'TUNAI' | 'TRANSFER' | 'QRIS'; label: string }

const METODE_OPTIONS: MetodeOption[] = [
    { value: 'TUNAI', label: 'Tunai' },
    { value: 'TRANSFER', label: 'Transfer Bank' },
    { value: 'QRIS', label: 'QRIS' },
]

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

interface PembayaranFormProps {
    open: boolean
    tagihan: ITagihan
    onClose: () => void
    onSaved: () => void
}

interface FormState {
    jumlah: string
    tanggal_bayar: string
    metode: 'TUNAI' | 'TRANSFER' | 'QRIS'
    referensi: string
    catatan: string
}

const INITIAL: FormState = {
    jumlah: '0',
    tanggal_bayar: todayIso(),
    metode: 'TUNAI',
    referensi: '',
    catatan: '',
}

/* ─── component ──────────────────────────────────────────── */

const PembayaranForm = ({ open, tagihan, onClose, onSaved }: PembayaranFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL)
    const [buktiFile, setBuktiFile] = useState<File | null>(null)
    const [buktiPreview, setBuktiPreview] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)

    /* Reset on open */
    useEffect(() => {
        if (open) {
            const sisa = tagihan.total_harga - tagihan.total_bayar
            setForm({
                ...INITIAL,
                jumlah: sisa > 0 ? formatNum(sisa) : '0',
                tanggal_bayar: todayIso(),
            })
            setBuktiFile(null)
            setBuktiPreview(null)
            setErrors({})
        }
    }, [open, tagihan])

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: val }))

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        if (!file) return
        setBuktiFile(file)
        const reader = new FileReader()
        reader.onload = (ev) => setBuktiPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
        // reset input so same file can be re-selected
        e.target.value = ''
    }

    const handleRemoveFile = () => {
        setBuktiFile(null)
        setBuktiPreview(null)
    }

    const validate = (): boolean => {
        const e: typeof errors = {}
        if (parseRupiah(form.jumlah) <= 0) e.jumlah = 'Jumlah harus lebih dari 0'
        if (!form.tanggal_bayar) e.tanggal_bayar = 'Tanggal wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            await PembayaranService.create({
                id_tagihan: tagihan.id_tagihan,
                jumlah: parseRupiah(form.jumlah),
                tanggal_bayar: form.tanggal_bayar,
                metode: form.metode,
                referensi: form.referensi || null,
                deskripsi: form.catatan || null,
                bukti_bayar: buktiFile || null,
            })
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.PEMBAYARAN)} />,
            )
            onSaved()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.CREATE(ENTITY.PEMBAYARAN)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSaving(false)
        }
    }

    const sisa = tagihan.total_harga - tagihan.total_bayar

    return (
        <Dialog
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            width={440}
        >
            <h5 className="font-bold mb-1">Catat Pembayaran</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Tagihan: <span className="font-medium text-gray-700 dark:text-gray-200">{tagihan.nama_siswa}</span>
                {sisa > 0 && (
                    <> — sisa{' '}
                        <span className="text-amber-500 font-medium">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(sisa)}
                        </span>
                    </>
                )}
            </p>

            <div className="space-y-4">
                {/* Jumlah */}
                <FormItem
                    label="Jumlah Bayar (Rp)"
                    invalid={!!errors.jumlah}
                    errorMessage={errors.jumlah}
                >
                    <Input
                        value={form.jumlah}
                        prefix="Rp"
                        onChange={(e) => set('jumlah', formatRupiahInput(e.target.value))}
                    />
                </FormItem>

                {/* Tanggal */}
                <FormItem
                    label="Tanggal Pembayaran"
                    invalid={!!errors.tanggal_bayar}
                    errorMessage={errors.tanggal_bayar}
                >
                    <Input
                        type="date"
                        value={form.tanggal_bayar}
                        onChange={(e) => set('tanggal_bayar', e.target.value)}
                    />
                </FormItem>

                {/* Metode */}
                <FormItem label="Metode Pembayaran">
                    <Select
                        options={METODE_OPTIONS}
                        value={METODE_OPTIONS.find((o) => o.value === form.metode)}
                        onChange={(opt) => opt && set('metode', (opt as MetodeOption).value)}
                        placeholder="Pilih metode"
                    />
                </FormItem>

                {/* Referensi */}
                <FormItem label="Nomor Referensi (opsional)">
                    <Input
                        placeholder="Mis. TRF-20260324-001"
                        value={form.referensi}
                        onChange={(e) => set('referensi', e.target.value)}
                    />
                </FormItem>

                {/* Catatan */}
                <FormItem label="Catatan (opsional)">
                    <Input
                        textArea
                        rows={2}
                        placeholder="Catatan pembayaran..."
                        value={form.catatan}
                        onChange={(e) => set('catatan', e.target.value)}
                    />
                </FormItem>

                {/* Bukti Bayar */}
                <FormItem label="Bukti Pembayaran (opsional)">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {!buktiFile ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                        >
                            <HiOutlineUpload className="text-2xl" />
                            <span className="text-sm">Klik untuk upload foto/PDF bukti bayar</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                            {buktiPreview && buktiFile.type.startsWith('image/') ? (
                                <img
                                    src={buktiPreview}
                                    alt="preview"
                                    className="w-14 h-14 object-cover rounded-md shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md shrink-0">
                                    <HiOutlinePhotograph className="text-2xl text-gray-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                    {buktiFile.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {(buktiFile.size / 1024).toFixed(0)} KB
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="shrink-0 p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Hapus file"
                            >
                                <HiOutlineX className="text-base" />
                            </button>
                        </div>
                    )}
                </FormItem>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose} disabled={saving}>
                    Batal
                </Button>
                <Button variant="solid" loading={saving} onClick={handleSubmit}>
                    Simpan
                </Button>
            </div>
        </Dialog>
    )
}

export default PembayaranForm
