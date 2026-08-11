'use client'

import { useState } from 'react'
import { Dialog, Button } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiOutlineDocumentDownload, HiOutlineTrash, HiOutlinePhotograph, HiOutlineExternalLink } from 'react-icons/hi'
import { formatRupiah } from '@/utils/formatNumber'
import { toProxyFileUrl } from '@/utils/fileUrl'
import type { IPembayaran } from '@/@types/kursus.types'

const STATUS_KONFIRMASI: Record<number, { label: string; cls: string }> = {
    0: { label: 'Menunggu Konfirmasi', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
    1: { label: 'Dikonfirmasi', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
    2: { label: 'Ditolak', cls: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
}

const METODE_LABEL: Record<string, string> = {
    TUNAI: 'Tunai',
    TRANSFER: 'Transfer Bank',
    QRIS: 'QRIS',
}

function fmtDate(d: string | null | undefined): string {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

interface Props {
    pembayaran: IPembayaran | null
    cetakLoading: boolean
    deleteLoading: boolean
    onClose: () => void
    onCetak: () => void
    onDelete: () => void
}

const PembayaranDetailModal = ({ pembayaran, cetakLoading, deleteLoading, onClose, onCetak, onDelete }: Props) => {
    const [showConfirm, setShowConfirm] = useState(false)

    if (!pembayaran) return null

    const st = STATUS_KONFIRMASI[pembayaran.status_konfirmasi]
    const kembalian = Number(pembayaran.kembalian ?? 0)
    const nominalDiterima = Number(pembayaran.nominal_diterima ?? (Number(pembayaran.jumlah) + kembalian))
    const noBukti = `BP-${pembayaran.id_pembayaran.substring(0, 8).toUpperCase()}`

    const buktiUrl = pembayaran.bukti_bayar ? toProxyFileUrl(pembayaran.bukti_bayar) : null
    const isImage = buktiUrl && /\.(jpg|jpeg|png|webp)$/i.test(buktiUrl)
    const isPdf = buktiUrl && /\.pdf$/i.test(buktiUrl)

    return (
        <>
            <Dialog
                isOpen={!!pembayaran}
                onClose={onClose}
                onRequestClose={onClose}
                closable={false}
                width={500}
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h5 className="font-semibold text-gray-800 dark:text-gray-100">Detail Pembayaran</h5>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{noBukti}</p>
                    </div>
                    {st && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>
                            {st.label}
                        </span>
                    )}
                </div>

                {/* Info rows */}
                <div className="flex flex-col gap-2.5 text-sm mb-5">
                    <InfoRow label="Tanggal Bayar" value={fmtDate(pembayaran.tanggal_bayar)} />
                    <InfoRow label="Nama Siswa" value={pembayaran.nama_siswa ?? '—'} />
                    <InfoRow label="Metode" value={METODE_LABEL[pembayaran.metode] ?? pembayaran.metode} />
                    {pembayaran.referensi && (
                        <InfoRow label="No. Referensi" value={pembayaran.referensi} mono />
                    )}
                    {pembayaran.deskripsi && (
                        <InfoRow label="Keterangan" value={pembayaran.deskripsi} />
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                    <InfoRow
                        label="Jumlah Dibayar"
                        value={formatRupiah(pembayaran.jumlah)}
                        bold
                    />
                    {kembalian > 0 && (
                        <>
                            <InfoRow label="Nominal Diterima" value={formatRupiah(nominalDiterima)} />
                            <InfoRow
                                label="Kembalian"
                                value={formatRupiah(kembalian)}
                                valueClass="text-emerald-600 dark:text-emerald-400 font-semibold"
                            />
                        </>
                    )}

                    {pembayaran.dikonfirmasi_at && (
                        <InfoRow label="Dikonfirmasi" value={fmtDate(pembayaran.dikonfirmasi_at)} />
                    )}
                    {pembayaran.catatan_tolak && (
                        <InfoRow
                            label="Catatan Tolak"
                            value={pembayaran.catatan_tolak}
                            valueClass="text-red-500 dark:text-red-400"
                        />
                    )}
                </div>

                {/* Bukti bayar */}
                {buktiUrl && (
                    <div className="mb-5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bukti Bayar</p>
                        {isImage ? (
                            <a href={buktiUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={buktiUrl}
                                    alt="Bukti bayar"
                                    className="max-h-48 rounded-lg border border-gray-200 dark:border-gray-700 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                />
                            </a>
                        ) : isPdf ? (
                            <a
                                href={buktiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                <HiOutlinePhotograph className="text-lg" />
                                Lihat Bukti Bayar (PDF)
                                <HiOutlineExternalLink className="text-base" />
                            </a>
                        ) : (
                            <a
                                href={buktiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Lihat Bukti Bayar
                            </a>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Button
                        variant="plain"
                        customColorClass={() =>
                            'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border-transparent'
                        }
                        icon={<HiOutlineTrash />}
                        loading={deleteLoading}
                        onClick={() => setShowConfirm(true)}
                    >
                        Hapus
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="plain" onClick={onClose}>Tutup</Button>
                        <Button
                            variant="solid"
                            customColorClass={() =>
                                'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white border-violet-600'
                            }
                            icon={<HiOutlineDocumentDownload />}
                            loading={cetakLoading}
                            onClick={onCetak}
                        >
                            Cetak Bukti Bayar
                        </Button>
                    </div>
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={showConfirm}
                type="danger"
                title="Hapus Pembayaran?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: deleteLoading,
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => setShowConfirm(false)}
                onCancel={() => setShowConfirm(false)}
                onConfirm={() => {
                    setShowConfirm(false)
                    onDelete()
                }}
            >
                <p className="text-sm">
                    Pembayaran{' '}
                    <span className="font-semibold">&ldquo;{noBukti}&rdquo;</span>{' '}
                    akan dihapus dan status tagihan akan diperbarui ulang.
                </p>
            </ConfirmDialog>
        </>
    )
}

interface InfoRowProps {
    label: string
    value: string
    bold?: boolean
    mono?: boolean
    valueClass?: string
}

const InfoRow = ({ label, value, bold, mono, valueClass }: InfoRowProps) => (
    <div className="flex gap-2">
        <span className="w-36 flex-shrink-0 text-gray-500 dark:text-gray-400">{label}</span>
        <span
            className={[
                'flex-1 text-gray-800 dark:text-gray-100',
                bold ? 'font-semibold' : '',
                mono ? 'font-mono text-xs' : '',
                valueClass ?? '',
            ].join(' ')}
        >
            {value}
        </span>
    </div>
)

export default PembayaranDetailModal
