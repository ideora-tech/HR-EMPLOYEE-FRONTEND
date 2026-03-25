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
    StatusPajak,
} from '@/@types/karyawan.types'
import type { IDepartemen, IJabatan, ILokasiKantor } from '@/@types/organisasi.types'

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

type SPOption = { value: '' | StatusPajak; label: string }
const SP_OPTIONS: SPOption[] = [
    { value: '', label: 'Pilih Status Pajak' },
    { value: 'TK/0', label: 'TK/0 — Tidak Kawin, 0 tanggungan' },
    { value: 'TK/1', label: 'TK/1 — Tidak Kawin, 1 tanggungan' },
    { value: 'TK/2', label: 'TK/2 — Tidak Kawin, 2 tanggungan' },
    { value: 'TK/3', label: 'TK/3 — Tidak Kawin, 3 tanggungan' },
    { value: 'K/0', label: 'K/0  — Kawin, 0 tanggungan' },
    { value: 'K/1', label: 'K/1  — Kawin, 1 tanggungan' },
    { value: 'K/2', label: 'K/2  — Kawin, 2 tanggungan' },
    { value: 'K/3', label: 'K/3  — Kawin, 3 tanggungan' },
    { value: 'K/I/0', label: 'K/I/0 — Kawin Istri Bekerja, 0 tanggungan' },
    { value: 'K/I/1', label: 'K/I/1 — Kawin Istri Bekerja, 1 tanggungan' },
    { value: 'K/I/2', label: 'K/I/2 — Kawin Istri Bekerja, 2 tanggungan' },
    { value: 'K/I/3', label: 'K/I/3 — Kawin Istri Bekerja, 3 tanggungan' },
]

type GenOption = { value: string; label: string }

const EMPTY_LOKASI_IDS: string[] = []

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
        reader.onload = (e) => {
            onChange(file, (e.target?.result as string) ?? '')
        }
        reader.readAsDataURL(file)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        // reset input so re-selecting same file still fires onChange
        e.target.value = ''
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    return (
        <div className="flex items-center gap-5">
            {/* Preview avatar */}
            <div
                className="relative w-20 h-20 rounded-full shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-primary transition-colors"
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                {value ? (
                    <img
                        src={value}
                        alt="Foto karyawan"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                        <HiOutlineCamera className="text-2xl" />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Foto Profil
                </p>
                <p className="text-xs text-gray-400">
                    JPG, PNG, atau WebP · Maks 2 MB
                </p>
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

const strToDate = (s: string | null): Date | null =>
    s ? new Date(s) : null

const normalizeFotoUrl = (url?: string | null): string => {
    if (!url) return ''
    if (url.startsWith('data:') || url.startsWith('blob:')) {
        return url
    }

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
    // Informasi Pekerjaan
    id_departemen: string
    id_jabatan: string
    tanggal_masuk: Date | null
    status_kepegawaian: '' | StatusKepegawaian
    tanggal_mulai_kontrak: Date | null
    tanggal_akhir_kontrak: Date | null
    gaji_pokok: string
    // Informasi Bank
    nama_bank: string
    no_rekening: string
    nama_pemilik_rekening: string
    // Pajak & BPJS
    npwp: string
    status_pajak: '' | StatusPajak
    no_bpjs_kesehatan: string
    no_bpjs_ketenagakerjaan: string
    // Alamat
    alamat: string
    // Edit only
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
    id_departemen: '',
    id_jabatan: '',
    tanggal_masuk: null,
    status_kepegawaian: '',
    tanggal_mulai_kontrak: null,
    tanggal_akhir_kontrak: null,
    gaji_pokok: '',
    nama_bank: '',
    no_rekening: '',
    nama_pemilik_rekening: '',
    npwp: '',
    status_pajak: '',
    no_bpjs_kesehatan: '',
    no_bpjs_ketenagakerjaan: '',
    alamat: '',
    foto_url: '',
    aktif: true,
}

interface KaryawanFormPageProps {
    editData?: IKaryawan | null
    submitting?: boolean
    departemenList?: IDepartemen[]
    jabatanList?: IJabatan[]
    lokasiList?: ILokasiKantor[]
    existingLokasiIds?: string[]
    onSubmit: (
        payload: ICreateKaryawan | IUpdateKaryawan,
        lokasiIds: string[],
        fotoFile?: File | null,
    ) => void
    onCancel: () => void
}

/* ─── component ───────────────────────────────────────────── */

const KaryawanFormPage = ({
    editData,
    submitting = false,
    departemenList = [],
    jabatanList = [],
    lokasiList = [],
    existingLokasiIds = EMPTY_LOKASI_IDS,
    onSubmit,
    onCancel,
}: KaryawanFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL)
    const [fotoFile, setFotoFile] = useState<File | null>(null)
    const [selectedLokasiIds, setSelectedLokasiIds] = useState<string[]>([])
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormState, string>>
    >({})

    const isEdit = !!editData

    // Dropdown options derived from props
    const departemenOptions: GenOption[] = [
        { value: '', label: 'Pilih Departemen' },
        ...departemenList.map((d) => ({ value: d.id_departemen, label: d.nama_departemen })),
    ]

    const filteredJabatan = form.id_departemen
        ? jabatanList.filter(
            (j) =>
                j.id_departemen === form.id_departemen ||
                j.id_departemen === null,
        )
        : jabatanList

    const jabatanOptions: GenOption[] = [
        { value: '', label: 'Pilih Jabatan' },
        ...filteredJabatan.map((j) => ({ value: j.id_jabatan, label: j.nama_jabatan })),
    ]

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
                id_departemen: editData.id_departemen ?? '',
                id_jabatan: editData.id_jabatan ?? '',
                tanggal_masuk: strToDate(editData.tanggal_masuk),
                status_kepegawaian: editData.status_kepegawaian ?? '',
                tanggal_mulai_kontrak: strToDate(
                    editData.tanggal_mulai_kontrak ?? null,
                ),
                tanggal_akhir_kontrak: strToDate(
                    editData.tanggal_akhir_kontrak ?? null,
                ),
                gaji_pokok:
                    editData.gaji_pokok != null
                        ? String(editData.gaji_pokok)
                        : '',
                nama_bank: editData.nama_bank ?? '',
                no_rekening: editData.no_rekening ?? '',
                nama_pemilik_rekening:
                    editData.nama_pemilik_rekening ?? '',
                npwp: editData.npwp ?? '',
                status_pajak: editData.status_pajak ?? '',
                no_bpjs_kesehatan: editData.no_bpjs_kesehatan ?? '',
                no_bpjs_ketenagakerjaan:
                    editData.no_bpjs_ketenagakerjaan ?? '',
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

    useEffect(() => {
        setSelectedLokasiIds(existingLokasiIds)
    }, [existingLokasiIds])

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama.trim()) e.nama = 'Nama karyawan wajib diisi'
        if (!form.tanggal_lahir) e.tanggal_lahir = 'Tanggal lahir wajib diisi'
        if (!form.id_departemen) e.id_departemen = 'Departemen wajib dipilih'
        if (!form.id_jabatan) e.id_jabatan = 'Jabatan wajib dipilih'
        if (!form.tanggal_masuk) e.tanggal_masuk = 'Tanggal bergabung wajib diisi'
        if (!form.status_kepegawaian)
            e.status_kepegawaian = 'Status kerja wajib dipilih'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base: ICreateKaryawan = {
            nik: form.nik.trim() || undefined,
            nama_karyawan: form.nama.trim(),
            jenis_kelamin: form.jenis_kelamin
                ? (Number(form.jenis_kelamin) as 1 | 2)
                : undefined,
            tanggal_lahir: form.tanggal_lahir
                ? dateToStr(form.tanggal_lahir)
                : undefined,
            email: form.email.trim() || undefined,
            telepon: form.telepon.trim() || undefined,
            id_departemen: form.id_departemen || null,
            id_jabatan: form.id_jabatan || null,
            tanggal_masuk: form.tanggal_masuk
                ? dateToStr(form.tanggal_masuk)
                : undefined,
            status_kepegawaian:
                (form.status_kepegawaian as StatusKepegawaian) || undefined,
            tanggal_mulai_kontrak: form.tanggal_mulai_kontrak
                ? dateToStr(form.tanggal_mulai_kontrak)
                : undefined,
            tanggal_akhir_kontrak: form.tanggal_akhir_kontrak
                ? dateToStr(form.tanggal_akhir_kontrak)
                : undefined,
            gaji_pokok: form.gaji_pokok ? Number(form.gaji_pokok) : undefined,
            nama_bank: form.nama_bank.trim() || undefined,
            no_rekening: form.no_rekening.trim() || undefined,
            nama_pemilik_rekening:
                form.nama_pemilik_rekening.trim() || undefined,
            npwp: form.npwp.trim() || undefined,
            status_pajak:
                (form.status_pajak as StatusPajak) || undefined,
            no_bpjs_kesehatan:
                form.no_bpjs_kesehatan.trim() || undefined,
            no_bpjs_ketenagakerjaan:
                form.no_bpjs_ketenagakerjaan.trim() || undefined,
            alamat: form.alamat.trim() || undefined,
        }

        if (isEdit) {
            onSubmit(
                {
                    ...base,
                    aktif: form.aktif ? 1 : 0,
                } as IUpdateKaryawan,
                selectedLokasiIds,
                fotoFile,
            )
        } else {
            onSubmit(base, selectedLokasiIds, fotoFile)
        }
    }

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((p) => ({ ...p, [k]: v }))

    const toggleLokasi = (id: string) =>
        setSelectedLokasiIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id],
        )

    const selectedJK =
        JK_OPTIONS.find((o) => o.value === form.jenis_kelamin) ?? JK_OPTIONS[0]
    const selectedSK =
        SK_OPTIONS.find((o) => o.value === form.status_kepegawaian) ??
        SK_OPTIONS[0]
    const selectedSP =
        SP_OPTIONS.find((o) => o.value === form.status_pajak) ?? SP_OPTIONS[0]
    const selectedDept =
        departemenOptions.find((o) => o.value === form.id_departemen) ??
        departemenOptions[0]
    const selectedJabatan =
        jabatanOptions.find((o) => o.value === form.id_jabatan) ??
        jabatanOptions[0]

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
                                        Nomor induk karyawan — unik per
                                        perusahaan
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

                            <FormItem
                                label="Tanggal Lahir"
                                asterisk
                                invalid={!!errors.tanggal_lahir}
                                errorMessage={errors.tanggal_lahir}
                            >
                                <DatePicker
                                    value={form.tanggal_lahir}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal lahir"
                                    clearable
                                    onChange={(d) =>
                                        set('tanggal_lahir', d)
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Foto Karyawan"
                                className="md:col-span-2"
                            >
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

                    {/* ── Informasi Pekerjaan ──────────────── */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">
                                Informasi Pekerjaan
                            </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem
                                label="Departemen"
                                asterisk
                                invalid={!!errors.id_departemen}
                                errorMessage={errors.id_departemen}
                            >
                                <Select<GenOption>
                                    options={departemenOptions}
                                    value={selectedDept}
                                    onChange={(opt) => {
                                        const val = (opt as GenOption).value
                                        set('id_departemen', val)
                                        // Reset jabatan if no longer valid
                                        const still = jabatanList.some(
                                            (j) =>
                                                j.id_jabatan ===
                                                form.id_jabatan &&
                                                (j.id_departemen === null ||
                                                    j.id_departemen === val),
                                        )
                                        if (!still) set('id_jabatan', '')
                                    }}
                                />
                            </FormItem>

                            <FormItem
                                label="Jabatan"
                                asterisk
                                invalid={!!errors.id_jabatan}
                                errorMessage={errors.id_jabatan}
                            >
                                <Select<GenOption>
                                    options={jabatanOptions}
                                    value={selectedJabatan}
                                    onChange={(opt) =>
                                        set(
                                            'id_jabatan',
                                            (opt as GenOption).value,
                                        )
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Tanggal Bergabung"
                                asterisk
                                invalid={!!errors.tanggal_masuk}
                                errorMessage={errors.tanggal_masuk}
                            >
                                <DatePicker
                                    value={form.tanggal_masuk}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal bergabung"
                                    clearable
                                    onChange={(d) =>
                                        set('tanggal_masuk', d)
                                    }
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
                                        set(
                                            'status_kepegawaian',
                                            (opt as SKOption).value,
                                        )
                                    }
                                />
                            </FormItem>

                            <FormItem label="Tanggal Mulai Kontrak">
                                <DatePicker
                                    value={form.tanggal_mulai_kontrak}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal mulai kontrak"
                                    clearable
                                    onChange={(d) =>
                                        set('tanggal_mulai_kontrak', d)
                                    }
                                />
                            </FormItem>

                            <FormItem label="Tanggal Akhir Kontrak">
                                <DatePicker
                                    value={form.tanggal_akhir_kontrak}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal akhir kontrak"
                                    clearable
                                    onChange={(d) =>
                                        set('tanggal_akhir_kontrak', d)
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
                                        value={
                                            form.gaji_pokok
                                                ? formatNum(form.gaji_pokok)
                                                : ''
                                        }
                                        onChange={(e) =>
                                            set(
                                                'gaji_pokok',
                                                e.target.value.replace(/\D/g, ''),
                                            )
                                        }
                                    />
                                </div>
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* ── Informasi Bank ───────────────────── */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">
                                Informasi Bank
                            </h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Nama Bank">
                                <Input
                                    placeholder="contoh: BCA, Mandiri, BNI"
                                    value={form.nama_bank}
                                    onChange={(e) =>
                                        set('nama_bank', e.target.value)
                                    }
                                />
                            </FormItem>

                            <FormItem label="No. Rekening">
                                <Input
                                    placeholder="contoh: 1234567890"
                                    value={form.no_rekening}
                                    onChange={(e) =>
                                        set('no_rekening', e.target.value)
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Nama Pemilik Rekening"
                                className="md:col-span-2"
                            >
                                <Input
                                    placeholder="Nama sesuai buku tabungan"
                                    value={form.nama_pemilik_rekening}
                                    onChange={(e) =>
                                        set(
                                            'nama_pemilik_rekening',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* ── Pajak & BPJS ─────────────────────── */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Pajak & BPJS</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="NPWP">
                                <Input
                                    placeholder="contoh: 12.345.678.9-012.000"
                                    value={form.npwp}
                                    onChange={(e) =>
                                        set('npwp', e.target.value)
                                    }
                                />
                            </FormItem>

                            <FormItem label="Status Pajak (PTKP)">
                                <Select<SPOption>
                                    options={SP_OPTIONS}
                                    value={selectedSP}
                                    onChange={(opt) =>
                                        set(
                                            'status_pajak',
                                            (opt as SPOption).value,
                                        )
                                    }
                                />
                            </FormItem>

                            <FormItem label="No. BPJS Kesehatan">
                                <Input
                                    placeholder="contoh: 0001234567890"
                                    value={form.no_bpjs_kesehatan}
                                    onChange={(e) =>
                                        set(
                                            'no_bpjs_kesehatan',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormItem>

                            <FormItem label="No. BPJS Ketenagakerjaan">
                                <Input
                                    placeholder="contoh: 12345678901"
                                    value={form.no_bpjs_ketenagakerjaan}
                                    onChange={(e) =>
                                        set(
                                            'no_bpjs_ketenagakerjaan',
                                            e.target.value,
                                        )
                                    }
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

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* ── Lokasi Kantor ───────────────────── */}
                    <div>
                        <div className="mb-1">
                            <h5 className="font-semibold">Lokasi Kantor</h5>
                            <p className="text-gray-500 text-sm mt-1">
                                Pilih lokasi kantor yang di-assign ke karyawan
                                ini. Karyawan hanya dapat melakukan absensi di
                                lokasi yang dipilih.
                            </p>
                        </div>

                        {lokasiList.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4">
                                Belum ada lokasi kantor yang terdaftar.
                            </p>
                        ) : (
                            <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mt-3">
                                {lokasiList.map((lokasi) => {
                                    const checked =
                                        selectedLokasiIds.includes(
                                            lokasi.id_lokasi,
                                        )
                                    return (
                                        <label
                                            key={lokasi.id_lokasi}
                                            className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    toggleLokasi(
                                                        lokasi.id_lokasi,
                                                    )
                                                }
                                                className="mt-1 shrink-0 w-4 h-4 rounded cursor-pointer accent-blue-600"
                                            />
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                                                        {lokasi.nama_lokasi}
                                                    </span>
                                                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                                        {lokasi.kode_lokasi}
                                                    </span>
                                                </div>
                                                {lokasi.alamat && (
                                                    <span className="text-xs text-blue-500 truncate">
                                                        {lokasi.alamat}
                                                    </span>
                                                )}
                                                {lokasi.radius != null && (
                                                    <span className="text-xs text-gray-400">
                                                        Radius:{' '}
                                                        {lokasi.radius}m
                                                    </span>
                                                )}
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        )}
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
