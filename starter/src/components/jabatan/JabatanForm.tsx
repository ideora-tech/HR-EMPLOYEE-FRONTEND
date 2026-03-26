'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Select, Switcher } from '@/components/ui'
import type { IDepartemen, IJabatan, ICreateJabatan, IUpdateJabatan } from '@/@types/organisasi.types'

interface JabatanFormProps {
    open: boolean
    editData?: IJabatan | null
    submitting?: boolean
    departemenList: IDepartemen[]
    onClose: () => void
    onSubmit: (payload: ICreateJabatan | IUpdateJabatan) => void
}

interface FormState {
    kode: string
    nama: string
    id_departemen: string
    level: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode: '',
    nama: '',
    id_departemen: '',
    level: '',
    deskripsi: '',
    aktif: true,
}

const LEVEL_OPTIONS = [
    { value: '', label: 'Pilih Level (opsional)' },
    { value: '1', label: '1 — Top Management' },
    { value: '2', label: '2 — Middle Management' },
    { value: '3', label: '3 — Supervisor' },
    { value: '4', label: '4 — Staff' },
]

type SelectOption = { value: string; label: string }

const JabatanForm = ({
    open,
    editData,
    submitting = false,
    departemenList,
    onClose,
    onSubmit,
}: JabatanFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    const departemenOptions: SelectOption[] = [
        { value: '', label: 'Tanpa Departemen' },
        ...departemenList.map((d) => ({ value: d.id_departemen, label: d.nama_departemen })),
    ]

    useEffect(() => {
        if (editData) {
            setForm({
                kode: editData.kode_jabatan,
                nama: editData.nama_jabatan,
                id_departemen: editData.id_departemen ?? '',
                level: editData.level != null ? String(editData.level) : '',
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.kode.trim()) newErrors.kode = 'Kode jabatan wajib diisi'
        if (!form.nama.trim()) newErrors.nama = 'Nama jabatan wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base: ICreateJabatan = {
            kode_jabatan: form.kode.trim().toUpperCase(),
            nama_jabatan: form.nama.trim(),
            id_departemen: form.id_departemen || undefined,
            level: form.level ? Number(form.level) : undefined,
            deskripsi: form.deskripsi.trim() || undefined,
        }

        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateJabatan)
        } else {
            onSubmit(base)
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={500}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}</h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Kode Jabatan"
                    asterisk
                    invalid={!!errors.kode}
                    errorMessage={errors.kode}
                    extra={
                        <span className="text-xs text-gray-400">
                            Akan diubah ke huruf kapital otomatis. Contoh: MGR-HRD, SPV-IT
                        </span>
                    }
                >
                    <Input
                        placeholder="contoh: MGR-HRD"
                        value={form.kode}
                        invalid={!!errors.kode}
                        disabled={isEdit}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, kode: e.target.value.toUpperCase() }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Jabatan"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: Manager HRD"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                    />
                </FormItem>

                <FormItem label="Departemen">
                    <Select<SelectOption>
                        options={departemenOptions}
                        value={
                            departemenOptions.find((o) => o.value === form.id_departemen) ??
                            departemenOptions[0]
                        }
                        onChange={(opt) =>
                            setForm((p) => ({
                                ...p,
                                id_departemen: (opt as SelectOption).value,
                            }))
                        }
                    />
                </FormItem>

                <FormItem label="Level Jabatan">
                    <Select<SelectOption>
                        options={LEVEL_OPTIONS}
                        value={
                            LEVEL_OPTIONS.find((o) => o.value === form.level) ??
                            LEVEL_OPTIONS[0]
                        }
                        onChange={(opt) =>
                            setForm((p) => ({ ...p, level: (opt as SelectOption).value }))
                        }
                    />
                </FormItem>

                <FormItem label="Deskripsi">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Deskripsi singkat tentang jabatan ini (opsional)"
                        value={form.deskripsi}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, deskripsi: e.target.value }))
                        }
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Jabatan">
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Jabatan'}
                </Button>
            </div>
        </Dialog>
    )
}

export default JabatanForm
