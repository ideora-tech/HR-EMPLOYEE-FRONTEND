'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Select } from '@/components/ui'
import type { ITagihan, ICreatePembayaran } from '@/@types/kursus.types'
import { formatRupiahInput, parseRupiah } from '@/utils/formatNumber'

type MetodeOption = { value: 'TUNAI' | 'TRANSFER' | 'QRIS'; label: string }

const METODE_OPTIONS: MetodeOption[] = [
    { value: 'TUNAI', label: 'Tunai' },
    { value: 'TRANSFER', label: 'Transfer Bank' },
    { value: 'QRIS', label: 'QRIS' },
]

function todayIso(): string {
    return new Date().toISOString().slice(0, 10)
}


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

interface PembayaranFormProps {
    open: boolean
    tagihanList: ITagihan[]
    submitting: boolean
    onClose: () => void
    onSubmit: (payload: ICreatePembayaran) => void
}

const PembayaranForm = ({
    open,
    tagihanList,
    submitting,
    onClose,
    onSubmit,
}: PembayaranFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    useEffect(() => {
        if (open) {
            setForm(INITIAL)
            setErrors({})
        }
    }, [open])

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: val }))

    const tagihanOptions = tagihanList.map((t) => ({
        value: t.id_tagihan,
        label: t.nama_siswa
            ? `${t.nama_siswa} — ${t.periode ?? t.id_tagihan.slice(0, 8)}`
            : t.id_tagihan,
    }))

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

    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={480}>
            <h5 className="mb-6">Catat Pembayaran</h5>
            <div className="flex flex-col gap-4">
                <FormItem
                    label="Tagihan"
                    asterisk
                    invalid={!!errors.id_tagihan}
                    errorMessage={errors.id_tagihan}
                >
                    <Select
                        options={tagihanOptions}
                        value={tagihanOptions.find((o) => o.value === form.id_tagihan) ?? null}
                        onChange={(opt) => opt && set('id_tagihan', (opt as { value: string }).value)}
                        placeholder="Pilih tagihan siswa"
                    />
                </FormItem>

                <FormItem
                    label="Jumlah Bayar (Rp)"
                    asterisk
                    invalid={!!errors.jumlah}
                    errorMessage={errors.jumlah}
                >
                    <Input
                        prefix={<span className="text-gray-500 font-medium">Rp</span>}
                        value={form.jumlah}
                        onChange={(e) => set('jumlah', formatRupiahInput(e.target.value))}
                    />
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
                    <Select
                        options={METODE_OPTIONS}
                        value={METODE_OPTIONS.find((o) => o.value === form.metode)}
                        onChange={(opt) => opt && set('metode', (opt as MetodeOption).value)}
                        placeholder="Pilih metode"
                    />
                </FormItem>

                <FormItem label="Nomor Referensi (opsional)">
                    <Input
                        placeholder="Mis. TRF-20260324-001"
                        value={form.referensi}
                        onChange={(e) => set('referensi', e.target.value)}
                    />
                </FormItem>

                <FormItem label="Keterangan (opsional)">
                    <Input
                        placeholder="Catatan tambahan"
                        value={form.deskripsi}
                        onChange={(e) => set('deskripsi', e.target.value)}
                    />
                </FormItem>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="default" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    Simpan
                </Button>
            </div>
        </Dialog>
    )
}

export default PembayaranForm
