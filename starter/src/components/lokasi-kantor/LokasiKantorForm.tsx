'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Input, Switcher } from '@/components/ui'
import type { ILokasiKantor, ICreateLokasiKantor, IUpdateLokasiKantor } from '@/@types/organisasi.types'

interface LokasiKantorFormProps {
    open: boolean
    editData?: ILokasiKantor | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: ICreateLokasiKantor | IUpdateLokasiKantor) => void
}

interface FormState {
    kode: string
    nama: string
    alamat: string
    kota: string
    provinsi: string
    kode_pos: string
    telepon: string
    aktif: boolean
}

const INITIAL_STATE: FormState = {
    kode: '',
    nama: '',
    alamat: '',
    kota: '',
    provinsi: '',
    kode_pos: '',
    telepon: '',
    aktif: true,
}

const LokasiKantorForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: LokasiKantorFormProps) => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

    const isEdit = !!editData

    useEffect(() => {
        if (editData) {
            setForm({
                kode: editData.kode,
                nama: editData.nama,
                alamat: editData.alamat ?? '',
                kota: editData.kota ?? '',
                provinsi: editData.provinsi ?? '',
                kode_pos: editData.kode_pos ?? '',
                telepon: editData.telepon ?? '',
                aktif: editData.aktif === 1,
            })
        } else {
            setForm(INITIAL_STATE)
        }
        setErrors({})
    }, [editData, open])

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormState, string>> = {}
        if (!form.kode.trim()) newErrors.kode = 'Kode lokasi wajib diisi'
        if (!form.nama.trim()) newErrors.nama = 'Nama lokasi wajib diisi'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) return

        const base: ICreateLokasiKantor = {
            kode: form.kode.trim().toUpperCase(),
            nama: form.nama.trim(),
            alamat: form.alamat.trim() || undefined,
            kota: form.kota.trim() || undefined,
            provinsi: form.provinsi.trim() || undefined,
            kode_pos: form.kode_pos.trim() || undefined,
            telepon: form.telepon.trim() || undefined,
        }

        if (isEdit) {
            onSubmit({ ...base, aktif: form.aktif ? 1 : 0 } as IUpdateLokasiKantor)
        } else {
            onSubmit(base)
        }
    }

    return (
        <Dialog
            isOpen={open}
            onClose={submitting ? undefined : onClose}
            closable={!submitting}
            width={540}
        >
            <h5 className="mb-6">
                {isEdit ? 'Edit Lokasi Kantor' : 'Tambah Lokasi Kantor Baru'}
            </h5>

            <div className="flex flex-col gap-1">
                <FormItem
                    label="Kode Lokasi"
                    asterisk
                    invalid={!!errors.kode}
                    errorMessage={errors.kode}
                    extra={
                        <span className="text-xs text-gray-400">
                            Akan diubah ke huruf kapital otomatis. Contoh: JKT-HO, SBY-BR
                        </span>
                    }
                >
                    <Input
                        placeholder="contoh: JKT-HO"
                        value={form.kode}
                        invalid={!!errors.kode}
                        disabled={isEdit}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, kode: e.target.value.toUpperCase() }))
                        }
                    />
                </FormItem>

                <FormItem
                    label="Nama Lokasi"
                    asterisk
                    invalid={!!errors.nama}
                    errorMessage={errors.nama}
                >
                    <Input
                        placeholder="contoh: Kantor Pusat Jakarta"
                        value={form.nama}
                        invalid={!!errors.nama}
                        onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                    />
                </FormItem>

                <FormItem label="Alamat">
                    <Input
                        textArea
                        rows={2}
                        placeholder="Alamat lengkap kantor (opsional)"
                        value={form.alamat}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, alamat: e.target.value }))
                        }
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-x-4">
                    <FormItem label="Kota">
                        <Input
                            placeholder="contoh: Jakarta Selatan"
                            value={form.kota}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, kota: e.target.value }))
                            }
                        />
                    </FormItem>

                    <FormItem label="Provinsi">
                        <Input
                            placeholder="contoh: DKI Jakarta"
                            value={form.provinsi}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, provinsi: e.target.value }))
                            }
                        />
                    </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                    <FormItem label="Kode Pos">
                        <Input
                            placeholder="contoh: 12345"
                            value={form.kode_pos}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, kode_pos: e.target.value }))
                            }
                        />
                    </FormItem>

                    <FormItem label="Telepon">
                        <Input
                            placeholder="contoh: 021-1234567"
                            value={form.telepon}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, telepon: e.target.value }))
                            }
                        />
                    </FormItem>
                </div>

                {isEdit && (
                    <FormItem label="Status Lokasi">
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
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Lokasi'}
                </Button>
            </div>
        </Dialog>
    )
}

export default LokasiKantorForm
