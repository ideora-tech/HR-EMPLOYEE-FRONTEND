'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Button,
    Card,
    Input,
    Select,
    Notification,
    Spinner,
    toast,
} from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiPlusCircle,
    HiOutlineViewGrid,
    HiOutlineViewList,
    HiOutlineSearch,
} from 'react-icons/hi'
import PaketTable from '@/components/paket/PaketTable'
import PaketCard from '@/components/paket/PaketCard'
import PaketForm from '@/components/paket/PaketForm'
import PaketService from '@/services/paket.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IPaket,
    IPaketCreate,
    IPaketUpdate,
    KodePaket,
} from '@/@types/paket.types'

type ViewMode = 'table' | 'card'
type KodeOption = { value: '' | KodePaket; label: string }

const KODE_OPTIONS: KodeOption[] = [
    { value: '', label: 'Semua Kode' },
    { value: 'FREE', label: 'Free' },
    { value: 'STARTER', label: 'Starter' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'ENTERPRISE', label: 'Enterprise' },
]

const PaketPage = () => {
    const [paketList, setPaketList] = useState<IPaket[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('table')

    const [search, setSearch] = useState('')
    const [kodePaketFilter, setKodePaketFilter] = useState<'' | KodePaket>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<IPaket | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IPaket | null>(null)

    const fetchPaket = useCallback(async () => {
        setLoading(true)
        try {
            const res = await PaketService.getAll({
                search: search || undefined,
                kode_paket: kodePaketFilter || undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setPaketList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.FETCH(ENTITY.PAKET)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, kodePaketFilter, currentPage, pageSize])

    useEffect(() => {
        fetchPaket()
    }, [fetchPaket])

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setCurrentPage(1)
    }

    const handleFilterChange = (value: '' | KodePaket) => {
        setKodePaketFilter(value)
        setCurrentPage(1)
    }

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])

    const handleOpenEdit = useCallback((p: IPaket) => {
        setEditTarget(p)
        setFormOpen(true)
    }, [])

    const handleOpenDelete = useCallback((p: IPaket) => {
        setDeleteTarget(p)
    }, [])

    const handleSubmit = async (payload: IPaketCreate | IPaketUpdate) => {
        setSubmitting(true)
        try {
            if (editTarget) {
                await PaketService.update(
                    editTarget.id_paket,
                    payload as IPaketUpdate,
                )
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.UPDATED(ENTITY.PAKET)}
                    />,
                )
            } else {
                await PaketService.create(payload as IPaketCreate)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.CREATED(ENTITY.PAKET)}
                    />,
                )
            }
            setFormOpen(false)
            setEditTarget(null)
            fetchPaket()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={
                        editTarget
                            ? MESSAGES.ERROR.UPDATE(ENTITY.PAKET)
                            : MESSAGES.ERROR.CREATE(ENTITY.PAKET)
                    }
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
            await PaketService.remove(deleteTarget.id_paket)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.DELETED(ENTITY.PAKET)}
                />,
            )
            setDeleteTarget(null)
            fetchPaket()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.DELETE(ENTITY.PAKET)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Manajemen Paket</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={() => {
                                setEditTarget(null)
                                setFormOpen(true)
                            }}
                        >
                            Tambah Paket
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                {/* Filter row */}
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari nama paket..."
                        suffix={
                            <HiOutlineSearch className="text-gray-400 text-lg" />
                        }
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    <div className="w-44 shrink-0">
                        <Select<KodeOption>
                            options={KODE_OPTIONS}
                            value={
                                KODE_OPTIONS.find(
                                    (o) => o.value === kodePaketFilter,
                                ) ?? KODE_OPTIONS[0]
                            }
                            onChange={(opt) =>
                                handleFilterChange((opt as KodeOption).value)
                            }
                        />
                    </div>
                    <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
                        <button
                            title="Tabel"
                            className={`p-2 text-lg transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => setViewMode('table')}
                        >
                            <HiOutlineViewList />
                        </button>
                        <button
                            title="Kartu"
                            className={`p-2 text-lg transition-colors ${
                                viewMode === 'card'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => setViewMode('card')}
                        >
                            <HiOutlineViewGrid />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'table' ? (
                    <PaketTable
                        data={paketList}
                        loading={loading}
                        pagingData={{
                            total,
                            pageIndex: currentPage,
                            pageSize,
                        }}
                        onPaginationChange={handlePageChange}
                        onSelectChange={handlePageSizeChange}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                    />
                ) : loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Spinner size={36} />
                    </div>
                ) : paketList.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                        Belum ada data paket
                    </div>
                ) : (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {paketList.map((paket) => (
                            <PaketCard
                                key={paket.id_paket}
                                paket={paket}
                                onEdit={handleOpenEdit}
                                onDelete={handleOpenDelete}
                            />
                        ))}
                    </div>
                )}
            </Card>

            {/* Form Modal */}
            <PaketForm
                open={formOpen}
                editData={editTarget}
                submitting={submitting}
                onClose={() => {
                    setFormOpen(false)
                    setEditTarget(null)
                }}
                onSubmit={handleSubmit}
            />

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Paket?"
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
                    Paket{' '}
                    <span className="font-semibold">
                        &ldquo;{deleteTarget?.nama}&rdquo;
                    </span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat
                    dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default PaketPage
