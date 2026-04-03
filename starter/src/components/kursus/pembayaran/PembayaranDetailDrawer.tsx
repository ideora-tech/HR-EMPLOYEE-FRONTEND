'use client'

import { Drawer } from '@/components/ui'
import {
    HiOutlineCash,
    HiOutlineUser,
    HiOutlineTag,
    HiOutlineCalendar,
    HiOutlineCreditCard,
    HiOutlineDocumentText,
} from 'react-icons/hi'
import type { IPembayaran } from '@/@types/kursus.types'

/* ─── helpers ────────────────────────────────────────────── */

const METODE_CLASS: Record<string, string> = {
    TUNAI: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    TRANSFER: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    QRIS: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
}

function formatRupiah(n: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(n)
}

function formatTanggal(s: string) {
    return new Date(s + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

function formatDatetime(s: string) {
    return new Date(s).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/* ─── props ──────────────────────────────────────────────── */

interface PembayaranDetailDrawerProps {
    open: boolean
    pembayaran: IPembayaran | null
    onClose: () => void
}

/* ─── row helper ─────────────────────────────────────────── */

const Row = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
}) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
        <span className="mt-0.5 text-gray-400 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</div>
        </div>
    </div>
)

/* ─── component ──────────────────────────────────────────── */

const PembayaranDetailDrawer = ({
    open,
    pembayaran,
    onClose,
}: PembayaranDetailDrawerProps) => {
    if (!pembayaran) return null

    const metodeCls = METODE_CLASS[pembayaran.metode] ?? 'bg-gray-100 text-gray-600'
    const sisa = pembayaran.tagihan
        ? pembayaran.tagihan.total_harga - pembayaran.tagihan.total_bayar
        : null

    return (
        <Drawer
            title={
                <div className="flex items-center gap-2">
                    <HiOutlineCash className="text-lg text-primary" />
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Detail Pembayaran
                    </span>
                </div>
            }
            isOpen={open}
            onClose={onClose}
            onRequestClose={onClose}
            placement="right"
            width={440}
        >
            <div className="px-1 py-2">

                {/* ── Jumlah besar di atas ── */}
                <div className="mb-6 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-5 text-center">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Jumlah Dibayar</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {formatRupiah(pembayaran.jumlah)}
                    </p>
                    <span className={`mt-2 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${metodeCls}`}>
                        {pembayaran.metode}
                    </span>
                </div>

                {/* ── Info tagihan ── */}
                {pembayaran.tagihan && (
                    <div className="mb-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-4">
                        <Row
                            icon={<HiOutlineUser />}
                            label="Siswa"
                            value={pembayaran.tagihan.nama_siswa}
                        />
                        <Row
                            icon={<HiOutlineTag />}
                            label="Tagihan"
                            value={
                                <div className="flex flex-col gap-0.5">
                                    <span>Total: {formatRupiah(pembayaran.tagihan.total_harga)}</span>
                                    {sisa !== null && sisa >= 0 && (
                                        <span className="text-xs text-amber-500">
                                            Sisa setelah pembayaran ini: {formatRupiah(sisa)}
                                        </span>
                                    )}
                                </div>
                            }
                        />
                    </div>
                )}

                {/* ── Detail pembayaran ── */}
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 px-4">
                    <Row
                        icon={<HiOutlineCalendar />}
                        label="Tanggal Pembayaran"
                        value={formatTanggal(pembayaran.tanggal_bayar)}
                    />
                    <Row
                        icon={<HiOutlineCreditCard />}
                        label="Nomor Referensi"
                        value={pembayaran.referensi ?? (
                            <span className="text-gray-400 font-normal">—</span>
                        )}
                    />
                    <Row
                        icon={<HiOutlineDocumentText />}
                        label="Keterangan"
                        value={pembayaran.deskripsi ?? (
                            <span className="text-gray-400 font-normal">—</span>
                        )}
                    />
                    <Row
                        icon={<HiOutlineCash />}
                        label="Status"
                        value={
                            <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${pembayaran.aktif === 1
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                                        : 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300'
                                    }`}
                            >
                                {pembayaran.aktif === 1 ? 'Aktif' : 'Nonaktif'}
                            </span>
                        }
                    />
                </div>

                {/* ── Timestamps ── */}
                <div className="mt-4 space-y-1 text-xs text-gray-400 px-1">
                    <p>Dicatat: {formatDatetime(pembayaran.dibuat_pada)}</p>
                    {pembayaran.diubah_pada && (
                        <p>Diperbarui: {formatDatetime(pembayaran.diubah_pada)}</p>
                    )}
                </div>
            </div>
        </Drawer>
    )
}

export default PembayaranDetailDrawer
