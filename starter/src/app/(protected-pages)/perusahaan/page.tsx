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
    HiOutlineX,
} from 'react-icons/hi'
import PerusahaanTable from '@/components/perusahaan/PerusahaanTable'
import PerusahaanCard from '@/components/perusahaan/PerusahaanCard'
import PerusahaanForm from '@/components/perusahaan/PerusahaanForm'
import PerusahaanOverviewDialog from '@/components/perusahaan/PerusahaanOverviewDialog'
import PerusahaanService from '@/services/perusahaan.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IPerusahaan,
    IPerusahaanCreate,
    IPerusahaanUpdate,
} from '@/@types/perusahaan.types'

type ViewMode = 'table' | 'card'
type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const PerusahaanPage = () => {
    const [list, setList] = useState<IPerusahaan[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('table')

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<IPerusahaan | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IPerusahaan | null>(null)
    const [overviewTarget, setOverviewTarget] = useState<IPerusahaan | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await PerusahaanService.getAll({
                search: search || undefined,
                aktif: aktifFilter !== '' ? Number(aktifFilter) : undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.FETCH(ENTITY.PERUSAHAAN)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, aktifFilter, currentPage, pageSize])

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

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])

    const handleOpenDetail = useCallback((p: IPerusahaan) => {
        setOverviewTarget(p)
    }, [])

    const handleOpenEdit = useCallback((p: IPerusahaan) => {
        setEditTarget(p)
        setFormOpen(true)
    }, [])

    const handleOpenDelete = useCallback((p: IPerusahaan) => {
        setDeleteTarget(p)
    }, [])

    const handleSubmit = async (payload: IPerusahaanCreate | IPerusahaanUpdate) => {
        setSubmitting(true)
        try {
            if (editTarget) {
                await PerusahaanService.update(editTarget.id_perusahaan, payload as IPerusahaanUpdate)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.UPDATED(ENTITY.PERUSAHAAN)}
                    />,
                )
            } else {
                await PerusahaanService.create(payload as IPerusahaanCreate)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.CREATED(ENTITY.PERUSAHAAN)}
                    />,
                )
            }
            setFormOpen(false)
            setEditTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={
                        editTarget
                            ? MESSAGES.ERROR.UPDATE(ENTITY.PERUSAHAAN)
                            : MESSAGES.ERROR.CREATE(ENTITY.PERUSAHAAN)
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
            await PerusahaanService.remove(deleteTarget.id_perusahaan)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.DELETED(ENTITY.PERUSAHAAN)}
                />,
            )
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.DELETE(ENTITY.PERUSAHAAN)}
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
                    content: <h4>Manajemen Perusahaan</h4>,
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
                            Tambah Perusahaan
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
                        placeholder="Cari nama perusahaan... (tekan Enter)"
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearchSubmit()
                        }}
                    />
                    <div className="w-44 shrink-0">
                        <Select<AktifOption>
                            options={AKTIF_OPTIONS}
                            value={
                                AKTIF_OPTIONS.find(
                                    (o) => o.value === aktifFilter,
                                ) ?? AKTIF_OPTIONS[0]
                            }
                            onChange={(opt) => {
                                setAktifFilter((opt as AktifOption).value)
                                setCurrentPage(1)
                            }}
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
                    <PerusahaanTable
                        data={list}
                        loading={loading}
                        pagingData={{ total, pageIndex: currentPage, pageSize }}
                        onPaginationChange={handlePageChange}
                        onSelectChange={handlePageSizeChange}
                        onDetail={handleOpenDetail}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                    />
                ) : loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Spinner size={36} />
                    </div>
                ) : list.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                        Belum ada data perusahaan
                    </div>
                ) : (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {list.map((perusahaan) => (
                            <PerusahaanCard
                                key={perusahaan.id_perusahaan}
                                perusahaan={perusahaan}
                                onEdit={handleOpenEdit}
                                onDelete={handleOpenDelete}
                            />
                        ))}
                    </div>
                )}
            </Card>

            <PerusahaanOverviewDialog
                perusahaan={overviewTarget}
                onClose={() => setOverviewTarget(null)}
            />

            <PerusahaanForm
                open={formOpen}
                editData={editTarget}
                submitting={submitting}
                onClose={() => {
                    setFormOpen(false)
                    setEditTarget(null)
                }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Perusahaan?"
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
                    Perusahaan{' '}
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

export default PerusahaanPage
