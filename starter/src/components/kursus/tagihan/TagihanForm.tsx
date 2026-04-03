'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Button,
    DatePicker,
    Dialog,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import BiayaService from '@/services/kursus/biaya.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import { formatNum } from '@/utils/formatNumber'
import type { ISiswa, IBiaya, IJadwalKelas, ITagihan, ICreateTagihan, IUpdateTagihan } from '@/@types/kursus.types'

/* ─── option types ───────────────────────────────────────── */

type SiswaOption = { value: string; label: string }
type BiayaOption = { value: string; label: string; biaya: IBiaya }
type JadwalOption = { value: string; label: string; jadwal: IJadwalKelas }

const JENIS_LABEL: Record<string, string> = {
    PENDAFTARAN: 'Pendaftaran',
    KELAS: 'Kelas',
    LAINNYA: 'Lainnya',
}

/* ─── helpers ────────────────────────────────────────────── */

const dateToMonth = (date: Date): string => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
}

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
    id_biaya: string
    id_jadwal_kelas: string
    // shared
    periode: string
    total_harga: string
    deskripsi: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_siswa: '',
    id_biaya: '',
    id_jadwal_kelas: '',
    periode: '',
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
    const [periodeDate, setPeriodeDate] = useState<Date | null>(null)

    const [biayaOptions, setBiayaOptions] = useState<BiayaOption[]>([])
    const [loadingBiaya, setLoadingBiaya] = useState(false)
    const [jadwalOptions, setJadwalOptions] = useState<JadwalOption[]>([])
    const [loadingJadwal, setLoadingJadwal] = useState(false)

    const isEdit = !!editData

    const siswaOptions: SiswaOption[] = siswaList.map((s) => ({
        value: s.id_siswa,
        label: s.nama_siswa + (s.telepon ? ` (${s.telepon})` : ''),
    }))

    /* load semua biaya aktif saat dialog dibuka */
    const loadAllBiaya = useCallback(async () => {
        setLoadingBiaya(true)
        try {
            const res = await BiayaService.getAll({ aktif: 1, limit: 500 })
            if (res.success)
                setBiayaOptions(
                    res.data.map((b) => ({
                        value: b.id_biaya,
                        label: `[${JENIS_LABEL[b.jenis_biaya] ?? b.jenis_biaya}] ${b.nama_biaya}${b.nama_kelas ? ` — ${b.nama_kelas}` : ''} (Rp ${formatNum(b.harga_biaya)})`,
                        biaya: b,
                    }))
                )
        } catch {
            setBiayaOptions([])
        } finally {
            setLoadingBiaya(false)
        }
    }, [])

    useEffect(() => {
        if (open) loadAllBiaya()
    }, [open, loadAllBiaya])

    const loadJadwal = useCallback(async (idKelas: string) => {
        if (!idKelas) { setJadwalOptions([]); return }
        setLoadingJadwal(true)
        try {
            const res = await JadwalKelasService.getByKelas(idKelas)
            if (res.success)
                setJadwalOptions(
                    res.data
                        .filter((j) => j.aktif === 1)
                        .map((j) => ({
                            value: j.id_jadwal_kelas,
                            label: `${j.hari}, ${j.jam_mulai}–${j.jam_selesai} · ${j.nama_karyawan} (kuota: ${j.kuota})`,
                            jadwal: j,
                        }))
                )
            else setJadwalOptions([])
        } catch {
            setJadwalOptions([])
        } finally {
            setLoadingJadwal(false)
        }
    }, [])

    /* populate when editing */
    useEffect(() => {
        if (editData) {
            setForm({
                id_siswa: editData.id_siswa,
                id_biaya: editData.id_biaya,
                id_jadwal_kelas: editData.id_jadwal_kelas ?? '',
                periode: editData.periode ?? '',
                total_harga: formatNum(editData.total_harga),
                deskripsi: editData.deskripsi ?? '',
                aktif: editData.aktif === 1,
            })
            if (editData.periode) {
                const [y, m] = editData.periode.split('-').map(Number)
                setPeriodeDate(new Date(y, m - 1, 1))
            } else {
                setPeriodeDate(null)
            }
            if (editData.id_kelas) loadJadwal(editData.id_kelas)
        } else {
            setForm(INITIAL_STATE)
            setPeriodeDate(null)
            setJadwalOptions([])
        }
        setErrors({})
    }, [editData, open, loadJadwal])

    const handleBiayaChange = (opt: BiayaOption) => {
        const b = opt.biaya
        setForm((p) => ({
            ...p,
            id_biaya: b.id_biaya,
            total_harga: formatNum(b.harga_biaya),
            id_jadwal_kelas: '',
        }))
        if (b.id_kelas) {
            loadJadwal(b.id_kelas)
        } else {
            setJadwalOptions([])
        }
    }

    const handleJadwalChange = (opt: JadwalOption) => {
        setForm((p) => ({
            ...p,
            id_jadwal_kelas: opt.jadwal.id_jadwal_kelas,
        }))
    }

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: val }))

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!isEdit) {
            if (!form.id_siswa) e.id_siswa = 'Siswa wajib dipilih'
            if (!form.id_biaya) e.id_biaya = 'Biaya wajib dipilih'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const payload: IUpdateTagihan = {
                periode: periodeDate ? dateToMonth(periodeDate) : undefined,
                total_harga: parseRupiah(form.total_harga) || undefined,
                deskripsi: form.deskripsi || undefined,
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(payload)
        } else {
            const payload: ICreateTagihan = {
                id_siswa: form.id_siswa,
                id_biaya: form.id_biaya,
                id_jadwal_kelas: form.id_jadwal_kelas || undefined,
                periode: periodeDate ? dateToMonth(periodeDate) : undefined,
                total_harga: parseRupiah(form.total_harga) || undefined,
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

                        <FormItem
                            label="Biaya"
                            asterisk
                            invalid={!!errors.id_biaya}
                            errorMessage={errors.id_biaya}
                        >
                            <Select<BiayaOption>
                                placeholder="— Pilih Biaya —"
                                options={biayaOptions}
                                isLoading={loadingBiaya}
                                value={biayaOptions.find((o) => o.value === form.id_biaya) ?? null}
                                onChange={(opt) => handleBiayaChange(opt as BiayaOption)}
                            />
                        </FormItem>

                        {jadwalOptions.length > 0 && (
                            <FormItem label="Jadwal Kelas">
                                <Select<JadwalOption>
                                    placeholder="— Pilih Jadwal —"
                                    options={jadwalOptions}
                                    isLoading={loadingJadwal}
                                    isClearable
                                    value={jadwalOptions.find((o) => o.value === form.id_jadwal_kelas) ?? null}
                                    onChange={(opt) =>
                                        opt
                                            ? handleJadwalChange(opt as JadwalOption)
                                            : setForm((p) => ({ ...p, id_jadwal_kelas: '' }))
                                    }
                                />
                            </FormItem>
                        )}
                    </>
                )}

                {/* ── PERIODE ── */}
                <FormItem label="Periode">
                    <DatePicker
                        placeholder="Pilih bulan & tahun"
                        inputFormat="MMMM YYYY"
                        clearable
                        value={periodeDate}
                        onChange={(date) => setPeriodeDate(date as Date | null)}
                    />
                </FormItem>

                {/* ── TOTAL HARGA ── */}
                <FormItem
                    label="Total Harga"
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
                <Button variant="default" onClick={onClose} disabled={submitting}>
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
