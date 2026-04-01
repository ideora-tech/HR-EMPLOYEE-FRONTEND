'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import KelasService from '@/services/kursus/kelas.service'
import type { IPaket, ICreatePaket, IUpdatePaket } from '@/@types/kursus.types'

type KelasOption = { value: string; label: string }

interface PaketFormProps {
    open: boolean
    editData?: IPaket | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreatePaket | IUpdatePaket) => void
}

interface FormState {
    id_kelas: string
    nama_paket: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_kelas: '',
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
    const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([])
    const [loadingKelas, setLoadingKelas] = useState(false)

    const isEdit = !!editData

    const loadKelas = useCallback(async () => {
        setLoadingKelas(true)
        try {
            const res = await KelasService.getAll({ aktif: 1, limit: 200 })
            if (res.success)
                setKelasOptions(res.data.map((k) => ({ value: k.id_kelas, label: k.nama_kelas })))
        } catch {
            // silently ignore
        } finally {
            setLoadingKelas(false)
        }
    }, [])

    useEffect(() => {
        if (open) loadKelas()
    }, [open, loadKelas])

    useEffect(() => {
        if (editData) {
            setForm({
                id_kelas: editData.id_kelas,
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
        if (!form.id_kelas) e.id_kelas = 'Kelas wajib dipilih'
        if (!form.nama_paket.trim()) e.nama_paket = 'Nama paket wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const base: ICreatePaket = {
            id_kelas: form.id_kelas,
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
                    label="Kelas"
                    asterisk
                    invalid={!!errors.id_kelas}
                    errorMessage={errors.id_kelas}
                >
                    <Select<KelasOption>
                        placeholder="— Pilih Kelas —"
                        options={kelasOptions}
                        isLoading={loadingKelas}
                        value={kelasOptions.find((o) => o.value === form.id_kelas) ?? null}
                        onChange={(opt) =>
                            setForm((p) => ({ ...p, id_kelas: (opt as KelasOption).value }))
                        }
                    />
                </FormItem>

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
                <Button variant="plain" onClick={onClose} disabled={submitting}>
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
