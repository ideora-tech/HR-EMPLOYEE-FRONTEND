'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Button,
    Card,
    DatePicker,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import { HiArrowLeft, HiOutlineCamera, HiOutlineTrash } from 'react-icons/hi'
import appConfig from '@/configs/app.config'
import { formatNum } from '@/utils/formatNumber'
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
    { value: '', label: 'Pilih Status' },
    { value: 'TETAP', label: 'Tetap' },
    { value: 'KONTRAK', label: 'Kontrak' },
    { value: 'PROBASI', label: 'Probasi' },
    { value: 'MAGANG', label: 'Magang' },
]

type PeranOption = { value: string; label: string }
const PERAN_OPTIONS: PeranOption[] = [
    { value: 'EMPLOYEE', label: 'Karyawan (default)' },
    { value: 'COACH', label: 'Coach' },
    { value: 'HR_ADMIN', label: 'Admin / HR' },
]

/* ─── FotoUploader ────────────────────────────────────────── */

interface FotoUploaderProps {
    value: string
    onChange: (file: File | null, previewUrl?: string) => void
}

const FotoUploader = ({ value, onChange }: FotoUploaderProps) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) return
        const reader = new FileReader()
        reader.onload = (e) => onChange(file, (e.target?.result as string) ?? '')
        reader.readAsDataURL(file)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        e.target.value = ''
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    return (
        <div className="flex items-center gap-5">
            <div
                className="relative w-20 h-20 rounded-full shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-primary transition-colors"
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                {value ? (
                    <img src={value} alt="Foto karyawan" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                        <HiOutlineCamera className="text-2xl" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Foto Profil</p>
                <p className="text-xs text-gray-400">JPG, PNG, atau WebP · Maks 2 MB</p>
                <div className="flex items-center gap-2 mt-1">
                    <Button
                        type="button"
                        size="xs"
                        icon={<HiOutlineCamera />}
                        onClick={() => inputRef.current?.click()}
                    >
                        Pilih Foto
                    </Button>
                    {value && (
                        <Button
                            type="button"
                            size="xs"
                            variant="plain"
                            icon={<HiOutlineTrash />}
                            customColorClass={() =>
                                'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                            }
                            onClick={() => onChange(null, '')}
                        >
                            Hapus
                        </Button>
                    )}
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
        </div>
    )
}

/* ─── helpers ─────────────────────────────────────────────── */

const dateToStr = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
}

const strToDate = (s: string | null): Date | null => (s ? new Date(s) : null)

const normalizeFotoUrl = (url?: string | null): string => {
    if (!url) return ''
    if (url.startsWith('data:') || url.startsWith('blob:')) return url
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const parsed = new URL(url)
            if (parsed.pathname.startsWith('/uploads/')) {
                return `${appConfig.apiPrefix}/proxy${parsed.pathname}${parsed.search}`
            }
        } catch {
            return url
        }
        return url
    }
    const path = url.startsWith('/') ? url : `/${url}`
    return `${appConfig.apiPrefix}/proxy${path}`
}

/* ─── types ───────────────────────────────────────────────── */

interface FormState {
    nik: string
    nama: string
    jenis_kelamin: '' | '1' | '2'
    tanggal_lahir: Date | null
    email: string
    telepon: string
    tanggal_masuk: Date | null
    status_kepegawaian: '' | StatusKepegawaian
    peran: string
    gaji_pokok: string
    alamat: string
    foto_url: string
    aktif: boolean
}

const INITIAL: FormState = {
    nik: '',
    nama: '',
    jenis_kelamin: '',
    tanggal_lahir: null,
    email: '',
    telepon: '',
    tanggal_masuk: null,
    status_kepegawaian: '',
    peran: 'EMPLOYEE',
    gaji_pokok: '',
    alamat: '',
    foto_url: '',
    aktif: true,
}

interface KaryawanFormPageProps {
    editData?: IKaryawan | null
    submitting?: boolean
    onSubmit: (payload: ICreateKaryawan | IUpdateKaryawan, fotoFile?: File | null) => void
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
    const [fotoFile, setFotoFile] = useState<File | null>(null)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nik: editData.nik ?? '',
                nama: editData.nama_karyawan ?? '',
                jenis_kelamin: editData.jenis_kelamin
                    ? (String(editData.jenis_kelamin) as '1' | '2')
                    : '',
                tanggal_lahir: strToDate(editData.tanggal_lahir),
                email: editData.email ?? '',
                telepon: editData.telepon ?? '',
                tanggal_masuk: strToDate(editData.tanggal_masuk),
                status_kepegawaian: editData.status_kepegawaian ?? '',
                peran: editData.peran_akun ?? 'EMPLOYEE',
                gaji_pokok: editData.gaji_pokok != null ? String(editData.gaji_pokok) : '',
                alamat: editData.alamat ?? '',
                foto_url: normalizeFotoUrl(editData.foto_url),
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL)
        }
        setFotoFile(null)
        setErrors({})
    }, [editData])

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama.trim()) e.nama = 'Nama karyawan wajib diisi'
        if (!form.status_kepegawaian) e.status_kepegawaian = 'Status kerja wajib dipilih'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base = {
            nik: form.nik.trim() || undefined,
            nama_karyawan: form.nama.trim(),
            jenis_kelamin: form.jenis_kelamin ? (Number(form.jenis_kelamin) as 1 | 2) : undefined,
            tanggal_lahir: form.tanggal_lahir ? dateToStr(form.tanggal_lahir) : undefined,
            email: form.email.trim() || undefined,
            telepon: form.telepon.trim() || undefined,
            tanggal_masuk: form.tanggal_masuk ? dateToStr(form.tanggal_masuk) : undefined,
            status_kepegawaian: (form.status_kepegawaian as StatusKepegawaian) || undefined,
            gaji_pokok: form.gaji_pokok ? Number(form.gaji_pokok) : undefined,
            alamat: form.alamat.trim() || undefined,
        }

        if (isEdit) {
            onSubmit(
                { ...base, peran: form.peran, aktif: form.aktif ? 1 : 0 } as IUpdateKaryawan,
                fotoFile,
            )
        } else {
            onSubmit({ ...base, peran: form.peran } as ICreateKaryawan, fotoFile)
        }
    }

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((p) => ({ ...p, [k]: v }))

    const selectedJK = JK_OPTIONS.find((o) => o.value === form.jenis_kelamin) ?? JK_OPTIONS[0]
    const selectedSK =
        SK_OPTIONS.find((o) => o.value === form.status_kepegawaian) ?? SK_OPTIONS[0]
    const selectedPeran = PERAN_OPTIONS.find((o) => o.value === form.peran) ?? PERAN_OPTIONS[0]

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
                <div className="flex flex-col gap-6">
                    {/* ── Identitas ───────────────────────── */}
                    <div>
                        <h5 className="font-semibold mb-4">Identitas Karyawan</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Nama Lengkap" asterisk invalid={!!errors.nama} errorMessage={errors.nama}>
                                <Input
                                    placeholder="contoh: Budi Santoso"
                                    value={form.nama}
                                    invalid={!!errors.nama}
                                    onChange={(e) => set('nama', e.target.value)}
                                />
                            </FormItem>

                            <FormItem
                                label="NIK"
                                extra={<span className="text-xs text-gray-400">Unik per perusahaan</span>}
                            >
                                <Input
                                    placeholder="contoh: EMP-001"
                                    value={form.nik}
                                    onChange={(e) => set('nik', e.target.value)}
                                />
                            </FormItem>

                            <FormItem label="Jenis Kelamin">
                                <Select<JKOption>
                                    options={JK_OPTIONS}
                                    value={selectedJK}
                                    onChange={(opt) => set('jenis_kelamin', (opt as JKOption).value)}
                                />
                            </FormItem>

                            <FormItem label="Tanggal Lahir">
                                <DatePicker
                                    value={form.tanggal_lahir}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal lahir"
                                    clearable
                                    onChange={(d) => set('tanggal_lahir', d)}
                                />
                            </FormItem>

                            <FormItem label="Foto Profil" className="md:col-span-2">
                                <FotoUploader
                                    value={form.foto_url}
                                    onChange={(file, previewUrl = '') => {
                                        setFotoFile(file)
                                        set('foto_url', previewUrl)
                                    }}
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* ── Kontak ──────────────────────────── */}
                    <div>
                        <h5 className="font-semibold mb-4">Kontak</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Email">
                                <Input
                                    type="email"
                                    placeholder="budi@perusahaan.com"
                                    value={form.email}
                                    onChange={(e) => set('email', e.target.value)}
                                />
                            </FormItem>

                            <FormItem label="Telepon">
                                <Input
                                    placeholder="08xx-xxxx-xxxx"
                                    value={form.telepon}
                                    onChange={(e) => set('telepon', e.target.value)}
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* ── Pekerjaan ───────────────────────── */}
                    <div>
                        <h5 className="font-semibold mb-4">Informasi Pekerjaan</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Tanggal Bergabung">
                                <DatePicker
                                    value={form.tanggal_masuk}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal bergabung"
                                    clearable
                                    onChange={(d) => set('tanggal_masuk', d)}
                                />
                            </FormItem>

                            <FormItem
                                label="Status Kerja"
                                asterisk
                                invalid={!!errors.status_kepegawaian}
                                errorMessage={errors.status_kepegawaian}
                            >
                                <Select<SKOption>
                                    options={SK_OPTIONS}
                                    value={selectedSK}
                                    onChange={(opt) =>
                                        set('status_kepegawaian', (opt as SKOption).value)
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Role / Akses"
                                extra={<span className="text-xs text-gray-400">Menentukan hak akses akun login karyawan</span>}
                            >
                                <Select<PeranOption>
                                    options={PERAN_OPTIONS}
                                    value={selectedPeran}
                                    onChange={(opt) =>
                                        set('peran', (opt as PeranOption).value)
                                    }
                                />
                            </FormItem>

                            <FormItem label="Gaji Pokok">
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 text-sm border border-r-0 rounded-tl-lg rounded-bl-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 shrink-0">
                                        Rp
                                    </span>
                                    <Input
                                        className="rounded-tl-none rounded-bl-none"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={form.gaji_pokok ? formatNum(form.gaji_pokok) : ''}
                                        onChange={(e) =>
                                            set('gaji_pokok', e.target.value.replace(/\D/g, ''))
                                        }
                                    />
                                </div>
                            </FormItem>

                            <FormItem label="Alamat">
                                <Input
                                    textArea
                                    rows={3}
                                    placeholder="Jl. Contoh No. 1, Kota, Provinsi"
                                    value={form.alamat}
                                    onChange={(e) => set('alamat', e.target.value)}
                                />
                            </FormItem>
                        </div>
                    </div>

                    {/* ── Status (edit only) ───────────────── */}
                    {isEdit && (
                        <>
                            <div className="border-t border-gray-100 dark:border-gray-700" />
                            <div>
                                <h5 className="font-semibold mb-3">Status</h5>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <Switcher checked={form.aktif} onChange={(v) => set('aktif', v)} />
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
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="plain" onClick={onCancel} disabled={submitting}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            customColorClass={() =>
                                'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'
                            }
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
