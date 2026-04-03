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
import KelasService from '@/services/kursus/kelas.service'
import PaketService from '@/services/kursus/paket.service'
import type { IKategoriUmur, ICreateKategoriUmur, IUpdateKategoriUmur } from '@/@types/kursus.types'

type KelasOption = { value: string; label: string; idPaket: string | null }
type PaketOption = { value: string; label: string }

interface KategoriUmurFormPageProps {
    editData?: IKategoriUmur | null
    submitting?: boolean
    onSubmit: (payload: ICreateKategoriUmur | IUpdateKategoriUmur) => void
    onCancel: () => void
}

interface FormState {
    id_kelas: string
    id_paket: string
    nama_kategori_umur: string
    sesi_pertemuan: string
    durasi: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_kelas: '',
    id_paket: '',
    nama_kategori_umur: '',
    sesi_pertemuan: '',
    durasi: '',
    deskripsi: '',
    aktif: true,
}

const KategoriUmurFormPage = ({
    editData,
    submitting = false,
    onSubmit,
    onCancel,
}: KategoriUmurFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([])
    const [paketOptions, setPaketOptions] = useState<PaketOption[]>([])
    const [loadingKelas, setLoadingKelas] = useState(false)
    const [loadingPaket, setLoadingPaket] = useState(false)

    const isEdit = !!editData

    const loadKelas = useCallback(async () => {
        setLoadingKelas(true)
        try {
            const res = await KelasService.getAll({ aktif: 1, limit: 200 })
            if (res.success)
                setKelasOptions(
                    res.data.map((k) => ({
                        value: k.id_kelas,
                        label: k.nama_kelas,
                        idPaket: k.id_paket,
                    })),
                )
        } catch {
            // ignore
        } finally {
            setLoadingKelas(false)
        }
    }, [])

    const loadPaket = useCallback(async () => {
        setLoadingPaket(true)
        try {
            const res = await PaketService.getAll({ aktif: 1, limit: 100 })
            if (res.success)
                setPaketOptions(res.data.map((p) => ({ value: p.id_paket, label: p.nama_paket })))
        } catch {
            setPaketOptions([])
        } finally {
            setLoadingPaket(false)
        }
    }, [])

    useEffect(() => {
        loadKelas()
        loadPaket()
    }, [loadKelas, loadPaket])

    useEffect(() => {
        if (editData) {
            setForm({
                id_kelas: editData.id_kelas,
                id_paket: editData.id_paket ?? '',
                nama_kategori_umur: editData.nama_kategori_umur,
                sesi_pertemuan: editData.sesi_pertemuan != null ? String(editData.sesi_pertemuan) : '',
                durasi: editData.durasi != null ? String(editData.durasi) : '',
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData])

    const handleKelasChange = (opt: KelasOption) => {
        setForm((p) => ({
            ...p,
            id_kelas: opt.value,
            id_paket: opt.idPaket ?? '',
        }))
    }

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.id_kelas) e.id_kelas = 'Kelas wajib dipilih'
        if (!form.nama_kategori_umur.trim()) e.nama_kategori_umur = 'Nama kategori wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const base: ICreateKategoriUmur = {
            id_kelas: form.id_kelas,
            id_paket: form.id_paket || undefined,
            nama_kategori_umur: form.nama_kategori_umur.trim(),
            sesi_pertemuan: form.sesi_pertemuan ? Number(form.sesi_pertemuan) : undefined,
            durasi: form.durasi ? Number(form.durasi) : undefined,
            deskripsi: form.deskripsi.trim() || undefined,
        }
        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateKategoriUmur)
        } else {
            onSubmit(base)
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
                        {isEdit ? 'Edit Kategori Umur' : 'Tambah Kategori Umur'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {isEdit
                            ? 'Ubah informasi kategori umur'
                            : 'Tambah kategori umur baru untuk kelas kursus'}
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
                                    onChange={(opt) => handleKelasChange(opt as KelasOption)}
                                />
                            </FormItem>

                            <FormItem label="Paket">
                                <Select<PaketOption>
                                    placeholder={form.id_kelas ? '— Pilih Paket —' : 'Pilih Paket'}
                                    options={paketOptions}
                                    isLoading={loadingPaket}
                                    isDisabled={!form.id_kelas}
                                    isClearable
                                    value={paketOptions.find((o) => o.value === form.id_paket) ?? null}
                                    onChange={(opt) =>
                                        setForm((p) => ({
                                            ...p,
                                            id_paket: (opt as PaketOption | null)?.value ?? '',
                                        }))
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700" />

                    {/* Section: Detail Kategori */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Detail Kategori</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem
                                label="Nama Kategori Umur"
                                asterisk
                                className="md:col-span-2"
                                invalid={!!errors.nama_kategori_umur}
                                errorMessage={errors.nama_kategori_umur}
                            >
                                <Input
                                    placeholder="contoh: 3-6 Tahun, 7-12 Tahun"
                                    value={form.nama_kategori_umur}
                                    invalid={!!errors.nama_kategori_umur}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, nama_kategori_umur: e.target.value }))
                                    }
                                />
                            </FormItem>

                            <FormItem
                                label="Sesi Pertemuan"
                                extra={<span className="text-xs text-gray-400">Opsional — jumlah sesi pertemuan</span>}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="contoh: 8"
                                    value={form.sesi_pertemuan}
                                    onChange={(e) => setForm((p) => ({ ...p, sesi_pertemuan: e.target.value }))}
                                />
                            </FormItem>

                            <FormItem
                                label="Durasi (bulan)"
                                extra={<span className="text-xs text-gray-400">Opsional — lama program dalam bulan</span>}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    placeholder="contoh: 3"
                                    value={form.durasi}
                                    onChange={(e) => setForm((p) => ({ ...p, durasi: e.target.value }))}
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t mt-0 mb-0 border-gray-100 dark:border-gray-700" />

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
                            <div className="border-t mt-0 mb-0 border-gray-100 dark:border-gray-700" />

                            {/* Section: Status */}
                            <div>
                                <div className="mb-3">
                                    <h5 className="font-semibold">Status</h5>
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        Aktifkan atau nonaktifkan kategori umur ini
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
                                                ? 'Kategori tersedia untuk pendaftaran'
                                                : 'Kategori tidak aktif di sistem'}
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
                        <Button
                            type="submit"
                            variant="solid"
                            loading={submitting}
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Kategori'}
                        </Button>
                    </div>

                </div>
            </Card>
        </form>
    )
}

export default KategoriUmurFormPage
