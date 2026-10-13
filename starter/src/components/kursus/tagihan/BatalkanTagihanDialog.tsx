'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { formatRupiah } from '@/utils/formatNumber'
import type { ITagihan } from '@/@types/kursus.types'

interface BatalkanTagihanDialogProps {
    /** Tagihan yang akan dibatalkan; null = dialog tertutup. */
    tagihan: ITagihan | null
    loading: boolean
    onClose: () => void
    onConfirm: (alasan: string) => void
}

/**
 * Konfirmasi pembatalan tagihan dengan alasan wajib — tagihan tidak dihapus,
 * statusnya menjadi Dibatalkan. Dipakai di daftar pembayaran dan drawer detail.
 */
const BatalkanTagihanDialog = ({ tagihan, loading, onClose, onConfirm }: BatalkanTagihanDialogProps) => {
    const [alasan, setAlasan] = useState('')

    // Reset isian setiap dialog ditutup / berpindah tagihan
    useEffect(() => {
        if (!tagihan) setAlasan('')
    }, [tagihan])

    // Backend menolak pembatalan bila sudah ada pembayaran — jelaskan di muka, jangan tunggu error.
    const totalBayar = Number(tagihan?.total_bayar ?? 0)
    const sudahAdaPembayaran = totalBayar > 0
    const alasanBersih = alasan.trim()

    return (
        <ConfirmDialog
            isOpen={!!tagihan}
            type="danger"
            title="Batalkan Tagihan?"
            confirmText="Ya, Batalkan"
            cancelText="Kembali"
            confirmButtonProps={{
                loading,
                disabled: sudahAdaPembayaran || !alasanBersih,
                customColorClass: () =>
                    'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
            }}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={() => {
                if (sudahAdaPembayaran || !alasanBersih) return
                onConfirm(alasanBersih)
            }}
        >
            <p className="text-sm">
                Tagihan untuk{' '}
                <span className="font-semibold">&ldquo;{tagihan?.nama_siswa}&rdquo;</span>{' '}
                akan dibatalkan dan statusnya menjadi <span className="font-semibold">Dibatalkan</span>.
                Data tagihan tetap tersimpan beserta alasannya.
            </p>

            {sudahAdaPembayaran ? (
                <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                    Tagihan ini sudah memiliki pembayaran sebesar{' '}
                    <span className="font-semibold">{formatRupiah(totalBayar)}</span>. Hapus pembayarannya
                    terlebih dahulu (dengan alasan), lalu batalkan tagihan ini.
                </div>
            ) : (
                <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                        Alasan pembatalan <span className="text-red-500">*</span>
                    </p>
                    <Input
                        textArea
                        rows={2}
                        placeholder="Mis. tagihan dobel, salah pilih siswa"
                        value={alasan}
                        maxLength={255}
                        onChange={(e) => setAlasan(e.target.value)}
                    />
                </div>
            )}
        </ConfirmDialog>
    )
}

export default BatalkanTagihanDialog
