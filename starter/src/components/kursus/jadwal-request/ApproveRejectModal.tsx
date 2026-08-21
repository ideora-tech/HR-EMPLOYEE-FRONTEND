'use client'

import { useState, useEffect } from 'react'
import { Button, Dialog } from '@/components/ui'
import type { IJadwalRequestPublic } from '@/@types/kursus.types'
import { formatTanggal } from '@/utils/formatTanggal'

interface ApproveRejectModalProps {
    open: boolean
    mode: 'approve' | 'reject' | null
    target: IJadwalRequestPublic | null
    submitting: boolean
    onClose: () => void
    onConfirm: (catatan?: string) => void
}

const ApproveRejectModal = ({
    open,
    mode,
    target,
    submitting,
    onClose,
    onConfirm,
}: ApproveRejectModalProps) => {
    const [catatan, setCatatan] = useState('')

    useEffect(() => {
        if (open) setCatatan('')
    }, [open])

    const isApprove = mode === 'approve'

    // Backend menolak approve untuk baris lama tanpa tanggal pertemuan
    // (400 "Request lama tanpa tanggal pertemuan tidak bisa disetujui"),
    // jadi tombolnya dimatikan sebelum request dikirim.
    const tanggalKosong = isApprove && !!target && !target.tanggal

    const title = isApprove ? 'Setujui Request Jadwal?' : 'Tolak Request Jadwal?'
    const catatanLabel = isApprove ? 'Catatan Admin' : 'Alasan Penolakan'
    const catatanPlaceholder = isApprove
        ? 'Catatan untuk coach (opsional)...'
        : 'Tuliskan alasan penolakan (opsional)...'

    const handleConfirm = () => {
        onConfirm(catatan.trim() || undefined)
    }

    return (
        <Dialog isOpen={open} onClose={onClose} onRequestClose={onClose} width={480}>
            <h5 className="mb-4">{title}</h5>

            {target && (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 mb-5 flex flex-col gap-2 text-sm">
                    <div className="flex gap-2">
                        <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0">Coach</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {target.coach.nama_karyawan}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0">Nama Kelas</span>
                        <span className="text-gray-800 dark:text-gray-100">
                            {target.jadwal.nama_kelas}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0">
                            Tanggal
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {formatTanggal(target.tanggal)}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0">Jadwal</span>
                        <span className="text-gray-800 dark:text-gray-100">
                            {target.jadwal.hari}, {target.jadwal.jam_mulai}–{target.jadwal.jam_selesai}
                        </span>
                    </div>
                    {target.catatan_coach && (
                        <div className="flex gap-2">
                            <span className="text-gray-500 dark:text-gray-400 w-28 shrink-0">Catatan Coach</span>
                            <span className="text-gray-700 dark:text-gray-200 italic">
                                &ldquo;{target.catatan_coach}&rdquo;
                            </span>
                        </div>
                    )}
                </div>
            )}

            {tanggalKosong && (
                <p className="mb-5 text-sm text-amber-600 dark:text-amber-400">
                    Request lama ini tidak punya tanggal pertemuan sehingga tidak bisa
                    disetujui. Minta coach mengajukan ulang untuk tanggal tertentu.
                </p>
            )}

            <div className="flex flex-col gap-1 mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {catatanLabel}
                    <span className="ml-1 text-gray-400 font-normal">(opsional)</span>
                </label>
                <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder={catatanPlaceholder}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    disabled={submitting}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="plain" onClick={onClose} disabled={submitting}>
                    Batal
                </Button>
                <Button
                    variant="solid"
                    loading={submitting}
                    disabled={tanggalKosong}
                    customColorClass={() =>
                        isApprove
                            ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'
                            : 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500'
                    }
                    onClick={handleConfirm}
                >
                    {isApprove ? 'Setujui' : 'Tolak'}
                </Button>
            </div>
        </Dialog>
    )
}

export default ApproveRejectModal
