'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog, FormItem, Switcher } from '@/components/ui'
import type { IAksesModulTier, IAksesModulUpdate } from '@/@types/akses-modul.types'

interface AksesModulFormProps {
    open: boolean
    editData?: IAksesModulTier | null
    submitting?: boolean
    onClose: () => void
    onSubmit: (payload: IAksesModulUpdate) => void
}

interface FormState {
    aktif: boolean
    batasan: string  // JSON string
}

const AksesModulForm = ({
    open,
    editData,
    submitting = false,
    onClose,
    onSubmit,
}: AksesModulFormProps) => {
    const [form, setForm] = useState<FormState>({ aktif: true, batasan: '' })
    const [batasanError, setBatasanError] = useState('')

    useEffect(() => {
        if (editData) {
            setForm({
                aktif: editData.aktif === 1,
                batasan: editData.batasan
                    ? JSON.stringify(editData.batasan, null, 2)
                    : '',
            })
        }
        setBatasanError('')
    }, [editData, open])

    const validate = (): IAksesModulUpdate | null => {
        if (!form.batasan.trim()) {
            return { aktif: form.aktif ? 1 : 0, batasan: null }
        }
        try {
            const parsed = JSON.parse(form.batasan)
            return { aktif: form.aktif ? 1 : 0, batasan: parsed }
        } catch {
            setBatasanError('Format JSON tidak valid')
            return null
        }
    }

    const handleSubmit = () => {
        const payload = validate()
        if (!payload) return
        onSubmit(payload)
    }

    return (
        <Dialog
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            width={460}
        >
            <h5 className="mb-1">Edit Akses Modul</h5>
            {editData && (
                <p className="text-sm text-gray-500 mb-6">
                    <span className="font-semibold text-gray-700">
                        {editData.kode_modul}
                    </span>{' '}
                    pada paket{' '}
                    <span className="font-semibold text-gray-700">
                        {editData.paket}
                    </span>
                </p>
            )}

            <div className="flex flex-col gap-1">
                <FormItem label="Status Akses">
                    <div className="flex items-center gap-3">
                        <Switcher
                            checked={form.aktif}
                            onChange={(val) =>
                                setForm((p) => ({ ...p, aktif: val }))
                            }
                        />
                        <span className="text-sm text-gray-600">
                            {form.aktif
                                ? 'Aktif — modul tersedia di paket ini'
                                : 'Nonaktif — modul tidak tersedia'}
                        </span>
                    </div>
                </FormItem>

                <FormItem
                    label="Batasan"
                    invalid={!!batasanError}
                    errorMessage={batasanError}
                    extra={
                        <span className="text-xs text-gray-400">
                            Format JSON. Kosongkan jika tidak ada batasan.
                            Contoh: {`{"maks_karyawan": 10}`}
                        </span>
                    }
                >
                    <textarea
                        rows={5}
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-mono resize-none
                            focus:outline-none focus:ring-2 focus:ring-indigo-500
                            bg-white dark:bg-gray-800
                            ${batasanError
                                ? 'border-red-400 dark:border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                        placeholder={'{\n  "maks_karyawan": 10\n}'}
                        value={form.batasan}
                        onChange={(e) => {
                            setBatasanError('')
                            setForm((p) => ({
                                ...p,
                                batasan: e.target.value,
                            }))
                        }}
                    />
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
                    Simpan
                </Button>
            </div>
        </Dialog>
    )
}

export default AksesModulForm
