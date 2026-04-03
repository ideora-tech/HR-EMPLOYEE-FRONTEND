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
import { HiPlusCircle, HiOutlineSearch, HiOutlineX, HiOutlineUpload, HiOutlineDownload } from 'react-icons/hi'
import SiswaTable from '@/components/kursus/siswa/SiswaTable'
import SiswaImportModal from '@/components/kursus/siswa/SiswaImportModal'
import SiswaMonitoring from '@/components/kursus/siswa/SiswaMonitoring'
import PendaftaranSiswaTab from '@/components/kursus/siswa/PendaftaranSiswaTab'
import SiswaService from '@/services/kursus/siswa.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type { ISiswa } from '@/@types/kursus.types'
import { ROUTES } from '@/constants/route.constant'

type ActiveTab = 'pendaftaran' | 'siswa' | 'monitoring'

type AktifOption = { value: '' | '1' | '0'; label: string }

const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'pendaftaran', label: 'Pendaftaran Siswa' },
    { key: 'siswa', label: 'Siswa' },
    { key: 'monitoring', label: 'Monitoring' },
]

const AKTIF_OPTIONS: AktifOption[] = [
    { value: '', label: 'Semua Status' },
    { value: '1', label: 'Aktif' },
    { value: '0', label: 'Nonaktif' },
]

const SiswaPage = () => {
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<ActiveTab>('pendaftaran')
    const [pendingAdd, setPendingAdd] = useState(false)

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

    const handleSearchSubmit = () => {
        setSearch(searchInput)
        setCurrentPage(1)
    }

    const handleSearchClear = () => {
        setSearchInput('')
        setSearch('')
        setCurrentPage(1)
    }

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

    const handleTabChange = (tab: ActiveTab) => {
        setActiveTab(tab)
        setPendingAdd(false)
    }

    const handleAddClick = () => {
        if (activeTab === 'siswa') {
            router.push('/kursus/siswa/tambah')
        } else if (activeTab === 'pendaftaran') {
            router.push(ROUTES.KURSUS_SISWA_DAFTAR)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card bodyClass="p-0">
                <div className="flex items-center justify-between px-4 pt-4 pb-0">
                    <h4>Manajemen Siswa</h4>
                    {activeTab !== 'monitoring' && (
                        <Button
                            variant="solid"
                            size="sm"
                            customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                            icon={<HiPlusCircle />}
                            onClick={handleAddClick}
                        >
                            {activeTab === 'pendaftaran' ? 'Daftarkan Siswa' : 'Tambah Siswa'}
                        </Button>
                    )}
                </div>

                <div className="px-4 pt-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex gap-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={[
                                    'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                                    activeTab === tab.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                                ].join(' ')}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-3">
                    {activeTab === 'pendaftaran' && (
                        <PendaftaranSiswaTab
                            pendingAdd={pendingAdd}
                            onPendingAddHandled={() => setPendingAdd(false)}
                        />
                    )}

                    {activeTab === 'siswa' && (
                        <>
                            <div className="flex items-center gap-3 px-4 pb-3">
                                <Input
                                    className="flex-1"
                                    placeholder="Cari nama, email, telepon... (tekan Enter)"
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
                                <div className="w-44 shrink-0">
                                    <Select<AktifOption>
                                        options={AKTIF_OPTIONS}
                                        value={AKTIF_OPTIONS.find((o) => o.value === aktifFilter) ?? AKTIF_OPTIONS[0]}
                                        onChange={(opt) => {
                                            setAktifFilter((opt as AktifOption).value)
                                            setCurrentPage(1)
                                        }}
                                    />
                                </div>
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
                            </div>

                            <SiswaTable
                                data={list}
                                loading={loading}
                                pagingData={{ total, pageIndex: currentPage, pageSize }}
                                onPaginationChange={setCurrentPage}
                                onSelectChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                                onEdit={(item) => router.push(`/kursus/siswa/${item.id_siswa}/edit`)}
                                onDelete={setDeleteTarget}
                            />
                        </>
                    )}

                    {activeTab === 'monitoring' && <SiswaMonitoring />}
                </div>
            </Card>

            <SiswaImportModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onSuccess={() => { setImportOpen(false); fetchData() }}
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
