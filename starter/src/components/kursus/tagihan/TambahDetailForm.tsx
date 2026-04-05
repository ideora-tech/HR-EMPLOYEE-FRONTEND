'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, DatePicker, Dialog, FormItem, Input, Select, Notification, toast } from '@/components/ui'
import BiayaService from '@/services/kursus/biaya.service'
import TagihanService from '@/services/kursus/tagihan.service'
import { formatNum, formatRupiahInput, parseRupiah } from '@/utils/formatNumber'
import { parseApiError } from '@/utils/parseApiError'
import type { IBiaya, ITagihan } from '@/@types/kursus.types'

/* ─── option types ───────────────────────────────────────── */

type BiayaOption = { value: string; label: string; biaya: IBiaya }

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


/* ─── props ──────────────────────────────────────────────── */

interface TambahDetailFormProps {
    open: boolean
    tagihan: ITagihan | null
    onClose: () => void
    onSaved: (updated: ITagihan) => void
}

interface FormState {
    id_biaya: string
    periode: string
    harga_akhir: string
}

const INITIAL_STATE: FormState = {
    id_biaya: '',
    periode: '',
    harga_akhir: '',
}

/* ─── component ──────────────────────────────────────────── */

const TambahDetailForm = ({ open, tagihan, onClose, onSaved }: TambahDetailFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [periodeDate, setPeriodeDate] = useState<Date | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const [biayaOptions, setBiayaOptions] = useState<BiayaOption[]>([])
    const [loadingBiaya, setLoadingBiaya] = useState(false)

    const loadBiaya = useCallback(async () => {
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
        if (open) {
            const now = new Date()
            const periodeNow = dateToMonth(now)
            setForm({ ...INITIAL_STATE, periode: periodeNow })
            setErrors({})
            setPeriodeDate(now)
            loadBiaya()
        }
    }, [open, loadBiaya])

    const validate = (): boolean => {
        const next: Partial<Record<keyof FormState, string>> = {}
        if (!form.id_biaya) next.id_biaya = 'Pilih biaya'
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async () => {
        if (!tagihan || !validate()) return
        setSubmitting(true)
        try {
            const res = await TagihanService.addDetail(tagihan.id_tagihan, {
                id_biaya: form.id_biaya,
                ...(form.periode ? { periode: form.periode } : {}),
                ...(form.harga_akhir ? { harga_akhir: parseRupiah(form.harga_akhir) } : {}),
            })
            if (res.success) {
                toast.push(<Notification type="success" title="Baris biaya berhasil ditambahkan" />)
                onSaved(res.data)
                onClose()
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal menambah biaya">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={460}>
            <h5 className="mb-6">Tambah Baris Biaya</h5>
            <div className="flex flex-col gap-4">
                {/* Biaya */}
                <FormItem
                    label="Biaya"
                    asterisk
                    invalid={!!errors.id_biaya}
                    errorMessage={errors.id_biaya}
                >
                    <Select
                        placeholder={loadingBiaya ? 'Memuat...' : 'Pilih jenis biaya'}
                        isDisabled={loadingBiaya}
                        options={biayaOptions}
                        value={biayaOptions.find((o) => o.value === form.id_biaya) ?? null}
                        onChange={(opt) => {
                            const selected = opt as BiayaOption | null
                            setForm((p) => ({
                                ...p,
                                id_biaya: selected?.value ?? '',
                                harga_akhir: selected ? formatNum(selected.biaya.harga_biaya) : '',
                            }))
                        }}
                    />
                </FormItem>

                {/* Periode (opsional) */}
                <FormItem label="Periode (opsional)">
                    <DatePicker
                        placeholder="Pilih bulan"
                        value={periodeDate}
                        inputFormat="MMM YYYY"
                        clearable
                        onChange={(date) => {
                            setPeriodeDate(date)
                            setForm((p) => ({
                                ...p,
                                periode: date ? dateToMonth(date) : '',
                            }))
                        }}
                    />
                </FormItem>

                {/* Override harga (opsional) */}
                <FormItem label="Override Harga (opsional)">
                    <Input
                        prefix={<span className="text-gray-500 font-medium">Rp</span>}
                        placeholder="Kosongkan untuk pakai harga biaya"
                        value={form.harga_akhir}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                harga_akhir: formatRupiahInput(e.target.value),
                            }))
                        }
                    />
                </FormItem>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button type="button" variant="solid" loading={submitting} onClick={handleSubmit}>
                    Tambah
                </Button>
            </div>
        </Dialog>
    )
}

export default TambahDetailForm
