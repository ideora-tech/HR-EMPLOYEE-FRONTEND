'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import TagihanTable from '@/components/kursus/tagihan/TagihanTable'
import TagihanForm from '@/components/kursus/tagihan/TagihanForm'
import TagihanDetailDrawer from '@/components/kursus/tagihan/TagihanDetailDrawer'
import TagihanService from '@/services/kursus/tagihan.service'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { ITagihan, ICreateTagihan, IUpdateTagihan, ISiswa } from '@/@types/kursus.types'

interface PendaftaranSiswaTabProps {
    pendingAdd?: boolean
    onPendingAddHandled?: () => void
}

const PendaftaranSiswaTab = ({ pendingAdd, onPendingAddHandled }: PendaftaranSiswaTabProps) => {
    const router = useRouter()

    const [list, setList] = useState<ITagihan[]>([])
    const [siswaList, setSiswaList] = useState<ISiswa[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<ITagihan | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ITagihan | null>(null)
    const [drawerTarget, setDrawerTarget] = useState<ITagihan | null>(null)

    useEffect(() => {
        if (pendingAdd) {
            setEditTarget(null)
            setFormOpen(true)
            onPendingAddHandled?.()
        }
    }, [pendingAdd, onPendingAddHandled])

    useEffect(() => {
        SiswaService.getAll({ aktif: 1, limit: 200 })
            .then((res) => { if (res.success) setSiswaList(res.data) })
            .catch(() => {})
    }, [])

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

    const handleSubmit = async (payload: ICreateTagihan | IUpdateTagihan) => {
        setSubmitting(true)
        try {
            if (editTarget) {
                await TagihanService.update(editTarget.id_tagihan, payload as IUpdateTagihan)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.TAGIHAN)} />)
            } else {
                await TagihanService.create(payload as ICreateTagihan)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.TAGIHAN)} />)
            }
            setFormOpen(false)
            setEditTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={editTarget ? MESSAGES.ERROR.UPDATE(ENTITY.TAGIHAN) : MESSAGES.ERROR.CREATE(ENTITY.TAGIHAN)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
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

    const handleDrawerChanged = () => {
        fetchData()
        if (drawerTarget) {
            TagihanService.getById(drawerTarget.id_tagihan)
                .then((res) => { if (res.success) setDrawerTarget(res.data) })
                .catch(() => {})
        }
    }

    return (
        <>
            <div className="flex items-center gap-3 px-4 pb-3 pt-3">
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
            />

            <TagihanForm
                open={formOpen}
                editData={editTarget}
                siswaList={siswaList}
                submitting={submitting}
                onClose={() => { setFormOpen(false); setEditTarget(null) }}
                onSubmit={handleSubmit}
            />

            {drawerTarget && (
                <TagihanDetailDrawer
                    open={!!drawerTarget}
                    tagihan={drawerTarget}
                    onClose={() => setDrawerTarget(null)}
                    onChanged={handleDrawerChanged}
                />
            )}

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
        </>
    )
}

export default PendaftaranSiswaTab
