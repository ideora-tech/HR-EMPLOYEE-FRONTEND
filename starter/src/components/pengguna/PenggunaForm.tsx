'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    Button,
    Dialog,
    FormItem,
    Input,
    Select,
    Switcher,
} from '@/components/ui'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import useIzin from '@/utils/hooks/useIzin'
import type { MultiValue } from 'react-select'
import type { IPengguna, IPenggunaCreate, IPenggunaUpdate } from '@/@types/pengguna.types'
import type { IPeran } from '@/@types/peran.types'

type PeranOption = { value: string; label: string; owner: boolean }
export type KaryawanOption = { value: string; label: string }

interface PenggunaFormProps {
    open: boolean
    editData?: IPengguna | null
    submitting?: boolean
    peranList?: IPeran[]
    karyawanOptions?: KaryawanOption[]
    onClose: () => void
    onSubmit: (payload: IPenggunaCreate | IPenggunaUpdate) => void
}

interface FormState {
    nama: string
    /** Username login (web & aplikasi coach); kosong saat tambah = dibuat otomatis dari nama */
    username: string
    kata_sandi: string
    konfirmasi_sandi: string
    id_peran: string[]
    id_karyawan: string
    aktif: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_STATE: FormState = {
    nama: '',
    username: '',
    kata_sandi: '',
    konfirmasi_sandi: '',
    id_peran: [],
    id_karyawan: '',
    aktif: true,
}

const USERNAME_RE = /^[A-Za-z0-9._-]+$/

/** Pratinjau username otomatis dari nama — sama dengan aturan backend (generateUsername). */
const usernameDariNama = (nama: string): string =>
    nama
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9._\-\s]/g, '')
        .trim()
        .replace(/\s+/g, '.')

const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Minimal 8 karakter'
    if (!/[A-Z]/.test(pwd)) return 'Harus mengandung minimal 1 huruf besar'
    if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Harus mengandung minimal 1 simbol'
    return null
}

/** Peran yang sudah dimiliki pengguna; data lama tanpa peran_list dicocokkan lewat kode. */
const peranAwal = (pengguna: IPengguna, peranList: IPeran[]): string[] => {
    if (pengguna.peran_list?.length) return pengguna.peran_list.map((p) => p.id_peran)
    const cocok = peranList.find(
        (p) => p.kode_peran === pengguna.peran && p.company_id === pengguna.id_perusahaan,
    )
    return cocok ? [cocok.id_peran] : []
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
    karyawanOptions = [],
    onClose,
    onSubmit,
}: PenggunaFormProps) => {
    const { superAdmin, isOwner } = useIzin()
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<FormErrors>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const isEdit = !!editData
    // SUPERADMIN hanya membuat akun SUPERADMIN; peran perusahaan dipilih untuk akun milik perusahaan.
    const pakaiPeran = superAdmin ? !!editData?.id_perusahaan : true

    const peranOptions: PeranOption[] = useMemo(
        () =>
            peranList
                .filter((p) => !superAdmin || p.company_id === editData?.id_perusahaan)
                .map((p) => ({
                    value: p.id_peran,
                    label: p.is_sistem === 1 ? `${p.nama_peran} (semua izin)` : p.nama_peran,
                    owner: p.is_sistem === 1,
                })),
        [peranList, superAdmin, editData?.id_perusahaan],
    )

    // Karyawan yang sedang terhubung tetap tampil walau tidak ada di daftar (mis. karyawan nonaktif).
    const opsiKaryawan: KaryawanOption[] = useMemo(() => {
        const idSekarang = editData?.id_karyawan
        if (!idSekarang || karyawanOptions.some((o) => o.value === idSekarang)) return karyawanOptions
        return [{ value: idSekarang, label: editData?.nama_karyawan ?? 'Karyawan terhubung' }, ...karyawanOptions]
    }, [karyawanOptions, editData?.id_karyawan, editData?.nama_karyawan])

    useEffect(() => {
        if (editData) {
            setForm({
                nama: editData.nama_pengguna,
                username: editData.username ?? '',
                kata_sandi: '',
                konfirmasi_sandi: '',
                id_peran: peranAwal(editData, peranList),
                id_karyawan: editData.id_karyawan ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
        setShowPassword(false)
        setShowConfirm(false)
    }, [editData, open, peranList])

    const validate = (): boolean => {
        const newErrors: FormErrors = {}

        if (!form.nama.trim()) newErrors.nama = 'Nama wajib diisi'

        const username = form.username.trim()
        if (isEdit && editData?.username && !username) newErrors.username = 'Username wajib diisi'
        else if (username && username.length < 3) newErrors.username = 'Username minimal 3 karakter'
        else if (username && !USERNAME_RE.test(username))
            newErrors.username = 'Hanya huruf, angka, titik, garis bawah, dan strip (tanpa spasi)'

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

        if (pakaiPeran && form.id_peran.length === 0) newErrors.id_peran = 'Pilih minimal satu peran'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            const payload: IPenggunaUpdate = {
                nama_pengguna: form.nama.trim(),
                aktif: form.aktif ? 1 : 0,
            }
            const username = form.username.trim().toLowerCase()
            if (username && username !== (editData?.username ?? '').toLowerCase()) payload.username = username
            if (pakaiPeran) payload.id_peran = form.id_peran
            // Kirim hanya bila berubah: hubungan lama ke karyawan yang sudah dihapus tidak ikut divalidasi ulang.
            if (!superAdmin && form.id_karyawan !== (editData?.id_karyawan ?? '')) {
                payload.id_karyawan = form.id_karyawan || null
            }
            if (form.kata_sandi.trim()) {
                payload.kata_sandi = form.kata_sandi.trim()
            }
            onSubmit(payload)
        } else {
            const payload: IPenggunaCreate = {
                nama_pengguna: form.nama.trim(),
                kata_sandi: form.kata_sandi.trim(),
                aktif: form.aktif ? 1 : 0,
            }
            if (form.username.trim()) payload.username = form.username.trim().toLowerCase()
            if (superAdmin) payload.peran = 'SUPERADMIN'
            else payload.id_peran = form.id_peran
            if (!superAdmin && form.id_karyawan) payload.id_karyawan = form.id_karyawan
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
                    extra={<span className="text-xs text-gray-400">Nama yang tampil di daftar</span>}
                >
                    <Input
                        placeholder="contoh: Budi Santoso"
                        autoComplete="off"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, nama: e.target.value }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Username Login"
                    asterisk={isEdit && !!editData?.username}
                    invalid={!!errors.username}
                    errorMessage={errors.username}
                    extra={
                        <span className="text-xs text-gray-400">
                            {isEdit ? 'Untuk login web & aplikasi coach' : 'Kosongkan = dibuat dari nama'}
                        </span>
                    }
                >
                    <Input
                        placeholder={
                            !isEdit && form.nama.trim()
                                ? usernameDariNama(form.nama)
                                : 'contoh: budi.santoso'
                        }
                        autoComplete="off"
                        value={form.username}
                        invalid={!!errors.username}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, username: e.target.value.trim().toLowerCase() }))
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
                        // Tanpa ini password manager browser mengisi sandi admin yang login, lalu ikut tersimpan.
                        autoComplete="new-password"
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
                            autoComplete="new-password"
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

                {pakaiPeran ? (
                    <FormItem
                        label="Peran"
                        asterisk
                        invalid={!!errors.id_peran}
                        errorMessage={errors.id_peran}
                        extra={
                            <span className="text-xs text-gray-400">
                                Boleh lebih dari satu; izinnya digabung
                            </span>
                        }
                    >
                        <Select<PeranOption, true>
                            isMulti
                            placeholder="— Pilih Peran —"
                            options={peranOptions}
                            value={peranOptions.filter((o) => form.id_peran.includes(o.value))}
                            // Peran Owner memegang semua izin paket: hanya Owner/SUPERADMIN yang boleh memberikannya.
                            isOptionDisabled={(o) => o.owner && !isOwner && !superAdmin}
                            onChange={(opts) =>
                                setForm((p) => ({
                                    ...p,
                                    id_peran: (opts as MultiValue<PeranOption>).map((o) => o.value),
                                }))
                            }
                        />
                    </FormItem>
                ) : (
                    <p className="text-xs text-gray-500 mb-4">
                        {isEdit
                            ? 'Akun SUPERADMIN tidak memakai peran perusahaan.'
                            : 'Akun baru dibuat sebagai SUPERADMIN (akses seluruh platform).'}
                    </p>
                )}

                {!superAdmin && (
                    <FormItem
                        label="Karyawan"
                        extra={
                            <span className="text-xs text-gray-400">
                                Opsional; wajib bila akun dipakai login aplikasi coach
                            </span>
                        }
                    >
                        <Select<KaryawanOption>
                            isClearable
                            placeholder="— Tidak terhubung ke karyawan —"
                            options={opsiKaryawan}
                            value={opsiKaryawan.find((o) => o.value === form.id_karyawan) ?? null}
                            onChange={(opt) =>
                                setForm((p) => ({ ...p, id_karyawan: (opt as KaryawanOption | null)?.value ?? '' }))
                            }
                        />
                    </FormItem>
                )}

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
                    customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
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
