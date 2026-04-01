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
import KategoriUmurTable from '@/components/kursus/kategori-umur/KategoriUmurTable'
import KategoriUmurForm from '@/components/kursus/kategori-umur/KategoriUmurForm'
import KategoriUmurService from '@/services/kursus/kategori-umur.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IKategoriUmur, ICreateKategoriUmur, IUpdateKategoriUmur } from '@/@types/kursus.types'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const KategoriUmurPage = () => {
    const [list, setList] = useState<IKategoriUmur[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editData, setEditData] = useState<IKategoriUmur | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IKategoriUmur | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await KategoriUmurService.getAll({
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
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.KATEGORI_UMUR)}>
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

    const handleOpenEdit = (item: IKategoriUmur) => {
        setEditData(item)
        setFormOpen(true)
    }

    const handleFormClose = () => {
        setFormOpen(false)
        setEditData(null)
    }

    const handleSubmit = async (payload: ICreateKategoriUmur | IUpdateKategoriUmur) => {
        setSubmitting(true)
        try {
            if (editData) {
                await KategoriUmurService.update(editData.id_kategori_umur, payload as IUpdateKategoriUmur)
                toast.push(
                    <Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.KATEGORI_UMUR)} />,
                )
            } else {
                await KategoriUmurService.create(payload as ICreateKategoriUmur)
                toast.push(
                    <Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.KATEGORI_UMUR)} />,
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
                            ? MESSAGES.ERROR.UPDATE(ENTITY.KATEGORI_UMUR)
                            : MESSAGES.ERROR.CREATE(ENTITY.KATEGORI_UMUR)
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
            await KategoriUmurService.remove(deleteTarget.id_kategori_umur)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.KATEGORI_UMUR)} />,
            )
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.KATEGORI_UMUR)}>
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
                    content: <h4>Manajemen Kategori Umur</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={handleOpenAdd}
                        >
                            Tambah Kategori
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari nama kategori... (tekan Enter)"
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

                <KategoriUmurTable
                    data={list}
                    loading={loading}
                    pagingData={{ total, pageIndex: currentPage, pageSize }}
                    onPaginationChange={(page) => setCurrentPage(page)}
                    onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                    onEdit={handleOpenEdit}
                    onDelete={setDeleteTarget}
                />
            </Card>

            <KategoriUmurForm
                open={formOpen}
                editData={editData}
                submitting={submitting}
                onClose={handleFormClose}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Kategori Umur"
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                confirmButtonColor="red-600"
                loading={submitting}
            >
                <p>
                    Yakin ingin menghapus kategori{' '}
                    <strong>{deleteTarget?.nama_kategori_umur}</strong>?
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default KategoriUmurPage
