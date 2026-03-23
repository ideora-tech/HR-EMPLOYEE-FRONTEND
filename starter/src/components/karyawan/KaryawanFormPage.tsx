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
import type {
    IKaryawan,
    ICreateKaryawan,
    IUpdateKaryawan,
    StatusKepegawaian,
} from '@/@types/karyawan.types'

/* ─── options ─────────────────────────────────────────────── */

type JKOption = { value: '' | '1' | '2'; label: string }
const JK_OPTIONS: JKOption[] = [
    { value: '', label: '— Tidak diisi —' },
    { value: '1', label: 'Laki-laki' },
    { value: '2', label: 'Perempuan' },
]

type SKOption = { value: '' | StatusKepegawaian; label: string }
const SK_OPTIONS: SKOption[] = [
    { value: '', label: '— Tidak diisi —' },
    { value: 'TETAP', label: 'Tetap' },
    { value: 'KONTRAK', label: 'Kontrak' },
    { value: 'PROBASI', label: 'Probasi' },
    { value: 'MAGANG', label: 'Magang' },
]

/* ─── helpers ─────────────────────────────────────────────── */

const dateToStr = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
}

const strToDate = (s: string | null): Date | null =>
    s ? new Date(s) : null

/* ─── types ───────────────────────────────────────────────── */

interface FormState {
    nik: string
    nama: string
    jenis_kelamin: '' | '1' | '2'
    status_kepegawaian: '' | StatusKepegawaian
    email: string
    telepon: string
    tanggal_lahir: Date | null
    tanggal_masuk: Date | null
    tanggal_keluar: Date | null
    alamat: string
    aktif: boolean
}

const INITIAL: FormState = {
    nik: '',
    nama: '',
    jenis_kelamin: '',
    status_kepegawaian: '',
    email: '',
    telepon: '',
    tanggal_lahir: null,
    tanggal_masuk: null,
    tanggal_keluar: null,
    alamat: '',
    aktif: true,
}

interface KaryawanFormPageProps {
    editData?: IKaryawan | null
    submitting?: boolean
    onSubmit: (payload: ICreateKaryawan | IUpdateKaryawan) => void
    onCancel: () => void
}

/* ─── component ───────────────────────────────────────────── */

const KaryawanFormPage = ({
    editData,
    submitting = false,
    onSubmit,
    onCancel,
}: KaryawanFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL)
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormState, string>>
    >({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nik: editData.nik ?? '',
                nama: editData.nama,
                jenis_kelamin: editData.jenis_kelamin
                    ? (String(editData.jenis_kelamin) as '1' | '2')
                    : '',
                status_kepegawaian: editData.status_kepegawaian ?? '',
                email: editData.email ?? '',
                telepon: editData.telepon ?? '',
                tanggal_lahir: strToDate(editData.tanggal_lahir),
                tanggal_masuk: strToDate(editData.tanggal_masuk),
                tanggal_keluar: strToDate(editData.tanggal_keluar),
                alamat: editData.alamat ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL)
        }
        setErrors({})
    }, [editData])

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama.trim()) e.nama = 'Nama karyawan wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base: ICreateKaryawan = {
            nik: form.nik.trim() || undefined,
            nama: form.nama.trim(),
            jenis_kelamin: form.jenis_kelamin
                ? (Number(form.jenis_kelamin) as 1 | 2)
                : undefined,
            status_kepegawaian:
                (form.status_kepegawaian as StatusKepegawaian) || undefined,
            email: form.email.trim() || undefined,
            telepon: form.telepon.trim() || undefined,
            tanggal_lahir: form.tanggal_lahir
                ? dateToStr(form.tanggal_lahir)
                : undefined,
            tanggal_masuk: form.tanggal_masuk
                ? dateToStr(form.tanggal_masuk)
                : undefined,
            tanggal_keluar: form.tanggal_keluar
                ? dateToStr(form.tanggal_keluar)
                : undefined,
            alamat: form.alamat.trim() || undefined,
        }

        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateKaryawan)
        } else {
            onSubmit(base)
        }
    }

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((p) => ({ ...p, [k]: v }))

    const selectedJK =
        JK_OPTIONS.find((o) => o.value === form.jenis_kelamin) ?? JK_OPTIONS[0]
    const selectedSK =
        SK_OPTIONS.find((o) => o.value === form.status_kepegawaian) ??
        SK_OPTIONS[0]

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
                        {isEdit ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {isEdit
                            ? 'Ubah informasi data karyawan'
                            : 'Daftarkan karyawan baru ke sistem'}
                    </p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col gap-1">
                    {/* ── Identitas ───────────────────────── */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Identitas Karyawan</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem
                                label="NIK"
                                extra={
                                    <span className="text-xs text-gray-400">
                                        Nomor induk karyawan — unik per perusahaan
                                    </span>
                                }
                            >
                                <Input
                                    placeholder="contoh: EMP-001"
                                    value={form.nik}
                                    onChange={(e) =>
                                        set('nik', e.target.value)
                                    }
                                />
                            </FormItem>

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
                                        set('nama', e.target.value)
                                    }
                                />
                            </FormItem>

                            <FormItem label="Jenis Kelamin">
                                <Select<JKOption>
                                    options={JK_OPTIONS}
                                    value={selectedJK}
                                    onChange={(opt) =>
                                        set(
                                            'jenis_kelamin',
                                            (opt as JKOption).value,
                                        )
                                    }
                                />
                            </FormItem>

                            <FormItem label="Status Kepegawaian">
                                <Select<SKOption>
                                    options={SK_OPTIONS}
                                    value={selectedSK}
                                    onChange={(opt) =>
                                        set(
                                            'status_kepegawaian',
                                            (opt as SKOption).value,
                                        )
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* ── Kontak ──────────────────────────── */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Kontak</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Email">
                                <Input
                                    type="email"
                                    placeholder="budi@perusahaan.com"
                                    value={form.email}
                                    onChange={(e) =>
                                        set('email', e.target.value)
                                    }
                                />
                            </FormItem>

                            <FormItem label="Telepon">
                                <Input
                                    placeholder="08xx-xxxx-xxxx"
                                    value={form.telepon}
                                    onChange={(e) =>
                                        set('telepon', e.target.value)
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* ── Data Kepegawaian ─────────────────── */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Data Kepegawaian</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Tanggal Lahir">
                                <DatePicker
                                    value={form.tanggal_lahir}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal lahir"
                                    clearable
                                    onChange={(d) => set('tanggal_lahir', d)}
                                />
                            </FormItem>

                            <FormItem label="Tanggal Masuk">
                                <DatePicker
                                    value={form.tanggal_masuk}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal masuk"
                                    clearable
                                    onChange={(d) => set('tanggal_masuk', d)}
                                />
                            </FormItem>

                            <FormItem label="Tanggal Keluar">
                                <DatePicker
                                    value={form.tanggal_keluar}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Kosongkan jika masih aktif"
                                    clearable
                                    onChange={(d) => set('tanggal_keluar', d)}
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* ── Alamat ──────────────────────────── */}
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
                                    set('alamat', e.target.value)
                                }
                            />
                        </FormItem>
                    </div>

                    {/* ── Status (edit only) ───────────────── */}
                    {isEdit && (
                        <>
                            <div className="border-t border-gray-100 dark:border-gray-700" />
                            <div>
                                <div className="mb-3">
                                    <h5 className="font-semibold">Status</h5>
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        Aktifkan atau nonaktifkan karyawan ini
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <Switcher
                                        checked={form.aktif}
                                        onChange={(v) => set('aktif', v)}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {form.aktif ? 'Aktif' : 'Nonaktif'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {form.aktif
                                                ? 'Karyawan aktif di perusahaan'
                                                : 'Karyawan tidak aktif / sudah keluar'}
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
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    )
}

export default KaryawanFormPage
