'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiViewList, HiCalendar, HiDownload } from 'react-icons/hi'
import JadwalTable from '@/components/kursus/jadwal/JadwalTable'
import JadwalKalender from '@/components/kursus/jadwal/JadwalKalender'
import JadwalDetailDrawer from '@/components/kursus/jadwal/JadwalDetailDrawer'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { IJadwalKelas } from '@/@types/kursus.types'

type ViewMode = 'list' | 'kalender'

const JadwalKelasPage = () => {
    const router = useRouter()

    const [viewMode, setViewMode] = useState<ViewMode>('list')

    // list state
    const [data, setData] = useState<IJadwalKelas[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [deleteTarget, setDeleteTarget] = useState<IJadwalKelas | null>(null)
    const [exporting, setExporting] = useState(false)

    // kalender state
    const [kalenderRefresh, setKalenderRefresh] = useState(0)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerJadwal, setDrawerJadwal] = useState<IJadwalKelas | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await JadwalKelasService.getAll({
                page: currentPage,
                limit: pageSize,
                search,
            })
            setData(res.data)
            setTotal(res.meta.total)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal memuat data jadwal kelas">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }, [currentPage, pageSize, search])

    useEffect(() => {
        if (viewMode === 'list') fetchData()
    }, [fetchData, viewMode])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await JadwalKelasService.remove(deleteTarget.id_jadwal_kelas)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.JADWAL_KELAS)} />)
            setDeleteTarget(null)
            fetchData()
            setKalenderRefresh((n) => n + 1)
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.DELETE(ENTITY.JADWAL_KELAS)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), [])
    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }, [])

    const handleSwitchToKalender = () => setViewMode('kalender')
    const handleSwitchToList = () => setViewMode('list')

    const handleExportExcel = async () => {
        setExporting(true)
        try {
            const blob = await JadwalKelasService.exportExcel()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `jadwal-kelas-${new Date().toISOString().slice(0, 10)}.xlsx`
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            toast.push(
                <Notification type="danger" title="Gagal export Excel">
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Jadwal Kelas</h4>,
                    extra: (
                        <div className="flex items-center gap-2">

                            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={handleSwitchToList}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${viewMode === 'list'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <HiViewList className="text-base" />
                                    <span>List</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSwitchToKalender}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${viewMode === 'kalender'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <HiCalendar className="text-base" />
                                    <span>Kalender</span>
                                </button>
                            </div>
                            {/* Toggle list/kalender */}
                            <Button
                                variant="default"
                                size="sm"
                                icon={<HiDownload />}
                                loading={exporting}
                                onClick={handleExportExcel}
                            >
                                Export Excel
                            </Button>
                            <Button
                                variant="solid"
                                size="sm"
                                customColorClass={() => 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white border-emerald-500'}
                                icon={<HiPlusCircle />}
                                onClick={() => router.push(ROUTES.KURSUS_JADWAL_TAMBAH)}
                            >
                                Tambah Jadwal
                            </Button>
                        </div>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                {viewMode === 'list' ? (
                    <>
                        <div className="flex items-center gap-3 px-4 pb-3">
                            <Input
                                placeholder="Cari jadwal kelas..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                                className="max-w-xs"
                            />
                        </div>
                        <JadwalTable
                            data={data}
                            loading={loading}
                            pagingData={{ total, pageIndex: currentPage, pageSize }}
                            onPaginationChange={handlePageChange}
                            onSelectChange={handlePageSizeChange}
                            onEdit={(item) => router.push(ROUTES.KURSUS_JADWAL_EDIT(item.id_jadwal_kelas))}
                            onDelete={setDeleteTarget}
                        />
                    </>
                ) : (
                    <div className="px-4 pb-4">
                        <JadwalKalender
                            refreshToken={kalenderRefresh}
                            onView={(item) => { setDrawerJadwal(item); setDrawerOpen(true) }}
                            onEdit={(item) => router.push(ROUTES.KURSUS_JADWAL_EDIT(item.id_jadwal_kelas))}
                            onDelete={setDeleteTarget}
                        />
                    </div>
                )}
            </Card>

            {/* Detail Drawer (kalender) */}
            <JadwalDetailDrawer
                open={drawerOpen}
                jadwal={drawerJadwal}
                onClose={() => setDrawerOpen(false)}
                onRefresh={() => { setKalenderRefresh((n) => n + 1); fetchData() }}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                type="danger"
                title="Hapus Jadwal?"
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
                    Jadwal{' '}
                    <span className="font-semibold">&ldquo;{deleteTarget?.nama_kelas}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default JadwalKelasPage
