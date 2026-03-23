'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Card,
    DatePicker,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import { HiArrowLeft } from 'react-icons/hi'
import type { ISiswa, ICreateSiswa, IUpdateSiswa } from '@/@types/kursus.types'

type JKOption = { value: '' | '1' | '2'; label: string }

const JK_OPTIONS: JKOption[] = [
    { value: '', label: '— Tidak diisi —' },
    { value: '1', label: 'Laki-laki' },
    { value: '2', label: 'Perempuan' },
]

interface SiswaFormPageProps {
    editData?: ISiswa | null
    submitting?: boolean
    onSubmit: (payload: ICreateSiswa | IUpdateSiswa) => void
    onCancel: () => void
}

interface FormState {
    nama: string
    email: string
    telepon: string
    tanggal_lahir: Date | null
    alamat: string
    jenis_kelamin: '' | '1' | '2'
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    nama: '',
    email: '',
    telepon: '',
    tanggal_lahir: null,
    alamat: '',
    jenis_kelamin: '',
    aktif: true,
}

/** Konversi Date ke string "YYYY-MM-DD" */
const dateToString = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const SiswaFormPage = ({
    editData,
    submitting = false,
    onSubmit,
    onCancel,
}: SiswaFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nama: editData.nama,
                email: editData.email ?? '',
                telepon: editData.telepon ?? '',
                tanggal_lahir: editData.tanggal_lahir
                    ? new Date(editData.tanggal_lahir)
                    : null,
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
    }, [editData])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama.trim()) newErrors.nama = 'Nama siswa wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const tglLahir = form.tanggal_lahir
            ? dateToString(form.tanggal_lahir)
            : undefined

        if (isEdit) {
            onSubmit({
                nama: form.nama.trim(),
                email: form.email.trim() || undefined,
                telepon: form.telepon.trim() || undefined,
                tanggal_lahir: tglLahir,
                alamat: form.alamat.trim() || undefined,
                jenis_kelamin: form.jenis_kelamin
                    ? (Number(form.jenis_kelamin) as 1 | 2)
                    : undefined,
                aktif: form.aktif ? 1 : 0,
            } as IUpdateSiswa)
        } else {
            onSubmit({
                nama: form.nama.trim(),
                email: form.email.trim() || undefined,
                telepon: form.telepon.trim() || undefined,
                tanggal_lahir: tglLahir,
                alamat: form.alamat.trim() || undefined,
                jenis_kelamin: form.jenis_kelamin
                    ? (Number(form.jenis_kelamin) as 1 | 2)
                    : undefined,
            } as ICreateSiswa)
        }
    }

    const selectedJK =
        JK_OPTIONS.find((o) => o.value === form.jenis_kelamin) ?? JK_OPTIONS[0]

    return (
        <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
            }}
        >
            {/* Page header */}
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
                        {isEdit ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {isEdit
                            ? 'Ubah informasi data siswa kursus'
                            : 'Daftarkan siswa baru ke sistem kursus'}
                    </p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col gap-1">
                    {/* Section: Identitas */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Identitas Siswa</h5>

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, nama: e.target.value }))
                                    }
                                />
                            </FormItem>

                            <FormItem label="Jenis Kelamin">
                                <Select<JKOption>
                                    options={JK_OPTIONS}
                                    value={selectedJK}
                                    onChange={(opt) =>
                                        setForm((p) => ({
                                            ...p,
                                            jenis_kelamin: (opt as JKOption).value,
                                        }))
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* Section: Kontak & Data Pribadi */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Kontak & Data Pribadi</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Email">
                                <Input
                                    type="email"
                                    placeholder="budi@email.com"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, email: e.target.value }))
                                    }
                                />
                            </FormItem>

                            <FormItem label="Telepon">
                                <Input
                                    placeholder="08xx-xxxx-xxxx"
                                    value={form.telepon}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, telepon: e.target.value }))
                                    }
                                />
                            </FormItem>

                            <FormItem label="Tanggal Lahir">
                                <DatePicker
                                    value={form.tanggal_lahir}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal lahir"
                                    clearable
                                    onChange={(date) =>
                                        setForm((p) => ({ ...p, tanggal_lahir: date }))
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t mt-0 mb-0 border-gray-100 dark:border-gray-700" />

                    {/* Section: Alamat */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Alamat</h5>
                        </div>
                        <FormItem label="Alamat Lengkap">
                            <Input
                                textArea
                                rows={3}
                                placeholder="Jl. Contoh No. 1, Kota, Provinsi"
                                value={form.alamat}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, alamat: e.target.value }))
                                }
                            />
                        </FormItem>
                    </div>

                    {isEdit && (
                        <>
                            <div className="border-t mt-0 mb-0 border-gray-100 dark:border-gray-700" />

                            {/* Section: Status */}
                            <div>
                                <div className="mb-3">
                                    <h5 className="font-semibold">Status</h5>
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        Aktifkan atau nonaktifkan data siswa ini
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
                                                ? 'Siswa dapat didaftarkan ke kelas'
                                                : 'Siswa tidak aktif di sistem'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}


                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 mt-6">
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
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Siswa'}
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    )
}

export default SiswaFormPage
