'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Switcher } from '@/components/ui'
import type { IKelas, ICreateKelas, IUpdateKelas } from '@/@types/kursus.types'

interface KelasFormProps {
    open: boolean
    editData?: IKelas | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateKelas | IUpdateKelas) => void
}

interface FormState {
    nama_kelas: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    nama_kelas: '',
    deskripsi: '',
    aktif: true,
}

const KelasForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: KelasFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    useEffect(() => {
        if (!open) return
        if (editData) {
            setForm({
                nama_kelas: editData.nama_kelas,
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [open, editData])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama_kelas.trim()) newErrors.nama_kelas = 'Nama kelas wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const base: ICreateKelas = {
            nama_kelas: form.nama_kelas.trim(),
            deskripsi: form.deskripsi.trim() || undefined,
        }
        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateKelas)
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
            <h5 className="mb-6">{isEdit ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Nama Kelas"
                    asterisk
                    invalid={!!errors.nama_kelas}
                    errorMessage={errors.nama_kelas}
                >
                    <Input
                        placeholder="contoh: Kelas A, Kelas Utama Lantai 1"
                        value={form.nama_kelas}
                        invalid={!!errors.nama_kelas}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama_kelas: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem label="Deskripsi">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Keterangan tambahan tentang kelas ini (opsional)"
                        value={form.deskripsi}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, deskripsi: e.target.value }))
                        }
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Kelas">
                        <div className="flex items-center gap-3">
                            <Switcher
                                checked={form.aktif}
                                onChange={(val) => setForm((p) => ({ ...p, aktif: val }))}
                            />
                            <span className="text-sm text-gray-600">
                                {form.aktif ? 'Aktif - kelas tersedia untuk digunakan' : 'Nonaktif'}
                            </span>
                        </div>
                    </FormItem>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="default" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </Button>
            </div>
        </Dialog>
    )
}

export default KelasForm
