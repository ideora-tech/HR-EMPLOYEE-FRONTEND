'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Switcher,
} from '@/components/ui'
import type { IPerusahaan, IPerusahaanCreate, IPerusahaanUpdate } from '@/@types/perusahaan.types'

interface PerusahaanFormProps {
    open: boolean
    editData?: IPerusahaan | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: IPerusahaanCreate | IPerusahaanUpdate) => void
}

interface FormState {
    nama: string
    email: string
    telepon: string
    alamat: string
    url_logo: string
    aktif: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_STATE: FormState = {
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
    url_logo: '',
    aktif: true,
}

const PerusahaanForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: PerusahaanFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<FormErrors>({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nama: editData.nama,
                email: editData.email ?? '',
                telepon: editData.telepon ?? '',
                alamat: editData.alamat ?? '',
                url_logo: editData.url_logo ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: FormErrors = {}
        if (!form.nama.trim()) newErrors.nama = 'Nama perusahaan wajib diisi'
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = 'Format email tidak valid'
        if (form.url_logo && !/^https?:\/\/.+/.test(form.url_logo))
            newErrors.url_logo = 'URL logo harus diawali https://'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const payload: IPerusahaanCreate | IPerusahaanUpdate = {
            nama: form.nama.trim(),
            ...(form.email.trim() && { email: form.email.trim() }),
            ...(form.telepon.trim() && { telepon: form.telepon.trim() }),
            ...(form.alamat.trim() && { alamat: form.alamat.trim() }),
            ...(form.url_logo.trim() && { url_logo: form.url_logo.trim() }),
            ...(isEdit && { aktif: form.aktif ? 1 : 0 }),
        }
        onSubmit(payload)
    }

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={520}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Perusahaan' : 'Tambah Perusahaan Baru'}
            </h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Nama Perusahaan"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: PT Maju Bersama"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Email"
                    invalid={!!errors.email}
                    errorMessage={errors.email}
                >
                    <Input
                        type="email"
                        placeholder="info@perusahaan.com"
                        value={form.email}
                        invalid={!!errors.email}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, email: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem label="Nomor Telepon">
                    <Input
                        placeholder="021-12345678"
                        value={form.telepon}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, telepon: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem label="Alamat">
                    <textarea
                        rows={3}
                        placeholder="Jl. Sudirman No. 1, Jakarta"
                        value={form.alamat}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        onChange={(e) =>
                            setForm((p) => ({ ...p, alamat: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="URL Logo"
                    invalid={!!errors.url_logo}
                    errorMessage={errors.url_logo}
                    extra={
                        <span className="text-xs text-gray-400">
                            Link gambar logo (https://...)
                        </span>
                    }
                >
                    <Input
                        placeholder="https://cdn.example.com/logo.png"
                        value={form.url_logo}
                        invalid={!!errors.url_logo}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, url_logo: e.target.value }))
                        }
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Perusahaan">
                        <div className="flex items-center gap-3">
                            <Switcher
                                checked={form.aktif}
                                onChange={(val) =>
                                    setForm((p) => ({ ...p, aktif: val }))
                                }
                            />
                            <span className="text-sm text-gray-600">
                                {form.aktif ? 'Aktif' : 'Nonaktif'}
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Perusahaan'}
                </Button>
            </div>
        </Dialog>
    )
}

export default PerusahaanForm
