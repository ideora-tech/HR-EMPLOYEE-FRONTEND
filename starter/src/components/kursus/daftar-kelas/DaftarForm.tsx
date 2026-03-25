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
import type {
    IDaftarKelas,
    ICreateDaftarKelas,
    IUpdateDaftarKelas,
    ISiswa,
    IJadwalKelas,
    ITarif,
} from '@/@types/kursus.types'
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

const hariFromISO = (iso: string): number => {
    const clean = iso.includes('T') ? iso : iso.replace(' ', 'T')
    const d = new Date(clean)
    const day = d.getDay()
    return day === 0 ? 7 : day
}

const timeFromISO = (iso: string): string =>
    iso.includes('T') ? iso.slice(11, 16) : iso.slice(11, 16)

interface DaftarFormProps {
    open: boolean
    editData?: IDaftarKelas | null
    siswaList?: ISiswa[]
    jadwalList?: IJadwalKelas[]
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateDaftarKelas | IUpdateDaftarKelas) => void
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

const DaftarForm = ({
    open,
    editData,
    siswaList = [],
    jadwalList = [],
    submitting = false,
    onClose,
    onSubmit,
}: DaftarFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [tarifList, setTarifList] = useState<ITarif[]>([])
    const [loadingTarif, setLoadingTarif] = useState(false)

    const isEdit = !!editData

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
                label: `${j.nama_jadwal} — ${HARI_MAP[hariFromISO(j.tanggal_mulai)]} ${timeFromISO(j.tanggal_mulai)}–${timeFromISO(j.tanggal_selesai)}`,
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

    // Load tarif when jadwal changes
    useEffect(() => {
        const selectedJadwal = jadwalList.find((j) => j.id_jadwal === form.id_jadwal)
        if (!selectedJadwal) {
            setTarifList([])
            return
        }
        setLoadingTarif(true)
        TarifService.getByProgram(selectedJadwal.id_program)
            .then((res) => {
                if (res.success) setTarifList((res.data as ITarif[]).filter((t) => t.aktif === 1))
            })
            .catch(() => setTarifList([]))
            .finally(() => setLoadingTarif(false))
    }, [form.id_jadwal, jadwalList])

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
    }, [editData, open])

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
            const payload: IUpdateDaftarKelas = {
                status: Number(form.status) as 1 | 2 | 3,
                catatan: form.catatan.trim() || undefined,
                id_tarif: form.id_tarif || undefined,
                aktif: form.aktif ? 1 : 0,
            }
            onSubmit(payload)
        } else {
            const payload: ICreateDaftarKelas = {
                id_siswa: form.id_siswa,
                id_jadwal: form.id_jadwal,
                tanggal_daftar: form.tanggal_daftar,
                id_tarif: form.id_tarif || undefined,
                status: Number(form.status) as 1 | 2 | 3,
                catatan: form.catatan.trim() || undefined,
            }
            onSubmit(payload)
        }
    }

    const selectedSiswa = siswaOptions.find((o) => o.value === form.id_siswa) ?? siswaOptions[0]
    const selectedJadwal = jadwalOptions.find((o) => o.value === form.id_jadwal) ?? jadwalOptions[0]
    const selectedTarif = tarifOptions.find((o) => o.value === form.id_tarif) ?? tarifOptions[0]
    const selectedStatus = STATUS_OPTIONS.find((o) => o.value === form.status) ?? STATUS_OPTIONS[0]

    const tarifHint = loadingTarif
        ? 'Memuat tarif...'
        : !form.id_jadwal
            ? 'Pilih jadwal dulu untuk melihat tarif tersedia'
            : tarifList.length === 0
                ? 'Tidak ada tarif aktif untuk program ini'
                : ''

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={560}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Pendaftaran' : 'Daftarkan Siswa ke Kelas'}
            </h5>

            <div className="flex flex-col gap-1">

                {/* ── Tambah: pilih siswa & jadwal ── */}
                {!isEdit && (
                    <>
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
                                    setForm((p) => ({ ...p, id_siswa: (opt as SiswaOption).value }))
                                }
                            />
                        </FormItem>

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
                    </>
                )}

                {/* ── Edit: info card siswa & jadwal ── */}
                {isEdit && (
                    <div className="mb-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                            {editData?.siswa.nama_siswa}
                        </p>
                        <p className="text-gray-500 mt-0.5">
                            {editData?.jadwal.nama_jadwal} &middot;{' '}
                            {HARI_MAP[editData?.jadwal.hari ?? 1]}{' '}
                            {editData?.jadwal.jam_mulai}–{editData?.jadwal.jam_selesai}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            Terdaftar sejak {editData?.tanggal_daftar}
                        </p>
                    </div>
                )}

                {/* ── Tambah: tanggal daftar + status (grid) ── */}
                {!isEdit && (
                    <div className="grid grid-cols-2 gap-3">
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
                                    setForm((p) => ({ ...p, tanggal_daftar: e.target.value }))
                                }
                            />
                        </FormItem>

                        <FormItem label="Status Pendaftaran">
                            <Select<StatusOption>
                                options={STATUS_OPTIONS}
                                value={selectedStatus}
                                onChange={(opt) =>
                                    setForm((p) => ({ ...p, status: (opt as StatusOption).value }))
                                }
                            />
                        </FormItem>
                    </div>
                )}

                {/* ── Edit: status (full width) ── */}
                {isEdit && (
                    <FormItem label="Status Pendaftaran">
                        <Select<StatusOption>
                            options={STATUS_OPTIONS}
                            value={selectedStatus}
                            onChange={(opt) =>
                                setForm((p) => ({ ...p, status: (opt as StatusOption).value }))
                            }
                        />
                    </FormItem>
                )}

                {/* ── Tarif ── */}
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
                            setForm((p) => ({ ...p, id_tarif: (opt as TarifOption).value }))
                        }
                    />
                </FormItem>

                {/* ── Catatan ── */}
                <FormItem label="Catatan">
                    <Input
                        textArea
                        rows={3}
                        placeholder="Catatan tambahan (opsional)"
                        value={form.catatan}
                        onChange={(e) => setForm((p) => ({ ...p, catatan: e.target.value }))}
                    />
                </FormItem>

                {/* ── Status aktif (edit only) ── */}
                {isEdit && (
                    <FormItem label="Status Aktif">
                        <div className="flex items-center gap-3">
                            <Switcher
                                checked={form.aktif}
                                onChange={(val) => setForm((p) => ({ ...p, aktif: val }))}
                            />
                            <span className="text-sm text-gray-600">
                                {form.aktif
                                    ? 'Aktif — siswa masih terdaftar di kelas ini'
                                    : 'Nonaktif — pendaftaran dinonaktifkan'}
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
                    {isEdit ? 'Simpan Perubahan' : 'Daftarkan'}
                </Button>
            </div>
        </Dialog>
    )
}

export default DaftarForm
