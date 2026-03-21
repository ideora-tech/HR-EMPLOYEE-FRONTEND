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
import PenggunaTable from '@/components/pengguna/PenggunaTable'
import PenggunaCard from '@/components/pengguna/PenggunaCard'
import PenggunaForm from '@/components/pengguna/PenggunaForm'
import PenggunaService from '@/services/pengguna.service'
import PeranService from '@/services/peran.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IPengguna, IPenggunaCreate, IPenggunaUpdate } from '@/@types/pengguna.types'
import type { IPeran } from '@/@types/peran.types'

type ViewMode = 'table' | 'card'
type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const PenggunaPage = () => {
    const [penggunaList, setPenggunaList] = useState<IPengguna[]>([])
    const [peranList, setPeranList] = useState<IPeran[]>([])
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
    const [editTarget, setEditTarget] = useState<IPengguna | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IPengguna | null>(null)

    useEffect(() => {
        PeranService.getAll({ aktif: 1, limit: 100 })
            .then((res) => { if (res.success) setPeranList(res.data) })
            .catch(() => {})
    }, [])

    const fetchPengguna = useCallback(async () => {
        setLoading(true)
        try {
            const res = await PenggunaService.getAll({
                search: search || undefined,
                aktif: aktifFilter !== '' ? Number(aktifFilter) : undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setPenggunaList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.FETCH(ENTITY.PENGGUNA)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, aktifFilter, currentPage, pageSize])

    useEffect(() => {
        fetchPengguna()
    }, [fetchPengguna])

    const handleSearchSubmit = () => {
        setSearch(searchInput)
        setCurrentPage(1)
    }

    const handleSearchClear = () => {
        setSearchInput('')
        setSearch('')
        setCurrentPage(1)
    }

    const handleFilterChange = (value: '' | '1' | '0') => {
        setAktifFilter(value)
        setCurrentPage(1)
    }

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])

    const handleOpenEdit = useCallback((p: IPengguna) => {
        setEditTarget(p)
        setFormOpen(true)
    }, [])

    const handleOpenDelete = useCallback((p: IPengguna) => {
        setDeleteTarget(p)
    }, [])

    const handleSubmit = async (payload: IPenggunaCreate | IPenggunaUpdate) => {
        setSubmitting(true)
        try {
            if (editTarget) {
                await PenggunaService.update(
                    editTarget.id_pengguna,
                    payload as IPenggunaUpdate,
                )
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.UPDATED(ENTITY.PENGGUNA)}
                    />,
                )
            } else {
                await PenggunaService.create(payload as IPenggunaCreate)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.CREATED(ENTITY.PENGGUNA)}
                    />,
                )
            }
            setFormOpen(false)
            setEditTarget(null)
            fetchPengguna()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={
                        editTarget
                            ? MESSAGES.ERROR.UPDATE(ENTITY.PENGGUNA)
                            : MESSAGES.ERROR.CREATE(ENTITY.PENGGUNA)
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
            await PenggunaService.remove(deleteTarget.id_pengguna)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.DELETED(ENTITY.PENGGUNA)}
                />,
            )
            setDeleteTarget(null)
            fetchPengguna()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.DELETE(ENTITY.PENGGUNA)}
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
                    content: <h4>Manajemen Pengguna</h4>,
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
                            Tambah Pengguna
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
                        placeholder="Cari nama atau email... (tekan Enter)"
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
                            onChange={(opt) =>
                                handleFilterChange(
                                    (opt as AktifOption).value,
                                )
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
                    <PenggunaTable
                        data={penggunaList}
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
                ) : penggunaList.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">
                        Belum ada data pengguna
                    </div>
                ) : (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {penggunaList.map((pengguna) => (
                            <PenggunaCard
                                key={pengguna.id_pengguna}
                                pengguna={pengguna}
                                onEdit={handleOpenEdit}
                                onDelete={handleOpenDelete}
                            />
                        ))}
                    </div>
                )}
            </Card>

            {/* Form Modal */}
            <PenggunaForm
                open={formOpen}
                editData={editTarget}
                submitting={submitting}
                peranList={peranList}
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
                title="Hapus Pengguna?"
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
                    Pengguna{' '}
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

export default PenggunaPage
