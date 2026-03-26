'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Switcher,
} from '@/components/ui'
import type { IPaket, IPaketCreate, IPaketUpdate } from '@/@types/paket.types'
import { formatNum } from '@/utils/formatNumber'

interface PaketFormProps {
    open: boolean
    editData?: IPaket | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: IPaketCreate | IPaketUpdate) => void
}

interface FormState {
    kode_paket: string
    nama_paket: string
    harga: string
    maks_karyawan: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode_paket: '',
    nama_paket: '',
    harga: '0',
    maks_karyawan: '10',
    aktif: true,
}

const formatRupiah = (raw: string): string => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return '0'
    return formatNum(Number(digits))
}

const parseRupiah = (formatted: string): number =>
    Number(formatted.replace(/\./g, '')) || 0

const PaketForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: PaketFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormState, string>>
    >({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                kode_paket: editData.kode_paket,
                nama_paket: editData.nama_paket,
                harga: formatNum(Number(editData.harga)),
                maks_karyawan: String(editData.maks_karyawan),
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.kode_paket.trim())
            newErrors.kode_paket = 'Kode paket wajib diisi'
        if (!form.nama_paket.trim()) newErrors.nama_paket = 'Nama paket wajib diisi'
        if (parseRupiah(form.harga) < 0)
            newErrors.harga = 'Harga tidak boleh negatif'
        if (!form.maks_karyawan || Number(form.maks_karyawan) < 1)
            newErrors.maks_karyawan = 'Maks. karyawan wajib diisi (min. 1)'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const payload: IPaketCreate = {
            kode_paket: form.kode_paket.trim().toUpperCase(),
            nama_paket: form.nama_paket.trim(),
            harga: parseRupiah(form.harga),
            maks_karyawan: Number(form.maks_karyawan),
            aktif: form.aktif ? 1 : 0,
        }
        onSubmit(payload)
    }

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={480}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Paket' : 'Tambah Paket Baru'}
            </h5>

            <div className="flex flex-col gap-0">
                <FormItem
                    label="Kode Paket"
                    asterisk
                    invalid={!!errors.kode_paket}
                    errorMessage={errors.kode_paket}
                    extra={
                        <span className="text-xs text-gray-400">
                            Akan diubah ke huruf kapital otomatis
                        </span>
                    }
                >
                    <Input
                        placeholder="contoh: BASIC, GOLD, PREMIUM"
                        value={form.kode_paket}
                        invalid={!!errors.kode_paket}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                kode_paket: e.target.value.toUpperCase(),
                            }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Paket"
                    asterisk
                    invalid={!!errors.nama_paket}
                    errorMessage={errors.nama_paket}
                >
                    <Input
                        placeholder="contoh: Free Plan"
                        value={form.nama_paket}
                        invalid={!!errors.nama_paket}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama_paket: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Harga"
                    asterisk
                    invalid={!!errors.harga}
                    errorMessage={errors.harga}
                    extra={
                        <span className="text-xs text-gray-400">
                            0 untuk paket gratis
                        </span>
                    }
                >
                    <Input
                        prefix={
                            <span className="text-gray-500 font-medium">
                                Rp
                            </span>
                        }
                        placeholder="0"
                        value={form.harga}
                        invalid={!!errors.harga}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                harga: formatRupiah(e.target.value),
                            }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Maks. Karyawan"
                    asterisk
                    invalid={!!errors.maks_karyawan}
                    errorMessage={errors.maks_karyawan}
                >
                    <Input
                        type="number"
                        min={1}
                        value={form.maks_karyawan}
                        invalid={!!errors.maks_karyawan}
                        placeholder="10"
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                maks_karyawan: e.target.value,
                            }))
                        }
                    />
                </FormItem>

                <FormItem label="Status Paket">
                    <div className="flex items-center gap-3">
                        <Switcher
                            checked={form.aktif}
                            onChange={(val) =>
                                setForm((p) => ({ ...p, aktif: val }))
                            }
                        />
                        <span className="text-sm text-gray-600">
                            {form.aktif
                                ? 'Aktif — ditampilkan ke pengguna'
                                : 'Nonaktif — disembunyikan'}
                        </span>
                    </div>
                </FormItem>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button
                    variant="solid"
                    loading={submitting}
                    onClick={handleSubmit}
                >
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Paket'}
                </Button>
            </div>
        </Dialog>
    )
}

export default PaketForm
