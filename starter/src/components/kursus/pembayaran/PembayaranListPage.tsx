'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, Input, Select, Button, Notification, toast, Pagination } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiOutlineSearch, HiOutlineX, HiPlusCircle } from 'react-icons/hi'
import TagihanService from '@/services/kursus/tagihan.service'
import PembayaranService from '@/services/kursus/pembayaran.service'
import TagihanFormPage from '@/components/kursus/tagihan/TagihanFormPage'
import { previewPdf } from '@/utils/downloadPdf'
import { parseApiError } from '@/utils/parseApiError'
import { formatRupiah } from '@/utils/formatNumber'
import TagihanGroupRow from './TagihanGroupRow'
import type { ITagihan, IPembayaran, ICreateTagihanBulk } from '@/@types/kursus.types'

const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Menunggu' },
    { value: '2', label: 'Sebagian' },
    { value: '3', label: 'Lunas' },
    { value: '4', label: 'Dibatalkan' },
]

const PAGE_SIZE_OPTIONS = [
    { value: 10, label: '10 / halaman' },
    { value: 25, label: '25 / halaman' },
    { value: 50, label: '50 / halaman' },
]

const PembayaranListPageInner = () => {
    const searchParams = useSearchParams()
    const prefillSiswaId = searchParams.get('id_siswa') ?? undefined
    const prefillJadwalId = searchParams.get('id_jadwal') ?? undefined

    // ── view mode ──
    const [view, setView] = useState<'list' | 'create'>(() =>
        prefillSiswaId ? 'create' : 'list',
    )
    const [submitting, setSubmitting] = useState(false)

    // ── list state ──
    const [list, setList] = useState<ITagihan[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [sumTotalHarga, setSumTotalHarga] = useState(0)
    const [sumTotalBayar, setSumTotalBayar] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // ── filters ──
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    // ── expand / pembayaran cache ──
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [loadingExpandIds, setLoadingExpandIds] = useState<Set<string>>(new Set())
    const [pembayaranCache, setPembayaranCache] = useState<Record<string, IPembayaran[]>>({})
    const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null)

    // ── cetak & delete ──
    const [cetakLoadingId, setCetakLoadingId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ITagihan | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await TagihanService.getAll({
                search: search || undefined,
                status: statusFilter ? Number(statusFilter) : undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta?.total ?? 0)
                setSumTotalHarga(res.meta?.sum_total_harga ?? 0)
                setSumTotalBayar(res.meta?.sum_total_bayar ?? 0)
            }
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setLoading(false)
        }
    }, [search, statusFilter, currentPage, pageSize])

    useEffect(() => { fetchData() }, [fetchData])

    const handleToggle = async (idTagihan: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev)
            if (next.has(idTagihan)) { next.delete(idTagihan) } else { next.add(idTagihan) }
            return next
        })
        if (pembayaranCache[idTagihan] !== undefined) return
        setLoadingExpandIds((prev) => new Set(prev).add(idTagihan))
        try {
            const res = await PembayaranService.getByTagihan(idTagihan)
            setPembayaranCache((prev) => ({ ...prev, [idTagihan]: res.data ?? [] }))
        } catch {
            setPembayaranCache((prev) => ({ ...prev, [idTagihan]: [] }))
        } finally {
            setLoadingExpandIds((prev) => {
                const next = new Set(prev); next.delete(idTagihan); return next
            })
        }
    }

    const handleDownloadPdf = async (p: IPembayaran) => {
        setPdfLoadingId(p.id_pembayaran)
        try {
            const { default: BuktiBayarPDF } = await import('./BuktiBayarPDF')
            const { createElement } = await import('react')
            await previewPdf(
                createElement(BuktiBayarPDF, {
                    data: p,
                    logoUrl: window.location.origin + '/logo-sky.jpeg',
                }),
            )
        } catch {
            toast.push(<Notification type="danger" title="Gagal membuka bukti bayar" />)
        } finally {
            setPdfLoadingId(null)
        }
    }

    const handleCetak = async (tagihan: ITagihan) => {
        setCetakLoadingId(tagihan.id_tagihan)
        try {
            await TagihanService.cetak(tagihan.id_tagihan)
        } catch {
            toast.push(<Notification type="danger" title="Gagal mengunduh invoice" />)
        } finally {
            setCetakLoadingId(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await TagihanService.remove(deleteTarget.id_tagihan)
            toast.push(<Notification type="success" title="Tagihan berhasil dihapus" />)
            setDeleteTarget(null)
            setPembayaranCache((prev) => {
                const next = { ...prev }
                delete next[deleteTarget.id_tagihan]
                return next
            })
            fetchData()
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setSubmitting(false)
        }
    }

    const handleCreateSubmit = async (payload: ICreateTagihanBulk) => {
        setSubmitting(true)
        try {
            await TagihanService.createBulk(payload)
            toast.push(<Notification type="success" title="Tagihan berhasil dibuat" />)
            setView('list')
            fetchData()
        } catch (err) {
            toast.push(<Notification type="danger" title={parseApiError(err)} />)
        } finally {
            setSubmitting(false)
        }
    }

    const commitSearch = () => { setSearch(searchInput); setCurrentPage(1) }
    const clearFilters = () => { setSearchInput(''); setSearch(''); setStatusFilter(''); setCurrentPage(1) }
    const hasFilter = !!(search || statusFilter)

    const pageSizeOptionsMemo = useMemo(() => PAGE_SIZE_OPTIONS, [])

    // ── create view ──────────────────────────────────────────────────────────
    if (view === 'create') {
        return (
            <TagihanFormPage
                submitting={submitting}
                initialSiswaId={prefillSiswaId}
                initialJadwalId={prefillJadwalId}
                onSubmit={handleCreateSubmit}
                onCancel={() => { setSubmitting(false); setView('list') }}
            />
        )
    }

    // ── list view ────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-4">
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Tagihan</p>
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{formatRupiah(sumTotalHarga)}</p>
                    <p className="text-xs text-gray-400 mt-1">{total} tagihan dari filter aktif</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Terbayar</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(sumTotalBayar)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {sumTotalHarga > 0
                            ? `${Math.round((sumTotalBayar / sumTotalHarga) * 100)}% dari total tagihan`
                            : 'Belum ada pembayaran'}
                    </p>
                </div>
            </div>

            <Card
                header={{
                    content: <h4>Riwayat Tagihan & Pembayaran</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                            icon={<HiPlusCircle />}
                            onClick={() => setView('create')}
                        >
                            Buat Tagihan
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3 px-4 pt-4 pb-3">
                    <Input
                        className="min-w-[220px]"
                        placeholder="Cari nama siswa... (Enter)"
                        prefix={<HiOutlineSearch className="text-gray-400" />}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && commitSearch()}
                        suffix={
                            searchInput ? (
                                <HiOutlineX
                                    className="cursor-pointer text-gray-400 hover:text-gray-600"
                                    onClick={() => { setSearchInput(''); setSearch(''); setCurrentPage(1) }}
                                />
                            ) : null
                        }
                    />
                    <Select
                        className="min-w-[160px]"
                        options={STATUS_OPTIONS}
                        value={STATUS_OPTIONS.find((o) => o.value === statusFilter)}
                        onChange={(opt) => {
                            setStatusFilter((opt as { value: string })?.value ?? '')
                            setCurrentPage(1)
                        }}
                    />
                    {hasFilter && (
                        <Button size="sm" variant="plain" onClick={clearFilters} icon={<HiOutlineX />}>
                            Reset Filter
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/10">
                                <th className="py-2 pl-3 pr-1 w-8"></th>
                                <th className="py-2 px-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">No</th>
                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Siswa / Tagihan</th>
                                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Terbayar</th>
                                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Sisa</th>
                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="py-2 px-3 w-28"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-sm text-gray-400">Memuat...</td>
                                </tr>
                            )}
                            {!loading && list.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-sm text-gray-400">Tidak ada data</td>
                                </tr>
                            )}
                            {!loading && list.map((tagihan, i) => (
                                <TagihanGroupRow
                                    key={tagihan.id_tagihan}
                                    tagihan={tagihan}
                                    index={(currentPage - 1) * pageSize + i + 1}
                                    expanded={expandedIds.has(tagihan.id_tagihan)}
                                    loadingExpand={loadingExpandIds.has(tagihan.id_tagihan)}
                                    pembayaran={pembayaranCache[tagihan.id_tagihan] ?? []}
                                    pdfLoadingId={pdfLoadingId}
                                    cetakLoadingId={cetakLoadingId}
                                    onToggle={() => handleToggle(tagihan.id_tagihan)}
                                    onDownloadPdf={handleDownloadPdf}
                                    onDelete={setDeleteTarget}
                                    onCetak={handleCetak}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 px-4 pb-4">
                    <Pagination
                        pageSize={pageSize}
                        currentPage={currentPage}
                        total={total}
                        onChange={(page) => setCurrentPage(page)}
                    />
                    <div style={{ minWidth: 130 }}>
                        <Select
                            size="sm"
                            menuPlacement="top"
                            isSearchable={false}
                            value={pageSizeOptionsMemo.find((o) => o.value === pageSize)}
                            options={pageSizeOptionsMemo}
                            onChange={(opt) => {
                                setPageSize((opt as { value: number })?.value ?? 10)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                </div>
            </Card>

            {/* Delete confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Tagihan?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: submitting,
                    customColorClass: () =>
                        'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white border-red-500',
                }}
                onClose={() => setDeleteTarget(null)}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            >
                <p className="text-sm">
                    Tagihan untuk{' '}
                    <span className="font-semibold">&ldquo;{deleteTarget?.nama_siswa}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

const PembayaranListPage = () => (
    <Suspense>
        <PembayaranListPageInner />
    </Suspense>
)

export default PembayaranListPage
