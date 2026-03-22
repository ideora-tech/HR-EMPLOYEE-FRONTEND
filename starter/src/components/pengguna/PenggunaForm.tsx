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
import { HiEye, HiEyeOff } from 'react-icons/hi'
import type { IPengguna, IPenggunaCreate, IPenggunaUpdate } from '@/@types/pengguna.types'
import type { IPeran } from '@/@types/peran.types'

type PeranOption = { value: string; label: string }

interface PenggunaFormProps {
    open: boolean
    editData?: IPengguna | null
    submitting?: boolean
    peranList?: IPeran[]
    onClose: () => void
    onSubmit: (payload: IPenggunaCreate | IPenggunaUpdate) => void
}

interface FormState {
    nama: string
    email: string
    kata_sandi: string
    konfirmasi_sandi: string
    peran: string
    aktif: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_STATE: FormState = {
    nama: '',
    email: '',
    kata_sandi: '',
    konfirmasi_sandi: '',
    peran: 'EMPLOYEE',
    aktif: true,
}

const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Minimal 8 karakter'
    if (!/[A-Z]/.test(pwd)) return 'Harus mengandung minimal 1 huruf besar'
    if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Harus mengandung minimal 1 simbol'
    return null
}

const EyeToggle = ({
    show,
    onToggle,
}: {
    show: boolean
    onToggle: () => void
}) => (
    <span
        className="text-gray-400 text-lg cursor-pointer hover:text-gray-600 select-none"
        onClick={onToggle}
    >
        {show ? <HiEyeOff /> : <HiEye />}
    </span>
)

const PenggunaForm = ({
    open,
    editData,
    submitting = false,
    peranList = [],
    onClose,
    onSubmit,
}: PenggunaFormProps) => {
    const peranOptions: PeranOption[] = peranList.map((p) => ({
        value: p.kode_peran,
        label: p.nama,
    }))
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<FormErrors>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nama: editData.nama,
                email: editData.email,
                kata_sandi: '',
                konfirmasi_sandi: '',
                peran: editData.peran,
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
        setShowPassword(false)
        setShowConfirm(false)
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: FormErrors = {}

        if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi'

        if (!form.email.trim()) newErrors.email = 'Email wajib diisi'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = 'Format email tidak valid'

        const passwordFilled = form.kata_sandi.trim().length > 0
        if (!isEdit && !passwordFilled) {
            newErrors.kata_sandi = 'Kata sandi wajib diisi'
        } else if (passwordFilled) {
            const pwdError = validatePassword(form.kata_sandi)
            if (pwdError) newErrors.kata_sandi = pwdError
        }

        if (passwordFilled || !isEdit) {
            if (!form.konfirmasi_sandi.trim())
                newErrors.konfirmasi_sandi = 'Konfirmasi kata sandi wajib diisi'
            else if (form.kata_sandi !== form.konfirmasi_sandi)
                newErrors.konfirmasi_sandi = 'Kata sandi tidak cocok'
        }

        if (!form.peran) newErrors.peran = 'Peran wajib dipilih'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const payload: IPenggunaUpdate = {
                nama: form.nama.trim(),
                email: form.email.trim(),
                peran: form.peran,
                aktif: form.aktif ? 1 : 0,
            }
            if (form.kata_sandi.trim()) {
                payload.kata_sandi = form.kata_sandi.trim()
            }
            onSubmit(payload)
        } else {
            const payload: IPenggunaCreate = {
                nama: form.nama.trim(),
                email: form.email.trim(),
                kata_sandi: form.kata_sandi.trim(),
                peran: form.peran,
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(payload)
        }
    }

    const passwordFilled = form.kata_sandi.trim().length > 0

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={480}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Nama"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="Nama lengkap pengguna"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Email"
                    asterisk
                    invalid={!!errors.email}
                    errorMessage={errors.email}
                >
                    <Input
                        type="email"
                        placeholder="email@perusahaan.com"
                        value={form.email}
                        invalid={!!errors.email}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, email: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label={isEdit ? 'Kata Sandi Baru' : 'Kata Sandi'}
                    asterisk={!isEdit}
                    invalid={!!errors.kata_sandi}
                    errorMessage={errors.kata_sandi}
                    extra={
                        isEdit ? (
                            <span className="text-xs text-gray-400">
                                Kosongkan jika tidak ingin mengganti
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400">
                                Min 8 karakter, huruf besar, dan simbol
                            </span>
                        )
                    }
                >
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={
                            isEdit
                                ? 'Isi untuk mengganti kata sandi'
                                : 'contoh: Passw0rd!'
                        }
                        value={form.kata_sandi}
                        invalid={!!errors.kata_sandi}
                        suffix={
                            <EyeToggle
                                show={showPassword}
                                onToggle={() => setShowPassword((v) => !v)}
                            />
                        }
                        onChange={(e) =>
                            setForm((p) => ({
                                ...p,
                                kata_sandi: e.target.value,
                            }))
                        }
                    />
                </FormItem>

                {(!isEdit || passwordFilled) && (
                    <FormItem
                        label="Konfirmasi Kata Sandi"
                        asterisk={!isEdit}
                        invalid={!!errors.konfirmasi_sandi}
                        errorMessage={errors.konfirmasi_sandi}
                    >
                        <Input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Ulangi kata sandi"
                            value={form.konfirmasi_sandi}
                            invalid={!!errors.konfirmasi_sandi}
                            suffix={
                                <EyeToggle
                                    show={showConfirm}
                                    onToggle={() => setShowConfirm((v) => !v)}
                                />
                            }
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    konfirmasi_sandi: e.target.value,
                                }))
                            }
                        />
                    </FormItem>
                )}

                <FormItem
                    label="Peran"
                    asterisk
                    invalid={!!errors.peran}
                    errorMessage={errors.peran}
                >
                    <Select<PeranOption>
                        options={peranOptions}
                        value={
                            peranOptions.find((o) => o.value === form.peran) ??
                            peranOptions[3]
                        }
                        onChange={(opt) =>
                            setForm((p) => ({
                                ...p,
                                peran: (opt as PeranOption).value,
                            }))
                        }
                    />
                </FormItem>

                <FormItem label="Status Pengguna">
                    <div className="flex items-center gap-3">
                        <Switcher
                            checked={form.aktif}
                            onChange={(val) =>
                                setForm((p) => ({ ...p, aktif: val }))
                            }
                        />
                        <span className="text-sm text-gray-600">
                            {form.aktif
                                ? 'Aktif — dapat login'
                                : 'Nonaktif — tidak dapat login'}
                        </span>
                    </div>
                </FormItem>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button
                    variant="solid"
                    loading={submitting}
                    onClick={handleSubmit}
                >
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                </Button>
            </div>
        </Dialog>
    )
}

export default PenggunaForm
