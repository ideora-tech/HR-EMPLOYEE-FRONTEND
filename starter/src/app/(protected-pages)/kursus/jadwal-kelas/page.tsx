'use client'

import { useState, useEffect } from 'react'
import { Button, Card, Notification, toast } from '@/components/ui'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { HiPlusCircle } from 'react-icons/hi'
import JadwalKalender from '@/components/kursus/jadwal/JadwalKalender'
import JadwalForm from '@/components/kursus/jadwal/JadwalForm'
import JadwalDetailDrawer from '@/components/kursus/jadwal/JadwalDetailDrawer'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import ProgramPengajaranService from '@/services/kursus/program-pengajaran.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import type {
    IJadwalKelas,
    ICreateJadwalKelas,
    IUpdateJadwalKelas,
    IProgramPengajaran,
} from '@/@types/kursus.types'

const JadwalKelasPage = () => {
    const [programList, setProgramList] = useState<IProgramPengajaran[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [kalenderRefresh, setKalenderRefresh] = useState(0)

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<IJadwalKelas | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<IJadwalKelas | null>(null)

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerJadwal, setDrawerJadwal] = useState<IJadwalKelas | null>(null)

    useEffect(() => {
        ProgramPengajaranService.getAll({ aktif: 1, limit: 100 })
            .then((res) => { if (res.success) setProgramList(res.data) })
            .catch(() => { })
    }, [])

    const handleSubmit = async (payload: ICreateJadwalKelas | IUpdateJadwalKelas) => {
        setSubmitting(true)
        try {
            if (editTarget) {
                await JadwalKelasService.update(editTarget.id_jadwal, payload as IUpdateJadwalKelas)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.JADWAL_KELAS)} />)
            } else {
                await JadwalKelasService.create(payload as ICreateJadwalKelas)
                toast.push(<Notification type="success" title={MESSAGES.SUCCESS.CREATED(ENTITY.JADWAL_KELAS)} />)
            }
            setFormOpen(false)
            setEditTarget(null)
            setKalenderRefresh((n) => n + 1)
        } catch (err) {
            toast.push(
                <Notification
                    type="danger"
                    title={editTarget ? MESSAGES.ERROR.UPDATE(ENTITY.JADWAL_KELAS) : MESSAGES.ERROR.CREATE(ENTITY.JADWAL_KELAS)}
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
            await JadwalKelasService.remove(deleteTarget.id_jadwal)
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

    return (
        <div className="flex flex-col gap-4">
            <Card
                header={{
                    content: <h4>Jadwal Kelas</h4>,
                    extra: (
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlusCircle />}
                            onClick={() => { setEditTarget(null); setFormOpen(true) }}
                        >
                            Tambah Jadwal
                        </Button>
                    ),
                    bordered: false,
                }}
                bodyClass="p-0"
            >
                <div className="px-4 pb-4">
                    <JadwalKalender
                        refreshToken={kalenderRefresh}
                        onView={(item) => { setDrawerJadwal(item); setDrawerOpen(true) }}
                        onEdit={(item) => { setEditTarget(item); setFormOpen(true) }}
                        onDelete={setDeleteTarget}
                    />
                </div>
            </Card>

            <JadwalForm
                open={formOpen}
                editData={editTarget}
                programList={programList}
                submitting={submitting}
                onClose={() => { setFormOpen(false); setEditTarget(null) }}
                onSubmit={handleSubmit}
            />

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
                    <span className="font-semibold">&ldquo;{deleteTarget?.nama_jadwal}&rdquo;</span>{' '}
                    akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default JadwalKelasPage
