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
import type { IMenu, IMenuCreate, IMenuUpdate } from '@/@types/menu.types'

type ParentOption = { value: string; label: string }

interface MenuFormProps {
    open: boolean
    editData?: IMenu | null
    menuList?: IMenu[]
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: IMenuCreate | IMenuUpdate) => void
}

interface FormState {
    nama: string
    path: string
    icon: string
    parent_id: string   // '' = root (null)
    urutan: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    nama: '',
    path: '',
    icon: '',
    parent_id: '',
    urutan: '1',
    aktif: true,
}

const ROOT_OPTION: ParentOption = { value: '', label: '— Tidak ada (root menu) —' }

const MenuForm = ({
    open,
    editData,
    menuList = [],
    submitting = false,
    onClose,
    onSubmit,
}: MenuFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    // Opsi parent: semua menu kecuali dirinya sendiri
    const parentOptions: ParentOption[] = [
        ROOT_OPTION,
        ...menuList
            .filter((m) => m.id_menu !== editData?.id_menu)
            .map((m) => ({
                value: m.id_menu,
                label: m.parent_id
                    ? `    ↳ ${m.nama}`   // indent jika sudah punya parent
                    : m.nama,
            })),
    ]

    useEffect(() => {
        if (editData) {
            setForm({
                nama: editData.nama,
                path: editData.path ?? '',
                icon: editData.icon ?? '',
                parent_id: editData.parent_id ?? '',
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

        const parentId = form.parent_id.trim() || null

        if (isEdit) {
            const payload: IMenuUpdate = {
                nama: form.nama.trim(),
                path: form.path.trim() || null,
                icon: form.icon.trim() || null,
                parent_id: parentId,
                urutan: Number(form.urutan),
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(payload)
        } else {
            const payload: IMenuCreate = {
                nama: form.nama.trim(),
                path: form.path.trim() || undefined,
                icon: form.icon.trim() || undefined,
                parent_id: parentId,
                urutan: Number(form.urutan),
            }
            onSubmit(payload)
        }
    }

    const selectedParent =
        parentOptions.find((o) => o.value === form.parent_id) ?? ROOT_OPTION

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
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
                    label="Menu Parent"
                    extra={
                        <span className="text-xs text-gray-400">
                            Kosongkan jika ini adalah menu utama (root)
                        </span>
                    }
                >
                    <Select<ParentOption>
                        options={parentOptions}
                        value={selectedParent}
                        onChange={(opt) =>
                            setForm((p) => ({
                                ...p,
                                parent_id: (opt as ParentOption).value,
                            }))
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
