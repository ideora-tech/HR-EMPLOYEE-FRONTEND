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
import type { ISiswa, ITagihan, ICreateTagihan, IUpdateTagihan } from '@/@types/kursus.types'
import { formatNum } from '@/utils/formatNumber'

/* ─── constants ──────────────────────────────────────────── */

type JenisOption = { value: 'PAKET' | 'BULANAN' | 'LAINNYA'; label: string }
type SiswaOption = { value: string; label: string }

const JENIS_OPTIONS: JenisOption[] = [
    { value: 'PAKET', label: 'Paket' },
    { value: 'BULANAN', label: 'Bulanan' },
    { value: 'LAINNYA', label: 'Lainnya' },
]

/* ─── helpers ────────────────────────────────────────────── */

const formatRupiahInput = (raw: string): string => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) return '0'
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
    id_siswa: string
    jenis: 'PAKET' | 'BULANAN' | 'LAINNYA'
    periode: string
    jumlah_sesi: string
    total_harga: string
    catatan: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    id_siswa: '',
    jenis: 'PAKET',
    periode: '',
    jumlah_sesi: '',
    total_harga: '0',
    catatan: '',
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

    const isEdit = !!editData

    const siswaOptions: SiswaOption[] = [
        { value: '', label: '— Pilih Siswa —' },
        ...siswaList.map((s) => ({
            value: s.id_siswa,
            label: s.nama_siswa + (s.telepon ? ` (${s.telepon})` : ''),
        })),
    ]

    useEffect(() => {
        if (editData) {
            setForm({
                id_siswa: editData.siswa.id_siswa,
                jenis: editData.jenis_tagihan,
                periode: editData.periode ?? '',
                jumlah_sesi: editData.jumlah_sesi ? String(editData.jumlah_sesi) : '',
                total_harga: formatNum(editData.total_harga),
                catatan: editData.catatan ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: val }))

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!isEdit && !form.id_siswa) e.id_siswa = 'Siswa wajib dipilih'
        if (parseRupiah(form.total_harga) <= 0) e.total_harga = 'Total harga wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const payload: IUpdateTagihan = {
                jenis_tagihan: form.jenis,
                periode: form.periode || undefined,
                jumlah_sesi: form.jumlah_sesi ? Number(form.jumlah_sesi) : undefined,
                total_harga: parseRupiah(form.total_harga),
                catatan: form.catatan || undefined,
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(payload)
        } else {
            const payload: ICreateTagihan = {
                id_siswa: form.id_siswa,
                jenis_tagihan: form.jenis,
                periode: form.periode || undefined,
                jumlah_sesi: form.jumlah_sesi ? Number(form.jumlah_sesi) : undefined,
                total_harga: parseRupiah(form.total_harga),
                catatan: form.catatan || undefined,
            }
            onSubmit(payload)
        }
    }

    const selectedSiswa = siswaOptions.find((o) => o.value === form.id_siswa) ?? siswaOptions[0]
    const selectedJenis = JENIS_OPTIONS.find((o) => o.value === form.jenis) ?? JENIS_OPTIONS[0]
    const showSesiField = form.jenis === 'PAKET' || form.jenis === 'BULANAN'

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={500}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Tagihan' : 'Buat Tagihan Baru'}</h5>

            <div className="flex flex-col gap-1">
                {/* Siswa — only for create */}
                {!isEdit && (
                    <FormItem
                        label="Siswa"
                        asterisk
                        invalid={!!errors.id_siswa}
                        errorMessage={errors.id_siswa}
                    >
                        <Select<SiswaOption>
                            options={siswaOptions}
                            value={selectedSiswa}
                            onChange={(opt) => set('id_siswa', (opt as SiswaOption).value)}
                        />
                    </FormItem>
                )}

                {/* Jenis */}
                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Jenis Tagihan" asterisk>
                        <Select<JenisOption>
                            options={JENIS_OPTIONS}
                            value={selectedJenis}
                            onChange={(opt) =>
                                setForm((prev) => ({
                                    ...prev,
                                    jenis_tagihan: (opt as JenisOption).value,
                                    jumlah_sesi: '',
                                }))
                            }
                        />
                    </FormItem>

                    {showSesiField && (
                        <FormItem label="Jumlah Sesi">
                            <Input
                                type="number"
                                min={1}
                                placeholder="10"
                                value={form.jumlah_sesi}
                                onChange={(e) => set('jumlah_sesi', e.target.value)}
                            />
                        </FormItem>
                    )}
                </div>

                {/* Periode */}
                <FormItem label="Periode (opsional)">
                    <Input
                        placeholder="Mis. 2026-03 atau Semester Genap 2025/2026"
                        value={form.periode}
                        onChange={(e) => set('periode', e.target.value)}
                    />
                </FormItem>

                {/* Total Harga */}
                <FormItem
                    label="Total Tagihan"
                    asterisk
                    invalid={!!errors.total_harga}
                    errorMessage={errors.total_harga}
                >
                    <Input
                        prefix={<span className="text-gray-500 font-medium">Rp</span>}
                        value={form.total_harga}
                        invalid={!!errors.total_harga}
                        onChange={(e) => set('total_harga', formatRupiahInput(e.target.value))}
                    />
                </FormItem>

                {/* Catatan */}
                <FormItem label="Catatan (opsional)">
                    <Input
                        textArea
                        rows={2}
                        placeholder="Catatan tambahan..."
                        value={form.catatan}
                        onChange={(e) => set('catatan', e.target.value)}
                    />
                </FormItem>

                {/* Status — edit only */}
                {isEdit && (
                    <FormItem label="Status Tagihan">
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
