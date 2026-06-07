'use client'

import { useState, useEffect } from 'react'
import { Drawer } from '@/components/ui'
import { HiOutlinePhone, HiOutlineClipboard } from 'react-icons/hi'
import { toast, Notification } from '@/components/ui'
import CancelKelasService from '@/services/kursus/cancel-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import type { ICancelKelasDetail } from '@/@types/kursus.types'

interface Props {
    open: boolean
    idCancel: string
    onClose: () => void
}

export default function SiswaTerdampakDrawer({ open, idCancel, onClose }: Props) {
    const [detail, setDetail] = useState<ICancelKelasDetail | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && idCancel) {
            setLoading(true)
            CancelKelasService.getById(idCancel)
                .then(res => setDetail(res.data))
                .catch(err => toast.push(<Notification type="danger" title={parseApiError(err)} />))
                .finally(() => setLoading(false))
        }
    }, [open, idCancel])

    const handleCopyList = () => {
        if (!detail) return
        const text = detail.siswa_terdampak
            .map(s => `${s.nama_siswa}${s.telepon ? ` — ${s.telepon}` : ''}`)
            .join('\n')
        navigator.clipboard.writeText(text)
        toast.push(<Notification type="success" title="Daftar siswa disalin" />)
    }

    return (
        <Drawer
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            title="Siswa Terdampak"
            width={380}
        >
            {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Memuat...</div>
            ) : detail ? (
                <div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
                        <p className="font-semibold">{detail.nama_kelas}</p>
                        <p className="text-gray-500">{detail.nama_karyawan} · {detail.jam_mulai}–{detail.jam_selesai}</p>
                        <p className="text-red-500 font-medium">
                            Dibatalkan: {new Date(detail.tanggal + 'T12:00:00').toLocaleDateString('id-ID', {
                                weekday: 'long', day: 'numeric', month: 'long',
                            })}
                        </p>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700">
                            {detail.siswa_terdampak.length} siswa terdampak
                        </p>
                        {detail.siswa_terdampak.length > 0 && (
                            <button
                                onClick={handleCopyList}
                                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                            >
                                <HiOutlineClipboard className="text-sm" />
                                Salin daftar
                            </button>
                        )}
                    </div>
                    {detail.siswa_terdampak.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Tidak ada siswa terdaftar</p>
                    ) : (
                        <div className="space-y-2">
                            {detail.siswa_terdampak.map(siswa => (
                                <div key={siswa.id_siswa} className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium">{siswa.nama_siswa}</p>
                                    {siswa.telepon && (
                                        <a href={`tel:${siswa.telepon}`} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                                            <HiOutlinePhone className="text-sm" />
                                            {siswa.telepon}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </Drawer>
    )
}
