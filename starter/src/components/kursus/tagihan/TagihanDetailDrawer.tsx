'use client'

import { useState, useEffect } from 'react'
import { Button, Drawer, Notification, toast, Dialog } from '@/components/ui'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCash, HiOutlineUser, HiOutlineTag } from 'react-icons/hi'
import PembayaranService from '@/services/kursus/pembayaran.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ITagihan, IPembayaran } from '@/@types/kursus.types'
import PembayaranForm from './PembayaranForm'

/* ─── helpers ────────────────────────────────────────────── */

const STATUS_MAP: Record<number, { label: string; class: string }> = {
    1: { label: 'Menunggu', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
    2: { label: 'Sebagian', class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
    3: { label: 'Lunas', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
    4: { label: 'Dibatalkan', class: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' },
}

const METODE_CLASS: Record<string, string> = {
    TUNAI: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    TRANSFER: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    QRIS: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
}

function formatRupiah(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatTanggal(s: string) {
    return new Date(s + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
    })
}

/* ─── props ──────────────────────────────────────────────── */

interface TagihanDetailDrawerProps {
    open: boolean
    tagihan: ITagihan | null
    onClose: () => void
    onChanged: () => void
    readOnly?: boolean
}

/* ─── component ──────────────────────────────────────────── */

const TagihanDetailDrawer = ({ open, tagihan, onClose, onChanged, readOnly = false }: TagihanDetailDrawerProps) => {
    const [payments, setPayments] = useState<IPembayaran[]>([])
    const [loading, setLoading] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    /* ── Load riwayat pembayaran ── */
    useEffect(() => {
        if (!open || !tagihan) {
            setPayments([])
            return
        }
        setLoading(true)
        PembayaranService.getByTagihan(tagihan.id_tagihan)
            .then((res) => { if (res.success) setPayments(res.data) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [open, tagihan])

    const handleFormSaved = async () => {
        setFormOpen(false)
        if (!tagihan) return
        setLoading(true)
        try {
            const res = await PembayaranService.getByTagihan(tagihan.id_tagihan)
            if (res.success) setPayments(res.data)
        } finally {
            setLoading(false)
        }
        onChanged()
    }

    const handleDeleteClick = (id: string) => {
        setDeletingId(id)
        setDeleteConfirm(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deletingId) return
        setDeleting(true)
        try {
            await PembayaranService.remove(deletingId)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.PEMBAYARAN)} />,
            )
            setDeleteConfirm(false)
            setDeletingId(null)
            handleFormSaved()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.PEMBAYARAN)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setDeleting(false)
        }
    }

    const sisa = tagihan ? tagihan.total_harga - tagihan.total_bayar : 0
    const pct = tagihan && tagihan.total_harga > 0
        ? Math.round((tagihan.total_bayar / tagihan.total_harga) * 100)
        : 0
    const st = tagihan ? (STATUS_MAP[tagihan.status] ?? STATUS_MAP[1]) : null

    return (
        <>
            <Drawer
                title={
                    <div className="flex items-center gap-2">
                        <HiOutlineCash className="text-lg text-primary" />
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                            Detail Tagihan
                        </span>
                    </div>
                }
                isOpen={open}
                onClose={onClose}
                onRequestClose={onClose}
                placement="right"
                width={480}
            >
                <div className="flex flex-col h-full gap-0">
                    {/* ── Info tagihan ── */}
                    {tagihan && (
                        <div className="px-4 pt-2 pb-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
                            {/* Siswa */}
                            <div className="flex items-start gap-2">
                                <HiOutlineUser className="mt-0.5 shrink-0 text-gray-400" />
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                                        {tagihan.nama_siswa}
                                    </p>
                                </div>
                            </div>

                            {/* Jenis + periode */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <HiOutlineTag className="shrink-0" />
                                <span>{tagihan.nama_biaya}</span>
                                {tagihan.periode && (
                                    <>
                                        <span className="text-gray-300">·</span>
                                        <span>{tagihan.periode}</span>
                                    </>
                                )}
                            </div>

                            {/* Status badge */}
                            {st && (
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.class}`}>
                                    {st.label}
                                </span>
                            )}

                            {/* Progress bayar */}
                            <div>
                                {tagihan.id_diskon && (
                                    <div className="text-xs text-gray-400 mb-2 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Harga biaya</span>
                                            <span>{formatRupiah((tagihan.total_harga) + (tagihan.nominal_diskon ?? 0))}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                            <span>
                                                Diskon — {tagihan.nama_diskon}
                                                {tagihan.persen_diskon ? ` (${tagihan.persen_diskon}%)` : ''}
                                            </span>
                                            <span>− {formatRupiah(tagihan.nominal_diskon ?? 0)}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-1">
                                            <span>Total tagihan</span>
                                            <span>{formatRupiah(tagihan.total_harga)}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Dibayar</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                                        {formatRupiah(tagihan.total_bayar)} / {formatRupiah(tagihan.total_harga)}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-400 rounded-full transition-all"
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>{pct}% sudah dibayar</span>
                                    {sisa > 0 && (
                                        <span className="text-amber-500 font-medium">
                                            Sisa {formatRupiah(sisa)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {tagihan.deskripsi && (
                                <p className="text-sm text-gray-400 italic">&quot;{tagihan.deskripsi}&quot;</p>
                            )}
                        </div>
                    )}

                    {/* ── Riwayat pembayaran ── */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <h6 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                            Riwayat Pembayaran
                        </h6>
                        {!readOnly && tagihan && tagihan.status !== 3 && tagihan.status !== 4 && (
                            <Button
                                size="xs"
                                variant="solid"
                                icon={<HiOutlinePlus />}
                                onClick={() => setFormOpen(true)}
                            >
                                Catat
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="py-14 text-center text-sm text-gray-400">
                                Belum ada pembayaran tercatat.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {payments.map((p) => (
                                    <div key={p.id_pembayaran} className="flex items-center justify-between gap-3 px-4 py-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800 dark:text-gray-100">
                                                    {formatRupiah(p.jumlah)}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${METODE_CLASS[p.metode] ?? ''}`}>
                                                    {p.metode}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatTanggal(p.tanggal_bayar)}
                                                {p.referensi && ` · ${p.referensi}`}
                                            </p>
                                            {p.deskripsi && (
                                                <p className="text-xs text-gray-400 italic">{p.deskripsi}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteClick(p.id_pembayaran)}
                                            className="shrink-0 p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            title="Hapus pembayaran"
                                        >
                                            <HiOutlineTrash className="text-base" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Drawer>

            {/* ── Form catat pembayaran ── */}
            {tagihan && (
                <PembayaranForm
                    open={formOpen}
                    tagihan={tagihan}
                    onClose={() => setFormOpen(false)}
                    onSaved={handleFormSaved}
                />
            )}

            {/* ── Konfirmasi hapus ── */}
            <Dialog
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onRequestClose={() => setDeleteConfirm(false)}
            >
                <div className="flex flex-col gap-4">
                    <h5 className="font-semibold">Hapus Pembayaran</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Data pembayaran akan dihapus dan saldo tagihan otomatis diperbarui. Lanjutkan?
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="plain"
                            onClick={() => setDeleteConfirm(false)}
                            disabled={deleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="solid"
                            color="red"
                            loading={deleting}
                            onClick={handleDeleteConfirm}
                        >
                            Ya, Hapus
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}

export default TagihanDetailDrawer
