'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import type { ITarif, ICreateTarif, IUpdateTarif, IProgramPengajaran } from '@/@types/kursus.types'
import { formatNum } from '@/utils/formatNumber'

type JenisOption = { value: 'PER_SESI' | 'PAKET'; label: string }
type ProgramOption = { value: string; label: string }

const JENIS_OPTIONS: JenisOption[] = [
    { value: 'PER_SESI', label: 'Per Sesi' },
    { value: 'PAKET', label: 'Paket' },
]

const formatRupiahInput = (raw: string): string => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return '0'
    return formatNum(Number(digits))
}

const parseRupiah = (formatted: string): number =>
    Number(formatted.replace(/\./g, '')) || 0

interface TarifFormProps {
    open: boolean
    editData?: ITarif | null
    programList?: IProgramPengajaran[]
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateTarif | IUpdateTarif) => void
}

interface FormState {
    id_program: string
    nama_tarif: string
    jenis_tarif: 'PER_SESI' | 'PAKET'
    harga: string
    jumlah_pertemuan: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_program: '',
    nama_tarif: '',
    jenis_tarif: 'PER_SESI',
    harga: '0',
    jumlah_pertemuan: '',
    aktif: true,
}

const TarifForm = ({
    open,
    editData,
    programList = [],
    submitting = false,
    onClose,
    onSubmit,
}: TarifFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    const programOptions: ProgramOption[] = [
        { value: '', label: '— Pilih Program —' },
        ...programList.map((p) => ({ value: p.id_program, label: `${p.kode_program} — ${p.nama_program}` })),
    ]

    useEffect(() => {
        if (editData) {
            setForm({
                id_program: editData.id_program,
                nama_tarif: editData.nama_tarif,
                jenis_tarif: editData.jenis_tarif,
                harga: formatNum(parseFloat(editData.harga)),
                jumlah_pertemuan: editData.jumlah_pertemuan ? String(editData.jumlah_pertemuan) : '',
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
        if (!form.nama_tarif.trim()) newErrors.nama_tarif = 'Nama tarif wajib diisi'
        if (parseRupiah(form.harga) <= 0) newErrors.harga = 'Harga wajib diisi (min. 1)'
        if (form.jenis_tarif === 'PAKET' && (!form.jumlah_pertemuan || Number(form.jumlah_pertemuan) < 1))
            newErrors.jumlah_pertemuan = 'Jumlah pertemuan wajib diisi untuk jenis Paket'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base: ICreateTarif = {
            id_program: form.id_program,
            nama_tarif: form.nama_tarif.trim(),
            jenis_tarif: form.jenis_tarif,
            harga: parseRupiah(form.harga),
            jumlah_pertemuan: form.jenis_tarif === 'PAKET' ? Number(form.jumlah_pertemuan) : undefined,
        }

        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateTarif)
        } else {
            onSubmit(base)
        }
    }

    const selectedProgram = programOptions.find((o) => o.value === form.id_program) ?? programOptions[0]
    const selectedJenis = JENIS_OPTIONS.find((o) => o.value === form.jenis_tarif) ?? JENIS_OPTIONS[0]

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={500}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Tarif' : 'Tambah Tarif Baru'}</h5>

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
                    label="Nama Tarif"
                    asterisk
                    invalid={!!errors.nama_tarif}
                    errorMessage={errors.nama_tarif}
                >
                    <Input
                        placeholder="contoh: Paket 10 Sesi, Per Sesi Reguler"
                        value={form.nama_tarif}
                        invalid={!!errors.nama_tarif}
                        onChange={(e) => setForm((p) => ({ ...p, nama_tarif: e.target.value }))}
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Jenis Tarif" asterisk>
                        <Select<JenisOption>
                            options={JENIS_OPTIONS}
                            value={selectedJenis}
                            onChange={(opt) =>
                                setForm((p) => ({
                                    ...p,
                                    jenis_tarif: (opt as JenisOption).value,
                                    jumlah_pertemuan: '',
                                }))
                            }
                        />
                    </FormItem>

                    {form.jenis_tarif === 'PAKET' && (
                        <FormItem
                            label="Jumlah Pertemuan"
                            asterisk
                            invalid={!!errors.jumlah_pertemuan}
                            errorMessage={errors.jumlah_pertemuan}
                        >
                            <Input
                                type="number"
                                min={1}
                                placeholder="10"
                                value={form.jumlah_pertemuan}
                                invalid={!!errors.jumlah_pertemuan}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, jumlah_pertemuan: e.target.value }))
                                }
                            />
                        </FormItem>
                    )}
                </div>

                <FormItem
                    label="Harga"
                    asterisk
                    invalid={!!errors.harga}
                    errorMessage={errors.harga}
                >
                    <Input
                        prefix={<span className="text-gray-500 font-medium">Rp</span>}
                        value={form.harga}
                        invalid={!!errors.harga}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, harga: formatRupiahInput(e.target.value) }))
                        }
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Tarif">
                        <div className="flex items-center gap-3">
                            <Switcher
                                checked={form.aktif}
                                onChange={(val) => setForm((p) => ({ ...p, aktif: val }))}
                            />
                            <span className="text-sm text-gray-600">
                                {form.aktif ? 'Aktif — tersedia untuk pendaftaran' : 'Nonaktif'}
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
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Tarif'}
                </Button>
            </div>
        </Dialog>
    )
}

export default TarifForm
