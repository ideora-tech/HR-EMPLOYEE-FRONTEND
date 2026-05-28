'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Button,
    Card,
    Notification,
    toast,
    Input,
} from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import TagihanTable from '@/components/kursus/tagihan/TagihanTable'
import TagihanDetailDrawer from '@/components/kursus/tagihan/TagihanDetailDrawer'
import TagihanService from '@/services/kursus/tagihan.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { ITagihan } from '@/@types/kursus.types'

const STATUS_FILTERS: { label: string; value: number | null; activeClass: string }[] = [
    { label: 'Semua', value: null, activeClass: 'bg-gray-700 text-white border-gray-700 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-200' },
    { label: 'Menunggu', value: 1, activeClass: 'bg-gray-600 text-white border-gray-600' },
    { label: 'Sebagian', value: 2, activeClass: 'bg-amber-500 text-white border-amber-500' },
    { label: 'Lunas', value: 3, activeClass: 'bg-emerald-500 text-white border-emerald-500' },
    { label: 'Dibatalkan', value: 4, activeClass: 'bg-red-500 text-white border-red-500' },
]

const TagihanPage = () => {
    const router = useRouter()

    const [list, setList] = useState<ITagihan[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [deleteTarget, setDeleteTarget] = useState<ITagihan | null>(null)
    const [drawerTarget, setDrawerTarget] = useState<ITagihan | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await TagihanService.getAll({
                search: search || undefined,
                status: filterStatus ?? undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.TAGIHAN)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, filterStatus, currentPage, pageSize])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleSearchSubmit = () => {
        setSearch(searchInput)
        setCurrentPage(1)
    }

    const handleSearchClear = () => {
        setSearchInput('')
        setSearch('')
        setCurrentPage(1)
    }

    const handleFilterStatus = (status: number | null) => {
        setFilterStatus(status)
        setCurrentPage(1)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await TagihanService.remove(deleteTarget.id_tagihan)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.TAGIHAN)} />)
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.TAGIHAN)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleCetak = async (item: ITagihan) => {
        try {
            await TagihanService.cetak(item.id_tagihan)
        } catch {
            toast.push(<Notification type="danger" title="Gagal mengunduh invoice" />)
        }
    }

    const handleDrawerChanged = () => {
        fetchData()
        if (drawerTarget) {
            TagihanService.getById(drawerTarget.id_tagihan)
                .then((res) => { if (res.success) setDrawerTarget(res.data) })
                .catch(() => { })
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Tagihan</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                            icon={<HiPlusCircle />}
                            onClick={() => router.push(ROUTES.KURSUS_TAGIHAN_BUAT)}
                        >
                            Buat Tagihan
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="flex flex-col gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari nama siswa... (tekan Enter)"
                        suffix={
                            searchInput ? (
                                <HiOutlineX
                                    className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                    onClick={handleSearchClear}
                                />
                            ) : (
                                <HiOutlineSearch
                                    className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                    onClick={handleSearchSubmit}
                                />
                            )
                        }
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.value ?? 'all'}
                                onClick={() => handleFilterStatus(f.value)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                    filterStatus === f.value
                                        ? f.activeClass
                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <TagihanTable
                    data={list}
                    loading={loading}
                    pagingData={{ total, pageIndex: currentPage, pageSize }}
                    onPaginationChange={setCurrentPage}
                    onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                    onDetail={(item) => setDrawerTarget(item)}
                    onBayar={(item) =>
                        router.push(`${ROUTES.KURSUS_TAGIHAN_CATAT_PEMBAYARAN}?id=${item.id_tagihan}`)
                    }
                    onDelete={setDeleteTarget}
                    onCetak={handleCetak}
                />
            </Card>

            {/* Detail & payment drawer */}
            {drawerTarget && (
                <TagihanDetailDrawer
                    open={!!drawerTarget}
                    tagihan={drawerTarget}
                    onClose={() => setDrawerTarget(null)}
                    onChanged={handleDrawerChanged}
                    readOnly
                />
            )}

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

export default TagihanPage
