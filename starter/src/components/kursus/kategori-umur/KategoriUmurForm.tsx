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
import type { IKategoriUmur, ICreateKategoriUmur, IUpdateKategoriUmur } from '@/@types/kursus.types'

type KelasOption = { value: string; label: string }
type PaketOption = { value: string; label: string }

interface KategoriUmurFormProps {
    open: boolean
    editData?: IKategoriUmur | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateKategoriUmur | IUpdateKategoriUmur) => void
}

interface FormState {
    id_kelas: string
    id_paket: string
    nama_kategori_umur: string
    durasi: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_kelas: '',
    id_paket: '',
    nama_kategori_umur: '',
    durasi: '',
    deskripsi: '',
    aktif: true,
}

const KategoriUmurForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: KategoriUmurFormProps) => {
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
                setKelasOptions(res.data.map((k) => ({ value: k.id_kelas, label: k.nama_kelas })))
        } catch {
            // ignore
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

    useEffect(() => {
        if (open) loadKelas()
    }, [open, loadKelas])

    useEffect(() => {
        if (editData) {
            loadPaket(editData.id_kelas)
            setForm({
                id_kelas: editData.id_kelas,
                id_paket: editData.id_paket,
                nama_kategori_umur: editData.nama_kategori_umur,
                durasi: editData.durasi != null ? String(editData.durasi) : '',
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
            setPaketOptions([])
        }
        setErrors({})
    }, [editData, open, loadPaket])

    const handleKelasChange = (idKelas: string) => {
        setForm((p) => ({ ...p, id_kelas: idKelas, id_paket: '' }))
        loadPaket(idKelas)
    }

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.id_kelas) e.id_kelas = 'Kelas wajib dipilih'
        if (!form.id_paket) e.id_paket = 'Paket wajib dipilih'
        if (!form.nama_kategori_umur.trim()) e.nama_kategori_umur = 'Nama kategori wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const base: ICreateKategoriUmur = {
            id_kelas: form.id_kelas,
            id_paket: form.id_paket,
            nama_kategori_umur: form.nama_kategori_umur.trim(),
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
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={480}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Kategori Umur' : 'Tambah Kategori Umur'}</h5>

            <div className="flex flex-col gap-1">
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
                        onChange={(opt) => handleKelasChange((opt as KelasOption).value)}
                    />
                </FormItem>

                <FormItem
                    label="Paket"
                    asterisk
                    invalid={!!errors.id_paket}
                    errorMessage={errors.id_paket}
                >
                    <Select<PaketOption>
                        placeholder={form.id_kelas ? '— Pilih Paket —' : 'Pilih kelas dahulu'}
                        options={paketOptions}
                        isLoading={loadingPaket}
                        isDisabled={!form.id_kelas}
                        value={paketOptions.find((o) => o.value === form.id_paket) ?? null}
                        onChange={(opt) =>
                            setForm((p) => ({ ...p, id_paket: (opt as PaketOption).value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Kategori Umur"
                    asterisk
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
                    label="Durasi (bulan)"
                    extra={<span className="text-xs text-gray-400">Opsional – lama program dalam bulan</span>}
                >
                    <Input
                        type="number"
                        min={1}
                        placeholder="contoh: 3"
                        value={form.durasi}
                        onChange={(e) => setForm((p) => ({ ...p, durasi: e.target.value }))}
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </Button>
            </div>
        </Dialog>
    )
}

export default KategoriUmurForm
