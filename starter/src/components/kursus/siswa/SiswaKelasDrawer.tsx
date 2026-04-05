'use client'

import { useState, useEffect } from 'react'
import { Drawer, Tag, Spinner } from '@/components/ui'
import { HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineReceiptTax } from 'react-icons/hi'
import TagihanService from '@/services/kursus/tagihan.service'
import { formatRupiah } from '@/utils/formatNumber'
import type { ISiswa, ISiswaKelasItem, ITagihan } from '@/@types/kursus.types'

interface SiswaKelasDrawerProps {
    isOpen: boolean
    siswa: ISiswa | null
    onClose: () => void
}

const formatDate = (raw: string | null): string => {
    if (!raw) return '-'
    const d = new Date(raw)
    if (isNaN(d.getTime())) return raw
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const KelasProgressCard = ({ item }: { item: ISiswaKelasItem }) => {
    const hadir = item.total_sesi_hadir
    const tidakHadir = item.total_sesi_tidak_hadir
    const total = item.total_sesi
    const used = hadir + tidakHadir
    const tersisa = total !== null ? total - used : null
    const pct = total && total > 0 ? Math.min(100, Math.round((used / total) * 100)) : null

    // progress bar color
    const barColor =
        item.status === 0
            ? 'bg-gray-400'
            : pct !== null && pct >= 80
                ? 'bg-red-500'
                : pct !== null && pct >= 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'

    return (
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <HiOutlineAcademicCap className="text-lg shrink-0 text-gray-500" />
                    <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {item.nama_kelas}
                    </span>
                </div>
                <Tag
                    className={
                        item.status === 1
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 shrink-0'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 shrink-0'
                    }
                >
                    {item.status === 1 ? 'Berjalan' : 'Selesai'}
                </Tag>
            </div>

            {/* Tanggal mulai */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <HiOutlineCalendar className="text-sm shrink-0" />
                <span>Mulai: {formatDate(item.mulai_kelas)}</span>
            </div>

            {/* Progress bar */}
            {total !== null ? (
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{used} / {total} sesi</span>
                        <span>{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all ${barColor}`}
                            style={{ width: `${pct ?? 0}%` }}
                        />
                    </div>
                </div>
            ) : (
                <p className="text-xs text-gray-400 italic">Total sesi tidak ditetapkan</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {hadir}
                    </p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Hadir</p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-red-500 dark:text-red-400">
                        {tidakHadir}
                    </p>
                    <p className="text-xs text-red-500/70 dark:text-red-400/70">Tidak Hadir</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {tersisa !== null ? tersisa : '∞'}
                    </p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Sisa Sesi</p>
                </div>
            </div>
        </div>
    )
}

const TAGIHAN_STATUS: Record<number, { label: string; cls: string }> = {
    1: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' },
    2: { label: 'Sebagian', cls: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' },
    3: { label: 'Lunas', cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' },
    4: { label: 'Dibatalkan', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
}

const TagihanCard = ({ item }: { item: ITagihan }) => {
    const st = TAGIHAN_STATUS[item.status] ?? TAGIHAN_STATUS[1]
    const sisa = item.total_harga - item.total_bayar
    return (
        <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">
                        {item.nama_biaya}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{item.nama_kelas}</p>
                </div>
                <Tag className={`${st.cls} shrink-0 text-xs`}>{st.label}</Tag>
            </div>

            {item.nama_paket && (
                <p className="text-xs text-gray-500">
                    Paket: <span className="font-medium">{item.nama_paket}</span>
                    {item.nama_kategori_umur && <span> · {item.nama_kategori_umur}</span>}
                </p>
            )}

            <div className="grid grid-cols-3 gap-2 pt-0.5">
                <div className="text-center">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {formatRupiah(item.total_harga)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-400">Dibayar</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(item.total_bayar)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-400">Sisa</p>
                    <p className={`text-sm font-semibold ${sisa > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400'}`}>
                        {sisa > 0 ? formatRupiah(sisa) : '-'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <HiOutlineCalendar className="text-sm shrink-0" />
                <span>{formatDate(item.dibuat_pada)}</span>
            </div>
        </div>
    )
}

const SiswaKelasDrawer = ({ isOpen, siswa, onClose }: SiswaKelasDrawerProps) => {
    const kelas = siswa?.kelas ?? []
    const kelasAktif = kelas.filter((k) => k.status === 1)
    const kelasSelesai = kelas.filter((k) => k.status === 0)

    const [tagihan, setTagihan] = useState<ITagihan[]>([])
    const [loadingTagihan, setLoadingTagihan] = useState(false)

    useEffect(() => {
        if (!isOpen || !siswa) { setTagihan([]); return }
        setLoadingTagihan(true)
        TagihanService.getBySiswa(siswa.id_siswa)
            .then((res) => setTagihan(res.data))
            .catch(() => setTagihan([]))
            .finally(() => setLoadingTagihan(false))
    }, [isOpen, siswa])

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            placement="right"
            width={420}
            title={
                <div>
                    <p className="font-semibold text-base">Riwayat Kelas</p>
                    <p className="text-sm text-gray-500 font-normal">{siswa?.nama_siswa ?? ''}</p>
                </div>
            }
        >
            <div className="px-4 py-4 space-y-6 overflow-y-auto">
                {/* Kelas kosong */}
                {kelas.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-3">
                        <HiOutlineAcademicCap className="text-4xl" />
                        <p className="text-sm">Siswa ini belum mengikuti kelas apapun</p>
                    </div>
                )}

                {/* Kelas Aktif */}
                {kelasAktif.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Kelas Aktif ({kelasAktif.length})
                        </p>
                        {kelasAktif.map((k) => (
                            <KelasProgressCard key={k.id_catat} item={k} />
                        ))}
                    </div>
                )}

                {/* Kelas Selesai */}
                {kelasSelesai.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Kelas Selesai ({kelasSelesai.length})
                        </p>
                        {kelasSelesai.map((k) => (
                            <KelasProgressCard key={k.id_catat} item={k} />
                        ))}
                    </div>
                )}

                {/* Divider */}
                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Riwayat Tagihan */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <HiOutlineReceiptTax className="text-base text-gray-400" />
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Riwayat Tagihan
                        </p>
                    </div>

                    {loadingTagihan && (
                        <div className="flex justify-center py-6">
                            <Spinner size={30} />
                        </div>
                    )}

                    {!loadingTagihan && tagihan.length === 0 && (
                        <p className="text-sm text-gray-400 italic text-center py-4">
                            Belum ada tagihan
                        </p>
                    )}

                    {!loadingTagihan && tagihan.map((t) => (
                        <TagihanCard key={t.id_tagihan} item={t} />
                    ))}
                </div>
            </div>
        </Drawer>
    )
}

export default SiswaKelasDrawer

