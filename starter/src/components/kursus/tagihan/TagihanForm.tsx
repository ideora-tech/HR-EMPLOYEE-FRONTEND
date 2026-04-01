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
import BiayaService from '@/services/kursus/biaya.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import { formatNum } from '@/utils/formatNumber'
import type { ISiswa, IBiaya, ITagihan, ICreateTagihan, IUpdateTagihan } from '@/@types/kursus.types'

/* ─── option types ───────────────────────────────────────── */

type SiswaOption = { value: string; label: string }
type KelasOption = { value: string; label: string }
type BiayaOption = { value: string; label: string; biaya: IBiaya }

/* ─── helpers ────────────────────────────────────────────── */

const formatRupiahInput = (raw: string): string => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return ''
    return formatNum(Number(digits))
}

const parseRupiah = (formatted: string): number =>
    Number(formatted.replace(/\./g, '')) || 0

/* ─── props ──────────────────────────────────────────────── */

interface TagihanFormProps {
    open: boolean
    editData?: ITagihan | null
    siswaList?: ISiswa[]
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateTagihan | IUpdateTagihan) => void
}

interface FormState {
    // create only
    id_siswa: string
    id_kelas: string
    id_biaya: string
    id_paket: string
    id_kategori_umur: string
    // shared
    periode: string
    sesi_pertemuan: string
    total_harga: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_siswa: '',
    id_kelas: '',
    id_biaya: '',
    id_paket: '',
    id_kategori_umur: '',
    periode: '',
    sesi_pertemuan: '',
    total_harga: '',
    deskripsi: '',
    aktif: true,
}

/* ─── component ──────────────────────────────────────────── */

const TagihanForm = ({
    open,
    editData,
    siswaList = [],
    submitting = false,
    onClose,
    onSubmit,
}: TagihanFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([])
    const [biayaOptions, setBiayaOptions] = useState<BiayaOption[]>([])
    const [loadingKelas, setLoadingKelas] = useState(false)
    const [loadingBiaya, setLoadingBiaya] = useState(false)
    const [defaultSesi, setDefaultSesi] = useState<number | null>(null)

    const isEdit = !!editData

    const siswaOptions: SiswaOption[] = siswaList.map((s) => ({
        value: s.id_siswa,
        label: s.nama_siswa + (s.telepon ? ` (${s.telepon})` : ''),
    }))

    /* load kelas once when dialog opens */
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

    /* load biaya + jadwal by kelas — jadwal dipakai untuk default sesi_pertemuan */
    const loadBiaya = useCallback(async (idKelas: string) => {
        if (!idKelas) { setBiayaOptions([]); setDefaultSesi(null); return }
        setLoadingBiaya(true)
        try {
            const [biayaRes, jadwalRes] = await Promise.all([
                BiayaService.getByKelas(idKelas),
                JadwalKelasService.getByKelas(idKelas),
            ])
            if (biayaRes.success)
                setBiayaOptions(
                    biayaRes.data.map((b) => ({
                        value: b.id_biaya,
                        label: `${b.nama_biaya} — Rp ${formatNum(b.harga_biaya)}`,
                        biaya: b,
                    })),
                )
            if (jadwalRes.success && jadwalRes.data.length > 0) {
                const aktif = jadwalRes.data.find((j) => j.aktif === 1) ?? jadwalRes.data[0]
                setDefaultSesi(aktif.sesi_pertemuan ?? null)
            } else {
                setDefaultSesi(null)
            }
        } catch {
            setBiayaOptions([])
            setDefaultSesi(null)
        } finally {
            setLoadingBiaya(false)
        }
    }, [])

    useEffect(() => {
        if (open) loadKelas()
    }, [open, loadKelas])

    /* populate when editing */
    useEffect(() => {
        if (editData) {
            setForm({
                id_siswa: editData.id_siswa,
                id_kelas: editData.id_kelas,
                id_biaya: editData.id_biaya,
                id_paket: editData.id_paket,
                id_kategori_umur: editData.id_kategori_umur,
                periode: editData.periode ?? '',
                sesi_pertemuan: editData.sesi_pertemuan ? String(editData.sesi_pertemuan) : '',
                total_harga: formatNum(editData.total_harga),
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
            loadBiaya(editData.id_kelas)
        } else {
            setForm(INITIAL_STATE)
            setBiayaOptions([])
        }
        setErrors({})
    }, [editData, open, loadBiaya])

    const handleKelasChange = (idKelas: string) => {
        setForm((p) => ({ ...p, id_kelas: idKelas, id_biaya: '', id_paket: '', id_kategori_umur: '', total_harga: '', sesi_pertemuan: '' }))
        setDefaultSesi(null)
        loadBiaya(idKelas)
    }

    const handleBiayaChange = (opt: BiayaOption) => {
        setForm((p) => ({
            ...p,
            id_biaya: opt.biaya.id_biaya,
            id_paket: opt.biaya.id_paket,
            id_kategori_umur: opt.biaya.id_kategori_umur,
            total_harga: formatNum(opt.biaya.harga_biaya),
            sesi_pertemuan: defaultSesi ? String(defaultSesi) : p.sesi_pertemuan,
        }))
    }

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: val }))

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!isEdit) {
            if (!form.id_siswa) e.id_siswa = 'Siswa wajib dipilih'
            if (!form.id_kelas) e.id_kelas = 'Kelas wajib dipilih'
            if (!form.id_biaya) e.id_biaya = 'Biaya wajib dipilih'
        }
        if (parseRupiah(form.total_harga) <= 0) e.total_harga = 'Total harga wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const payload: IUpdateTagihan = {
                periode: form.periode || undefined,
                sesi_pertemuan: form.sesi_pertemuan ? Number(form.sesi_pertemuan) : undefined,
                total_harga: parseRupiah(form.total_harga),
                deskripsi: form.deskripsi || undefined,
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(payload)
        } else {
            const payload: ICreateTagihan = {
                id_siswa: form.id_siswa,
                id_biaya: form.id_biaya,
                id_kategori_umur: form.id_kategori_umur,
                id_paket: form.id_paket,
                id_kelas: form.id_kelas,
                periode: form.periode || undefined,
                sesi_pertemuan: form.sesi_pertemuan ? Number(form.sesi_pertemuan) : undefined,
                total_harga: parseRupiah(form.total_harga),
                deskripsi: form.deskripsi || undefined,
            }
            onSubmit(payload)
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={520}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Tagihan' : 'Buat Tagihan Baru'}</h5>

            <div className="flex flex-col gap-1">
                {/* ── CREATE ONLY ── */}
                {!isEdit && (
                    <>
                        <FormItem
                            label="Siswa"
                            asterisk
                            invalid={!!errors.id_siswa}
                            errorMessage={errors.id_siswa}
                        >
                            <Select<SiswaOption>
                                placeholder="— Pilih Siswa —"
                                options={siswaOptions}
                                value={siswaOptions.find((o) => o.value === form.id_siswa) ?? null}
                                onChange={(opt) => set('id_siswa', (opt as SiswaOption).value)}
                            />
                        </FormItem>

                        <div className="grid grid-cols-2 gap-3">
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
                                label="Biaya"
                                asterisk
                                invalid={!!errors.id_biaya}
                                errorMessage={errors.id_biaya}
                            >
                                <Select<BiayaOption>
                                    placeholder={form.id_kelas ? '— Pilih Biaya —' : 'Pilih kelas dahulu'}
                                    options={biayaOptions}
                                    isLoading={loadingBiaya}
                                    isDisabled={!form.id_kelas}
                                    value={biayaOptions.find((o) => o.value === form.id_biaya) ?? null}
                                    onChange={(opt) => handleBiayaChange(opt as BiayaOption)}
                                />
                            </FormItem>
                        </div>
                    </>
                )}

                {/* ── PERIODE & SESI ── */}
                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Periode">
                        <Input
                            type="month"
                            value={form.periode}
                            onChange={(e) => set('periode', e.target.value)}
                        />
                    </FormItem>

                    <FormItem label="Sesi Pertemuan">
                        <Input
                            type="number"
                            min={1}
                            placeholder="contoh: 8"
                            value={form.sesi_pertemuan}
                            onChange={(e) => set('sesi_pertemuan', e.target.value)}
                        />
                    </FormItem>
                </div>

                {/* ── TOTAL HARGA ── */}
                <FormItem
                    label="Total Harga"
                    asterisk
                    invalid={!!errors.total_harga}
                    errorMessage={errors.total_harga}
                >
                    <Input
                        prefix={<span className="text-gray-500 font-medium">Rp</span>}
                        placeholder="Otomatis dari biaya yang dipilih"
                        value={form.total_harga}
                        invalid={!!errors.total_harga}
                        onChange={(e) => set('total_harga', formatRupiahInput(e.target.value))}
                    />
                </FormItem>

                {/* ── DESKRIPSI ── */}
                <FormItem label="Deskripsi (opsional)">
                    <Input
                        textArea
                        rows={2}
                        placeholder="Catatan tambahan…"
                        value={form.deskripsi}
                        onChange={(e) => set('deskripsi', e.target.value)}
                    />
                </FormItem>

                {/* ── STATUS (edit only) ── */}
                {isEdit && (
                    <FormItem label="Status Aktif">
                        <div className="flex items-center gap-3">
                            <Switcher
                                checked={form.aktif}
                                onChange={(val) => set('aktif', val)}
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
                    {isEdit ? 'Simpan Perubahan' : 'Buat Tagihan'}
                </Button>
            </div>
        </Dialog>
    )
}

export default TagihanForm
