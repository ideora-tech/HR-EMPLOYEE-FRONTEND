'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Card, Input, Select, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import CoachTable from '@/components/kursus/coach/CoachTable'
import CoachForm from '@/components/kursus/coach/CoachForm'
import CoachDetailDrawer from '@/components/kursus/coach/CoachDetailDrawer'
import CoachService from '@/services/kursus/coach.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ICoachPublic, ICreateCoach, IUpdateCoach } from '@/@types/kursus.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const CoachPage = () => {
    const [list, setList] = useState<ICoachPublic[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<ICoachPublic | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ICoachPublic | null>(null)
    const [detailTarget, setDetailTarget] = useState<ICoachPublic | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await CoachService.getAll({
                search: search || undefined,
                aktif: aktifFilter !== '' ? (Number(aktifFilter) as 0 | 1) : undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.COACH)}>
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

    const handleOpenAdd = () => {
        setEditTarget(null)
        setFormOpen(true)
    }

    const handleOpenEdit = (row: ICoachPublic) => {
        setEditTarget(row)
        setFormOpen(true)
    }

    const handleFormClose = () => {
        setFormOpen(false)
        setEditTarget(null)
    }

    const handleSubmit = async (payload: ICreateCoach | IUpdateCoach) => {
        setSubmitting(true)
        try {
            if (editTarget) {
                await CoachService.update(editTarget.id_coach, payload as IUpdateCoach)
                toast.push(
                    <Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.COACH)} />,
                )
            } else {
                await CoachService.create(payload as ICreateCoach)
                toast.push(
                    <Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.COACH)} />,
                )
            }
            handleFormClose()
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={editTarget ? MESSAGES.ERROR.UPDATE(ENTITY.COACH) : MESSAGES.ERROR.CREATE(ENTITY.COACH)}
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
            await CoachService.remove(deleteTarget.id_coach)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.COACH)} />,
            )
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.COACH)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card bodyClass="p-0">
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <h4>Manajemen Coach</h4>
                    <Button
                        variant="solid"
                        size="sm"
                        customColorClass={() =>
                            'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'
                        }
                        icon={<HiPlusCircle />}
                        onClick={handleOpenAdd}
                    >
                        Tambah Coach
                    </Button>
                </div>

                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari nama coach atau spesialisasi... (tekan Enter)"
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
                                AKTIF_OPTIONS.find((o) => o.value === aktifFilter) ??
                                AKTIF_OPTIONS[0]
                            }
                            onChange={(opt) => {
                                setAktifFilter((opt as AktifOption).value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                </div>

                <CoachTable
                    data={list}
                    loading={loading}
                    pagingData={{ total, pageIndex: currentPage, pageSize }}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                    }}
                    onEdit={handleOpenEdit}
                    onDelete={setDeleteTarget}
                    onViewDetail={setDetailTarget}
                />
            </Card>

            <CoachForm
                open={formOpen}
                editData={editTarget}
                submitting={submitting}
                onClose={handleFormClose}
                onSubmit={handleSubmit}
            />

            <CoachDetailDrawer
                open={!!detailTarget}
                data={detailTarget}
                onClose={() => setDetailTarget(null)}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Coach?"
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
                    Data coach{' '}
                    <span className="font-semibold">
                        &ldquo;{deleteTarget?.nama_karyawan}&rdquo;
                    </span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default CoachPage
