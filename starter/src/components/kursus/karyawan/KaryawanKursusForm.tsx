'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Select } from '@/components/ui'
import ApiService from '@/services/ApiService'
import { API_ENDPOINTS } from '@/constants/api.constant'
import { formatRupiahInput, parseRupiah } from '@/utils/formatNumber'
import type { IKaryawan, ICreateKaryawan, IUpdateKaryawan } from '@/@types/karyawan.types'
import type { IJabatan } from '@/@types/organisasi.types'
import type { ApiPaginatedResponse } from '@/@types/karyawan.types'

type JenisKelaminOption = { value: '' | '1' | '2'; label: string }
type StatusKepegawaianOption = { value: string; label: string }
type StatusPajakOption = { value: string; label: string }
type JabatanOption = { value: string; label: string }

const JENIS_KELAMIN_OPTIONS: JenisKelaminOption[] = [
    { value: '', label: 'Pilih jenis kelamin' },
    { value: '1', label: 'Laki-laki' },
    { value: '2', label: 'Perempuan' },
]

const STATUS_KEPEGAWAIAN_OPTIONS: StatusKepegawaianOption[] = [
    { value: '', label: 'Pilih status kepegawaian' },
    { value: 'TETAP', label: 'Tetap' },
    { value: 'KONTRAK', label: 'Kontrak' },
    { value: 'PROBASI', label: 'Probasi' },
    { value: 'MAGANG', label: 'Magang' },
]

const STATUS_PAJAK_OPTIONS: StatusPajakOption[] = [
    { value: '', label: 'Pilih status pajak' },
    ...['TK/0','TK/1','TK/2','TK/3','K/0','K/1','K/2','K/3','K/I/0','K/I/1','K/I/2','K/I/3']
        .map((v) => ({ value: v, label: v })),
]

interface FormState {
    nama_karyawan: string
    nik: string
    email: string
    telepon: string
    jenis_kelamin: '' | '1' | '2'
    tanggal_lahir: string
    id_jabatan: string
    status_kepegawaian: string
    tanggal_masuk: string
    gaji_pokok: string
    nama_bank: string
    no_rekening: string
    nama_pemilik_rekening: string
    npwp: string
    status_pajak: string
    no_bpjs_kesehatan: string
    no_bpjs_ketenagakerjaan: string
}

const INITIAL: FormState = {
    nama_karyawan: '',
    nik: '',
    email: '',
    telepon: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    id_jabatan: '',
    status_kepegawaian: '',
    tanggal_masuk: '',
    gaji_pokok: '',
    nama_bank: '',
    no_rekening: '',
    nama_pemilik_rekening: '',
    npwp: '',
    status_pajak: '',
    no_bpjs_kesehatan: '',
    no_bpjs_ketenagakerjaan: '',
}

interface KaryawanKursusFormProps {
    open: boolean
    editData?: IKaryawan | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateKaryawan | IUpdateKaryawan) => void
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="text-xs font-bold uppercase tracking-wider text-indigo-500 pb-2 mb-3 border-b border-indigo-100 dark:border-indigo-900">
        {children}
    </div>
)

const KaryawanKursusForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: KaryawanKursusFormProps) => {
    const isEdit = !!editData

    const [form, setForm] = useState<FormState>(INITIAL)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const [jabatanOptions, setJabatanOptions] = useState<JabatanOption[]>([{ value: '', label: 'Pilih jabatan' }])

    /* ── Fetch jabatan list ─────────────────────────────────── */
    useEffect(() => {
        const fetchJabatan = async () => {
            try {
                const res = await ApiService.fetchDataWithAxios<ApiPaginatedResponse<IJabatan>>({
                    url: `${API_ENDPOINTS.ORGANISASI.JABATAN.BASE}?limit=200`,
                    method: 'GET',
                })
                if (res.success) {
                    setJabatanOptions([
                        { value: '', label: 'Pilih jabatan' },
                        ...res.data.map((j) => ({ value: j.id_jabatan, label: j.nama_jabatan })),
                    ])
                }
            } catch {
                /* silent — jabatan optional */
            }
        }
        fetchJabatan()
    }, [])

    /* ── Populate form saat edit ────────────────────────────── */
    useEffect(() => {
        if (editData) {
            setForm({
                nama_karyawan: editData.nama_karyawan,
                nik: editData.nik ?? '',
                email: editData.email ?? '',
                telepon: editData.telepon ?? '',
                jenis_kelamin: editData.jenis_kelamin != null ? String(editData.jenis_kelamin) as '1' | '2' : '',
                tanggal_lahir: editData.tanggal_lahir?.slice(0, 10) ?? '',
                id_jabatan: editData.id_jabatan ?? '',
                status_kepegawaian: editData.status_kepegawaian ?? '',
                tanggal_masuk: editData.tanggal_masuk?.slice(0, 10) ?? '',
                gaji_pokok: editData.gaji_pokok != null ? String(editData.gaji_pokok) : '',
                nama_bank: editData.nama_bank ?? '',
                no_rekening: editData.no_rekening ?? '',
                nama_pemilik_rekening: editData.nama_pemilik_rekening ?? '',
                npwp: editData.npwp ?? '',
                status_pajak: editData.status_pajak ?? '',
                no_bpjs_kesehatan: editData.no_bpjs_kesehatan ?? '',
                no_bpjs_ketenagakerjaan: editData.no_bpjs_ketenagakerjaan ?? '',
            })
        } else {
            setForm(INITIAL)
        }
        setErrors({})
    }, [editData, open])

    const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((p) => ({ ...p, [key]: e.target.value }))

    const validate = (): boolean => {
        const errs: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama_karyawan.trim()) errs.nama_karyawan = 'Nama wajib diisi'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return
        const payload: ICreateKaryawan = {
            nama_karyawan: form.nama_karyawan.trim(),
            ...(form.nik && { nik: form.nik.trim() }),
            ...(form.email && { email: form.email.trim() }),
            ...(form.telepon && { telepon: form.telepon.trim() }),
            ...(form.jenis_kelamin && { jenis_kelamin: Number(form.jenis_kelamin) as 1 | 2 }),
            ...(form.tanggal_lahir && { tanggal_lahir: form.tanggal_lahir }),
            ...(form.id_jabatan && { id_jabatan: form.id_jabatan }),
            ...(form.status_kepegawaian && { status_kepegawaian: form.status_kepegawaian as ICreateKaryawan['status_kepegawaian'] }),
            ...(form.tanggal_masuk && { tanggal_masuk: form.tanggal_masuk }),
            ...(form.gaji_pokok && { gaji_pokok: parseRupiah(form.gaji_pokok) }),
            ...(form.nama_bank && { nama_bank: form.nama_bank.trim() }),
            ...(form.no_rekening && { no_rekening: form.no_rekening.trim() }),
            ...(form.nama_pemilik_rekening && { nama_pemilik_rekening: form.nama_pemilik_rekening.trim() }),
            ...(form.npwp && { npwp: form.npwp.trim() }),
            ...(form.status_pajak && { status_pajak: form.status_pajak as ICreateKaryawan['status_pajak'] }),
            ...(form.no_bpjs_kesehatan && { no_bpjs_kesehatan: form.no_bpjs_kesehatan.trim() }),
            ...(form.no_bpjs_ketenagakerjaan && { no_bpjs_ketenagakerjaan: form.no_bpjs_ketenagakerjaan.trim() }),
        }
        onSubmit(payload)
    }

    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={640}>
            <h5 className="mb-6">{isEdit ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h5>

            <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-1">

                {/* ── Section 1: Data Diri ─────────────────────────────── */}
                <div>
                    <SectionLabel>Data Diri</SectionLabel>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <FormItem
                                label="Nama Lengkap"
                                asterisk
                                invalid={!!errors.nama_karyawan}
                                errorMessage={errors.nama_karyawan}
                            >
                                <Input
                                    placeholder="Nama lengkap karyawan"
                                    value={form.nama_karyawan}
                                    onChange={set('nama_karyawan')}
                                />
                            </FormItem>
                        </div>
                        <FormItem label="NIK">
                            <Input
                                placeholder="Nomor Induk Karyawan"
                                value={form.nik}
                                onChange={set('nik')}
                            />
                        </FormItem>
                        <FormItem label="Email">
                            <Input
                                type="email"
                                placeholder="email@domain.com"
                                value={form.email}
                                onChange={set('email')}
                            />
                        </FormItem>
                        <FormItem label="Telepon">
                            <Input
                                placeholder="08xx-xxxx-xxxx"
                                value={form.telepon}
                                onChange={set('telepon')}
                            />
                        </FormItem>
                        <FormItem label="Tanggal Lahir">
                            <Input
                                type="date"
                                value={form.tanggal_lahir}
                                onChange={set('tanggal_lahir')}
                            />
                        </FormItem>
                        <FormItem label="Jenis Kelamin">
                            <Select<JenisKelaminOption>
                                options={JENIS_KELAMIN_OPTIONS}
                                value={JENIS_KELAMIN_OPTIONS.find((o) => o.value === form.jenis_kelamin) ?? JENIS_KELAMIN_OPTIONS[0]}
                                onChange={(opt) =>
                                    setForm((p) => ({ ...p, jenis_kelamin: (opt as JenisKelaminOption).value }))
                                }
                            />
                        </FormItem>
                    </div>
                </div>

                {/* ── Section 2: Kepegawaian ───────────────────────────── */}
                <div>
                    <SectionLabel>Kepegawaian</SectionLabel>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="Jabatan">
                            <Select<JabatanOption>
                                options={jabatanOptions}
                                value={jabatanOptions.find((o) => o.value === form.id_jabatan) ?? jabatanOptions[0]}
                                onChange={(opt) =>
                                    setForm((p) => ({ ...p, id_jabatan: (opt as JabatanOption).value }))
                                }
                            />
                        </FormItem>
                        <FormItem label="Status Kepegawaian">
                            <Select<StatusKepegawaianOption>
                                options={STATUS_KEPEGAWAIAN_OPTIONS}
                                value={STATUS_KEPEGAWAIAN_OPTIONS.find((o) => o.value === form.status_kepegawaian) ?? STATUS_KEPEGAWAIAN_OPTIONS[0]}
                                onChange={(opt) =>
                                    setForm((p) => ({ ...p, status_kepegawaian: (opt as StatusKepegawaianOption).value }))
                                }
                            />
                        </FormItem>
                        <FormItem label="Tanggal Masuk">
                            <Input
                                type="date"
                                value={form.tanggal_masuk}
                                onChange={set('tanggal_masuk')}
                            />
                        </FormItem>
                        <FormItem label="Gaji Pokok">
                            <Input
                                prefix={<span className="text-gray-500 font-medium">Rp</span>}
                                placeholder="0"
                                value={form.gaji_pokok}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, gaji_pokok: formatRupiahInput(e.target.value) }))
                                }
                            />
                        </FormItem>
                    </div>
                </div>

                {/* ── Section 3: Keuangan & Pajak ──────────────────────── */}
                <div>
                    <SectionLabel>Keuangan &amp; Pajak</SectionLabel>
                    <div className="grid grid-cols-2 gap-4">
                        <FormItem label="Nama Bank">
                            <Input
                                placeholder="BCA / Mandiri / BNI..."
                                value={form.nama_bank}
                                onChange={set('nama_bank')}
                            />
                        </FormItem>
                        <FormItem label="No. Rekening">
                            <Input
                                placeholder="Nomor rekening"
                                value={form.no_rekening}
                                onChange={set('no_rekening')}
                            />
                        </FormItem>
                        <div className="col-span-2">
                            <FormItem label="Nama Pemilik Rekening">
                                <Input
                                    placeholder="Sesuai buku rekening"
                                    value={form.nama_pemilik_rekening}
                                    onChange={set('nama_pemilik_rekening')}
                                />
                            </FormItem>
                        </div>
                        <FormItem label="NPWP">
                            <Input
                                placeholder="xx.xxx.xxx.x-xxx.xxx"
                                value={form.npwp}
                                onChange={set('npwp')}
                            />
                        </FormItem>
                        <FormItem label="Status Pajak">
                            <Select<StatusPajakOption>
                                options={STATUS_PAJAK_OPTIONS}
                                value={STATUS_PAJAK_OPTIONS.find((o) => o.value === form.status_pajak) ?? STATUS_PAJAK_OPTIONS[0]}
                                onChange={(opt) =>
                                    setForm((p) => ({ ...p, status_pajak: (opt as StatusPajakOption).value }))
                                }
                            />
                        </FormItem>
                        <FormItem label="No. BPJS Kesehatan">
                            <Input
                                placeholder="Nomor BPJS Kesehatan"
                                value={form.no_bpjs_kesehatan}
                                onChange={set('no_bpjs_kesehatan')}
                            />
                        </FormItem>
                        <FormItem label="No. BPJS Ketenagakerjaan">
                            <Input
                                placeholder="Nomor BPJS Ketenagakerjaan"
                                value={form.no_bpjs_ketenagakerjaan}
                                onChange={set('no_bpjs_ketenagakerjaan')}
                            />
                        </FormItem>
                    </div>
                </div>

            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose}>Batal</Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Tambah'}
                </Button>
            </div>
        </Dialog>
    )
}

export default KaryawanKursusForm
