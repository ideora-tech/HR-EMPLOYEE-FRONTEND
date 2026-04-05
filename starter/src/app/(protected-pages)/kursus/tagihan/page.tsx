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

const TagihanPage = () => {
    const router = useRouter()

    const [list, setList] = useState<ITagihan[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
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
    }, [search, currentPage, pageSize])

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
                <div className="flex items-center gap-3 px-4 pb-3">
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
