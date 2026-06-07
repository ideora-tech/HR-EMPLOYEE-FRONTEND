'use client'

import { useState, useEffect } from 'react'
import { Dialog, Button, FormItem, Input } from '@/components/ui'
import { toast, Notification } from '@/components/ui'
import CancelKelasService from '@/services/kursus/cancel-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import type { IJadwalKelas } from '@/@types/kursus.types'

function addDays(dateStr: string, n: number): string {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() + n)
    return d.toISOString().split('T')[0]
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
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open) setKeterangan('')
    }, [open])

    if (!jadwal) return null

    const tanggalPengganti = tanggal ? addDays(tanggal, 7) : ''

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            await CancelKelasService.create({
                id_jadwal_kelas: jadwal.id_jadwal_kelas,
                tanggal,
                keterangan: keterangan || undefined,
            })
            toast.push(<Notification type="success" title="Kelas berhasil dibatalkan — sesi pengganti dibuat" />)
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
                    <span>{jadwal.nama_karyawan}</span>
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
            <FormItem label="Alasan pembatalan">
                <Input
                    placeholder="Contoh: Instruktur sakit, Ruangan tidak tersedia"
                    value={keterangan}
                    onChange={e => setKeterangan(e.target.value)}
                />
            </FormItem>
            {tanggalPengganti && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm">
                    <p className="text-amber-700 font-medium">Sesi pengganti otomatis:</p>
                    <p className="text-amber-600 mt-0.5">
                        {fmtTanggal(tanggalPengganti)} · {jadwal.jam_mulai} – {jadwal.jam_selesai}
                    </p>
                    <p className="text-amber-500 text-xs mt-0.5">Perlu konfirmasi setelah disimpan</p>
                </div>
            )}
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
