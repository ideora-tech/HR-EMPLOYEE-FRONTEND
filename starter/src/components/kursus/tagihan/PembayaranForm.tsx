'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Select } from '@/components/ui'
import { Notification, toast } from '@/components/ui'
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
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    /* Reset on open */
    useEffect(() => {
        if (open) {
            const sisa = tagihan.total_harga - tagihan.total_bayar
            setForm({
                ...INITIAL,
                jumlah: sisa > 0 ? formatNum(sisa) : '0',
                tanggal_bayar: todayIso(),
            })
            setErrors({})
        }
    }, [open, tagihan])

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: val }))

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
                catatan: form.catatan || null,
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
                Tagihan: <span className="font-medium text-gray-700 dark:text-gray-200">{tagihan.siswa.nama_siswa}</span>
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
