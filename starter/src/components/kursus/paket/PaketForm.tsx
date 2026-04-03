'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Switcher } from '@/components/ui'
import type { IPaket, ICreatePaket, IUpdatePaket } from '@/@types/kursus.types'

interface PaketFormProps {
    open: boolean
    editData?: IPaket | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreatePaket | IUpdatePaket) => void
}

interface FormState {
    nama_paket: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    nama_paket: '',
    deskripsi: '',
    aktif: true,
}

const PaketForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: PaketFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nama_paket: editData.nama_paket,
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama_paket.trim()) e.nama_paket = 'Nama paket wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const base: ICreatePaket = {
            nama_paket: form.nama_paket.trim(),
            deskripsi: form.deskripsi.trim() || undefined,
        }
        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdatePaket)
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
            <h5 className="mb-6">{isEdit ? 'Edit Paket' : 'Tambah Paket Baru'}</h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Nama Paket"
                    asterisk
                    invalid={!!errors.nama_paket}
                    errorMessage={errors.nama_paket}
                >
                    <Input
                        placeholder="contoh: Paket 3 Bulan, Paket Reguler"
                        value={form.nama_paket}
                        invalid={!!errors.nama_paket}
                        onChange={(e) => setForm((p) => ({ ...p, nama_paket: e.target.value }))}
                    />
                </FormItem>

                <FormItem label="Deskripsi">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Keterangan tambahan (opsional)"
                        value={form.deskripsi}
                        onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Paket">
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
                <Button variant="default" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Paket'}
                </Button>
            </div>
        </Dialog>
    )
}

export default PaketForm
