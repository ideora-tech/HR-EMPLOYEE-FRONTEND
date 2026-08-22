'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle, HiDownload, HiOutlineTable, HiOutlineCalendar } from 'react-icons/hi'
import JadwalKalender from '@/components/kursus/jadwal/JadwalKalender'
import JadwalDetailDrawer from '@/components/kursus/jadwal/JadwalDetailDrawer'
import JadwalKalenderMingguan from '@/components/kursus/jadwal/JadwalKalenderMingguan'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { IJadwalKelas } from '@/@types/kursus.types'

const JadwalKelasPage = () => {
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<'tabel' | 'kalender'>('tabel')
    const [submitting, setSubmitting] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<IJadwalKelas | null>(null)
    const [exporting, setExporting] = useState(false)
    const [kalenderRefresh, setKalenderRefresh] = useState(0)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerJadwal, setDrawerJadwal] = useState<IJadwalKelas | null>(null)

    const handleDelete = async () => {
        if (!deleteTarget) return
        setSubmitting(true)
        try {
            await JadwalKelasService.remove(deleteTarget.id_jadwal_kelas)
            toast.push(<Notification type="success" title={MESSAGES.SUCCESS.DELETED(ENTITY.JADWAL_KELAS)} />)
            setDeleteTarget(null)
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
                    content: (
                        <div className="flex items-center gap-4">
                            <h4>Jadwal Kelas</h4>
                            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('tabel')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                                        ${activeTab === 'tabel'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <HiOutlineTable className="text-sm" />
                                    Tabel
                                </button>
                                <button
                                    onClick={() => setActiveTab('kalender')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                                        ${activeTab === 'kalender'
                                            ? 'bg-white text-gray-800 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <HiOutlineCalendar className="text-sm" />
                                    Kalender
                                </button>
                            </div>
                        </div>
                    ),
                    extra: (
                        <div className="flex flex-wrap items-center justify-end gap-2 max-w-full">
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
                {activeTab === 'tabel' ? (
                    <div className="px-4 pb-4">
                        <JadwalKalender
                            refreshToken={kalenderRefresh}
                            onView={(item) => { setDrawerJadwal(item); setDrawerOpen(true) }}
                            onEdit={(item) => router.push(ROUTES.KURSUS_JADWAL_EDIT(item.id_jadwal_kelas))}
                            onDelete={setDeleteTarget}
                        />
                    </div>
                ) : (
                    <JadwalKalenderMingguan />
                )}
            </Card>

            {/* Detail Drawer (kalender) */}
            <JadwalDetailDrawer
                open={drawerOpen}
                jadwal={drawerJadwal}
                onClose={() => setDrawerOpen(false)}
                onRefresh={() => setKalenderRefresh((n) => n + 1)}
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
