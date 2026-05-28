'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Select, Switcher } from '@/components/ui'
import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import { formatRupiahInput, parseRupiah } from '@/utils/formatNumber'
import type { ICoachPublic, ICreateCoach, IUpdateCoach } from '@/@types/kursus.types'
import type { ApiPaginatedResponse } from '@/@types/kursus.types'

interface KaryawanOption {
    value: string
    label: string
}

interface FormState {
    id_karyawan: string
    password: string
    tarif_per_sesi: string
    no_rekening: string
    nama_bank: string
    spesialisasi: string
    bio: string
    aktif: boolean
}

const INITIAL: FormState = {
    id_karyawan: '',
    password: '',
    tarif_per_sesi: '',
    no_rekening: '',
    nama_bank: '',
    spesialisasi: '',
    bio: '',
    aktif: true,
}

interface CoachFormProps {
    open: boolean
    editData?: ICoachPublic | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateCoach | IUpdateCoach) => void
}

const CoachForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: CoachFormProps) => {
    const isEdit = !!editData

    const [form, setForm] = useState<FormState>(INITIAL)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const [karyawanOptions, setKaryawanOptions] = useState<KaryawanOption[]>([])
    const [loadingKaryawan, setLoadingKaryawan] = useState(false)

    // Fetch karyawan list for add mode
    useEffect(() => {
        if (!open || isEdit) return

        setLoadingKaryawan(true)
        const url = `${API_ENDPOINTS.KARYAWAN.BASE}?limit=200&aktif=1`
        ApiService.fetchDataWithAxios<ApiPaginatedResponse<{ id_karyawan: string; nama_karyawan: string }>>({
            url,
            method: 'GET',
        })
            .then((res) => {
                const opts = res.data.map((k) => ({
                    value: k.id_karyawan,
                    label: k.nama_karyawan,
                }))
                setKaryawanOptions(opts)
            })
            .catch(() => {
                setKaryawanOptions([])
            })
            .finally(() => setLoadingKaryawan(false))
    }, [open, isEdit])

    // Populate form when editData changes
    useEffect(() => {
        if (editData) {
            setForm({
                id_karyawan: editData.id_karyawan,
                password: '',
                tarif_per_sesi:
                    editData.tarif_per_sesi != null
                        ? String(editData.tarif_per_sesi).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                        : '',
                no_rekening: editData.no_rekening ?? '',
                nama_bank: editData.nama_bank ?? '',
                spesialisasi: editData.spesialisasi ?? '',
                bio: editData.bio ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL)
        }
        setErrors({})
    }, [editData, open])

    const set =
        (key: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((p) => ({ ...p, [key]: e.target.value }))

    const validate = (): boolean => {
        const err: Partial<Record<keyof FormState, string>> = {}
        if (!isEdit) {
            if (!form.id_karyawan) err.id_karyawan = 'Karyawan wajib dipilih'
            if (!form.password.trim()) err.password = 'Password wajib diisi'
            else if (form.password.length < 6) err.password = 'Password minimal 6 karakter'
        }
        setErrors(err)
        return Object.keys(err).length === 0
    }

    const buildPayload = (): ICreateCoach | IUpdateCoach => {
        const tarif = parseRupiah(form.tarif_per_sesi)
        if (!isEdit) {
            const payload: ICreateCoach = {
                id_karyawan: form.id_karyawan,
                password: form.password,
                tarif_per_sesi: tarif > 0 ? tarif : undefined,
                no_rekening: form.no_rekening.trim() || undefined,
                nama_bank: form.nama_bank.trim() || undefined,
                spesialisasi: form.spesialisasi.trim() || undefined,
                bio: form.bio.trim() || undefined,
            }
            return payload
        }

        const payload: IUpdateCoach = {
            tarif_per_sesi: tarif > 0 ? tarif : undefined,
            no_rekening: form.no_rekening.trim() || undefined,
            nama_bank: form.nama_bank.trim() || undefined,
            spesialisasi: form.spesialisasi.trim() || undefined,
            bio: form.bio.trim() || undefined,
            aktif: form.aktif ? 1 : 0,
        }
        return payload
    }

    const handleSubmit = () => {
        if (!validate()) return
        onSubmit(buildPayload())
    }

    const selectedKaryawan =
        karyawanOptions.find((o) => o.value === form.id_karyawan) ?? null

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={560}
        >
            <h5 className="mb-6">{isEdit ? 'Edit Coach' : 'Tambah Coach Baru'}</h5>

            <div className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1">
                {/* ── Tambah: pilih karyawan + password ── */}
                {!isEdit && (
                    <>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                            Akun Coach
                        </p>

                        <FormItem
                            label="Karyawan"
                            asterisk
                            invalid={!!errors.id_karyawan}
                            errorMessage={errors.id_karyawan}
                        >
                            <Select<KaryawanOption>
                                options={karyawanOptions}
                                value={selectedKaryawan}
                                isLoading={loadingKaryawan}
                                placeholder="Pilih karyawan..."
                                onChange={(opt) =>
                                    setForm((p) => ({
                                        ...p,
                                        id_karyawan: (opt as KaryawanOption)?.value ?? '',
                                    }))
                                }
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Karyawan yang sudah menjadi coach tidak ditampilkan
                            </p>
                        </FormItem>

                        <FormItem
                            label="Password"
                            asterisk
                            invalid={!!errors.password}
                            errorMessage={errors.password}
                        >
                            <Input
                                type="password"
                                placeholder="Minimal 6 karakter"
                                value={form.password}
                                invalid={!!errors.password}
                                onChange={set('password')}
                            />
                        </FormItem>
                    </>
                )}

                {/* ── Info Coach ── */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2 mb-1">
                    Informasi Coach
                </p>

                <FormItem label="Tarif per Sesi">
                    <Input
                        prefix={<span className="text-gray-500 font-medium">Rp</span>}
                        placeholder="0"
                        value={form.tarif_per_sesi}
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                tarif_per_sesi: formatRupiahInput(e.target.value),
                            }))
                        }
                    />
                </FormItem>

                <FormItem label="Spesialisasi">
                    <Input
                        placeholder="Contoh: Hip-hop, Ballet, Contemporary..."
                        value={form.spesialisasi}
                        onChange={set('spesialisasi')}
                    />
                </FormItem>

                <FormItem label="Bio">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Deskripsi singkat tentang coach..."
                        value={form.bio}
                        onChange={set('bio')}
                    />
                </FormItem>

                {/* ── Rekening ── */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2 mb-1">
                    Rekening Pembayaran
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Nama Bank">
                        <Input
                            placeholder="BCA, Mandiri, BNI..."
                            value={form.nama_bank}
                            onChange={set('nama_bank')}
                        />
                    </FormItem>
                    <FormItem label="Nomor Rekening">
                        <Input
                            placeholder="1234567890"
                            value={form.no_rekening}
                            onChange={set('no_rekening')}
                        />
                    </FormItem>
                </div>

                {/* ── Edit mode: status toggle ── */}
                {isEdit && (
                    <FormItem label="Status" className="mt-2">
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
                <Button variant="default" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'} loading={submitting} onClick={handleSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Coach'}
                </Button>
            </div>
        </Dialog>
    )
}

export default CoachForm
