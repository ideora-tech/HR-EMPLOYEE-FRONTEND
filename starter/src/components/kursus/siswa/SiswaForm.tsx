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
import type { ISiswa, ICreateSiswa, IUpdateSiswa } from '@/@types/kursus.types'

type JKOption = { value: '' | '1' | '2'; label: string }

const JK_OPTIONS: JKOption[] = [
    { value: '', label: '— Tidak diisi —' },
    { value: '1', label: 'Laki-laki' },
    { value: '2', label: 'Perempuan' },
]

interface SiswaFormProps {
    open: boolean
    editData?: ISiswa | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateSiswa | IUpdateSiswa) => void
}

interface FormState {
    nama: string
    email: string
    telepon: string
    tanggal_lahir: string
    alamat: string
    jenis_kelamin: '' | '1' | '2'
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    nama: '',
    email: '',
    telepon: '',
    tanggal_lahir: '',
    alamat: '',
    jenis_kelamin: '',
    aktif: true,
}

const SiswaForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: SiswaFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nama: editData.nama,
                email: editData.email ?? '',
                telepon: editData.telepon ?? '',
                tanggal_lahir: editData.tanggal_lahir ?? '',
                alamat: editData.alamat ?? '',
                jenis_kelamin: editData.jenis_kelamin
                    ? (String(editData.jenis_kelamin) as '1' | '2')
                    : '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama.trim()) newErrors.nama = 'Nama siswa wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const payload: IUpdateSiswa = {
                nama: form.nama.trim(),
                email: form.email.trim() || undefined,
                telepon: form.telepon.trim() || undefined,
                tanggal_lahir: form.tanggal_lahir || undefined,
                alamat: form.alamat.trim() || undefined,
                jenis_kelamin: form.jenis_kelamin ? (Number(form.jenis_kelamin) as 1 | 2) : undefined,
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(payload)
        } else {
            const payload: ICreateSiswa = {
                nama: form.nama.trim(),
                email: form.email.trim() || undefined,
                telepon: form.telepon.trim() || undefined,
                tanggal_lahir: form.tanggal_lahir || undefined,
                alamat: form.alamat.trim() || undefined,
                jenis_kelamin: form.jenis_kelamin ? (Number(form.jenis_kelamin) as 1 | 2) : undefined,
            }
            onSubmit(payload)
        }
    }

    const selectedJK = JK_OPTIONS.find((o) => o.value === form.jenis_kelamin) ?? JK_OPTIONS[0]

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={520}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Siswa' : 'Tambah Siswa Baru'}</h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Nama Lengkap"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: Budi Santoso"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Email">
                        <Input
                            type="email"
                            placeholder="budi@email.com"
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        />
                    </FormItem>
                    <FormItem label="Telepon">
                        <Input
                            placeholder="08xx-xxxx-xxxx"
                            value={form.telepon}
                            onChange={(e) => setForm((p) => ({ ...p, telepon: e.target.value }))}
                        />
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Tanggal Lahir">
                        <Input
                            type="date"
                            value={form.tanggal_lahir}
                            onChange={(e) => setForm((p) => ({ ...p, tanggal_lahir: e.target.value }))}
                        />
                    </FormItem>
                    <FormItem label="Jenis Kelamin">
                        <Select<JKOption>
                            options={JK_OPTIONS}
                            value={selectedJK}
                            onChange={(opt) =>
                                setForm((p) => ({ ...p, jenis_kelamin: (opt as JKOption).value }))
                            }
                        />
                    </FormItem>
                </div>

                <FormItem label="Alamat">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Alamat lengkap siswa (opsional)"
                        value={form.alamat}
                        onChange={(e) => setForm((p) => ({ ...p, alamat: e.target.value }))}
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status">
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </Button>
            </div>
        </Dialog>
    )
}

export default SiswaForm
