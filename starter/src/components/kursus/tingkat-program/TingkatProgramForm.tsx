'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Switcher,
} from '@/components/ui'
import type {
    ITingkatProgram,
    ICreateTingkatProgram,
    IUpdateTingkatProgram,
} from '@/@types/kursus.types'

interface TingkatProgramFormProps {
    open: boolean
    editData?: ITingkatProgram | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateTingkatProgram | IUpdateTingkatProgram) => void
}

interface FormState {
    kode_tingkat: string
    nama_tingkat: string
    urutan: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode_tingkat: '',
    nama_tingkat: '',
    urutan: '1',
    aktif: true,
}

const TingkatProgramForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: TingkatProgramFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                kode_tingkat: editData.kode_tingkat,
                nama_tingkat: editData.nama_tingkat,
                urutan: String(editData.urutan ?? 1),
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.kode_tingkat.trim()) newErrors.kode_tingkat = 'Kode tingkat wajib diisi'
        if (!form.nama_tingkat.trim()) newErrors.nama_tingkat = 'Nama tingkat wajib diisi'
        const urutan = Number(form.urutan)
        if (!form.urutan || isNaN(urutan) || urutan < 1)
            newErrors.urutan = 'Urutan harus berupa angka lebih dari 0'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base = {
            kode_tingkat: form.kode_tingkat.trim().toUpperCase(),
            nama_tingkat: form.nama_tingkat.trim(),
            urutan: Number(form.urutan),
        }

        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateTingkatProgram)
        } else {
            onSubmit(base as ICreateTingkatProgram)
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={480}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Tingkat Program' : 'Tambah Tingkat Program Baru'}
            </h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Kode Tingkat"
                    asterisk
                    invalid={!!errors.kode_tingkat}
                    errorMessage={errors.kode_tingkat}
                    extra={
                        <span className="text-xs text-gray-400">
                            Akan diubah ke huruf kapital otomatis. Contoh: PEMULA, MAHIR
                        </span>
                    }
                >
                    <Input
                        placeholder="contoh: PEMULA"
                        value={form.kode_tingkat}
                        invalid={!!errors.kode_tingkat}
                        disabled={isEdit}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                kode_tingkat: e.target.value.toUpperCase(),
                            }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Tingkat"
                    asterisk
                    invalid={!!errors.nama_tingkat}
                    errorMessage={errors.nama_tingkat}
                >
                    <Input
                        placeholder="contoh: Pemula"
                        value={form.nama_tingkat}
                        invalid={!!errors.nama_tingkat}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama_tingkat: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Urutan Tampil"
                    asterisk
                    invalid={!!errors.urutan}
                    errorMessage={errors.urutan}
                    extra={
                        <span className="text-xs text-gray-400">
                            Digunakan untuk mengurutkan pilihan di dropdown
                        </span>
                    }
                >
                    <Input
                        type="number"
                        min={1}
                        placeholder="1"
                        value={form.urutan}
                        invalid={!!errors.urutan}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, urutan: e.target.value }))
                        }
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Tingkat">
                        <div className="flex items-center gap-3">
                            <Switcher
                                checked={form.aktif}
                                onChange={(val) =>
                                    setForm((p) => ({ ...p, aktif: val }))
                                }
                            />
                            <span className="text-sm text-gray-600">
                                {form.aktif
                                    ? 'Aktif — tersedia sebagai pilihan program'
                                    : 'Nonaktif — disembunyikan dari pilihan program'}
                            </span>
                        </div>
                    </FormItem>
                )}
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Tingkat'}
                </Button>
            </div>
        </Dialog>
    )
}

export default TingkatProgramForm
