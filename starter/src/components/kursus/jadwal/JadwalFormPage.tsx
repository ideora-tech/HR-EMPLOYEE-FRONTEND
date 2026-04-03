'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Button,
    Card,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import { HiArrowLeft } from 'react-icons/hi'
import KaryawanService from '@/services/karyawan.service'
import KelasService from '@/services/kursus/kelas.service'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import PaketService from '@/services/kursus/paket.service'
import type {
    IJadwalKelas,
    ICreateJadwalKelas,
    IUpdateJadwalKelas,
} from '@/@types/kursus.types'

/* ─── option types ─────────────────────────────────────── */

type PaketOption = { value: string; label: string }
type KelasOption = { value: string; label: string; idPaket: string | null }
type KaryawanOption = { value: string; label: string }
type KategoriOption = { value: string; label: string }
type HariOption = { value: string; label: string }

/* ─── constants ────────────────────────────────────────── */

const HARI_OPTIONS: HariOption[] = [
    { value: 'Senin', label: 'Senin' },
    { value: 'Selasa', label: 'Selasa' },
    { value: 'Rabu', label: 'Rabu' },
    { value: 'Kamis', label: 'Kamis' },
    { value: 'Jumat', label: 'Jumat' },
    { value: 'Sabtu', label: 'Sabtu' },
    { value: 'Minggu', label: 'Minggu' },
]

const dateToYMD = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
}

const ymdToDate = (s: string | null | undefined): Date | null => {
    if (!s) return null
    const dateOnly = s.substring(0, 10) // handle ISO datetime (2024-01-15T00:00:00Z) maupun YYYY-MM-DD
    const [y, m, d] = dateOnly.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
}

/* ─── props & state ────────────────────────────────────── */

export interface JadwalFormPageProps {
    editData?: IJadwalKelas | null
    submitting?: boolean
    onSubmit: (payload: ICreateJadwalKelas | IUpdateJadwalKelas) => void
    onCancel: () => void
}

interface FormState {
    id_paket: string
    id_kelas: string
    id_karyawan: string
    id_kategori_umur: string
    hari: string
    jam_mulai: string
    jam_selesai: string
    kuota: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_paket: '',
    id_kelas: '',
    id_karyawan: '',
    id_kategori_umur: '',
    hari: '',
    jam_mulai: '08:00',
    jam_selesai: '09:00',
    kuota: '1',
    deskripsi: '',
    aktif: true,
}

/* ─── component ────────────────────────────────────────── */

const JadwalFormPage = ({
    editData,
    submitting = false,
    onSubmit,
    onCancel,
}: JadwalFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const [allKelasOptions, setAllKelasOptions] = useState<KelasOption[]>([])
    const [paketOptions, setPaketOptions] = useState<PaketOption[]>([])
    const [karyawanOptions, setKaryawanOptions] = useState<KaryawanOption[]>([])
    const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([])
    const [loadingDropdowns, setLoadingDropdowns] = useState(false)

    const isEdit = !!editData

    // kelas filtered by selected paket
    const kelasOptions = form.id_paket
        ? allKelasOptions.filter((k) => k.idPaket === form.id_paket)
        : allKelasOptions

    /* ─── load all dropdowns on mount ─────────────── */
    const loadDropdowns = useCallback(async () => {
        setLoadingDropdowns(true)
        try {
            const [kelasRes, karyawanRes, paketRes] = await Promise.all([
                KelasService.getAll({ aktif: 1, limit: 200 }),
                KaryawanService.getAll({ aktif: 1, limit: 200 }),
                PaketService.getAll({ aktif: 1, limit: 200 }),
            ])
            if (kelasRes.success)
                setAllKelasOptions(kelasRes.data.map((k) => ({ value: k.id_kelas, label: k.nama_kelas, idPaket: k.id_paket })))
            if (karyawanRes.success)
                setKaryawanOptions(karyawanRes.data.map((k) => ({ value: k.id_karyawan, label: k.nama_karyawan })))
            if (paketRes.success)
                setPaketOptions(paketRes.data.map((p) => ({ value: p.id_paket, label: p.nama_paket })))
        } catch {
            // silently ignore
        } finally {
            setLoadingDropdowns(false)
        }
    }, [])

    /* ─── load kategori umur by kelas ─────────────────── */
    const loadKategori = useCallback(async (idKelas: string) => {
        if (!idKelas) { setKategoriOptions([]); return }
        try {
            const res = await KategoriUmurService.getByKelas(idKelas)
            if (res.success)
                setKategoriOptions(res.data.map((k) => ({ value: k.id_kategori_umur, label: k.nama_kategori_umur })))
        } catch {
            setKategoriOptions([])
        }
    }, [])

    useEffect(() => { loadDropdowns() }, [loadDropdowns])

    /* ─── populate form when editing ──────────────────── */
    useEffect(() => {
        if (editData) {
            loadKategori(editData.id_kelas)
            // resolve paket from kelas after allKelasOptions loads
            const kelasPaket = allKelasOptions.find((k) => k.value === editData.id_kelas)?.idPaket ?? ''
            setForm({
                id_paket: kelasPaket,
                id_kelas: editData.id_kelas,
                id_karyawan: editData.id_karyawan,
                id_kategori_umur: editData.id_kategori_umur,
                hari: editData.hari,
                jam_mulai: editData.jam_mulai,
                jam_selesai: editData.jam_selesai,
                kuota: String(editData.kuota),
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
            setKategoriOptions([])
        }
        setErrors({})
    }, [editData, loadKategori, allKelasOptions])

    const handlePaketChange = (idPaket: string) => {
        setForm((p) => ({ ...p, id_paket: idPaket, id_kelas: '', id_kategori_umur: '' }))
        setKategoriOptions([])
    }

    const handleKelasChange = (idKelas: string) => {
        setForm((p) => ({ ...p, id_kelas: idKelas, id_kategori_umur: '' }))
        loadKategori(idKelas)
    }

    /* ─── validation ───────────────────────────────────── */
    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.id_kelas) e.id_kelas = 'Kelas wajib dipilih'
        if (!form.id_karyawan) e.id_karyawan = 'Instruktur wajib dipilih'
        if (!form.id_kategori_umur) e.id_kategori_umur = 'Kategori umur wajib dipilih'
        if (!form.hari) e.hari = 'Hari wajib dipilih'
        if (!form.jam_mulai) e.jam_mulai = 'Jam mulai wajib diisi'
        if (!form.jam_selesai) e.jam_selesai = 'Jam selesai wajib diisi'
        if (!form.kuota || Number(form.kuota) < 1)
            e.kuota = 'Kuota minimal 1'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    /* ─── submit ───────────────────────────────────────── */
    const handleSubmit = () => {
        if (!validate()) return
        const base = {
            id_kelas: form.id_kelas,
            id_karyawan: form.id_karyawan,
            id_kategori_umur: form.id_kategori_umur,
            hari: form.hari,
            jam_mulai: form.jam_mulai,
            jam_selesai: form.jam_selesai,
            kuota: Number(form.kuota),
            deskripsi: form.deskripsi.trim() || undefined,
        }
        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateJadwalKelas)
        } else {
            onSubmit(base as ICreateJadwalKelas)
        }
    }

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
                        {isEdit ? 'Edit Jadwal Kelas' : 'Tambah Jadwal Kelas'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {isEdit
                            ? 'Ubah informasi jadwal kelas yang sudah ada'
                            : 'Buat jadwal kelas baru untuk program kursus'}
                    </p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col gap-1">
                    {/* Section: Info Kelas */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Info Kelas</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Paket">
                                <Select<PaketOption>
                                    placeholder="— Semua Paket —"
                                    options={paketOptions}
                                    isLoading={loadingDropdowns}
                                    isClearable
                                    value={paketOptions.find((o) => o.value === form.id_paket) ?? null}
                                    onChange={(opt) => handlePaketChange(opt ? (opt as PaketOption).value : '')}
                                />
                            </FormItem>

                            <FormItem
                                label="Kelas"
                                asterisk
                                invalid={!!errors.id_kelas}
                                errorMessage={errors.id_kelas}
                            >
                                <Select<KelasOption>
                                    placeholder="— Pilih Kelas —"
                                    options={kelasOptions}
                                    isLoading={loadingDropdowns}
                                    value={kelasOptions.find((o) => o.value === form.id_kelas) ?? null}
                                    onChange={(opt) => handleKelasChange((opt as KelasOption).value)}
                                />
                            </FormItem>

                            <FormItem
                                label="Instruktur"
                                asterisk
                                invalid={!!errors.id_karyawan}
                                errorMessage={errors.id_karyawan}
                            >
                                <Select<KaryawanOption>
                                    placeholder="— Pilih Instruktur —"
                                    options={karyawanOptions}
                                    isLoading={loadingDropdowns}
                                    value={karyawanOptions.find((o) => o.value === form.id_karyawan) ?? null}
                                    onChange={(opt) => setForm((p) => ({ ...p, id_karyawan: (opt as KaryawanOption).value }))}
                                />
                            </FormItem>

                            <FormItem
                                label="Kategori Umur"
                                asterisk
                                invalid={!!errors.id_kategori_umur}
                                errorMessage={errors.id_kategori_umur}
                            >
                                <Select<KategoriOption>
                                    placeholder={form.id_kelas ? '— Pilih Kategori Umur —' : 'Pilih kelas dahulu'}
                                    options={kategoriOptions}
                                    isDisabled={!form.id_kelas}
                                    value={kategoriOptions.find((o) => o.value === form.id_kategori_umur) ?? null}
                                    onChange={(opt) => setForm((p) => ({ ...p, id_kategori_umur: (opt as KategoriOption).value }))}
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* Section: Jadwal Pelaksanaan */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Jadwal Pelaksanaan</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem
                                label="Hari"
                                asterisk
                                invalid={!!errors.hari}
                                errorMessage={errors.hari}
                            >
                                <Select<HariOption>
                                    placeholder="— Pilih Hari —"
                                    options={HARI_OPTIONS}
                                    value={HARI_OPTIONS.find((o) => o.value === form.hari) ?? null}
                                    onChange={(opt) => setForm((p) => ({ ...p, hari: (opt as HariOption).value }))}
                                />
                            </FormItem>

                            <FormItem
                                label="Kuota"
                                asterisk
                                invalid={!!errors.kuota}
                                errorMessage={errors.kuota}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="contoh: 8"
                                    value={form.kuota}
                                    invalid={!!errors.kuota}
                                    onChange={(e) => setForm((p) => ({ ...p, kuota: e.target.value }))}
                                />
                            </FormItem>

                            <FormItem
                                label="Jam Mulai"
                                asterisk
                                invalid={!!errors.jam_mulai}
                                errorMessage={errors.jam_mulai}
                            >
                                <Input
                                    type="time"
                                    value={form.jam_mulai}
                                    invalid={!!errors.jam_mulai}
                                    onChange={(e) => setForm((p) => ({ ...p, jam_mulai: e.target.value }))}
                                />
                            </FormItem>

                            <FormItem
                                label="Jam Selesai"
                                asterisk
                                invalid={!!errors.jam_selesai}
                                errorMessage={errors.jam_selesai}
                            >
                                <Input
                                    type="time"
                                    value={form.jam_selesai}
                                    invalid={!!errors.jam_selesai}
                                    onChange={(e) => setForm((p) => ({ ...p, jam_selesai: e.target.value }))}
                                />
                            </FormItem>

                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* Section: Deskripsi */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Keterangan</h5>
                        </div>
                        <FormItem label="Deskripsi">
                            <Input
                                textArea
                                rows={3}
                                placeholder="Catatan tambahan (opsional)"
                                value={form.deskripsi}
                                onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                            />
                        </FormItem>
                    </div>

                    {isEdit && (
                        <>
                            <div className="border-t border-gray-100 dark:border-gray-700" />

                            {/* Section: Status */}
                            <div>
                                <div className="mb-3">
                                    <h5 className="font-semibold">Status</h5>
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        Aktifkan atau nonaktifkan jadwal kelas ini
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <Switcher
                                        checked={form.aktif}
                                        onChange={(val) => setForm((p) => ({ ...p, aktif: val }))}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {form.aktif ? 'Aktif' : 'Nonaktif'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {form.aktif
                                                ? 'Jadwal kelas tersedia untuk pendaftaran'
                                                : 'Jadwal kelas tidak aktif di sistem'}
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
                            variant="default"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="solid" loading={submitting}>
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    )
}

export default JadwalFormPage
