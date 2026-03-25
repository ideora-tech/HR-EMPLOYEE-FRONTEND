'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Select, Switcher } from '@/components/ui'
import type { IDepartemen, ICreateDepartemen, IUpdateDepartemen } from '@/@types/organisasi.types'

type SelectOption = { value: string; label: string }

interface DepartemenFormProps {
    open: boolean
    editData?: IDepartemen | null
    submitting?: boolean
    departemenList: IDepartemen[]
    onClose: () => void
    onSubmit: (payload: ICreateDepartemen | IUpdateDepartemen) => void
}

interface FormState {
    kode: string
    nama: string
    deskripsi: string
    id_departemen_induk: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode: '',
    nama: '',
    deskripsi: '',
    id_departemen_induk: '',
    aktif: true,
}

const DepartemenForm = ({
    open,
    editData,
    submitting = false,
    departemenList,
    onClose,
    onSubmit,
}: DepartemenFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    // Exclude self from parent options to prevent circular reference
    const indukOptions: SelectOption[] = [
        { value: '', label: 'Tidak ada (departemen utama)' },
        ...departemenList
            .filter((d) => d.id_departemen !== editData?.id_departemen)
            .map((d) => ({ value: d.id_departemen, label: `${d.kode} — ${d.nama}` })),
    ]

    useEffect(() => {
        if (editData) {
            setForm({
                kode: editData.kode,
                nama: editData.nama,
                deskripsi: editData.deskripsi ?? '',
                id_departemen_induk: editData.id_departemen_induk ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.kode.trim()) newErrors.kode = 'Kode departemen wajib diisi'
        if (!form.nama.trim()) newErrors.nama = 'Nama departemen wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base: ICreateDepartemen = {
            kode: form.kode.trim().toUpperCase(),
            nama: form.nama.trim(),
            deskripsi: form.deskripsi.trim() || undefined,
            id_departemen_induk: form.id_departemen_induk || undefined,
        }

        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateDepartemen)
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
            <h5 className="mb-6">
                {isEdit ? 'Edit Departemen' : 'Tambah Departemen Baru'}
            </h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Kode Departemen"
                    asterisk
                    invalid={!!errors.kode}
                    errorMessage={errors.kode}
                    extra={
                        <span className="text-xs text-gray-400">
                            Akan diubah ke huruf kapital otomatis. Contoh: IT, HRD, FIN
                        </span>
                    }
                >
                    <Input
                        placeholder="contoh: HRD"
                        value={form.kode}
                        invalid={!!errors.kode}
                        disabled={isEdit}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, kode: e.target.value.toUpperCase() }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Departemen"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: Human Resources Development"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                    />
                </FormItem>

                <FormItem label="Departemen Induk">
                    <Select<SelectOption>
                        options={indukOptions}
                        value={
                            indukOptions.find(
                                (o) => o.value === form.id_departemen_induk,
                            ) ?? indukOptions[0]
                        }
                        onChange={(opt) =>
                            setForm((p) => ({
                                ...p,
                                id_departemen_induk: (opt as SelectOption).value,
                            }))
                        }
                    />
                </FormItem>

                <FormItem label="Deskripsi">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Deskripsi singkat tentang departemen ini (opsional)"
                        value={form.deskripsi}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, deskripsi: e.target.value }))
                        }
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Departemen">
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
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Departemen'}
                </Button>
            </div>
        </Dialog>
    )
}

export default DepartemenForm
