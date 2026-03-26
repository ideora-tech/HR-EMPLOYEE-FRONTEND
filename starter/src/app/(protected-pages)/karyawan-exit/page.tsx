'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Button,
    Card,
    Input,
    Select,
    Notification,
    toast,
} from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    HiPlusCircle,
    HiOutlineSearch,
    HiOutlineX,
} from 'react-icons/hi'
import KaryawanExitTable from '@/components/karyawan-exit/KaryawanExitTable'
import KaryawanExitService from '@/services/karyawan-exit.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IKaryawanExit,
    JenisExit,
} from '@/@types/karyawan-exit.types'

/* ─── filter options ─────────────────────────────────────── */

type JenisOption = { value: '' | JenisExit; label: string }
const JENIS_OPTIONS: JenisOption[] = [
    { value: '', label: 'Semua Jenis' },
    { value: 'RESIGN', label: 'Resign' },
    { value: 'TERMINASI', label: 'Terminasi (PHK)' },
    { value: 'PENSIUN', label: 'Pensiun' },
    { value: 'KONTRAK_BERAKHIR', label: 'Kontrak Berakhir' },
    { value: 'KESEPAKATAN_BERSAMA', label: 'Kesepakatan Bersama' },
    { value: 'MENINGGAL_DUNIA', label: 'Meninggal Dunia' },
]

/* ─── page ───────────────────────────────────────────────── */

const KaryawanExitPage = () => {
    const router = useRouter()

    /* list state */
    const [list, setList] = useState<IKaryawanExit[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    /* filter / pagination state */
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [jenisFilter, setJenisFilter] = useState<'' | JenisExit>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    /* delete state */
    const [deleteTarget, setDeleteTarget] = useState<IKaryawanExit | null>(
        null,
    )

    /* ── fetch table data ── */
    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await KaryawanExitService.getAll({
                search: search || undefined,
                jenis_exit: jenisFilter || undefined,
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
                    title={MESSAGES.ERROR.FETCH(ENTITY.KARYAWAN_EXIT)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [search, jenisFilter, currentPage, pageSize])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    /* ── search handlers ── */
    const handleSearchSubmit = useCallback(() => {
        setSearch(searchInput)
        setCurrentPage(1)
    }, [searchInput])

    const handleSearchClear = useCallback(() => {
        setSearchInput('')
        setSearch('')
        setCurrentPage(1)
    }, [])

    /* ── form navigation ── */
    const handleOpenAdd = useCallback(() => {
        router.push('/karyawan-exit/tambah')
    }, [router])

    const handleOpenEdit = useCallback((item: IKaryawanExit) => {
        router.push(`/karyawan-exit/${item.id_exit}/edit`)
    }, [router])

    /* ── delete ── */
    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await KaryawanExitService.remove(deleteTarget.id_exit)
            toast.push(
                <Notification
                    type="success"
                    title={MESSAGES.SUCCESS.DELETED(ENTITY.KARYAWAN_EXIT)}
                />,
            )
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={MESSAGES.ERROR.DELETE(ENTITY.KARYAWAN_EXIT)}
                >
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }, [deleteTarget, fetchData])

    /* ─── render ─────────────────────────────────────────── */

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: (
                        <div className="flex items-center gap-2">
                            <h4>Data Exit Karyawan</h4>
                        </div>
                    ),
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={handleOpenAdd}
                        >
                            Catat Exit
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                {/* ── filters ── */}
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Input
                        className="flex-1"
                        placeholder="Cari nama atau NIK karyawan... (tekan Enter)"
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
                        <Select<JenisOption>
                            options={JENIS_OPTIONS}
                            value={
                                JENIS_OPTIONS.find(
                                    (o) => o.value === jenisFilter,
                                ) ?? JENIS_OPTIONS[0]
                            }
                            onChange={(opt) => {
                                setJenisFilter((opt as JenisOption).value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                </div>

                {/* ── table ── */}
                <KaryawanExitTable
                    data={list}
                    loading={loading}
                    pagingData={{
                        total,
                        pageIndex: currentPage,
                        pageSize,
                    }}
                    onPaginationChange={setCurrentPage}
                    onSelectChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                    }}
                    onEdit={handleOpenEdit}
                    onDelete={setDeleteTarget}
                />
            </Card>

            {/* ── delete confirm ── */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Data Exit?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                confirmButtonProps={{ loading: submitting }}
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeleteTarget(null)}
                onCancel={() => setDeleteTarget(null)}
            >
                <p>
                    Data exit karyawan{' '}
                    <strong>
                        {deleteTarget?.karyawan?.nama ?? ''}
                    </strong>{' '}
                    akan dihapus secara permanen. Lanjutkan?
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default KaryawanExitPage
