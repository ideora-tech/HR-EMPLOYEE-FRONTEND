'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Card,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import { HiArrowLeft } from 'react-icons/hi'
import TingkatProgramService from '@/services/kursus/tingkat-program.service'
import type {
    IProgramPengajaran,
    ICreateProgramPengajaran,
    IUpdateProgramPengajaran,
} from '@/@types/kursus.types'

type TingkatOption = { value: string; label: string }

const TINGKAT_NONE: TingkatOption = { value: '', label: '— Tidak diisi —' }

interface ProgramPengajaranFormPageProps {
    editData?: IProgramPengajaran | null
    submitting?: boolean
    onSubmit: (payload: ICreateProgramPengajaran | IUpdateProgramPengajaran) => void
    onCancel: () => void
}

interface FormState {
    kode_program: string
    nama: string
    deskripsi: string
    tingkat: string
    durasi_menit: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode_program: '',
    nama: '',
    deskripsi: '',
    tingkat: '',
    durasi_menit: '60',
    aktif: true,
}

const ProgramPengajaranFormPage = ({
    editData,
    submitting = false,
    onSubmit,
    onCancel,
}: ProgramPengajaranFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [tingkatOptions, setTingkatOptions] = useState<TingkatOption[]>([TINGKAT_NONE])

    const isEdit = !!editData

    useEffect(() => {
        TingkatProgramService.getAll({ aktif: 1, limit: 100 })
            .then((res) => {
                if (res.success) {
                    const opts: TingkatOption[] = [
                        TINGKAT_NONE,
                        ...res.data
                            .sort((a, b) => a.urutan - b.urutan)
                            .map((t) => ({ value: t.kode, label: t.nama })),
                    ]
                    setTingkatOptions(opts)
                }
            })
            .catch(() => {/* tampilkan saja opsi kosong */})
    }, [])

    useEffect(() => {
        if (editData) {
            setForm({
                kode_program: editData.kode_program,
                nama: editData.nama,
                deskripsi: editData.deskripsi ?? '',
                tingkat: editData.tingkat ?? '',
                durasi_menit: String(editData.durasi_menit ?? 60),
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.kode_program.trim()) newErrors.kode_program = 'Kode program wajib diisi'
        if (!form.nama.trim()) newErrors.nama = 'Nama program wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base = {
            kode_program: form.kode_program.trim().toUpperCase(),
            nama: form.nama.trim(),
            deskripsi: form.deskripsi.trim() || undefined,
            tingkat: form.tingkat || undefined,
            durasi_menit: form.durasi_menit ? Number(form.durasi_menit) : undefined,
        }

        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateProgramPengajaran)
        } else {
            onSubmit(base as ICreateProgramPengajaran)
        }
    }

    const selectedTingkat =
        tingkatOptions.find((o) => o.value === form.tingkat) ?? TINGKAT_NONE

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
                        {isEdit ? 'Edit Program Pengajaran' : 'Tambah Program Pengajaran'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {isEdit
                            ? 'Ubah informasi program pengajaran kursus'
                            : 'Daftarkan program pengajaran baru ke sistem kursus'}
                    </p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col gap-1">
                    {/* Section: Informasi Program */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Informasi Program</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem
                                label="Kode Program"
                                asterisk
                                invalid={!!errors.kode_program}
                                errorMessage={errors.kode_program}
                                extra={
                                    <span className="text-xs text-gray-400">
                                        Huruf kapital, angka, dan underscore. Contoh: TARI_BALI_01
                                    </span>
                                }
                            >
                                <Input
                                    placeholder="contoh: TARI_BALI_01"
                                    value={form.kode_program}
                                    invalid={!!errors.kode_program}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            kode_program: e.target.value.toUpperCase(),
                                        }))
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Nama Program"
                                asterisk
                                invalid={!!errors.nama}
                                errorMessage={errors.nama}
                            >
                                <Input
                                    placeholder="contoh: Tari Bali Tingkat Dasar"
                                    value={form.nama}
                                    invalid={!!errors.nama}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, nama: e.target.value }))
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* Section: Detail Program */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Detail Program</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Tingkat">
                                <Select<TingkatOption>
                                    options={tingkatOptions}
                                    value={selectedTingkat}
                                    onChange={(opt) =>
                                        setForm((p) => ({
                                            ...p,
                                            tingkat: (opt as TingkatOption).value,
                                        }))
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Durasi (menit)"
                                invalid={!!errors.durasi_menit}
                                errorMessage={errors.durasi_menit}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="60"
                                    value={form.durasi_menit}
                                    invalid={!!errors.durasi_menit}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            durasi_menit: e.target.value,
                                        }))
                                    }
                                />
                            </FormItem>

                            <FormItem label="Deskripsi" className="md:col-span-2">
                                <Input
                                    textArea
                                    rows={3}
                                    placeholder="Deskripsi singkat program pengajaran ini..."
                                    value={form.deskripsi}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, deskripsi: e.target.value }))
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    {isEdit && (
                        <>
                            <div className="border-t mt-0 mb-0 border-gray-100 dark:border-gray-700" />

                            {/* Section: Status */}
                            <div>
                                <div className="mb-3">
                                    <h5 className="font-semibold">Status</h5>
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        Aktifkan atau nonaktifkan program pengajaran ini
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
                                                ? 'Program dapat digunakan untuk kelas'
                                                : 'Program tidak aktif di sistem'}
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
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Program'}
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    )
}

export default ProgramPengajaranFormPage
