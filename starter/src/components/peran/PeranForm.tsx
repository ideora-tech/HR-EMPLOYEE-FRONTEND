'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Switcher,
} from '@/components/ui'
import type { IPeran, IPeranCreate, IPeranUpdate } from '@/@types/peran.types'

interface PeranFormProps {
    open: boolean
    editData?: IPeran | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: IPeranCreate | IPeranUpdate) => void
}

interface FormState {
    kode_peran: string
    nama: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode_peran: '',
    nama: '',
    aktif: true,
}

const PeranForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: PeranFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormState, string>>
    >({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                kode_peran: editData.kode_peran,
                nama: editData.nama,
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.kode_peran.trim())
            newErrors.kode_peran = 'Kode peran wajib diisi'
        if (!form.nama.trim()) newErrors.nama = 'Nama peran wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const payload: IPeranCreate = {
            kode_peran: form.kode_peran.trim().toUpperCase(),
            nama: form.nama.trim(),
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
                {isEdit ? 'Edit Peran' : 'Tambah Peran Baru'}
            </h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Kode Peran"
                    asterisk
                    invalid={!!errors.kode_peran}
                    errorMessage={errors.kode_peran}
                    extra={
                        <span className="text-xs text-gray-400">
                            Akan diubah ke huruf kapital otomatis
                        </span>
                    }
                >
                    <Input
                        placeholder="contoh: HR_ADMIN, FINANCE, MANAGER"
                        value={form.kode_peran}
                        invalid={!!errors.kode_peran}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                kode_peran: e.target.value.toUpperCase(),
                            }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Peran"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: HR Manager / Admin"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem label="Status Peran">
                    <div className="flex items-center gap-3">
                        <Switcher
                            checked={form.aktif}
                            onChange={(val) =>
                                setForm((p) => ({ ...p, aktif: val }))
                            }
                        />
                        <span className="text-sm text-gray-600">
                            {form.aktif
                                ? 'Aktif — dapat digunakan'
                                : 'Nonaktif — tidak dapat digunakan'}
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Peran'}
                </Button>
            </div>
        </Dialog>
    )
}

export default PeranForm
