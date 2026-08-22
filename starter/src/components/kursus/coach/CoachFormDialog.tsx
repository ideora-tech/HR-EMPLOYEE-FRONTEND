'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Select, Switcher } from '@/components/ui'
import { formatRupiahInput, parseRupiah } from '@/utils/formatNumber'
import type { ICoachPublic, ICreateCoach, IUpdateCoach } from '@/@types/kursus.types'

export type KaryawanOption = { value: string; label: string }

interface CoachFormDialogProps {
    open: boolean
    /** null = mode tambah, isi = mode edit */
    editData: ICoachPublic | null
    karyawanOptions: KaryawanOption[]
    submitting: boolean
    onClose: () => void
    onCreate: (payload: ICreateCoach) => void
    onUpdate: (id: string, payload: IUpdateCoach) => void
}

interface FormState {
    id_karyawan: string
    username: string
    password: string
    tarif: string
    nama_bank: string
    no_rekening: string
    spesialisasi: string
    bio: string
    aktif: boolean
}

const EMPTY_FORM: FormState = {
    id_karyawan: '',
    username: '',
    password: '',
    tarif: '',
    nama_bank: '',
    no_rekening: '',
    spesialisasi: '',
    bio: '',
    aktif: true,
}

const USERNAME_RE = /^[a-zA-Z0-9._-]+$/

const CoachFormDialog = ({
    open,
    editData,
    karyawanOptions,
    submitting,
    onClose,
    onCreate,
    onUpdate,
}: CoachFormDialogProps) => {
    const isEdit = !!editData
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    useEffect(() => {
        if (!open) return
        setErrors({})
        if (editData) {
            setForm({
                id_karyawan: editData.id_karyawan,
                username: editData.username ?? '',
                password: '',
                tarif: editData.tarif_per_sesi !== null ? formatRupiahInput(String(editData.tarif_per_sesi)) : '',
                nama_bank: editData.nama_bank ?? '',
                no_rekening: editData.no_rekening ?? '',
                spesialisasi: editData.spesialisasi ?? '',
                bio: editData.bio ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(EMPTY_FORM)
        }
    }, [open, editData])

    const validate = (): boolean => {
        const next: Partial<Record<keyof FormState, string>> = {}

        if (!isEdit && !form.id_karyawan) next.id_karyawan = 'Pilih karyawan yang akan dijadikan coach'

        if (form.username) {
            if (form.username.length < 4) next.username = 'Username minimal 4 karakter'
            else if (!USERNAME_RE.test(form.username)) next.username = 'Hanya huruf, angka, titik, garis bawah, dan strip'
        }

        if (!isEdit && !form.password) next.password = 'Password wajib diisi'
        if (form.password && form.password.length < 6) next.password = 'Password minimal 6 karakter'

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit && editData) {
            const payload: IUpdateCoach = {
                ...(form.username && { username: form.username }),
                ...(form.password && { password: form.password }),
                ...(form.tarif && { tarif_per_sesi: parseRupiah(form.tarif) }),
                ...(form.nama_bank && { nama_bank: form.nama_bank }),
                ...(form.no_rekening && { no_rekening: form.no_rekening }),
                ...(form.spesialisasi && { spesialisasi: form.spesialisasi }),
                ...(form.bio && { bio: form.bio }),
                aktif: form.aktif ? 1 : 0,
            }
            onUpdate(editData.id_coach, payload)
        } else {
            const payload: ICreateCoach = {
                id_karyawan: form.id_karyawan,
                password: form.password,
                ...(form.username && { username: form.username }),
                ...(form.tarif && { tarif_per_sesi: parseRupiah(form.tarif) }),
                ...(form.nama_bank && { nama_bank: form.nama_bank }),
                ...(form.no_rekening && { no_rekening: form.no_rekening }),
                ...(form.spesialisasi && { spesialisasi: form.spesialisasi }),
                ...(form.bio && { bio: form.bio }),
            }
            onCreate(payload)
        }
    }

    return (
        <Dialog isOpen={open} width={520} onClose={onClose} onRequestClose={onClose}>
            <h5 className="mb-6">{isEdit ? 'Edit Coach' : 'Jadikan Coach'}</h5>

            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
                {isEdit ? (
                    <FormItem label="Karyawan">
                        <Input value={editData?.nama_karyawan ?? ''} disabled />
                    </FormItem>
                ) : (
                    <FormItem
                        label="Karyawan"
                        asterisk
                        invalid={!!errors.id_karyawan}
                        errorMessage={errors.id_karyawan}
                    >
                        <Select<KaryawanOption>
                            placeholder="Pilih karyawan"
                            options={karyawanOptions}
                            value={karyawanOptions.find((o) => o.value === form.id_karyawan) ?? null}
                            onChange={(opt) =>
                                setForm((p) => ({ ...p, id_karyawan: (opt as KaryawanOption).value }))
                            }
                        />
                    </FormItem>
                )}

                <FormItem
                    label="Username"
                    invalid={!!errors.username}
                    errorMessage={errors.username}
                    extra={<span className="text-xs text-gray-400">Opsional — bila kosong, coach login pakai nomor telepon</span>}
                >
                    <Input
                        placeholder="mis. coach_yuma"
                        value={form.username}
                        onChange={(e) => setForm((p) => ({ ...p, username: e.target.value.trim() }))}
                    />
                </FormItem>

                <FormItem
                    label={isEdit ? 'Password Baru' : 'Password'}
                    asterisk={!isEdit}
                    invalid={!!errors.password}
                    errorMessage={errors.password}
                    extra={isEdit ? <span className="text-xs text-gray-400">Kosongkan bila password tidak diubah</span> : undefined}
                >
                    <Input
                        type="password"
                        placeholder="Minimal 6 karakter"
                        value={form.password}
                        onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    />
                </FormItem>

                <FormItem label="Tarif per Sesi">
                    <Input
                        prefix={<span className="text-gray-500 font-medium">Rp</span>}
                        placeholder="0"
                        value={form.tarif}
                        onChange={(e) => setForm((p) => ({ ...p, tarif: formatRupiahInput(e.target.value) }))}
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Nama Bank">
                        <Input
                            placeholder="mis. BCA"
                            value={form.nama_bank}
                            onChange={(e) => setForm((p) => ({ ...p, nama_bank: e.target.value }))}
                        />
                    </FormItem>
                    <FormItem label="No. Rekening">
                        <Input
                            placeholder="Nomor rekening"
                            value={form.no_rekening}
                            onChange={(e) => setForm((p) => ({ ...p, no_rekening: e.target.value }))}
                        />
                    </FormItem>
                </div>

                <FormItem label="Spesialisasi">
                    <Input
                        placeholder="mis. Ballet, Hip-hop"
                        value={form.spesialisasi}
                        onChange={(e) => setForm((p) => ({ ...p, spesialisasi: e.target.value }))}
                    />
                </FormItem>

                <FormItem label="Bio">
                    <Input
                        placeholder="Deskripsi singkat coach"
                        value={form.bio}
                        onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    />
                </FormItem>

                {isEdit && (
                    <FormItem label="Status Aktif">
                        <Switcher
                            checked={form.aktif}
                            onChange={(checked) => setForm((p) => ({ ...p, aktif: checked }))}
                        />
                    </FormItem>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Jadikan Coach'}
                </Button>
            </div>
        </Dialog>
    )
}

export default CoachFormDialog
