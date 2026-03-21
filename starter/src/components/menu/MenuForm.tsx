'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Switcher,
} from '@/components/ui'
import type { IMenu, IMenuCreate, IMenuUpdate } from '@/@types/menu.types'

interface MenuFormProps {
    open: boolean
    editData?: IMenu | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: IMenuCreate | IMenuUpdate) => void
}

interface FormState {
    nama: string
    path: string
    icon: string
    kode_modul: string
    urutan: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    nama: '',
    path: '',
    icon: '',
    kode_modul: '',
    urutan: '1',
    aktif: true,
}

const MenuForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: MenuFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormState, string>>
    >({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nama: editData.nama,
                path: editData.path ?? '',
                icon: editData.icon ?? '',
                kode_modul: editData.kode_modul ?? '',
                urutan: String(editData.urutan),
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama.trim()) newErrors.nama = 'Nama menu wajib diisi'
        if (!form.urutan || Number(form.urutan) < 0)
            newErrors.urutan = 'No. urut wajib diisi (min. 0)'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const payload: IMenuUpdate = {
                nama: form.nama.trim(),
                path: form.path.trim() || null,
                icon: form.icon.trim() || null,
                kode_modul: form.kode_modul.trim().toUpperCase() || null,
                urutan: Number(form.urutan),
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(payload)
        } else {
            const payload: IMenuCreate = {
                nama: form.nama.trim(),
                path: form.path.trim() || undefined,
                icon: form.icon.trim() || undefined,
                kode_modul: form.kode_modul.trim().toUpperCase() || undefined,
                urutan: Number(form.urutan),
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
                {isEdit ? 'Edit Menu' : 'Tambah Menu Baru'}
            </h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Nama Menu"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: Dashboard, Manajemen Karyawan"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Path"
                    extra={
                        <span className="text-xs text-gray-400">
                            URL path, contoh: /dashboard, /karyawan
                        </span>
                    }
                >
                    <Input
                        placeholder="/dashboard"
                        value={form.path}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, path: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Icon"
                    extra={
                        <span className="text-xs text-gray-400">
                            Nama icon, contoh: dashboard, users, wallet
                        </span>
                    }
                >
                    <Input
                        placeholder="dashboard"
                        value={form.icon}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, icon: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Kode Modul"
                    extra={
                        <span className="text-xs text-gray-400">
                            Kosongkan = menu selalu tampil (tidak tergantung modul)
                        </span>
                    }
                >
                    <Input
                        placeholder="contoh: PAYROLL, ATTENDANCE"
                        value={form.kode_modul}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                kode_modul: e.target.value.toUpperCase(),
                            }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="No. Urut"
                    asterisk
                    invalid={!!errors.urutan}
                    errorMessage={errors.urutan}
                    extra={
                        <span className="text-xs text-gray-400">
                            Urutan tampil menu di navigasi
                        </span>
                    }
                >
                    <Input
                        type="number"
                        min={0}
                        placeholder="1"
                        value={form.urutan}
                        invalid={!!errors.urutan}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, urutan: e.target.value }))
                        }
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Menu">
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Menu'}
                </Button>
            </div>
        </Dialog>
    )
}

export default MenuForm
