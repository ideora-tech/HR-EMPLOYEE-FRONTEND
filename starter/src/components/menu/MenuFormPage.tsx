'use client'

import { useState, useEffect } from 'react'
import { Button, Card, FormItem, Input, Select, Switcher } from '@/components/ui'
import { HiArrowLeft } from 'react-icons/hi'
import type { IMenu, IMenuCreate, IMenuUpdate } from '@/@types/menu.types'

type ParentOption = { value: string; label: string }

interface MenuFormPageProps {
    editData?: IMenu | null
    menuList?: IMenu[]
    submitting?: boolean
    onSubmit: (payload: IMenuCreate | IMenuUpdate) => void
    onCancel: () => void
}

interface FormState {
    nama: string
    path: string
    icon: string
    parent_id: string
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

const MenuFormPage = ({
    editData,
    menuList = [],
    submitting = false,
    onSubmit,
    onCancel,
}: MenuFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    const parentOptions: ParentOption[] = [
        ROOT_OPTION,
        ...menuList
            .filter((m) => m.id_menu !== editData?.id_menu)
            .map((m) => ({
                value: m.id_menu,
                label: m.parent_id ? `    ↳ ${m.nama_menu}` : m.nama_menu,
            })),
    ]

    useEffect(() => {
        if (editData) {
            setForm({
                nama: editData.nama_menu,
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
    }, [editData])

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
            onSubmit({
                nama_menu: form.nama.trim(),
                path: form.path.trim() || null,
                icon: form.icon.trim() || null,
                parent_id: parentId,
                urutan: Number(form.urutan),
                aktif: form.aktif ? 1 : 0,
            } as IMenuUpdate)
        } else {
            onSubmit({
                nama_menu: form.nama.trim(),
                path: form.path.trim() || undefined,
                icon: form.icon.trim() || undefined,
                parent_id: parentId,
                urutan: Number(form.urutan),
            } as IMenuCreate)
        }
    }

    const selectedParent =
        parentOptions.find((o) => o.value === form.parent_id) ?? ROOT_OPTION

    return (
        <form
            className="flex flex-col gap-6"
            onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
        >
            {/* Page header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <HiArrowLeft className="text-xl" />
                    </button>
                    <div>
                        <h3 className="font-bold">
                            {isEdit ? 'Edit Menu' : 'Tambah Menu Baru'}
                        </h3>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {isEdit
                                ? 'Ubah informasi dan konfigurasi menu navigasi'
                                : 'Tambahkan menu baru ke struktur navigasi aplikasi'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <Card>
                <div className="flex flex-col gap-8">
                    {/* Section: Informasi Menu */}
                    <div>
                        <div className="mb-2">
                            <h5 className="font-semibold">Informasi Menu</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
                        </div>
                    </div>

                    <div className="border-t border-gray-100 mb-0 mt-0 dark:border-gray-700" />

                    {/* Section: Konfigurasi Navigasi */}
                    <div>
                        <div>
                            <h5 className="font-semibold">Konfigurasi Navigasi</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem
                                label="Path"
                                extra={
                                    <span className="text-xs text-gray-400">
                                        URL path, contoh: /dashboard
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
                                        Nama icon, contoh: dashboard, users
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
                                        Urutan tampil di navigasi
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
                        </div>
                    </div>

                    {isEdit && (
                        <>
                            <div className="border-t border-gray-100 dark:border-gray-700" />

                            {/* Section: Status */}
                            <div>
                                <div className="mb-5">
                                    <h5 className="font-semibold">Status</h5>
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        Aktifkan atau nonaktifkan menu ini di navigasi
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <Switcher
                                        checked={form.aktif}
                                        onChange={(val) =>
                                            setForm((p) => ({ ...p, aktif: val }))
                                        }
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {form.aktif ? 'Aktif' : 'Nonaktif'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {form.aktif
                                                ? 'Menu ditampilkan ke pengguna di sidebar'
                                                : 'Menu disembunyikan dari semua pengguna'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="plain"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={submitting}
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Menu'}
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    )
}

export default MenuFormPage
