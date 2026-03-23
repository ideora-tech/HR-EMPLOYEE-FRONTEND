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
import KaryawanService from '@/services/karyawan.service'
import type {
    IJadwalKelas,
    ICreateJadwalKelas,
    IUpdateJadwalKelas,
    IProgramPengajaran,
} from '@/@types/kursus.types'

/* ─── option types ───────────────────────────────────────── */

type ProgramOption = { value: string; label: string }
type InstrukturOption = { value: string; label: string }

/* ─── helpers ────────────────────────────────────────────── */

/** "YYYY-MM-DD HH:MM:SS" atau "YYYY-MM-DDTHH:MM:SS" → Date (bagian tanggal saja) */
const isoToDate = (iso: string | null | undefined): Date | null => {
    if (!iso) return null
    const datePart = iso.split(/[T ]/)[0]
    return datePart ? new Date(datePart) : null
}

/** "YYYY-MM-DD HH:MM:SS" atau "YYYY-MM-DDTHH:MM:SS" → "HH:MM" */
const isoToTime = (iso: string | null | undefined): string => {
    if (!iso) return ''
    const sep = iso.includes('T') ? 'T' : ' '
    return iso.split(sep)[1]?.slice(0, 5) ?? ''
}

/** Date → "YYYY-MM-DD" */
const dateToYMD = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
}

/** Date + "HH:MM" → "YYYY-MM-DD HH:MM:00" (untuk PATCH) */
const toDateTime = (d: Date, time: string): string =>
    `${dateToYMD(d)} ${time}:00`

/* ─── props & state ──────────────────────────────────────── */

interface JadwalFormProps {
    open: boolean
    editData?: IJadwalKelas | null
    programList?: IProgramPengajaran[]
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateJadwalKelas | IUpdateJadwalKelas) => void
}

interface FormState {
    id_program: string
    nama: string
    tanggal_mulai: Date | null
    tanggal_selesai: Date | null
    jam_mulai: string
    jam_selesai: string
    instruktur: string
    lokasi: string
    kuota: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_program: '',
    nama: '',
    tanggal_mulai: null,
    tanggal_selesai: null,
    jam_mulai: '08:00',
    jam_selesai: '09:00',
    instruktur: '',
    lokasi: '',
    kuota: '20',
    aktif: true,
}

/* ─── component ──────────────────────────────────────────── */

const JadwalForm = ({
    open,
    editData,
    programList = [],
    submitting = false,
    onClose,
    onSubmit,
}: JadwalFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [instrukturOptions, setInstrukturOptions] = useState<InstrukturOption[]>([
        { value: '', label: '— Tanpa Instruktur —' },
    ])
    const [loadingKaryawan, setLoadingKaryawan] = useState(false)

    const loadKaryawan = useCallback(async () => {
        setLoadingKaryawan(true)
        try {
            const res = await KaryawanService.getAll({ limit: 200, aktif: 1 })
            if (res.success) {
                setInstrukturOptions([
                    { value: '', label: '— Tanpa Instruktur —' },
                    ...res.data.map((k) => ({ value: k.nama, label: k.nama })),
                ])
            }
        } catch {
            // fallback: keep default option
        } finally {
            setLoadingKaryawan(false)
        }
    }, [])

    useEffect(() => {
        if (open) loadKaryawan()
    }, [open, loadKaryawan])

    const isEdit = !!editData

    const programOptions: ProgramOption[] = [
        { value: '', label: '— Pilih Program —' },
        ...programList.map((p) => ({
            value: p.id_program,
            label: `${p.kode_program} — ${p.nama}`,
        })),
    ]

    useEffect(() => {
        if (editData) {
            setForm({
                id_program: editData.id_program,
                nama: editData.nama,
                tanggal_mulai: isoToDate(editData.tanggal_mulai),
                tanggal_selesai: isoToDate(editData.tanggal_selesai),
                jam_mulai: isoToTime(editData.tanggal_mulai) || '08:00',
                jam_selesai: isoToTime(editData.tanggal_selesai) || '09:00',
                instruktur: editData.instruktur ?? '',
                lokasi: editData.lokasi ?? '',
                kuota: String(editData.kuota),
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.id_program) newErrors.id_program = 'Program wajib dipilih'
        if (!form.nama.trim()) newErrors.nama = 'Nama kelas wajib diisi'
        if (!form.tanggal_mulai || !form.tanggal_selesai)
            newErrors.tanggal_mulai = 'Periode jadwal wajib diisi'
        if (!form.jam_mulai) newErrors.jam_mulai = 'Jam mulai wajib diisi'
        if (!form.jam_selesai) newErrors.jam_selesai = 'Jam selesai wajib diisi'
        if (!form.instruktur) newErrors.instruktur = 'Instruktur wajib dipilih'
        if (!form.kuota || Number(form.kuota) < 1) newErrors.kuota = 'Kuota minimal 1'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const updatePayload: IUpdateJadwalKelas = {
                id_program: form.id_program,
                nama: form.nama.trim(),
                tanggal_mulai: toDateTime(form.tanggal_mulai!, form.jam_mulai),
                tanggal_selesai: toDateTime(form.tanggal_selesai!, form.jam_selesai),
                instruktur: form.instruktur.trim() || undefined,
                lokasi: form.lokasi.trim() || undefined,
                kuota: Number(form.kuota),
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(updatePayload)
        } else {
            const createPayload: ICreateJadwalKelas = {
                id_program: form.id_program,
                nama: form.nama.trim(),
                tanggal_mulai: dateToYMD(form.tanggal_mulai!),
                tanggal_selesai: dateToYMD(form.tanggal_selesai!),
                jam_mulai: form.jam_mulai,
                jam_selesai: form.jam_selesai,
                instruktur: form.instruktur.trim() || undefined,
                lokasi: form.lokasi.trim() || undefined,
                kuota: Number(form.kuota),
            }
            onSubmit(createPayload)
        }
    }

    const selectedProgram =
        programOptions.find((o) => o.value === form.id_program) ?? programOptions[0]

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={560}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Jadwal Kelas' : 'Tambah Jadwal Kelas'}</h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Program Pengajaran"
                    asterisk
                    invalid={!!errors.id_program}
                    errorMessage={errors.id_program}
                >
                    <Select<ProgramOption>
                        options={programOptions}
                        value={selectedProgram}
                        onChange={(opt) =>
                            setForm((p) => ({ ...p, id_program: (opt as ProgramOption).value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Kelas"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: Tari Bali Kelas Pagi"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem
                        label="Tanggal Mulai"
                        asterisk
                        invalid={!!errors.tanggal_mulai}
                        errorMessage={errors.tanggal_mulai}
                    >
                        <DatePicker
                            value={form.tanggal_mulai}
                            inputFormat="DD MMM YYYY"
                            placeholder="Pilih tanggal mulai"
                            clearable
                            onChange={(d) =>
                                setForm((p) => ({
                                    ...p,
                                    tanggal_mulai: d,
                                    // auto-isi selesai jika belum dipilih
                                    tanggal_selesai: p.tanggal_selesai ?? d,
                                }))
                            }
                        />
                    </FormItem>
                    <FormItem label="Tanggal Selesai" asterisk>
                        <DatePicker
                            value={form.tanggal_selesai}
                            inputFormat="DD MMM YYYY"
                            placeholder="Pilih tanggal selesai"
                            clearable
                            minDate={form.tanggal_mulai ?? undefined}
                            onChange={(d) =>
                                setForm((p) => ({ ...p, tanggal_selesai: d }))
                            }
                        />
                    </FormItem>
                </div>

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
                            onChange={(e) =>
                                setForm((p) => ({ ...p, jam_mulai: e.target.value }))
                            }
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
                            onChange={(e) =>
                                setForm((p) => ({ ...p, jam_selesai: e.target.value }))
                            }
                        />
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem
                        label="Instruktur"
                        asterisk
                        invalid={!!errors.instruktur}
                        errorMessage={errors.instruktur}
                    >
                        <Select<InstrukturOption>
                            options={instrukturOptions}
                            value={
                                instrukturOptions.find((o) => o.value === form.instruktur) ??
                                instrukturOptions[0]
                            }
                            isLoading={loadingKaryawan}
                            onChange={(opt) =>
                                setForm((p) => ({
                                    ...p,
                                    instruktur: (opt as InstrukturOption).value,
                                }))
                            }
                        />
                    </FormItem>
                    <FormItem label="Lokasi">
                        <Input
                            placeholder="Nama ruangan / lokasi (opsional)"
                            value={form.lokasi}
                            onChange={(e) => setForm((p) => ({ ...p, lokasi: e.target.value }))}
                        />
                    </FormItem>
                </div>

                <FormItem
                    label="Kuota"
                    asterisk
                    invalid={!!errors.kuota}
                    errorMessage={errors.kuota}
                    extra={
                        <span className="text-xs text-gray-400">
                            Jumlah maksimal siswa yang bisa mendaftar
                        </span>
                    }
                >
                    <Input
                        type="number"
                        min={1}
                        placeholder="20"
                        value={form.kuota}
                        invalid={!!errors.kuota}
                        onChange={(e) => setForm((p) => ({ ...p, kuota: e.target.value }))}
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
                                {form.aktif
                                    ? 'Aktif — terbuka untuk pendaftaran'
                                    : 'Nonaktif — ditutup'}
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
