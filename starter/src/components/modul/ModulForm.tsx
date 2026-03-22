'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Switcher,
} from '@/components/ui'
import type { IModul, IModulCreate, IModulUpdate } from '@/@types/modul.types'

interface ModulFormProps {
    open: boolean
    editData?: IModul | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: IModulCreate | IModulUpdate) => void
}

interface FormState {
    kode_modul: string
    nama: string
    deskripsi: string
    urutan: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode_modul: '',
    nama: '',
    deskripsi: '',
    urutan: '1',
    aktif: true,
}

const ModulForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: ModulFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormState, string>>
    >({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                kode_modul: editData.kode_modul,
                nama: editData.nama,
                deskripsi: editData.deskripsi ?? '',
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
        if (!form.kode_modul.trim())
            newErrors.kode_modul = 'Kode modul wajib diisi'
        if (!form.nama.trim()) newErrors.nama = 'Nama modul wajib diisi'
        if (!form.urutan || Number(form.urutan) < 1)
            newErrors.urutan = 'No. urut wajib diisi (min. 1)'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const payload: IModulCreate = {
            kode_modul: form.kode_modul.trim().toUpperCase(),
            nama: form.nama.trim(),
            deskripsi: form.deskripsi.trim() || null,
            urutan: Number(form.urutan),
            aktif: form.aktif ? 1 : 0,
        }
        onSubmit(payload)
    }

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={480}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Modul' : 'Tambah Modul Baru'}
            </h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Kode Modul"
                    asterisk
                    invalid={!!errors.kode_modul}
                    errorMessage={errors.kode_modul}
                    extra={
                        <span className="text-xs text-gray-400">
                            Akan diubah ke huruf kapital otomatis
                        </span>
                    }
                >
                    <Input
                        placeholder="contoh: ATTENDANCE, PAYROLL, LEAVE"
                        value={form.kode_modul}
                        invalid={!!errors.kode_modul}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                kode_modul: e.target.value.toUpperCase(),
                            }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Modul"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: Absensi Karyawan"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem label="Deskripsi">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Deskripsi singkat tentang modul ini (opsional)"
                        value={form.deskripsi}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                deskripsi: e.target.value,
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
                            Urutan tampil modul di aplikasi
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

                <FormItem label="Status Modul">
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Modul'}
                </Button>
            </div>
        </Dialog>
    )
}

export default ModulForm
