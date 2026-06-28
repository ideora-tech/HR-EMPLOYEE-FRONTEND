'use client'

import { useState, useEffect } from 'react'
import { Dialog, Button, FormItem, Input, DatePicker } from '@/components/ui'
import { toast, Notification } from '@/components/ui'
import LiburJadwalService from '@/services/kursus/libur-jadwal.service'
import { parseApiError } from '@/utils/parseApiError'

interface Props {
    open: boolean
    tanggalDefault?: string
    onClose: () => void
    onSuccess: () => void
}

function parseToDate(str: string): Date | null {
    if (!str) return null
    return new Date(str + 'T12:00:00')
}

function dateToYMD(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export default function LiburForm({ open, tanggalDefault = '', onClose, onSuccess }: Props) {
    const [tanggal, setTanggal] = useState<Date | null>(() => parseToDate(tanggalDefault))
    const [keterangan, setKeterangan] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState<{ tanggal?: string; keterangan?: string }>({})

    useEffect(() => {
        if (open) {
            setTanggal(parseToDate(tanggalDefault))
            setKeterangan('')
            setErrors({})
        }
    }, [open, tanggalDefault])

    const validate = () => {
        const e: typeof errors = {}
        if (!tanggal) e.tanggal = 'Tanggal wajib diisi'
        if (!keterangan.trim()) e.keterangan = 'Keterangan wajib diisi'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSubmitting(true)
        try {
            const res = await LiburJadwalService.create({ tanggal: dateToYMD(tanggal!), keterangan })
            const jumlah = res.data.kelas_terdampak?.length ?? 0
            toast.push(
                <Notification type="success"
                    title={`Libur berhasil ditambahkan — ${jumlah} kelas dibatalkan otomatis`}
                />
            )
            onSuccess()
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={440}>
            <h5 className="mb-5">Tutup Semua Kelas</h5>
            <p className="text-sm text-gray-500 mb-4">
                Semua kelas yang dijadwalkan pada hari ini akan dibatalkan otomatis dan sesi pengganti
                dibuat untuk minggu berikutnya.
            </p>
            <div className="flex flex-col gap-4">
                <FormItem label="Tanggal" asterisk invalid={!!errors.tanggal} errorMessage={errors.tanggal}>
                    <DatePicker
                        placeholder="Pilih tanggal libur"
                        value={tanggal}
                        onChange={(date) => setTanggal(date)}
                    />
                </FormItem>
                <FormItem label="Keterangan" asterisk invalid={!!errors.keterangan} errorMessage={errors.keterangan}>
                    <Input
                        placeholder="Contoh: Hari Raya Idul Fitri"
                        value={keterangan}
                        onChange={e => setKeterangan(e.target.value)}
                    />
                </FormItem>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="plain" onClick={onClose}>Batal</Button>
                <Button
                    variant="solid"
                    customColorClass={() => 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500'}
                    loading={submitting}
                    onClick={handleSubmit}
                >
                    Tutup Semua Kelas
                </Button>
            </div>
        </Dialog>
    )
}
