'use client'

import { useState, useEffect } from 'react'
import { Dialog, Button, FormItem, Input } from '@/components/ui'
import { toast, Notification } from '@/components/ui'
import CancelKelasService from '@/services/kursus/cancel-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import type { ISesiPengganti } from '@/@types/kursus.types'

interface Props {
    open: boolean
    sesi: ISesiPengganti | null
    onClose: () => void
    onSuccess: () => void
}

export default function SesiPenggantiConfirmModal({ open, sesi, onClose, onSuccess }: Props) {
    const [tanggal, setTanggal] = useState('')
    const [jamMulai, setJamMulai] = useState('')
    const [jamSelesai, setJamSelesai] = useState('')
    const [keterangan, setKeterangan] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open && sesi) {
            setTanggal(sesi.tanggal)
            setJamMulai(sesi.jam_mulai ?? '')
            setJamSelesai(sesi.jam_selesai ?? '')
            setKeterangan(sesi.keterangan ?? '')
        }
    }, [open, sesi])

    if (!sesi) return null

    const handleKonfirmasi = async () => {
        setSubmitting(true)
        try {
            await CancelKelasService.konfirmasiPengganti(sesi.id_sesi_pengganti, {
                tanggal: tanggal || undefined,
                jam_mulai: jamMulai || undefined,
                jam_selesai: jamSelesai || undefined,
                keterangan: keterangan || undefined,
            })
            toast.push(<Notification type="success" title="Sesi pengganti dikonfirmasi" />)
            onSuccess()
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setSubmitting(false)
        }
    }

    const handleBatal = async () => {
        setSubmitting(true)
        try {
            await CancelKelasService.batalPengganti(sesi.id_sesi_pengganti)
            toast.push(<Notification type="warning" title="Sesi pengganti dibatalkan" />)
            onSuccess()
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={460}>
            <h5 className="mb-2">Sesi Pengganti</h5>
            <p className="text-sm text-gray-500 mb-4">
                Kelas: <span className="font-semibold text-gray-700">{sesi.nama_kelas}</span> ·{' '}
                {sesi.nama_karyawan}
            </p>
            <div className="flex flex-col gap-4">
                <FormItem label="Tanggal pengganti" asterisk>
                    <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
                </FormItem>
                <div className="grid grid-cols-2 gap-3">
                    <FormItem label="Jam mulai">
                        <Input placeholder="08:00" value={jamMulai} onChange={e => setJamMulai(e.target.value)} />
                    </FormItem>
                    <FormItem label="Jam selesai">
                        <Input placeholder="09:00" value={jamSelesai} onChange={e => setJamSelesai(e.target.value)} />
                    </FormItem>
                </div>
                <FormItem label="Keterangan">
                    <Input placeholder="Catatan sesi pengganti" value={keterangan} onChange={e => setKeterangan(e.target.value)} />
                </FormItem>
            </div>
            <div className="flex justify-between items-center mt-6">
                <Button
                    variant="plain"
                    customColorClass={() => 'text-red-500 hover:text-red-600 hover:bg-red-50 border-transparent'}
                    loading={submitting}
                    onClick={handleBatal}
                >
                    Batalkan Pengganti
                </Button>
                <div className="flex gap-2">
                    <Button variant="plain" onClick={onClose}>Tutup</Button>
                    <Button variant="solid" loading={submitting} onClick={handleKonfirmasi}>
                        Konfirmasi
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}
