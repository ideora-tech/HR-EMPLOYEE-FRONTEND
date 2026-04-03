'use client'

import { useState, useCallback, useEffect } from 'react'
import { Input, Notification, Select, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import PaketTable from '@/components/kursus/paket/PaketTable'
import PaketForm from '@/components/kursus/paket/PaketForm'
import PaketService from '@/services/kursus/paket.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IPaket, ICreatePaket, IUpdatePaket } from '@/@types/kursus.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

interface PaketKursusTabProps {
    pendingAdd?: boolean
    onPendingAddHandled?: () => void
}

const PaketKursusTab = ({ pendingAdd, onPendingAddHandled }: PaketKursusTabProps) => {
    const [list, setList] = useState<IPaket[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editData, setEditData] = useState<IPaket | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IPaket | null>(null)

    useEffect(() => {
        if (pendingAdd) {
            setEditData(null)
            setFormOpen(true)
            onPendingAddHandled?.()
        }
    }, [pendingAdd, onPendingAddHandled])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await PaketService.getAll({
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
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.PAKET_KURSUS)}>
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

    const handleSubmit = async (payload: ICreatePaket | IUpdatePaket) => {
        setSubmitting(true)
        try {
            if (editData) {
                await PaketService.update(editData.id_paket, payload as IUpdatePaket)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.PAKET_KURSUS)} />)
            } else {
                await PaketService.create(payload as ICreatePaket)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.PAKET_KURSUS)} />)
            }
            setFormOpen(false)
            setEditData(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={editData ? MESSAGES.ERROR.UPDATE(ENTITY.PAKET_KURSUS) : MESSAGES.ERROR.CREATE(ENTITY.PAKET_KURSUS)}
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
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.PAKET_KURSUS)} />)
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.PAKET_KURSUS)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-3 px-4 pb-3">
                <Input
                    className="flex-1"
                    placeholder="Cari nama paket... (tekan Enter)"
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
                <Select<AktifOption>
                    className="w-44"
                    options={AKTIF_OPTIONS}
                    value={AKTIF_OPTIONS.find((o) => o.value === aktifFilter) ?? AKTIF_OPTIONS[0]}
                    onChange={(opt) => { setAktifFilter((opt as AktifOption).value); setCurrentPage(1) }}
                />
            </div>

            <PaketTable
                data={list}
                loading={loading}
                pagingData={{ total, pageIndex: currentPage, pageSize }}
                onPaginationChange={setCurrentPage}
                onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                onEdit={(item) => { setEditData(item); setFormOpen(true) }}
                onDelete={setDeleteTarget}
            />

            <PaketForm
                open={formOpen}
                editData={editData}
                submitting={submitting}
                onClose={() => { setFormOpen(false); setEditData(null) }}
                onSubmit={handleSubmit}
            />

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
                    <span className="font-semibold">&ldquo;{deleteTarget?.nama_paket}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default PaketKursusTab
