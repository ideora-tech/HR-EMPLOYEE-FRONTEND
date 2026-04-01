'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import KelasService from '@/services/kursus/kelas.service'
import PaketService from '@/services/kursus/paket.service'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import type { IBiaya, ICreateBiaya, IUpdateBiaya } from '@/@types/kursus.types'

type SelectOption = { value: string; label: string }

interface BiayaFormProps {
    open: boolean
    editData?: IBiaya | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateBiaya | IUpdateBiaya) => void
}

interface FormState {
    id_kelas: string
    id_paket: string
    id_kategori_umur: string
    nama_biaya: string
    harga_biaya: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_kelas: '',
    id_paket: '',
    id_kategori_umur: '',
    nama_biaya: '',
    harga_biaya: '',
    deskripsi: '',
    aktif: true,
}

const BiayaForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: BiayaFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [kelasOptions, setKelasOptions] = useState<SelectOption[]>([])
    const [paketOptions, setPaketOptions] = useState<SelectOption[]>([])
    const [kategoriOptions, setKategoriOptions] = useState<SelectOption[]>([])
    const [loadingKelas, setLoadingKelas] = useState(false)
    const [loadingPaket, setLoadingPaket] = useState(false)
    const [loadingKategori, setLoadingKategori] = useState(false)

    const isEdit = !!editData

    const loadKelas = useCallback(async () => {
        setLoadingKelas(true)
        try {
            const res = await KelasService.getAll({ aktif: 1, limit: 200 })
            if (res.success)
                setKelasOptions(res.data.map((k) => ({ value: k.id_kelas, label: k.nama_kelas })))
        } catch {
            //
        } finally {
            setLoadingKelas(false)
        }
    }, [])

    const loadPaket = useCallback(async (idKelas: string) => {
        if (!idKelas) { setPaketOptions([]); return }
        setLoadingPaket(true)
        try {
            const res = await PaketService.getByKelas(idKelas)
            if (res.success)
                setPaketOptions(res.data.map((p) => ({ value: p.id_paket, label: p.nama_paket })))
        } catch {
            setPaketOptions([])
        } finally {
            setLoadingPaket(false)
        }
    }, [])

    const loadKategori = useCallback(async (idPaket: string) => {
        if (!idPaket) { setKategoriOptions([]); return }
        setLoadingKategori(true)
        try {
            const res = await KategoriUmurService.getByPaket(idPaket)
            if (res.success)
                setKategoriOptions(
                    res.data.map((k) => ({ value: k.id_kategori_umur, label: k.nama_kategori_umur })),
                )
        } catch {
            setKategoriOptions([])
        } finally {
            setLoadingKategori(false)
        }
    }, [])

    useEffect(() => {
        if (open) loadKelas()
    }, [open, loadKelas])

    useEffect(() => {
        if (editData) {
            loadPaket(editData.id_kelas)
            loadKategori(editData.id_paket)
            setForm({
                id_kelas: editData.id_kelas,
                id_paket: editData.id_paket,
                id_kategori_umur: editData.id_kategori_umur,
                nama_biaya: editData.nama_biaya,
                harga_biaya: String(editData.harga_biaya),
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
            setPaketOptions([])
            setKategoriOptions([])
        }
        setErrors({})
    }, [editData, open, loadPaket, loadKategori])

    const handleKelasChange = (idKelas: string) => {
        setForm((p) => ({ ...p, id_kelas: idKelas, id_paket: '', id_kategori_umur: '' }))
        setPaketOptions([])
        setKategoriOptions([])
        loadPaket(idKelas)
    }

    const handlePaketChange = (idPaket: string) => {
        setForm((p) => ({ ...p, id_paket: idPaket, id_kategori_umur: '' }))
        setKategoriOptions([])
        loadKategori(idPaket)
    }

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.id_kelas) e.id_kelas = 'Kelas wajib dipilih'
        if (!form.id_paket) e.id_paket = 'Paket wajib dipilih'
        if (!form.id_kategori_umur) e.id_kategori_umur = 'Kategori umur wajib dipilih'
        if (!form.nama_biaya.trim()) e.nama_biaya = 'Nama biaya wajib diisi'
        if (!form.harga_biaya || isNaN(Number(form.harga_biaya)) || Number(form.harga_biaya) < 0)
            e.harga_biaya = 'Harga biaya wajib diisi (angka positif)'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const base: ICreateBiaya = {
            id_kelas: form.id_kelas,
            id_paket: form.id_paket,
            id_kategori_umur: form.id_kategori_umur,
            nama_biaya: form.nama_biaya.trim(),
            harga_biaya: Number(form.harga_biaya),
            deskripsi: form.deskripsi.trim() || undefined,
        }
        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateBiaya)
        } else {
            onSubmit(base)
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={500}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Biaya' : 'Tambah Biaya'}</h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Kelas"
                    asterisk
                    invalid={!!errors.id_kelas}
                    errorMessage={errors.id_kelas}
                >
                    <Select<SelectOption>
                        placeholder="— Pilih Kelas —"
                        options={kelasOptions}
                        isLoading={loadingKelas}
                        value={kelasOptions.find((o) => o.value === form.id_kelas) ?? null}
                        onChange={(opt) => handleKelasChange((opt as SelectOption).value)}
                    />
                </FormItem>

                <FormItem
                    label="Paket"
                    asterisk
                    invalid={!!errors.id_paket}
                    errorMessage={errors.id_paket}
                >
                    <Select<SelectOption>
                        placeholder={form.id_kelas ? '— Pilih Paket —' : 'Pilih kelas dahulu'}
                        options={paketOptions}
                        isLoading={loadingPaket}
                        isDisabled={!form.id_kelas}
                        value={paketOptions.find((o) => o.value === form.id_paket) ?? null}
                        onChange={(opt) => handlePaketChange((opt as SelectOption).value)}
                    />
                </FormItem>

                <FormItem
                    label="Kategori Umur"
                    asterisk
                    invalid={!!errors.id_kategori_umur}
                    errorMessage={errors.id_kategori_umur}
                >
                    <Select<SelectOption>
                        placeholder={form.id_paket ? '— Pilih Kategori Umur —' : 'Pilih paket dahulu'}
                        options={kategoriOptions}
                        isLoading={loadingKategori}
                        isDisabled={!form.id_paket}
                        value={kategoriOptions.find((o) => o.value === form.id_kategori_umur) ?? null}
                        onChange={(opt) =>
                            setForm((p) => ({ ...p, id_kategori_umur: (opt as SelectOption).value }))
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
                        placeholder="contoh: Biaya Bulanan, Biaya Pendaftaran"
                        value={form.nama_biaya}
                        invalid={!!errors.nama_biaya}
                        onChange={(e) => setForm((p) => ({ ...p, nama_biaya: e.target.value }))}
                    />
                </FormItem>

                <FormItem
                    label="Harga Biaya (Rp)"
                    asterisk
                    invalid={!!errors.harga_biaya}
                    errorMessage={errors.harga_biaya}
                >
                    <Input
                        type="number"
                        min={0}
                        placeholder="contoh: 250000"
                        value={form.harga_biaya}
                        invalid={!!errors.harga_biaya}
                        onChange={(e) => setForm((p) => ({ ...p, harga_biaya: e.target.value }))}
                    />
                </FormItem>

                <FormItem label="Deskripsi">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Keterangan tambahan (opsional)"
                        value={form.deskripsi}
                        onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Biaya'}
                </Button>
            </div>
        </Dialog>
    )
}

export default BiayaForm
