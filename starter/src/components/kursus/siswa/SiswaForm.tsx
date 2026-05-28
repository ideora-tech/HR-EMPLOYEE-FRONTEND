'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Select, Switcher } from '@/components/ui'
import type { ISiswa, ICreateSiswa, IUpdateSiswa } from '@/@types/kursus.types'

type JKOption = { value: '' | '1' | '2'; label: string }
const JK_OPTIONS: JKOption[] = [
    { value: '', label: '— Tidak diisi —' },
    { value: '1', label: 'Laki-laki' },
    { value: '2', label: 'Perempuan' },
]

interface FormState {
    nama_siswa: string
    nama_panggilan: string
    email: string
    telepon: string
    tanggal_lahir: string
    jenis_kelamin: '' | '1' | '2'
    alamat: string
    pendidikan: string
    sekolah_pekerjaan: string
    instagram: string
    kontak_utama_nama: string
    kontak_utama_relasi: string
    aktif: boolean
}

const INITIAL: FormState = {
    nama_siswa: '', nama_panggilan: '', email: '', telepon: '',
    tanggal_lahir: '', jenis_kelamin: '', alamat: '',
    pendidikan: '', sekolah_pekerjaan: '', instagram: '',
    kontak_utama_nama: '', kontak_utama_relasi: '', aktif: true,
}

interface SiswaFormProps {
    open: boolean
    editData?: ISiswa | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateSiswa | IUpdateSiswa) => void
}

const SiswaForm = ({ open, editData, submitting = false, onClose, onSubmit }: SiswaFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                nama_siswa: editData.nama_siswa,
                nama_panggilan: editData.nama_panggilan ?? '',
                email: editData.email ?? '',
                telepon: editData.telepon ?? '',
                tanggal_lahir: editData.tanggal_lahir ?? '',
                jenis_kelamin: editData.jenis_kelamin ? (String(editData.jenis_kelamin) as '1' | '2') : '',
                alamat: editData.alamat ?? '',
                pendidikan: editData.pendidikan ?? '',
                sekolah_pekerjaan: editData.sekolah_pekerjaan ?? '',
                instagram: editData.instagram ?? '',
                kontak_utama_nama: editData.kontak_utama_nama ?? '',
                kontak_utama_relasi: editData.kontak_utama_relasi ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL)
        }
        setErrors({})
    }, [editData, open])

    const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((p) => ({ ...p, [key]: e.target.value }))

    const validate = () => {
        const err: Partial<Record<keyof FormState, string>> = {}
        if (!form.nama_siswa.trim()) err.nama_siswa = 'Nama lengkap wajib diisi'
        setErrors(err)
        return !Object.keys(err).length
    }

    const buildPayload = () => ({
        nama_siswa: form.nama_siswa.trim(),
        nama_panggilan: form.nama_panggilan.trim() || undefined,
        email: form.email.trim() || undefined,
        telepon: form.telepon.trim() || undefined,
        tanggal_lahir: form.tanggal_lahir || undefined,
        jenis_kelamin: form.jenis_kelamin ? (Number(form.jenis_kelamin) as 1 | 2) : undefined,
        alamat: form.alamat.trim() || undefined,
        pendidikan: form.pendidikan.trim() || undefined,
        sekolah_pekerjaan: form.sekolah_pekerjaan.trim() || undefined,
        instagram: form.instagram.trim() || undefined,
        kontak_utama_nama: form.kontak_utama_nama.trim() || undefined,
        kontak_utama_relasi: form.kontak_utama_relasi.trim() || undefined,
        ...(isEdit ? { aktif: form.aktif ? 1 : 0 } : {}),
    })

    const handleSubmit = () => {
        if (!validate()) return
        onSubmit(buildPayload())
    }

    const selectedJK = JK_OPTIONS.find((o) => o.value === form.jenis_kelamin) ?? JK_OPTIONS[0]

    return (
        <Dialog isOpen={open} onClose={submitting ? undefined : onClose} closable={!submitting} width={600}>
            <h5 className="mb-6">{isEdit ? 'Edit Siswa' : 'Tambah Siswa Baru'}</h5>

            <div className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1">
                {/* Identitas */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Identitas</p>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Nama Lengkap" asterisk invalid={!!errors.nama_siswa} errorMessage={errors.nama_siswa}>
                        <Input placeholder="Budi Santoso" value={form.nama_siswa} invalid={!!errors.nama_siswa} onChange={set('nama_siswa')} />
                    </FormItem>
                    <FormItem label="Nama Panggilan">
                        <Input placeholder="Budi" value={form.nama_panggilan} onChange={set('nama_panggilan')} />
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Tanggal Lahir">
                        <Input type="date" value={form.tanggal_lahir} onChange={set('tanggal_lahir')} />
                    </FormItem>
                    <FormItem label="Jenis Kelamin">
                        <Select<JKOption>
                            options={JK_OPTIONS}
                            value={selectedJK}
                            onChange={(opt) => setForm((p) => ({ ...p, jenis_kelamin: (opt as JKOption).value }))}
                        />
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Email">
                        <Input type="email" placeholder="budi@email.com" value={form.email} onChange={set('email')} />
                    </FormItem>
                    <FormItem label="Telepon">
                        <Input placeholder="08xx-xxxx-xxxx" value={form.telepon} onChange={set('telepon')} />
                    </FormItem>
                </div>

                <FormItem label="Alamat">
                    <Input textArea rows={2} placeholder="Alamat lengkap" value={form.alamat} onChange={set('alamat')} />
                </FormItem>

                {/* Pendidikan */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-3 mb-1">Pendidikan & Sosmed</p>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Pendidikan">
                        <Input placeholder="SMA / Kuliah / dll" value={form.pendidikan} onChange={set('pendidikan')} />
                    </FormItem>
                    <FormItem label="Sekolah / Pekerjaan">
                        <Input placeholder="SMAN 1 Jakarta" value={form.sekolah_pekerjaan} onChange={set('sekolah_pekerjaan')} />
                    </FormItem>
                </div>

                <FormItem label="Instagram">
                    <Input placeholder="@username" value={form.instagram} onChange={set('instagram')} />
                </FormItem>

                {/* Kontak Darurat */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-3 mb-1">Kontak Utama</p>

                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Nama Kontak">
                        <Input placeholder="Nama orang tua / wali" value={form.kontak_utama_nama} onChange={set('kontak_utama_nama')} />
                    </FormItem>
                    <FormItem label="Relasi">
                        <Input placeholder="Ayah / Ibu / Kakak / dll" value={form.kontak_utama_relasi} onChange={set('kontak_utama_relasi')} />
                    </FormItem>
                </div>

                {isEdit && (
                    <FormItem label="Status" className="mt-2">
                        <div className="flex items-center gap-3">
                            <Switcher checked={form.aktif} onChange={(val) => setForm((p) => ({ ...p, aktif: val }))} />
                            <span className="text-sm text-gray-600">{form.aktif ? 'Aktif' : 'Nonaktif'}</span>
                        </div>
                    </FormItem>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="default" onClick={onClose} disabled={submitting}>Batal</Button>
                <Button variant="solid" customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'} loading={submitting} onClick={handleSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </Button>
            </div>
        </Dialog>
    )
}

export default SiswaForm
