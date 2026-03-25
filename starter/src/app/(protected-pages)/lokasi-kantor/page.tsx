'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Card, Input, Select, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import LokasiKantorTable from '@/components/lokasi-kantor/LokasiKantorTable'
import LokasiKantorForm from '@/components/lokasi-kantor/LokasiKantorForm'
import LokasiKantorService from '@/services/lokasi-kantor.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ILokasiKantor, ICreateLokasiKantor, IUpdateLokasiKantor } from '@/@types/organisasi.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const LokasiKantorPage = () => {
    const [list, setList] = useState<ILokasiKantor[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editData, setEditData] = useState<ILokasiKantor | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ILokasiKantor | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await LokasiKantorService.getAll({
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
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.LOKASI_KANTOR)}>
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
        setEditData(null)
        setFormOpen(true)
    }

    const handleOpenEdit = (item: ILokasiKantor) => {
        setEditData(item)
        setFormOpen(true)
    }

    const handleFormClose = () => {
        setFormOpen(false)
        setEditData(null)
    }

    const handleSubmit = async (payload: ICreateLokasiKantor | IUpdateLokasiKantor) => {
        setSubmitting(true)
        try {
            if (editData) {
                await LokasiKantorService.update(editData.id_lokasi, payload as IUpdateLokasiKantor)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.UPDATED(ENTITY.LOKASI_KANTOR)}
                    />,
                )
            } else {
                await LokasiKantorService.create(payload as ICreateLokasiKantor)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.CREATED(ENTITY.LOKASI_KANTOR)}
                    />,
                )
            }
            handleFormClose()
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={
                        editData
                            ? MESSAGES.ERROR.UPDATE(ENTITY.LOKASI_KANTOR)
                            : MESSAGES.ERROR.CREATE(ENTITY.LOKASI_KANTOR)
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
            await LokasiKantorService.remove(deleteTarget.id_lokasi)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.DELETED(ENTITY.LOKASI_KANTOR)}
                />,
            )
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.LOKASI_KANTOR)}>
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
                    content: <h4>Manajemen Lokasi Kantor</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={handleOpenAdd}
                        >
                            Tambah Lokasi
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari kode atau nama lokasi... (tekan Enter)"
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

                <LokasiKantorTable
                    data={list}
                    loading={loading}
                    pagingData={{ total, pageIndex: currentPage, pageSize }}
                    onPaginationChange={setCurrentPage}
                    onSelectChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                    }}
                    onEdit={handleOpenEdit}
                    onDelete={setDeleteTarget}
                />
            </Card>

            <LokasiKantorForm
                open={formOpen}
                editData={editData}
                submitting={submitting}
                onClose={handleFormClose}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Lokasi Kantor?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{
                    loading: submitting,
                    customColorClass: () =>
                        'border-error ring-1 ring-error text-error hover:border-error hover:ring-error hover:text-error bg-transparent',
                }}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            >
                <p className="text-sm">
                    Yakin ingin menghapus lokasi kantor{' '}
                    <strong>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat
                    dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default LokasiKantorPage
