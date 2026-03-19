'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import type {
    IPaket,
    IPaketCreate,
    IPaketUpdate,
    KodePaket,
} from '@/@types/paket.types'

type KodeOption = { value: KodePaket; label: string }

const KODE_OPTIONS: KodeOption[] = [
    { value: 'FREE', label: 'Free' },
    { value: 'STARTER', label: 'Starter' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'ENTERPRISE', label: 'Enterprise' },
]

interface PaketFormProps {
    open: boolean
    editData?: IPaket | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: IPaketCreate | IPaketUpdate) => void
}

interface FormState {
    kode_paket: KodePaket
    nama: string
    maks_karyawan: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode_paket: 'FREE',
    nama: '',
    maks_karyawan: '10',
    aktif: true,
}

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
    const isEnterprise = form.kode_paket === 'ENTERPRISE'

    useEffect(() => {
        if (editData) {
            setForm({
                kode_paket: editData.kode_paket,
                nama: editData.nama,
                maks_karyawan: String(editData.maks_karyawan),
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    useEffect(() => {
        if (isEnterprise) {
            setForm((p) => ({ ...p, maks_karyawan: '999999' }))
        }
    }, [isEnterprise])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama.trim()) newErrors.nama = 'Nama paket wajib diisi'
        if (!form.maks_karyawan || Number(form.maks_karyawan) < 1)
            newErrors.maks_karyawan = 'Maks. karyawan wajib diisi (min. 1)'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const payload: IPaketCreate = {
            kode_paket: form.kode_paket,
            nama: form.nama.trim(),
            maks_karyawan: Number(form.maks_karyawan),
            aktif: form.aktif ? 1 : 0,
        }
        onSubmit(payload)
    }

    return (
        <Dialog
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            width={480}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Paket' : 'Tambah Paket Baru'}
            </h5>

            <div className="flex flex-col gap-4">
                <FormItem label="Kode Paket">
                    <Select<KodeOption>
                        options={KODE_OPTIONS}
                        value={
                            KODE_OPTIONS.find(
                                (o) => o.value === form.kode_paket,
                            ) ?? KODE_OPTIONS[0]
                        }
                        onChange={(opt) =>
                            setForm((p) => ({
                                ...p,
                                kode_paket: (opt as KodeOption).value,
                            }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Paket"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: Free Plan"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Maks. Karyawan"
                    asterisk
                    invalid={!!errors.maks_karyawan}
                    errorMessage={errors.maks_karyawan}
                    extra={
                        isEnterprise ? (
                            <span className="text-xs text-gray-400">
                                Otomatis Unlimited (999.999)
                            </span>
                        ) : undefined
                    }
                >
                    <Input
                        type="number"
                        min={1}
                        value={form.maks_karyawan}
                        invalid={!!errors.maks_karyawan}
                        disabled={isEnterprise}
                        placeholder={
                            isEnterprise ? 'Unlimited (999999)' : '10'
                        }
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
