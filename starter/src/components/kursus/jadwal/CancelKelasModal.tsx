'use client'

import { useState, useEffect } from 'react'
import { Dialog, Button, FormItem, Input, DatePicker } from '@/components/ui'
import { toast, Notification } from '@/components/ui'
import CancelKelasService from '@/services/kursus/cancel-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IJadwalKelas } from '@/@types/kursus.types'

function dateToYMD(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function fmtTanggal(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
}

interface Props {
    open: boolean
    jadwal: IJadwalKelas | null
    tanggal: string
    onClose: () => void
    onSuccess: () => void
}

export default function CancelKelasModal({ open, jadwal, tanggal, onClose, onSuccess }: Props) {
    const [keterangan, setKeterangan] = useState('')
    const [tanggalPengganti, setTanggalPengganti] = useState<Date | null>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open && tanggal) {
            setKeterangan('')
            const d = new Date(tanggal + 'T12:00:00')
            d.setDate(d.getDate() + 7)
            setTanggalPengganti(d)
        }
    }, [open, tanggal])

    if (!jadwal) return null

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            await CancelKelasService.create({
                id_jadwal_kelas: jadwal.id_jadwal_kelas,
                tanggal,
                keterangan: keterangan || undefined,
                tanggal_pengganti: tanggalPengganti ? dateToYMD(tanggalPengganti) : undefined,
            })
            toast.push(<Notification type="success" title="Kelas berhasil dibatalkan — sesi pengganti dikonfirmasi" />)
            onSuccess()
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={440}>
            <h5 className="mb-5">Batalkan Kelas</h5>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5 text-sm">
                <div className="flex gap-2">
                    <span className="text-gray-500 w-28">Kelas</span>
                    <span className="font-semibold">{jadwal.nama_kelas}</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-gray-500 w-28">Instruktur</span>
                    <span>{jadwal.nama_karyawan?.trim() || '(Tanpa Coach)'}</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-gray-500 w-28">Jam</span>
                    <span>{jadwal.jam_mulai} – {jadwal.jam_selesai}</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-gray-500 w-28">Tanggal batal</span>
                    <span className="font-medium text-red-600">{fmtTanggal(tanggal)}</span>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <FormItem label="Tanggal pengganti">
                    <DatePicker
                        placeholder="Pilih tanggal sesi pengganti"
                        value={tanggalPengganti}
                        onChange={(date) => setTanggalPengganti(date)}
                    />
                </FormItem>
                <FormItem label="Alasan pembatalan">
                    <Input
                        placeholder="Contoh: Instruktur sakit, Ruangan tidak tersedia"
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
                    Batalkan Kelas
                </Button>
            </div>
        </Dialog>
    )
}
