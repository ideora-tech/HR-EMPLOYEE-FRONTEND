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
import type { IPengguna, IPenggunaCreate, IPenggunaUpdate } from '@/@types/pengguna.types'

type PeranOption = { value: string; label: string }

const PERAN_OPTIONS: PeranOption[] = [
    { value: 'OWNER', label: 'Owner' },
    { value: 'HR_ADMIN', label: 'HR Admin' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'EMPLOYEE', label: 'Employee' },
]

interface PenggunaFormProps {
    open: boolean
    editData?: IPengguna | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: IPenggunaCreate | IPenggunaUpdate) => void
}

interface FormState {
    nama: string
    email: string
    kata_sandi: string
    peran: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    nama: '',
    email: '',
    kata_sandi: '',
    peran: 'EMPLOYEE',
    aktif: true,
}

const PenggunaForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: PenggunaFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nama: editData.nama,
                email: editData.email,
                kata_sandi: '',
                peran: editData.peran,
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi'
        if (!form.email.trim()) newErrors.email = 'Email wajib diisi'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = 'Format email tidak valid'
        if (!isEdit && !form.kata_sandi.trim())
            newErrors.kata_sandi = 'Kata sandi wajib diisi'
        else if (form.kata_sandi && form.kata_sandi.length < 6)
            newErrors.kata_sandi = 'Kata sandi minimal 6 karakter'
        if (!form.peran) newErrors.peran = 'Peran wajib dipilih'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const payload: IPenggunaUpdate = {
                nama: form.nama.trim(),
                email: form.email.trim(),
                peran: form.peran,
                aktif: form.aktif ? 1 : 0,
            }
            if (form.kata_sandi.trim()) {
                payload.kata_sandi = form.kata_sandi.trim()
            }
            onSubmit(payload)
        } else {
            const payload: IPenggunaCreate = {
                nama: form.nama.trim(),
                email: form.email.trim(),
                kata_sandi: form.kata_sandi.trim(),
                peran: form.peran,
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(payload)
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            width={480}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Nama"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="Nama lengkap pengguna"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Email"
                    asterisk
                    invalid={!!errors.email}
                    errorMessage={errors.email}
                >
                    <Input
                        type="email"
                        placeholder="email@perusahaan.com"
                        value={form.email}
                        invalid={!!errors.email}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, email: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label={isEdit ? 'Kata Sandi Baru' : 'Kata Sandi'}
                    asterisk={!isEdit}
                    invalid={!!errors.kata_sandi}
                    errorMessage={errors.kata_sandi}
                    extra={
                        isEdit ? (
                            <span className="text-xs text-gray-400">
                                Kosongkan jika tidak ingin mengganti
                            </span>
                        ) : undefined
                    }
                >
                    <Input
                        type="password"
                        placeholder={isEdit ? 'Isi untuk mengganti kata sandi' : 'Minimal 6 karakter'}
                        value={form.kata_sandi}
                        invalid={!!errors.kata_sandi}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, kata_sandi: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Peran"
                    asterisk
                    invalid={!!errors.peran}
                    errorMessage={errors.peran}
                >
                    <Select<PeranOption>
                        options={PERAN_OPTIONS}
                        value={
                            PERAN_OPTIONS.find((o) => o.value === form.peran) ??
                            PERAN_OPTIONS[3]
                        }
                        onChange={(opt) =>
                            setForm((p) => ({
                                ...p,
                                peran: (opt as PeranOption).value,
                            }))
                        }
                    />
                </FormItem>

                <FormItem label="Status Pengguna">
                    <div className="flex items-center gap-3">
                        <Switcher
                            checked={form.aktif}
                            onChange={(val) =>
                                setForm((p) => ({ ...p, aktif: val }))
                            }
                        />
                        <span className="text-sm text-gray-600">
                            {form.aktif
                                ? 'Aktif — dapat login'
                                : 'Nonaktif — tidak dapat login'}
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </Button>
            </div>
        </Dialog>
    )
}

export default PenggunaForm
