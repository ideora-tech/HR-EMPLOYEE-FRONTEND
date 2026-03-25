'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    DatePicker,
    Dialog,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import type {
    IKaryawanExit,
    ICreateKaryawanExit,
    IUpdateKaryawanExit,
    JenisExit,
} from '@/@types/karyawan-exit.types'
import type { IKaryawan } from '@/@types/karyawan.types'

/* ─── options ─────────────────────────────────────────────── */

type JenisExitOption = { value: '' | JenisExit; label: string }
const JENIS_EXIT_OPTIONS: JenisExitOption[] = [
    { value: '', label: 'Pilih Jenis Exit' },
    { value: 'RESIGN', label: 'Resign (Pengunduran Diri)' },
    { value: 'TERMINASI', label: 'Terminasi (PHK)' },
    { value: 'PENSIUN', label: 'Pensiun' },
    { value: 'KONTRAK_BERAKHIR', label: 'Kontrak Berakhir' },
    { value: 'KESEPAKATAN_BERSAMA', label: 'Kesepakatan Bersama' },
    { value: 'MENINGGAL_DUNIA', label: 'Meninggal Dunia' },
]

type KaryawanOption = { value: string; label: string }

/* ─── helpers ─────────────────────────────────────────────── */

const dateToStr = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
}

const strToDate = (s: string | null): Date | null =>
    s ? new Date(s) : null

/* ─── types ───────────────────────────────────────────────── */

interface FormState {
    id_karyawan: string
    jenis_exit: '' | JenisExit
    tanggal_pengajuan: Date | null
    hari_kerja_terakhir: Date | null
    tanggal_efektif_keluar: Date | null
    alasan: string
    catatan_internal: string
    dapat_direkrut_kembali: boolean
    catatan_rehire: string
}

const INITIAL: FormState = {
    id_karyawan: '',
    jenis_exit: '',
    tanggal_pengajuan: null,
    hari_kerja_terakhir: null,
    tanggal_efektif_keluar: null,
    alasan: '',
    catatan_internal: '',
    dapat_direkrut_kembali: true,
    catatan_rehire: '',
}

interface KaryawanExitFormProps {
    open: boolean
    editData?: IKaryawanExit | null
    submitting?: boolean
    karyawanList: IKaryawan[]
    onClose: () => void
    onSubmit: (
        payload: ICreateKaryawanExit | IUpdateKaryawanExit,
    ) => void
}

/* ─── component ───────────────────────────────────────────── */

const KaryawanExitForm = ({
    open,
    editData,
    submitting = false,
    karyawanList,
    onClose,
    onSubmit,
}: KaryawanExitFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL)
    const [errors, setErrors] = useState<
        Partial<Record<keyof FormState, string>>
    >({})

    const isEdit = !!editData

    const karyawanOptions: KaryawanOption[] = [
        { value: '', label: 'Pilih Karyawan' },
        ...karyawanList.map((k) => ({
            value: k.id_karyawan,
            label: k.nik ? `${k.nik} — ${k.nama}` : k.nama,
        })),
    ]

    useEffect(() => {
        if (editData) {
            setForm({
                id_karyawan: editData.id_karyawan,
                jenis_exit: editData.jenis_exit,
                tanggal_pengajuan: strToDate(editData.tanggal_pengajuan),
                hari_kerja_terakhir: strToDate(editData.hari_kerja_terakhir),
                tanggal_efektif_keluar: strToDate(
                    editData.tanggal_efektif_keluar,
                ),
                alasan: editData.alasan ?? '',
                catatan_internal: editData.catatan_internal ?? '',
                dapat_direkrut_kembali:
                    editData.dapat_direkrut_kembali === 1,
                catatan_rehire: editData.catatan_rehire ?? '',
            })
        } else {
            setForm(INITIAL)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const e: Partial<Record<keyof FormState, string>> = {}
        if (!form.id_karyawan) e.id_karyawan = 'Karyawan wajib dipilih'
        if (!form.jenis_exit) e.jenis_exit = 'Jenis exit wajib dipilih'
        if (!form.tanggal_pengajuan)
            e.tanggal_pengajuan = 'Tanggal pengajuan wajib diisi'
        if (!form.hari_kerja_terakhir)
            e.hari_kerja_terakhir = 'Hari kerja terakhir wajib diisi'
        if (!form.tanggal_efektif_keluar)
            e.tanggal_efektif_keluar = 'Tanggal efektif keluar wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const payload: IUpdateKaryawanExit = {
                jenis_exit: form.jenis_exit as JenisExit,
                tanggal_pengajuan: dateToStr(form.tanggal_pengajuan!),
                hari_kerja_terakhir: dateToStr(form.hari_kerja_terakhir!),
                tanggal_efektif_keluar: dateToStr(
                    form.tanggal_efektif_keluar!,
                ),
                alasan: form.alasan.trim() || undefined,
                catatan_internal: form.catatan_internal.trim() || undefined,
                dapat_direkrut_kembali: form.dapat_direkrut_kembali ? 1 : 0,
                catatan_rehire: form.catatan_rehire.trim() || undefined,
            }
            onSubmit(payload)
        } else {
            const payload: ICreateKaryawanExit = {
                id_karyawan: form.id_karyawan,
                jenis_exit: form.jenis_exit as JenisExit,
                tanggal_pengajuan: dateToStr(form.tanggal_pengajuan!),
                hari_kerja_terakhir: dateToStr(form.hari_kerja_terakhir!),
                tanggal_efektif_keluar: dateToStr(
                    form.tanggal_efektif_keluar!,
                ),
                alasan: form.alasan.trim() || undefined,
                catatan_internal: form.catatan_internal.trim() || undefined,
                dapat_direkrut_kembali: form.dapat_direkrut_kembali ? 1 : 0,
                catatan_rehire: form.catatan_rehire.trim() || undefined,
            }
            onSubmit(payload)
        }
    }

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm((p) => ({ ...p, [k]: v }))

    const selectedKaryawan =
        karyawanOptions.find((o) => o.value === form.id_karyawan) ??
        karyawanOptions[0]
    const selectedJenis =
        JENIS_EXIT_OPTIONS.find((o) => o.value === form.jenis_exit) ??
        JENIS_EXIT_OPTIONS[0]

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={560}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Data Exit Karyawan' : 'Catat Exit Karyawan'}
            </h5>

            <div className="flex flex-col gap-1">
                {/* ── Karyawan ── */}
                <FormItem
                    label="Karyawan"
                    asterisk
                    invalid={!!errors.id_karyawan}
                    errorMessage={errors.id_karyawan}
                >
                    {isEdit ? (
                        <Input
                            value={
                                editData?.karyawan
                                    ? editData.karyawan.nik
                                        ? `${editData.karyawan.nik} — ${editData.karyawan.nama}`
                                        : editData.karyawan.nama
                                    : ''
                            }
                            disabled
                            readOnly
                        />
                    ) : (
                        <Select<KaryawanOption>
                            options={karyawanOptions}
                            value={selectedKaryawan}
                            onChange={(opt) =>
                                set(
                                    'id_karyawan',
                                    (opt as KaryawanOption).value,
                                )
                            }
                        />
                    )}
                </FormItem>

                {/* ── Jenis Exit ── */}
                <FormItem
                    label="Jenis Exit"
                    asterisk
                    invalid={!!errors.jenis_exit}
                    errorMessage={errors.jenis_exit}
                >
                    <Select<JenisExitOption>
                        options={JENIS_EXIT_OPTIONS}
                        value={selectedJenis}
                        onChange={(opt) =>
                            set('jenis_exit', (opt as JenisExitOption).value)
                        }
                    />
                </FormItem>

                {/* ── Tanggal ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormItem
                        label="Tanggal Pengajuan"
                        asterisk
                        invalid={!!errors.tanggal_pengajuan}
                        errorMessage={errors.tanggal_pengajuan}
                    >
                        <DatePicker
                            value={form.tanggal_pengajuan}
                            inputFormat="DD MMMM YYYY"
                            placeholder="Pilih tanggal"
                            clearable
                            onChange={(d) => set('tanggal_pengajuan', d)}
                        />
                    </FormItem>

                    <FormItem
                        label="Hari Kerja Terakhir"
                        asterisk
                        invalid={!!errors.hari_kerja_terakhir}
                        errorMessage={errors.hari_kerja_terakhir}
                    >
                        <DatePicker
                            value={form.hari_kerja_terakhir}
                            inputFormat="DD MMMM YYYY"
                            placeholder="Pilih tanggal"
                            clearable
                            onChange={(d) => set('hari_kerja_terakhir', d)}
                        />
                    </FormItem>

                    <FormItem
                        label="Tanggal Efektif Keluar"
                        asterisk
                        invalid={!!errors.tanggal_efektif_keluar}
                        errorMessage={errors.tanggal_efektif_keluar}
                        className="sm:col-span-2"
                    >
                        <DatePicker
                            value={form.tanggal_efektif_keluar}
                            inputFormat="DD MMMM YYYY"
                            placeholder="Pilih tanggal"
                            clearable
                            onChange={(d) =>
                                set('tanggal_efektif_keluar', d)
                            }
                        />
                    </FormItem>
                </div>

                {/* ── Alasan ── */}
                <FormItem label="Alasan Exit">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Tulis alasan exit karyawan..."
                        value={form.alasan}
                        onChange={(e) => set('alasan', e.target.value)}
                    />
                </FormItem>

                {/* ── Catatan Internal ── */}
                <FormItem
                    label="Catatan Internal"
                    extra={
                        <span className="text-xs text-gray-400">
                            Tidak ditampilkan ke karyawan
                        </span>
                    }
                >
                    <Input
                        textArea
                        rows={2}
                        placeholder="Catatan untuk tim HR..."
                        value={form.catatan_internal}
                        onChange={(e) =>
                            set('catatan_internal', e.target.value)
                        }
                    />
                </FormItem>

                {/* ── Rehire ── */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <Switcher
                        checked={form.dapat_direkrut_kembali}
                        onChange={(v) =>
                            set('dapat_direkrut_kembali', v)
                        }
                    />
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Dapat Direkrut Kembali (Rehire)
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {form.dapat_direkrut_kembali
                                ? 'Karyawan ini eligible untuk direkrut kembali'
                                : 'Karyawan ini tidak eligible untuk rehire'}
                        </p>
                    </div>
                </div>

                {/* ── Catatan Rehire ── */}
                <FormItem label="Catatan Rehire">
                    <Input
                        textArea
                        rows={2}
                        placeholder="Catatan terkait eligibilitas rehire..."
                        value={form.catatan_rehire}
                        onChange={(e) =>
                            set('catatan_rehire', e.target.value)
                        }
                    />
                </FormItem>

                {/* ── Actions ── */}
                <div className="flex items-center justify-end gap-3 mt-4">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="solid"
                        loading={submitting}
                        onClick={handleSubmit}
                    >
                        {isEdit ? 'Simpan Perubahan' : 'Catat Exit'}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default KaryawanExitForm
