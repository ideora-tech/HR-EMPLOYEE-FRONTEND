'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Card, Input, Select, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import DepartemenTable from '@/components/departemen/DepartemenTable'
import DepartemenForm from '@/components/departemen/DepartemenForm'
import DepartemenService from '@/services/departemen.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IDepartemen, ICreateDepartemen, IUpdateDepartemen } from '@/@types/organisasi.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const DepartemenPage = () => {
    const [list, setList] = useState<IDepartemen[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editData, setEditData] = useState<IDepartemen | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IDepartemen | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await DepartemenService.getAll({
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
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.DEPARTEMEN)}>
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

    const handleOpenEdit = (item: IDepartemen) => {
        setEditData(item)
        setFormOpen(true)
    }

    const handleFormClose = () => {
        setFormOpen(false)
        setEditData(null)
    }

    const handleSubmit = async (payload: ICreateDepartemen | IUpdateDepartemen) => {
        setSubmitting(true)
        try {
            if (editData) {
                await DepartemenService.update(editData.id_departemen, payload as IUpdateDepartemen)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.UPDATED(ENTITY.DEPARTEMEN)}
                    />,
                )
            } else {
                await DepartemenService.create(payload as ICreateDepartemen)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.CREATED(ENTITY.DEPARTEMEN)}
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
                            ? MESSAGES.ERROR.UPDATE(ENTITY.DEPARTEMEN)
                            : MESSAGES.ERROR.CREATE(ENTITY.DEPARTEMEN)
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
            await DepartemenService.remove(deleteTarget.id_departemen)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.DELETED(ENTITY.DEPARTEMEN)}
                />,
            )
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.DEPARTEMEN)}>
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
                    content: <h4>Manajemen Departemen</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={handleOpenAdd}
                        >
                            Tambah Departemen
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari kode atau nama departemen... (tekan Enter)"
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

                <DepartemenTable
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

            <DepartemenForm
                open={formOpen}
                editData={editData}
                submitting={submitting}
                onClose={handleFormClose}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Departemen?"
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
                    Yakin ingin menghapus departemen{' '}
                    <strong>{deleteTarget?.nama_departemen}</strong>? Tindakan ini tidak dapat
                    dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default DepartemenPage
