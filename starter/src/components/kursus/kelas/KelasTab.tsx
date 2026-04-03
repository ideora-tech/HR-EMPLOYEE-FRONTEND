'use client'

import { useState, useCallback, useEffect } from 'react'
import { Input, Notification, Select, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import KelasTable from '@/components/kursus/kelas/KelasTable'
import KelasForm from '@/components/kursus/kelas/KelasForm'
import KelasService from '@/services/kursus/kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IKelas, ICreateKelas, IUpdateKelas } from '@/@types/kursus.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

interface KelasTabProps {
    pendingAdd?: boolean
    onPendingAddHandled?: () => void
}

const KelasTab = ({ pendingAdd, onPendingAddHandled }: KelasTabProps) => {
    const [list, setList] = useState<IKelas[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editData, setEditData] = useState<IKelas | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IKelas | null>(null)

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
            const res = await KelasService.getAll({
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
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.KELAS)}>
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

    const handleSubmit = async (payload: ICreateKelas | IUpdateKelas) => {
        setSubmitting(true)
        try {
            if (editData) {
                await KelasService.update(editData.id_kelas, payload as IUpdateKelas)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.KELAS)} />)
            } else {
                await KelasService.create(payload as ICreateKelas)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.KELAS)} />)
            }
            setFormOpen(false)
            setEditData(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={editData ? MESSAGES.ERROR.UPDATE(ENTITY.KELAS) : MESSAGES.ERROR.CREATE(ENTITY.KELAS)}
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
            await KelasService.remove(deleteTarget.id_kelas)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.KELAS)} />)
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.KELAS)}>
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
                    placeholder="Cari nama kelas... (tekan Enter)"
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

            <KelasTable
                data={list}
                loading={loading}
                pagingData={{ total, pageIndex: currentPage, pageSize }}
                onPaginationChange={setCurrentPage}
                onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                onEdit={(item) => { setEditData(item); setFormOpen(true) }}
                onDelete={setDeleteTarget}
            />

            <KelasForm
                open={formOpen}
                editData={editData}
                submitting={submitting}
                onClose={() => { setFormOpen(false); setEditData(null) }}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Kelas?"
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
                    Kelas{' '}
                    <span className="font-semibold">&ldquo;{deleteTarget?.nama_kelas}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </>
    )
}

export default KelasTab
