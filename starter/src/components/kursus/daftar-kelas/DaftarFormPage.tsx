'use client'

import { useState, useEffect } from 'react'
import {
    Button,
    Card,
    FormItem,
    Input,
    Select,
    Spinner,
    Switcher,
} from '@/components/ui'
import { HiArrowLeft } from 'react-icons/hi'
import type {
    IDaftarKelas,
    ICreateDaftarKelas,
    IUpdateDaftarKelas,
    ISiswa,
    IJadwalKelas,
    ITarif,
} from '@/@types/kursus.types'
import SiswaService from '@/services/kursus/siswa.service'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import TarifService from '@/services/kursus/tarif.service'

type StatusOption = { value: '1' | '2' | '3'; label: string }
type SiswaOption = { value: string; label: string }
type JadwalOption = { value: string; label: string; id_program: string }
type TarifOption = { value: string; label: string }

const STATUS_OPTIONS: StatusOption[] = [
    { value: '1', label: 'Aktif' },
    { value: '2', label: 'Selesai' },
    { value: '3', label: 'Berhenti' },
]

const HARI_MAP: Record<number, string> = {
    1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis',
    5: 'Jumat', 6: 'Sabtu', 7: 'Minggu',
}

interface DaftarFormPageProps {
    editData?: IDaftarKelas | null
    submitting?: boolean
    onSubmit: (payload: ICreateDaftarKelas | IUpdateDaftarKelas) => void
    onCancel: () => void
}

interface FormState {
    id_siswa: string
    id_jadwal: string
    tanggal_daftar: string
    id_tarif: string
    status: '1' | '2' | '3'
    catatan: string
    aktif: boolean
}

const today = () => new Date().toISOString().slice(0, 10)

const INITIAL_STATE: FormState = {
    id_siswa: '',
    id_jadwal: '',
    tanggal_daftar: today(),
    id_tarif: '',
    status: '1',
    catatan: '',
    aktif: true,
}

const DaftarFormPage = ({
    editData,
    submitting = false,
    onSubmit,
    onCancel,
}: DaftarFormPageProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const [siswaList, setSiswaList] = useState<ISiswa[]>([])
    const [jadwalList, setJadwalList] = useState<IJadwalKelas[]>([])
    const [tarifList, setTarifList] = useState<ITarif[]>([])
    const [loadingDropdowns, setLoadingDropdowns] = useState(false)
    const [loadingTarif, setLoadingTarif] = useState(false)

    const isEdit = !!editData

    // Load siswa & jadwal untuk mode tambah
    useEffect(() => {
        if (isEdit) return
        setLoadingDropdowns(true)
        Promise.all([
            SiswaService.getAll({ aktif: 1, limit: 500 }),
            JadwalKelasService.getAll({ aktif: 1, limit: 200 }),
        ])
            .then(([siswaRes, jadwalRes]) => {
                if (siswaRes.success) setSiswaList(siswaRes.data)
                if (jadwalRes.success) setJadwalList(jadwalRes.data)
            })
            .catch(() => { })
            .finally(() => setLoadingDropdowns(false))
    }, [isEdit])

    // Isi form saat editData tersedia
    useEffect(() => {
        if (editData) {
            setForm({
                id_siswa: editData.siswa.id_siswa,
                id_jadwal: editData.jadwal.id_jadwal,
                tanggal_daftar: editData.tanggal_daftar,
                id_tarif: editData.tarif?.id_tarif ?? '',
                status: String(editData.status) as '1' | '2' | '3',
                catatan: editData.catatan ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm({ ...INITIAL_STATE, tanggal_daftar: today() })
        }
        setErrors({})
        setTarifList([])
    }, [editData])

    // Load tarif saat jadwal berubah (create) atau saat edit (dari editData)
    useEffect(() => {
        let id_program: string | undefined

        if (isEdit) {
            id_program = editData?.jadwal.program.id_program
        } else {
            id_program = jadwalList.find((j) => j.id_jadwal === form.id_jadwal)?.id_program
        }

        if (!id_program) {
            setTarifList([])
            return
        }

        setLoadingTarif(true)
        TarifService.getByProgram(id_program)
            .then((res) => {
                if (res.success)
                    setTarifList((res.data as ITarif[]).filter((t) => t.aktif === 1))
            })
            .catch(() => setTarifList([]))
            .finally(() => setLoadingTarif(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.id_jadwal, jadwalList, isEdit])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!isEdit && !form.id_siswa) newErrors.id_siswa = 'Siswa wajib dipilih'
        if (!isEdit && !form.id_jadwal) newErrors.id_jadwal = 'Jadwal wajib dipilih'
        if (!isEdit && !form.tanggal_daftar) newErrors.tanggal_daftar = 'Tanggal daftar wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        if (isEdit) {
            onSubmit({
                status: Number(form.status) as 1 | 2 | 3,
                catatan: form.catatan.trim() || undefined,
                id_tarif: form.id_tarif || undefined,
                aktif: form.aktif ? 1 : 0,
            } as IUpdateDaftarKelas)
        } else {
            onSubmit({
                id_siswa: form.id_siswa,
                id_jadwal: form.id_jadwal,
                tanggal_daftar: form.tanggal_daftar,
                id_tarif: form.id_tarif || undefined,
                status: Number(form.status) as 1 | 2 | 3,
                catatan: form.catatan.trim() || undefined,
            } as ICreateDaftarKelas)
        }
    }

    const siswaOptions: SiswaOption[] = [
        { value: '', label: '— Pilih Siswa —' },
        ...siswaList.map((s) => ({
            value: s.id_siswa,
            label: `${s.nama_siswa}${s.telepon ? ` (${s.telepon})` : ''}`,
        })),
    ]

    const jadwalOptions: JadwalOption[] = [
        { value: '', label: '— Pilih Jadwal —', id_program: '' },
        ...jadwalList
            .filter((j) => j.aktif === 1)
            .map((j) => ({
                value: j.id_jadwal,
                label: `${j.nama_jadwal}`,
                id_program: j.id_program,
            })),
    ]

    const tarifOptions: TarifOption[] = [
        { value: '', label: '— Tanpa tarif —' },
        ...tarifList.map((t) => ({
            value: t.id_tarif,
            label: `${t.nama_tarif} (${t.jenis_tarif === 'PAKET' ? `${t.jumlah_pertemuan}x` : 'per sesi'})`,
        })),
    ]

    const selectedSiswa = siswaOptions.find((o) => o.value === form.id_siswa) ?? siswaOptions[0]
    const selectedJadwal = jadwalOptions.find((o) => o.value === form.id_jadwal) ?? jadwalOptions[0]
    const selectedTarif = tarifOptions.find((o) => o.value === form.id_tarif) ?? tarifOptions[0]
    const selectedStatus = STATUS_OPTIONS.find((o) => o.value === form.status) ?? STATUS_OPTIONS[0]

    const tarifHint = loadingTarif
        ? 'Memuat tarif...'
        : !isEdit && !form.id_jadwal
            ? 'Pilih jadwal dulu untuk melihat tarif tersedia'
            : tarifList.length === 0
                ? 'Tidak ada tarif aktif untuk program ini'
                : ''

    if (!isEdit && loadingDropdowns) {
        return (
            <div className="flex justify-center items-center py-24">
                <Spinner size={36} />
            </div>
        )
    }

    return (
        <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
            }}
        >
            {/* Page header */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                >
                    <HiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h3 className="font-bold">
                        {isEdit ? 'Edit Pendaftaran' : 'Daftarkan Siswa ke Kelas'}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {isEdit
                            ? 'Ubah informasi pendaftaran siswa di kelas'
                            : 'Daftarkan siswa ke jadwal kelas yang tersedia'}
                    </p>
                </div>
            </div>

            <Card>
                <div className="flex flex-col gap-1">

                    {/* ── Section: Informasi Pendaftaran ── */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Informasi Pendaftaran</h5>
                        </div>

                        {/* Edit: info card readonly */}
                        {isEdit && (
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                                        {editData?.siswa.nama_siswa}
                                    </p>
                                    {(editData?.siswa.telepon || editData?.siswa.email) && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {editData?.siswa.telepon ?? editData?.siswa.email}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    <p className="font-medium">{editData?.jadwal.nama_jadwal}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {HARI_MAP[editData?.jadwal.hari ?? 1]}{' '}
                                        {editData?.jadwal.jam_mulai}–{editData?.jadwal.jam_selesai}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Terdaftar {editData?.tanggal_daftar}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tambah: siswa + tanggal daftar */}
                        {!isEdit && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <FormItem
                                    label="Siswa"
                                    asterisk
                                    invalid={!!errors.id_siswa}
                                    errorMessage={errors.id_siswa}
                                >
                                    <Select<SiswaOption>
                                        options={siswaOptions}
                                        value={selectedSiswa}
                                        onChange={(opt) =>
                                            setForm((p) => ({
                                                ...p,
                                                id_siswa: (opt as SiswaOption).value,
                                            }))
                                        }
                                    />
                                </FormItem>

                                <FormItem
                                    label="Tanggal Daftar"
                                    asterisk
                                    invalid={!!errors.tanggal_daftar}
                                    errorMessage={errors.tanggal_daftar}
                                >
                                    <Input
                                        type="date"
                                        value={form.tanggal_daftar}
                                        invalid={!!errors.tanggal_daftar}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                tanggal_daftar: e.target.value,
                                            }))
                                        }
                                    />
                                </FormItem>
                            </div>
                        )}
                    </div>

                    <div className="border-t mt-4 mb-0 border-gray-100 dark:border-gray-700" />

                    {/* ── Section: Jadwal & Tarif ── */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Jadwal & Tarif</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {!isEdit && (
                                <FormItem
                                    label="Jadwal Kelas"
                                    asterisk
                                    invalid={!!errors.id_jadwal}
                                    errorMessage={errors.id_jadwal}
                                    extra={
                                        <span className="text-xs text-gray-400">
                                            Hanya jadwal aktif yang ditampilkan
                                        </span>
                                    }
                                >
                                    <Select<JadwalOption>
                                        options={jadwalOptions}
                                        value={selectedJadwal}
                                        onChange={(opt) =>
                                            setForm((p) => ({
                                                ...p,
                                                id_jadwal: (opt as JadwalOption).value,
                                                id_tarif: '',
                                            }))
                                        }
                                    />
                                </FormItem>
                            )}

                            <FormItem
                                label="Tarif"
                                extra={
                                    tarifHint ? (
                                        <span className="text-xs text-gray-400">{tarifHint}</span>
                                    ) : undefined
                                }
                            >
                                <Select<TarifOption>
                                    options={tarifOptions}
                                    value={selectedTarif}
                                    isDisabled={loadingTarif || tarifOptions.length <= 1}
                                    onChange={(opt) =>
                                        setForm((p) => ({
                                            ...p,
                                            id_tarif: (opt as TarifOption).value,
                                        }))
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="border-t mt-4 mb-0 border-gray-100 dark:border-gray-700" />

                    {/* ── Section: Detail Pendaftaran ── */}
                    <div>
                        <div className="mb-3">
                            <h5 className="font-semibold">Detail Pendaftaran</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <FormItem label="Status Pendaftaran">
                                <Select<StatusOption>
                                    options={STATUS_OPTIONS}
                                    value={selectedStatus}
                                    onChange={(opt) =>
                                        setForm((p) => ({
                                            ...p,
                                            status: (opt as StatusOption).value,
                                        }))
                                    }
                                />
                            </FormItem>
                        </div>
                        <div className="mt-4">
                            <FormItem
                                label="Catatan"
                                extra={
                                    <span className="text-xs text-gray-400">
                                        Catatan tambahan mengenai pendaftaran ini (opsional)
                                    </span>
                                }
                            >
                                <Input
                                    textArea
                                    rows={3}
                                    placeholder="contoh: Siswa minta jadwal fleksibel"
                                    value={form.catatan}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, catatan: e.target.value }))
                                    }
                                />
                            </FormItem>
                        </div>
                    </div>

                    {/* ── Section: Status (edit only) ── */}
                    {isEdit && (
                        <>
                            <div className="border-t mt-0 mb-0 border-gray-100 dark:border-gray-700" />

                            <div>
                                <div className="mb-3">
                                    <h5 className="font-semibold">Status</h5>
                                    <p className="text-gray-500 text-sm mt-0.5">
                                        Aktifkan atau nonaktifkan pendaftaran ini
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <Switcher
                                        checked={form.aktif}
                                        onChange={(val) =>
                                            setForm((p) => ({ ...p, aktif: val }))
                                        }
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {form.aktif ? 'Aktif' : 'Nonaktif'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {form.aktif
                                                ? 'Siswa masih aktif terdaftar di kelas ini'
                                                : 'Pendaftaran siswa dinonaktifkan'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            variant="default"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="solid"
                            loading={submitting}
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
                        </Button>
                    </div>
                </div>
            </Card>
        </form>
    )
}

export default DaftarFormPage
