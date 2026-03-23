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
import type {
    IJadwalKelas,
    ICreateJadwalKelas,
    IUpdateJadwalKelas,
    IProgramPengajaran,
} from '@/@types/kursus.types'

type HariOption = { value: string; label: string }
type ProgramOption = { value: string; label: string }
type InstrukturOption = { value: string; label: string }

const HARI_OPTIONS: HariOption[] = [
    { value: '1', label: 'Senin' },
    { value: '2', label: 'Selasa' },
    { value: '3', label: 'Rabu' },
    { value: '4', label: 'Kamis' },
    { value: '5', label: 'Jumat' },
    { value: '6', label: 'Sabtu' },
    { value: '7', label: 'Minggu' },
]

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
    hari: string
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
    hari: '1',
    jam_mulai: '08:00',
    jam_selesai: '09:00',
    instruktur: '',
    lokasi: '',
    kuota: '20',
    aktif: true,
}

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
        ...programList.map((p) => ({ value: p.id_program, label: `${p.kode_program} — ${p.nama}` })),
    ]

    useEffect(() => {
        if (editData) {
            setForm({
                id_program: editData.id_program,
                nama: editData.nama,
                hari: String(editData.hari),
                jam_mulai: editData.jam_mulai,
                jam_selesai: editData.jam_selesai,
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
        if (!form.jam_mulai) newErrors.jam_mulai = 'Jam mulai wajib diisi'
        if (!form.jam_selesai) newErrors.jam_selesai = 'Jam selesai wajib diisi'
        if (!form.kuota || Number(form.kuota) < 1) newErrors.kuota = 'Kuota minimal 1'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base: ICreateJadwalKelas = {
            id_program: form.id_program,
            nama: form.nama.trim(),
            hari: Number(form.hari) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
            jam_mulai: form.jam_mulai,
            jam_selesai: form.jam_selesai,
            instruktur: form.instruktur.trim() || undefined,
            lokasi: form.lokasi.trim() || undefined,
            kuota: Number(form.kuota),
        }

        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateJadwalKelas)
        } else {
            onSubmit(base)
        }
    }

    const selectedProgram = programOptions.find((o) => o.value === form.id_program) ?? programOptions[0]
    const selectedHari = HARI_OPTIONS.find((o) => o.value === form.hari) ?? HARI_OPTIONS[0]

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={540}
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

                <div className="grid grid-cols-3 gap-3">
                    <FormItem label="Hari" asterisk>
                        <Select<HariOption>
                            options={HARI_OPTIONS}
                            value={selectedHari}
                            onChange={(opt) =>
                                setForm((p) => ({ ...p, hari: (opt as HariOption).value }))
                            }
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

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Instruktur">
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
                                {form.aktif ? 'Aktif — terbuka untuk pendaftaran' : 'Nonaktif — ditutup'}
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
