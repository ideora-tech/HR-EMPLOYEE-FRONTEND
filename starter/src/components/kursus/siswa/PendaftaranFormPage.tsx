'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Button,
    Card,
    DatePicker,
    FormItem,
    Input,
    Notification,
    Select,
    toast,
} from '@/components/ui'
import { HiArrowLeft, HiOutlinePlus, HiOutlineTrash, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineCollection } from 'react-icons/hi'
import BiayaService from '@/services/kursus/biaya.service'
import DiskonService from '@/services/kursus/diskon.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import { formatRupiah } from '@/utils/formatNumber'
import type { IBiaya, IDiskon, IJadwalKelas, IDaftarSiswa, IDaftarSiswaItem } from '@/@types/kursus.types'

type SelectOption = { value: string; label: string }
type JKOption = { value: '' | '1' | '2'; label: string }

const JK_OPTIONS: JKOption[] = [
    { value: '', label: '- Tidak diisi -' },
    { value: '1', label: 'Laki-laki' },
    { value: '2', label: 'Perempuan' },
]

interface TagihanItem {
    _key: string
    id_biaya: string
    id_jadwal_kelas: string
    periodeDate: Date | null
    periode: string
}

interface FormState {
    nama_siswa: string
    email: string
    telepon: string
    tanggal_lahir: Date | null
    alamat: string
    jenis_kelamin: '' | '1' | '2'
}

interface PendaftaranFormPageProps {
    submitting?: boolean
    onSubmit: (payload: IDaftarSiswa) => void
    onCancel: () => void
}

const INITIAL_FORM: FormState = {
    nama_siswa: '',
    email: '',
    telepon: '',
    tanggal_lahir: null,
    alamat: '',
    jenis_kelamin: '',
}

const newTagihanItem = (): TagihanItem => ({
    _key: crypto.randomUUID(),
    id_biaya: '',
    id_jadwal_kelas: '',
    periodeDate: null,
    periode: '',
})

const dateToString = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const dateToMonth = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
}

const PendaftaranFormPage = ({
    submitting = false,
    onSubmit,
    onCancel,
}: PendaftaranFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_FORM)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [tagihanRows, setTagihanRows] = useState<TagihanItem[]>([newTagihanItem()])

    const [diskonMode, setDiskonMode] = useState<'none' | 'dropdown' | 'kode'>('none')
    const [selectedDiskon, setSelectedDiskon] = useState<SelectOption | null>(null)
    const [kodeDiskon, setKodeDiskon] = useState('')
    const [diskonOptions, setDiskonOptions] = useState<SelectOption[]>([])
    const [loadingDiskon, setLoadingDiskon] = useState(false)

    const [biayaOptions, setBiayaOptions] = useState<SelectOption[]>([])
    const [biayaMap, setBiayaMap] = useState<Record<string, IBiaya>>({})
    const [jadwalOptions, setJadwalOptions] = useState<SelectOption[]>([])
    const [loadingBiaya, setLoadingBiaya] = useState(false)
    const [loadingJadwal, setLoadingJadwal] = useState(false)

    const loadBiaya = useCallback(async () => {
        setLoadingBiaya(true)
        try {
            const res = await BiayaService.getAll({ aktif: 1, limit: 200 })
            if (res.success) {
                const map: Record<string, IBiaya> = {}
                const opts = res.data.map((b: IBiaya) => {
                    map[b.id_biaya] = b
                    return {
                        value: b.id_biaya,
                        label: `${b.nama_biaya} - ${formatRupiah(b.harga_biaya)}`,
                    }
                })
                setBiayaOptions(opts)
                setBiayaMap(map)
            }
        } catch {
            //
        } finally {
            setLoadingBiaya(false)
        }
    }, [])

    const loadJadwal = useCallback(async () => {
        setLoadingJadwal(true)
        try {
            const res = await JadwalKelasService.getAll({ aktif: 1, limit: 200 })
            if (res.success) {
                const opts = res.data.map((j: IJadwalKelas) => ({
                    value: j.id_jadwal_kelas,
                    label: `${j.nama_kelas} - ${j.hari} ${j.jam_mulai}-${j.jam_selesai} (${j.nama_kategori_umur})`,
                }))
                setJadwalOptions(opts)
            }
        } catch {
            //
        } finally {
            setLoadingJadwal(false)
        }
    }, [])

    const loadDiskon = useCallback(async () => {
        setLoadingDiskon(true)
        try {
            const res = await DiskonService.getAktif()
            if (res.success) {
                setDiskonOptions(
                    res.data.map((d: IDiskon) => ({
                        value: d.id_diskon,
                        label: `${d.nama_diskon} (${d.persentase ? d.persentase + '%' : formatRupiah(d.harga ?? 0)}) - s.d. ${d.berlaku_sampai}`,
                    })),
                )
            }
        } catch {
            //
        } finally {
            setLoadingDiskon(false)
        }
    }, [])

    useEffect(() => {
        loadBiaya()
        loadJadwal()
        loadDiskon()
    }, [loadBiaya, loadJadwal, loadDiskon])

    const handleAddTagihan = () => {
        setTagihanRows((prev) => [...prev, newTagihanItem()])
    }

    const handleRemoveTagihan = (key: string) => {
        setTagihanRows((prev) => prev.filter((r) => r._key !== key))
    }

    const handleTagihanChange = (key: string, field: keyof Omit<TagihanItem, '_key' | 'periodeDate'>, value: string) => {
        setTagihanRows((prev) =>
            prev.map((r) => (r._key === key ? { ...r, [field]: value } : r)),
        )
    }

    const handlePeriodeChange = (key: string, date: Date | null) => {
        setTagihanRows((prev) =>
            prev.map((r) =>
                r._key === key
                    ? { ...r, periodeDate: date, periode: date ? dateToMonth(date) : '' }
                    : r,
            ),
        )
    }

    const validate = (): boolean => {
        const e: Record<string, string> = {}

        if (!form.nama_siswa.trim()) e.nama_siswa = 'Nama siswa wajib diisi'

        tagihanRows.forEach((row, idx) => {
            if (!row.id_biaya) e[`tagihan_${idx}_biaya`] = 'Pilih biaya'
        })

        if (tagihanRows.length === 0) e.tagihan_global = 'Minimal satu tagihan wajib diisi'

        if (diskonMode === 'dropdown' && !selectedDiskon) {
            e.diskon = 'Pilih diskon dari daftar'
        }
        if (diskonMode === 'kode' && !kodeDiskon.trim()) {
            e.diskon = 'Kode promo tidak boleh kosong'
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) {
            toast.push(<Notification type="warning" title="Periksa kembali isian form" />)
            return
        }

        const tagihan: IDaftarSiswaItem[] = tagihanRows.map((row) => ({
            id_biaya: row.id_biaya,
            ...(row.id_jadwal_kelas && { id_jadwal_kelas: row.id_jadwal_kelas }),
            ...(row.periode.trim() && { periode: row.periode.trim() }),
        }))

        const payload: IDaftarSiswa = {
            nama_siswa: form.nama_siswa.trim(),
            ...(form.email.trim() && { email: form.email.trim() }),
            ...(form.telepon.trim() && { telepon: form.telepon.trim() }),
            ...(form.tanggal_lahir && { tanggal_lahir: dateToString(form.tanggal_lahir) }),
            ...(form.alamat.trim() && { alamat: form.alamat.trim() }),
            ...(form.jenis_kelamin && { jenis_kelamin: Number(form.jenis_kelamin) as 1 | 2 }),
            tagihan,
            ...(diskonMode === 'dropdown' && selectedDiskon && { id_diskon: selectedDiskon.value }),
            ...(diskonMode === 'kode' && kodeDiskon.trim() && { kode_diskon: kodeDiskon.trim() }),
        }

        onSubmit(payload)
    }

    const estimasiTotal = tagihanRows.reduce(
        (acc, r) => acc + (r.id_biaya && biayaMap[r.id_biaya] ? biayaMap[r.id_biaya].harga_biaya : 0),
        0,
    )

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
                    <h3 className="font-bold">Pendaftaran Siswa Baru</h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Daftarkan siswa sekaligus buat tagihan dalam satu langkah
                    </p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col gap-1">

                    {/* Section: Identitas Siswa */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Identitas Siswa</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem
                                label="Nama Siswa"
                                asterisk
                                invalid={!!errors.nama_siswa}
                                errorMessage={errors.nama_siswa}
                            >
                                <Input
                                    placeholder="Nama lengkap siswa"
                                    value={form.nama_siswa}
                                    invalid={!!errors.nama_siswa}
                                    onChange={(e) => setForm((p) => ({ ...p, nama_siswa: e.target.value }))}
                                />
                            </FormItem>

                            <FormItem label="Jenis Kelamin">
                                <Select<JKOption>
                                    options={JK_OPTIONS}
                                    value={JK_OPTIONS.find((o) => o.value === form.jenis_kelamin) ?? JK_OPTIONS[0]}
                                    onChange={(opt) =>
                                        setForm((p) => ({ ...p, jenis_kelamin: (opt as JKOption).value }))
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

                            <FormItem label="Tanggal Lahir">
                                <DatePicker
                                    value={form.tanggal_lahir}
                                    inputFormat="DD MMMM YYYY"
                                    placeholder="Pilih tanggal lahir"
                                    clearable
                                    onChange={(date) =>
                                        setForm((p) => ({ ...p, tanggal_lahir: date as Date | null }))
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
                                onChange={(e) => setForm((p) => ({ ...p, alamat: e.target.value }))}
                            />
                        </FormItem>
                    </div>

                    <div className="border-t mt-0 mb-0 border-gray-100 dark:border-gray-700" />

                    {/* Section: Diskon */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Diskon</h5>
                        </div>

                        <div className="flex flex-col gap-3">
                            {/* Mode selector */}
                            <div className="flex gap-2">
                                {(['none', 'dropdown', 'kode'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => {
                                            setDiskonMode(mode)
                                            setSelectedDiskon(null)
                                            setKodeDiskon('')
                                            setErrors((p) => { const n = { ...p }; delete n.diskon; return n })
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${diskonMode === mode
                                            ? 'bg-[#E9F3FF] text-[#2a85ff] border-[#d0e6ff] dark:bg-[#E9F3FF]/10 dark:border-[#E9F3FF]/20 dark:text-[#7BB8FF]'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {mode === 'none' ? 'Tanpa Diskon' : mode === 'dropdown' ? 'Pilih Diskon' : 'Kode Promo'}
                                    </button>
                                ))}
                            </div>

                            {diskonMode === 'dropdown' && (
                                <FormItem
                                    invalid={!!errors.diskon}
                                    errorMessage={errors.diskon}
                                >
                                    <Select<SelectOption>
                                        placeholder="— Pilih diskon aktif —"
                                        options={diskonOptions}
                                        isLoading={loadingDiskon}
                                        isClearable
                                        value={selectedDiskon}
                                        onChange={(opt) => setSelectedDiskon(opt as SelectOption | null)}
                                    />
                                </FormItem>
                            )}

                            {diskonMode === 'kode' && (
                                <FormItem
                                    invalid={!!errors.diskon}
                                    errorMessage={errors.diskon}
                                >
                                    <Input
                                        placeholder="Masukkan kode promo"
                                        value={kodeDiskon}
                                        onChange={(e) => setKodeDiskon(e.target.value.toUpperCase())}
                                    />
                                </FormItem>
                            )}
                        </div>
                    </div>

                    <div className="border-t mt-0 mb-0 border-gray-100 dark:border-gray-700" />

                    {/* Section: Tagihan */}
                    <div>
                        {errors.tagihan_global && (
                            <p className="text-red-500 text-sm mb-3">{errors.tagihan_global}</p>
                        )}

                        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3 bg-[#E9F3FF] dark:bg-[#E9F3FF]/10 border-b border-[#d0e6ff] dark:border-[#E9F3FF]/20">
                                <div className="flex items-center gap-2">
                                    <HiOutlineDocumentText className="text-[#2a85ff] text-base shrink-0" />
                                    <span className="text-xs font-semibold text-[#2a85ff] dark:text-[#7BB8FF] uppercase tracking-wide">Tagihan</span>
                                    <span className="text-xs font-semibold text-[#2a85ff] dark:text-[#7BB8FF] bg-white dark:bg-[#E9F3FF]/10 border border-[#d0e6ff] dark:border-[#E9F3FF]/20 px-2 py-0.5 rounded-full">
                                        {tagihanRows.length} item
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="solid"
                                    className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500"
                                    icon={<HiOutlinePlus />}
                                    onClick={handleAddTagihan}
                                    disabled={submitting}
                                >
                                    Tambah Tagihan
                                </Button>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {tagihanRows.map((row, idx) => {
                                    const biaya = row.id_biaya ? biayaMap[row.id_biaya] : null
                                    return (
                                        <div key={row._key} className="flex items-start gap-3 px-5 py-4 bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                                            {/* Nomor */}
                                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#E9F3FF] dark:bg-[#E9F3FF]/10 shrink-0 mt-1">
                                                <span className="text-xs font-bold text-[#2a85ff] dark:text-[#7BB8FF]">{idx + 1}</span>
                                            </div>

                                            {/* Fields */}
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {/* Biaya */}
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                        <HiOutlineDocumentText className="text-[#2a85ff]/60 shrink-0" />
                                                        Biaya <span className="text-red-500">*</span>
                                                    </p>
                                                    <Select<SelectOption>
                                                        isClearable
                                                        placeholder="Pilih biaya..."
                                                        options={biayaOptions}
                                                        isLoading={loadingBiaya}
                                                        value={biayaOptions.find((o) => o.value === row.id_biaya) ?? null}
                                                        onChange={(opt) =>
                                                            handleTagihanChange(row._key, 'id_biaya', opt ? (opt as SelectOption).value : '')
                                                        }
                                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                                        menuPosition="fixed"
                                                    />
                                                    {errors[`tagihan_${idx}_biaya`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`tagihan_${idx}_biaya`]}</p>
                                                    )}
                                                    {biaya && (
                                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 flex-wrap">
                                                            <span className="font-medium">{biaya.jenis_biaya}</span>
                                                            <span className="text-gray-300">·</span>
                                                            <span>{biaya.nama_kelas ?? '-'}</span>
                                                            <span className="text-gray-300">·</span>
                                                            <span className="font-semibold">{formatRupiah(biaya.harga_biaya)}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Jadwal Kelas */}
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                        <HiOutlineCollection className="text-[#2a85ff]/60 shrink-0" />
                                                        Jadwal Kelas
                                                    </p>
                                                    <Select<SelectOption>
                                                        isClearable
                                                        placeholder="- Pilih jadwal -"
                                                        options={jadwalOptions}
                                                        isLoading={loadingJadwal}
                                                        value={jadwalOptions.find((o) => o.value === row.id_jadwal_kelas) ?? null}
                                                        onChange={(opt) =>
                                                            handleTagihanChange(row._key, 'id_jadwal_kelas', opt ? (opt as SelectOption).value : '')
                                                        }
                                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                                        menuPosition="fixed"
                                                    />
                                                </div>

                                                {/* Periode */}
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                        <HiOutlineCalendar className="text-[#2a85ff]/60 shrink-0" />
                                                        Periode
                                                    </p>
                                                    <DatePicker
                                                        placeholder="Bulan & tahun"
                                                        inputFormat="MMMM YYYY"
                                                        clearable
                                                        value={row.periodeDate}
                                                        onChange={(date) =>
                                                            handlePeriodeChange(row._key, date as Date | null)
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {/* Hapus */}
                                            {tagihanRows.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTagihan(row._key)}
                                                    className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1 shrink-0"
                                                    title="Hapus tagihan"
                                                >
                                                    <HiOutlineTrash className="text-base" />
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Estimasi total */}
                            {estimasiTotal > 0 && (
                                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estimasi Total</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                        {formatRupiah(estimasiTotal)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="default"
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
                            Daftarkan Siswa
                        </Button>
                    </div>

                </div>
            </Card>
        </form>
    )
}

export default PendaftaranFormPage
