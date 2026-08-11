'use client'

import { useState } from 'react'
import { Button, Dialog, FormItem, Input } from '@/components/ui'
import { HiCheckCircle, HiXCircle, HiPhotograph } from 'react-icons/hi'
import { toast } from '@/components/ui'
import Notification from '@/components/ui/Notification'
import type { IPembayaran } from '@/@types/kursus.types'
import { formatRupiah } from '@/utils/formatNumber'
import { toProxyFileUrl } from '@/utils/fileUrl'
import pembayaranService from '@/services/kursus/pembayaran.service'

interface KonfirmasiPanelProps {
    pembayaran: IPembayaran
    onUpdated: () => void
}

const STATUS_LABEL: Record<number, string> = {
    0: 'Menunggu Konfirmasi',
    1: 'Dikonfirmasi',
    2: 'Ditolak',
}

const STATUS_COLOR: Record<number, string> = {
    0: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    2: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
}

const KonfirmasiPanel = ({ pembayaran, onUpdated }: KonfirmasiPanelProps) => {
    const [showTolakModal, setShowTolakModal] = useState(false)
    const [catatanTolak, setCatatanTolak] = useState('')
    const [loading, setLoading] = useState(false)

    const handleKonfirmasi = async () => {
        setLoading(true)
        try {
            await pembayaranService.konfirmasi(pembayaran.id_pembayaran)
            toast.push(<Notification type="success" title="Pembayaran dikonfirmasi" />)
            onUpdated()
        } catch {
            toast.push(<Notification type="danger" title="Gagal mengkonfirmasi pembayaran" />)
        } finally {
            setLoading(false)
        }
    }

    const handleTolak = async () => {
        if (!catatanTolak.trim()) return
        setLoading(true)
        try {
            await pembayaranService.tolak(pembayaran.id_pembayaran, catatanTolak)
            toast.push(<Notification type="warning" title="Pembayaran ditolak" />)
            setShowTolakModal(false)
            onUpdated()
        } catch {
            toast.push(<Notification type="danger" title="Gagal menolak pembayaran" />)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-800/40">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p className="text-sm font-semibold">{formatRupiah(pembayaran.jumlah)}</p>
                    <p className="text-xs text-gray-500">{pembayaran.tanggal_bayar} · {pembayaran.metode}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[pembayaran.status_konfirmasi]}`}>
                    {STATUS_LABEL[pembayaran.status_konfirmasi]}
                </span>
            </div>

            {pembayaran.bukti_bayar && (
                <div className="mb-3">
                    <a href={toProxyFileUrl(pembayaran.bukti_bayar)} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <HiPhotograph className="text-base" />
                        Lihat Bukti Transfer
                    </a>
                </div>
            )}

            {pembayaran.catatan_tolak && (
                <p className="text-xs text-red-500 mb-3">Alasan ditolak: {pembayaran.catatan_tolak}</p>
            )}

            {pembayaran.status_konfirmasi === 0 && (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="solid"
                        customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                        icon={<HiCheckCircle />}
                        loading={loading}
                        onClick={handleKonfirmasi}
                    >
                        Konfirmasi
                    </Button>
                    <Button
                        size="sm"
                        variant="plain"
                        className="text-red-500 hover:text-red-600"
                        icon={<HiXCircle />}
                        disabled={loading}
                        onClick={() => { setCatatanTolak(''); setShowTolakModal(true) }}
                    >
                        Tolak
                    </Button>
                </div>
            )}

            <Dialog isOpen={showTolakModal} onClose={() => setShowTolakModal(false)} width={400}>
                <h5 className="mb-4">Tolak Pembayaran</h5>
                <FormItem label="Alasan Penolakan" asterisk>
                    <Input
                        textArea
                        rows={3}
                        placeholder="Masukkan alasan penolakan..."
                        value={catatanTolak}
                        onChange={(e) => setCatatanTolak(e.target.value)}
                    />
                </FormItem>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="default" onClick={() => setShowTolakModal(false)} disabled={loading}>Batal</Button>
                    <Button
                        variant="solid"
                        customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                        loading={loading}
                        className="bg-red-500 hover:bg-red-600 border-red-500 text-white"
                        disabled={!catatanTolak.trim()}
                        onClick={handleTolak}
                    >
                        Ya, Tolak
                    </Button>
                </div>
            </Dialog>
        </div>
    )
}

export default KonfirmasiPanel
