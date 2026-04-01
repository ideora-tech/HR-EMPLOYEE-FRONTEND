'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Button,
    Card,
    Input,
    Select,
    Notification,
    toast,
} from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import DiskonTable from '@/components/kursus/diskon/DiskonTable'
import DiskonForm from '@/components/kursus/diskon/DiskonForm'
import DiskonService from '@/services/kursus/diskon.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IDiskon, ICreateDiskon, IUpdateDiskon } from '@/@types/kursus.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const DiskonPage = () => {
    const [list, setList] = useState<IDiskon[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editData, setEditData] = useState<IDiskon | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IDiskon | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await DiskonService.getAll({
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
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.DISKON)}>
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

    const handleOpenEdit = (item: IDiskon) => {
        setEditData(item)
        setFormOpen(true)
    }

    const handleFormClose = () => {
        setFormOpen(false)
        setEditData(null)
    }

    const handleSubmit = async (payload: ICreateDiskon | IUpdateDiskon) => {
        setSubmitting(true)
        try {
            if (editData) {
                await DiskonService.update(editData.id_diskon, payload as IUpdateDiskon)
                toast.push(
                    <Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.DISKON)} />,
                )
            } else {
                await DiskonService.create(payload as ICreateDiskon)
                toast.push(
                    <Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.DISKON)} />,
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
                            ? MESSAGES.ERROR.UPDATE(ENTITY.DISKON)
                            : MESSAGES.ERROR.CREATE(ENTITY.DISKON)
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
            await DiskonService.remove(deleteTarget.id_diskon)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.DISKON)} />,
            )
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.DISKON)}>
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
                    content: <h4>Manajemen Diskon Kursus</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={handleOpenAdd}
                        >
                            Tambah Diskon
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari kode / nama diskon... (tekan Enter)"
                        suffix={
                            searchInput ? (
                                <HiOutlineX
                                    className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                    onClick={handleSearchClear}
                                />
                            ) : (
                                <HiOutlineSearch className="text-gray-400 text-lg" />
                            )
                        }
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    />
                    <Select<AktifOption>
                        className="w-44"
                        placeholder="Semua Status"
                        options={AKTIF_OPTIONS}
                        value={AKTIF_OPTIONS.find((o) => o.value === aktifFilter) ?? AKTIF_OPTIONS[0]}
                        onChange={(opt) => {
                            setAktifFilter((opt as AktifOption).value)
                            setCurrentPage(1)
                        }}
                    />
                </div>

                <DiskonTable
                    data={list}
                    loading={loading}
                    pagingData={{ total, pageIndex: currentPage, pageSize }}
                    onPaginationChange={(page) => setCurrentPage(page)}
                    onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                    onEdit={handleOpenEdit}
                    onDelete={setDeleteTarget}
                />
            </Card>

            <DiskonForm
                open={formOpen}
                editData={editData}
                submitting={submitting}
                onClose={handleFormClose}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Diskon"
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                confirmButtonColor="red-600"
                loading={submitting}
            >
                <p>
                    Yakin ingin menghapus diskon{' '}
                    <strong>{deleteTarget?.nama_diskon}</strong> (
                    <span className="font-mono">{deleteTarget?.kode_diskon}</span>)?
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default DiskonPage
