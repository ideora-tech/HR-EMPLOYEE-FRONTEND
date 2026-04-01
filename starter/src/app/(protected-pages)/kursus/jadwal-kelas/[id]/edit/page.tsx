'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Notification, Spinner, toast } from '@/components/ui'
import JadwalFormPage from '@/components/kursus/jadwal/JadwalFormPage'
import JadwalKelasService from '@/services/kursus/jadwal-kelas.service'
import { parseApiError } from '@/utils/parseApiError'
import { MESSAGES, ENTITY } from '@/constants/message.constant'
import { ROUTES } from '@/constants/route.constant'
import type { IJadwalKelas, IUpdateJadwalKelas } from '@/@types/kursus.types'

const EditJadwalKelasPage = () => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [editData, setEditData] = useState<IJadwalKelas | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        JadwalKelasService.getById(id)
            .then((res) => {
                if (res.success) setEditData(res.data)
            })
            .catch((err) => {
                toast.push(
                    <Notification type="danger" title="Gagal memuat data jadwal kelas">
                        {parseApiError(err)}
                    </Notification>,
                )
                router.push(ROUTES.KURSUS_JADWAL)
            })
            .finally(() => setLoading(false))
    }, [id, router])

    const handleSubmit = async (payload: IUpdateJadwalKelas) => {
        if (!editData) return
        setSubmitting(true)
        try {
            await JadwalKelasService.update(editData.id_jadwal_kelas, payload)
            toast.push(
                <Notification type="success" title={MESSAGES.SUCCESS.UPDATED(ENTITY.JADWAL_KELAS)} />,
            )
            router.push(ROUTES.KURSUS_JADWAL)
        } catch (err) {
            toast.push(
                <Notification type="danger" title={MESSAGES.ERROR.UPDATE(ENTITY.JADWAL_KELAS)}>
                    {parseApiError(err)}
                </Notification>,
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-60">
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <JadwalFormPage
            editData={editData}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => router.push(ROUTES.KURSUS_JADWAL)}
        />
    )
}

export default EditJadwalKelasPage
