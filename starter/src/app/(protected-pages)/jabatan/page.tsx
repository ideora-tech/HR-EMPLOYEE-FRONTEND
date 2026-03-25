'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Card, Input, Select, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiOutlineSearch, HiOutlineX } from 'react-icons/hi'
import JabatanTable from '@/components/jabatan/JabatanTable'
import JabatanForm from '@/components/jabatan/JabatanForm'
import JabatanService from '@/services/jabatan.service'
import DepartemenService from '@/services/departemen.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { IDepartemen, IJabatan, ICreateJabatan, IUpdateJabatan } from '@/@types/organisasi.types'

type AktifOption = { value: '' | '1' | '0'; label: string }
type DepartemenOption = { value: string; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const JabatanPage = () => {
    const [list, setList] = useState<IJabatan[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [departemenFilter, setDepartemenFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [departemenList, setDepartemenList] = useState<IDepartemen[]>([])
    const [departemenOptions, setDepartemenOptions] = useState<DepartemenOption[]>([
        { value: '', label: 'Semua Departemen' },
    ])

    const [formOpen, setFormOpen] = useState(false)
    const [editData, setEditData] = useState<IJabatan | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IJabatan | null>(null)

    // Load departemen list for filter dropdown and form
    useEffect(() => {
        DepartemenService.getAll({ aktif: 1, limit: 100 })
            .then((res) => {
                if (res.success) {
                    setDepartemenList(res.data)
                    setDepartemenOptions([
                        { value: '', label: 'Semua Departemen' },
                        ...res.data.map((d) => ({ value: d.id_departemen, label: d.nama_departemen })),
                    ])
                }
            })
            .catch(() => {/* silently ignore filter load failure */ })
    }, [])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await JabatanService.getAll({
                search: search || undefined,
                aktif: aktifFilter !== '' ? Number(aktifFilter) : undefined,
                id_departemen: departemenFilter || undefined,
                page: currentPage,
                limit: pageSize,
            })
            if (res.success) {
                setList(res.data)
                setTotal(res.meta?.total ?? 0)
            }
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.JABATAN)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, aktifFilter, departemenFilter, currentPage, pageSize])

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

    const handleOpenEdit = (item: IJabatan) => {
        setEditData(item)
        setFormOpen(true)
    }

    const handleFormClose = () => {
        setFormOpen(false)
        setEditData(null)
    }

    const handleSubmit = async (payload: ICreateJabatan | IUpdateJabatan) => {
        setSubmitting(true)
        try {
            if (editData) {
                await JabatanService.update(editData.id_jabatan, payload as IUpdateJabatan)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.UPDATED(ENTITY.JABATAN)}
                    />,
                )
            } else {
                await JabatanService.create(payload as ICreateJabatan)
                toast.push(
                    <Notification
                        type="success"
                        title={MESSAGES.SUCCESS.CREATED(ENTITY.JABATAN)}
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
                            ? MESSAGES.ERROR.UPDATE(ENTITY.JABATAN)
                            : MESSAGES.ERROR.CREATE(ENTITY.JABATAN)
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
            await JabatanService.remove(deleteTarget.id_jabatan)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.DELETED(ENTITY.JABATAN)}
                />,
            )
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.JABATAN)}>
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
                    content: <h4>Manajemen Jabatan</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={handleOpenAdd}
                        >
                            Tambah Jabatan
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="flex items-center gap-3 px-4 pb-3 flex-wrap">
                    <Input
                        className="flex-1 min-w-48"
                        placeholder="Cari kode atau nama jabatan... (tekan Enter)"
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
                    <div className="w-52 shrink-0">
                        <Select<DepartemenOption>
                            options={departemenOptions}
                            value={
                                departemenOptions.find((o) => o.value === departemenFilter) ??
                                departemenOptions[0]
                            }
                            onChange={(opt) => {
                                setDepartemenFilter((opt as DepartemenOption).value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
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

                <JabatanTable
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

            <JabatanForm
                open={formOpen}
                editData={editData}
                submitting={submitting}
                departemenList={departemenList}
                onClose={handleFormClose}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Jabatan?"
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
                    Yakin ingin menghapus jabatan{' '}
                    <strong>{deleteTarget?.nama_jabatan}</strong>? Tindakan ini tidak dapat
                    dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default JabatanPage
