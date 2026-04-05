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
import KaryawanService from '@/services/karyawan.service'
import KelasService from '@/services/kursus/kelas.service'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import type {
    IJadwalKelas,
    ICreateJadwalKelas,
    IUpdateJadwalKelas,
} from '@/@types/kursus.types'

/* ─── option types ───────────────────────────────────────── */

type KelasOption = { value: string; label: string }
type KaryawanOption = { value: string; label: string }
type KategoriOption = { value: string; label: string }
type HariOption = { value: string; label: string }

/* ─── constants ──────────────────────────────────────────── */

const HARI_OPTIONS: HariOption[] = [
    { value: 'Senin', label: 'Senin' },
    { value: 'Selasa', label: 'Selasa' },
    { value: 'Rabu', label: 'Rabu' },
    { value: 'Kamis', label: 'Kamis' },
    { value: 'Jumat', label: 'Jumat' },
    { value: 'Sabtu', label: 'Sabtu' },
    { value: 'Minggu', label: 'Minggu' },
]



/* ─── props & state ──────────────────────────────────────── */

interface JadwalFormProps {
    open: boolean
    editData?: IJadwalKelas | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateJadwalKelas | IUpdateJadwalKelas) => void
}

interface FormState {
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

/* ─── component ──────────────────────────────────────────── */

const JadwalForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: JadwalFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([])
    const [karyawanOptions, setKaryawanOptions] = useState<KaryawanOption[]>([])
    const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([])
    const [loadingDropdowns, setLoadingDropdowns] = useState(false)

    const isEdit = !!editData

    /* ─── load kelas & karyawan on open ─────────────────── */
    const loadDropdowns = useCallback(async () => {
        setLoadingDropdowns(true)
        try {
            const [kelasRes, karyawanRes] = await Promise.all([
                KelasService.getAll({ aktif: 1, limit: 200 }),
                KaryawanService.getAll({ aktif: 1, limit: 200 }),
            ])
            if (kelasRes.success)
                setKelasOptions(kelasRes.data.map((k) => ({ value: k.id_kelas, label: k.nama_kelas })))
            if (karyawanRes.success)
                setKaryawanOptions(karyawanRes.data.map((k) => ({ value: k.id_karyawan, label: k.nama_karyawan })))
        } catch {
            // silently ignore
        } finally {
            setLoadingDropdowns(false)
        }
    }, [])

    /* ─── load kategori umur by kelas ───────────────────── */
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

    useEffect(() => {
        if (open) loadDropdowns()
    }, [open, loadDropdowns])

    /* ─── populate form when editing ───────────────────── */
    useEffect(() => {
        if (editData) {
            loadKategori(editData.id_kelas)
            setForm({
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
    }, [editData, open, loadKategori])

    /* ─── when kelas changes, reload kategori ───────────── */
    const handleKelasChange = (idKelas: string) => {
        setForm((p) => ({ ...p, id_kelas: idKelas, id_kategori_umur: '' }))
        loadKategori(idKelas)
    }

    /* ─── validation ─────────────────────────────────────── */
    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.id_kelas) e.id_kelas = 'Kelas wajib dipilih'
        if (!form.id_karyawan) e.id_karyawan = 'Coach wajib dipilih'
        if (!form.id_kategori_umur) e.id_kategori_umur = 'Kategori umur wajib dipilih'
        if (!form.hari) e.hari = 'Hari wajib dipilih'
        if (!form.jam_mulai) e.jam_mulai = 'Jam mulai wajib diisi'
        if (!form.jam_selesai) e.jam_selesai = 'Jam selesai wajib diisi'
        if (!form.kuota || Number(form.kuota) < 1)
            e.kuota = 'Kuota minimal 1'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    /* ─── submit ─────────────────────────────────────────── */
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
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={560}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Jadwal Kelas' : 'Tambah Jadwal Kelas'}</h5>

            <div className="flex flex-col gap-1">
                {/* Kelas */}
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

                {/* Coach */}
                <FormItem
                    label="Coach"
                    asterisk
                    invalid={!!errors.id_karyawan}
                    errorMessage={errors.id_karyawan}
                >
                    <Select<KaryawanOption>
                        placeholder="— Pilih Coach —"
                        options={karyawanOptions}
                        isLoading={loadingDropdowns}
                        value={karyawanOptions.find((o) => o.value === form.id_karyawan) ?? null}
                        onChange={(opt) => setForm((p) => ({ ...p, id_karyawan: (opt as KaryawanOption).value }))}
                    />
                </FormItem>

                {/* Kategori Umur */}
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

                {/* Hari */}
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

                {/* Jam mulai & selesai */}
                <div className="grid grid-cols-2 gap-3">
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

                {/* Kuota */}
                <FormItem
                    label="Kuota"
                    asterisk
                    invalid={!!errors.kuota}
                    errorMessage={errors.kuota}
                    extra={<span className="text-xs text-gray-400">Kuota peserta dalam satu jadwal</span>}
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

                {/* Deskripsi */}
                <FormItem label="Deskripsi">
                    <Input
                        textArea
                        rows={2}
                        placeholder="Catatan tambahan (opsional)"
                        value={form.deskripsi}
                        onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Jadwal">
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </Button>
            </div>
        </Dialog>
    )
}

export default JadwalForm
