'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Switcher,
} from '@/components/ui'
import DatePicker from '@/components/ui/DatePicker'
import type { IDiskon, ICreateDiskon, IUpdateDiskon } from '@/@types/kursus.types'

interface DiskonFormProps {
    open: boolean
    editData?: IDiskon | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateDiskon | IUpdateDiskon) => void
}

interface FormState {
    kode_diskon: string
    nama_diskon: string
    persentase: string
    harga: string
    berlaku_mulai: Date | null
    berlaku_sampai: Date | null
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode_diskon: '',
    nama_diskon: '',
    persentase: '',
    harga: '',
    berlaku_mulai: null,
    berlaku_sampai: null,
    deskripsi: '',
    aktif: true,
}

const toDate = (val: string | null | undefined): Date | null => {
    if (!val) return null
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d
}

const toDateStr = (d: Date | null): string | undefined => {
    if (!d) return undefined
    return d.toISOString().split('T')[0]
}

const DiskonForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: DiskonFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                kode_diskon: editData.kode_diskon,
                nama_diskon: editData.nama_diskon,
                persentase: editData.persentase != null ? String(editData.persentase) : '',
                harga: editData.harga != null ? String(editData.harga) : '',
                berlaku_mulai: toDate(editData.berlaku_mulai),
                berlaku_sampai: toDate(editData.berlaku_sampai),
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const e: Record<string, string> = {}
        if (!form.kode_diskon.trim()) e.kode_diskon = 'Kode diskon wajib diisi'
        else if (form.kode_diskon.length > 20) e.kode_diskon = 'Maksimal 20 karakter'
        if (!form.nama_diskon.trim()) e.nama_diskon = 'Nama diskon wajib diisi'
        if (form.persentase && (isNaN(Number(form.persentase)) || Number(form.persentase) < 0 || Number(form.persentase) > 100))
            e.persentase = 'Persentase 0–100'
        if (form.harga && (isNaN(Number(form.harga)) || Number(form.harga) < 0))
            e.harga = 'Nominal harus angka positif'
        if (form.berlaku_mulai && form.berlaku_sampai && form.berlaku_sampai < form.berlaku_mulai)
            e.berlaku_sampai = 'Tanggal akhir tidak boleh sebelum tanggal mulai'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const base: ICreateDiskon = {
            kode_diskon: form.kode_diskon.trim().toUpperCase(),
            nama_diskon: form.nama_diskon.trim(),
            persentase: form.persentase !== '' ? Number(form.persentase) : undefined,
            harga: form.harga !== '' ? Number(form.harga) : undefined,
            berlaku_mulai: toDateStr(form.berlaku_mulai),
            berlaku_sampai: toDateStr(form.berlaku_sampai),
            deskripsi: form.deskripsi.trim() || undefined,
        }
        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateDiskon)
        } else {
            onSubmit(base)
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={480}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Diskon' : 'Tambah Diskon'}</h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Kode Diskon"
                    asterisk
                    invalid={!!errors.kode_diskon}
                    errorMessage={errors.kode_diskon}
                    extra={<span className="text-xs text-gray-400">Maks. 20 karakter, akan diubah ke huruf kapital</span>}
                >
                    <Input
                        placeholder="contoh: DISC20, PROMO2025"
                        maxLength={20}
                        value={form.kode_diskon}
                        invalid={!!errors.kode_diskon}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, kode_diskon: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Diskon"
                    asterisk
                    invalid={!!errors.nama_diskon}
                    errorMessage={errors.nama_diskon}
                >
                    <Input
                        placeholder="contoh: Diskon Awal Tahun 20%"
                        value={form.nama_diskon}
                        invalid={!!errors.nama_diskon}
                        onChange={(e) => setForm((p) => ({ ...p, nama_diskon: e.target.value }))}
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem
                        label="Persentase (%)"
                        invalid={!!errors.persentase}
                        errorMessage={errors.persentase}
                        extra={<span className="text-xs text-gray-400">0–100, opsional</span>}
                    >
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            step="0.01"
                            placeholder="contoh: 20"
                            value={form.persentase}
                            invalid={!!errors.persentase}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, persentase: e.target.value }))
                            }
                        />
                    </FormItem>

                    <FormItem
                        label="Harga Nominal (Rp)"
                        invalid={!!errors.harga}
                        errorMessage={errors.harga}
                        extra={<span className="text-xs text-gray-400">Atau nominal tetap, opsional</span>}
                    >
                        <Input
                            type="number"
                            min={0}
                            placeholder="contoh: 50000"
                            value={form.harga}
                            invalid={!!errors.harga}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, harga: e.target.value }))
                            }
                        />
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Berlaku Mulai">
                        <DatePicker
                            placeholder="Pilih tanggal mulai"
                            value={form.berlaku_mulai}
                            onChange={(date) =>
                                setForm((p) => ({ ...p, berlaku_mulai: date }))
                            }
                        />
                    </FormItem>

                    <FormItem
                        label="Berlaku Sampai"
                        invalid={!!errors.berlaku_sampai}
                        errorMessage={errors.berlaku_sampai}
                    >
                        <DatePicker
                            placeholder="Pilih tanggal akhir"
                            value={form.berlaku_sampai}
                            minDate={form.berlaku_mulai ?? undefined}
                            onChange={(date) =>
                                setForm((p) => ({ ...p, berlaku_sampai: date }))
                            }
                        />
                    </FormItem>
                </div>

                <FormItem label="Deskripsi">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Keterangan tambahan (opsional)"
                        value={form.deskripsi}
                        onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status">
                        <div className="flex items-center gap-3">
                            <Switcher
                                checked={form.aktif}
                                onChange={(val) => setForm((p) => ({ ...p, aktif: val }))}
                            />
                            <span className="text-sm text-gray-600">
                                {form.aktif ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </div>
                    </FormItem>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="default" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Diskon'}
                </Button>
            </div>
        </Dialog>
    )
}

export default DiskonForm
