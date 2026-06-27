'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Button,
    Card,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import { HiArrowLeft } from 'react-icons/hi'
import KelasService from '@/services/kursus/kelas.service'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import { formatNum, formatRupiahInput, parseRupiah } from '@/utils/formatNumber'
import type { IBiaya, ICreateBiaya, IUpdateBiaya, IKategoriUmur, JenisBiaya } from '@/@types/kursus.types'

type SelectOption = { value: string; label: string }
type JenisBiayaOption = { value: JenisBiaya; label: string }

const JENIS_BIAYA_OPTIONS: JenisBiayaOption[] = [
    { value: 'KELAS', label: 'Kelas' },
    { value: 'PENDAFTARAN', label: 'Pendaftaran' },
    { value: 'LAINNYA', label: 'Lainnya' },
]

interface BiayaFormPageProps {
    editData?: IBiaya | null
    submitting?: boolean
    onSubmit: (payload: ICreateBiaya | IUpdateBiaya) => void
    onCancel: () => void
}

interface FormState {
    id_kelas: string
    id_paket: string
    id_kategori_umur: string
    jenis_biaya: JenisBiaya | ''
    nama_biaya: string
    harga_biaya: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_kelas: '',
    id_paket: '',
    id_kategori_umur: '',
    jenis_biaya: '',
    nama_biaya: '',
    harga_biaya: '',
    deskripsi: '',
    aktif: true,
}

const BiayaFormPage = ({
    editData,
    submitting = false,
    onSubmit,
    onCancel,
}: BiayaFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [kelasOptions, setKelasOptions] = useState<SelectOption[]>([])
    const [kategoriAllList, setKategoriAllList] = useState<IKategoriUmur[]>([])
    const [loadingKelas, setLoadingKelas] = useState(false)
    const [loadingKategori, setLoadingKategori] = useState(false)

    const isEdit = !!editData

    // Paket options — derived dari kategori yang sudah difilter by kelas
    const paketOptions = useMemo<SelectOption[]>(() => {
        const map = new Map<string, string>()
        kategoriAllList.forEach((k) => {
            if (k.id_paket && k.nama_paket) map.set(k.id_paket, k.nama_paket)
        })
        return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
    }, [kategoriAllList])

    // Kategori options — filtered by selected paket
    const kategoriOptions = useMemo<SelectOption[]>(() => {
        const list = form.id_paket
            ? kategoriAllList.filter((k) => k.id_paket === form.id_paket)
            : kategoriAllList
        return list.map((k) => ({ value: k.id_kategori_umur, label: k.nama_kategori_umur }))
    }, [kategoriAllList, form.id_paket])

    const loadKelas = useCallback(async () => {
        setLoadingKelas(true)
        try {
            const res = await KelasService.getAll({ aktif: 1, limit: 200 })
            if (res.success)
                setKelasOptions(res.data.map((k) => ({ value: k.id_kelas, label: k.nama_kelas })))
        } catch { /* */ } finally {
            setLoadingKelas(false)
        }
    }, [])

    const loadKategoriByKelas = useCallback(async (idKelas: string) => {
        if (!idKelas) { setKategoriAllList([]); return }
        setLoadingKategori(true)
        try {
            const res = await KategoriUmurService.getByKelas(idKelas)
            if (res.success) setKategoriAllList(res.data)
        } catch {
            setKategoriAllList([])
        } finally {
            setLoadingKategori(false)
        }
    }, [])

    useEffect(() => { loadKelas() }, [loadKelas])

    useEffect(() => {
        if (editData) {
            setForm({
                id_kelas: editData.id_kelas ?? '',
                id_paket: editData.id_paket ?? '',
                id_kategori_umur: editData.id_kategori_umur ?? '',
                jenis_biaya: editData.jenis_biaya,
                nama_biaya: editData.nama_biaya,
                harga_biaya: formatNum(editData.harga_biaya),
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
            if (editData.id_kelas) loadKategoriByKelas(editData.id_kelas)
        } else {
            setForm(INITIAL_STATE)
            setKategoriAllList([])
        }
        setErrors({})
    }, [editData, loadKategoriByKelas])

    const handleKelasChange = async (idKelas: string) => {
        setForm((p) => ({ ...p, id_kelas: idKelas, id_paket: '', id_kategori_umur: '' }))
        setKategoriAllList([])
        if (idKelas) await loadKategoriByKelas(idKelas)
    }

    const handlePaketChange = (idPaket: string) => {
        setForm((p) => ({ ...p, id_paket: idPaket, id_kategori_umur: '' }))
    }

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.jenis_biaya) e.jenis_biaya = 'Jenis biaya wajib dipilih'
        if (!form.nama_biaya.trim()) e.nama_biaya = 'Nama biaya wajib diisi'
        const harga = parseRupiah(form.harga_biaya)
        if (!form.harga_biaya || harga < 0) e.harga_biaya = 'Harga biaya wajib diisi (angka positif)'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const base: ICreateBiaya = {
            id_kelas: form.id_kelas || undefined,
            id_paket: form.id_paket || undefined,
            id_kategori_umur: form.id_kategori_umur || undefined,
            jenis_biaya: form.jenis_biaya as JenisBiaya,
            nama_biaya: form.nama_biaya.trim(),
            harga_biaya: parseRupiah(form.harga_biaya),
            deskripsi: form.deskripsi.trim() || undefined,
        }
        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateBiaya)
        } else {
            onSubmit(base)
        }
    }

    return (
        <form
            className="flex flex-col gap-6"
            onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
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
                        {isEdit ? 'Edit Biaya Kursus' : 'Tambah Biaya Kursus'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {isEdit
                            ? 'Ubah informasi biaya kursus yang sudah ada'
                            : 'Tambahkan komponen biaya baru untuk program kursus'}
                    </p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col gap-1">
                    {/* Section: Relasi Kelas */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Relasi Kelas</h5>
                            <p className="text-gray-500 text-sm mt-0.5">Pilih kelas dahulu — paket dan kategori umur akan menyesuaikan</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                            <FormItem label="Kelas">
                                <Select<SelectOption>
                                    placeholder="— Pilih Kelas —"
                                    options={kelasOptions}
                                    isLoading={loadingKelas}
                                    isClearable
                                    value={kelasOptions.find((o) => o.value === form.id_kelas) ?? null}
                                    onChange={(opt) => handleKelasChange(opt ? (opt as SelectOption).value : '')}
                                />
                            </FormItem>

                            <FormItem label="Paket">
                                <Select<SelectOption>
                                    placeholder={!form.id_kelas ? 'Pilih kelas dahulu' : paketOptions.length === 0 ? 'Tidak ada paket' : '— Pilih Paket —'}
                                    options={paketOptions}
                                    isLoading={loadingKategori}
                                    isDisabled={!form.id_kelas || paketOptions.length === 0}
                                    isClearable
                                    value={paketOptions.find((o) => o.value === form.id_paket) ?? null}
                                    onChange={(opt) => handlePaketChange(opt ? (opt as SelectOption).value : '')}
                                />
                            </FormItem>

                            <FormItem label="Kategori Umur">
                                <Select<SelectOption>
                                    placeholder={!form.id_kelas ? 'Pilih kelas dahulu' : !form.id_paket ? 'Pilih paket dahulu' : kategoriOptions.length === 0 ? 'Tidak ada kategori' : '— Pilih Kategori Umur —'}
                                    options={kategoriOptions}
                                    isDisabled={!form.id_paket || kategoriOptions.length === 0}
                                    isClearable
                                    value={kategoriOptions.find((o) => o.value === form.id_kategori_umur) ?? null}
                                    onChange={(opt) =>
                                        setForm((p) => ({ ...p, id_kategori_umur: opt ? (opt as SelectOption).value : '' }))
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* Section: Detail Biaya */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Detail Biaya</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                            <FormItem
                                label="Jenis Biaya"
                                asterisk
                                invalid={!!errors.jenis_biaya}
                                errorMessage={errors.jenis_biaya}
                            >
                                <Select<JenisBiayaOption>
                                    placeholder="— Pilih Jenis Biaya —"
                                    options={JENIS_BIAYA_OPTIONS}
                                    value={JENIS_BIAYA_OPTIONS.find((o) => o.value === form.jenis_biaya) ?? null}
                                    onChange={(opt) =>
                                        setForm((p) => ({ ...p, jenis_biaya: (opt as JenisBiayaOption).value }))
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Nama Biaya"
                                asterisk
                                invalid={!!errors.nama_biaya}
                                errorMessage={errors.nama_biaya}
                            >
                                <Input
                                    placeholder="contoh: Biaya Kelas, Biaya Pendaftaran"
                                    value={form.nama_biaya}
                                    invalid={!!errors.nama_biaya}
                                    onChange={(e) => setForm((p) => ({ ...p, nama_biaya: e.target.value }))}
                                />
                            </FormItem>

                            <FormItem
                                label="Harga Biaya"
                                asterisk
                                invalid={!!errors.harga_biaya}
                                errorMessage={errors.harga_biaya}
                            >
                                <Input
                                    prefix={<span className="text-gray-500 font-medium">Rp</span>}
                                    placeholder="contoh: 250.000"
                                    value={form.harga_biaya}
                                    invalid={!!errors.harga_biaya}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, harga_biaya: formatRupiahInput(e.target.value) }))
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* Section: Keterangan */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Keterangan</h5>
                        </div>
                        <FormItem label="Deskripsi">
                            <Input
                                textArea
                                rows={3}
                                placeholder="Keterangan tambahan (opsional)"
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
                                        Aktifkan atau nonaktifkan biaya kursus ini
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
                                                ? 'Biaya dapat digunakan untuk tagihan siswa'
                                                : 'Biaya tidak aktif di sistem'}
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
                        <Button type="submit" variant="solid" customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'} loading={submitting}>
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Biaya'}
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    )
}

export default BiayaFormPage
