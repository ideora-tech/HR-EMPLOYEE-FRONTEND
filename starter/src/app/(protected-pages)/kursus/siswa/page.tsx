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
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineUpload,
    HiOutlineDownload,
    HiOutlineClipboardCheck,
} from 'react-icons/hi'
import SiswaTable from '@/components/kursus/siswa/SiswaTable'
import SiswaImportModal from '@/components/kursus/siswa/SiswaImportModal'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ISiswa } from '@/@types/kursus.types'
import { ROUTES } from '@/constants/route.constant'

type AktifOption = { value: '' | '1' | '0'; label: string }

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const SiswaPage = () => {
    const router = useRouter()

    const [list, setList] = useState<ISiswa[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [aktifFilter, setAktifFilter] = useState<'' | '1' | '0'>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [deleteTarget, setDeleteTarget] = useState<ISiswa | null>(null)
    const [importOpen, setImportOpen] = useState(false)
    const [downloading, setDownloading] = useState(false)

    const handleDownloadTemplate = async () => {
        setDownloading(true)
        try {
            await SiswaService.downloadTemplate()
        } catch {
            toast.push(<Notification type="danger" title="Gagal mengunduh template" />)
        } finally {
            setDownloading(false)
        }
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await SiswaService.getAll({
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
                <Notification type="danger" title={MESSAGES.ERROR.FETCH(ENTITY.SISWA)}>
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

    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await SiswaService.remove(deleteTarget.id_siswa)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.SISWA)} />)
            setDeleteTarget(null)
            fetchData()
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.SISWA)}>
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
                <div className="flex items-center justify-between px-4 pt-4 pb-0 gap-3">
                    <h4>Manajemen Siswa</h4>
                    <div className="flex flex-wrap items-center justify-end gap-2 max-w-full">
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiOutlineDownload />}
                            loading={downloading}
                            onClick={handleDownloadTemplate}
                        >
                            Template
                        </Button>
                        <Button
                            size="sm"
                            variant="default"
                            icon={<HiOutlineUpload />}
                            onClick={() => setImportOpen(true)}
                        >
                            Import
                        </Button>
                        <Button
                            size="sm"
                            variant="solid"
                            customColorClass={() =>
                                'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'
                            }
                            icon={<HiOutlineClipboardCheck />}
                            onClick={() => router.push(ROUTES.KURSUS_SISWA_DAFTAR)}
                        >
                            Daftarkan Siswa
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 pt-4 pb-3">
                    <Input
                        className="flex-1 w-full"
                        placeholder="Cari nama, email, telepon... (tekan Enter)"
                        suffix={
                            searchInput ? (
                                <HiOutlineX
                                    className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                    onClick={() => {
                                        setSearchInput('')
                                        setSearch('')
                                        setCurrentPage(1)
                                    }}
                                />
                            ) : (
                                <HiOutlineSearch
                                    className="text-gray-400 text-lg cursor-pointer hover:text-gray-600"
                                    onClick={() => {
                                        setSearch(searchInput)
                                        setCurrentPage(1)
                                    }}
                                />
                            )
                        }
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setSearch(searchInput)
                                setCurrentPage(1)
                            }
                        }}
                    />
                    <div className="w-full sm:w-44 shrink-0">
                        <Select<AktifOption>
                            options={AKTIF_OPTIONS}
                            value={AKTIF_OPTIONS.find((o) => o.value === aktifFilter) ?? AKTIF_OPTIONS[0]}
                            onChange={(opt) => {
                                setAktifFilter((opt as AktifOption).value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>
                </div>

                <SiswaTable
                    data={list}
                    loading={loading}
                    pagingData={{ total, pageIndex: currentPage, pageSize }}
                    onPaginationChange={setCurrentPage}
                    onSelectChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                    }}
                    onDetail={(item) => router.push(ROUTES.KURSUS_SISWA_DETAIL(item.id_siswa))}
                    onEdit={(item) => router.push(ROUTES.KURSUS_SISWA_EDIT(item.id_siswa))}
                    onDelete={setDeleteTarget}
                />
            </Card>

            <SiswaImportModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onSuccess={() => {
                    setImportOpen(false)
                    fetchData()
                }}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Siswa?"
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
                    Data siswa{' '}
                    <span className="font-semibold">&ldquo;{deleteTarget?.nama_siswa}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default SiswaPage
